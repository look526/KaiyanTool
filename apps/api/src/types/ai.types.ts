export interface AIProvider {
  id: string
  name: string
  type: 'openai' | 'google' | 'antsk' | 'zhipu' | 'seedream' | 'deepseek' | 'toapis'
  apiKey: string
  baseUrl?: string
  models: AIModel[]
  enabled: boolean
  createdAt: Date
  updatedAt: Date
}

export interface AIModel {
  id: string
  name: string
  providerId: string
  type: 'chat' | 'image' | 'video'
  capabilities: string[]
  maxTokens?: number
  enabled: boolean
}

export interface AIRequest {
  prompt: string
  model: string
  temperature?: number
  maxTokens?: number
  topP?: number
  frequencyPenalty?: number
  presencePenalty?: number
}

export interface AIResponse {
  content: string
  truncated?: boolean
  model: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export interface AIProviderConfig {
  type: 'openai' | 'google' | 'antsk' | 'zhipu' | 'seedream' | 'deepseek' | 'toapis'
  apiKey: string
  baseUrl?: string
  models?: {
    chat?: string[]
    image?: string[]
    video?: string[]
  }
}

export interface AIChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface AICreateImageRequest {
  prompt: string
  size?: '256x256' | '512x512' | '1024x1024' | '1920x1080' | '1536x1024' | '1024x1792' | '1:1' | '4:3' | '3:4' | '16:9' | '9:16' | '3:2' | '2:3' | '21:9' | '9:21'
  quality?: 'standard' | 'hd' | '2K' | '3K'
  style?: string
  n?: number
  image_urls?: string[]
  resolution?: '2K' | '3K'
  metadata?: any
}

export interface AICreateImageResponse {
  url: string
  revisedPrompt?: string
  thumbnailUrl?: string
}

export interface AICreateVideoRequest {
  imageUrl: string
  /** 第二参考帧（如九宫格末格），提供商不支持时忽略 */
  endImageUrl?: string
  prompt?: string
  duration?: number
  motion?: number
  aspectRatio?: string
  /** 由控制器合并进 prompt，供需要音画同出的模型理解 */
  subtitle_text?: string
  sync_audio_video?: boolean
}

export interface AICreateVideoResponse {
  url: string
  duration?: number
  resolution?: string
}

export interface Sora2VideoRequest {
  model?: 'sora-2' | 'sora-2-pro' | 'sora-2-vip'
  prompt: string
  duration?: number
  aspect_ratio?: '16:9' | '9:16'
  image_urls?: string[]
  thumbnail?: boolean
  metadata?: {
    n?: number
    watermark?: boolean
    hd?: boolean
    private?: boolean
    style?: 'thanksgiving' | 'comic' | 'news' | 'selfie' | 'nostalgic' | 'anime'
    storyboard?: boolean
    character_url?: string
    character_timestamps?: string
    character_create?: boolean
    character_from_task?: string
  }
}

export interface Sora2VideoResponse {
  id: string
  object: string
  model: string
  status: 'queued' | 'in_progress' | 'completed' | 'failed'
  progress: number
  created_at: number
  metadata?: any
}

export interface TTSRequest {
  text: string
  voice_id: string
  speed?: number
  pitch?: number
  emotion?: string
  language?: string
  format?: 'mp3' | 'wav' | 'ogg'
}

export interface TTSResponse {
  url: string
  duration: number
  format: string
}

export interface TTSVoice {
  id: string
  name: string
  language: string
  gender: string
  style?: string
  sample_url?: string
}

export interface LipSyncRequest {
  image_url: string
  audio_url: string
  output_format?: 'mp4' | 'webm'
}

export interface LipSyncResponse {
  url: string
  duration: number
}

export interface VEO3VideoRequest {
  model?: 'veo3' | 'veo3-pro'
  prompt: string
  duration?: number
  aspect_ratio?: '16:9' | '9:16' | '1:1'
  image_urls?: string[]
  end_image_url?: string
  prompt_strength?: number
  metadata?: any
}
