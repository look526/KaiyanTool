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

export async function triggerWorkflow(
  workspaceId: string,
  templateType: WorkflowTemplateType,
  params: Record<string, unknown>
): Promise<{ success: boolean; execution_id: string }> {
  const executionId = crypto.randomUUID();
  console.log(`[Automation] Triggering workflow ${templateType} for workspace ${workspaceId}`, params);
  return { success: true, execution_id: executionId };
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
