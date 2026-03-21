import { Feature } from './progress-tracking.service';
import logger from '../lib/logger';

export interface ConcurrentSessionConfig {
  max_parallel_sessions: number;
  session_timeout_ms: number;
  allow_feature_conflicts: boolean;
  prioritization: 'first_available' | 'critical_path' | 'priority_based';
  resource_limits: {
    max_memory_mb?: number;
    max_cpu_percent?: number;
    max_api_calls_per_minute?: number;
  };
}

export interface ConcurrentSession {
  session_id: string;
  project_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  start_time?: string;
  end_time?: string;
  features: Feature[];
  dependencies: string[];
  priority: 'high' | 'medium' | 'low';
  assigned_resources: {
    memory_mb?: number;
    api_calls_per_minute?: number;
  };
  progress: {
    features_completed: number;
    features_failed: number;
    current_feature?: string;
    percentage: number;
  };
}

export interface ResourcePool {
  total_memory_mb: number;
  used_memory_mb: number;
  total_cpu_percent: number;
  used_cpu_percent: number;
  api_calls_per_minute: number;
  available_slots: number;
}

export class ConcurrentSessionService {
  private config: ConcurrentSessionConfig;
  private activeSessions: Map<string, ConcurrentSession> = new Map();
  private sessionQueue: ConcurrentSession[] = [];
  private resourcePool: ResourcePool;

  constructor(config: Partial<ConcurrentSessionConfig> = {}) {
    this.config = {
      max_parallel_sessions: config.max_parallel_sessions || 3,
      session_timeout_ms: config.session_timeout_ms || 30 * 60 * 1000,
      allow_feature_conflicts: config.allow_feature_conflicts || false,
      prioritization: config.prioritization || 'critical_path',
      resource_limits: config.resource_limits || {},
    };

    this.resourcePool = {
      total_memory_mb: config.resource_limits?.max_memory_mb || 8192,
      used_memory_mb: 0,
      total_cpu_percent: 100,
      used_cpu_percent: 0,
      api_calls_per_minute: 0,
      available_slots: this.config.max_parallel_sessions,
    };

    logger.info('Concurrent session service initialized', this.config);
  }

