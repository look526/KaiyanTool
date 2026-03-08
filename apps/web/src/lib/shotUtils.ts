export interface Shot {
  id: string;
  project_id: string;
  scene_id?: string;
  character_id?: string;
  chapter_number?: number;
  episode_number?: number;
  segment_id?: number;
  cell_id?: number;
  action_summary?: string;
  camera_movement?: string;
  start_prompt?: string;
  end_prompt?: string;
  start_image_url?: string;
  end_image_url?: string;
  video_url?: string;
  duration: number;
  aspect_ratio: string;
  visual_style?: string;
  scene?: {
    id: string;
    location: string;
    time: string;
  };
  character?: {
    id: string;
    name: string;
  };
  created_at: string;
  updated_at: string;
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
  if (shot.chapter_number && shot.episode_number && shot.segment_id && shot.cell_id) {
    return `SHOT ${String(shot.chapter_number).padStart(3, '0')}-${shot.episode_number}.${shot.segment_id}.${shot.cell_id}`;
  }
  return `SHOT ${String(index + 1).padStart(3, '0')}`;
}

export function getShotStatus(shot: Shot): ShotStatus {
  const hasStartImage = !!shot.start_image_url;
  const hasEndImage = !!shot.end_image_url;
  const hasVideo = !!shot.video_url;
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
