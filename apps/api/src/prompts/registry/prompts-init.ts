import { PromptTemplate } from '../types';
import { promptRegistry } from './index';

export function initializePrompts(): void {
  const agentPrompts: PromptTemplate[] = [
    {
      id: 'storyline-agent-v2',
      name: 'Storyline Agent V2',
      description: 'Generates storylines from creative ideas',
      category: 'agent',
      systemPrompt: 'You are a creative storyline generator. Generate detailed storylines from creative ideas.',
      userPromptTemplate: `请为以下故事创意生成完整的故事线：

**基本信息**
- 标题：《{{title}}》
- 类型：{{genre}}
- 目标观众：{{targetAudience}}
- 基调：{{tone}}
{{#if style}}- 风格参考：{{style}}{{/if}}
- 目标时长：{{targetDuration}} 分钟

**故事概述**
{{description}}

请返回JSON格式的故事线：
{
  "title": "最终确定的标题",
  "logline": "一句话概括故事核心冲突",
  "synopsis": "200字内的故事梗概",
  "themes": ["主题1", "主题2"],
  "structure": {
    "act1": {
      "title": "第一幕标题",
      "beats": ["情节点1", "情节点2", "情节点3"]
    },
    "act2": {
      "title": "第二幕标题",
      "beats": ["情节点1", "情节点2", "情节点3", "情节点4"]
    },
    "act3": {
      "title": "第三幕标题",
      "beats": ["情节点1", "情节点2"]
    }
  },
  "characters": [
    {
      "name": "主角名",
      "role": "主角/配角",
      "arc": "角色成长弧线",
      "description": "角色描述"
    }
  ],
  "suggestedDuration": 建议时长（分钟）,
  "suggestedStyle": "视觉风格建议"
}`,
      variables: [
        { name: 'title', type: 'string', required: true, description: 'Story title' },
        { name: 'genre', type: 'string', required: true, description: 'Story genre' },
        { name: 'targetAudience', type: 'string', required: false, description: 'Target audience', defaultValue: '大众' },
        { name: 'tone', type: 'string', required: false, description: 'Story tone', defaultValue: '平衡' },
        { name: 'style', type: 'string', required: false, description: 'Visual style reference' },
        { name: 'targetDuration', type: 'number', required: false, description: 'Target duration in minutes', defaultValue: 15 },
        { name: 'description', type: 'string', required: true, description: 'Story description' }
      ],
      metadata: {
        author: 'system',
        tags: ['storyline', 'creative', 'narrative']
      },
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'storyboard-agent-v2',
      name: 'Storyboard Agent V2',
      description: 'Generates storyboards from outlines',
      category: 'agent',
      systemPrompt: 'You are a professional storyboard artist. Convert outlines into detailed shot breakdowns.',
      userPromptTemplate: `请将以下大纲转化为详细分镜：

**大纲信息**
{{outline}}

**分镜需求**
- 风格：{{shotStyle}}
- 宽高比：{{targetAspectRatio}}
- 视觉风格：{{style}}

请返回JSON格式分镜：
{
  "title": "分镜标题",
  "shots": [
    {
      "id": "shot_1",
      "sequence": 1,
      "type": "wide",
      "description": "镜头详细描述",
      "visualPrompt": "Midjourney格式的视觉提示词",
      "negativePrompt": "负面提示词",
      "duration": 3,
      "dialogue": "可选的台词",
      "action": "动作描述",
      "camera": {
        "movement": "推/拉/摇/移/跟/固定",
        "angle": "水平/俯视/仰视",
        "distance": "远景/全景/中景/近景/特写"
      },
      "notes": "额外备注"
    }
  ],
  "totalDuration": 总时长（秒）,
  "totalShots": 镜头总数,
  "sceneBreakdown": [
    {
      "sceneId": "scene_1",
      "sceneNumber": 1,
      "title": "场景标题",
      "shots": ["shot_1", "shot_2"],
      "duration": 场景总时长
    }
  ],
  "styleGuide": {
    "visualStyle": "整体视觉风格描述",
    "colorPalette": ["主色调1", "主色调2", "主色调3"],
    "lighting": "光线风格",
    "mood": "整体氛围"
  }
}`,
      variables: [
        { name: 'outline', type: 'object', required: true, description: 'Story outline' },
        { name: 'shotStyle', type: 'string', required: false, description: 'Shot style', defaultValue: 'cinematic' },
        { name: 'targetAspectRatio', type: 'string', required: false, description: 'Target aspect ratio', defaultValue: '16:9' },
        { name: 'style', type: 'string', required: false, description: 'Visual style', defaultValue: '电影质感' }
      ],
      metadata: {
        author: 'system',
        tags: ['storyboard', 'visual', 'shots']
      },
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  for (const prompt of agentPrompts) {
    promptRegistry.register(prompt);
  }
}