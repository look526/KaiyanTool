import type { TTSRequest, TTSResponse, TTSVoice } from '../../types/ai.types'

export interface TTSProvider {
  synthesizeSpeech(request: TTSRequest): Promise<TTSResponse>
  listVoices(): Promise<TTSVoice[]>
}
