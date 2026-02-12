import { prisma } from '../../lib/prisma'
import logger from '../../lib/logger'

export interface TextQualityScore {
  relevance: number
  coherence: number
  completeness: number
  overall: number
  details: {
    strengths: string[]
    weaknesses: string[]
    suggestions: string[]
  }
}

export interface ImageQualityScore {
  clarity: number
  composition: number
  styleConsistency: number
  technical: number
  overall: number
  details: {
    resolution: string
    brightness: number
    contrast: number
    colorBalance: number
  }
}

export interface QualityReport {
  type: 'text' | 'image'
  id: string
  userId: string
  score: TextQualityScore | ImageQualityScore
  timestamp: Date
}

export class QualityScoringService {
  async scoreText(
    text: string,
    context?: {
      expectedCharacters?: string[]
      expectedScene?: string
      minLength?: number
    }
  ): Promise<TextQualityScore> {
    try {
      const relevance = this.calculateRelevance(text, context)
      const coherence = this.calculateCoherence(text)
      const completeness = this.calculateCompleteness(text, context)

      const overall = (relevance + coherence + completeness) / 3

      const details = this.generateTextDetails(text, relevance, coherence, completeness)

      logger.info('文本质量评分完成', { overall, relevance, coherence, completeness })
      return { relevance, coherence, completeness, overall, details }
    } catch (error) {
      logger.error('文本质量评分失败', { error })
      throw error
    }
  }

  async scoreImage(imageUrl: string, referenceImages?: string[]): Promise<ImageQualityScore> {
    try {
      const sharp = await import('sharp')
      const response = await fetch(imageUrl)
      const buffer = await response.arrayBuffer()
      const image = sharp.default(Buffer.from(buffer))

      const metadata = await image.metadata()
      const { data } = await image
        .resize(100, 100, { fit: 'inside' })
        .raw()
        .toBuffer({ resolveWithObject: true })

      const clarity = this.calculateImageClarity(metadata, data as Uint8Array)
      const composition = this.calculateComposition(data as Uint8Array)
      const technical = this.calculateTechnicalQuality(metadata)
      const styleConsistency = referenceImages
        ? await this.calculateStyleConsistency(imageUrl, referenceImages)
        : 100

      const overall = (clarity + composition + technical + styleConsistency) / 4

      const details = {
        resolution: `${metadata.width}x${metadata.height}`,
        brightness: this.calculateBrightness(data as Uint8Array),
        contrast: this.calculateContrast(data as Uint8Array),
        colorBalance: this.calculateColorBalance(data as Uint8Array),
      }

      logger.info('图像质量评分完成', { overall, clarity, composition, technical, styleConsistency })
      return { clarity, composition, styleConsistency, technical, overall, details }
    } catch (error) {
      logger.error('图像质量评分失败', { error, imageUrl })
      throw error
    }
  }

  async saveQualityReport(
    userId: string,
    report: QualityReport
  ): Promise<void> {
    try {
      await prisma.qualityReport.create({
        data: {
          userId,
          type: report.type,
          targetId: report.id,
          score: report.type === 'text' 
            ? JSON.stringify(report.score)
            : JSON.stringify(report.score),
          timestamp: report.timestamp,
        },
      })
      logger.info('质量报告已保存', { userId, type: report.type, id: report.id })
    } catch (error) {
      logger.error('保存质量报告失败', { userId, error })
    }
  }

  async getQualityHistory(
    userId: string,
    type: 'text' | 'image',
    limit: number = 50
  ): Promise<QualityReport[]> {
    try {
      const reports = await prisma.qualityReport.findMany({
        where: {
          userId,
          type,
        },
        orderBy: { timestamp: 'desc' },
        take: limit,
      })

      return reports.map((r) => ({
        type: r.type,
        id: r.targetId,
        userId: r.userId,
        score: JSON.parse(r.score),
        timestamp: r.timestamp,
      }))
    } catch (error) {
      logger.error('获取质量历史失败', { userId, type, error })
      return []
    }
  }

  private calculateRelevance(text: string, context?: any): number {
    let score = 70

    if (context?.expectedCharacters && context.expectedCharacters.length > 0) {
      const mentionedCharacters = context.expectedCharacters.filter((char: string) =>
        text.includes(char)
      )
      score += (mentionedCharacters.length / context.expectedCharacters.length) * 30
    }

    if (context?.expectedScene && text.toLowerCase().includes(context.expectedScene.toLowerCase())) {
      score += 15
    }

    return Math.min(score, 100)
  }

  private calculateCoherence(text: string): number {
    const sentences = text.split(/[.!?。！？]+/).filter((s) => s.trim().length > 0)
    let coherenceScore = 80

    if (sentences.length < 2) {
      coherenceScore -= 20
    }

    const transitions = this.analyzeTransitions(sentences)
    coherenceScore += transitions * 5

    return Math.max(0, Math.min(coherenceScore, 100))
  }

  private calculateCompleteness(text: string, context?: any): number {
    let score = 80
    const length = text.length

    if (context?.minLength && length < context.minLength) {
      score -= (context.minLength - length) / context.minLength * 30
    }

    if (length < 50) {
      score -= 20
    } else if (length > 1000) {
      score -= 10
    }

    if (!/[.!?。！？]$/.test(text.trim())) {
      score -= 10
    }

    return Math.max(0, Math.min(score, 100))
  }

