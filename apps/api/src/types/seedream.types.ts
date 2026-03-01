export interface SeedreamImageRequest {
  prompt: string
  size?: '1:1' | '4:3' | '3:4' | '16:9' | '9:16' | '3:2' | '2:3' | '21:9' | '9:21'
  resolution?: '2K' | '3K'
  n?: number
  image_urls?: string[]
  metadata?: {
    resolution?: '2K' | '3K'
    sequential_image_generation?: 'disabled' | 'auto'
    sequential_image_generation_options?: {
      max_images?: number
    }
    watermark?: boolean
  }
}

export interface SeedreamImageResponse {
  url: string
  taskId: string
  status: 'queued' | 'in_progress' | 'completed' | 'failed'
  progress: number
  metadata: {
    width: number
    height: number
    resolution: string
  }
}

export interface SeedreamTask {
  id: string
  object: string
  model: string
  status: 'queued' | 'in_progress' | 'completed' | 'failed'
  progress: number
  created_at: number
  metadata: {
    width: number
    height: number
    resolution: string
  }
}

export interface SeedreamResolution {
  value: '2K' | '3K'
  label: string
  size: string
  maxSize1x1: string
  maxSize16x9: string
}

export const SEEDREAM_RESOLUTIONS: SeedreamResolution[] = [
  {
    value: '2K',
    label: '2K',
    size: '标准分辨率',
    maxSize1x1: '2048x2048',
    maxSize16x9: '2848x1600',
  },
  {
    value: '3K',
    label: '3K',
    size: '高清分辨率',
    maxSize1x1: '3072x3072',
    maxSize16x9: '4096x2304',
  },
]

export interface SeedreamAspectRatio {
  value: '1:1' | '4:3' | '3:4' | '16:9' | '9:16' | '3:2' | '2:3' | '21:9' | '9:21'
  label: string
  description: string
  icon: string
}

export const SEEDREAM_ASPECT_RATIOS: SeedreamAspectRatio[] = [
  { value: '1:1', label: '1:1', description: '正方形', icon: '⬜' },
  { value: '4:3', label: '4:3', description: '横向', icon: '📺' },
  { value: '3:4', label: '3:4', description: '竖向', icon: '📱' },
  { value: '16:9', label: '16:9', description: '宽屏', icon: '🖥️' },
  { value: '9:16', label: '9:16', description: '长图', icon: '📱' },
  { value: '3:2', label: '3:2', description: '照片', icon: '🖼️' },
  { value: '2:3', label: '2:3', description: '竖照', icon: '🖼️' },
  { value: '21:9', label: '21:9', description: '超宽', icon: '🎬' },
  { value: '9:21', label: '9:21', description: '超窄', icon: '📱' },
]

export function getResolutionSize(resolution: '2K' | '3K', aspectRatio: string): { width: number; height: number } {
  const resolutionConfig = SEEDREAM_RESOLUTIONS.find(r => r.value === resolution)
  if (!resolutionConfig) {
    throw new Error(`Invalid resolution: ${resolution}`)
  }

  const aspectSizes: Record<string, { width: number; height: number }> = {
    '1:1': parseSize(resolutionConfig.maxSize1x1),
    '4:3': parseSize('2848x2136'),
    '3:4': parseSize('2136x2848'),
    '16:9': parseSize(resolutionConfig.maxSize16x9),
    '9:16': parseSize('1600x2848'),
    '3:2': parseSize('2848x1898'),
    '2:3': parseSize('1898x2848'),
    '21:9': parseSize('2848x1224'),
    '9:21': parseSize('1224x2848'),
  }

  const size = aspectSizes[aspectRatio]
  if (!size) {
    throw new Error(`Invalid aspect ratio: ${aspectRatio}`)
  }

  return size
}

function parseSize(size: string): { width: number; height: number } {
  const [width, height] = size.split('x').map(Number)
  return { width, height }
}
