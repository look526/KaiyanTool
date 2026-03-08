// 阴影令牌定义
export const shadows = {
  // 基础阴影
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(255, 255, 255, 0.25)',
  '3xl': '0 30px 60px -15px rgba(0, 0, 0, 0.3)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',

  // 主题阴影
  primary: '0 4px 12px rgba(139, 92, 246, 0.3)',
  'primary-hover': '0 8px 20px rgba(139, 92, 246, 0.4)',
  secondary: '0 4px 12px rgba(6, 182, 212, 0.3)',
  accent: '0 4px 12px rgba(236, 72, 153, 0.3)',

  // 组件阴影
  card: '0 4px 16px rgba(0, 0, 0, 0.08)',
  'card-hover': '0 8px 24px rgba(0, 0, 0, 0.12)',
  button: '0 2px 4px rgba(0, 0, 0, 0.1)',
  'button-hover': '0 4px 8px rgba(0, 0, 0, 0.15)',
  dropdown: '0 4px 12px rgba(0, 0, 0, 0.15)',
  modal: '0 10px 25px rgba(0, 0, 0, 0.2)',
  popover: '0 6px 16px rgba(0, 0, 0, 0.12)',
  tooltip: '0 2px 8px rgba(0, 0, 0, 0.15)',

  // 深色模式阴影
  dark: {
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.5), 0 1px 2px -1px rgba(0, 0, 0, 0.5)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -2px rgba(0, 0, 0, 0.5)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.5)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
    '3xl': '0 30px 60px -15px rgba(0, 0, 0, 0.7)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.3)',

    // 深色模式主题阴影
    primary: '0 4px 12px rgba(139, 92, 246, 0.5)',
    'primary-hover': '0 8px 20px rgba(139, 92, 246, 0.6)',
    secondary: '0 4px 12px rgba(6, 182, 212, 0.5)',
    accent: '0 4px 12px rgba(236, 72, 153, 0.5)',

    // 深色模式组件阴影
    card: '0 4px 16px rgba(0, 0, 0, 0.3)',
    'card-hover': '0 8px 24px rgba(0, 0, 0, 0.4)',
    button: '0 2px 4px rgba(0, 0, 0, 0.3)',
    'button-hover': '0 4px 8px rgba(0, 0, 0, 0.4)',
    dropdown: '0 4px 12px rgba(0, 0, 0, 0.4)',
    modal: '0 10px 25px rgba(0, 0, 0, 0.5)',
    popover: '0 6px 16px rgba(0, 0, 0, 0.4)',
    tooltip: '0 2px 8px rgba(0, 0, 0, 0.4)',
  },
};

// 导出默认阴影
export default shadows;