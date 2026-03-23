import type { CSSProperties } from 'react';
import { Edit2, Trash2, ChevronRight } from 'lucide-react';
import { Episode } from '../../core/api/modules/episodes';

interface EpisodeCardProps {
  episode: Episode;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

/**
 * @description 剧集表格行组件，用于工作台式列表展示。
 */
export function EpisodeCard({ episode, onClick, onEdit, onDelete }: EpisodeCardProps) {
  const description = episode.description?.trim() || '暂无描述';
  const updatedAt = new Date(episode.updated_at).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
  const sceneCount = episode.scene_count || 0;
  const shotCount = episode.shot_count || 0;
  const generatedCount = episode.generated_count || 0;
  const pendingCount = episode.pending_count || 0;
  const statusLabel =
    shotCount === 0
      ? '待创建分镜'
      : pendingCount > 0
        ? '处理中'
        : generatedCount > 0
          ? '已生成'
          : '已建档';
  const statusTone =
    shotCount === 0
      ? statusIdleStyle
      : pendingCount > 0
        ? statusWarningStyle
        : generatedCount > 0
          ? statusSuccessStyle
          : statusDefaultStyle;

  return (
    <tr
      onClick={onClick}
      style={rowStyle}
      onMouseEnter={(event) => {
        event.currentTarget.style.background = 'var(--bg-elevated)';
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.background = 'transparent';
      }}
    >
      <td style={numberCellStyle}>
        <span style={episodeBadgeStyle}>第 {episode.episode_number} 集</span>
      </td>

      <td style={cellStyle}>
        <div style={titleWrapStyle}>
          <div style={titleTopStyle}>
            <div style={titleStyle}>{episode.title}</div>
            <span style={{ ...statusBadgeStyle, ...statusTone }}>{statusLabel}</span>
          </div>
          <div style={subTitleStyle}>
            ID: {episode.id.slice(0, 8)}
            {(generatedCount > 0 || pendingCount > 0) && (
              <span style={subMetaStyle}>
                已生成 {generatedCount} / 待处理 {pendingCount}
              </span>
            )}
          </div>
        </div>
      </td>

      <td style={cellStyle}>
        <div style={descriptionStyle} title={description}>
          {description}
        </div>
      </td>

      <td style={metricCellStyle}>
        <span style={sceneCount > 0 ? metricHotBadgeStyle : metricIdleBadgeStyle}>{sceneCount}</span>
      </td>
      <td style={metricCellStyle}>
        <span style={shotCount > 0 ? metricPrimaryBadgeStyle : metricIdleBadgeStyle}>{shotCount}</span>
      </td>

      <td style={cellStyle}>
        <div style={dateStyle}>{updatedAt}</div>
      </td>

      <td
        style={actionsCellStyle}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          onClick={onClick}
          style={primaryActionStyle}
        >
          进入
          <ChevronRight style={{ width: '14px', height: '14px' }} />
        </button>
        <button
          onClick={onEdit}
          style={secondaryActionStyle}
        >
          <Edit2 style={{ width: '14px', height: '14px' }} />
          编辑
        </button>
        <button
          onClick={onDelete}
          style={dangerActionStyle}
        >
          <Trash2 style={{ width: '14px', height: '14px' }} />
          删除
        </button>
      </td>
    </tr>
  );
}

const rowStyle: CSSProperties = {
  cursor: 'pointer',
  transition: 'background 0.2s ease',
  borderBottom: '1px solid var(--border-primary)',
};

const cellStyle: CSSProperties = {
  padding: '16px 20px',
  color: 'var(--text-primary)',
  verticalAlign: 'middle',
};

const numberCellStyle: CSSProperties = {
  ...cellStyle,
  width: '120px',
};

const metricCellStyle: CSSProperties = {
  ...cellStyle,
  width: '96px',
  textAlign: 'right',
  fontSize: '15px',
  fontWeight: 700,
};

const actionsCellStyle: CSSProperties = {
  ...cellStyle,
  width: '240px',
  textAlign: 'right',
  whiteSpace: 'nowrap',
};

const episodeBadgeStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '6px 10px',
  borderRadius: '999px',
  background: 'rgba(99, 102, 241, 0.08)',
  border: '1px solid rgba(99, 102, 241, 0.18)',
  color: '#4f46e5',
  fontSize: '12px',
  fontWeight: 600,
};

const titleWrapStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  minWidth: 0,
};

const titleTopStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  minWidth: 0,
};

const titleStyle: CSSProperties = {
  fontSize: '15px',
  fontWeight: 600,
  color: 'var(--text-primary)',
  minWidth: 0,
};

const subTitleStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  flexWrap: 'wrap',
  fontSize: '12px',
  color: 'var(--text-muted)',
};

const subMetaStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  paddingLeft: '8px',
  borderLeft: '1px solid var(--border-primary)',
  color: 'var(--text-secondary)',
};

const descriptionStyle: CSSProperties = {
  maxWidth: '420px',
  overflow: 'hidden',
  color: 'var(--text-secondary)',
  fontSize: '14px',
  lineHeight: 1.45,
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
};

const dateStyle: CSSProperties = {
  fontSize: '13px',
  color: 'var(--text-secondary)',
  whiteSpace: 'nowrap',
};

const statusBadgeStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '24px',
  padding: '0 8px',
  borderRadius: '999px',
  fontSize: '11px',
  fontWeight: 600,
  whiteSpace: 'nowrap',
  flexShrink: 0,
};

const statusDefaultStyle: CSSProperties = {
  color: 'var(--text-secondary)',
  background: 'rgba(148, 163, 184, 0.1)',
  border: '1px solid rgba(148, 163, 184, 0.18)',
};

const statusIdleStyle: CSSProperties = {
  color: '#6b7280',
  background: 'rgba(107, 114, 128, 0.08)',
  border: '1px solid rgba(107, 114, 128, 0.14)',
};

const statusWarningStyle: CSSProperties = {
  color: '#d97706',
  background: 'rgba(245, 158, 11, 0.12)',
  border: '1px solid rgba(245, 158, 11, 0.18)',
};

const statusSuccessStyle: CSSProperties = {
  color: '#059669',
  background: 'rgba(16, 185, 129, 0.12)',
  border: '1px solid rgba(16, 185, 129, 0.18)',
};

const metricBadgeStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '36px',
  height: '28px',
  padding: '0 10px',
  borderRadius: '999px',
  fontSize: '12px',
  fontWeight: 700,
};

const metricIdleBadgeStyle: CSSProperties = {
  ...metricBadgeStyle,
  color: '#94a3b8',
  background: 'rgba(148, 163, 184, 0.08)',
  border: '1px solid rgba(148, 163, 184, 0.16)',
};

const metricHotBadgeStyle: CSSProperties = {
  ...metricBadgeStyle,
  color: '#0f766e',
  background: 'rgba(20, 184, 166, 0.1)',
  border: '1px solid rgba(20, 184, 166, 0.18)',
};

const metricPrimaryBadgeStyle: CSSProperties = {
  ...metricBadgeStyle,
  color: '#4f46e5',
  background: 'rgba(99, 102, 241, 0.1)',
  border: '1px solid rgba(99, 102, 241, 0.18)',
};

const actionBaseStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  height: '34px',
  padding: '0 12px',
  borderRadius: '10px',
  border: '1px solid var(--border-primary)',
  background: 'var(--bg-card)',
  fontSize: '13px',
  fontWeight: 500,
  cursor: 'pointer',
  marginLeft: '8px',
};

const primaryActionStyle: CSSProperties = {
  ...actionBaseStyle,
  color: '#4f46e5',
  border: '1px solid rgba(99, 102, 241, 0.18)',
  background: 'rgba(99, 102, 241, 0.06)',
};

const secondaryActionStyle: CSSProperties = {
  ...actionBaseStyle,
  color: 'var(--text-primary)',
};

const dangerActionStyle: CSSProperties = {
  ...actionBaseStyle,
  color: '#dc2626',
  border: '1px solid rgba(239, 68, 68, 0.18)',
  background: 'rgba(239, 68, 68, 0.05)',
};
