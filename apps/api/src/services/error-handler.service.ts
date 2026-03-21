import { performanceMetricsService } from './performance-metrics.service';
import { sessionRecoveryService } from './session-recovery.service';
import logger from '../lib/logger';

export interface ErrorContext {
  project_id: string;
  session_id: string;
  task_id?: string;
  feature_id?: string;
  user_id?: string;
  timestamp: string;
}

export interface ErrorRecord {
  id: string;
  error: Error;
  context: ErrorContext;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: ErrorCategory;
  recovery_attempted: boolean;
  recovery_successful: boolean;
  resolution?: string;
}

export type ErrorCategory =
  | 'network'
  | 'api'
  | 'database'
  | 'validation'
  | 'timeout'
  | 'memory'
  | 'permission'
  | 'configuration'
  | 'unknown';

export interface RecoveryAction {
  action_type: 'retry' | 'fallback' | 'skip' | 'escalate' | 'manual_intervention';
  description: string;
  max_attempts?: number;
  delay_ms?: number;
  requires_user_action?: boolean;
}

export class ErrorHandlerService {
  private errorRecords: Map<string, ErrorRecord[]> = new Map();
  private errorPatterns: Map<string, { count: number; last_seen: string }> = new Map();
  private recoveryStrategies: Map<ErrorCategory, RecoveryAction[]> = new Map();

  constructor() {
    this.initializeRecoveryStrategies();
  }

  async handleError(
    error: Error,
    context: ErrorContext
  ): Promise<{
    should_continue: boolean;
    action_taken?: RecoveryAction;
    message?: string;
  }> {
    const category = this.categorizeError(error);
    const severity = this.assessSeverity(error, category);
    const recoveryAction = this.getRecoveryAction(category, severity);

    const errorRecord: ErrorRecord = {
      id: this.generateErrorId(),
      error,
      context,
      severity,
      category,
      recovery_attempted: false,
      recovery_successful: false,
    };

    this.recordError(errorRecord);
    this.trackErrorPattern(error, category);

    logger.error('Error handled', {
      error_id: errorRecord.id,
      category,
      severity,
      message: error.message,
      project_id: context.project_id,
      session_id: context.session_id,
    });

    performanceMetricsService.recordMetric('error.handled', 1, {
      category,
      severity,
      project_id: context.project_id,
    });

    if (recoveryAction) {
      return await this.executeRecoveryAction(recoveryAction, error, context);
    }

    return {
      should_continue: false,
      message: `No recovery action available for ${category} error`,
    };
  }

  async handleFeatureError(
    error: Error,
    projectId: string,
    sessionId: string,
    featureId: string,
    taskAttempt: number
  ): Promise<{
    should_retry: boolean;
    should_skip: boolean;
    should_escalate: boolean;
    retry_delay_ms?: number;
    message: string;
  }> {
    const context: ErrorContext = {
      project_id: projectId,
      session_id: sessionId,
      feature_id: featureId,
      timestamp: new Date().toISOString(),
    };

    const errorRecord = await this.handleError(error, context);

    const errorHistory = this.getErrorHistory(projectId, sessionId);
    const recentFeatureErrors = errorHistory.filter(
      e => e.context.feature_id === featureId
    );

    if (recentFeatureErrors.length >= 3) {
      logger.warn('Feature has repeated errors, suggesting skip', {
        feature_id: featureId,
        error_count: recentFeatureErrors.length,
      });

      return {
        should_retry: false,
        should_skip: true,
        should_escalate: false,
        message: `Feature ${featureId} has failed ${recentFeatureErrors.length} times. Skipping.`,
      };
    }

    if (errorRecord.action_taken?.action_type === 'retry') {
      const maxAttempts = errorRecord.action_taken.max_attempts || 3;

      if (taskAttempt < maxAttempts) {
        const delay = errorRecord.action_taken.delay_ms || 5000;

        logger.info('Scheduling retry', {
          feature_id: featureId,
          attempt: taskAttempt + 1,
          max_attempts: maxAttempts,
          delay_ms: delay,
        });

        return {
          should_retry: true,
          should_skip: false,
          should_escalate: false,
          retry_delay_ms: delay,
          message: `Retrying feature ${featureId} in ${delay}ms`,
        };
      }
    }

    if (errorRecord.action_taken?.action_type === 'skip') {
      return {
        should_retry: false,
        should_skip: true,
        should_escalate: false,
        message: `Skipping feature ${featureId} due to ${errorRecord.category} error`,
      };
    }

    if (errorRecord.action_taken?.action_type === 'escalate') {
      return {
        should_retry: false,
        should_skip: false,
        should_escalate: true,
        message: `Escalating feature ${featureId} due to critical error`,
      };
    }

    return {
      should_retry: false,
      should_skip: false,
      should_escalate: false,
      message: `No action available for feature ${featureId}`,
    };
  }

