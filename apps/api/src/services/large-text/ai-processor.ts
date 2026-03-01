import { providerManager } from '../ai/provider.manager'
import { TextSegment } from './intelligent-segmenter'
import { AI_PROCESSOR_PROMPTS } from '../../prompts/services'

export interface AISegmentResult {
  segmentId: string
  scenes: Array<{
    id: string
    number: number
    heading: string
    location: string
    time?: string
    description?: string
    characters: string[]
    dialogues: Array<{
      characterName: string
      text: string
    }>
    actions: Array<{
      description: string
      type: string
    }>
    items?: Array<{
      name: string
      size: string
      shape: string
      color: string
    }>
  }>
  characters: Array<{
    id: string
    name: string
    description?: string
    lines: number
    personality?: string[]
    costume?: {
      type: string
      color: string
      material: string
      decoration: string
    }
    appearance?: {
      hairStyle: string
      facialFeatures: string
      bodyProportion: string
      otherDetails: string[]
    }
  }>
}

export class AIProcessor {
  private defaultModel = 'glm-4.7'
  private temperature = 0.3
  private maxTokens = 8192

  setDefaultModel(model: string) {
    this.defaultModel = model
    console.log(`[AI处理器] 设置默认模型: ${this.defaultModel}`)
  }

  setTemperature(temperature: number) {
    this.temperature = temperature
  }

  setMaxTokens(tokens: number) {
    this.maxTokens = tokens
  }

  async processSegment(
    segment: TextSegment,
    providerId: string,
    model?: string
  ): Promise<AISegmentResult> {
    console.log(`[AI处理器] 开始处理片段 ${segment.id}`)

    const provider = providerManager.getProvider(providerId)
    if (!provider) {
      throw new Error(`Provider not found: ${providerId}`)
    }

    const prompt = this.buildEnhancedPrompt(segment)

    console.log(`[AI处理器] Prompt长度: ${prompt.length}`)

    const response = await provider.chat([
      {
        role: 'system',
        content: AI_PROCESSOR_PROMPTS.systemPrompt
      },
      {
        role: 'user',
        content: prompt
      }
    ], {
      model: model,
      temperature: this.temperature,
      maxTokens: this.maxTokens
    })

    console.log(`[AI处理器] AI响应长度: ${response.content?.length || 0}`)

    return this.parseAndValidateResponse(response.content, segment.id)
  }

  private buildEnhancedPrompt(segment: TextSegment): string {
    return AI_PROCESSOR_PROMPTS.buildEnhancedPromptTemplate
      .replace('{{segmentId}}', segment.id)
      .replace('{{startLine}}', String(segment.startLine))
      .replace('{{endLine}}', String(segment.endLine))
      .replace('{{type}}', segment.metadata.type)
      .replace('{{context}}', segment.context || '无')
      .replace('{{content}}', segment.content)
      .replace('{{characters}}', segment.metadata.characters.join(', ') || '无');
  }

  private parseAndValidateResponse(content: string, segmentId: string): AISegmentResult {
    console.log(`[AI响应解析] 片段 ${segmentId}，响应长度: ${content.length}`)
    console.log(`[AI响应解析] 响应内容前500字符:`, content.substring(0, 500))
    
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        console.error(`[AI响应解析] 无法从响应中提取JSON，完整响应:`, content)
        throw new Error('无法从响应中提取JSON')
      }

      console.log(`[AI响应解析] 提取的JSON长度: ${jsonMatch[0].length}`)
      
      const extractedJson = jsonMatch[0]
      console.log(`[AI响应解析] 提取的JSON前100字符:`, extractedJson.substring(0, 100))
      
      const parsed = JSON.parse(extractedJson)

      if (!parsed.segmentId || parsed.segmentId !== segmentId) {
        console.warn(`片段ID不匹配，期望 ${segmentId}，实际 ${parsed.segmentId}`)
      }

      console.log(`[AI响应解析] 解析成功，scenes数量: ${parsed.scenes?.length || 0}, characters数量: ${parsed.characters?.length || 0}`)
      console.log(`[AI响应解析] 解析后的完整数据:`, JSON.stringify(parsed, null, 2))
      
      return this.sanitizeOutput(parsed)
    } catch (error) {
      console.error('解析AI响应失败:', error)
      console.error('解析AI响应失败时的原始内容:', content)
      console.error('解析AI响应失败的错误详情:', error instanceof Error ? error.message : String(error))
      throw new Error(`片段 ${segmentId} 解析失败`)
    }
  }

  private sanitizeOutput(data: any): AISegmentResult {
    if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
      const sanitized: any = {}
      for (const [key, value] of Object.entries(data)) {
        sanitized[key] = value
      }
      return sanitized
    }

    if (Array.isArray(data)) {
      throw new Error('AI返回了数组而非对象，请检查AI响应格式')
    }

    throw new Error('AI返回了无效的数据格式')
  }
}
