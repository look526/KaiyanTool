import { BaseAgentV2, AgentConfig, AgentContext, AgentTool } from './base-agent-v2';
import { progressTrackingService, Feature, SessionRecord } from '../services/progress-tracking.service';
import { emitProgress, emitTaskComplete, emitTaskError } from '../lib/websocket';
import logger from '../lib/logger';

export interface CodingSessionOptions {
  project_id: string;
  task_id: string;
  user_id: string;
  provider_id: string;
  max_features?: number;
  session_notes?: string;
  workspace_path?: string;
  create_git_commit?: boolean;
}

export interface CodingSessionResult {
  session_id: string;
  features_attempted: string[];
  features_completed: string[];
  features_in_progress: string[];
  files_modified: string[];
  total_iterations: number;
  execution_time: number;
  next_steps: string[];
  session_notes?: string;
}

export class CodingAgent extends BaseAgentV2 {
  private sessionId: string;
  private featuresAttempted: Set<string> = new Set();
  private filesModified: Set<string> = new Set();

  constructor() {
    const config: AgentConfig = {
      name: 'coding-agent',
      role: 'Incremental Feature Implementer',
      systemPrompt: `You are an expert software engineer working in a long-running agent session. Your role is to:

1. Work incrementally - implement 1-3 features per session maximum
2. Make clear progress - leave the environment in a clean, working state
3. Document everything - update progress tracking clearly
4. Think about the next session - leave clear instructions for continuation

IMPORTANT GUIDELINES:
- Start by reviewing the progress file to understand what's been done
- Focus on high-priority features that have no outstanding dependencies
- Implement features completely - don't leave half-finished work
- Test your implementations before marking features as complete
- Write clean, maintainable code following project conventions
- Update feature statuses: 'failing' → 'in_progress' → 'passing'
- Record all files you modify
- Leave clear notes about what you did and what remains

SESSION WORKFLOW:
1. Read progress file and understand current state
2. Select 1-3 features to work on (based on priority and dependencies)
3. Mark selected features as 'in_progress'
4. Implement the features incrementally
5. Test and verify each feature
6. Mark completed features as 'passing'
7. Record session details
8. Suggest next steps for the next session

Remember: The goal is steady, incremental progress. Quality over quantity.`,
      maxIterations: 20,
      timeout: 600000,
    };

    const context: AgentContext = {
      projectId: '',
      taskId: '',
      userId: '',
      conversationHistory: [],
      data: {},
      permissions: [],
    };

    super(config, context);
    this.sessionId = this.generateSessionId();
  }

