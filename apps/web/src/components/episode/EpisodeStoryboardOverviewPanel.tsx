import type { CSSProperties } from 'react';
import { useMemo, useState } from 'react';
import { BookOpen, MapPin, ChevronDown, ChevronUp, ListFilter } from 'lucide-react';
import type { EpisodeSceneApi } from '../../types/episode';
import type { Shot } from '../../core/api/modules/shots/shots-api';

type Props = {
  scriptContent: string | null | undefined;
  scenes: EpisodeSceneApi[];
  shots: Shot[];
  selectedSceneId: string | null;
  onSelectScene: (sceneId: string | null) => void;
};

const SCRIPT_PREVIEW_CHARS = 1200;

export function EpisodeStoryboardOverviewPanel({
  scriptContent,
  scenes,
  shots,
  selectedSceneId,
  onSelectScene,
}: Props) {
  const [expandedScript, setExpandedScript] = useState(false);

  const sortedScenes = useMemo(
    () => [...scenes].sort((a, b) => a.scene_order - b.scene_order),
    [scenes]
  );

  const shotCountByScene = useMemo(() => {
    const m = new Map<string, number>();
    for (const s of shots) {
      if (!s.scene_id) continue;
      m.set(s.scene_id, (m.get(s.scene_id) || 0) + 1);
    }
    return m;
  }, [shots]);

  const preview =
    scriptContent && scriptContent.length > SCRIPT_PREVIEW_CHARS && !expandedScript
      ? `${scriptContent.slice(0, SCRIPT_PREVIEW_CHARS)}…`
      : scriptContent || '';

  return (
    <div style={panelWrapStyle}>
      <div style={panelHeaderStyle}>
        <BookOpen style={{ width: '16px', height: '16px', color: 'var(--accent, #8b5cf6)' }} />
        <div>
          <h3 style={panelTitleStyle}>剧本与场景</h3>
          <p style={panelSubStyle}>节选原文与分场景导航；选择场景可过滤中间分镜列表。</p>
        </div>
      </div>

      <div style={scriptBlockStyle}>
        <div style={sectionLabelStyle}>剧本节选</div>
        {preview ? (
          <>
            <pre style={scriptPreStyle}>{preview}</pre>
            {scriptContent && scriptContent.length > SCRIPT_PREVIEW_CHARS && (
              <button type="button" style={textBtnStyle} onClick={() => setExpandedScript(!expandedScript)}>
                {expandedScript ? (
                  <>
                    <ChevronUp style={{ width: '14px', height: '14px' }} /> 收起
                  </>
                ) : (
                  <>
                    <ChevronDown style={{ width: '14px', height: '14px' }} /> 展开全文
                  </>
                )}
              </button>
            )}
          </>
        ) : (
          <div style={emptyScriptStyle}>本集未关联剧本或剧本无内容。可在剧集设置中关联剧本。</div>
        )}
      </div>

      <div style={sceneBlockStyle}>
        <div style={sectionLabelStyle}>
          <ListFilter style={{ width: '14px', height: '14px', display: 'inline', verticalAlign: 'middle' }} />{' '}
          场景列表
        </div>
        <button
          type="button"
          style={{
            ...sceneRowStyle,
            ...(selectedSceneId === null ? sceneRowActiveStyle : undefined),
          }}
          onClick={() => onSelectScene(null)}
        >
          全部分镜
          <span style={countBadgeStyle}>{shots.length}</span>
        </button>
        {sortedScenes.map((sc) => {
          const count = shotCountByScene.get(sc.id) || 0;
          const active = selectedSceneId === sc.id;
          return (
            <button
              key={sc.id}
              type="button"
              style={{
                ...sceneRowStyle,
                ...(active ? sceneRowActiveStyle : undefined),
              }}
              onClick={() => onSelectScene(sc.id)}
            >
              <MapPin style={{ width: '12px', height: '12px', flexShrink: 0, opacity: 0.85 }} />
              <span style={sceneTitleStyle}>
                {sc.location}
                {sc.time ? ` · ${sc.time}` : ''}
              </span>
              <span style={countBadgeStyle}>{count}</span>
            </button>
          );
        })}
        {sortedScenes.length === 0 && (
          <div style={emptyScriptStyle}>暂无场景数据。请从剧本或场景页创建场景。</div>
        )}
      </div>
    </div>
  );
}

const panelWrapStyle: CSSProperties = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border-primary)',
  borderRadius: '20px',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  minHeight: '200px',
  position: 'sticky',
  top: '96px',
  maxHeight: 'calc(100vh - 120px)',
};

const panelHeaderStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '10px',
  padding: '16px 18px',
  borderBottom: '1px solid var(--border-primary)',
  background: 'var(--bg-elevated)',
};

const panelTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: '16px',
  fontWeight: 600,
  color: 'var(--text-primary)',
};

const panelSubStyle: CSSProperties = {
  margin: '4px 0 0',
  fontSize: '12px',
  color: 'var(--text-secondary)',
  lineHeight: 1.5,
};

const scriptBlockStyle: CSSProperties = {
  padding: '12px 14px',
  borderBottom: '1px solid var(--border-primary)',
  flex: '0 1 auto',
  minHeight: 0,
  overflow: 'auto',
  maxHeight: '42vh',
};

const sceneBlockStyle: CSSProperties = {
  padding: '12px 14px 16px',
  flex: '1 1 auto',
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
};

const sectionLabelStyle: CSSProperties = {
  fontSize: '11px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  color: 'var(--text-muted)',
  marginBottom: '8px',
};

const scriptPreStyle: CSSProperties = {
  margin: 0,
  fontSize: '12px',
  lineHeight: 1.55,
  color: 'var(--text-secondary)',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  fontFamily: 'inherit',
};

const emptyScriptStyle: CSSProperties = {
  fontSize: '12px',
  color: 'var(--text-muted)',
  lineHeight: 1.5,
};

const textBtnStyle: CSSProperties = {
  marginTop: '8px',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  border: 'none',
  background: 'transparent',
  color: 'var(--accent, #8b5cf6)',
  fontSize: '12px',
  fontWeight: 600,
  cursor: 'pointer',
  padding: 0,
};

const sceneRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  width: '100%',
  textAlign: 'left',
  padding: '10px 12px',
  borderRadius: '12px',
  border: '1px solid var(--border-primary)',
  background: 'var(--bg-page)',
  color: 'var(--text-primary)',
  fontSize: '13px',
  cursor: 'pointer',
};

const sceneRowActiveStyle: CSSProperties = {
  border: '1px solid rgba(139, 92, 246, 0.45)',
  background: 'rgba(139, 92, 246, 0.1)',
};

const sceneTitleStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const countBadgeStyle: CSSProperties = {
  fontSize: '11px',
  fontWeight: 700,
  padding: '2px 8px',
  borderRadius: '999px',
  background: 'var(--bg-elevated)',
  color: 'var(--text-secondary)',
  flexShrink: 0,
};
