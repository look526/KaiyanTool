# Long Running Agent System - 演示示例

## API 调用示例

### 1. 初始化新项目

```bash
curl -X POST http://localhost:3001/api/v1/long-running-agent/projects/my-project-123/users/user-456/initialize \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "task_description": "Build a modern task management application with team collaboration features",
    "project_context": "A web application for managing daily tasks, supporting team collaboration, due dates, and priority levels",
    "technologies": ["React", "Node.js", "PostgreSQL", "TypeScript", "TailwindCSS"],
    "constraints": [
      "Must follow SOLID principles",
      "Must have comprehensive unit tests",
      "Must be accessible (WCAG 2.1)",
      "Must use snake_case naming convention"
    ],
    "existing_features": [],
    "provider_id": "openai-provider",
    "create_git_commits": true
  }'
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "project_id": "my-project-123",
    "features_generated": 28,
    "progress_file_created": true,
    "git_commit_created": true,
    "session_id": "session_1234567890_abc123",
    "next_steps": [
      "Start with high-priority features that have no dependencies",
      "Review and prioritize the first 5 high-priority features",
      "Implement features incrementally, one or a few at a time",
      "Update feature status to 'in_progress' when starting work",
      "Update feature status to 'passing' when completed and tested"
    ]
  }
}
```

### 2. 运行编码会话

```bash
curl -X POST http://localhost:3001/api/v1/long-running-agent/projects/my-project-123/users/user-456/sessions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "max_features": 2,
    "session_notes": "Focus on authentication and user management features",
    "task_id": "session_1234567891_def456"
  }'
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "session_id": "coding_session_1234567891_abc456",
    "features_attempted": ["feature_1", "feature_2"],
    "features_completed": ["feature_1"],
    "features_in_progress": ["feature_2"],
    "files_modified": ["src/controllers/auth.controller.ts", "src/services/auth.service.ts", "src/middleware/auth.middleware.ts"],
    "total_iterations": 8,
    "execution_time": 125000,
    "next_steps": [
      "Complete feature_2 in next session",
      "Continue with next features (prioritized):",
      "  - [HIGH] A user can create a task",
      "  - [HIGH] A user can view task list",
      "Progress: 1/28 features completed (3.6%)"
    ],
    "session_notes": "Focus on authentication and user management features"
  }
}
```

### 3. 获取项目状态

```bash
curl -X GET http://localhost:3001/api/v1/long-running-agent/projects/my-project-123/status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "initialized": true,
    "total_features": 28,
    "completed_features": 12,
    "progress_percentage": 42.86,
    "last_session": {
      "session_id": "coding_session_1234567891_abc456",
      "timestamp": "2024-01-15T10:30:00.000Z",
      "agent_name": "coding-agent",
      "features_completed": ["feature_1"],
      "features_in_progress": ["feature_2"]
    },
    "available_features": [
      {
        "id": "feature_15",
        "description": "A user can filter tasks by priority",
        "status": "failing",
        "priority": "high"
      }
    ],
    "in_progress_features": [
      {
        "id": "feature_2",
        "description": "A user can logout",
        "status": "in_progress",
        "priority": "medium",
        "notes": "Partially implemented, needs testing"
      }
    ],
    "next_features": [
      {
        "id": "feature_15",
        "description": "A user can filter tasks by priority",
        "status": "failing",
        "priority": "high"
      }
    ]
  }
}
```

### 4. 获取进度报告

```bash
curl -X GET http://localhost:3001/api/v1/long-running-agent/projects/my-project-123/report?format=txt \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**响应示例（文本格式）：**
```
================================================================================
PROJECT: my-project-123
TASK: Build a modern task management application with team collaboration features
================================================================================

Progress: 12/28 features (42.9%)
Last Updated: 2024-01-15T10:30:00.000Z

--------------------------------------------------------------------------------
FEATURE STATUS
--------------------------------------------------------------------------------

✅ COMPLETED (12):
  [HIGH] A user can login with email and password
  [HIGH] A user can reset password via email
  [MEDIUM] A user can view profile settings
  ...

