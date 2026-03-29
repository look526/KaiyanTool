import { useTheme } from '../../contexts/ThemeContext';

export function StatusBar() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const colors = isDark ? {
    bgPrimary: 'rgba(5, 5, 10, 0.95)',
    border: 'rgba(255, 255, 255, 0.06)',
    textMuted: 'rgba(250, 250, 250, 0.4)',
  } : {
    bgPrimary: 'rgba(255, 255, 255, 0.92)',
    border: 'rgba(0, 0, 0, 0.06)',
    textMuted: 'rgba(24, 24, 27, 0.4)',
  };

  return (
    <div style={{
      position: 'fixed',
      left: '280px',
      bottom: '24px',
      padding: '12px 20px',
      borderRadius: '12px',
      background: colors.bgPrimary,
      backdropFilter: 'blur(20px)',
      border: `1px solid ${colors.border}`,
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      fontSize: '13px',
      color: colors.textMuted,
    }}>
      <span>Space+拖拽平移</span>
      <span>•</span>
      <span>双击画布添加文字</span>
      <span>•</span>
      <span>双击节点连线</span>
    </div>
  );
}
