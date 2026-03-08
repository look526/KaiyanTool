import { httpClient } from '../../client/http-client';

export interface SuperResolutionResponse {
  url: string;
}

export interface UpscaleResponse {
  url: string;
}

export interface InpaintingResponse {
  url: string;
}

export interface BackgroundRemovalResponse {
  url: string;
}

export interface FaceEnhancementResponse {
  url: string;
}

export interface ColorCorrectionRequest {
  brightness?: number;
  contrast?: number;
  saturation?: number;
}

export interface ColorCorrectionResponse {
  url: string;
}

export interface StyleTransferRequest {
  style?: string;
  strength?: number;
}

export interface StyleTransferResponse {
  url: string;
}

export const imageEnhancementApi = {
  async superResolution(imageId: string, scale: number = 2): Promise<SuperResolutionResponse> {
    return httpClient.post<SuperResolutionResponse>('/image-enhancement/super-resolution', { imageId, scale });
  },

  async upscaleImage(imageId: string, scale: number = 2): Promise<UpscaleResponse> {
    return httpClient.post<UpscaleResponse>('/image-enhancement/upscale', { imageId, scale });
  },

  async inpainting(imageId: string, maskPrompt: string): Promise<InpaintingResponse> {
    return httpClient.post<InpaintingResponse>('/image-enhancement/inpainting', { imageId, maskPrompt });
  },

  async removeBackground(imageId: string): Promise<BackgroundRemovalResponse> {
    return httpClient.post<BackgroundRemovalResponse>('/image-enhancement/background-removal', { imageId });
  },

  async faceEnhancement(imageId: string, strength: number = 0.5): Promise<FaceEnhancementResponse> {
    return httpClient.post<FaceEnhancementResponse>('/image-enhancement/face-enhancement', { imageId, strength });
  },

  async colorCorrection(imageId: string, data: ColorCorrectionRequest): Promise<ColorCorrectionResponse> {
    return httpClient.post<ColorCorrectionResponse>('/image-enhancement/color-correction', { imageId, ...data });
  },

  async styleTransfer(imageId: string, style?: string, strength: number = 0.5): Promise<StyleTransferResponse> {
    return httpClient.post<StyleTransferResponse>('/image-enhancement/style-transfer', { imageId, style, strength });
  },
};
