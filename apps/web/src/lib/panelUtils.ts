export interface Panel {
  id: string;
  shotId: string;
  position: number;
  prompt: string;
  imageUrl?: string;
  createdAt: string;
}

export interface PanelStatus {
  hasImage: boolean;
  isEmpty: boolean;
  isGenerating: boolean;
}

export interface PanelEditForm {
  prompt: string;
  imageUrl?: string;
  position?: number;
}

export function getPanelStatus(panel: Panel, generatingIds: Set<string>): PanelStatus {
  const hasImage = !!panel.imageUrl;
  const isEmpty = !panel.prompt && !panel.imageUrl;
  const isGenerating = generatingIds.has(panel.id);

  return {
    hasImage,
    isEmpty,
    isGenerating,
  };
}

export function getPanelStatusLabel(status: PanelStatus): string {
  if (status.isGenerating) return '生成中';
  if (status.hasImage) return '已完成';
  if (status.isEmpty) return '待编辑';
  return '待生成';
}

export function getPanelStatusColor(status: PanelStatus): string {
  if (status.isGenerating) return '#f59e0b';
  if (status.hasImage) return '#10b981';
  if (status.isEmpty) return '#64748b';
  return '#6366f1';
}

export function getPanelStatusBackgroundColor(status: PanelStatus): string {
  if (status.isGenerating) return 'rgba(245, 158, 11, 0.1)';
  if (status.hasImage) return 'rgba(16, 185, 129, 0.1)';
  if (status.isEmpty) return 'rgba(100, 116, 139, 0.1)';
  return 'rgba(99, 102, 241, 0.1)';
}

export function getPanelStatusBorderColor(status: PanelStatus): string {
  if (status.isGenerating) return 'rgba(245, 158, 11, 0.3)';
  if (status.hasImage) return 'rgba(16, 185, 129, 0.3)';
  if (status.isEmpty) return 'rgba(100, 116, 139, 0.3)';
  return 'rgba(99, 102, 241, 0.3)';
}

export function createDefaultPanelFormData(): PanelEditForm {
  return {
    prompt: '',
    imageUrl: '',
    position: 1,
  };
}

export function createPanelFormDataFromPanel(panel: Panel): PanelEditForm {
  return {
    prompt: panel.prompt,
    imageUrl: panel.imageUrl || '',
    position: panel.position,
  };
}

export function createBatchPanelFormData(count: number = 9): { panels: PanelEditForm[] } {
  return {
    panels: Array.from({ length: count }, (_, i) => ({
      prompt: '',
      imageUrl: '',
      position: i + 1,
    })),
  };
}
