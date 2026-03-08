export interface OptimizationOptions {
  quality: number
  width: number
  height: number
  format: 'webp' | 'jpeg' | 'png'
}

export interface OptimizedImage {
  src: string
  width: number
  height: number
  format: string
  size: number
}

export async function optimizeImage(
  source: string,
  options: OptimizationOptions
): Promise<OptimizedImage> {
  return {
    src: source,
    width: options.width,
    height: options.height,
    format: options.format,
    size: 0,
  }
}

export const generateResponsiveImages = (
  baseUrl: string,
  sizes: number[] = [320, 640, 960, 1280]
) => {
  return sizes.map((size) => ({
    src: `${baseUrl}?w=${size}`,
    width: size,
  }))
}
