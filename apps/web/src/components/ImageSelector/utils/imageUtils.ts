/**
 * ImageSelector utility functions
 */

/**
 * Get full URL from relative path
 */
export function getFullUrl(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
  const apiHost = baseUrl.replace('/api', '');
  return `${apiHost}${path}`;
}

/**
 * Get style-enhanced prompt based on selected style
 */
export function getStylePrompt(basePrompt: string, style: string): string {
  switch (style) {
    case 'cinematic':
      return `电影级品质，好莱坞大片风格，专业灯光，高清细节，${basePrompt}`;
    case 'anime':
      return `日本动漫风格，细腻线条，鲜明色彩，${basePrompt}`;
    case 'realistic':
      return `超写实风格，照片级真实感，光线自然，材质真实，细节丰富，与真实世界完全一致，${basePrompt}`;
    case 'illustration':
      return `精美插画风格，手绘质感，艺术感强，${basePrompt}`;
    case 'watercolor':
      return `水彩画风格，柔和色彩，透明质感，艺术笔触，${basePrompt}`;
    case '3d':
      return `3D 建模风格，CG 渲染，立体感强，材质细腻，${basePrompt}`;
    case 'cartoon':
      return `卡通风格，夸张表现，明亮色彩，${basePrompt}`;
    case 'comic':
      return `漫画风格，黑白线条，网点效果，${basePrompt}`;
    case 'fantasy':
      return `奇幻风格，魔法元素，史诗感，${basePrompt}`;
    case 'scifi':
      return `科幻风格，未来科技，金属质感，${basePrompt}`;
    case 'steampunk':
      return `蒸汽朋克风格，机械元素，复古科技，${basePrompt}`;
    case 'cyberpunk':
      return `赛博朋克风格，霓虹灯，未来都市，${basePrompt}`;
    default:
      return basePrompt;
  }
}

/**
 * Get negative prompt based on style
 */
export function getNegativePrompt(style: string): string {
  const baseNegative = '低质量，模糊，失真，比例错误，透视错误';
  switch (style) {
    case 'realistic':
      return `${baseNegative}，卡通风格，动画效果，线条粗糙`;
    case 'anime':
      return `${baseNegative}，写实风格，照片效果`;
    case 'watercolor':
      return `${baseNegative}，数字感强，生硬线条`;
    default:
      return baseNegative;
  }
}

/**
 * Get three-view generation prompt
 */
export function getThreeViewsPrompt(basePrompt: string, style: string): string {
  const styleName = getStyleName(style);
  return `专业工程制图，${styleName}风格，${basePrompt}的标准三视图，必须包含正视图、侧视图和俯视图三个视角，严格按照工程制图标准布局，正视图在左，侧视图在中，俯视图在右，保持严格的投影关系，清晰的尺寸标注，比例准确，线条清晰，白色背景，技术图纸风格，光线自然，材质真实，细节丰富，三个视角必须同时出现在同一张图像中`;
}

/**
 * Get style display name
 */
export function getStyleName(style: string): string {
  const styleMap: Record<string, string> = {
    cinematic: '电影',
    anime: '动漫',
    realistic: '写实',
    illustration: '插画',
    watercolor: '水彩',
    '3d': '3D 建模',
    cartoon: '卡通',
    comic: '漫画',
    fantasy: '奇幻',
    scifi: '科幻',
    steampunk: '蒸汽朋克',
    cyberpunk: '赛博朋克',
  };
  return styleMap[style] || style;
}
