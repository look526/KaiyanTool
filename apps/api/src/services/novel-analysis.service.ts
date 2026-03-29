import { aiProviderService } from '../services/ai/provider.service';
import { prisma } from '../lib/prisma';
import { NOVEL_ANALYSIS_PROMPTS } from '../prompts/services';
import crypto from 'crypto';
import { getOrCreateDefaultEpisode } from '../utils/episode-resolver';

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
  constructor() {}

  async analyzeNovel(input: NovelInput): Promise<NovelAnalysis> {
    const content = input.content.substring(0, 50000);

    const systemPrompt = NOVEL_ANALYSIS_PROMPTS.systemPrompt;

    const userPrompt = NOVEL_ANALYSIS_PROMPTS.userPromptTemplate
      .replace('{{title}}', input.title)
      .replace('{{author}}', input.author)
      .replace('{{genre}}', input.genre || '未知')
      .replace('{{style}}', input.style || '无')
      .replace('{{content}}', content)
      .replace('{{isTruncated}}', input.content.length > 50000 ? 'true' : '');

    try {
      const response = await aiProviderService.chat(
        'default',
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        undefined
      );

      const parsed = this.parseJsonResponse(response.content);
      return this.validateOutput(parsed);
    } catch (error) {
      console.error('Novel analysis failed:', error);
      throw new Error('小说分析失败');
    }
  }

  async extractChapters(content: string): Promise<Chapter[]> {
    const prompt = NOVEL_ANALYSIS_PROMPTS.extractChaptersPrompt
      .replace('{{content}}', content.substring(0, 30000));

    try {
      const response = await aiProviderService.chat(
        'default',
        [{ role: 'user', content: prompt }],
        undefined
      );

      const parsed = this.parseJsonResponse(response.content);
      return parsed.chapters || [];
    } catch (error) {
      console.error('Chapter extraction failed:', error);
      return [];
    }
  }

  async identifyCharacters(content: string): Promise<NovelAnalysis['characters']> {
    const prompt = NOVEL_ANALYSIS_PROMPTS.identifyCharactersPrompt
      .replace('{{content}}', content.substring(0, 30000));

    try {
      const response = await aiProviderService.chat(
        'default',
        [{ role: 'user', content: prompt }],
        undefined
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
    const prompt = NOVEL_ANALYSIS_PROMPTS.generateScenesPrompt
      .replace('{{chapterNumber}}', String(chapterNumber))
      .replace('{{chapterContent}}', chapterContent.substring(0, 10000));

    try {
      const response = await aiProviderService.chat(
        'default',
        [{ role: 'user', content: prompt }],
        undefined
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
    const prompt = NOVEL_ANALYSIS_PROMPTS.adaptToScriptPrompt
      .replace('{{novelAnalysis}}', JSON.stringify(novelAnalysis, null, 2))
      .replace('{{targetLength}}', String(options?.targetLength || 30))
      .replace('{{focusChapters}}', options?.focusChapters?.join(', ') || '全部')
      .replace('{{style}}', options?.style || '忠实原著');

    try {
      const response = await aiProviderService.chat(
        'default',
        [{ role: 'user', content: prompt }],
        undefined
      );

      return this.parseJsonResponse(response.content);
    } catch (error) {
      console.error('Script adaptation failed:', error);
      throw new Error('剧本改编失败');
    }
  }

  async saveNovelAnalysis(project_id: string, analysis: NovelAnalysis): Promise<string> {
    const novel = await prisma.document.create({
      data: {
        id: crypto.randomUUID(),
        project_id,
        title: analysis.title,
        type: 'novel_analysis',
        content: analysis as any,
        status: 'completed',
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    for (const character of analysis.characters) {
      await prisma.character.create({
        data: {
          id: crypto.randomUUID(),
          project_id,
          name: character.name,
          appearance: JSON.stringify({
            role: character.role,
            source: 'novel_analysis',
            description: character.description,
            personality: character.personality,
            arc: character.arc,
            relationships: character.relationships
          }),
          created_at: new Date(),
          updated_at: new Date()
        }
      });
    }

    const episode = await getOrCreateDefaultEpisode(project_id);
    for (const chapter of analysis.chapters) {
      await prisma.scene.create({
        data: {
          id: crypto.randomUUID(),
          episode_id: episode.id,
          project_id,
          location: chapter.locations[0] || '',
          time: chapter.tone,
          description: null,
          created_at: new Date(),
          updated_at: new Date()
        }
      });
    }

    return novel.id;
  }

  async importFromFile(
    project_id: string,
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

    return this.saveNovelAnalysis(project_id, analysis);
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
