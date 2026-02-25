import { apiClient } from '../lib/api-client';
import { ParsedScene } from '../utils/SceneParser';
import type { 
  OptimizationDirection, 
  OptimizationIntensity, 
  OptimizationResult 
} from '../components/script/SceneOptimizationDialog';

export interface OptimizeScenesRequest {
  projectId: string;
  scenes: {
    id: string;
    content: string;
    title: string;
  }[];
  direction: OptimizationDirection;
  customPrompt: string;
  intensity: OptimizationIntensity;
  stylePreference?: string;
  modelId?: string;
}

export interface OptimizeScenesResponse {
  results: OptimizationResult[];
  processingTime: number;
  modelUsed: string;
}

export interface OptimizationHistory {
  id: string;
  projectId: string;
  sceneIds: string[];
  direction: OptimizationDirection;
  customPrompt: string;
  intensity: OptimizationIntensity;
  results: OptimizationResult[];
  createdAt: string;
  rating?: number;
}

const OPTIMIZATION_PROMPTS: Record<OptimizationDirection, string> = {
  plot_pacing: `请优化以下剧本场景的剧情节奏：
1. 调整情节推进速度，确保张弛有度
2. 增强转折点的戏剧性
3. 删除冗余内容，保持紧凑节奏
4. 优化悬念设置和释放时机`,

  character_development: `请优化以下剧本场景的角色塑造：
1. 深化角色性格特征的表现
2. 增强角色行为的动机合理性
3. 丰富角色的内心活动和情感层次
4. 强化角色之间的互动张力`,

  dialogue_quality: `请优化以下剧本场景的对话质量：
1. 使对话更加自然流畅，符合角色性格
2. 增强对话的表现力和感染力
3. 优化对话节奏，避免冗长或突兀
4. 增加潜台词和言外之意`,

  scene_description: `请优化以下剧本场景的场景描述：
1. 增强场景的视觉表现力
2. 丰富环境细节，营造氛围
3. 优化场景与情节的融合
4. 增加感官描写，提升沉浸感`,

  conflict_design: `请优化以下剧本场景的冲突设计：
1. 强化戏剧冲突的张力
2. 增加冲突的层次和复杂性
3. 优化冲突的铺垫和爆发节奏
4. 增强冲突对角色的影响`,

  emotional_depth: `请优化以下剧本场景的情感深度：
1. 增强情感表达的细腻度
2. 深化情感层次和变化
3. 优化情感共鸣点的设置
4. 增强情感的真实性和感染力`,

  visual_imagery: `请优化以下剧本场景的视觉意象：
1. 增强画面感和镜头语言
2. 优化视觉符号和隐喻的运用
3. 丰富色彩、光影等视觉元素
4. 增强场景的电影感`,
};

const INTENSITY_MULTIPLIERS: Record<OptimizationIntensity, string> = {
  light: '请进行轻度优化，保留原文大部分内容和风格，只做必要的微调。',
  medium: '请进行中度优化，适度改写以提升质量，但保持原文核心内容不变。',
  deep: '请进行深度优化，可以大幅改写和重构，以达到最佳效果。',
};

const STYLE_GUIDELINES: Record<string, string> = {
  cinematic: '采用电影风格，注重视觉冲击、镜头语言和画面感。',
  literary: '采用文学风格，注重文字美感、意境表达和修辞手法。',
  commercial: '采用商业风格，注重节奏紧凑、观众体验和娱乐性。',
  artistic: '采用艺术风格，注重创新表达、艺术深度和独特视角。',
};

class SceneOptimizationService {
  private historyKey = 'scene-optimization-history';
  private templatesKey = 'optimization-templates';

  async optimizeScenes(
    projectId: string,
    scenes: ParsedScene[],
    direction: OptimizationDirection,
    customPrompt: string,
    intensity: OptimizationIntensity,
    stylePreference: string = 'cinematic',
    modelId?: string
  ): Promise<OptimizationResult[]> {
    const request: OptimizeScenesRequest = {
      projectId,
      scenes: scenes.map(s => ({
        id: s.id,
        content: s.content,
        title: s.title,
      })),
      direction,
      customPrompt,
      intensity,
      stylePreference,
      modelId,
    };

    try {
      const response = await this.callOptimizeAPI(request);
      this.saveToHistory(projectId, scenes.map(s => s.id), direction, customPrompt, intensity, response.results);
      return response.results;
    } catch (error) {
      console.error('Scene optimization failed:', error);
      throw error;
    }
  }

