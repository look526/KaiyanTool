import { TextSegment } from './intelligent-segmenter'
import { AISegmentResult } from './ai-processor'

export interface MergedResult {
  title?: string
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
    segmentId?: string
  }>
  characters: Map<string, {
    id: string
    name: string
    description?: string
    lines: number
  }>
  metadata: {
    totalScenes: number
    totalCharacters: number
    totalDialogues: number
    estimatedDuration: number
    segmentCount: number
  }
}

export interface MergedScene {
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
  segmentId?: string
}

export class ResultMerger {
  async mergeResults(
    segmentResults: Map<string, AISegmentResult>,
    segments: TextSegment[]
  ): Promise<MergedResult> {
    const merged: MergedResult = {
      scenes: [],
      characters: new Map(),
      metadata: {
        totalScenes: 0,
        totalCharacters: 0,
        totalDialogues: 0,
        estimatedDuration: 0,
        segmentCount: segments.length
      }
    }

    let sceneCounter = 0
    const characterMap = new Map<string, any>()

    for (const segment of segments) {
      const result = segmentResults.get(segment.id)
      if (!result) continue

      if (result.scenes) {
        for (const scene of result.scenes) {
          sceneCounter++
          const sceneWithId = {
            ...scene,
            number: sceneCounter,
            segmentId: segment.id
          } as typeof scene & { number: number; segmentId: string }
          merged.scenes.push(sceneWithId)
        }
      }

      if (result.characters) {
        for (const character of result.characters) {
          const existing = characterMap.get(character.name)
          if (existing) {
            existing.lines += character.lines
          } else {
            characterMap.set(character.name, { ...character })
          }
        }
      }
    }

    merged.characters = characterMap
    merged.metadata.totalScenes = merged.scenes.length
    merged.metadata.totalCharacters = characterMap.size
    merged.metadata.totalDialogues = this.countTotalDialogues(merged.scenes)
    merged.metadata.estimatedDuration = this.calculateDuration(merged.scenes, merged.metadata.totalDialogues)

    await this.resolveCrossSegmentConflicts(merged, segments)

    return merged
  }

  private countTotalDialogues(scenes: any[]): number {
    return scenes.reduce((sum, scene) => {
      return sum + (scene.dialogues?.length || 0)
    }, 0)
  }

  private calculateDuration(scenes: any[], dialoguesCount: number): number {
    return Math.ceil(dialoguesCount * 0.5 + scenes.length * 1)
  }

  private async resolveCrossSegmentConflicts(
    merged: MergedResult,
    segments: TextSegment[]
  ) {
    const characterNames = Array.from(merged.characters.keys())

    for (const scene of merged.scenes) {
      if (!scene.characters || scene.characters.length === 0) {
        const segmentId = scene.segmentId
        const segment = segments.find(s => s.id === segmentId)

        if (segment && segment.metadata.characters.length > 0) {
          scene.characters = segment.metadata.characters.filter(char =>
            characterNames.includes(char)
          )
        }
      }
    }
  }

  convertToArrayFormat(merged: MergedResult): any {
    return {
      title: merged.title,
      scenes: merged.scenes,
      characters: Array.from(merged.characters.values()),
      metadata: merged.metadata
    }
  }
}
