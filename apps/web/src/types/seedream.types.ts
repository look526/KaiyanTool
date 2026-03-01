export interface SeedreamAspectRatio {
  value: '1:1' | '4:3' | '3:4' | '16:9' | '9:16' | '3:2' | '2:3' | '21:9' | '9:21'
  label: string
  description: string
  icon: string
}

export interface SeedreamResolution {
  value: '2K' | '3K'
  label: string
  size: string
  maxSize1x1: string
  maxSize16x9: string
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
