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
  items: any[]
  metadata: {
    totalScenes: number
    totalCharacters: number
    totalDialogues: number
    estimatedDuration: number
  }
}
