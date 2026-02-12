import { prisma } from '../lib/prisma';
import logger from '../lib/logger';

export interface AIProvider {
  id: string;
  name: string;
  type: 'openai' | 'anthropic' | 'cohere' | 'custom';
  apiKey: string;
  baseUrl?: string;
  enabled: boolean;
  config?: any;
}

export interface GenerateImageOptions {
  prompt: string;
  negativePrompt?: string;
  size?: string;
  style?: string;
  quality?: string;
}

export interface GenerateTextOptions {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  model?: string;
}

export interface GenerateVideoOptions {
  imageUrl: string;
  prompt?: string;
  duration?: number;
  motion?: number;
}

export class AIService {
  async getActiveProvider(userId: string, type?: string): Promise<AIProvider | null> {
    try {
      const provider = await prisma.aIProvider.findFirst({
        where: {
          userId,
          enabled: true,
          ...(type && { type: type as any }),
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      if (!provider) {
        return null;
      }

      return {
        id: provider.id,
        name: provider.name,
        type: provider.type as any,
        apiKey: provider.apiKey,
        baseUrl: provider.baseUrl || undefined,
        enabled: provider.enabled,
        config: provider.config,
      };
    } catch (error) {
      logger.error('获取 AI 提供商失败', { userId, type, error });
      return null;
    }
  }

  async generateImage(userId: string, options: GenerateImageOptions): Promise<string> {
    const provider = await this.getActiveProvider(userId);
    if (!provider) {
      throw new Error('未找到启用的 AI 提供商');
    }

    switch (provider.type) {
      case 'openai':
        return this.generateImageWithOpenAI(provider, options);
      case 'anthropic':
        return this.generateImageWithAnthropic(provider, options);
      default:
        throw new Error(`不支持的提供商类型: ${provider.type}`);
    }
  }

  async generateText(userId: string, options: GenerateTextOptions): Promise<string> {
    const provider = await this.getActiveProvider(userId);
    if (!provider) {
      throw new Error('未找到启用的 AI 提供商');
    }

    switch (provider.type) {
      case 'openai':
        return this.generateTextWithOpenAI(provider, options);
      case 'anthropic':
        return this.generateTextWithAnthropic(provider, options);
      default:
        throw new Error(`不支持的提供商类型: ${provider.type}`);
    }
  }

  async generateVideo(userId: string, options: GenerateVideoOptions): Promise<string> {
    const provider = await this.getActiveProvider(userId);
    if (!provider) {
      throw new Error('未找到启用的 AI 提供商');
    }

    switch (provider.type) {
      case 'openai':
        return this.generateVideoWithOpenAI(provider, options);
      default:
        throw new Error(`视频生成暂不支持提供商类型: ${provider.type}`);
    }
  }

  private async generateImageWithOpenAI(provider: AIProvider, options: GenerateImageOptions): Promise<string> {
    try {
      const baseUrl = provider.baseUrl || 'https://api.openai.com/v1';
      const response = await fetch(`${baseUrl}/images/generations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${provider.apiKey}`,
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: options.prompt,
          n: 1,
          size: options.size || '1024x1024',
          quality: options.quality || 'standard',
          style: options.style || 'vivid',
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenAI API 错误: ${error}`);
      }

      const data = await response.json();
      return data.data[0].url;
    } catch (error) {
      logger.error('OpenAI 图像生成失败', { error });
      throw error;
    }
  }

  private async generateImageWithAnthropic(provider: AIProvider, options: GenerateImageOptions): Promise<string> {
    try {
      const baseUrl = provider.baseUrl || 'https://api.anthropic.com/v1';
      const response = await fetch(`${baseUrl}/images/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': provider.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-opus-20240229',
          prompt: options.prompt,
          size: options.size || '1024x1024',
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Anthropic API 错误: ${error}`);
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      logger.error('Anthropic 图像生成失败', { error });
      throw error;
    }
  }

  private async generateTextWithOpenAI(provider: AIProvider, options: GenerateTextOptions): Promise<string> {
    try {
      const baseUrl = provider.baseUrl || 'https://api.openai.com/v1';
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${provider.apiKey}`,
        },
        body: JSON.stringify({
          model: options.model || 'gpt-4-turbo-preview',
          messages: [
            { role: 'user', content: options.prompt },
          ],
          max_tokens: options.maxTokens || 1000,
          temperature: options.temperature || 0.7,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenAI API 错误: ${error}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      logger.error('OpenAI 文本生成失败', { error });
      throw error;
    }
  }

  private async generateTextWithAnthropic(provider: AIProvider, options: GenerateTextOptions): Promise<string> {
    try {
      const baseUrl = provider.baseUrl || 'https://api.anthropic.com/v1';
      const response = await fetch(`${baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': provider.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: options.model || 'claude-3-opus-20240229',
          messages: [
            { role: 'user', content: options.prompt },
          ],
          max_tokens: options.maxTokens || 1000,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Anthropic API 错误: ${error}`);
      }

      const data = await response.json();
      return data.content[0].text;
    } catch (error) {
      logger.error('Anthropic 文本生成失败', { error });
      throw error;
    }
  }

  private async generateVideoWithOpenAI(provider: AIProvider, options: GenerateVideoOptions): Promise<string> {
    try {
      const baseUrl = provider.baseUrl || 'https://api.openai.com/v1';
      const response = await fetch(`${baseUrl}/videos/generations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${provider.apiKey}`,
        },
        body: JSON.stringify({
          model: 'sora',
          image: options.imageUrl,
          prompt: options.prompt,
          duration: options.duration || 5,
          motion: options.motion || 5,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenAI API 错误: ${error}`);
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      logger.error('OpenAI 视频生成失败', { error });
      throw error;
    }
  }
}

export const aiService = new AIService();