  async handleSessionError(
    error: Error,
    projectId: string,
    sessionId: string
  ): Promise<{
    should_recover: boolean;
    should_abort: boolean;
    recovery_strategy?: string;
  }> {
    const context: ErrorContext = {
      project_id: projectId,
      session_id: sessionId,
      timestamp: new Date().toISOString(),
    };

    await this.handleError(error, context);

    const errorHistory = this.getErrorHistory(projectId, sessionId);
    const criticalErrors = errorHistory.filter(
      e => e.severity === 'critical'
    );

    if (criticalErrors.length >= 2) {
      logger.warn('Multiple critical errors in session, aborting', {
        project_id: projectId,
        session_id: sessionId,
        critical_errors: criticalErrors.length,
      });

      return {
        should_recover: false,
        should_abort: true,
        recovery_strategy: 'abort_session',
      };
    }

    const category = this.categorizeError(error);

    if (category === 'network' || category === 'timeout') {
      logger.info('Network/timeout error, attempting recovery', {
        project_id: projectId,
        session_id: sessionId,
      });

      const recoveryResult = await sessionRecoveryService.recoverSession(
        projectId,
        sessionId
      );

      if (recoveryResult.recovered) {
        return {
          should_recover: true,
          should_abort: false,
          recovery_strategy: 'session_recovery',
        };
      }
    }

    return {
      should_recover: false,
      should_abort: true,
      recovery_strategy: 'abort_session',
    };
  }

  getErrorHistory(
    projectId: string,
    sessionId?: string,
    limit: number = 50
  ): ErrorRecord[] {
    const key = this.getErrorHistoryKey(projectId, sessionId);
    const history = this.errorRecords.get(key) || [];
    return history.slice(-limit);
  }

  getErrorPatterns(limit: number = 20): Array<{
    error_type: string;
    count: number;
    last_seen: string;
    trend: 'increasing' | 'decreasing' | 'stable';
  }> {
    const patterns: Array<{
      error_type: string;
      count: number;
      last_seen: string;
      trend: 'increasing' | 'decreasing' | 'stable';
    }> = [];

    for (const [errorType, data] of this.errorPatterns.entries()) {
      patterns.push({
        error_type: errorType,
        count: data.count,
        last_seen: data.last_seen,
        trend: 'stable',
      });
    }

    return patterns.sort((a, b) => b.count - a.count).slice(0, limit);
  }

