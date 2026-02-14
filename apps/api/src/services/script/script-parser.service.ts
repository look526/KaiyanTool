import { prisma } from '../../lib/prisma'
import { aiProviderService } from '../ai/provider.service'
import logger from '../../lib/logger'

export interface ScriptCharacter {
  id: string
  name: string
  description?: string
  lines: number
}

export interface ScriptDialogue {
  characterId: string
  characterName: string
  text: string
  sceneId: string
}

export interface ScriptAction {
  description: string
  sceneId: string
  type: 'action' | 'direction' | 'transition'
}

export interface ScriptScene {
  id: string
  number: number
  heading: string
  location: string
  time?: string
  description?: string
  characters: string[]
  dialogues: ScriptDialogue[]
  actions: ScriptAction[]
}

export interface ParsedScript {
  title?: string
  scenes: ScriptScene[]
  characters: ScriptCharacter[]
  metadata: {
    totalScenes: number
    totalCharacters: number
    totalDialogues: number
    estimatedDuration: number
  }
}

export class ScriptParserService {
  async parseScriptWithAI(
    userId: string,
    scriptContent: string,
    useCache: boolean = true
  ): Promise<ParsedScript> {
    try {
      if (useCache) {
        const cached = await this.getCachedParse(scriptContent)
        if (cached) {
          logger.info('使用缓存的剧本解析结果')
          return cached
        }
      }

      const provider = await prisma.aIProvider.findFirst({
        where: { userId, enabled: true },
      })

      if (!provider) {
        throw new Error('未找到启用的 AI 提供商')
      }

      const prompt = this.buildParsingPrompt(scriptContent)

      const response = await aiProviderService.chat(provider.id, [
        {
          role: 'system',
          content: '你是一位专业的剧本分析专家，擅长解析各种格式的剧本文本，提取场景、角色、对话和动作信息。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ])

      const parsed = this.parseAIResponse(response.content)

      if (useCache) {
        await this.cacheParseResult(scriptContent, parsed)
      }

      logger.info('剧本解析成功', { userId, scenesCount: parsed.scenes.length })
      return parsed
    } catch (error) {
      logger.error('剧本解析失败', { userId, error })
      throw error
    }
  }

  async parseScriptTextOnly(scriptContent: string): Promise<ParsedScript> {
    return this.parseWithRegex(scriptContent)
  }

  private buildParsingPrompt(scriptContent: string): string {
    return `请解析以下剧本内容，提取结构化信息：

剧本内容：
${scriptContent}

请以JSON格式返回，包含以下结构：
{
  "title": "剧本标题",
  "scenes": [
    {
      "id": "场景唯一标识",
      "number": 1,
      "heading": "场景标题",
      "location": "地点",
      "time": "时间（日/夜/黄昏等）",
      "description": "场景描述",
      "characters": ["角色名列表"],
      "dialogues": [
        {
          "characterName": "角色名",
          "text": "对话内容"
        }
      ],
      "actions": [
        {
          "description": "动作描述",
          "type": "action"
        }
      ]
    }
  ],
  "characters": [
    {
      "id": "角色唯一标识",
      "name": "角色名",
      "description": "角色描述",
      "lines": 10
    }
  ],
  "metadata": {
    "totalScenes": 场景总数,
    "totalCharacters": 角色总数,
    "totalDialogues": 对话总数,
    "estimatedDuration": 预估时长（分钟）
  }
}

请确保：
1. 场景按顺序编号
2. 每个场景包含完整的对话和动作信息
3. 角色列表包含每个角色的描述
4. 统计信息准确`;
  }

  private parseAIResponse(content: string): ParsedScript {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('无法解析 AI 响应')
      }

      const parsed = JSON.parse(jsonMatch[0])
      return {
        title: parsed.title || undefined,
        scenes: parsed.scenes || [],
        characters: parsed.characters || [],
        metadata: parsed.metadata || {
          totalScenes: 0,
          totalCharacters: 0,
          totalDialogues: 0,
          estimatedDuration: 0,
        },
      }
    } catch (error) {
      logger.error('解析 AI 响应失败', { error, content })
      throw new Error('剧本解析失败')
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

      const sceneMatch = trimmedLine.match(/^(场景\d+|场景\s*\d+|Scene\s*\d+)\s*[-：:]\s*(.+)/i)
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
      metadata: {
        totalScenes: scenes.length,
        totalCharacters: characterArray.length,
        totalDialogues,
        estimatedDuration,
      },
    }
  }

  private async getCachedParse(scriptContent: string): Promise<ParsedScript | null> {
    return null
  }

  private async cacheParseResult(
    scriptContent: string,
    result: ParsedScript
  ): Promise<void> {
    return
  }
}

export const scriptParserService = new ScriptParserService()
