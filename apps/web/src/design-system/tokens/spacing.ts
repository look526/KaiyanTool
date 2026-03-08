// 间距令牌定义
export const spacing = {
  // 基础间距单位（4px）
  unit: 4,

  // 间距规模
  scale: {
    0: '0',
    1: '4px',    // 1 * unit
    2: '8px',    // 2 * unit
    3: '12px',   // 3 * unit
    4: '16px',   // 4 * unit
    5: '20px',   // 5 * unit
    6: '24px',   // 6 * unit
    8: '32px',   // 8 * unit
    10: '40px',  // 10 * unit
    12: '48px',  // 12 * unit
    16: '64px',  // 16 * unit
    20: '80px',  // 20 * unit
    24: '96px',  // 24 * unit
    32: '128px', // 32 * unit
    40: '160px', // 40 * unit
    48: '192px', // 48 * unit
    56: '224px', // 56 * unit
    64: '256px', // 64 * unit
  },

  // 常用间距别名
  alias: {
    none: '0',
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
    '4xl': '96px',
  },

  // 布局间距
  layout: {
    container: '16px',      // 容器内边距
    section: '48px',        // 区块间距
    grid: '24px',           // 网格间距
    card: '24px',           // 卡片内边距
    form: '16px',           // 表单元素间距
    button: '12px',         // 按钮内边距
  },

  // 负间距
  negative: {
    1: '-4px',
    2: '-8px',
    3: '-12px',
    4: '-16px',
    5: '-20px',
    6: '-24px',
  },
};

// 导出默认间距
export default spacing;