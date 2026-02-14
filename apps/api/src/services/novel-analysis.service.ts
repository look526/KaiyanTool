import { aiProviderService } from '../services/ai/provider.service';
import { prisma } from '../lib/prisma';

interface NovelInput {
  title: string;
  author: string;
  content: string;
  genre?: string;
  style?: string;
}

interface Chapter {
  id: string;
  number: number;
  title: string;
  summary: string;
  wordCount: number;
  characters: string[];
  locations: string[];
  events: string[];
  tone: string;
  keyDialogues: string[];
}

interface NovelAnalysis {
  title: string;
  author: string;
  genre: string;
  style: string;
  themes: string[];
  setting: {
    timePeriod: string;
    locations: string[];
    atmosphere: string;
  };
  characters: Array<{
    name: string;
    role: 'protagonist' | 'antagonist' | 'supporting' | 'minor';
    description: string;
    personality: string[];
    arc: string;
    relationships: Array<{ name: string; type: string }>;
  }>;
  chapters: Chapter[];
  plotStructure: {
    introduction: string;
    risingAction: string[];
    climax: string;
    fallingAction: string[];
    resolution: string;
  };
  toneAnalysis: {
    overall: string;
    breakdown: Array<{ chapter: string; tone: string }>;
  };
  suggestedAdaptationLength: number;
}

export class NovelAnalysisService {
  private provider: AIProviderService;

  constructor() {
    this.provider = new AIProviderService();
  }

  async analyzeNovel(input: NovelInput): Promise<NovelAnalysis> {
    const content = input.content.substring(0, 50000);

    const systemPrompt = `你是一个专业的文学分析AI助手。你的专长是深度分析小说文本，提取：
1. 核心要素（标题、作者、类型、风格）
2. 主题分析
3. 角色详细档案
4. 场景和地点
5. 章节结构和摘要
6. 情节架构
7. 基调情感分析
8. 影视改编建议

请输出结构化的JSON格式分析结果。`;

    const userPrompt = `请深度分析以下小说：

**基本信息**
- 标题：${input.title}
- 作者：${input.author}
- 类型：${input.genre || '未知'}
- 风格参考：${input.style || '无'}

**小说内容**
${content}
${input.content.length > 50000 ? '\n...（内容已截断）' : ''}

请返回JSON格式的完整分析：
{
  "title": "最终确定的标题",
  "author": "作者名",
  "genre": "类型",
  "style": "写作风格描述",
  "themes": ["主题1", "主题2", "主题3"],
  "setting": {
    "timePeriod": "时代背景",
    "locations": ["地点1", "地点2"],
    "atmosphere": "整体氛围"
  },
  "characters": [
    {
      "name": "角色名",
      "role": "protagonist/antagonist/supporting/minor",
      "description": "角色描述",
      "personality": ["性格特点1", "性格特点2"],
      "arc": "角色成长弧线",
      "relationships": [{"name": "相关角色", "type": "关系类型"}]
    }
  ],
  "chapters": [
    {
      "id": "ch_1",
      "number": 1,
      "title": "章节标题",
      "summary": "章节摘要（100字内）",
      "wordCount": 字数,
      "characters": ["出场角色"],
      "locations": ["场景地点"],
      "events": ["主要事件"],
      "tone": "本章节基调和情感",
      "keyDialogues": ["关键台词"]
    }
  ],
  "plotStructure": {
    "introduction": "开篇介绍",
    "risingAction": ["铺垫事件1", "铺垫事件2", "铺垫事件3"],
    "climax": "高潮情节",
    "fallingAction": ["收尾事件1", "收尾事件2"],
    "resolution": "结局"
  },
  "toneAnalysis": {
    "overall": "整体基调和情感",
    "breakdown": [
      {"chapter": "章节1", "tone": "章节基调"}
    ]
  },
  "suggestedAdaptationLength": 建议改编时长（分钟）
}`;

    try {
      const response = await this.provider.complete(
        {
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.5,
          maxTokens: 6000
        },
        'novel-analysis'
      );

      const parsed = this.parseJsonResponse(response.content);
      return this.validateOutput(parsed);
    } catch (error) {
      console.error('Novel analysis failed:', error);
      throw new Error('小说分析失败');
    }
  }

