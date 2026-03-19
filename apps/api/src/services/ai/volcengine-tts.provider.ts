import { AIProvider } from './provider.interface'
import { AIChatMessage, AIRequest, AIResponse, AICreateImageRequest, AICreateImageResponse, TTSRequest, TTSResponse, TTSVoice } from '../../types/ai.types'
import logger from '../../lib/logger'
import type { TTSProvider } from './tts.provider'

/**
 * 火山引擎 TTS Provider
 * 支持豆包语音合成，含情感控制
 */
export class VolcengineTTSProvider extends AIProvider implements TTSProvider {
  private appId: string

  constructor(apiKey: string, baseUrl?: string, appId?: string) {
    super(apiKey, baseUrl || 'https://openspeech.bytedance.com/api/v1')
    this.appId = appId || ''
    this.type = 'volcengine-tts'
  }

  async chat(_messages: AIChatMessage[], _options?: Partial<AIRequest>): Promise<AIResponse> {
    throw new Error('VolcengineTTSProvider 不支持 chat 操作')
  }

  async createImage(_request: AICreateImageRequest): Promise<AICreateImageResponse> {
    throw new Error('VolcengineTTSProvider 不支持图像生成')
  }

  async createVideo(): Promise<never> {
    throw new Error('VolcengineTTSProvider 不支持视频生成')
  }

  async synthesizeSpeech(request: TTSRequest): Promise<TTSResponse> {
    const { text, voice_id, speed = 1.0, pitch = 0, emotion, format = 'mp3' } = request

    try {
      const payload = {
        app: {
          appid: this.appId,
          cluster: 'volcano_tts',
        },
        user: { uid: 'kaiyan-tts' },
        audio: {
          voice_type: voice_id,
          encoding: format === 'mp3' ? 'mp3' : format === 'wav' ? 'wav' : 'ogg_opus',
          speed_ratio: speed,
          pitch_ratio: pitch,
          ...(emotion ? { emotion } : {}),
        },
        request: {
          reqid: crypto.randomUUID(),
          text,
          operation: 'query',
        },
      }

      const response = await this.request('/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer;${this.apiKey}`,
        },
        body: JSON.stringify(payload),
      })

      if (response.code !== 3000) {
        throw new Error(`TTS 合成失败: ${response.message || '未知错误'}`)
      }

      const audioData = Buffer.from(response.data, 'base64')
      const estimatedDuration = Math.ceil(text.length * 200 / speed)

      const filePath = `uploads/tts/${crypto.randomUUID()}.${format}`
      const fs = await import('fs')
      const path = await import('path')
      const fullPath = path.join(process.cwd(), filePath)

      const dir = path.dirname(fullPath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      fs.writeFileSync(fullPath, audioData)

      logger.info('TTS 合成成功', { voice_id, text_length: text.length, format })

      return {
        url: `/${filePath}`,
        duration: estimatedDuration,
        format,
      }
    } catch (error) {
      logger.error('TTS 合成失败', { error, voice_id, text_length: text.length })
      throw error
    }
  }

  async listVoices(): Promise<TTSVoice[]> {
    return [
      { id: 'zh_female_shuangkuaisisi_moon_bigtts', name: '爽快思思', language: 'zh-CN', gender: 'female', style: '活泼' },
      { id: 'zh_male_chunhou_moon_bigtts', name: '醇厚大叔', language: 'zh-CN', gender: 'male', style: '沉稳' },
      { id: 'zh_female_wennuanwanzi_moon_bigtts', name: '温暖丸子', language: 'zh-CN', gender: 'female', style: '温暖' },
      { id: 'zh_male_yangguangqingnian_moon_bigtts', name: '阳光青年', language: 'zh-CN', gender: 'male', style: '阳光' },
      { id: 'zh_female_linjianvhai_moon_bigtts', name: '邻家女孩', language: 'zh-CN', gender: 'female', style: '甜美' },
      { id: 'zh_male_shaonianluntan_moon_bigtts', name: '少年论坛', language: 'zh-CN', gender: 'male', style: '少年' },
      { id: 'zh_female_gaolengyujie_moon_bigtts', name: '高冷御姐', language: 'zh-CN', gender: 'female', style: '冷酷' },
      { id: 'zh_male_badaozongtai_moon_bigtts', name: '霸道总裁', language: 'zh-CN', gender: 'male', style: '霸气' },
    ]
  }
}