  private calculateImageClarity(metadata: any, imageData: Uint8Array): number {
    let score = 70

    const width = metadata.width || 100
    const height = metadata.height || 100

    if (width >= 1920 && height >= 1080) {
      score += 20
    } else if (width >= 1280 && height >= 720) {
      score += 10
    }

    const edgeSharpness = this.calculateEdgeSharpness(imageData, width, height)
    score += edgeSharpness * 10

    return Math.min(score, 100)
  }

  private calculateComposition(imageData: Uint8Array): number {
    const centerX = Math.floor(imageData.length / 2)
    const centerBrightness = imageData[centerX]

    let variance = 0
    for (let i = 0; i < imageData.length; i++) {
      variance += Math.abs(imageData[i] - centerBrightness)
    }
    variance /= imageData.length

    const balanceScore = 100 - Math.min(variance / 2, 100)

    return balanceScore
  }

  private calculateTechnicalQuality(metadata: any): number {
    let score = 80

    if (metadata.format === 'jpeg' || metadata.format === 'jpg') {
      score += 10
    } else if (metadata.format === 'png') {
      score += 15
    } else if (metadata.format === 'webp') {
      score += 20
    }

    const aspectRatio = metadata.width / metadata.height
    if (aspectRatio >= 1.7 && aspectRatio <= 1.9) {
      score += 10
    }

    return Math.min(score, 100)
  }

  private async calculateStyleConsistency(imageUrl: string, referenceImages: string[]): Promise<number> {
    let consistencyScore = 75

    for (const refUrl of referenceImages) {
      try {
        const [mainResponse, refResponse] = await Promise.all([
          fetch(imageUrl),
          fetch(refUrl),
        ])
        const mainBuffer = await mainResponse.arrayBuffer()
        const refBuffer = await refResponse.arrayBuffer()

        const similarity = this.calculateImageSimilarity(
          mainBuffer,
          refBuffer
        )
        consistencyScore += similarity * 0.25
      } catch (error) {
        logger.warn('参考图比对失败', { refUrl, error })
      }
    }

    return Math.min(consistencyScore, 100)
  }

  private calculateImageSimilarity(buffer1: ArrayBuffer, buffer2: ArrayBuffer): number {
    const arr1 = new Uint8Array(buffer1)
    const arr2 = new Uint8Array(buffer2)

    const len = Math.min(arr1.length, arr2.length)
    let diff = 0

    for (let i = 0; i < len; i++) {
      diff += Math.abs(arr1[i] - arr2[i])
    }

    const avgDiff = diff / len
    return Math.max(0, 100 - (avgDiff / 2.55))
  }

  private calculateEdgeSharpness(imageData: Uint8Array, width: number, height: number): number {
    let edgeCount = 0

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x
        const center = imageData[idx]
        const neighbors = [
          imageData[idx - 1],
          imageData[idx + 1],
          imageData[idx - width],
          imageData[idx + width],
        ]
        const diff = neighbors.reduce((sum, n) => sum + Math.abs(center - n), 0) / 4

        if (diff > 30) {
          edgeCount++
        }
      }
    }

    const totalPixels = (width - 2) * (height - 2)
    return edgeCount / totalPixels
  }

  private calculateBrightness(imageData: Uint8Array): number {
    let sum = 0
    for (const pixel of imageData) {
      sum += pixel
    }
    return sum / imageData.length
  }

  private calculateContrast(imageData: Uint8Array): number {
    let min = 255
    let max = 0
    for (const pixel of imageData) {
      if (pixel < min) min = pixel
      if (pixel > max) max = pixel
    }
    return max - min
  }

  private calculateColorBalance(imageData: Uint8Array): number {
    let sum = 0
    for (const pixel of imageData) {
      sum += pixel
    }
    const avg = sum / imageData.length

    let variance = 0
    for (const pixel of imageData) {
      variance += Math.pow(pixel - avg, 2)
    }
    variance /= imageData.length

    const stdDev = Math.sqrt(variance)
    return Math.min(stdDev * 5, 100)
  }

  private analyzeTransitions(sentences: string[]): number {
    let goodTransitions = 0

    for (let i = 1; i < sentences.length; i++) {
      const prevLastChar = sentences[i - 1].slice(-1)
      const currFirstChar = sentences[i][0]

      const transitionWords = ['但是', '然而', '然后', '接着', '于是', '因此']
      const hasTransition = transitionWords.some((word) =>
        sentences[i].startsWith(word)
      )

      if (hasTransition || prevLastChar === '。' || prevLastChar === '！') {
        goodTransitions++
      }
    }

    return goodTransitions
  }

  private generateTextDetails(
    text: string,
    relevance: number,
    coherence: number,
    completeness: number
  ): TextQualityScore['details'] {
    const strengths: string[] = []
    const weaknesses: string[] = []
    const suggestions: string[] = []

    if (relevance > 80) {
      strengths.push('内容与预期高度相关')
    }
    if (coherence > 80) {
      strengths.push('逻辑连贯性强')
    }
    if (completeness > 80) {
      strengths.push('内容完整')
    }

    if (relevance < 60) {
      weaknesses.push('内容相关性不足')
      suggestions.push('增加与角色和场景相关的描述')
    }
    if (coherence < 60) {
      weaknesses.push('逻辑连贯性较差')
      suggestions.push('使用过渡词改善句子连接')
    }
    if (completeness < 60) {
      weaknesses.push('内容不完整')
      suggestions.push('补充必要的细节和结尾')
    }

    return { strengths, weaknesses, suggestions }
  }
}

export const qualityScoringService = new QualityScoringService()
