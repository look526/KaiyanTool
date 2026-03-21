import { Request, Response } from 'express';
import { createLongRunningOrchestrator, LongRunningOrchestrator, OrchestratorConfig } from '../agents/long-running-orchestrator';
import logger from '../lib/logger';

const orchestrators = new Map<string, LongRunningOrchestrator>();

export class LongRunningAgentController {
  async initializeProject(req: Request, res: Response) {
    try {
      const { project_id, user_id } = req.params;
      const { task_description, project_context, technologies, constraints, existing_features, provider_id, workspace_path, create_git_commits } = req.body;

      if (!task_description) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_TASK_DESCRIPTION',
            message: 'task_description is required',
          },
        });
        return;
      }

      const config: OrchestratorConfig = {
        project_id,
        user_id,
        provider_id,
        workspace_path,
        create_git_commits,
      };

      const orchestrator = await createLongRunningOrchestrator(config);
      orchestrators.set(project_id, orchestrator);

      const taskId = req.body.task_id || `init_${Date.now()}`;

      const result = await orchestrator.startNewProject(
        {
          task_description,
          project_context,
          technologies,
          constraints,
          existing_features,
        },
        taskId
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Failed to initialize project', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      res.status(500).json({
        success: false,
        error: {
          code: 'INITIALIZATION_FAILED',
          message: 'Failed to initialize project',
        },
      });
    }
  }

  async runCodingSession(req: Request, res: Response) {
    try {
      const { project_id, user_id } = req.params;
      const { max_features, session_notes, task_id } = req.body;

      const orchestrator = orchestrators.get(project_id);

      if (!orchestrator) {
        res.status(404).json({
          success: false,
          error: {
            code: 'ORCHESTRATOR_NOT_FOUND',
            message: 'Orchestrator not found for this project. Initialize project first.',
          },
        });
        return;
      }

      const taskId = task_id || `session_${Date.now()}`;

      const result = await orchestrator.runCodingSession(
        {
          max_features,
          session_notes,
        },
        taskId
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Failed to run coding session', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      res.status(500).json({
        success: false,
        error: {
          code: 'CODING_SESSION_FAILED',
          message: 'Failed to run coding session',
        },
      });
    }
  }

  async getProjectStatus(req: Request, res: Response) {
    try {
      const { project_id } = req.params;

      const orchestrator = orchestrators.get(project_id);

      if (!orchestrator) {
        res.status(404).json({
          success: false,
          error: {
            code: 'ORCHESTRATOR_NOT_FOUND',
            message: 'Orchestrator not found for this project.',
          },
        });
        return;
      }

      const status = await orchestrator.getProjectStatus();

      res.json({
        success: true,
        data: status,
      });
    } catch (error) {
      logger.error('Failed to get project status', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_STATUS_FAILED',
          message: 'Failed to get project status',
        },
      });
    }
  }

  async getProgressReport(req: Request, res: Response) {
    try {
      const { project_id } = req.params;
      const { format } = req.query;

      const orchestrator = orchestrators.get(project_id);

      if (!orchestrator) {
        res.status(404).json({
          success: false,
          error: {
            code: 'ORCHESTRATOR_NOT_FOUND',
            message: 'Orchestrator not found for this project.',
          },
        });
        return;
      }

      const report = await orchestrator.getProgressReport((format as 'json' | 'txt') || 'json');

      if (format === 'txt') {
        res.setHeader('Content-Type', 'text/plain');
        res.send(report);
      } else {
        res.json({
          success: true,
          data: report,
        });
      }
    } catch (error) {
      logger.error('Failed to get progress report', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_REPORT_FAILED',
          message: 'Failed to get progress report',
        },
      });
    }
  }

  async getRecentSessions(req: Request, res: Response) {
    try {
      const { project_id } = req.params;
      const { limit } = req.query;

      const orchestrator = orchestrators.get(project_id);

      if (!orchestrator) {
        res.status(404).json({
          success: false,
          error: {
            code: 'ORCHESTRATOR_NOT_FOUND',
            message: 'Orchestrator not found for this project.',
          },
        });
        return;
      }

      const sessions = await orchestrator.getRecentSessions(limit ? parseInt(limit as string, 10) : 10);

      res.json({
        success: true,
        data: sessions,
      });
    } catch (error) {
      logger.error('Failed to get recent sessions', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_SESSIONS_FAILED',
          message: 'Failed to get recent sessions',
        },
      });
    }
  }

  async getFeature(req: Request, res: Response) {
    try {
      const { project_id, feature_id } = req.params;

      const orchestrator = orchestrators.get(project_id);

      if (!orchestrator) {
        res.status(404).json({
          success: false,
          error: {
            code: 'ORCHESTRATOR_NOT_FOUND',
            message: 'Orchestrator not found for this project.',
          },
        });
        return;
      }

      const feature = await orchestrator.getFeature(feature_id);

      if (!feature) {
        res.status(404).json({
          success: false,
          error: {
            code: 'FEATURE_NOT_FOUND',
            message: 'Feature not found.',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: feature,
      });
    } catch (error) {
      logger.error('Failed to get feature', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_FEATURE_FAILED',
          message: 'Failed to get feature',
        },
      });
    }
  }

  async updateFeatureStatus(req: Request, res: Response) {
    try {
      const { project_id, feature_id } = req.params;
      const { status, notes } = req.body;

      if (!status || !['failing', 'passing', 'in_progress'].includes(status)) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_STATUS',
            message: 'status must be one of: failing, passing, in_progress',
          },
        });
        return;
      }

      const orchestrator = orchestrators.get(project_id);

      if (!orchestrator) {
        res.status(404).json({
          success: false,
          error: {
            code: 'ORCHESTRATOR_NOT_FOUND',
            message: 'Orchestrator not found for this project.',
          },
        });
        return;
      }

      await orchestrator.updateFeatureStatus(feature_id, status, notes);

      res.json({
        success: true,
        data: {
          feature_id,
          status,
          notes,
        },
      });
    } catch (error) {
      logger.error('Failed to update feature status', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      res.status(500).json({
        success: false,
        error: {
          code: 'UPDATE_STATUS_FAILED',
          message: 'Failed to update feature status',
        },
      });
    }
  }

  async resumeProject(req: Request, res: Response) {
    try {
      const { project_id } = req.params;
      const { task_id } = req.body;

      const orchestrator = orchestrators.get(project_id);

      if (!orchestrator) {
        res.status(404).json({
          success: false,
          error: {
            code: 'ORCHESTRATOR_NOT_FOUND',
            message: 'Orchestrator not found for this project.',
          },
        });
        return;
      }

      const taskId = task_id || `resume_${Date.now()}`;

      const result = await orchestrator.resumeProject(taskId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Failed to resume project', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      res.status(500).json({
        success: false,
        error: {
          code: 'RESUME_FAILED',
          message: 'Failed to resume project',
        },
      });
    }
  }

  async runAutoSession(req: Request, res: Response) {
    try {
      const { project_id } = req.params;
      const { max_iterations, task_id } = req.body;

      const orchestrator = orchestrators.get(project_id);

      if (!orchestrator) {
        res.status(404).json({
          success: false,
          error: {
            code: 'ORCHESTRATOR_NOT_FOUND',
            message: 'Orchestrator not found for this project.',
          },
        });
        return;
      }

      const taskId = task_id || `auto_${Date.now()}`;

      const result = await orchestrator.runAutoSession(
        taskId,
        max_iterations || 10
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Failed to run auto session', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      res.status(500).json({
        success: false,
        error: {
          code: 'AUTO_SESSION_FAILED',
          message: 'Failed to run auto session',
        },
      });
    }
  }

  async deleteProject(req: Request, res: Response) {
    try {
      const { project_id } = req.params;

      const orchestrator = orchestrators.get(project_id);

      if (!orchestrator) {
        res.status(404).json({
          success: false,
          error: {
            code: 'ORCHESTRATOR_NOT_FOUND',
            message: 'Orchestrator not found for this project.',
          },
        });
        return;
      }

      await orchestrator.deleteProject();
      orchestrators.delete(project_id);

      res.json({
        success: true,
        data: {
          project_id,
          deleted: true,
        },
      });
    } catch (error) {
      logger.error('Failed to delete project', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      res.status(500).json({
        success: false,
        error: {
          code: 'DELETE_FAILED',
          message: 'Failed to delete project',
        },
      });
    }
  }
}

export const longRunningAgentController = new LongRunningAgentController();
