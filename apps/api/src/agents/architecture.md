# Agent System Architecture

## Overview

The agent system provides AI-powered content generation for video production workflows, supporting multiple specialized agents (Story, Outline, Director, Storyboard) with modular, extensible architecture.

## Core Principles

1. **Modularity**: Each agent is independent and reusable
2. **Scalability**: Horizontal scaling through provider abstraction
3. **Security**: Data encryption, access controls, audit logging
4. **Observability**: Comprehensive logging, metrics, error tracking
5. **Maintainability**: Clear separation of concerns, testable design

## Architecture Layers

```
┌─────────────────────────────────────────┐
│         API Layer (Routes)            │
│  - agent.routes.ts                   │
│  - agent-stream.routes.ts             │
└──────────────┬────────────────────────┘
               │
┌──────────────▼────────────────────────┐
│      Orchestrator Layer               │
│  - MultiAgentOrchestrator            │
│  - Workflow management                │
│  - Agent coordination                 │
└──────────────┬────────────────────────┘
               │
┌──────────────▼────────────────────────┐
│       Agent Layer (BaseAgent)          │
│  - StoryAgent                        │
│  - OutlineAgent                      │
│  - DirectorAgent                     │
│  - StoryboardAgent                   │
└──────────────┬────────────────────────┘
               │
┌──────────────▼────────────────────────┐
│      Provider Layer                   │
│  - provider.manager                  │
│  - AI Provider interfaces             │
│  - Model selection                   │
└──────────────┬────────────────────────┘
               │
┌──────────────▼────────────────────────┐
│      Data Layer                      │
│  - Prisma ORM                       │
│  - Database models                   │
│  - Cache layer                      │
└───────────────────────────────────────┘
```

## Component Design

### 1. BaseAgent (Abstract Class)

```typescript
abstract class BaseAgent {
  protected config: AgentConfig;
  protected context: AgentContext;
  
  abstract run(input: string, providerId: string): Promise<string>;
  protected formatTools(tools: AgentTool[]): any;
  protected emitProgress(progress: number, message: string): void;
}
```

**Responsibilities**:
- Common agent logic (message building, iteration management)
- Tool formatting and execution
- Progress emission
- Error handling base

### 2. Specialized Agents

Each agent extends BaseAgent with specific:
- System prompt (from prompts/agents/index.ts)
- Tool definitions (database operations)
- Max iterations (tuned per agent)
- Response parsing logic

### 3. MultiAgentOrchestrator

**Responsibilities**:
- Agent lifecycle management
- Workflow orchestration
- Context sharing between agents
- Provider initialization
- Error aggregation

### 4. ProviderManager

**Responsibilities**:
- Provider registration and retrieval
- Model management
- API key security
- Request routing

## Data Flow

### Request Flow

```
User Request
    ↓
API Route (authentication, validation)
    ↓
Orchestrator (workflow setup, provider init)
    ↓
Agent.run() (message building, tool execution)
    ↓
Provider.chat() (AI API call)
    ↓
Response parsing and validation
    ↓
Database persistence
    ↓
WebSocket progress updates
    ↓
Response to user
```

### Error Handling Flow

```
Error occurs
    ↓
Agent catches and logs error
    ↓
Error middleware processes
    ↓
Sentry error tracking
    ↓
User receives structured error response
    ↓
Audit log entry created
```

## Security Architecture

### 1. Authentication & Authorization

- JWT-based authentication via authMiddleware
- Role-based access control
- Project-level permissions

### 2. Data Protection

```typescript
// Encryption service for sensitive data
class EncryptionService {
  encrypt(text: string): string;
  decrypt(encrypted: string): string;
}

// API key management
class SecretManager {
  getProviderKey(providerId: string): string;
  rotateKey(providerId: string): Promise<void>;
}
```

### 3. Audit Logging

All agent operations are logged with:
- User ID
- Project ID
- Agent type
- Operation details
- Timestamp
- Result status

## Scalability Considerations

### 1. Provider Abstraction

