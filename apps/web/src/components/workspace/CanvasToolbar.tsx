import { useTheme } from '../../contexts/ThemeContext';
import { Undo2, Redo2, Download, Upload, ZoomIn, ZoomOut } from 'lucide-react';
import { useWorkspaceStore } from '../../store/workspace-store';

const accentColor = '#8b5cf6';

interface CanvasToolbarProps {
  onExport: () => void;
  onImport: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

export function CanvasToolbar({
  onExport,
  onImport,
  onZoomIn,
  onZoomOut,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}: CanvasToolbarProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const { zoom, isSaving, lastSavedAt } = useWorkspaceStore();

  const colors = isDark ? {
    bgPrimary: 'rgba(5, 5, 10, 0.95)',
    bgGlass: 'rgba(255, 255, 255, 0.04)',
    border: 'rgba(255, 255, 255, 0.06)',
    textPrimary: '#fafafa',
    textSecondary: 'rgba(250, 250, 250, 0.6)',
  } : {
    bgPrimary: 'rgba(255, 255, 255, 0.92)',
    bgGlass: 'rgba(0, 0, 0, 0.02)',
    border: 'rgba(0, 0, 0, 0.06)',
    textPrimary: '#18181b',
    textSecondary: 'rgba(24, 24, 27, 0.6)',
  };

  return (
    <header style={{
      height: '64px',
      background: colors.bgPrimary,
      backdropFilter: 'blur(40px)',
      borderBottom: `1px solid ${colors.border}`,
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      gap: '16px',
    }}>
      <h1 style={{ fontSize: '20px', fontWeight: 700, color: colors.textPrimary, margin: 0 }}>
        工作台
      </h1>

      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button
          onClick={onUndo}
          disabled={!canUndo}
          style={{
            padding: '8px',
            borderRadius: '10px',
            border: `1px solid ${colors.border}`,
            background: colors.bgGlass,
            color: colors.textPrimary,
            cursor: canUndo ? 'pointer' : 'not-allowed',
            opacity: canUndo ? 1 : 0.5,
          }}
        >
          <Undo2 size={18} />
        </button>

        <button
          onClick={onRedo}
          disabled={!canRedo}
          style={{
            padding: '8px',
            borderRadius: '10px',
            border: `1px solid ${colors.border}`,
            background: colors.bgGlass,
            color: colors.textPrimary,
            cursor: canRedo ? 'pointer' : 'not-allowed',
            opacity: canRedo ? 1 : 0.5,
          }}
        >
          <Redo2 size={18} />
        </button>

        <button
          onClick={onExport}
          style={{
            padding: '8px 12px',
            borderRadius: '10px',
            border: `1px solid ${colors.border}`,
            background: colors.bgGlass,
            color: colors.textPrimary,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Download size={16} /> 导出
        </button>

        <button
          onClick={onImport}
          style={{
            padding: '8px 12px',
            borderRadius: '10px',
            border: `1px solid ${colors.border}`,
            background: colors.bgGlass,
            color: colors.textPrimary,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Upload size={16} /> 导入
        </button>

        <button
          onClick={onZoomOut}
          style={{
            padding: '8px',
            borderRadius: '10px',
            border: `1px solid ${colors.border}`,
            background: colors.bgGlass,
            color: colors.textPrimary,
            cursor: 'pointer',
          }}
        >
          <ZoomOut size={18} />
        </button>

        <span style={{ fontSize: '13px', color: colors.textSecondary, minWidth: '50px', textAlign: 'center' }}>
          {Math.round(zoom * 100)}%
        </span>

        <button
          onClick={onZoomIn}
          style={{
            padding: '8px',
            borderRadius: '10px',
            border: `1px solid ${colors.border}`,
            background: colors.bgGlass,
            color: colors.textPrimary,
            cursor: 'pointer',
          }}
        >
          <ZoomIn size={18} />
        </button>
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: colors.textSecondary }}>
        {isSaving ? (
          <span style={{ color: accentColor }}>保存中...</span>
        ) : lastSavedAt ? (
          <span>已保存 {lastSavedAt.toLocaleTimeString()}</span>
        ) : null}
      </div>
    </header>
  );
}