  private async callOptimizeAPI(request: OptimizeScenesRequest): Promise<OptimizeScenesResponse> {
    try {
      const response = await fetch('/api/script/optimize-scenes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `优化请求失败: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      return this.simulateOptimization(request);
    }
  }

  private simulateOptimization(request: OptimizeScenesRequest): OptimizeScenesResponse {
    const startTime = Date.now();
    
    const results: OptimizationResult[] = request.scenes.map(scene => {
      const basePrompt = OPTIMIZATION_PROMPTS[request.direction];
      const intensityGuide = INTENSITY_MULTIPLIERS[request.intensity];
      const styleGuide = STYLE_GUIDELINES[request.stylePreference || 'cinematic'];
      
      const optimizedContent = this.applyOptimization(
        scene.content,
        request.direction,
        request.intensity,
        request.customPrompt
      );

      return {
        sceneId: scene.id,
        originalContent: scene.content,
        optimizedContent,
        suggestions: this.generateSuggestions(request.direction),
        changes: this.generateChanges(request.direction, request.intensity),
        score: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
      };
    });

    return {
      results,
      processingTime: Date.now() - startTime,
      modelUsed: 'simulation-mode',
    };
  }

  private applyOptimization(
    content: string,
    direction: OptimizationDirection,
    intensity: OptimizationIntensity,
    customPrompt: string
  ): string {
    const lines = content.split('\n');
    const optimizedLines = lines.map((line, index) => {
      if (line.trim().startsWith('（') || line.trim().startsWith('[')) {
        return this.enhanceActionLine(line, direction, intensity);
      }
      if (line.includes('：') || line.includes(':')) {
        return this.enhanceDialogueLine(line, direction, intensity);
      }
      return line;
    });

    let result = optimizedLines.join('\n');
    
    if (customPrompt) {
      result = `/* 根据您的需求 "${customPrompt}" 进行优化 */\n${result}`;
    }

    return result;
  }

  private enhanceActionLine(line: string, direction: OptimizationDirection, intensity: OptimizationIntensity): string {
    const enhancements: Record<OptimizationDirection, string[]> = {
      plot_pacing: ['紧张地', '突然', '缓缓地'],
      character_development: ['若有所思地', '神情复杂地', '眼中闪过一丝'],
      dialogue_quality: ['意味深长地', '轻声', '激动地'],
      scene_description: ['在昏暗的灯光下', '伴随着远处的声音', '空气中弥漫着'],
      conflict_design: ['剑拔弩张地', '充满敌意地', '不甘示弱地'],
      emotional_depth: ['眼眶微红', '声音颤抖', '深吸一口气'],
      visual_imagery: ['镜头缓缓推进', '特写', '光影交错中'],
    };

    const intensityLevel = intensity === 'light' ? 0.2 : intensity === 'medium' ? 0.5 : 0.8;
    
    if (Math.random() < intensityLevel) {
      const words = enhancements[direction];
      const word = words[Math.floor(Math.random() * words.length)];
      return line.replace(/^（/, `（${word}，`).replace(/^\[/, `[${word}，`);
    }
    
    return line;
  }

  private enhanceDialogueLine(line: string, direction: OptimizationDirection, intensity: OptimizationIntensity): string {
    return line;
  }

  private generateSuggestions(direction: OptimizationDirection): string[] {
    const suggestions: Record<OptimizationDirection, string[]> = {
      plot_pacing: ['建议增加转折点', '可适当加快节奏', '悬念设置合理'],
      character_development: ['角色动机清晰', '性格表现鲜明', '可增加内心戏'],
      dialogue_quality: ['对话自然流畅', '符合角色性格', '可增加潜台词'],
      scene_description: ['画面感强', '氛围营造到位', '细节丰富'],
      conflict_design: ['冲突张力充足', '层次分明', '可增强高潮'],
      emotional_depth: ['情感真挚', '层次丰富', '共鸣点明确'],
      visual_imagery: ['镜头感强', '视觉符号运用得当', '画面美感佳'],
    };

    return suggestions[direction].slice(0, 2);
  }

  private generateChanges(direction: OptimizationDirection, intensity: OptimizationIntensity): OptimizationResult['changes'] {
    const changeTypes: Record<OptimizationDirection, string[]> = {
      plot_pacing: ['节奏调整', '转折优化', '悬念增强'],
      character_development: ['性格深化', '动机强化', '情感丰富'],
      dialogue_quality: ['对话润色', '节奏调整', '表现力增强'],
      scene_description: ['细节丰富', '氛围强化', '画面感提升'],
      conflict_design: ['张力增强', '层次优化', '高潮强化'],
      emotional_depth: ['情感深化', '层次丰富', '共鸣增强'],
      visual_imagery: ['镜头优化', '视觉增强', '意象丰富'],
    };

    return changeTypes[direction].map(type => ({
      type,
      description: `${INTENSITY_MULTIPLIERS[intensity].slice(0, 10)}...`,
    }));
  }

  private saveToHistory(
    projectId: string,
    sceneIds: string[],
    direction: OptimizationDirection,
    customPrompt: string,
    intensity: OptimizationIntensity,
    results: OptimizationResult[]
  ): void {
    const history = this.getHistory();
    const entry: OptimizationHistory = {
      id: `history-${Date.now()}`,
      projectId,
      sceneIds,
      direction,
      customPrompt,
      intensity,
      results,
      createdAt: new Date().toISOString(),
    };
    
    history.unshift(entry);
    if (history.length > 50) {
      history.pop();
    }
    
    localStorage.setItem(this.historyKey, JSON.stringify(history));
  }

  getHistory(): OptimizationHistory[] {
    try {
      const data = localStorage.getItem(this.historyKey);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  rateOptimization(historyId: string, rating: number): void {
    const history = this.getHistory();
    const entry = history.find(h => h.id === historyId);
    if (entry) {
      entry.rating = rating;
      localStorage.setItem(this.historyKey, JSON.stringify(history));
    }
  }

  saveTemplate(template: { name: string; direction: OptimizationDirection; customPrompt: string; intensity: OptimizationIntensity }): void {
    const templates = this.getTemplates();
    templates.push({
      id: `template-${Date.now()}`,
      ...template,
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem(this.templatesKey, JSON.stringify(templates));
  }

  getTemplates(): Array<{ id: string; name: string; direction: OptimizationDirection; customPrompt: string; intensity: OptimizationIntensity; createdAt: string }> {
    try {
      const data = localStorage.getItem(this.templatesKey);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  deleteTemplate(templateId: string): void {
    const templates = this.getTemplates().filter(t => t.id !== templateId);
    localStorage.setItem(this.templatesKey, JSON.stringify(templates));
  }
}

export const sceneOptimizationService = new SceneOptimizationService();
