import { BaseAgentV2, AgentConfig, AgentContext, AgentTool } from './base-agent-v2';
import { progressTrackingService, Feature } from '../services/progress-tracking.service';
import { featureListService, GenerateFeaturesOptions } from '../services/feature-list.service';
import { prisma } from '../lib/prisma';
import { promises as fs } from 'fs';
import path from 'path';
import logger from '../lib/logger';

export interface InitializerOptions {
  project_id: string;
  task_description: string;
  project_context?: string;
  technologies?: string[];
  constraints?: string[];
  existing_features?: string[];
  provider_id: string;
  create_git_commit?: boolean;
  workspace_path?: string;
}

export interface InitializerResult {
  project_id: string;
  features_generated: number;
  progress_file_created: boolean;
  git_commit_created: boolean;
  session_id: string;
  next_steps: string[];
}

export class InitializerAgent extends BaseAgentV2 {
  private sessionId: string;

  constructor() {
    const config: AgentConfig = {
      name: 'initializer-agent',
      role: 'Project Initializer',
      systemPrompt: `You are an expert software architect and project initializer. Your role is to:
1. Analyze project requirements and generate a comprehensive feature list
2. Set up the initial environment for long-running agent sessions
3. Create all necessary tracking and documentation files
4. Establish a clear foundation for incremental development

You should think carefully about:
- Breaking down tasks into granular, testable features
- Establishing proper feature dependencies
- Setting up appropriate priorities
- Creating a clear roadmap for implementation

Always be thorough and comprehensive. Do not skip steps.`,
      maxIterations: 5,
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

  async initializeProject(options: InitializerOptions): Promise<InitializerResult> {
    try {
      logger.info('Initializing project', {
        project_id: options.project_id,
        task_description: options.task_description,
      });

      this.context.projectId = options.project_id;
      this.context.taskId = `init-${this.sessionId}`;

      const features = await this.generateFeatures(options);
      await progressTrackingService.initializeProgress(options.project_id, options.task_description, features);

      const gitCommitCreated = options.create_git_commit ? await this.createInitialGitCommit(options, features) : false;

      const result: InitializerResult = {
        project_id: options.project_id,
        features_generated: features.length,
        progress_file_created: true,
        git_commit_created,
        session_id: this.sessionId,
        next_steps: await this.generateNextSteps(options.project_id, features),
      };

      await this.recordInitializerSession(options, result, features);

      logger.info('Project initialization completed', {
        project_id: options.project_id,
        features_generated: result.features_generated,
        session_id: result.session_id,
      });

      return result;
    } catch (error) {
      logger.error('Project initialization failed', {
        project_id: options.project_id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  private async generateFeatures(options: InitializerOptions): Promise<Feature[]> {
    const featureOptions: GenerateFeaturesOptions = {
      taskDescription: options.task_description,
      projectContext: options.project_context,
      technologies: options.technologies,
      constraints: options.constraints,
      existingFeatures: options.existing_features,
      providerId: options.provider_id,
    };

    const features = await featureListService.generateFeatureList(featureOptions);

    logger.info('Features generated successfully', {
      project_id: options.project_id,
      features_count: features.length,
    });

    return features;
  }

  private async createInitialGitCommit(options: InitializerOptions, features: Feature[]): Promise<boolean> {
    try {
      const workspacePath = options.workspace_path || process.cwd();
      const gitDir = path.join(workspacePath, '.git');

      try {
        await fs.access(gitDir);
      } catch {
        logger.warn('Git repository not found, skipping initial commit', {
          workspace_path: workspacePath,
        });
        return false;
      }

      const commitMessage = this.buildCommitMessage(options, features);
      const commitFilePath = path.join(workspacePath, '.git', 'COMMIT_EDITMSG');

      await fs.writeFile(commitFilePath, commitMessage, 'utf-8');

      logger.info('Initial git commit prepared', {
        project_id: options.project_id,
        commit_message_length: commitMessage.length,
      });

      return true;
    } catch (error) {
      logger.error('Failed to create initial git commit', {
        project_id: options.project_id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  private buildCommitMessage(options: InitializerOptions, features: Feature[]): string {
    const lines: string[] = [];
    
    lines.push(`feat: initialize project - ${options.task_description}`);
    lines.push('');
    lines.push('This commit establishes the foundation for the project with:');
    lines.push('');
    lines.push(`- ${features.length} features identified and tracked`);
    lines.push('- Progress tracking system initialized');
    lines.push('- Development roadmap established');
    lines.push('');
    lines.push('Feature breakdown:');
    lines.push('');

    const priorityGroups = {
      high: features.filter(f => f.priority === 'high'),
      medium: features.filter(f => f.priority === 'medium'),
      low: features.filter(f => f.priority === 'low'),
    };

    lines.push(`High Priority (${priorityGroups.high.length}):`);
    priorityGroups.high.slice(0, 10).forEach(f => {
      lines.push(`  - ${f.description}`);
    });
    if (priorityGroups.high.length > 10) {
      lines.push(`  - ... and ${priorityGroups.high.length - 10} more`);
    }

    lines.push('');
    lines.push(`Medium Priority (${priorityGroups.medium.length}):`);
    lines.push(`Low Priority (${priorityGroups.low.length}):`);
    lines.push('');
    lines.push(`Session ID: ${this.sessionId}`);
    lines.push(`Initialized at: ${new Date().toISOString()}`);

    return lines.join('\n');
  }

  private async generateNextSteps(projectId: string, features: Feature[]): Promise<string[]> {
    const nextSteps: string[] = [];

    const highPriorityFeatures = features.filter(f => f.priority === 'high');
    const featuresWithoutDependencies = features.filter(f => !f.dependencies || f.dependencies.length === 0);

    nextSteps.push(`Start with high-priority features that have no dependencies`);
    nextSteps.push(`Review and prioritize the first ${Math.min(5, highPriorityFeatures.length)} high-priority features`);
    nextSteps.push(`Implement features incrementally, one or a few at a time`);
    nextSteps.push(`Update feature status to 'in_progress' when starting work`);
    nextSteps.push(`Update feature status to 'passing' when completed and tested`);
    nextSteps.push(`Record each session's progress using the progress tracking system`);
    nextSteps.push(`Maintain clean code state after each session`);

    const initialFeatures = featuresWithoutDependencies
      .filter(f => f.priority === 'high')
      .slice(0, 3)
      .map(f => f.description);

    if (initialFeatures.length > 0) {
      nextSteps.push('');
      nextSteps.push('Recommended starting features:');
      initialFeatures.forEach(f => {
        nextSteps.push(`  - ${f}`);
      });
    }

    return nextSteps;
  }

  private async recordInitializerSession(
    options: InitializerOptions,
    result: InitializerResult,
    features: Feature[]
  ): Promise<void> {
    const sessionRecord = {
      session_id: this.sessionId,
      timestamp: new Date().toISOString(),
      agent_name: 'initializer-agent',
      actions: [
        'Generated comprehensive feature list',
        'Initialized progress tracking system',
        result.git_commit_created ? 'Created initial git commit' : 'Skipped git commit',
        'Established project foundation',
      ],
      features_completed: [],
      features_in_progress: [],
      files_modified: [],
      notes: `Project initialized with ${result.features_generated} features. Ready for incremental development.`,
      next_steps: result.next_steps,
    };

    await progressTrackingService.recordSession(options.project_id, sessionRecord);
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async getInitializationStatus(projectId: string): Promise<{
    initialized: boolean;
    features_count: number;
    progress: number;
    last_session?: any;
  }> {
    try {
      const progressData = await progressTrackingService.getProgress(projectId);
      
      return {
        initialized: true,
        features_count: progressData.total_features,
        progress: progressData.progress_percentage,
        last_session: progressData.sessions[progressData.sessions.length - 1],
      };
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        return {
          initialized: false,
          features_count: 0,
          progress: 0,
        };
      }
      throw error;
    }
  }

  async resumeProject(projectId: string, taskId: string): Promise<{
    progress: any;
    next_features: Feature[];
    in_progress_features: Feature[];
    recent_sessions: any[];
  }> {
    try {
      const progress = await progressTrackingService.getProgress(projectId);
      const nextFeatures = await progressTrackingService.getNextFeaturesToImplement(projectId, 5);
      const inProgressFeatures = await progressTrackingService.getInProgressFeatures(projectId);
      const recentSessions = await progressTrackingService.getRecentSessions(projectId, 5);

      return {
        progress,
        next_features: nextFeatures,
        in_progress_features: inProgressFeatures,
        recent_sessions: recentSessions,
      };
    } catch (error) {
      logger.error('Failed to resume project', {
        project_id: projectId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }
}

export const initializerAgent = new InitializerAgent();