🔄 IN PROGRESS (1):
  [MEDIUM] A user can logout
     Note: Partially implemented, needs testing

❌ NOT STARTED (15):
  [HIGH] A user can create a task
  [HIGH] A user can view task list
  [HIGH] A user can edit task details
  ...

--------------------------------------------------------------------------------
RECENT SESSIONS
--------------------------------------------------------------------------------

Session 1: coding_session_1234567891_abc456
  Time: 2024-01-15T10:30:00.000Z
  Agent: coding-agent
  Features Completed: feature_1
  Notes: Focus on authentication and user management features
  Next Steps:
    - Complete feature_2 in next session
    - Continue with next features

================================================================================
```

### 5. 运行自动会话

```bash
curl -X POST http://localhost:3001/api/v1/long-running-agent/projects/my-project-123/auto \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "max_iterations": 5,
    "task_id": "auto_session_123"
  }'
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "iterations_completed": 5,
    "total_features_completed": 8,
    "session_results": [
      {
        "session_id": "coding_session_1234567891_abc456",
        "features_completed": ["feature_3", "feature_4"],
        "execution_time": 120000
      },
      {
        "session_id": "coding_session_1234567892_def789",
        "features_completed": ["feature_5", "feature_6"],
        "execution_time": 115000
      }
    ],
    "final_status": {
      "initialized": true,
      "total_features": 28,
      "completed_features": 20,
      "progress_percentage": 71.43,
      "available_features": 8,
      "in_progress_features": 0
    }
  }
}
```

## JavaScript/TypeScript 客户端示例

### 使用 fetch API

```typescript
class LongRunningAgentClient {
  private baseUrl: string;
  private token: string;

  constructor(baseUrl: string, token: string) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  private async request(
    method: string,
    path: string,
    body?: any
  ): Promise<any> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Request failed');
    }

    return response.json();
  }

  async initializeProject(params: {
    project_id: string;
    user_id: string;
    task_description: string;
    project_context?: string;
    technologies?: string[];
    constraints?: string[];
  }) {
    return this.request(
      'POST',
      `/api/v1/long-running-agent/projects/${params.project_id}/users/${params.user_id}/initialize`,
      params
    );
  }

  async runCodingSession(params: {
    project_id: string;
    user_id: string;
    max_features?: number;
    session_notes?: string;
  }) {
    return this.request(
      'POST',
      `/api/v1/long-running-agent/projects/${params.project_id}/users/${params.user_id}/sessions`,
      params
    );
  }

  async getProjectStatus(projectId: string) {
    return this.request(
      'GET',
      `/api/v1/long-running-agent/projects/${projectId}/status`
    );
  }

  async getProgressReport(projectId: string, format: 'json' | 'txt' = 'json') {
    return this.request(
      'GET',
      `/api/v1/long-running-agent/projects/${projectId}/report?format=${format}`
    );
  }

  async getRecentSessions(projectId: string, limit = 10) {
    return this.request(
      'GET',
      `/api/v1/long-running-agent/projects/${projectId}/sessions?limit=${limit}`
    );
  }

  async updateFeatureStatus(
    projectId: string,
    featureId: string,
    status: 'failing' | 'passing' | 'in_progress',
    notes?: string
  ) {
    return this.request(
      'PATCH',
      `/api/v1/long-running-agent/projects/${projectId}/features/${featureId}/status`,
      { status, notes }
    );
  }

  async runAutoSession(
    projectId: string,
    maxIterations = 10,
    taskId?: string
  ) {
    return this.request(
      'POST',
      `/api/v1/long-running-agent/projects/${projectId}/auto`,
      {
        max_iterations: maxIterations,
        task_id: taskId,
      }
    );
  }
}

const client = new LongRunningAgentClient(
  'http://localhost:3001',
  'your-auth-token'
);

