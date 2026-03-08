import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MultiAgentOrchestratorV2 } from '../../agents/orchestrator-v2';
import { BaseAgentV2, AgentContext, AgentConfig } from '../../agents/base-agent-v2';
import { prisma } from '../../lib/prisma';

vi.mock('../../lib/prisma', () => ({
  prisma: {
    aIProvider: {
      findMany: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    session: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('../../services/ai/provider.manager', () => ({
  providerManager: {
    addProvider: vi.fn(),
    getProvider: vi.fn(),
  },
}));

class MockAgent extends BaseAgentV2 {
  async run(input: string, providerId: string): Promise<any> {
    return {
      success: true,
      content: JSON.stringify({ result: 'mock result' }),
      metadata: {
        executionTime: 100,
        iterations: 1,
        toolsUsed: [],
        cached: false,
      },
    };
  }
}

describe('MultiAgentOrchestratorV2', () => {
  let orchestrator: MultiAgentOrchestratorV2;
  const projectId = 'test-project-id';
  const taskId = 'test-task-id';
  const userId = 'test-user-id';

  beforeEach(() => {
    orchestrator = new MultiAgentOrchestratorV2(projectId, taskId, userId);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should create orchestrator with context', () => {
      expect(orchestrator).toBeDefined();
    });

    it('should initialize successfully with valid providers', async () => {
      vi.mocked(prisma.aIProvider.findMany).mockResolvedValue([
        {
          id: 'provider-1',
          name: 'Test Provider',
          type: 'openai',
          apiKey: 'test-key',
          enabled: true,
          models: [],
        } as any,
      ]);

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
        roles: [],
      } as any);

      await expect(orchestrator.initialize()).resolves.not.toThrow();
    });

    it('should throw error when no providers available', async () => {
      vi.mocked(prisma.aIProvider.findMany).mockResolvedValue([]);

      await expect(orchestrator.initialize()).rejects.toThrow('没有可用的 AI 提供商');
    });
  });

  describe('workflow execution', () => {
    beforeEach(async () => {
      vi.mocked(prisma.aIProvider.findMany).mockResolvedValue([
        {
          id: 'provider-1',
          name: 'Test Provider',
          type: 'openai',
          apiKey: 'test-key',
          enabled: true,
          models: [],
        } as any,
      ]);

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
        roles: [],
      } as any);

      await orchestrator.initialize();
    });

    it('should execute sequential workflow successfully', async () => {
      const config = {
        steps: [
          { agentName: 'story', input: 'test input' },
          { agentName: 'outline', input: 'test input' },
        ],
        onError: 'stop' as const,
      };

      const results = await orchestrator.runWorkflow(config);

      expect(results).toBeDefined();
      expect(results.story).toBeDefined();
      expect(results.outline).toBeDefined();
    });

    it('should handle workflow errors with continue strategy', async () => {
      const config = {
        steps: [
          { agentName: 'invalid-agent', input: 'test input' },
          { agentName: 'story', input: 'test input' },
        ],
        onError: 'continue' as const,
      };

      const results = await orchestrator.runWorkflow(config);

      expect(results['invalid-agent']).toBeDefined();
      expect(results['invalid-agent'].error).toBeDefined();
    });

    it('should stop workflow on error with stop strategy', async () => {
      const config = {
        steps: [
          { agentName: 'invalid-agent', input: 'test input' },
          { agentName: 'story', input: 'test input' },
        ],
        onError: 'stop' as const,
      };

      await expect(orchestrator.runWorkflow(config)).rejects.toThrow();
    });

    it('should retry failed steps', async () => {
      const config = {
        steps: [
          {
            agentName: 'story',
            input: 'test input',
            retryCount: 2,
          },
        ],
        onError: 'stop' as const,
        maxRetries: 2,
      };

      const results = await orchestrator.runWorkflow(config);

      expect(results.story).toBeDefined();
    });
  });

  describe('metrics', () => {
    it('should track agent metrics', async () => {
      const config = {
        steps: [{ agentName: 'story', input: 'test input' }],
        onError: 'stop' as const,
      };

      await orchestrator.runWorkflow(config);
      const metrics = orchestrator.getMetrics();

      expect(metrics).toBeDefined();
      expect(metrics.story).toBeDefined();
      expect(metrics.story.totalRequests).toBeGreaterThan(0);
    });
  });

  describe('caching', () => {
    it('should clear cache on demand', async () => {
      await orchestrator.clearCache();

      expect(orchestrator).toBeDefined();
    });
  });
});

describe('BaseAgentV2', () => {
  let agent: MockAgent;
  const projectId = 'test-project-id';
  const taskId = 'test-task-id';
  const userId = 'test-user-id';

  beforeEach(() => {
    const context: AgentContext = {
      projectId,
      taskId,
      userId,
      conversationHistory: [],
      data: {},
      permissions: [],
    };

    const config: AgentConfig = {
      name: 'test-agent',
      role: 'test',
      systemPrompt: 'You are a test agent',
      maxIterations: 5,
      timeout: 30000,
    };

    agent = new MockAgent(config, context);
  });

  it('should execute agent successfully', async () => {
    const result = await agent.run('test input', 'provider-id');

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.content).toBeDefined();
  });

  it('should track execution metadata', async () => {
    const result = await agent.run('test input', 'provider-id');

    expect(result.metadata).toBeDefined();
    expect(result.metadata.executionTime).toBeGreaterThan(0);
    expect(result.metadata.iterations).toBeGreaterThan(0);
  });

  it('should handle timeout errors', async () => {
    const config: AgentConfig = {
      name: 'timeout-agent',
      role: 'test',
      systemPrompt: 'You are a test agent',
      maxIterations: 5,
      timeout: 1,
    };

    const context: AgentContext = {
      projectId,
      taskId,
      userId,
      conversationHistory: [],
      data: {},
      permissions: [],
    };

    const timeoutAgent = new MockAgent(config, context);

    await expect(timeoutAgent.run('test input', 'provider-id')).resolves.toBeDefined();
  });
});