  getErrorStatistics(projectId: string): {
    total_errors: number;
    by_severity: Record<string, number>;
    by_category: Record<string, number>;
    recovery_rate: number;
    average_recovery_time_ms: number;
    most_common_errors: Array<{
      error_type: string;
      count: number;
    }>;
  } {
    const history = this.getErrorHistory(projectId);

    const bySeverity: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    let successfulRecoveries = 0;
    let totalRecoveryTime = 0;

    for (const record of history) {
      bySeverity[record.severity] = (bySeverity[record.severity] || 0) + 1;
      byCategory[record.category] = (byCategory[record.category] || 0) + 1;

      if (record.recovery_attempted && record.recovery_successful) {
        successfulRecoveries++;
      }
    }

    const recoveryRate = history.length > 0 ? (successfulRecoveries / history.length) * 100 : 0;
    const averageRecoveryTime = totalRecoveryTime / successfulRecoveries;

    const errorCounts = new Map<string, number>();

    for (const record of history) {
      const errorType = `${record.category}:${record.error.name}`;
      errorCounts.set(
        errorType,
        (errorCounts.get(errorType) || 0) + 1
      );
    }

    const mostCommonErrors = Array.from(errorCounts.entries())
      .map(([error_type, count]) => ({ error_type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      total_errors: history.length,
      by_severity: bySeverity,
      by_category: byCategory,
      recovery_rate: recoveryRate,
      average_recovery_time_ms: Math.round(averageRecoveryTime),
      most_common_errors: mostCommonErrors,
    };
  }

  async createErrorCheckpoint(
    projectId: string,
    sessionId: string
  ): Promise<void> {
    const errorHistory = this.getErrorHistory(projectId, sessionId);

    if (errorHistory.length > 0) {
      await sessionRecoveryService.createCheckpoint(
        projectId,
        sessionId,
        {
          error_count: errorHistory.length,
          errors: errorHistory.slice(-5),
          timestamp: new Date().toISOString(),
        }
      );
    }
  }

  clearErrorHistory(projectId: string, sessionId?: string): void {
    const key = this.getErrorHistoryKey(projectId, sessionId);
    this.errorRecords.delete(key);

    logger.info('Error history cleared', {
      project_id: projectId,
      session_id: sessionId || 'all',
    });
  }

  private categorizeError(error: Error): ErrorCategory {
    const message = error.message.toLowerCase();

    if (message.includes('network') || message.includes('enotfound') || message.includes('econnrefused')) {
      return 'network';
    }

    if (message.includes('timeout') || message.includes('etimeout')) {
      return 'timeout';
    }

    if (message.includes('permission') || message.includes('unauthorized') || message.includes('forbidden')) {
      return 'permission';
    }

    if (message.includes('database') || message.includes('sql') || message.includes('connection')) {
      return 'database';
    }

    if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
      return 'validation';
    }

    if (message.includes('memory') || message.includes('heap') || message.includes('out of memory')) {
      return 'memory';
    }

    if (message.includes('config') || message.includes('setting') || message.includes('option')) {
      return 'configuration';
    }

    if (message.includes('api') || message.includes('endpoint') || message.includes('http')) {
      return 'api';
    }

    return 'unknown';
  }

  private assessSeverity(error: Error, category: ErrorCategory): 'low' | 'medium' | 'high' | 'critical' {
    if (category === 'permission' || category === 'database') {
      return 'critical';
    }

    if (category === 'memory' || category === 'configuration') {
      return 'high';
    }

    if (category === 'network' || category === 'api') {
      return 'medium';
    }

    if (error.message.includes('critical') || error.message.includes('fatal')) {
      return 'critical';
    }

    if (error.message.includes('warning') || error.message.includes('minor')) {
      return 'low';
    }

    return 'medium';
  }

  private getRecoveryAction(
    category: ErrorCategory,
    severity: 'low' | 'medium' | 'high' | 'critical'
  ): RecoveryAction | undefined {
    const strategies = this.recoveryStrategies.get(category);

    if (!strategies) {
      return undefined;
    }

    const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };

    for (const strategy of strategies) {
      const minSeverity = this.getMinSeverityForAction(strategy.action_type);

      if (severityOrder[severity] >= severityOrder[minSeverity as keyof typeof severityOrder]) {
        return strategy;
      }
    }

    return strategies[0];
  }

  private getMinSeverityForAction(
    actionType: RecoveryAction['action_type']
  ): 'low' | 'medium' | 'high' | 'critical' {
    switch (actionType) {
      case 'retry':
        return 'low';
      case 'fallback':
        return 'medium';
      case 'skip':
        return 'high';
      case 'escalate':
      case 'manual_intervention':
      default:
        return 'critical';
    }
  }

  private async executeRecoveryAction(
    action: RecoveryAction,
    error: Error,
    context: ErrorContext
  ): Promise<{
    should_continue: boolean;
    action_taken: RecoveryAction;
    message?: string;
  }> {
    try {
      switch (action.action_type) {
        case 'retry':
          logger.info('Executing retry recovery', {
            project_id: context.project_id,
            session_id: context.session_id,
            max_attempts: action.max_attempts,
            delay_ms: action.delay_ms,
          });

          if (action.delay_ms) {
            await new Promise(resolve => setTimeout(resolve, action.delay_ms));
          }

          return {
            should_continue: true,
            action_taken: action,
            message: `Retry action executed with ${action.max_attempts} max attempts`,
          };

        case 'fallback':
          logger.info('Executing fallback recovery', {
            project_id: context.project_id,
            session_id: context.session_id,
          });

          return {
            should_continue: true,
            action_taken: action,
            message: 'Fallback action executed',
          };

        case 'skip':
          logger.info('Executing skip recovery', {
            project_id: context.project_id,
            session_id: context.session_id,
            feature_id: context.feature_id,
          });

          return {
            should_continue: true,
            action_taken: action,
            message: `Feature ${context.feature_id} skipped`,
          };

        case 'escalate':
          logger.warn('Executing escalate recovery', {
            project_id: context.project_id,
            session_id: context.session_id,
            error: error.message,
          });

          return {
            should_continue: false,
            action_taken: action,
            message: `Error escalated due to severity`,
          };

        case 'manual_intervention':
          logger.warn('Manual intervention required', {
            project_id: context.project_id,
            session_id: context.session_id,
            error: error.message,
          });

          return {
            should_continue: false,
            action_taken: action,
            message: action.requires_user_action
              ? 'Manual intervention required'
              : 'Manual intervention suggested',
          };
      }
    } catch (recoveryError) {
      logger.error('Recovery action execution failed', {
        action_type: action.action_type,
        error: recoveryError instanceof Error ? recoveryError.message : 'Unknown error',
      });

      return {
        should_continue: false,
        action_taken: action,
        message: 'Recovery action failed',
      };
    }
  }

