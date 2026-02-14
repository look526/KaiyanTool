export interface AIProvider {
  id: string
  name: string
  type: 'openai' | 'google' | 'antsk' | 'zhipu'
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
  model: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export interface AIProviderConfig {
  type: 'openai' | 'google' | 'antsk'
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
  size?: '256x256' | '512x512' | '1024x1024' | '1920x1080' | '1536x1024' | '1024x1792'
  quality?: 'standard' | 'hd'
  style?: 'vivid' | 'natural'
  n?: number
}

export interface AICreateImageResponse {
  url: string
  revisedPrompt?: string
}

export interface AICreateVideoRequest {
  imageUrl: string
  prompt?: string
  duration?: number
  motion?: number
  aspectRatio?: string
}

export interface AICreateVideoResponse {
  url: string
  duration?: number
  resolution?: string
}
