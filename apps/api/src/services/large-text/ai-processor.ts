import { jsonrepair } from 'jsonrepair'
import { config } from '../../config'
import { providerManager } from '../ai/provider.manager'
import { TextSegment } from './intelligent-segmenter'
import { AI_PROCESSOR_PROMPTS, getScriptKindGuidance } from '../../prompts/services'

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

const CONCISE_RETRY_USER_SUFFIX = `

【重要】请保证输出为完整合法 JSON（从第一个{到最后一个}）。若内容过多，请压缩：每个 description、镜头 shot 各字段、物品 items 各字段均控制在约 40 字以内，禁止省略结尾括号。`

export class AIProcessor {
  private defaultModel = 'glm-4.7'
  private temperature = 0.3
  private maxTokens = config.ai.largeText.maxOutputTokens

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
    model?: string,
    scriptKind: string = 'standard'
  ): Promise<AISegmentResult> {
    console.log(`[AI处理器] 开始处理片段 ${segment.id}`)

    const provider = providerManager.getProvider(providerId)
    if (!provider) {
      throw new Error(`Provider not found: ${providerId}`)
    }

    const prompt = this.buildEnhancedPrompt(segment, scriptKind)

    console.log(`[AI处理器] Prompt长度: ${prompt.length}，max_tokens: ${this.maxTokens}`)

    const messagesBase = [
      { role: 'system' as const, content: AI_PROCESSOR_PROMPTS.systemPrompt },
    ]

    let response = await provider.chat(
      [...messagesBase, { role: 'user' as const, content: prompt }],
      {
        model: model,
        temperature: this.temperature,
        maxTokens: this.maxTokens,
      }
    )

    console.log(
      `[AI处理器] AI响应长度: ${response.content?.length || 0}，truncated: ${response.truncated === true}`
    )

    try {
      return this.parseAndValidateResponse(response.content, segment.id)
    } catch (firstError) {
      const incomplete =
        response.truncated === true ||
        this.isIncompleteJsonPayload(response.content ?? '')

      if (!incomplete) {
        throw firstError
      }

      console.warn(
        `[AI处理器] 片段 ${segment.id} 疑似输出截断或 JSON 不完整，使用简练模式重试一次`
      )

      response = await provider.chat(
        [
          ...messagesBase,
          {
            role: 'user' as const,
            content: prompt + CONCISE_RETRY_USER_SUFFIX,
          },
        ],
        {
          model: model,
          temperature: this.temperature,
          maxTokens: this.maxTokens,
        }
      )

      console.log(
        `[AI处理器] 重试后响应长度: ${response.content?.length || 0}，truncated: ${response.truncated === true}`
      )

      return this.parseAndValidateResponse(response.content, segment.id)
    }
  }

  /** 平衡括号无法闭合时视为不完整（常见于 max_tokens 截断在字符串中间） */
  private isIncompleteJsonPayload(raw: string): boolean {
    const stripped = this.stripMarkdownCodeFence(raw)
    if (!stripped.includes('{')) {
      return false
    }
    return this.extractBalancedJsonObject(stripped) === null
  }

  private buildEnhancedPrompt(segment: TextSegment, scriptKind: string): string {
    const kind = scriptKind?.trim() || 'standard'
    return AI_PROCESSOR_PROMPTS.buildEnhancedPromptTemplate
      .replace('{{segmentId}}', segment.id)
      .replace('{{startLine}}', String(segment.startLine))
      .replace('{{endLine}}', String(segment.endLine))
      .replace('{{type}}', segment.metadata.type)
      .replace('{{context}}', segment.context || '无')
      .replace('{{content}}', segment.content)
      .replace('{{characters}}', segment.metadata.characters.join(', ') || '无')
      .replace('{{script_kind}}', kind)
      .replace('{{script_kind_guidance}}', getScriptKindGuidance(kind))
  }

  /**
   * 去掉 ```json ... ``` 等围栏，避免首字符不是 `{`
   */
  private stripMarkdownCodeFence(raw: string): string {
    let t = raw.trim()
    if (!t.startsWith('```')) {
      return t
    }
    const firstNl = t.indexOf('\n')
    if (firstNl === -1) {
      return t.replace(/^```\w*\s*/, '').replace(/```\s*$/, '').trim()
    }
    t = t.slice(firstNl + 1)
    const endFence = t.lastIndexOf('```')
    if (endFence !== -1) {
      t = t.slice(0, endFence)
    }
    return t.trim()
  }

  /**
   * 从首个 `{` 起按括号深度截取完整 JSON 对象（字符串内忽略 `{` `}`）。
   * 比贪婪正则 `/\{[\s\S]*\}/` 可靠，避免截到文末无关 `}` 或截断不完整。
   */
  private extractBalancedJsonObject(text: string): string | null {
    const start = text.indexOf('{')
    if (start === -1) {
      return null
    }
    let depth = 0
    let inString = false
    let i = start
    while (i < text.length) {
      const c = text[i]
      if (inString) {
        if (c === '\\') {
          i++
          if (i >= text.length) {
            break
          }
          if (text[i] === 'u' && i + 4 < text.length && /^[0-9a-fA-F]{4}$/.test(text.slice(i + 1, i + 5))) {
            i += 5
          } else {
            i++
          }
          continue
        }
        if (c === '"') {
          inString = false
        }
        i++
        continue
      }
      if (c === '"') {
        inString = true
        i++
        continue
      }
      if (c === '{') {
        depth++
      } else if (c === '}') {
        depth--
        if (depth === 0) {
          return text.slice(start, i + 1)
        }
      }
      i++
    }
    return null
  }

  private parseJsonWithRepair(extractedJson: string): unknown {
    const cleaned = this.cleanJsonControlChars(extractedJson)
    try {
      return JSON.parse(cleaned)
    } catch (first) {
      try {
        const repaired = jsonrepair(cleaned)
        console.warn('[AI响应解析] 使用 jsonrepair 修复后重试解析')
        return JSON.parse(repaired)
      } catch {
        throw first
      }
    }
  }

  private parseAndValidateResponse(content: string, segmentId: string): AISegmentResult {
    console.log(`[AI响应解析] 片段 ${segmentId}，响应长度: ${content.length}`)
    console.log(`[AI响应解析] 响应内容前500字符:`, content.substring(0, 500))

    try {
      const stripped = this.stripMarkdownCodeFence(content)
      let extractedJson =
        this.extractBalancedJsonObject(stripped) ??
        stripped.match(/\{[\s\S]*\}/)?.[0] ??
        null

      if (!extractedJson) {
        console.error(`[AI响应解析] 无法从响应中提取JSON，完整响应:`, content)
        throw new Error('无法从响应中提取JSON')
      }

      console.log(`[AI响应解析] 提取的JSON长度: ${extractedJson.length}`)
      console.log(`[AI响应解析] 清理后的JSON前100字符:`, extractedJson.substring(0, 100))

      const parsed = this.parseJsonWithRepair(extractedJson) as Record<string, unknown>

      if (!parsed.segmentId || parsed.segmentId !== segmentId) {
        console.warn(`片段ID不匹配，期望 ${segmentId}，实际 ${parsed.segmentId}`)
      }

      console.log(`[AI响应解析] 解析成功，scenes数量: ${(parsed.scenes as unknown[])?.length || 0}, characters数量: ${(parsed.characters as unknown[])?.length || 0}`)
      console.log(`[AI响应解析] 第一个场景的dialogues:`, (parsed.scenes as any)?.[0]?.dialogues?.length || 0)
      console.log(`[AI响应解析] 第一个场景的items:`, (parsed.scenes as any)?.[0]?.items?.length || 0)

      return this.sanitizeOutput(parsed)
    } catch (error) {
      console.error('解析AI响应失败:', error)
      console.error('解析AI响应失败时的原始内容:', content)
      console.error('解析AI响应失败的错误详情:', error instanceof Error ? error.message : String(error))
      throw new Error(`片段 ${segmentId} 解析失败`)
    }
  }

  private cleanJsonControlChars(json: string): string {
    // 在 JSON 字符串值内部转义控制字符
    // 匹配 JSON 字符串值："..." （考虑转义引号）
    return json.replace(/"(?:[^"\\]|\\.)*"/g, (match) => {
      // 在字符串值内部，转义控制字符
      return match.replace(/[\x00-\x1F]/g, (char) => {
        const code = char.charCodeAt(0)
        switch (code) {
          case 0x09: return '\\t'  // 制表符
          case 0x0A: return '\\n'  // 换行符
          case 0x0D: return '\\r'  // 回车符
          default: return ''       // 其他控制字符直接移除
        }
      })
    })
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
