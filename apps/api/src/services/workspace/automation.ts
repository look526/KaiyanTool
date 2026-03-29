import crypto from 'crypto';

export type WorkflowTemplateType =
  | 'text-to-image'
  | 'image-to-image'
  | 'image-to-video'
  | 'storyboard'
  | 'batch-generate';

export interface WorkflowExecution {
  id: string;
  workspace_id: string;
  template_type: WorkflowTemplateType;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  params: Record<string, unknown>;
  result?: Record<string, unknown>;
  error?: string;
  created_at: Date;
  completed_at?: Date;
}

const executions: Map<string, WorkflowExecution> = new Map();

export async function triggerWorkflow(
  workspaceId: string,
  templateType: WorkflowTemplateType,
  params: Record<string, unknown> = {}
): Promise<{ success: boolean; execution_id: string }> {
  const executionId = crypto.randomUUID();
  const execution: WorkflowExecution = {
    id: executionId,
    workspace_id: workspaceId,
    template_type: templateType,
    status: 'pending',
    params,
    created_at: new Date(),
  };
  executions.set(executionId, execution);
  console.log(`[Automation] Triggering workflow ${templateType} for workspace ${workspaceId}`, params);
  return { success: true, execution_id: executionId };
}

export async function getWorkflowExecutions(
  workspaceId: string,
  limit: number = 50
): Promise<WorkflowExecution[]> {
  const result: WorkflowExecution[] = [];
  for (const exec of executions.values()) {
    if (exec.workspace_id === workspaceId) {
      result.push(exec);
    }
    if (result.length >= limit) break;
  }
  return result.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
}

export async function updateWorkflowExecution(
  id: string,
  data: { status?: string; result?: Record<string, unknown>; error?: string }
): Promise<void> {
  const execution = executions.get(id);
  if (execution) {
    if (data.status) execution.status = data.status as WorkflowExecution['status'];
    if (data.result) execution.result = data.result;
    if (data.error) execution.error = data.error;
    if (data.status === 'completed' || data.status === 'failed') {
      execution.completed_at = new Date();
    }
  }
}

export function getTemplateDescription(type: WorkflowTemplateType): string {
  const descriptions: Record<WorkflowTemplateType, string> = {
    'text-to-image': '将文字描述转换为图片',
    'image-to-image': '对图片进行变换或增强',
    'image-to-video': '将静态图片转换为视频',
    'storyboard': '批量生成分镜图片',
    'batch-generate': '批量生成多个资源',
  };
  return descriptions[type] || '';
}

export function getNodeCount(type: WorkflowTemplateType): number {
  const counts: Record<WorkflowTemplateType, number> = {
    'text-to-image': 2,
    'image-to-image': 2,
    'image-to-video': 2,
    'storyboard': 5,
    'batch-generate': 10,
  };
  return counts[type] || 3;
}