  async extractChapters(content: string): Promise<Chapter[]> {
    const prompt = `请从以下小说文本中识别和提取章节结构：

${content.substring(0, 30000)}

请返回JSON格式的章节列表：
{
  "chapters": [
    {
      "number": 1,
      "title": "章节标题（如果原文没有则生成）",
      "summary": "本章节内容摘要（50字内）",
      "wordCount": 本章字数,
      "characters": ["本章主要角色"],
      "locations": ["本章场景"],
      "events": ["本章主要事件"],
      "tone": "本章情感基调"
    }
  ]
}`;

    try {
      const response = await this.provider.complete(
        { messages: [{ role: 'user', content: prompt }], temperature: 0.3, maxTokens: 2000 },
        'chapter-extraction'
      );

      const parsed = this.parseJsonResponse(response.content);
      return parsed.chapters || [];
    } catch (error) {
      console.error('Chapter extraction failed:', error);
      return [];
    }
  }

  async identifyCharacters(content: string): Promise<NovelAnalysis['characters']> {
    const prompt = `请从以下小说文本中识别和提取所有角色信息：

${content.substring(0, 30000)}

请返回JSON格式的角色列表：
{
  "characters": [
    {
      "name": "角色名",
      "role": "protagonist/antagonist/supporting/minor",
      "description": "角色描述（首次出场描述）",
      "personality": ["性格特点1", "性格特点2"],
      "arc": "角色成长弧线（如果可以推断）",
      "relationships": [{"name": "相关角色", "type": "关系描述"}]
    }
  ]
}`;

    try {
      const response = await this.provider.complete(
        { messages: [{ role: 'user', content: prompt }], temperature: 0.4, maxTokens: 2000 },
        'character-identification'
      );

      const parsed = this.parseJsonResponse(response.content);
      return parsed.characters || [];
    } catch (error) {
      console.error('Character identification failed:', error);
      return [];
    }
  }

  async generateScenesFromChapter(
    chapterContent: string,
    chapterNumber: number
  ): Promise<Array<{
    sceneNumber: number;
    location: string;
    time: string;
    characters: string[];
    description: string;
    dialogue: string[];
    visualPrompt: string;
  }>> {
    const prompt = `请将以下小说章节转化为场景描述：

章节 ${chapterNumber} 内容：
${chapterContent.substring(0, 10000)}

请返回JSON格式的场景拆分：
{
  "scenes": [
    {
      "sceneNumber": 1,
      "location": "场景地点（内/外）",
      "time": "时间（日/夜/晨/昏）",
      "characters": ["出场角色"],
      "description": "场景视觉描述（适合AI生成图像）",
      "dialogue": ["本场景的关键台词"],
      "visualPrompt": "Midjourney/SD格式的视觉提示词"
    }
  ]
}`;

    try {
      const response = await this.provider.complete(
        { messages: [{ role: 'user', content: prompt }], temperature: 0.5, maxTokens: 2000 },
        'scene-generation'
      );

      const parsed = this.parseJsonResponse(response.content);
      return parsed.scenes || [];
    } catch (error) {
      console.error('Scene generation failed:', error);
      return [];
    }
  }

  async adaptToScript(
    novelAnalysis: NovelAnalysis,
    options?: {
      targetLength?: number;
      focusChapters?: number[];
      style?: 'faithful' | 'condensed' | 'enhanced';
    }
  ): Promise<{
    title: string;
    logline: string;
    acts: Array<{
      number: number;
      title: string;
      chapters: number[];
      summary: string;
      scenes: Array<{
        number: number;
        description: string;
        dialogue: string[];
        visualNotes: string;
      }>;
    }>;
    totalScenes: number;
    estimatedDuration: number;
  }> {
    const prompt = `请将以下小说分析改编为剧本格式：

**小说分析**
${JSON.stringify(novelAnalysis, null, 2)}

**改编选项**
- 目标时长：${options?.targetLength || 30} 分钟
- 重点章节：${options?.focusChapters?.join(', ') || '全部'}
- 改编风格：${options?.style || '忠实原著'}

请返回JSON格式的剧本改编：
{
  "title": "改编后的剧本标题",
  "logline": "一句话故事概要",
  "acts": [
    {
      "number": 1,
      "title": "第一幕标题",
      "chapters": [1, 2, 3],
      "summary": "本幕概述",
      "scenes": [
        {
          "number": 1,
          "description": "场景描述",
          "dialogue": ["台词1", "台词2"],
          "visualNotes": "视觉提示"
        }
      ]
    }
  ],
  "totalScenes": 总场景数,
  "estimatedDuration": 预估时长（分钟）
}`;

    try {
      const response = await this.provider.complete(
        { messages: [{ role: 'user', content: prompt }], temperature: 0.5, maxTokens: 3000 },
        'script-adaptation'
      );

      return this.parseJsonResponse(response.content);
    } catch (error) {
      console.error('Script adaptation failed:', error);
      throw new Error('剧本改编失败');
    }
  }