async function buildTaskManagementApp() {
  try {
    const initResult = await client.initializeProject({
      project_id: 'task-app-123',
      user_id: 'user-456',
      task_description: 'Build a modern task management application',
      project_context: 'A web app for managing daily tasks with team collaboration',
      technologies: ['React', 'Node.js', 'PostgreSQL'],
      constraints: ['Must use TypeScript'],
    });

    console.log(`Initialized with ${initResult.data.features_generated} features`);

    for (let i = 0; i < 10; i++) {
      const sessionResult = await client.runCodingSession({
        project_id: 'task-app-123',
        user_id: 'user-456',
        max_features: 2,
        session_notes: `Session ${i + 1}`,
      });

      console.log(
        `Session ${i + 1}: ${sessionResult.data.features_completed.length} features completed`
      );

      const status = await client.getProjectStatus('task-app-123');
      console.log(`Progress: ${status.data.progress_percentage.toFixed(1)}%`);

      if (status.data.available_features.length === 0) {
        console.log('All features completed!');
        break;
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    const report = await client.getProgressReport('task-app-123', 'txt');
    console.log('\nFinal Progress Report:');
    console.log(report);
  } catch (error) {
    console.error('Error:', error);
  }
}

buildTaskManagementApp();
```

### 使用 React Hooks

```typescript
import { useState, useEffect } from 'react';

interface ProjectStatus {
  initialized: boolean;
  total_features: number;
  completed_features: number;
  progress_percentage: number;
  available_features: Feature[];
  in_progress_features: Feature[];
}

function useLongRunningAgent(projectId: string, token: string) {
  const [status, setStatus] = useState<ProjectStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializeProject = async (params: {
    task_description: string;
    project_context?: string;
    technologies?: string[];
  }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/v1/long-running-agent/projects/${projectId}/users/current/initialize`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(params),
        }
      );

      const data = await response.json();
      if (data.success) {
        await fetchStatus();
      } else {
        throw new Error(data.error?.message || 'Initialization failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const runCodingSession = async (params: {
    max_features?: number;
    session_notes?: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/v1/long-running-agent/projects/${projectId}/users/current/sessions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(params),
        }
      );

      const data = await response.json();
      if (data.success) {
        await fetchStatus();
      } else {
        throw new Error(data.error?.message || 'Session failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatus = async () => {
    try {
      const response = await fetch(
        `/api/v1/long-running-agent/projects/${projectId}/status`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setStatus(data.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch status');
    }
  };

  const runAutoSession = async (maxIterations = 10) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/v1/long-running-agent/projects/${projectId}/auto`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ max_iterations: maxIterations }),
        }
      );

      const data = await response.json();
      if (data.success) {
        await fetchStatus();
        return data.data;
      } else {
        throw new Error(data.error?.message || 'Auto session failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [projectId]);

  return {
    status,
    loading,
    error,
    initializeProject,
    runCodingSession,
    runAutoSession,
    refetch: fetchStatus,
  };
}

function ProjectDashboard({ projectId }: { projectId: string }) {
  const token = localStorage.getItem('token') || '';
  const {
    status,
    loading,
    error,
    initializeProject,
    runCodingSession,
    runAutoSession,
    refetch,
  } = useLongRunningAgent(projectId, token);

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (!status) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="project-dashboard">
      <h1>Project: {projectId}</h1>

      <div className="progress-section">
        <h2>Progress</h2>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${status.progress_percentage}%` }}
          />
        </div>
        <p>
          {status.completed_features} / {status.total_features} features (
          {status.progress_percentage.toFixed(1)}%)
        </p>
      </div>

      {!status.initialized ? (
        <button
          onClick={() =>
            initializeProject({
              task_description: 'Build a task management app',
            })
          }
          disabled={loading}
        >
          Initialize Project
        </button>
      ) : (
        <>
          <div className="actions-section">
            <button
              onClick={() => runCodingSession({ max_features: 2 })}
              disabled={loading}
            >
              Run Coding Session
            </button>
            <button
              onClick={() => runAutoSession(10)}
              disabled={loading}
            >
              Run Auto Session (10 iterations)
            </button>
            <button onClick={refetch} disabled={loading}>
              Refresh
            </button>
          </div>

          <div className="features-section">
            <h3>Available Features ({status.available_features.length})</h3>
            <ul>
              {status.available_features.slice(0, 5).map(feature => (
                <li key={feature.id}>
                  [{feature.priority.toUpperCase()}] {feature.description}
                </li>
              ))}
            </ul>
          </div>

          <div className="in-progress-section">
            <h3>In Progress ({status.in_progress_features.length})</h3>
            <ul>
              {status.in_progress_features.map(feature => (
                <li key={feature.id}>
                  {feature.description}
                  {feature.notes && <p>{feature.notes}</p>}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
```

## 完整工作流程示例

### 从零开始构建一个 Web 应用

```typescript
async function buildWebAppFromScratch() {
  const client = new LongRunningAgentClient(
    'http://localhost:3001',
    'your-auth-token'
  );

  const projectId = 'my-web-app-2024';

  const initResult = await client.initializeProject({
    project_id: projectId,
    user_id: 'user-123',
    task_description: 'Build a modern e-commerce platform with product catalog, shopping cart, and checkout',
    project_context: 'A full-stack e-commerce platform similar to Shopify but simplified',
    technologies: [
      'React',
      'Next.js',
      'TypeScript',
      'PostgreSQL',
      'Stripe',
      'TailwindCSS',
    ],
    constraints: [
      'Must follow SOLID principles',
      'Must have comprehensive tests',
      'Must be SEO friendly',
      'Must have good performance (Lighthouse score > 90)',
    ],
  });

  console.log('✅ Project initialized');
  console.log(`   Features generated: ${initResult.data.features_generated}`);
  console.log(`   Session ID: ${initResult.data.session_id}`);
  console.log('\nNext steps:');
  initResult.data.next_steps.forEach((step: string, i: number) => {
    console.log(`   ${i + 1}. ${step}`);
  });

  let sessionCount = 0;
  const maxSessions = 20;

  while (sessionCount < maxSessions) {
    const status = await client.getProjectStatus(projectId);

    console.log(`\n${'='.repeat(60)}`);
    console.log(`Session ${sessionCount + 1}/${maxSessions}`);
    console.log(`${'='.repeat(60)}`);
    console.log(`Progress: ${status.data.progress_percentage.toFixed(1)}%`);
    console.log(`Completed: ${status.data.completed_features}/${status.data.total_features}`);
    console.log(`Available: ${status.data.available_features.length}`);
    console.log(`In Progress: ${status.data.in_progress_features.length}`);

    if (status.data.available_features.length === 0) {
      console.log('\n🎉 All features completed!');
      break;
    }

    const sessionResult = await client.runCodingSession({
      project_id: projectId,
      user_id: 'user-123',
      max_features: 2,
      session_notes: `Session ${sessionCount + 1}`,
    });

    console.log(`\n✅ Session completed`);
    console.log(`   Session ID: ${sessionResult.data.session_id}`);
    console.log(`   Features attempted: ${sessionResult.data.features_attempted.join(', ')}`);
    console.log(`   Features completed: ${sessionResult.data.features_completed.join(', ')}`);
    console.log(`   Files modified: ${sessionResult.data.files_modified.length}`);
    console.log(`   Execution time: ${(sessionResult.data.execution_time / 1000).toFixed(2)}s`);

    if (sessionResult.data.features_completed.length === 0) {
      console.log('\n⚠️  No features completed. Stopping.');
      break;
    }

    console.log('\nNext steps:');
    sessionResult.data.next_steps.forEach((step: string, i: number) => {
      console.log(`   ${i + 1}. ${step}`);
    });

    sessionCount++;

    if (sessionCount < maxSessions) {
      console.log('\n⏳ Waiting 3 seconds before next session...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  const finalStatus = await client.getProjectStatus(projectId);
  console.log(`\n${'='.repeat(60)}`);
  console.log('FINAL STATUS');
  console.log(`${'='.repeat(60)}`);
  console.log(`Total sessions: ${sessionCount}`);
  console.log(`Progress: ${finalStatus.data.progress_percentage.toFixed(1)}%`);
  console.log(`Features completed: ${finalStatus.data.completed_features}/${finalStatus.data.total_features}`);
  console.log(`Features in progress: ${finalStatus.data.in_progress_features.length}`);
  console.log(`Features remaining: ${finalStatus.data.available_features.length}`);

  const report = await client.getProgressReport(projectId, 'txt');
  console.log('\n' + report);
}

buildWebAppFromScratch();
```

## 故障排查示例

### 处理项目未初始化错误

```typescript
async function safeRunSession(projectId: string) {
  try {
    const client = new LongRunningAgentClient(
      'http://localhost:3001',
      'your-token'
    );

    const sessionResult = await client.runCodingSession({
      project_id: projectId,
      user_id: 'user-123',
      max_features: 2,
    });

    return sessionResult;
  } catch (error) {
    if (error.message.includes('not initialized')) {
      console.log('Project not initialized. Initializing now...');

      const client = new LongRunningAgentClient(
        'http://localhost:3001',
        'your-token'
      );

      await client.initializeProject({
        project_id: projectId,
        user_id: 'user-123',
        task_description: 'Build a task management app',
      });

      console.log('Project initialized. Retrying session...');
      return client.runCodingSession({
        project_id: projectId,
        user_id: 'user-123',
        max_features: 2,
      });
    }

    throw error;
  }
}
```

### 处理无可用功能错误

```typescript
async function runSessionWithRetry(projectId: string, maxRetries = 3) {
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const client = new LongRunningAgentClient(
        'http://localhost:3001',
        'your-token'
      );

      const sessionResult = await client.runCodingSession({
        project_id: projectId,
        user_id: 'user-123',
        max_features: 2,
      });

      if (sessionResult.data.features_completed.length === 0) {
        console.log('No features completed. Checking status...');

        const status = await client.getProjectStatus(projectId);

        if (status.data.available_features.length === 0) {
          console.log('All features completed!');
          return null;
        }

        if (status.data.in_progress_features.length > 0) {
          console.log('Some features are in progress. Waiting...');
          await new Promise(resolve => setTimeout(resolve, 5000));
          retries++;
          continue;
        }
      }

      return sessionResult;
    } catch (error) {
      console.error(`Attempt ${retries + 1} failed:`, error.message);
      retries++;

      if (retries < maxRetries) {
        console.log('Retrying in 5 seconds...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }

  throw new Error(`Failed after ${maxRetries} retries`);
}
```

## 监控和日志示例

### 实时监控进度

```typescript
class ProgressMonitor {
  private projectId: string;
  private token: string;
  private interval: NodeJS.Timeout | null = null;
  private callbacks: Array<(status: any) => void> = [];

  constructor(projectId: string, token: string) {
    this.projectId = projectId;
    this.token = token;
  }

  onProgress(callback: (status: any) => void) {
    this.callbacks.push(callback);
  }

  async start(intervalMs = 5000) {
    const client = new LongRunningAgentClient(
      'http://localhost:3001',
      this.token
    );

    const checkStatus = async () => {
      try {
        const status = await client.getProjectStatus(this.projectId);
        this.callbacks.forEach(cb => cb(status.data));
      } catch (error) {
        console.error('Failed to check status:', error);
      }
    };

    await checkStatus();

    this.interval = setInterval(checkStatus, intervalMs);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}

const monitor = new ProgressMonitor('my-project-123', 'your-token');

monitor.onProgress((status) => {
  console.clear();
  console.log('='.repeat(60));
  console.log(`Progress: ${status.progress_percentage.toFixed(1)}%`);
  console.log(`Completed: ${status.completed_features}/${status.total_features}`);
  console.log(`Available: ${status.available_features.length}`);
  console.log(`In Progress: ${status.in_progress_features.length}`);
  console.log('='.repeat(60));
});

monitor.start();

process.on('SIGINT', () => {
  console.log('\nStopping monitor...');
  monitor.stop();
  process.exit(0);
});
```
