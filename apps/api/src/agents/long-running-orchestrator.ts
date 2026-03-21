import { prisma } from '../lib/prisma';
import { providerManager } from '../services/ai/provider.manager';
import { initializerAgent, InitializerOptions, InitializerResult } from './initializer.agent';
import { codingAgent, CodingSessionOptions, CodingSessionResult } from './coding.agent';
import { progressTrackingService, Feature } from '../services/progress-tracking.service';
import { emitProgress, emitTaskComplete, emitTaskError } from '../lib/websocket';
import logger from '../lib/logger';

export interface OrchestratorConfig {
  project_id: string;
  user_id: string;
  provider_id?: string;
  workspace_path?: string;
  create_git_commits?: boolean;
}

export interface InitializeProjectInput {
  task_description: string;
  project_context?: string;
  technologies?: string[];
  constraints?: string[];
  existing_features?: string[];
}

export interface RunCodingSessionInput {
  max_features?: number;
  session_notes?: string;
}

export interface ProjectStatus {
  initialized: boolean;
  total_features: number;
  completed_features: number;
  progress_percentage: number;
  last_session?: any;
  available_features: Feature[];
  in_progress_features: Feature[];
  next_features: Feature[];
}

export class LongRunningOrchestrator {
  private config: OrchestratorConfig;
  private providerId: string;

  constructor(config: OrchestratorConfig) {
    this.config = config;
    this.providerId = '';
  }

