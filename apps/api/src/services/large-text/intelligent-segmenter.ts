export interface TextSegment {
  id: string
  content: string
  startLine: number
  endLine: number
  summary?: string
  context?: string
  metadata: {
    type: 'scene' | 'dialogue' | 'action' | 'description'
    characters: string[]
    keywords: string[]
  }
}

export class IntelligentSegmenter {
  private maxSegmentTokens = 8000
  private contextWindowTokens = 500

  setMaxSegmentTokens(tokens: number) {
    this.maxSegmentTokens = tokens
  }

  setContextWindowTokens(tokens: number) {
    this.contextWindowTokens = tokens
  }

  async segmentText(text: string): Promise<TextSegment[]> {
    const segments: TextSegment[] = []
    const lines = text.split('\n')
    let currentSegment: string[] = []
    let currentTokens = 0
    let segmentId = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const lineTokens = this.estimateTokens(line)

      if (currentTokens + lineTokens > this.maxSegmentTokens) {
        if (currentSegment.length > 0) {
          const segment = await this.createSegment(
            currentSegment,
            segmentId++,
            i - currentSegment.length
          )
          segments.push(segment)
          currentSegment = []
          currentTokens = 0
        }
      }

      currentSegment.push(line)
      currentTokens += lineTokens
    }

    if (currentSegment.length > 0) {
      const segment = await this.createSegment(
        currentSegment,
        segmentId,
        lines.length - currentSegment.length
      )
      segments.push(segment)
    }

    await this.enrichSegmentsWithContext(segments)
    return segments
  }

  private async createSegment(
    lines: string[],
    id: number,
    startLine: number
  ): Promise<TextSegment> {
    const content = lines.join('\n')
    const metadata = this.analyzeSegmentType(content)

    return {
      id: `segment_${id}`,
      content,
      startLine,
      endLine: startLine + lines.length - 1,
      metadata
    }
  }

  private analyzeSegmentType(content: string): TextSegment['metadata'] {
    const characters = this.extractCharacters(content)
    const keywords = this.extractKeywords(content)
    let type: TextSegment['metadata']['type'] = 'description'

    if (content.match(/^\*{0,2}(场景\d+|场景\s*\d+|Scene\s*\d+)/i)) {
      type = 'scene'
    } else if (characters.length > 0 && this.hasDialogue(content)) {
      type = 'dialogue'
    } else if (content.match(/^\(|\（/)) {
      type = 'action'
    }

    return { type, characters, keywords }
  }

  private async enrichSegmentsWithContext(segments: TextSegment[]) {
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i]

      const prevContext = i > 0
        ? segments[i - 1].content.slice(-this.contextWindowTokens * 2)
        : ''
      const nextContext = i < segments.length - 1
        ? segments[i + 1].content.slice(0, this.contextWindowTokens * 2)
        : ''

      segment.context = this.formatContext(prevContext, nextContext)
      segment.summary = this.generateSummary(segment.content, segment.metadata)
    }
  }

  private formatContext(prevContext: string, nextContext: string): string {
    const parts: string[] = []
    if (prevContext) {
      parts.push(`前文摘要：${prevContext}`)
    }
    if (nextContext) {
      parts.push(`后文预览：${nextContext}`)
    }
    return parts.join('\n')
  }

  private generateSummary(content: string, metadata: TextSegment['metadata']): string {
    const typeNames = {
      scene: '场景',
      dialogue: '对话',
      action: '动作',
      description: '描述'
    }
    const characters = metadata.characters.length > 0
      ? `涉及角色：${metadata.characters.join(', ')}`
      : ''
    return `该片段为${typeNames[metadata.type]}内容。${characters}`
  }

  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 2)
  }

  private extractCharacters(content: string): string[] {
    const matches = content.matchAll(/^([^\uff1a\uff3b:：:]+)[\uff1a\uff3b:：:]/gm)
    return Array.from(matches, m => m[1].trim()).filter(Boolean)
  }

  private extractKeywords(content: string): string[] {
    const sceneKeywords = content.match(/场景|Scene|内景|外景/gi) || []
    return [...new Set(sceneKeywords)]
  }

  private hasDialogue(content: string): boolean {
    return content.includes('：') || content.includes(':')
  }
}