  async runCodingSession(options: CodingSessionOptions): Promise<CodingSessionResult> {
    const startTime = Date.now();

    try {
      logger.info('Starting coding session', {
        project_id: options.project_id,
        task_id: options.task_id,
        session_id: this.sessionId,
      });

      this.context.projectId = options.project_id;
      this.context.taskId = options.task_id;
      this.context.userId = options.user_id;

      const maxFeatures = options.max_features || 3;

      await this.loadContext(options);

      const featuresToImplement = await this.selectFeatures(options.project_id, maxFeatures);

      if (featuresToImplement.length === 0) {
        logger.info('No features to implement - project may be complete', {
          project_id: options.project_id,
        });

        return await this.completeSession(options, [], startTime);
      }

      emitProgress(
        options.project_id,
        options.task_id,
        10,
        `Starting session: Implementing ${featuresToImplement.length} features`
      );

      const completedFeatures: Feature[] = [];
      const inProgressFeatures: Feature[] = [];

      for (let i = 0; i < featuresToImplement.length; i++) {
        const feature = featuresToImplement[i];
        const progress = 10 + ((i + 1) / featuresToImplement.length) * 80;

        emitProgress(
          options.project_id,
          options.task_id,
          progress,
          `Working on feature ${i + 1}/${featuresToImplement.length}: ${feature.description}`
        );

        const result = await this.implementFeature(feature, options);

        if (result.success) {
          await progressTrackingService.updateFeatureStatus(
            options.project_id,
            feature.id,
            'passing',
            result.notes
          );
          completedFeatures.push(feature);
        } else {
          await progressTrackingService.updateFeatureStatus(
            options.project_id,
            feature.id,
            'in_progress',
            result.error
          );
          inProgressFeatures.push(feature);
        }

        this.featuresAttempted.add(feature.id);
      }

      const sessionResult = await this.completeSession(options, completedFeatures, startTime, inProgressFeatures);

      logger.info('Coding session completed', {
        session_id: this.sessionId,
        features_completed: sessionResult.features_completed.length,
        execution_time: sessionResult.execution_time,
      });

      return sessionResult;
    } catch (error) {
      logger.error('Coding session failed', {
        session_id: this.sessionId,
        project_id: options.project_id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      emitTaskError(options.project_id, options.task_id, error instanceof Error ? error.message : 'Unknown error');

      throw error;
    }
  }

  private async loadContext(options: CodingSessionOptions): Promise<void> {
    try {
      const progressData = await progressTrackingService.getProgress(options.project_id);

      this.context.data = {
        task_description: progressData.task_description,
        total_features: progressData.total_features,
        completed_features: progressData.completed_features,
        progress_percentage: progressData.progress_percentage,
        previous_sessions: progressData.sessions,
      };

      logger.info('Context loaded', {
        project_id: options.project_id,
        total_features: progressData.total_features,
        completed_features: progressData.completed_features,
      });
    } catch (error) {
      logger.error('Failed to load context', {
        project_id: options.project_id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new Error('Failed to load project context. Make sure the project has been initialized.');
    }
  }

  private async selectFeatures(projectId: string, maxCount: number): Promise<Feature[]> {
    try {
      const nextFeatures = await progressTrackingService.getNextFeaturesToImplement(projectId, maxCount * 2);
      
      const selectedFeatures: Feature[] = [];

      for (const feature of nextFeatures) {
        if (selectedFeatures.length >= maxCount) {
          break;
        }

        const dependenciesMet = await this.checkDependenciesMet(projectId, feature);
        
        if (dependenciesMet) {
          selectedFeatures.push(feature);
          await progressTrackingService.updateFeatureStatus(projectId, feature.id, 'in_progress');
        }
      }

      logger.info('Features selected for implementation', {
        project_id: projectId,
        selected_count: selectedFeatures.length,
        max_count: maxCount,
      });

      return selectedFeatures;
    } catch (error) {
      logger.error('Failed to select features', {
        project_id: projectId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return [];
    }
  }

  private async checkDependenciesMet(projectId: string, feature: Feature): Promise<boolean> {
    if (!feature.dependencies || feature.dependencies.length === 0) {
      return true;
    }

    for (const depId of feature.dependencies) {
      const depFeature = await progressTrackingService.getFeature(projectId, depId);
      
      if (!depFeature || depFeature.status !== 'passing') {
        return false;
      }
    }

    return true;
  }

  private async implementFeature(
    feature: Feature,
    options: CodingSessionOptions
  ): Promise<{ success: boolean; notes?: string; error?: string }> {
    try {
      const input = this.buildFeatureImplementationInput(feature, options);

      const result = await super.run(input, options.provider_id);

      if (result.success) {
        const notes = this.extractImplementationNotes(result.content);
        
        const files = this.extractModifiedFiles(result.content);
        files.forEach(f => this.filesModified.add(f));

        return {
          success: true,
          notes: notes || `Feature "${feature.description}" implemented successfully`,
        };
      } else {
        return {
          success: false,
          error: result.error || 'Implementation failed',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private buildFeatureImplementationInput(feature: Feature, options: CodingSessionOptions): string {
    const lines: string[] = [];

    lines.push('FEATURE TO IMPLEMENT:');
    lines.push(`ID: ${feature.id}`);
    lines.push(`Description: ${feature.description}`);
    lines.push(`Priority: ${feature.priority}`);
    if (feature.dependencies && feature.dependencies.length > 0) {
      lines.push(`Dependencies: ${feature.dependencies.join(', ')}`);
    }
    if (feature.notes) {
      lines.push(`Notes: ${feature.notes}`);
    }

    lines.push('');
    lines.push('PROJECT CONTEXT:');
    lines.push(`Task: ${this.context.data.task_description}`);
    lines.push(`Progress: ${this.context.data.completed_features}/${this.context.data.total_features} features completed`);

    if (this.context.data.previous_sessions && this.context.data.previous_sessions.length > 0) {
      lines.push('');
      lines.push('RECENT SESSIONS:');
      const recentSessions = this.context.data.previous_sessions.slice(-3);
      recentSessions.forEach((session: SessionRecord, idx: number) => {
        lines.push(`Session ${idx + 1} (${session.timestamp}):`);
        lines.push(`  - Features completed: ${session.features_completed.join(', ') || 'None'}`);
        if (session.notes) {
          lines.push(`  - Notes: ${session.notes}`);
        }
      });
    }

    lines.push('');
    lines.push('REQUIREMENTS:');
    lines.push('1. Implement the feature completely and correctly');
    lines.push('2. Follow existing code patterns and conventions');
    lines.push('3. Write clean, maintainable code');
    lines.push('4. Consider edge cases and error handling');
    lines.push('5. Update any related files as needed');
    lines.push('6. Test your implementation');
    lines.push('7. List all files you modify in your response');

    lines.push('');
    lines.push('OUTPUT FORMAT:');
    lines.push('Provide a summary of:');
    lines.push('- What you implemented');
    lines.push('- Files you modified');
    lines.push('- Any important notes for the next session');
    lines.push('- Whether the feature is complete or needs more work');

    return lines.join('\n');
  }

  private extractImplementationNotes(content: string): string | undefined {
    const notePatterns = [
      /notes?:\s*([^\n]+)/i,
      /implementation notes?:\s*([^\n]+)/i,
      /summary:?\s*([^\n]+)/i,
    ];

    for (const pattern of notePatterns) {
      const match = content.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return undefined;
  }

  private extractModifiedFiles(content: string): string[] {
    const files: string[] = [];

    const filePatterns = [
      /files modified:?\s*([^\n]+)/i,
      /modified files:?\s*([^\n]+)/i,
      /files:?\s*([^\n]+)/i,
    ];

    for (const pattern of filePatterns) {
      const match = content.match(pattern);
      if (match && match[1]) {
        const fileList = match[1].split(',').map(f => f.trim());
        files.push(...fileList);
      }
    }

    return files;
  }

  private async completeSession(
    options: CodingSessionOptions,
    completedFeatures: Feature[],
    startTime: number,
    inProgressFeatures: Feature[] = []
  ): Promise<CodingSessionResult> {
    const executionTime = Date.now() - startTime;

    emitProgress(
      options.project_id,
      options.task_id,
      95,
      'Recording session progress...'
    );

    const nextSteps = await this.generateNextSteps(options.project_id);

    const sessionRecord: SessionRecord = {
      session_id: this.sessionId,
      timestamp: new Date().toISOString(),
      agent_name: 'coding-agent',
      actions: [
        `Attempted ${this.featuresAttempted.size} features`,
        `Completed ${completedFeatures.length} features`,
        `Left ${inProgressFeatures.length} features in progress`,
      ],
      features_completed: completedFeatures.map(f => f.id),
      features_in_progress: inProgressFeatures.map(f => f.id),
      files_modified: Array.from(this.filesModified),
      notes: options.session_notes,
      next_steps: nextSteps,
    };

    await progressTrackingService.recordSession(options.project_id, sessionRecord);

    emitProgress(options.project_id, options.task_id, 100, 'Session completed');
    emitTaskComplete(options.project_id, options.task_id, {
      session_id: this.sessionId,
      features_completed: sessionRecord.features_completed,
    });

    const result: CodingSessionResult = {
      session_id: this.sessionId,
      features_attempted: Array.from(this.featuresAttempted),
      features_completed: sessionRecord.features_completed,
      features_in_progress: sessionRecord.features_in_progress,
      files_modified: sessionRecord.files_modified,
      total_iterations: this.iterations,
      execution_time,
      next_steps,
      session_notes: options.session_notes,
    };

    return result;
  }

  private async generateNextSteps(projectId: string): Promise<string[]> {
    const nextSteps: string[] = [];

    const nextFeatures = await progressTrackingService.getNextFeaturesToImplement(projectId, 5);
    const inProgressFeatures = await progressTrackingService.getInProgressFeatures(projectId);
    const progressData = await progressTrackingService.getProgress(projectId);

    if (inProgressFeatures.length > 0) {
      nextSteps.push(`Complete the ${inProgressFeatures.length} features currently in progress`);
      inProgressFeatures.forEach(f => {
        nextSteps.push(`  - ${f.description}`);
      });
    }

    if (nextFeatures.length > 0) {
      nextSteps.push(`Continue with next features (prioritized):`);
      nextFeatures.slice(0, 3).forEach(f => {
        nextSteps.push(`  - [${f.priority.toUpperCase()}] ${f.description}`);
      });
    }

    const remaining = progressData.total_features - progressData.completed_features;
    if (remaining === 0) {
      nextSteps.push('All features completed! Project is ready for final testing and deployment.');
    } else {
      nextSteps.push(`Progress: ${progressData.completed_features}/${progressData.total_features} features completed (${progressData.progress_percentage.toFixed(1)}%)`);
    }

    return nextSteps;
  }

  private generateSessionId(): string {
    return `coding_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async getSessionStatus(projectId: string, sessionId: string): Promise<{
    session_id: string;
    found: boolean;
    status?: string;
  }> {
    try {
      const progressData = await progressTrackingService.getProgress(projectId);
      const session = progressData.sessions.find(s => s.session_id === sessionId);

      if (session) {
        return {
          session_id: sessionId,
          found: true,
          status: 'completed',
        };
      }

      return {
        session_id: sessionId,
        found: false,
      };
    } catch (error) {
      logger.error('Failed to get session status', {
        project_id: projectId,
        session_id: sessionId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return {
        session_id: sessionId,
        found: false,
      };
    }
  }

  async getAvailableFeatures(projectId: string): Promise<{
    available: Feature[];
    in_progress: Feature[];
    completed: Feature[];
  }> {
    try {
      const progressData = await progressTrackingService.getProgress(projectId);

      return {
        available: progressData.features.filter(f => f.status === 'failing'),
        in_progress: progressData.features.filter(f => f.status === 'in_progress'),
        completed: progressData.features.filter(f => f.status === 'passing'),
      };
    } catch (error) {
      logger.error('Failed to get available features', {
        project_id: projectId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return {
        available: [],
        in_progress: [],
        completed: [],
      };
    }
  }
}

export const codingAgent = new CodingAgent();
