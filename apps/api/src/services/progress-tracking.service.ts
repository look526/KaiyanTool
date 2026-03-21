import { promises as fs } from 'fs';
import path from 'path';
import logger from '../lib/logger';

export interface Feature {
  id: string;
  description: string;
  status: 'failing' | 'passing' | 'in_progress';
  priority: 'high' | 'medium' | 'low';
  dependencies?: string[];
  notes?: string;
}

export interface SessionRecord {
  session_id: string;
  timestamp: string;
  agent_name: string;
  actions: string[];
  features_completed: string[];
  features_in_progress: string[];
  files_modified: string[];
  notes?: string;
  next_steps?: string[];
}

export interface ProgressData {
  project_id: string;
  task_description: string;
  features: Feature[];
  sessions: SessionRecord[];
  last_updated: string;
  total_features: number;
  completed_features: number;
  progress_percentage: number;
}

export class ProgressTrackingService {
  private projectProgressDir: string;

  constructor() {
    this.projectProgressDir = path.join(process.cwd(), 'workspace', 'progress');
  }

  async initializeProgress(projectId: string, taskDescription: string, features: Feature[]): Promise<void> {
    try {
      await this.ensureProgressDirectory();
      
      const filePath = this.getProgressFilePath(projectId);
      const progressData: ProgressData = {
        project_id: projectId,
        task_description: taskDescription,
        features: features,
        sessions: [],
        last_updated: new Date().toISOString(),
        total_features: features.length,
        completed_features: 0,
        progress_percentage: 0,
      };

      await fs.writeFile(filePath, JSON.stringify(progressData, null, 2), 'utf-8');
      
      logger.info('Progress tracking initialized', { project_id: projectId, features_count: features.length });
    } catch (error) {
      logger.error('Failed to initialize progress tracking', {
        project_id: projectId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async recordSession(
    projectId: string,
    sessionRecord: SessionRecord
  ): Promise<void> {
    try {
      const progressData = await this.loadProgress(projectId);
      
      progressData.sessions.push(sessionRecord);
      progressData.last_updated = new Date().toISOString();
      
      await this.saveProgress(projectId, progressData);
      
      logger.info('Session recorded', {
        project_id: projectId,
        session_id: sessionRecord.session_id,
        features_completed: sessionRecord.features_completed.length,
      });
    } catch (error) {
      logger.error('Failed to record session', {
        project_id: projectId,
        session_id: sessionRecord.session_id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async updateFeatureStatus(
    projectId: string,
    featureId: string,
    status: Feature['status'],
    notes?: string
  ): Promise<void> {
    try {
      const progressData = await this.loadProgress(projectId);
      const feature = progressData.features.find(f => f.id === featureId);
      
      if (!feature) {
        throw new Error(`Feature not found: ${featureId}`);
      }

      const previousStatus = feature.status;
      feature.status = status;
      if (notes) {
        feature.notes = notes;
      }

      progressData.last_updated = new Date().toISOString();
      progressData.completed_features = progressData.features.filter(f => f.status === 'passing').length;
      progressData.progress_percentage = (progressData.completed_features / progressData.total_features) * 100;

      await this.saveProgress(projectId, progressData);
      
      logger.info('Feature status updated', {
        project_id: projectId,
        feature_id: featureId,
        previous_status: previousStatus,
        new_status: status,
      });
    } catch (error) {
      logger.error('Failed to update feature status', {
        project_id: projectId,
        feature_id: featureId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async getProgress(projectId: string): Promise<ProgressData> {
    return this.loadProgress(projectId);
  }

  async getFeature(projectId: string, featureId: string): Promise<Feature | null> {
    const progressData = await this.loadProgress(projectId);
    return progressData.features.find(f => f.id === featureId) || null;
  }

  async getNextFeaturesToImplement(projectId: string, limit: number = 5): Promise<Feature[]> {
    const progressData = await this.loadProgress(projectId);
    
    const failingFeatures = progressData.features.filter(f => f.status === 'failing');
    
    const sortedFeatures = failingFeatures.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    return sortedFeatures.slice(0, limit);
  }

  async getInProgressFeatures(projectId: string): Promise<Feature[]> {
    const progressData = await this.loadProgress(projectId);
    return progressData.features.filter(f => f.status === 'in_progress');
  }

  async getRecentSessions(projectId: string, limit: number = 10): Promise<SessionRecord[]> {
    const progressData = await this.loadProgress(projectId);
    return progressData.sessions.slice(-limit).reverse();
  }

  async generateProgressReport(projectId: string): Promise<string> {
    const progressData = await this.loadProgress(projectId);
    
    const lines: string[] = [];
    lines.push('='.repeat(80));
    lines.push(`PROJECT: ${projectId}`);
    lines.push(`TASK: ${progressData.task_description}`);
    lines.push('='.repeat(80));
    lines.push('');
    lines.push(`Progress: ${progressData.completed_features}/${progressData.total_features} features (${progressData.progress_percentage.toFixed(1)}%)`);
    lines.push(`Last Updated: ${progressData.last_updated}`);
    lines.push('');
    lines.push('-'.repeat(80));
    lines.push('FEATURE STATUS');
    lines.push('-'.repeat(80));
    
    const statusGroups = {
      passing: progressData.features.filter(f => f.status === 'passing'),
      in_progress: progressData.features.filter(f => f.status === 'in_progress'),
      failing: progressData.features.filter(f => f.status === 'failing'),
    };

    lines.push(`\n✅ COMPLETED (${statusGroups.passing.length}):`);
    statusGroups.passing.forEach(f => {
      lines.push(`  [${f.priority.toUpperCase()}] ${f.description}`);
    });

    lines.push(`\n🔄 IN PROGRESS (${statusGroups.in_progress.length}):`);
    statusGroups.in_progress.forEach(f => {
      lines.push(`  [${f.priority.toUpperCase()}] ${f.description}`);
      if (f.notes) {
        lines.push(`     Note: ${f.notes}`);
      }
    });

    lines.push(`\n❌ NOT STARTED (${statusGroups.failing.length}):`);
    statusGroups.failing.forEach(f => {
      lines.push(`  [${f.priority.toUpperCase()}] ${f.description}`);
    });

    lines.push('');
    lines.push('-'.repeat(80));
    lines.push('RECENT SESSIONS');
    lines.push('-'.repeat(80));
    
    const recentSessions = progressData.sessions.slice(-5).reverse();
    recentSessions.forEach((session, idx) => {
      lines.push(`\nSession ${idx + 1}: ${session.session_id}`);
      lines.push(`  Time: ${session.timestamp}`);
      lines.push(`  Agent: ${session.agent_name}`);
      lines.push(`  Features Completed: ${session.features_completed.join(', ') || 'None'}`);
      if (session.notes) {
        lines.push(`  Notes: ${session.notes}`);
      }
      if (session.next_steps && session.next_steps.length > 0) {
        lines.push(`  Next Steps:`);
        session.next_steps.forEach(step => {
          lines.push(`    - ${step}`);
        });
      }
    });

    lines.push('');
    lines.push('='.repeat(80));
    
    return lines.join('\n');
  }

  async exportProgress(projectId: string, format: 'json' | 'txt' = 'json'): Promise<string> {
    const progressData = await this.loadProgress(projectId);
    
    if (format === 'json') {
      return JSON.stringify(progressData, null, 2);
    } else {
      return this.generateProgressReport(projectId);
    }
  }

  private async loadProgress(projectId: string): Promise<ProgressData> {
    const filePath = this.getProgressFilePath(projectId);
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  }

  private async saveProgress(projectId: string, progressData: ProgressData): Promise<void> {
    const filePath = this.getProgressFilePath(projectId);
    await fs.writeFile(filePath, JSON.stringify(progressData, null, 2), 'utf-8');
  }

  private getProgressFilePath(projectId: string): string {
    return path.join(this.projectProgressDir, `${projectId}.json`);
  }

  private async ensureProgressDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.projectProgressDir, { recursive: true });
    } catch (error) {
      logger.error('Failed to create progress directory', {
        directory: this.projectProgressDir,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async deleteProgress(projectId: string): Promise<void> {
    try {
      const filePath = this.getProgressFilePath(projectId);
      await fs.unlink(filePath);
      
      logger.info('Progress tracking deleted', { project_id: projectId });
    } catch (error) {
      if ((error as any).code !== 'ENOENT') {
        logger.error('Failed to delete progress tracking', {
          project_id: projectId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        throw error;
      }
    }
  }
}

export const progressTrackingService = new ProgressTrackingService();
