import { prisma } from '../lib/prisma';
import { providerManager } from '../services/ai/provider.manager';
import { BaseAgentV2, AgentContext } from './base-agent-v2';
import { StorylineAgent } from './storyline-agent';
import { OutlineAgent } from './outline-agent';
import { DirectorAgent } from './director.agent';
import { StoryboardAgent } from './storyboard-agent';
import { emitProgress, emitTaskComplete, emitTaskError } from '../lib/websocket';
import logger from '../lib/logger';
import { auditService } from '../services/audit.service';

export interface WorkflowStep {
  agentName: string;
  input: string;
  dependsOn?: string[];
  timeout?: number;
  retryCount?: number;
}

export interface WorkflowConfig {
  steps: WorkflowStep[];
  parallelExecution?: boolean;
  onError: 'continue' | 'stop' | 'retry';
  maxRetries?: number;
}

export interface AgentMetrics {
  totalRequests: number;
  successRequests: number;
  failedRequests: number;
  averageExecutionTime: number;
  cacheHitRate: number;
}

export class MultiAgentOrchestratorV2 {
  private context: AgentContext;
  private agents: Map<string, BaseAgentV2> = new Map();
  private providerId: string;
  private workflowMetrics: Map<string, AgentMetrics> = new Map();
  private cache: Map<string, any> = new Map();

  constructor(projectId: string, taskId: string, userId: string) {
    this.context = {
      projectId,
      taskId,
      userId,
      conversationHistory: [],
      data: {},
      permissions: [],
    };

    this.providerId = '';
  }

  async initialize(): Promise<void> {
    try {
      const aiProviders = await prisma.aIProvider.findMany({
        where: { enabled: true },
      });

      if (aiProviders.length === 0) {
        throw new Error('没有可用的 AI 提供商');
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

      await this.loadUserPermissions();
      await this.initializeAgents();

      logger.info('Orchestrator initialized', {
        project_id: this.context.projectId,
        taskId: this.context.taskId,
        user_id: this.context.userId,
        providerId: this.providerId,
      });
    } catch (error) {
      throw error;
    }
  }

  private async loadUserPermissions(): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: this.context.userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      this.context.permissions = [];
    } catch (error) {
      logger.error('Failed to load user permissions', {
        user_id: this.context.userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  private async initializeAgents(): Promise<void> {
    this.agents.set('story', new StorylineAgent() as any);
    this.agents.set('outline', new OutlineAgent() as any);
    this.agents.set('director', new DirectorAgent() as any);
    this.agents.set('storyboard', new StoryboardAgent() as any);
  }

  async runWorkflow(config: WorkflowConfig): Promise<Record<string, any>> {
    const startTime = Date.now();

    try {
      const results: Record<string, any> = {};

      if (config.parallelExecution) {
        await this.runParallelWorkflow(config, results);
      } else {
        await this.runSequentialWorkflow(config, results);
      }

      const executionTime = Date.now() - startTime;

      emitTaskComplete(this.context.projectId, this.context.taskId, results);

      await auditService.log({
        userId: this.context.userId,
        action: 'workflow_completed',
        resource: 'workflow',
        metadata: {
          taskId: this.context.taskId,
          steps: config.steps.length,
          executionTime,
        },
      });

      logger.info('Workflow completed', {
        project_id: this.context.projectId,
        taskId: this.context.taskId,
        executionTime,
        steps: config.steps.length,
      });

      return results;
    } catch (error) {
      const executionTime = Date.now() - startTime;

      emitTaskError(this.context.projectId, this.context.taskId, error instanceof Error ? error.message : 'Unknown error');

      await auditService.log({
        userId: this.context.userId,
        action: 'workflow_failed',
        resource: 'workflow',
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          taskId: this.context.taskId,
          error: error instanceof Error ? error.message : 'Unknown error',
          executionTime,
        },
      });

      throw error;
    }
  }

  private async runSequentialWorkflow(
    config: WorkflowConfig,
    results: Record<string, any>
  ): Promise<void> {
    for (let i = 0; i < config.steps.length; i++) {
      const step = config.steps[i];
      await this.executeStep(step, results, config);
    }
  }

  private async runParallelWorkflow(
    config: WorkflowConfig,
    results: Record<string, any>
  ): Promise<void> {
    const dependencyGraph = this.buildDependencyGraph(config.steps);
    const executionOrder = this.topologicalSort(dependencyGraph);

    for (const batch of executionOrder) {
      const promises = batch.map(stepName => {
        const step = config.steps.find(s => s.agentName === stepName);
        return step ? this.executeStep(step, results, config) : Promise.resolve();
      });

      await Promise.all(promises);
    }
  }

  private buildDependencyGraph(steps: WorkflowStep[]): Map<string, string[]> {
    const graph = new Map<string, string[]>();

    steps.forEach(step => {
      graph.set(step.agentName, step.dependsOn || []);
    });

    return graph;
  }

  private topologicalSort(graph: Map<string, string[]>): string[][] {
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const batches: string[][] = [];
    const currentBatch: string[] = [];

    const visit = (node: string): void => {
      if (visited.has(node)) return;
      if (visiting.has(node)) {
        throw new Error('Circular dependency detected');
      }

      visiting.add(node);

      const dependencies = graph.get(node) || [];
      const allDependenciesVisited = dependencies.every(dep => visited.has(dep));

      if (allDependenciesVisited) {
        currentBatch.push(node);
        visited.add(node);
        visiting.delete(node);
      } else {
        dependencies.forEach(dep => visit(dep));
      }
    };

    graph.forEach((_, node) => {
      if (!visited.has(node)) {
        visit(node);
      }
    });

    batches.push(currentBatch);
    return batches;
  }

  private async executeStep(
    step: WorkflowStep,
    results: Record<string, any>,
    config: WorkflowConfig
  ): Promise<void> {
    const agent = this.agents.get(step.agentName);

    if (!agent) {
      throw new Error(`Unknown agent: ${step.agentName}`);
    }

    const retryCount = step.retryCount || config.maxRetries || 0;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retryCount; attempt++) {
      try {
        emitProgress(
          this.context.projectId,
          this.context.taskId,
          this.calculateProgress(step.agentName),
          `${step.agentName} 正在工作${attempt > 0 ? ` (重试 ${attempt}/${retryCount})` : ''}...`
        );

        const input = this.prepareAgentInput(step, results);
        const result = await agent.run(input, this.providerId);

        if (!result.success) {
          throw new Error(result.error || 'Agent execution failed');
        }

        results[step.agentName] = this.parseResult(result.content);
        this.updateAgentMetrics(step.agentName, result.metadata, true);

        break;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        this.updateAgentMetrics(step.agentName, null, false);

        if (attempt < retryCount) {
          await this.delay(1000 * (attempt + 1));
        } else {
          if (config.onError === 'continue') {
            results[step.agentName] = { error: lastError.message };
            logger.warn('Step failed but continuing', {
              agent: step.agentName,
              error: lastError.message,
            });
            break;
          } else {
            throw lastError;
          }
        }
      }
    }
  }

  private prepareAgentInput(step: WorkflowStep, previousResults: Record<string, any>): string {
    if (step.input) {
      return step.input;
    }

    switch (step.agentName) {
      case 'story':
        return '请分析小说原文，生成故事线';
      case 'outline':
        return `请根据以下故事线生成详细大纲：\n${JSON.stringify(previousResults.story, null, 2)}`;
      case 'director':
        return `请审核以下故事线和大纲：\n故事线：${JSON.stringify(previousResults.story, null, 2)}\n大纲：${JSON.stringify(previousResults.outline, null, 2)}`;
      case 'storyboard':
        return `请根据以下大纲生成分镜：\n${JSON.stringify(previousResults.outline, null, 2)}`;
      default:
        return '';
    }
  }

  private parseResult(content: string): any {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return { raw: content };
    } catch {
      return { raw: content };
    }
  }

