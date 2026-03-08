// 设计系统主入口
import { colors, typography, spacing, shadows } from './tokens';
import { Button } from './components';
import designSystemUtils from './utilities';

const { cn, getColor, getShadow, getFontSize, getSpacing, createGradient, responsive } = designSystemUtils;

// 导出所有模块
export {
  // 令牌
  colors,
  typography,
  spacing,
  shadows,

  // 组件
  Button,

  // 工具
  cn,
  getColor,
  getShadow,
  getFontSize,
  getSpacing,
  createGradient,
  responsive,
};

// 导出默认值
export default {
  tokens: {
    colors,
    typography,
    spacing,
    shadows,
  },
  components: {
    Button,
  },
  utilities: {
    cn,
    getColor,
    getShadow,
    getFontSize,
    getSpacing,
    createGradient,
    responsive,
  },
};