```typescript
interface AIProvider {
  chat(messages: Message[], options?: ChatOptions): Promise<ChatResponse>;
  streamChat(messages: Message[], options?: ChatOptions, onChunk: (chunk: string) => void): Promise<StreamResponse>;
}

class OpenAIProvider implements AIProvider { }
class ZhipuProvider implements AIProvider { }
class GoogleProvider implements AIProvider { }
```

### 2. Caching Strategy

```typescript
class CacheService {
  async get<T>(key: string): Promise<T | null>;
  async set<T>(key: string, value: T, ttl?: number): Promise<void>;
  async invalidate(pattern: string): Promise<void>;
}

// Cache AI responses for identical prompts
const cacheKey = `agent:${agentName}:${hash(prompt)}`;
const cached = await cache.get(cacheKey);
```

### 3. Queue Management

```typescript
class TaskQueue {
  async enqueue(task: AgentTask): Promise<string>;
  async dequeue(taskId: string): Promise<AgentTask | null>;
  async getStatus(taskId: string): Promise<TaskStatus>;
}
```

## Performance Optimization

### 1. Streaming Responses

- Real-time progress updates via WebSocket
- Chunked AI responses
- Early feedback to users

### 2. Parallel Processing

```typescript
async function runParallelAgents(agents: Agent[]): Promise<Result[]> {
  return Promise.all(agents.map(agent => agent.run()));
}
```

### 3. Resource Management

```typescript
class ResourcePool {
  private providers: Map<string, AIProvider>;
  private rateLimits: Map<string, RateLimiter>;
  
  async acquire(providerId: string): Promise<AIProvider>;
  release(providerId: string): void;
}
```

## Monitoring & Observability

### 1. Metrics

```typescript
// Custom metrics
metrics.increment('agent.request.count', { agent: agentName });
metrics.timing('agent.request.duration', duration, { agent: agentName });
metrics.gauge('agent.active.count', activeAgents.length);
```

### 2. Logging

```typescript
logger.info('Agent execution started', {
  agent: agentName,
  projectId,
  taskId,
  userId,
});

logger.error('Agent execution failed', {
  agent: agentName,
  error: error.message,
  stack: error.stack,
  context: { projectId, taskId },
});
```

### 3. Tracing

```typescript
// Distributed tracing
const span = tracer.startSpan('agent.execute', {
  attributes: {
    'agent.name': agentName,
    'project.id': projectId,
  },
});

try {
  const result = await agent.run(input);
  span.setStatus({ code: SpanStatusCode.OK });
  return result;
} catch (error) {
  span.recordException(error);
  span.setStatus({ code: SpanStatusCode.ERROR });
  throw error;
} finally {
  span.end();
}
```

## Testing Strategy

### 1. Unit Tests

```typescript
describe('StoryAgent', () => {
  it('should generate storyline from input', async () => {
    const agent = StoryAgent.create(mockContext);
    const result = await agent.run('test input', 'provider-id');
    expect(result).toBeDefined();
    expect(result).toMatchObject(expectedFormat);
  });
});
```

### 2. Integration Tests

```typescript
describe('Agent Workflow', () => {
  it('should execute full workflow end-to-end', async () => {
    const orchestrator = new MultiAgentOrchestrator(projectId, taskId, userId);
    await orchestrator.initialize();
    const results = await orchestrator.runWorkflow(['story', 'outline']);
    expect(results.story).toBeDefined();
    expect(results.outline).toBeDefined();
  });
});
```

### 3. Load Tests

```typescript
// Performance testing under load
describe('Agent Performance', () => {
  it('should handle 100 concurrent requests', async () => {
    const requests = Array(100).fill(null).map(() =>
      orchestrator.chat('story', 'test input')
    );
    const results = await Promise.all(requests);
    expect(results.length).toBe(100);
  });
});
```

## Future Enhancements

### 1. Agent Marketplace

- Plugin system for custom agents
- Agent versioning
- Agent sharing between projects

### 2. Multi-Modal Support

- Image input/output
- Audio processing
- Video understanding

### 3. Advanced Features

- Agent collaboration and negotiation
- Context-aware prompt optimization
- Automatic agent selection based on task type
