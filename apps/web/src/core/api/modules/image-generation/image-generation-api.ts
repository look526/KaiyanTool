import { httpClient } from '../../client/http-client';

export interface GenerateImageRequest {
  prompt: string;
  negativePrompt?: string;
  width: number;
  height: number;
  style: string;
  projectId?: string;
  model?: string;
  category?: string;
  image_urls?: string[];
  threeView?: boolean;
}

export interface BatchGenerateImagesRequest {
  prompt: string;
  count: number;
  referenceImageUrl?: string;
  providerId?: string;
}

export interface GenerateImageResponse {
  asset: {
    id: string;
    url: string;
  };
}

export interface BatchGenerateImagesResponse {
  assets: Array<{
    id: string;
    url: string;
  }>;
}

export const imageGenerationApi = {
  async generateImage(data: GenerateImageRequest): Promise<GenerateImageResponse> {
    return httpClient.post<GenerateImageResponse>('/image-generation/generate', data);
  },

  async batchGenerateImages(data: BatchGenerateImagesRequest): Promise<BatchGenerateImagesResponse> {
    return httpClient.post<BatchGenerateImagesResponse>('/image-generation/batch', data);
  },
};