  private calculateProgress(agentName: string): number {
    const agentOrder = ['story', 'outline', 'director', 'storyboard'];
    const index = agentOrder.indexOf(agentName);
    return index >= 0 ? ((index + 1) / agentOrder.length) * 100 : 0;
  }

  private updateAgentMetrics(agentName: string, metadata: any, success: boolean): void {
    if (!this.workflowMetrics.has(agentName)) {
      this.workflowMetrics.set(agentName, {
        totalRequests: 0,
        successRequests: 0,
        failedRequests: 0,
        averageExecutionTime: 0,
        cacheHitRate: 0,
      });
    }

    const metrics = this.workflowMetrics.get(agentName)!;
    metrics.totalRequests++;

    if (success && metadata) {
      metrics.successRequests++;
      const totalTime = metrics.averageExecutionTime * (metrics.successRequests - 1) + metadata.executionTime;
      metrics.averageExecutionTime = totalTime / metrics.successRequests;
      if (metadata.cached) {
        metrics.cacheHitRate = (metrics.cacheHitRate * (metrics.successRequests - 1) + 1) / metrics.successRequests;
      }
    } else {
      metrics.failedRequests++;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async chat(agentName: string, message: string): Promise<string> {
    await this.initialize();

    const agent = this.agents.get(agentName);
    if (!agent) {
      throw new Error(`Unknown agent: ${agentName}`);
    }

    const result = await agent.run(message, this.providerId);

    if (!result.success) {
      throw new Error(result.error || 'Agent execution failed');
    }

    return result.content;
  }

  getMetrics(): Record<string, AgentMetrics> {
    return Object.fromEntries(this.workflowMetrics);
  }

  async clearCache(): Promise<void> {
    this.cache.clear();
    logger.info('Agent cache cleared', {
      project_id: this.context.projectId,
    });
  }
}
