import { progressTrackingService } from './progress-tracking.service';
import { sessionManagerService } from './session-manager.service';
import logger from '../lib/logger';

export interface RecoveryStrategy {
  max_retries: number;
  retry_delay_ms: number;
  exponential_backoff: boolean;
  backoff_multiplier: number;
  max_backoff_delay: number;
}

export interface RecoveryCheckpoint {
  session_id: string;
  timestamp: string;
  state: any;
  features_in_progress: string[];
  files_modified: string[];
}

export interface RecoveryResult {
  success: boolean;
  recovered: boolean;
  retries: number;
  recovered_state?: any;
  error?: string;
}

export class SessionRecoveryService {
  private checkpoints: Map<string, RecoveryCheckpoint> = new Map();
  private recoveryHistory: Map<string, RecoveryResult[]> = new Map();

  async createCheckpoint(
    projectId: string,
    sessionId: string,
    state: any
  ): Promise<void> {
    try {
      const progress = await progressTrackingService.getProgress(projectId);
      const inProgressFeatures = progress.features.filter(
        f => f.status === 'in_progress'
      );

      const checkpoint: RecoveryCheckpoint = {
        session_id: sessionId,
        timestamp: new Date().toISOString(),
        state,
        features_in_progress: inProgressFeatures.map(f => f.id),
        files_modified: [],
      };

      this.checkpoints.set(this.getCheckpointKey(projectId, sessionId), checkpoint);

      logger.info('Checkpoint created', {
        project_id: projectId,
        session_id: sessionId,
        features_in_progress: checkpoint.features_in_progress.length,
      });
    } catch (error) {
      logger.error('Failed to create checkpoint', {
        project_id: projectId,
        session_id: sessionId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async recoverSession(
    projectId: string,
    sessionId: string,
    strategy: RecoveryStrategy = this.getDefaultStrategy()
  ): Promise<RecoveryResult> {
    try {
      const checkpointKey = this.getCheckpointKey(projectId, sessionId);
      const checkpoint = this.checkpoints.get(checkpointKey);

      if (!checkpoint) {
        logger.warn('No checkpoint found for recovery', {
          project_id: projectId,
          session_id: sessionId,
        });

        return {
          success: false,
          recovered: false,
          retries: 0,
          error: 'No checkpoint available',
        };
      }

      logger.info('Starting session recovery', {
        project_id: projectId,
        session_id: sessionId,
        max_retries: strategy.max_retries,
      });

      let retries = 0;
      let lastError: Error | null = null;

      while (retries < strategy.max_retries) {
        retries++;

        try {
          const recovered = await this.attemptRecovery(projectId, checkpoint);

          logger.info('Session recovered successfully', {
            project_id: projectId,
            session_id: sessionId,
            retries,
          });

          this.recordRecoveryResult(projectId, sessionId, {
            success: true,
            recovered: true,
            retries,
            recovered_state: recovered,
          });

          return {
            success: true,
            recovered: true,
            retries,
            recovered_state: recovered,
          };
        } catch (error) {
          lastError = error instanceof Error ? error : new Error('Unknown error');

          logger.warn('Recovery attempt failed', {
            project_id: projectId,
            session_id: sessionId,
            attempt: retries,
            error: lastError.message,
          });

          if (retries < strategy.max_retries) {
            const delay = this.calculateRetryDelay(retries, strategy);
            logger.info('Waiting before retry', {
                delay_ms: delay,
              });

            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }

      this.recordRecoveryResult(projectId, sessionId, {
        success: false,
        recovered: false,
        retries,
        error: lastError?.message || 'Recovery failed after all retries',
      });

      return {
        success: false,
        recovered: false,
        retries,
        error: lastError?.message || 'Recovery failed',
      };
    } catch (error) {
      logger.error('Recovery process failed', {
        project_id: projectId,
        session_id: sessionId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return {
        success: false,
        recovered: false,
        retries: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async attemptRecovery(
    projectId: string,
    checkpoint: RecoveryCheckpoint
  ): Promise<any> {
    const progress = await progressTrackingService.getProgress(projectId);

    for (const featureId of checkpoint.features_in_progress) {
      await progressTrackingService.updateFeatureStatus(
        projectId,
        featureId,
        'failing',
        'Reset due to session failure'
      );
    }

    return {
      checkpoint,
      progress,
      timestamp: new Date().toISOString(),
    };
  }

  async rollbackToCheckpoint(
    projectId: string,
    sessionId: string,
    checkpointId?: string
  ): Promise<boolean> {
    try {
      const checkpointKey = checkpointId || this.getCheckpointKey(projectId, sessionId);
      const checkpoint = this.checkpoints.get(checkpointKey);

      if (!checkpoint) {
        logger.warn('Checkpoint not found for rollback', {
          project_id: projectId,
          session_id: sessionId,
          checkpoint_id: checkpointId,
        });
        return false;
      }

      const progress = await progressTrackingService.getProgress(projectId);

      for (const featureId of checkpoint.features_in_progress) {
        const feature = progress.features.find(f => f.id === featureId);
        if (feature) {
          await progressTrackingService.updateFeatureStatus(
            projectId,
            featureId,
            'failing',
            'Rolled back to checkpoint'
          );
        }
      }

      logger.info('Rollback completed', {
        project_id: projectId,
        session_id: sessionId,
        checkpoint_id: checkpointId,
        features_reset: checkpoint.features_in_progress.length,
      });

      return true;
    } catch (error) {
      logger.error('Rollback failed', {
        project_id: projectId,
        session_id: sessionId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  async cleanupOldCheckpoints(maxAgeHours: number = 24): Promise<void> {
    const now = Date.now();
    const maxAge = maxAgeHours * 60 * 60 * 1000;

    let cleanedCount = 0;

    for (const [key, checkpoint] of this.checkpoints.entries()) {
      const checkpointAge = now - new Date(checkpoint.timestamp).getTime();

      if (checkpointAge > maxAge) {
        this.checkpoints.delete(key);
        cleanedCount++;
      }
    }

    logger.info('Old checkpoints cleaned up', {
      total_checkpoints: this.checkpoints.size,
      cleaned_count: cleanedCount,
      max_age_hours: maxAgeHours,
    });
  }

  getRecoveryStatistics(projectId: string): {
    total_recovery_attempts: number;
    successful_recoveries: number;
    failed_recoveries: number;
    average_retries: number;
    recovery_rate: number;
  } {
    const history = this.recoveryHistory.get(projectId) || [];

    if (history.length === 0) {
      return {
        total_recovery_attempts: 0,
        successful_recoveries: 0,
        failed_recoveries: 0,
        average_retries: 0,
        recovery_rate: 0,
      };
    }

    const successful = history.filter(r => r.success);
    const failed = history.filter(r => !r.success);
    const averageRetries =
      history.reduce((sum, r) => sum + r.retries, 0) / history.length;

    return {
      total_recovery_attempts: history.length,
      successful_recoveries: successful.length,
      failed_recoveries: failed.length,
      average_retries: Math.round(averageRetries * 100) / 100,
      recovery_rate: (successful.length / history.length) * 100,
    };
  }

  private calculateRetryDelay(retryCount: number, strategy: RecoveryStrategy): number {
    if (!strategy.exponential_backoff) {
      return strategy.retry_delay_ms;
    }

    const delay = strategy.retry_delay_ms * Math.pow(strategy.backoff_multiplier, retryCount - 1);
    return Math.min(delay, strategy.max_backoff_delay);
  }

  private recordRecoveryResult(
    projectId: string,
    sessionId: string,
    result: RecoveryResult
  ): void {
    const key = this.getCheckpointKey(projectId, sessionId);

    if (!this.recoveryHistory.has(key)) {
      this.recoveryHistory.set(key, []);
    }

    const history = this.recoveryHistory.get(key)!;
    history.push(result);

    if (history.length > 100) {
      this.recoveryHistory.set(key, history.slice(-100));
    }
  }

  private getCheckpointKey(projectId: string, sessionId: string): string {
    return `${projectId}:${sessionId}`;
  }

  getDefaultStrategy(): RecoveryStrategy {
    return {
      max_retries: 3,
      retry_delay_ms: 5000,
      exponential_backoff: true,
      backoff_multiplier: 2,
      max_backoff_delay: 60000,
    };
  }

  getConservativeStrategy(): RecoveryStrategy {
    return {
      max_retries: 5,
      retry_delay_ms: 10000,
      exponential_backoff: true,
      backoff_multiplier: 1.5,
      max_backoff_delay: 300000,
    };
  }

  getAggressiveStrategy(): RecoveryStrategy {
    return {
      max_retries: 2,
      retry_delay_ms: 2000,
      exponential_backoff: false,
      backoff_multiplier: 1,
      max_backoff_delay: 10000,
    };
  }

  async reset(): Promise<void> {
    this.checkpoints.clear();
    this.recoveryHistory.clear();

    logger.info('Session recovery service reset');
  }
}

export const sessionRecoveryService = new SessionRecoveryService();
