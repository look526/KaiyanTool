export interface ParsedScene {
  id: string;
  index: number;
  title: string;
  description: string;
  content: string;
  startLine: number;
  endLine: number;
  characters: string[];
  dialogueCount: number;
  wordCount: number;
  type: 'interior' | 'exterior' | 'mixed' | 'unknown';
  timeOfDay: string;
}

export interface SceneParseResult {
  scenes: ParsedScene[];
  totalCharacters: string[];
  totalWordCount: number;
  totalDialogueCount: number;
}

const SCENE_PATTERNS = {
  standard: /^场景\s*(\d+)[\s\-—:：]*(.+)$/im,
  bracket: /^\[场景\s*(\d+)\][\s\-—:：]*(.+)$/im,
  movie: /^INT\.|EXT\.|内景|外景/i,
  numbered: /^(?:场景|Scene|SCENE)\s*(\d+)[\s\-—:：]*(.+)$/im,
  heading: /^#{1,3}\s*(.+)$/,
};

const TIME_PATTERNS = [
  { pattern: /白天|上午|中午|下午|黄昏|傍晚/i, label: '白天' },
  { pattern: /夜晚|深夜|凌晨|晚上|夜里/i, label: '夜晚' },
  { pattern: /黎明|清晨|早晨/i, label: '清晨' },
  { pattern: /黄昏|日落|傍晚/i, label: '黄昏' },
];

const LOCATION_PATTERNS = [
  { pattern: /室内|内景|屋内|房内|室内景/i, type: 'interior' as const },
  { pattern: /室外|外景|户外|室外景|街道|广场/i, type: 'exterior' as const },
];

export function parseScriptToScenes(content: string): SceneParseResult {
  const lines = content.split('\n');
  const scenes: ParsedScene[] = [];
  const allCharacters = new Set<string>();
  
  let currentScene: ParsedScene | null = null;
  let sceneIndex = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line) continue;
    
    const isNewScene = checkIfNewScene(line);
    
    if (isNewScene) {
      if (currentScene) {
        currentScene.endLine = i - 1;
        currentScene.content = lines.slice(currentScene.startLine, i).join('\n');
        currentScene.wordCount = calculateWordCount(currentScene.content);
        scenes.push(currentScene);
      }
      
      sceneIndex++;
      currentScene = createNewScene(line, i, sceneIndex);
    } else if (currentScene) {
      const character = extractCharacterFromLine(line);
      if (character) {
        allCharacters.add(character);
        currentScene.characters.push(character);
        currentScene.dialogueCount++;
      }
    }
  }
  
  if (currentScene) {
    currentScene.endLine = lines.length - 1;
    currentScene.content = lines.slice(currentScene.startLine).join('\n');
    currentScene.wordCount = calculateWordCount(currentScene.content);
    scenes.push(currentScene);
  }
  
  return {
    scenes,
    totalCharacters: Array.from(allCharacters),
    totalWordCount: scenes.reduce((sum, s) => sum + s.wordCount, 0),
    totalDialogueCount: scenes.reduce((sum, s) => sum + s.dialogueCount, 0),
  };
}

function checkIfNewScene(line: string): boolean {
  if (SCENE_PATTERNS.standard.test(line)) return true;
  if (SCENE_PATTERNS.bracket.test(line)) return true;
  if (SCENE_PATTERNS.movie.test(line)) return true;
  if (SCENE_PATTERNS.numbered.test(line)) return true;
  if (SCENE_PATTERNS.heading.test(line)) return true;
  return false;
}

function createNewScene(line: string, lineIndex: number, index: number): ParsedScene {
  let title = line;
  let description = '';
  
  const standardMatch = line.match(SCENE_PATTERNS.standard);
  if (standardMatch) {
    title = `场景 ${standardMatch[1]}`;
    description = standardMatch[2].trim();
  }
  
  const bracketMatch = line.match(SCENE_PATTERNS.bracket);
  if (bracketMatch) {
    title = `场景 ${bracketMatch[1]}`;
    description = bracketMatch[2].trim();
  }
  
  const headingMatch = line.match(SCENE_PATTERNS.heading);
  if (headingMatch) {
    title = headingMatch[1].trim();
    description = title;
  }
  
  const numberedMatch = line.match(SCENE_PATTERNS.numbered);
  if (numberedMatch && !standardMatch && !bracketMatch) {
    title = `场景 ${numberedMatch[1]}`;
    description = numberedMatch[2].trim();
  }
  
  const type = determineLocationType(line);
  const timeOfDay = determineTimeOfDay(line);
  
  return {
    id: `scene-${Date.now()}-${index}`,
    index,
    title,
    description,
    content: '',
    startLine: lineIndex,
    endLine: lineIndex,
    characters: [],
    dialogueCount: 0,
    wordCount: 0,
    type,
    timeOfDay,
  };
}

function determineLocationType(line: string): ParsedScene['type'] {
  for (const { pattern, type } of LOCATION_PATTERNS) {
    if (pattern.test(line)) return type;
  }
  return 'unknown';
}

function determineTimeOfDay(line: string): string {
  for (const { pattern, label } of TIME_PATTERNS) {
    if (pattern.test(line)) return label;
  }
  return '未指定';
}

function extractCharacterFromLine(line: string): string | null {
  const dialoguePatterns = [
    /^([^：:]+)[：:]/,
    /^([^（(]+)（[^）)]*）[：:]/,
    /^【([^】]+)】/,
  ];
  
  for (const pattern of dialoguePatterns) {
    const match = line.match(pattern);
    if (match) {
      const character = match[1].trim();
      if (character.length > 0 && character.length < 20 && !/^[（(【]/.test(character)) {
        return character;
      }
    }
  }
  
  return null;
}

function calculateWordCount(text: string): number {
  const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
  return chineseChars + englishWords;
}

export function getSceneAtPosition(content: string, lineNumber: number): ParsedScene | null {
  const result = parseScriptToScenes(content);
  return result.scenes.find(s => lineNumber >= s.startLine && lineNumber <= s.endLine) || null;
}

export function getScenesByRange(content: string, startLine: number, endLine: number): ParsedScene[] {
  const result = parseScriptToScenes(content);
  return result.scenes.filter(s => s.startLine <= endLine && s.endLine >= startLine);
}

export function formatSceneForDisplay(scene: ParsedScene): string {
  const lines = [
    `【${scene.title}】`,
    `类型: ${scene.type === 'interior' ? '室内' : scene.type === 'exterior' ? '室外' : '未指定'}`,
    `时间: ${scene.timeOfDay}`,
    `角色: ${scene.characters.length > 0 ? scene.characters.join(', ') : '无'}`,
    `对话数: ${scene.dialogueCount}`,
    `字数: ${scene.wordCount}`,
    '',
    scene.content,
  ];
  return lines.join('\n');
}
