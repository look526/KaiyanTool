import { progressTrackingService } from './progress-tracking.service';
import logger from '../lib/logger';

interface SessionState {
  project_id: string;
  session_id: string;
  status: 'running' | 'completed' | 'failed';
  start_time: string;
  end_time?: string;
  agent_name: string;
}

export class SessionManagerService {
  private activeSessions: Map<string, SessionState> = new Map();
  private sessionHistory: Map<string, SessionState[]> = new Map();

  async startSession(
    projectId: string,
    sessionId: string,
    agentName: string
  ): Promise<void> {
    const sessionKey = this.getSessionKey(projectId, sessionId);

    if (this.activeSessions.has(sessionKey)) {
      throw new Error(`Session ${sessionId} is already running for project ${projectId}`);
    }

    const sessionState: SessionState = {
      project_id: projectId,
      session_id: sessionId,
      status: 'running',
      start_time: new Date().toISOString(),
      agent_name: agentName,
    };

    this.activeSessions.set(sessionKey, sessionState);

    logger.info('Session started', {
      project_id: projectId,
      session_id: sessionId,
      agent_name: agentName,
    });
  }

  async completeSession(
    projectId: string,
    sessionId: string,
    success: boolean
  ): Promise<void> {
    const sessionKey = this.getSessionKey(projectId, sessionId);
    const session = this.activeSessions.get(sessionKey);

    if (!session) {
      logger.warn('Session not found for completion', {
        project_id: projectId,
        session_id: sessionId,
      });
      return;
    }

    session.status = success ? 'completed' : 'failed';
    session.end_time = new Date().toISOString();

    this.activeSessions.delete(sessionKey);

    if (!this.sessionHistory.has(projectId)) {
      this.sessionHistory.set(projectId, []);
    }

    const history = this.sessionHistory.get(projectId)!;
    history.push(session);

    await this.cleanupOldSessions(projectId);

    logger.info('Session completed', {
      project_id: projectId,
      session_id: sessionId,
      status: session.status,
      duration: this.calculateDuration(session.start_time, session.end_time),
    });
  }

  getSessionStatus(projectId: string, sessionId: string): SessionState | null {
    const sessionKey = this.getSessionKey(projectId, sessionId);
    return this.activeSessions.get(sessionKey) || null;
  }

  isSessionRunning(projectId: string, sessionId: string): boolean {
    const session = this.getSessionStatus(projectId, sessionId);
    return session !== null && session.status === 'running';
  }

  getActiveSessions(projectId: string): SessionState[] {
    return Array.from(this.activeSessions.values()).filter(
      s => s.project_id === projectId
    );
  }

  getSessionHistory(projectId: string, limit: number = 50): SessionState[] {
    const history = this.sessionHistory.get(projectId) || [];
    return history.slice(-limit);
  }

  async cleanupOldSessions(projectId: string, keepCount: number = 100): Promise<void> {
    try {
      const history = this.sessionHistory.get(projectId);
      if (!history || history.length <= keepCount) {
        return;
      }

      const sessionsToRemove = history.slice(0, history.length - keepCount);
      this.sessionHistory.set(projectId, history.slice(-keepCount));

      logger.info('Old sessions cleaned up', {
        project_id: projectId,
        removed_count: sessionsToRemove.length,
        remaining_count: keepCount,
      });
    } catch (error) {
      logger.error('Failed to cleanup old sessions', {
        project_id: projectId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async forceCleanup(projectId: string): Promise<void> {
    const activeSessions = this.getActiveSessions(projectId);

    for (const session of activeSessions) {
      await this.completeSession(projectId, session.session_id, false);
      logger.warn('Force completed session', {
        project_id: projectId,
        session_id: session.session_id,
      });
    }

    this.sessionHistory.delete(projectId);

    logger.info('Force cleanup completed', {
      project_id: projectId,
      sessions_cleaned: activeSessions.length,
    });
  }

  getStatistics(projectId: string): {
    active_sessions: number;
    completed_sessions: number;
    failed_sessions: number;
    total_sessions: number;
    average_duration: number;
  } {
    const active = this.getActiveSessions(projectId).length;
    const history = this.getSessionHistory(projectId);
    const completed = history.filter(s => s.status === 'completed').length;
    const failed = history.filter(s => s.status === 'failed').length;

    const durations = history
      .filter(s => s.end_time)
      .map(s => this.calculateDuration(s.start_time, s.end_time));

    const averageDuration =
      durations.length > 0
        ? durations.reduce((sum, d) => sum + d, 0) / durations.length
        : 0;

    return {
      active_sessions: active,
      completed_sessions: completed,
      failed_sessions: failed,
      total_sessions: active + completed + failed,
      average_duration: averageDuration,
    };
  }

  private getSessionKey(projectId: string, sessionId: string): string {
    return `${projectId}:${sessionId}`;
  }

  private calculateDuration(startTime: string, endTime?: string): number {
    if (!endTime) return 0;

    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();

    return end - start;
  }

  async reset(): Promise<void> {
    const activeSessions = Array.from(this.activeSessions.values());

    for (const session of activeSessions) {
      await this.completeSession(session.project_id, session.session_id, false);
    }

    this.activeSessions.clear();
    this.sessionHistory.clear();

    logger.info('Session manager reset');
  }
}

export const sessionManagerService = new SessionManagerService();