  async initialize(): Promise<void> {
    try {
      const providerId = this.config.provider_id;

      if (providerId) {
        const aiProviders = await prisma.aIProvider.findMany({
          where: { enabled: true },
        });

        const provider = aiProviders.find(p => p.id === providerId);

        if (provider) {
          this.providerId = provider.id;

          providerManager.addProvider({
            id: provider.id,
            name: provider.type,
            type: provider.type,
            apiKey: provider.api_key,
            baseUrl: provider.base_url || undefined,
          });
        } else {
          throw new Error(`Provider not found: ${providerId}`);
        }
      } else {
        const aiProviders = await prisma.aIProvider.findMany({
          where: { enabled: true },
        });

        if (aiProviders.length === 0) {
          throw new Error('No AI providers available');
        }

        const provider = aiProviders[0];
        this.providerId = provider.id;

        providerManager.addProvider({
          id: provider.id,
          name: provider.type,
          type: provider.type,
          apiKey: provider.api_key,
          baseUrl: provider.base_url || undefined,
        });
      }

      logger.info('Long Running Orchestrator initialized', {
        project_id: this.config.project_id,
        user_id: this.config.user_id,
        provider_id: this.providerId,
      });
    } catch (error) {
      logger.error('Failed to initialize orchestrator', {
        project_id: this.config.project_id,
        user_id: this.config.user_id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async startNewProject(input: InitializeProjectInput, taskId: string): Promise<InitializerResult> {
    await this.ensureInitialized();

    try {
      logger.info('Starting new project', {
        project_id: this.config.project_id,
        task_description: input.task_description,
      });

      emitProgress(
        this.config.project_id,
        taskId,
        10,
        'Initializing project...'
      );

      const initializerOptions: InitializerOptions = {
        project_id: this.config.project_id,
        task_description: input.task_description,
        project_context: input.project_context,
        technologies: input.technologies,
        constraints: input.constraints,
        existing_features: input.existing_features,
        provider_id: this.providerId,
        create_git_commit: this.config.create_git_commits,
        workspace_path: this.config.workspace_path,
      };

      const result = await initializerAgent.initializeProject(initializerOptions);

      emitProgress(
        this.config.project_id,
        taskId,
        100,
        'Project initialized successfully'
      );

      emitTaskComplete(this.config.project_id, taskId, result);

      logger.info('New project started', {
        project_id: this.config.project_id,
        features_generated: result.features_generated,
        session_id: result.session_id,
      });

      return result;
    } catch (error) {
      logger.error('Failed to start new project', {
        project_id: this.config.project_id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      emitTaskError(
        this.config.project_id,
        taskId,
        error instanceof Error ? error.message : 'Unknown error'
      );

      throw error;
    }
  }

  async runCodingSession(input: RunCodingSessionInput, taskId: string): Promise<CodingSessionResult> {
    await this.ensureInitialized();

    try {
      const status = await this.getProjectStatus();

      if (!status.initialized) {
        throw new Error('Project not initialized. Call startNewProject first.');
      }

      logger.info('Running coding session', {
        project_id: this.config.project_id,
        task_id: taskId,
      });

      emitProgress(
        this.config.project_id,
        taskId,
        5,
        'Starting coding session...'
      );

      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const codingOptions: CodingSessionOptions = {
        project_id: this.config.project_id,
        task_id: sessionId,
        user_id: this.config.user_id,
        provider_id: this.providerId,
        max_features: input.max_features,
        session_notes: input.session_notes,
        workspace_path: this.config.workspace_path,
        create_git_commit: this.config.create_git_commits,
      };

      const result = await codingAgent.runCodingSession(codingOptions);

      emitProgress(
        this.config.project_id,
        taskId,
        100,
        'Coding session completed'
      );

      emitTaskComplete(this.config.project_id, taskId, result);

      logger.info('Coding session completed', {
        project_id: this.config.project_id,
        session_id: result.session_id,
        features_completed: result.features_completed.length,
        execution_time: result.execution_time,
      });

      return result;
    } catch (error) {
      logger.error('Failed to run coding session', {
        project_id: this.config.project_id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      emitTaskError(
        this.config.project_id,
        taskId,
        error instanceof Error ? error.message : 'Unknown error'
      );

      throw error;
    }
  }

  async getProjectStatus(): Promise<ProjectStatus> {
    try {
      const initStatus = await initializerAgent.getInitializationStatus(this.config.project_id);

      if (!initStatus.initialized) {
        return {
          initialized: false,
          total_features: 0,
          completed_features: 0,
          progress_percentage: 0,
          available_features: [],
          in_progress_features: [],
          next_features: [],
        };
      }

      const progressData = await progressTrackingService.getProgress(this.config.project_id);
      const nextFeatures = await progressTrackingService.getNextFeaturesToImplement(this.config.project_id, 10);
      const inProgressFeatures = await progressTrackingService.getInProgressFeatures(this.config.project_id);
      const availableFeatures = progressData.features.filter(f => f.status === 'failing');

      return {
        initialized: true,
        total_features: progressData.total_features,
        completed_features: progressData.completed_features,
        progress_percentage: progressData.progress_percentage,
        last_session: initStatus.last_session,
        available_features: availableFeatures,
        in_progress_features: inProgressFeatures,
        next_features: nextFeatures,
      };
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        return {
          initialized: false,
          total_features: 0,
          completed_features: 0,
          progress_percentage: 0,
          available_features: [],
          in_progress_features: [],
          next_features: [],
        };
      }

      logger.error('Failed to get project status', {
        project_id: this.config.project_id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async getProgressReport(format: 'json' | 'txt' = 'json'): Promise<string> {
    try {
      return await progressTrackingService.exportProgress(this.config.project_id, format);
    } catch (error) {
      logger.error('Failed to get progress report', {
        project_id: this.config.project_id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async getRecentSessions(limit: number = 10): Promise<any[]> {
    try {
      return await progressTrackingService.getRecentSessions(this.config.project_id, limit);
    } catch (error) {
      logger.error('Failed to get recent sessions', {
        project_id: this.config.project_id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async getFeature(featureId: string): Promise<Feature | null> {
    try {
      return await progressTrackingService.getFeature(this.config.project_id, featureId);
    } catch (error) {
      logger.error('Failed to get feature', {
        project_id: this.config.project_id,
        feature_id: featureId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async updateFeatureStatus(
    featureId: string,
    status: Feature['status'],
    notes?: string
  ): Promise<void> {
    try {
      await progressTrackingService.updateFeatureStatus(
        this.config.project_id,
        featureId,
        status,
        notes
      );

      logger.info('Feature status updated', {
        project_id: this.config.project_id,
        feature_id: featureId,
        status: status,
      });
    } catch (error) {
      logger.error('Failed to update feature status', {
        project_id: this.config.project_id,
        feature_id: featureId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async resumeProject(taskId: string): Promise<{
    progress: any;
    next_features: Feature[];
    in_progress_features: Feature[];
    recent_sessions: any[];
  }> {
    try {
      return await initializerAgent.resumeProject(this.config.project_id, taskId);
    } catch (error) {
      logger.error('Failed to resume project', {
        project_id: this.config.project_id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async deleteProject(): Promise<void> {
    try {
      await progressTrackingService.deleteProgress(this.config.project_id);

      logger.info('Project deleted', {
        project_id: this.config.project_id,
      });
    } catch (error) {
      logger.error('Failed to delete project', {
        project_id: this.config.project_id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async runAutoSession(taskId: string, maxIterations: number = 10): Promise<{
    iterations_completed: number;
    total_features_completed: number;
    session_results: CodingSessionResult[];
    final_status: ProjectStatus;
  }> {
    await this.ensureInitialized();

    const sessionResults: CodingSessionResult[] = [];
    let iteration = 0;

    logger.info('Starting auto session', {
      project_id: this.config.project_id,
      max_iterations: maxIterations,
    });

    while (iteration < maxIterations) {
      iteration++;

      emitProgress(
        this.config.project_id,
        taskId,
        (iteration / maxIterations) * 100,
        `Auto iteration ${iteration}/${maxIterations}`
      );

      try {
        const status = await this.getProjectStatus();

        if (status.available_features.length === 0 && status.in_progress_features.length === 0) {
          logger.info('No more features to implement - project complete', {
            project_id: this.config.project_id,
          });
          break;
        }

        const sessionResult = await this.runCodingSession(
          {
            max_features: 2,
            session_notes: `Auto session iteration ${iteration}`,
          },
          taskId
        );

        sessionResults.push(sessionResult);

        if (sessionResult.features_completed.length === 0) {
          logger.warn('No features completed in session, stopping auto session', {
            project_id: this.config.project_id,
            iteration: iteration,
          });
          break;
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        logger.error('Auto session iteration failed', {
          project_id: this.config.project_id,
          iteration: iteration,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        break;
      }
    }

    const finalStatus = await this.getProjectStatus();
    const totalFeaturesCompleted = sessionResults.reduce(
      (sum, result) => sum + result.features_completed.length,
      0
    );

    logger.info('Auto session completed', {
      project_id: this.config.project_id,
      iterations_completed: iteration,
      total_features_completed,
      final_progress: finalStatus.progress_percentage,
    });

    return {
      iterations_completed: iteration,
      total_features_completed,
      session_results: sessionResults,
      final_status: finalStatus,
    };
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.providerId) {
      await this.initialize();
    }
  }
}

export async function createLongRunningOrchestrator(config: OrchestratorConfig): Promise<LongRunningOrchestrator> {
  const orchestrator = new LongRunningOrchestrator(config);
  await orchestrator.initialize();
  return orchestrator;
}
