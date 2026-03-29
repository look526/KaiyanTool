import logger from '../../lib/logger'
import { largeTextProcessingService } from '../large-text'
import { mapInternalParsedScriptToV1, mapProcessResultToV1 } from './parsed-script-v1.mapper'
import type { ParsedScript, ScriptScene, ScriptCharacter, ScriptDialogue, ScriptAction } from './script-parser.types'
import type { ParsedScriptV1, ScriptKind } from '@ai-content-platform/shared'

export type {
  ScriptCharacter,
  ScriptDialogue,
  ScriptAction,
  ScriptScene,
  ParsedScript,
} from './script-parser.types'

export class ScriptParserService {
  /**
   * 正则快速解析，输出 ParsedScriptV1（与 AI 管线同形）。
   */
  async parseScriptTextOnly(
    scriptContent: string,
    scriptKind: ScriptKind = 'standard'
  ): Promise<ParsedScriptV1> {
    const raw = this.parseWithRegex(scriptContent)
    return mapInternalParsedScriptToV1(raw, scriptKind)
  }

  async parseScriptWithLargeText(
    userId: string,
    scriptContent: string,
    options: {
      useCache?: boolean
      onProgress?: (progress: number, message: string) => void
      model?: string
      providerId?: string
      scriptKind?: ScriptKind
    } = {}
  ): Promise<ParsedScriptV1> {
    try {
      const result = await largeTextProcessingService.processLargeText(userId, scriptContent, {
        useCache: options.useCache,
        onProgress: options.onProgress,
        model: options.model,
        providerId: options.providerId,
        scriptKind: options.scriptKind ?? 'standard',
      })

      return mapProcessResultToV1(result, options.scriptKind ?? 'standard')
    } catch (error) {
      logger.error('大文本解析失败', { userId, error })
      throw error
    }
  }

  private parseWithRegex(scriptContent: string): ParsedScript {
    const scenes: ScriptScene[] = []
    const characters: Map<string, ScriptCharacter> = new Map()
    const lines = scriptContent.split('\n')
    let currentScene: Partial<ScriptScene> | null = null
    let sceneNumber = 0
    const dialogueMap = new Map<string, ScriptDialogue[]>()
    const actionMap = new Map<string, ScriptAction[]>()

    for (const line of lines) {
      const trimmedLine = line.trim()
      if (!trimmedLine) continue

      const sceneMatch = trimmedLine.match(/^\*{0,2}(场景\d+|场景\s*\d+|Scene\s*\d+)\s*[-：:]\s*(.+)/i)
      const bracketSceneMatch = trimmedLine.match(/^\[场景(\d+)\]\s*(.+)/i)
      const intExtMatch = trimmedLine.match(/^(内|外)\.?景\s*(.+)$/i)

      if (sceneMatch || bracketSceneMatch) {
        if (currentScene) {
          const sceneId = currentScene.id || `scene_${sceneNumber}`
          scenes.push({
            id: sceneId,
            number: sceneNumber,
            heading: currentScene.heading || `场景 ${sceneNumber}`,
            location: currentScene.location || '未知',
            time: currentScene.time,
            description: currentScene.description,
            characters: currentScene.characters || [],
            dialogues: dialogueMap.get(sceneId) || [],
            actions: actionMap.get(sceneId) || [],
          })
        }
        sceneNumber++
        const description = bracketSceneMatch ? bracketSceneMatch[2] : sceneMatch![2]
        currentScene = {
          id: `scene_${sceneNumber}`,
          heading: `场景 ${sceneNumber}`,
          location: description.trim(),
        }
        continue
      }

      if (intExtMatch && currentScene) {
        const parts = intExtMatch[2].trim().split(/\s+/, 2)
        currentScene.location = parts[0] || currentScene.location || '未知'
        if (parts.length > 1) {
          currentScene.time = parts[1]
        }
        continue
      }

      const characterMatch = trimmedLine.match(/^([^\uff1a\uff3b:：:]+)[\uff1a\uff3b:：:]\s*(.+)/)
      if (characterMatch && currentScene) {
        const characterName = characterMatch[1].trim()
        const text = characterMatch[2].trim()

        if (!currentScene.characters) {
          currentScene.characters = []
        }
        if (!currentScene.characters.includes(characterName)) {
          currentScene.characters.push(characterName)
        }

        const sceneId = currentScene.id || `scene_${sceneNumber}`
        const sceneDialogues = dialogueMap.get(sceneId) || []
        sceneDialogues.push({
          characterId: `char_${characterName}`,
          characterName,
          text,
          sceneId,
        })
        dialogueMap.set(sceneId, sceneDialogues)

        const char = characters.get(characterName)
        if (char) {
          char.lines++
        } else {
          characters.set(characterName, {
            id: `char_${characterName}`,
            name: characterName,
            lines: 1,
          })
        }
        continue
      }

      const actionMatch = trimmedLine.match(/^\(?(.+)\)?$/)
      const directionMatch = trimmedLine.match(/^(→|←|↑|↓|→|推|拉|摇|移)\s*(.+)/)

      if (actionMatch && currentScene) {
        const sceneId = currentScene.id || `scene_${sceneNumber}`
        const sceneActions = actionMap.get(sceneId) || []
        sceneActions.push({
          description: actionMatch[1],
          sceneId,
          type: 'action',
        })
        actionMap.set(sceneId, sceneActions)
      } else if (directionMatch && currentScene) {
        const sceneId = currentScene.id || `scene_${sceneNumber}`
        const sceneActions = actionMap.get(sceneId) || []
        sceneActions.push({
          description: directionMatch[2],
          sceneId,
          type: 'direction',
        })
        actionMap.set(sceneId, sceneActions)
      }
    }

    if (currentScene) {
      const sceneId = currentScene.id || `scene_${sceneNumber}`
      scenes.push({
        id: sceneId,
        number: sceneNumber,
        heading: currentScene.heading || `场景 ${sceneNumber}`,
        location: currentScene.location || '未知',
        time: currentScene.time,
        description: currentScene.description,
        characters: currentScene.characters || [],
        dialogues: dialogueMap.get(sceneId) || [],
        actions: actionMap.get(sceneId) || [],
      })
    }

    const characterArray = Array.from(characters.values())
    const totalDialogues = Array.from(dialogueMap.values()).reduce(
      (sum, d) => sum + d.length,
      0
    )
    const estimatedDuration = Math.ceil(totalDialogues * 0.5 + scenes.length * 1)

    return {
      title: undefined,
      scenes,
      characters: characterArray,
      items: [],
      metadata: {
        totalScenes: scenes.length,
        totalCharacters: characterArray.length,
        totalDialogues,
        estimatedDuration,
      },
    }
  }

}

export const scriptParserService = new ScriptParserService()
