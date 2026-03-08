// 样式工具函数
import { colors, typography, spacing, shadows } from '../tokens';

/**
 * 获取颜色值
 * @param colorPath 颜色路径，如 'primary.500'
 * @param isDark 是否为深色模式
 * @returns 颜色值
 */
export function getColor(colorPath: string, isDark = false): string {
  const parts = colorPath.split('.');
  let colorObj: any = isDark ? colors.dark : colors;
  
  for (const part of parts) {
    if (colorObj && typeof colorObj === 'object' && part in colorObj) {
      colorObj = colorObj[part];
    } else {
      return '#000000'; // 默认颜色
    }
  }
  
  return typeof colorObj === 'string' ? colorObj : '#000000';
}

/**
 * 获取阴影值
 * @param shadowName 阴影名称
 * @param isDark 是否为深色模式
 * @returns 阴影值
 */
export function getShadow(shadowName: string, isDark = false): string {
  if (isDark && shadows.dark && shadowName in shadows.dark) {
    return shadows.dark[shadowName as keyof typeof shadows.dark];
  }
  const shadow = shadows[shadowName as keyof typeof shadows];
  return typeof shadow === 'string' ? shadow : '0 0 0 rgba(0, 0, 0, 0)';
}

/**
 * 获取字体大小
 * @param size 字体大小名称
 * @returns 字体大小值
 */
export function getFontSize(size: keyof typeof typography.fontSize): string {
  return typography.fontSize[size] || typography.fontSize.base;
}

/**
 * 获取间距值
 * @param size 间距大小
 * @returns 间距值
 */
export function getSpacing(size: keyof typeof spacing.scale): string {
  return spacing.scale[size] || spacing.scale[4]; // 默认 16px
}

/**
 * 创建渐变背景
 * @param colors 渐变颜色数组
 * @param direction 渐变方向
 * @returns 渐变 CSS 值
 */
export function createGradient(colors: string[], direction = '135deg'): string {
  return `linear-gradient(${direction}, ${colors.join(', ')})`;
}

/**
 * 生成响应式样式
 * @param styles 不同断点的样式
 * @returns 响应式样式对象
 */
export function responsive(styles: {
  base?: React.CSSProperties;
  sm?: React.CSSProperties;
  md?: React.CSSProperties;
  lg?: React.CSSProperties;
  xl?: React.CSSProperties;
}): any {
  return {
    ...styles.base,
    '@media (min-width: 640px)': styles.sm,
    '@media (min-width: 768px)': styles.md,
    '@media (min-width: 1024px)': styles.lg,
    '@media (min-width: 1280px)': styles.xl,
  };
}