  async saveNovelAnalysis(projectId: string, analysis: NovelAnalysis): Promise<string> {
    const novel = await prisma.document.create({
      data: {
        projectId,
        title: analysis.title,
        type: 'novel_analysis',
        content: analysis as any,
        status: 'completed'
      }
    });

    for (const character of analysis.characters) {
      await prisma.character.create({
        data: {
          projectId,
          name: character.name,
          description: character.description,
          appearance: JSON.stringify({
            personality: character.personality,
            arc: character.arc,
            relationships: character.relationships
          }),
          metadata: {
            role: character.role,
            source: 'novel_analysis'
          } as any
        }
      });
    }

    for (const chapter of analysis.chapters) {
      await prisma.scene.create({
        data: {
          projectId,
          name: chapter.title,
          description: chapter.summary,
          location: chapter.locations[0],
          timeOfDay: chapter.tone,
          metadata: {
            chapterNumber: chapter.number,
            wordCount: chapter.wordCount,
            characters: chapter.characters,
            events: chapter.events,
            keyDialogues: chapter.keyDialogues
          } as any
        }
      });
    }

    return novel.id;
  }

  async importFromFile(
    projectId: string,
    fileContent: string,
    fileType: string
  ): Promise<string> {
    let novelData: Partial<NovelInput>;

    switch (fileType) {
      case 'txt':
        novelData = await this.parseTextFile(fileContent);
        break;
      case 'docx':
        novelData = await this.parseDocxFile(fileContent);
        break;
      case 'epub':
        novelData = await this.parseEpubFile(fileContent);
        break;
      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }

    const analysis = await this.analyzeNovel({
      title: novelData.title || 'Imported Novel',
      author: novelData.author || 'Unknown',
      content: novelData.content || fileContent
    });

    return this.saveNovelAnalysis(projectId, analysis);
  }

  private async parseTextFile(content: string): Promise<Partial<NovelInput>> {
    const lines = content.split('\n');
    const title = lines[0]?.trim() || 'Untitled';
    const authorMatch = content.match(/作者[：:]\s*(.+)/i);
    const author = authorMatch ? authorMatch[1].trim() : 'Unknown';

    return { title, author, content };
  }

  private async parseDocxFile(content: string): Promise<Partial<NovelInput>> {
    console.log('Parsing DOCX file...');
    return { content };
  }

  private async parseEpubFile(content: string): Promise<Partial<NovelInput>> {
    console.log('Parsing EPUB file...');
    return { content };
  }

  private parseJsonResponse(content: string): any {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/) || content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('无法解析AI响应');
    } catch (error) {
      console.error('JSON parsing error:', error);
      throw new Error('解析格式错误');
    }
  }

  private validateOutput(output: any): NovelAnalysis {
    return {
      title: output.title || '未命名小说',
      author: output.author || '未知作者',
      genre: output.genre || '未知',
      style: output.style || '',
      themes: output.themes || [],
      setting: output.setting || { timePeriod: '', locations: [], atmosphere: '' },
      characters: output.characters || [],
      chapters: output.chapters || [],
      plotStructure: output.plotStructure || {
        introduction: '',
        risingAction: [],
        climax: '',
        fallingAction: [],
        resolution: ''
      },
      toneAnalysis: output.toneAnalysis || { overall: '', breakdown: [] },
      suggestedAdaptationLength: output.suggestedAdaptationLength || 30
    };
  }
}

export const novelAnalysisService = new NovelAnalysisService();
