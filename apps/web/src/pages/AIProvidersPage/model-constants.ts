// AI提供商模型列表
export interface ModelInfo {
  name: string;
  model_id: string;
  description: string;
  capabilities: string[];
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
  toapis: [
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