  async queueSession(
    projectId: string,
    features: Feature[],
    priority: 'high' | 'medium' | 'low' = 'medium',
    dependencies: string[] = []
  ): Promise<string> {
    try {
      const sessionId = this.generateSessionId();

      const session: ConcurrentSession = {
        session_id: sessionId,
        project_id: projectId,
        status: 'pending',
        features,
        dependencies,
        priority,
        assigned_resources: {
          memory_mb: this.estimateResourceUsage(features, 'memory'),
          api_calls_per_minute: this.estimateResourceUsage(features, 'api_calls'),
        },
        progress: {
          features_completed: 0,
          features_failed: 0,
          percentage: 0,
        },
      };

      this.sessionQueue.push(session);

      this.sortSessionQueue();

      logger.info('Session queued', {
        session_id: sessionId,
        project_id: projectId,
        features_count: features.length,
        priority,
        queue_position: this.sessionQueue.indexOf(session),
      });

      await this.processQueue();

      return sessionId;
    } catch (error) {
      logger.error('Failed to queue session', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async startSession(sessionId: string): Promise<boolean> {
    try {
      const session = this.sessionQueue.find(s => s.session_id === sessionId);

      if (!session) {
        logger.warn('Session not found in queue', { session_id: sessionId });
        return false;
      }

      if (!this.canStartSession(session)) {
        logger.info('Session cannot start due to resource constraints', {
          session_id: sessionId,
          required_resources: session.assigned_resources,
          available_resources: this.resourcePool,
        });
        return false;
      }

      session.status = 'running';
      session.start_time = new Date().toISOString();

      this.activeSessions.set(sessionId, session);
      this.sessionQueue = this.sessionQueue.filter(s => s.session_id !== sessionId);

      this.allocateResources(session);

      logger.info('Session started', {
        session_id: sessionId,
        project_id: session.project_id,
        features_count: session.features.length,
      });

      this.startSessionTimeout(session);

      return true;
    } catch (error) {
      logger.error('Failed to start session', {
        session_id: sessionId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  async completeSession(
    sessionId: string,
    success: boolean,
    completedFeatures: string[] = [],
    failedFeatures: string[] = []
  ): Promise<void> {
    try {
      const session = this.activeSessions.get(sessionId);

      if (!session) {
        logger.warn('Session not found for completion', {
          session_id: sessionId,
        });
        return;
      }

      session.status = success ? 'completed' : 'failed';
      session.end_time = new Date().toISOString();
      session.progress.features_completed = completedFeatures.length;
      session.progress.features_failed = failedFeatures.length;
      session.progress.percentage = 100;

      this.releaseResources(session);
      this.activeSessions.delete(sessionId);

      logger.info('Session completed', {
        session_id: sessionId,
        project_id: session.project_id,
        status: session.status,
        duration_ms: this.calculateSessionDuration(session),
        features_completed: completedFeatures.length,
        features_failed: failedFeatures.length,
      });

      await this.processQueue();
    } catch (error) {
      logger.error('Failed to complete session', {
        session_id: sessionId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async cancelSession(sessionId: string): Promise<boolean> {
    try {
      const activeSession = this.activeSessions.get(sessionId);
      const queuedSession = this.sessionQueue.find(s => s.session_id === sessionId);

      if (activeSession) {
        activeSession.status = 'cancelled';
        activeSession.end_time = new Date().toISOString();

        this.releaseResources(activeSession);
        this.activeSessions.delete(sessionId);

        logger.info('Active session cancelled', {
          session_id: sessionId,
          project_id: activeSession.project_id,
        });

        return true;
      }

      if (queuedSession) {
        queuedSession.status = 'cancelled';
        this.sessionQueue = this.sessionQueue.filter(
          s => s.session_id !== sessionId
        );

        logger.info('Queued session cancelled', {
          session_id: sessionId,
          project_id: queuedSession.project_id,
        });

        return true;
      }

      logger.warn('Session not found for cancellation', { session_id: sessionId });
      return false;
    } catch (error) {
      logger.error('Failed to cancel session', {
        session_id: sessionId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  getSessionStatus(sessionId: string): ConcurrentSession | null {
    return (
      this.activeSessions.get(sessionId) ||
      this.sessionQueue.find(s => s.session_id === sessionId) ||
      null
    );
  }

  getActiveSessions(): ConcurrentSession[] {
    return Array.from(this.activeSessions.values());
  }

  getQueuedSessions(): ConcurrentSession[] {
    return [...this.sessionQueue];
  }

  getResourcePool(): ResourcePool {
    return { ...this.resourcePool };
  }

  getExecutionPlan(): {
    concurrent_sessions: number;
    queue_size: number;
    estimated_completion_time: string;
    resource_utilization: {
      memory_percent: number;
      cpu_percent: number;
      api_capacity: number;
    };
  } {
    const activeSessions = this.getActiveSessions();

    const avgDurationPerSession = 20 * 60 * 1000;
    const queueWaitTime = this.sessionQueue.length * avgDurationPerSession;
    const estimatedCompletionTime = new Date(
      Date.now() + queueWaitTime
    ).toISOString();

    return {
      concurrent_sessions: activeSessions.length,
      queue_size: this.sessionQueue.length,
      estimated_completion_time: estimatedCompletionTime,
      resource_utilization: {
        memory_percent: 
          (this.resourcePool.used_memory_mb / this.resourcePool.total_memory_mb) * 100,
        cpu_percent: 
          (this.resourcePool.used_cpu_percent / this.resourcePool.total_cpu_percent) * 100,
        api_capacity: 
          (1 - this.resourcePool.api_calls_per_minute / 60) * 100,
      },
    };
  }

  async waitForCompletion(
    sessionIds: string[],
    timeout_ms?: number
  ): Promise<{
    completed: string[];
    failed: string[];
    cancelled: string[];
    timed_out: string[];
  }> {
    const startTime = Date.now();
    const completed: string[] = [];
    const failed: string[] = [];
    const cancelled: string[] = [];
    const timed_out: string[] = [];

    const checkCompletion = async (): Promise<boolean> => {
      const allCompleted = sessionIds.every(id => {
        const session = this.getSessionStatus(id);
        return session && ['completed', 'failed', 'cancelled'].includes(session.status);
      });

      if (allCompleted) {
        sessionIds.forEach(id => {
          const session = this.getSessionStatus(id);
          if (session?.status === 'completed') {
            completed.push(id);
          } else if (session?.status === 'failed') {
            failed.push(id);
          } else if (session?.status === 'cancelled') {
            cancelled.push(id);
          }
        });

        return true;
      }

      if (timeout_ms && Date.now() - startTime > timeout_ms) {
        sessionIds.forEach(id => {
          const session = this.getSessionStatus(id);
          if (session && session.status === 'running') {
            timed_out.push(id);
            this.cancelSession(id);
          }
        });

        return true;
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
      return false;
    };

    while (!(await checkCompletion())) {
    }

    return { completed, failed, cancelled, timed_out };
  }

  private async processQueue(): Promise<void> {
    if (this.sessionQueue.length === 0) {
      return;
    }

    const availableSlots = this.resourcePool.available_slots;
    
    if (availableSlots <= 0) {
      return;
    }

    const sessionsToStart = Math.min(availableSlots, this.sessionQueue.length);
    const sessions = this.sessionQueue.slice(0, sessionsToStart);

    for (const session of sessions) {
      await this.startSession(session.session_id);
    }
  }

  private sortSessionQueue(): void {
    switch (this.config.prioritization) {
      case 'critical_path':
        this.sessionQueue.sort((a, b) => {
          const aDepth = this.calculateDependencyDepth(a);
          const bDepth = this.calculateDependencyDepth(b);
          return aDepth - bDepth;
        });
        break;

      case 'priority_based':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        this.sessionQueue.sort((a, b) => 
          priorityOrder[b.priority] - priorityOrder[a.priority]
        );
        break;

      case 'first_available':
      default:
        this.sessionQueue.sort((a, b) => 
          new Date(a.start_time || Date.now()).getTime() - 
          new Date(b.start_time || Date.now()).getTime()
        );
        break;
    }
  }

  private canStartSession(session: ConcurrentSession): boolean {
    if (this.activeSessions.size >= this.config.max_parallel_sessions) {
      return false;
    }

    if (this.resourcePool.available_slots <= 0) {
      return false;
    }

    if (!this.config.allow_feature_conflicts) {
      const activeFeatures = new Set(
        this.getActiveSessions().flatMap(s => s.features.map(f => f.id))
      );

      const hasConflict = session.features.some(f => 
        activeFeatures.has(f.id)
      );

      if (hasConflict) {
        logger.debug('Feature conflict detected', {
          session_id: session.session_id,
          conflicting_features: session.features.filter(f => activeFeatures.has(f.id)).map(f => f.id),
        });
        return false;
      }
    }

    const requiredMemory = session.assigned_resources.memory_mb || 0;
    if (
      requiredMemory > 0 &&
      this.resourcePool.used_memory_mb + requiredMemory > this.resourcePool.total_memory_mb
    ) {
      logger.debug('Insufficient memory', {
        session_id: session.session_id,
        required_memory_mb: requiredMemory,
        available_memory_mb: this.resourcePool.total_memory_mb - this.resourcePool.used_memory_mb,
      });
      return false;
    }

    const requiredApiCalls = session.assigned_resources.api_calls_per_minute || 0;
    if (
      this.resourcePool.api_calls_per_minute + requiredApiCalls > 60
    ) {
      logger.debug('API call limit exceeded', {
        session_id: session.session_id,
        required_api_calls: requiredApiCalls,
        available_api_calls: 60 - this.resourcePool.api_calls_per_minute,
      });
      return false;
    }

    return true;
  }

  private allocateResources(session: ConcurrentSession): void {
    this.resourcePool.used_memory_mb += session.assigned_resources.memory_mb || 0;
    this.resourcePool.used_cpu_percent += 10;
    this.resourcePool.api_calls_per_minute += session.assigned_resources.api_calls_per_minute || 0;
    this.resourcePool.available_slots = 
      this.config.max_parallel_sessions - this.activeSessions.size;

    logger.debug('Resources allocated', {
      session_id: session.session_id,
      memory_mb: session.assigned_resources.memory_mb,
      api_calls: session.assigned_resources.api_calls_per_minute,
      available_slots: this.resourcePool.available_slots,
    });
  }

  private releaseResources(session: ConcurrentSession): void {
    this.resourcePool.used_memory_mb -= session.assigned_resources.memory_mb || 0;
    this.resourcePool.used_cpu_percent -= 10;
    this.resourcePool.api_calls_per_minute -= session.assigned_resources.api_calls_per_minute || 0;
    this.resourcePool.available_slots = 
      this.config.max_parallel_sessions - this.activeSessions.size;

    logger.debug('Resources released', {
      session_id: session.session_id,
      memory_mb: session.assigned_resources.memory_mb,
      available_slots: this.resourcePool.available_slots,
    });
  }

  private startSessionTimeout(session: ConcurrentSession): void {
    setTimeout(() => {
      const currentSession = this.activeSessions.get(session.session_id);

      if (currentSession && currentSession.status === 'running') {
        logger.warn('Session timeout, cancelling', {
          session_id: session.session_id,
          timeout_ms: this.config.session_timeout_ms,
        });

        this.cancelSession(session.session_id);
      }
    }, this.config.session_timeout_ms);
  }

  private calculateDependencyDepth(session: ConcurrentSession): number {
    let maxDepth = 0;

    for (const feature of session.features) {
      let depth = 0;

      const calculateDepth = (featureId: string, currentDepth: number = 0): void => {
        const feature = session.features.find(f => f.id === featureId);
        if (!feature || !feature.dependencies) {
          return;
        }

        const childDepth = currentDepth + 1;
        maxDepth = Math.max(maxDepth, childDepth);

        for (const depId of feature.dependencies) {
          calculateDepth(depId, childDepth);
        }
      };

      calculateDepth(feature.id);
    }

    return maxDepth;
  }

  private estimateResourceUsage(features: Feature[], resourceType: 'memory' | 'api_calls'): number {
    if (resourceType === 'memory') {
      return features.length * 128;
    }

    if (resourceType === 'api_calls') {
      return features.length * 5;
    }

    return 0;
  }

  private calculateSessionDuration(session: ConcurrentSession): number {
    if (!session.start_time || !session.end_time) {
      return 0;
    }

    return new Date(session.end_time).getTime() - new Date(session.start_time).getTime();
  }

  private generateSessionId(): string {
    return `concurrent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async reset(): Promise<void> {
    for (const [sessionId, session] of this.activeSessions.entries()) {
      await this.cancelSession(sessionId);
    }

    this.sessionQueue = [];
    this.activeSessions.clear();

    this.resourcePool = {
      total_memory_mb: this.config.resource_limits?.max_memory_mb || 8192,
      used_memory_mb: 0,
      total_cpu_percent: 100,
      used_cpu_percent: 0,
      api_calls_per_minute: 0,
      available_slots: this.config.max_parallel_sessions,
    };

    logger.info('Concurrent session service reset');
  }
}

export const concurrentSessionService = new ConcurrentSessionService();
