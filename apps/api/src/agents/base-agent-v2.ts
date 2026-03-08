import { providerManager } from '../services/ai/provider.manager';
import { emitProgress, emitStreamChunk, emitTaskError as _emitTaskError } from '../lib/websocket';
import { encrypt, decrypt } from '../lib/encryption';
import logger from '../lib/logger';

export interface AgentMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  name?: string;
}

export interface AgentTool {
  name: string;
  description: string;
  parameters: any;
  execute: (params: any, context: AgentContext) => Promise<any>;
  requiresPermission?: string;
}

export interface AgentContext {
  projectId: string;
  taskId: string;
  userId: string;
  conversationHistory: AgentMessage[];
  data: Record<string, any>;
  permissions: string[];
}

export interface AgentConfig {
  name: string;
  role: string;
  systemPrompt: string;
  tools?: AgentTool[];
  maxIterations?: number;
  timeout?: number;
  retryCount?: number;
  cacheEnabled?: boolean;
}

export interface AgentResult {
  success: boolean;
  content: string;
  metadata: {
    executionTime: number;
    iterations: number;
    toolsUsed: string[];
    cached: boolean;
  };
  error?: string;
}

export abstract class BaseAgentV2 {
  protected config: AgentConfig;
  protected context: AgentContext;
  protected executionStartTime: number;
  protected toolsUsed: string[] = [];
  protected iterations: number = 0;

  constructor(config: AgentConfig, context: AgentContext) {
    this.config = config;
    this.context = context;
    this.executionStartTime = Date.now();
  }

  async run(input: string, providerId: string): Promise<AgentResult> {
    try {
      logger.info('Agent execution started', {
        agent: this.config.name,
        project_id: this.context.projectId,
        taskId: this.context.taskId,
        user_id: this.context.userId,
      });

      const result = await this.executeAgent(input, providerId);

      const executionTime = Date.now() - this.executionStartTime;

      logger.info('Agent execution completed', {
        agent: this.config.name,
        taskId: this.context.taskId,
        executionTime,
        iterations: this.iterations,
        toolsUsed: this.toolsUsed,
      });

      return {
        success: true,
        content: result,
        metadata: {
          executionTime,
          iterations: this.iterations,
          toolsUsed: this.toolsUsed,
          cached: false,
        },
      };
    } catch (error) {
      const executionTime = Date.now() - this.executionStartTime;

      logger.error('Agent execution failed', {
        agent: this.config.name,
        taskId: this.context.taskId,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        executionTime,
      });

      _emitTaskError(this.context.projectId, this.context.taskId, error instanceof Error ? error.message : 'Unknown error');

      return {
        success: false,
        content: '',
        metadata: {
          executionTime,
          iterations: this.iterations,
          toolsUsed: this.toolsUsed,
          cached: false,
        },
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async executeAgent(input: string, providerId: string): Promise<string> {
    const messages: AgentMessage[] = [
      { role: 'system', content: this.config.systemPrompt },
      ...this.context.conversationHistory,
      { role: 'user', content: input },
    ];

    const maxIterations = this.config.maxIterations || 10;
    const timeout = this.config.timeout || 300000;

    while (this.iterations < maxIterations) {
      this.iterations++;

      const chatOptions: any = {};
      if (this.config.tools) {
        chatOptions.tools = this.formatTools(this.config.tools);
      }

      const provider = providerManager.getProvider(providerId);
      if (!provider) {
        throw new Error(`Provider not found: ${providerId}`);
      }

      const response = await this.withTimeout(
        provider.chat(messages, chatOptions),
        timeout
      );

      const assistantMessage = response.content;
      messages.push({ role: 'assistant', content: assistantMessage });

      const responseAny = response as any;
      if (responseAny.toolCalls && responseAny.toolCalls.length > 0) {
        for (const toolCall of responseAny.toolCalls) {
          const tool = this.config.tools?.find(t => t.name === toolCall.function.name);
          if (tool) {
            if (tool.requiresPermission && !this.context.permissions.includes(tool.requiresPermission)) {
              throw new Error(`Permission denied for tool: ${tool.name}`);
            }

            try {
              const params = JSON.parse(toolCall.function.arguments);
              const result = await tool.execute(params, this.context);
              this.toolsUsed.push(tool.name);

              messages.push({
                role: 'user',
                content: `Tool ${toolCall.function.name} result: ${JSON.stringify(result)}`,
              });

              emitProgress(
                this.context.projectId,
                this.context.taskId,
                this.iterations * 10,
                `执行工具: ${tool.name}`
              );
            } catch (error) {
              messages.push({
                role: 'user',
                content: `Tool ${toolCall.function.name} error: ${error instanceof Error ? error.message : 'Unknown error'}`,
              });
            }
          }
        }
      } else {
        this.context.conversationHistory = messages.slice(1, -1);
        return assistantMessage;
      }
    }

    throw new Error('Max iterations reached');
  }

  private async withTimeout<T>(promise: Promise<T>, timeout: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('Agent execution timeout')), timeout)
      ),
    ]);
  }

  protected formatTools(tools: AgentTool[]): any {
    return {
      type: 'function',
      functions: tools.map(tool => ({
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      })),
    };
  }

  protected emitProgress(progress: number, message: string): void {
    emitProgress(this.context.projectId, this.context.taskId, progress, message);
  }

  protected emitStreamChunk(chunk: string, done: boolean = false): void {
    emitStreamChunk(this.context.projectId, this.context.taskId, chunk, done);
  }

  protected encryptSensitiveData(data: string): string {
    return encrypt(data);
  }

  protected decryptSensitiveData(encrypted: string): string {
    return decrypt(encrypted);
  }
}
