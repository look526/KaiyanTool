import type { TTSRequest, TTSResponse, TTSVoice } from '../../types/ai.types'

/**
 * TTS Provider 抽象接口
 * - synthesizeSpeech: 文本合成音频
 * - listVoices: 获取可用音色（可选）
 */
export interface TTSProvider {
  synthesizeSpeech(request: TTSRequest): Promise<TTSResponse>
  listVoices?(): Promise<TTSVoice[]>
}