  private recordError(errorRecord: ErrorRecord): void {
    const key = this.getErrorHistoryKey(
      errorRecord.context.project_id,
      errorRecord.context.session_id
    );

    if (!this.errorRecords.has(key)) {
      this.errorRecords.set(key, []);
    }

    const history = this.errorRecords.get(key)!;
    history.push(errorRecord);

    if (history.length > 100) {
      this.errorRecords.set(key, history.slice(-100));
    }
  }

  private trackErrorPattern(error: Error, category: ErrorCategory): void {
    const errorType = `${category}:${error.name}`;

    const existing = this.errorPatterns.get(errorType);

    if (existing) {
      existing.count++;
      existing.last_seen = new Date().toISOString();
    } else {
      this.errorPatterns.set(errorType, {
        count: 1,
        last_seen: new Date().toISOString(),
      });
    }

    if (this.errorPatterns.size > 100) {
      const sortedPatterns = Array.from(this.errorPatterns.entries())
        .sort((a, b) => a[1].last_seen.localeCompare(b[1].last_seen));

      while (this.errorPatterns.size > 100) {
        this.errorPatterns.delete(sortedPatterns[0][0]);
      }
    }
  }

  private initializeRecoveryStrategies(): void {
    const strategies: Map<ErrorCategory, RecoveryAction[]> = new Map();

    strategies.set('network', [
      {
        action_type: 'retry',
        description: 'Retry network request with exponential backoff',
        max_attempts: 5,
        delay_ms: 2000,
      },
      {
        action_type: 'fallback',
        description: 'Use cached data or alternative endpoint',
      },
    ]);

    strategies.set('timeout', [
      {
        action_type: 'retry',
        description: 'Retry with increased timeout',
        max_attempts: 3,
        delay_ms: 5000,
      },
      {
        action_type: 'skip',
        description: 'Skip current operation and continue',
      },
    ]);

    strategies.set('api', [
      {
        action_type: 'retry',
        description: 'Retry API call with backoff',
        max_attempts: 3,
        delay_ms: 3000,
      },
      {
        action_type: 'fallback',
        description: 'Use fallback API or cached response',
      },
    ]);

    strategies.set('database', [
      {
        action_type: 'skip',
        description: 'Skip current database operation',
      },
      {
        action_type: 'escalate',
        description: 'Escalate to manual intervention',
        requires_user_action: true,
      },
    ]);

    strategies.set('validation', [
      {
        action_type: 'skip',
        description: 'Skip invalid input',
      },
    ]);

    strategies.set('memory', [
      {
        action_type: 'skip',
        description: 'Skip memory-intensive operation',
      },
      {
        action_type: 'escalate',
        description: 'Escalate for manual review',
        requires_user_action: true,
      },
    ]);

    strategies.set('permission', [
      {
        action_type: 'escalate',
        description: 'Escalate permission issue',
        requires_user_action: true,
      },
    ]);

    strategies.set('configuration', [
      {
        action_type: 'skip',
        description: 'Skip configuration-dependent operation',
      },
      {
        action_type: 'manual_intervention',
        description: 'Manual configuration required',
        requires_user_action: true,
      },
    ]);

    strategies.set('unknown', [
      {
        action_type: 'retry',
        description: 'Generic retry',
        max_attempts: 2,
        delay_ms: 5000,
      },
      {
        action_type: 'skip',
        description: 'Skip and continue',
      },
    ]);

    this.recoveryStrategies = strategies;

    logger.info('Recovery strategies initialized', {
      categories: Array.from(strategies.keys()),
    });
  }

  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getErrorHistoryKey(projectId: string, sessionId?: string): string {
    return sessionId ? `${projectId}:${sessionId}` : projectId;
  }

  async reset(): Promise<void> {
    this.errorRecords.clear();
    this.errorPatterns.clear();

    logger.info('Error handler service reset');
  }
}

export const errorHandlerService = new ErrorHandlerService();
