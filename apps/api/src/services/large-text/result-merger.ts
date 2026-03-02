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
      shot?: {
        type: string
        movement: string
        angle: string
        description: string
        duration: number
        transition: string
      }
    }>
    actions: Array<{
      description: string
      type: string
      shot?: {
        type: string
        movement: string
        angle: string
        description: string
        duration: number
        transition: string
      }
    }>
    items?: Array<{
      name: string
      size?: string
      shape?: string
      color?: string
    }>
    segmentId?: string
  }>
  characters: Map<string, {
    id: string
    name: string
    description?: string
    appearance?: string
    lines: number
  }>
  items: Map<string, {
    name: string
    size?: string
    shape?: string
    color?: string
    scenes: string[]
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
    shot?: {
      type: string
      movement: string
      angle: string
      description: string
      duration: number
      transition: string
    }
  }>
  actions: Array<{
    description: string
    type: string
    shot?: {
      type: string
      movement: string
      angle: string
      description: string
      duration: number
      transition: string
    }
  }>
  items?: Array<{
    name: string
    size?: string
    shape?: string
    color?: string
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
      items: new Map(),
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
    const itemMap = new Map<string, any>()

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

          // 收集物品
          if (scene.items && Array.isArray(scene.items)) {
            for (const item of scene.items) {
              if (!item.name) continue
              const existing = itemMap.get(item.name)
              if (existing) {
                existing.scenes.push(scene.id || `scene_${sceneCounter}`)
              } else {
                itemMap.set(item.name, {
                  name: item.name,
                  size: item.size,
                  shape: item.shape,
                  color: item.color,
                  scenes: [scene.id || `scene_${sceneCounter}`]
                })
              }
            }
          }
        }
      }

      if (result.characters) {
        for (const character of result.characters) {
          const existing = characterMap.get(character.name)
          if (existing) {
            existing.lines += character.lines || 0
            if (character.appearance && !existing.appearance) {
              existing.appearance = character.appearance
            }
          } else {
            characterMap.set(character.name, { 
              ...character,
              lines: character.lines || 0
            })
          }
        }
      }
    }

    merged.characters = characterMap
    merged.items = itemMap
    merged.metadata.totalScenes = merged.scenes.length
    merged.metadata.totalCharacters = characterMap.size
    merged.metadata.totalDialogues = this.countTotalDialogues(merged.scenes)
    merged.metadata.estimatedDuration = this.calculateDuration(merged.scenes, merged.metadata.totalDialogues)

    console.log('[ResultMerger] merged.scenes length:', merged.scenes.length)
    console.log('[ResultMerger] merged.items size:', merged.items.size)
    console.log('[ResultMerger] merged.items:', Array.from(merged.items.values()))
    console.log('[ResultMerger] characterMap size:', characterMap.size)

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
      items: Array.from(merged.items.values()),
      metadata: merged.metadata
    }
  }
}
