// AI提供商模型列表
export interface ModelInfo {
  name: string;
  model_id: string;
  description: string;
  capabilities: string[];
  types?: string[];
}

export interface ProviderModels {
  [key: string]: ModelInfo[];
}

export const PROVIDER_MODELS: ProviderModels = {
  openai: [
    {
      name: 'GPT-5.4',
      model_id: 'gpt-5.4',
      description: 'OpenAI最新旗舰模型，支持100万Token上下文，83%专业任务超越人类',
      capabilities: ['对话', '创作', '翻译', '代码', '推理', '多模态']
    },
    {
      name: 'GPT-5.4 Pro',
      model_id: 'gpt-5.4-pro',
      description: 'GPT-5.4专业版，针对复杂任务优化，性能更强大',
      capabilities: ['对话', '创作', '翻译', '代码', '推理', '多模态', '专业任务']
    },
    {
      name: 'GPT-5.3 Instant',
      model_id: 'gpt-5.3-instant',
      description: 'GPT-5.3快速版，响应速度快，适合日常对话和简单任务',
      capabilities: ['对话', '创作', '翻译', '代码']
    },
    {
      name: 'GPT-4o',
      model_id: 'gpt-4o',
      description: 'GPT-4系列多模态模型，支持图像和文本',
      capabilities: ['对话', '创作', '翻译', '代码', '多模态']
    },
    {
      name: 'GPT-4 Turbo',
      model_id: 'gpt-4-turbo',
      description: 'GPT-4系列高性能模型，支持128K上下文',
      capabilities: ['对话', '创作', '翻译', '代码']
    }
  ],
  google: [
    {
      name: 'Gemini 3.1 Flash-Lite',
      model_id: 'gemini-3.1-flash-lite',
      description: 'Google最新轻量模型，速度快，适合大规模部署',
      capabilities: ['对话', '创作', '翻译', '代码', '推理']
    },
    {
      name: 'Gemini 3.0 Pro',
      model_id: 'gemini-3.0-pro',
      description: 'Google旗舰模型，76.2%工业级Bug修复准确率，1M超长上下文',
      capabilities: ['对话', '创作', '翻译', '代码', '推理', '多模态']
    },
    {
      name: 'Gemini 3.0 Ultra',
      model_id: 'gemini-3.0-ultra',
      description: 'Google最强大的模型，性能超越GPT-4',
      capabilities: ['对话', '创作', '翻译', '代码', '推理', '多模态', '专业任务']
    },
    {
      name: 'Gemini 2.5 Flash',
      model_id: 'gemini-2.5-flash',
      description: 'Gemini 2.5系列轻量模型，速度快，成本低',
      capabilities: ['对话', '创作', '翻译']
    },
    {
      name: 'Gemini 2.5 Pro',
      model_id: 'gemini-2.5-pro',
      description: 'Gemini 2.5系列专业模型，平衡性能和成本',
      capabilities: ['对话', '创作', '翻译', '代码', '推理']
    }
  ],
  zhipu: [
    {
      name: 'GLM-4.7',
      model_id: 'glm-4.7',
      description: '智普AI最新旗舰模型，支持多模态和长上下文',
      capabilities: ['对话', '创作', '翻译', '代码', '推理', '多模态']
    },
    {
      name: 'GLM-4',
      model_id: 'glm-4',
      description: '智普AI GLM-4基础模型，性能稳定',
      capabilities: ['对话', '创作', '翻译', '代码']
    },
    {
      name: 'GLM-3-Turbo',
      model_id: 'glm-3-turbo',
      description: '智普AI GLM-3系列高性能模型',
      capabilities: ['对话', '创作', '翻译', '代码']
    },
    {
      name: 'GLM-3',
      model_id: 'glm-3',
      description: '智普AI GLM-3基础模型',
      capabilities: ['对话', '创作', '翻译']
    }
  ],
  antsk: [
    {
      name: 'Qwen 3.0',
      model_id: 'qwen-3.0',
      description: '阿里通义千问3.0模型，支持多模态',
      capabilities: ['对话', '创作', '翻译', '代码', '多模态']
    },
    {
      name: 'Qwen 2.5',
      model_id: 'qwen-2.5',
      description: '阿里通义千问2.5模型，性能稳定',
      capabilities: ['对话', '创作', '翻译', '代码']
    }
  ],
  seedream: [
    {
      name: 'Seedream 5.0',
      model_id: 'doubao-seedream-5-0',
      description: '字节跳动 Seed 团队研发的最新图像生成模型，支持文生图、图生图、多图参考，支持 2K/3K 分辨率输出，支持联网搜索获取最新现实信息',
      capabilities: ['文生图', '图生图', '多图参考', '图像编辑']
    }
  ],
  'ecloud-seedance': [
    {
      name: 'Doubao Seedance 2.0',
      model_id: 'doubao-seedance-2.0',
      description: '移动云 AICC-Doubao-Seedance 2.0 视频生成模型，支持文生视频、首帧/首尾帧图生视频、多模态参考生视频，可生成有声或无声视频。',
      capabilities: ['文生视频', '图生视频', '首尾帧', '参考图', '有声视频'],
      types: ['video']
    }
  ],
  'ecloud-qwen-image': [
    {
      name: '移动云千问 Image2 Pro',
      model_id: 'qwen/qwen-image-2.0-pro',
      description: '移动云千问图像生成与编辑模型 Pro，支持文生图、图生图、多图参考和复杂文字渲染。',
      capabilities: ['文生图', '图生图', '图像编辑', '多图参考', '复杂文字渲染'],
      types: ['image']
    }
  ],
  toapis: [
    // Chat 模型
    {
      name: 'GPT-5',
      model_id: 'gpt-5',
      description: 'OpenAI 最新旗舰大语言模型，支持超长上下文和高级推理',
      capabilities: ['对话', '创作', '翻译', '代码', '推理', '多模态']
    },
    {
      name: 'GPT-4o',
      model_id: 'gpt-4o',
      description: 'OpenAI GPT-4o 多模态模型，支持图像和文本理解',
      capabilities: ['对话', '创作', '翻译', '代码', '多模态']
    },
    {
      name: 'Claude 3.5',
      model_id: 'claude-3-5-sonnet',
      description: 'Anthropic Claude 3.5 Sonnet 模型，擅长编程和复杂推理',
      capabilities: ['对话', '创作', '翻译', '代码', '推理']
    },
    {
      name: 'Gemini 2.0 Flash',
      model_id: 'gemini-2.0-flash',
      description: 'Google Gemini 2.0 Flash 模型，速度快，成本低',
      capabilities: ['对话', '创作', '翻译', '代码']
    },
    // 图片模型
    {
      name: 'GPT-4o Image',
      model_id: 'gpt-4o-image',
      description: 'OpenAI GPT-4o 图像生成模型，支持高质量图像创作',
      capabilities: ['文生图', '图生图', '图像编辑']
    },
    {
      name: 'Gemini 3 Pro Image',
      model_id: 'gemini-3-pro-image-preview',
      description: 'Google Gemini 3 Pro 图像生成预览版',
      capabilities: ['文生图', '图生图', '高画质']
    },
    {
      name: 'Gemini 3.1 Flash Image',
      model_id: 'gemini-3.1-flash-image-preview',
      description: 'Google Gemini 3.1 Flash 图像生成预览版',
      capabilities: ['文生图', '图生图', '快速生成']
    },
    {
      name: 'Gemini 2.5 Flash Image',
      model_id: 'gemini-2.5-flash-image-preview',
      description: 'Google Gemini 2.5 Flash 图像生成预览版',
      capabilities: ['文生图', '图生图', '高效率']
    },
    {
      name: 'Seedream 4.0',
      model_id: 'seedream-4.0',
      description: '字节跳动 Seed 团队图像生成模型 4.0 版本',
      capabilities: ['文生图', '图生图', '多风格']
    },
    {
      name: 'Seedream 4.5',
      model_id: 'seedream-4.5',
      description: '字节跳动 Seed 团队图像生成模型 4.5 版本',
      capabilities: ['文生图', '图生图', '更高画质']
    },
    {
      name: 'Seedream 5.0',
      model_id: 'seedream-5.0',
      description: '字节跳动 Seed 团队最新图像生成模型，支持 2K/3K 分辨率',
      capabilities: ['文生图', '图生图', '2K/3K高清', '联网搜索']
    },
    {
      name: 'Flux Kontext',
      model_id: 'flux-kontext',
      description: 'Black Forest Labs Flux Kontext 图像生成模型',
      capabilities: ['文生图', '图生图', '上下文理解']
    },
    {
      name: 'Flux 2.0',
      model_id: 'flux-2.0',
      description: 'Black Forest Labs Flux 2.0 图像生成模型',
      capabilities: ['文生图', '图生图', '高细节']
    },
    {
      name: 'Grok Image',
      model_id: 'grok-image',
      description: 'xAI Grok 图像生成模型，支持创意图像生成',
      capabilities: ['文生图', '图像编辑', '创意生成']
    },
    // 视频模型
    {
      name: 'Sora 2 标准版',
      model_id: 'sora-2',
      description: 'OpenAI Sora2 标准版视频生成模型，支持文本到视频、图生视频、角色引用',
      capabilities: ['文生视频', '图生视频', '角色引用', '视频变体']
    },
    {
      name: 'Sora 2 专业版',
      model_id: 'sora-2-pro',
      description: 'Sora2 专业版，支持更长时长（15秒高清/25秒），更高优先级',
      capabilities: ['文生视频', '图生视频', '角色引用', '长视频', '高清输出']
    },
    {
      name: 'Sora 2 VIP版',
      model_id: 'sora-2-vip',
      description: 'Sora2 VIP版，最高优先级，更快生成速度',
      capabilities: ['文生视频', '图生视频', '角色引用', 'VIP加速', '优先队列']
    },
    {
      name: 'VEO3',
      model_id: 'veo3',
      description: 'Google VEO3 视频生成模型，支持文本到视频、图片到视频',
      capabilities: ['文生视频', '图生视频', '高画质', '时长控制']
    },
    {
      name: 'VEO3 Pro',
      model_id: 'veo3-pro',
      description: 'Google VEO3 Pro 专业版，更高画质和更快生成速度',
      capabilities: ['文生视频', '图生视频', '高画质', 'VIP加速']
    }
  ]
};

// 获取提供商的模型列表
export function getModelsByProvider(providerType: string): ModelInfo[] {
  return PROVIDER_MODELS[providerType] || [];
}

// 根据模型ID获取模型信息
export function getModelById(providerType: string, modelId: string): ModelInfo | undefined {
  const models = getModelsByProvider(providerType);
  return models.find(model => model.model_id === modelId);
}
