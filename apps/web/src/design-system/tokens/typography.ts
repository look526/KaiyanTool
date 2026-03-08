// 排版令牌定义
export const typography = {
  // 字体家族
  fontFamily: {
    sans: '\'Inter\', -apple-system, BlinkMacSystemFont, \'Segoe UI\', \'Roboto\', \'Oxygen\', \'Ubuntu\', \'Cantarell\', \'Fira Sans\', \'Droid Sans\', \'Helvetica Neue\', sans-serif',
    serif: '\'Playfair Display\', Georgia, Cambria, \'Times New Roman\', Times, serif',
    mono: '\'JetBrains Mono\', \'Fira Code\', \'Consolas\', \'Monaco\', \'Courier New\', monospace',
  },

  // 字体大小
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
    '5xl': '48px',
    '6xl': '60px',
    '7xl': '72px',
    '8xl': '96px',
  },

  // 行高
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  // 字重
  fontWeight: {
    thin: 100,
    extralight: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },

  // 字间距（可选）
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },

  // 标题样式
  heading: {
    h1: {
      fontSize: '3rem', // 48px
      lineHeight: 1.1,
      fontWeight: 700,
    },
    h2: {
      fontSize: '2.5rem', // 40px
      lineHeight: 1.2,
      fontWeight: 600,
    },
    h3: {
      fontSize: '2rem', // 32px
      lineHeight: 1.25,
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.5rem', // 24px
      lineHeight: 1.3,
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.25rem', // 20px
      lineHeight: 1.4,
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem', // 16px
      lineHeight: 1.5,
      fontWeight: 500,
    },
  },

  // 正文样式
  body: {
    sm: {
      fontSize: '0.875rem', // 14px
      lineHeight: 1.571,
    },
    base: {
      fontSize: '1rem', // 16px
      lineHeight: 1.5,
    },
    lg: {
      fontSize: '1.125rem', // 18px
      lineHeight: 1.556,
    },
  },

  // 按钮样式
  button: {
    sm: {
      fontSize: '0.75rem', // 12px
      lineHeight: 1.5,
      fontWeight: 500,
    },
    base: {
      fontSize: '0.875rem', // 14px
      lineHeight: 1.5,
      fontWeight: 500,
    },
    lg: {
      fontSize: '1rem', // 16px
      lineHeight: 1.5,
      fontWeight: 500,
    },
    xl: {
      fontSize: '1.125rem', // 18px
      lineHeight: 1.5,
      fontWeight: 500,
    },
  },

  // 辅助文本样式
  caption: {
    fontSize: '0.75rem', // 12px
    lineHeight: 1.667,
  },

  // 标签样式
  label: {
    fontSize: '0.875rem', // 14px
    lineHeight: 1.5,
    fontWeight: 500,
  },
};

// 导出默认排版
export default typography;