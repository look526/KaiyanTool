import { AIRequest, AIResponse, AIChatMessage, AICreateImageRequest, AICreateImageResponse, AICreateVideoRequest, AICreateVideoResponse, TTSRequest, TTSResponse, TTSVoice, LipSyncRequest, LipSyncResponse } from '../../types/ai.types'
import logger from '../../lib/logger'

export abstract class AIProvider {
  protected apiKey: string
  protected baseUrl?: string
  public id: string = '';
  public type: string = '';
  public models: any[] = [];

  constructor(apiKey: string, baseUrl?: string) {
    this.apiKey = apiKey
    this.baseUrl = baseUrl
  }

  abstract chat(messages: AIChatMessage[], options?: Partial<AIRequest>): Promise<AIResponse>
  abstract createImage(request: AICreateImageRequest): Promise<AICreateImageResponse>
  abstract createVideo?(request: AICreateVideoRequest): Promise<AICreateVideoResponse>

  async synthesizeSpeech?(_request: TTSRequest): Promise<TTSResponse>
  async listVoices?(): Promise<TTSVoice[]>
  async generateLipSync?(_request: LipSyncRequest): Promise<LipSyncResponse>

  protected async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = this.baseUrl ? `${this.baseUrl}${endpoint}` : endpoint
    console.log('[AIProvider] Request URL:', url, 'baseUrl:', this.baseUrl, 'endpoint:', endpoint, 'provider type:', this.type, 'provider id:', this.id);
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = `AI request failed with status ${response.status}`
        
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.error?.message || errorJson.message || errorMessage
        } catch {
          errorMessage = errorText || errorMessage
        }
        
        logger.error('AI API request failed', {
          endpoint,
          status: response.status,
          error: errorMessage,
        })
        
        throw new Error(errorMessage)
      }

      const data = await response.json()
      return data
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      
      logger.error('AI API request error', {
        endpoint,
        error: String(error),
      })
      throw new Error(`AI request failed: ${String(error)}`)
    }
  }
}
