export interface Shot {
  id: string;
  projectId: string;
  sceneId?: string;
  characterId?: string;
  chapterNumber?: number;
  episodeNumber?: number;
  segmentId?: number;
  cellId?: number;
  actionSummary?: string;
  cameraMovement?: string;
  startPrompt?: string;
  endPrompt?: string;
  startImageUrl?: string;
  endImageUrl?: string;
  videoUrl?: string;
  duration: number;
  aspectRatio: string;
  visualStyle?: string;
  scene?: {
    id: string;
    location: string;
    time: string;
  };
  character?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ShotStatus {
  hasStartImage: boolean;
  hasEndImage: boolean;
  hasVideo: boolean;
  hasBothImages: boolean;
  isComplete: boolean;
  isInProgress: boolean;
  isPending: boolean;
}

export function getShotDisplayNumber(shot: Shot, index: number): string {
  if (shot.chapterNumber && shot.episodeNumber && shot.segmentId && shot.cellId) {
    return `SHOT ${String(shot.chapterNumber).padStart(3, '0')}-${shot.episodeNumber}.${shot.segmentId}.${shot.cellId}`;
  }
  return `SHOT ${String(index + 1).padStart(3, '0')}`;
}

export function getShotStatus(shot: Shot): ShotStatus {
  const hasStartImage = !!shot.startImageUrl;
  const hasEndImage = !!shot.endImageUrl;
  const hasVideo = !!shot.videoUrl;
  const hasBothImages = hasStartImage && hasEndImage;
  const isComplete = hasBothImages && hasVideo;
  const isInProgress = hasBothImages && !hasVideo;
  const isPending = !hasBothImages;

  return {
    hasStartImage,
    hasEndImage,
    hasVideo,
    hasBothImages,
    isComplete,
    isInProgress,
    isPending,
  };
}

export function getShotStatusLabel(status: ShotStatus): string {
  if (status.isComplete) return '已完成';
  if (status.isInProgress) return '生成中';
  return '待生成';
}

export function getShotStatusColor(status: ShotStatus): string {
  if (status.isComplete) return '#10b981';
  if (status.isInProgress) return '#f59e0b';
  return '#64748b';
}

export function getShotStatusBackgroundColor(status: ShotStatus): string {
  if (status.isComplete) return 'rgba(16, 185, 129, 0.1)';
  if (status.isInProgress) return 'rgba(245, 158, 11, 0.1)';
  return 'rgba(100, 116, 139, 0.1)';
}

export function getShotStatusBorderColor(status: ShotStatus): string {
  if (status.isComplete) return 'rgba(16, 185, 129, 0.3)';
  if (status.isInProgress) return 'rgba(245, 158, 11, 0.3)';
  return 'rgba(100, 116, 139, 0.3)';
}
