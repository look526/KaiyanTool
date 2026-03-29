import { X, Star, Clock, Image, Video, Type } from 'lucide-react';

interface CanvasNode {
  id: string;
  type: 'text' | 'image' | 'video';
  position_x: number;
  position_y: number;
  content: {
    text?: string;
    url?: string;
  };
  output_url?: string;
  is_starred?: boolean;
  labels?: string[];
  history?: any[];
  config?: Record<string, any>;
}

interface NodeConfigPanelProps {
  node: CanvasNode | null;
  onClose: () => void;
  onUpdate: (nodeId: string, data: Partial<CanvasNode>) => void;
  onStar: (nodeId: string, isStarred: boolean) => void;
  onGenerate: (nodeId: string, type: string) => void;
  onRevertToVersion: (nodeId: string, version: any) => void;
  isDark: boolean;
  colors: Record<string, string>;
}

const LABEL_COLORS = [
  { name: 'red', color: '#ef4444' },
  { name: 'yellow', color: '#f59e0b' },
  { name: 'green', color: '#10b981' },
  { name: 'blue', color: '#3b82f6' },
  { name: 'purple', color: '#8b5cf6' },
];

const AI_PRESETS = [
  { id: 'quick', name: '快速模式', desc: '低质量、快速' },
  { id: 'standard', name: '标准模式', desc: '平衡' },
  { id: 'hd', name: '高清模式', desc: '高质量、慢' },
];

export default function NodeConfigPanel({
  node,
  onClose,
  onUpdate,
  onStar,
  onGenerate,
  onRevertToVersion,
  isDark,
  colors,
}: NodeConfigPanelProps) {
  if (!node) return null;

  const accentColor = '#8b5cf6';

  return (
    <div style={{
      position: 'fixed',
      right: 0,
      top: '64px',
      bottom: 0,
      width: '320px',
      background: colors.bgPrimary,
      backdropFilter: 'blur(20px)',
      borderLeft: `1px solid ${colors.border}`,
      display: 'flex',
      flexDirection: 'column',
      zIndex: 20,
      transform: node ? 'translateX(0)' : 'translateX(100%)',
      transition: 'transform 0.3s ease',
    }}>
      <div style={{
        padding: '16px 20px',
        borderBottom: `1px solid ${colors.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {node.type === 'text' && <Type size={18} color={accentColor} />}
          {node.type === 'image' && <Image size={18} color="#10b981" />}
          {node.type === 'video' && <Video size={18} color="#f59e0b" />}
          <span style={{ fontSize: '16px', fontWeight: 600, color: colors.textPrimary }}>
            {node.type === 'text' ? '文字节点' : node.type === 'image' ? '图片节点' : '视频节点'}
          </span>
        </div>
        <button
          onClick={onClose}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.textMuted,
          }}
        >
          <X size={18} />
        </button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px' }}>
        {node.type === 'text' && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 500,
              color: colors.textSecondary,
              marginBottom: '8px',
            }}>
              文字内容
            </label>
            <textarea
              value={node.content?.text || ''}
              onChange={(e) => onUpdate(node.id, { content: { text: e.target.value } })}
              style={{
                width: '100%',
                minHeight: '120px',
                padding: '12px',
                borderRadius: '12px',
                border: `1px solid ${colors.border}`,
                background: colors.bgSecondary,
                color: colors.textPrimary,
                fontSize: '14px',
                resize: 'vertical',
                fontFamily: 'inherit',
              }}
              placeholder="输入文字内容..."
            />
          </div>
        )}

        {(node.type === 'image' || node.type === 'video') && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 500,
              color: colors.textSecondary,
              marginBottom: '8px',
            }}>
              AI 模型
            </label>
            <select
              value={node.config?.model || 'standard'}
              onChange={(e) => onUpdate(node.id, { config: { ...node.config, model: e.target.value } })}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '12px',
                border: `1px solid ${colors.border}`,
                background: colors.bgSecondary,
                color: colors.textPrimary,
                fontSize: '14px',
              }}
            >
              <option value="quick">快速模型</option>
              <option value="standard">标准模型</option>
              <option value="hd">高清模型</option>
            </select>
          </div>
        )}

        {node.type === 'image' && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 500,
              color: colors.textSecondary,
              marginBottom: '8px',
            }}>
              图片尺寸
            </label>
            <select
              value={node.config?.size || '1024x1024'}
              onChange={(e) => onUpdate(node.id, { config: { ...node.config, size: e.target.value } })}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '12px',
                border: `1px solid ${colors.border}`,
                background: colors.bgSecondary,
                color: colors.textPrimary,
                fontSize: '14px',
              }}
            >
              <option value="512x512">512 x 512</option>
              <option value="768x768">768 x 768</option>
              <option value="1024x1024">1024 x 1024</option>
              <option value="1024x1792">1024 x 1792 (竖版)</option>
            </select>
          </div>
        )}

        {node.type === 'video' && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 500,
              color: colors.textSecondary,
              marginBottom: '8px',
            }}>
              视频时长
            </label>
            <select
              value={node.config?.duration || '5'}
              onChange={(e) => onUpdate(node.id, { config: { ...node.config, duration: e.target.value } })}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '12px',
                border: `1px solid ${colors.border}`,
                background: colors.bgSecondary,
                color: colors.textPrimary,
                fontSize: '14px',
              }}
            >
              <option value="3">3 秒</option>
              <option value="5">5 秒</option>
              <option value="10">10 秒</option>
            </select>
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: 500,
            color: colors.textSecondary,
            marginBottom: '8px',
          }}>
            标签
          </label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {LABEL_COLORS.map(({ name, color }) => {
              const isSelected = node.labels?.includes(name);
              return (
                <button
                  key={name}
                  onClick={() => {
                    const newLabels = isSelected
                      ? (node.labels || []).filter((l: string) => l !== name)
                      : [...(node.labels || []), name];
                    onUpdate(node.id, { labels: newLabels });
                  }}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '6px',
                    border: isSelected ? `2px solid ${color}` : `1px solid ${colors.border}`,
                    background: isSelected ? `${color}20` : 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '4px',
                    background: color,
                    margin: 'auto',
                  }} />
                </button>
              );
            })}
          </div>
        </div>

        {node.history && node.history.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: 500,
              color: colors.textSecondary,
              marginBottom: '8px',
            }}>
              <Clock size={14} />
              历史版本 ({node.history.length})
            </label>
            <div style={{
              maxHeight: '200px',
              overflow: 'auto',
              borderRadius: '12px',
              border: `1px solid ${colors.border}`,
            }}>
              {(node.history ?? []).map((version: any, index: number) => (
                <div
                  key={index}
                  onClick={() => onRevertToVersion(node.id, version)}
                  style={{
                    padding: '10px 12px',
                    borderBottom: index < (node.history?.length ?? 0) - 1 ? `1px solid ${colors.border}` : 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  {version.output_url && (
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      background: colors.bgSecondary,
                      overflow: 'hidden',
                    }}>
                      <img src={version.output_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', color: colors.textMuted }}>
                      {new Date(version.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{
        padding: '16px 20px',
        borderTop: `1px solid ${colors.border}`,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}>
        <button
          onClick={() => onStar(node.id, !node.is_starred)}
          style={{
            width: '100%',
            padding: '10px 16px',
            borderRadius: '12px',
            border: `1px solid ${colors.border}`,
            background: node.is_starred ? `${accentColor}20` : 'transparent',
            color: node.is_starred ? accentColor : colors.textPrimary,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          <Star size={16} fill={node.is_starred ? accentColor : 'none'} />
          {node.is_starred ? '已收藏' : '收藏'}
        </button>

        {node.type === 'text' && (
          <button
            onClick={() => onGenerate(node.id, 'image')}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '12px',
              border: 'none',
              background: `linear-gradient(135deg, ${accentColor} 0%, #a78bfa 100%)`,
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            生成图片
          </button>
        )}

        {node.type === 'image' && (
          <>
            <button
              onClick={() => onGenerate(node.id, 'image')}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                border: 'none',
                background: `linear-gradient(135deg, #10b981 0%, #34d399 100%)`,
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              图生图
            </button>
            <button
              onClick={() => onGenerate(node.id, 'video')}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                border: 'none',
                background: `linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)`,
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              生成视频
            </button>
          </>
        )}

        {node.type === 'video' && (
          <button
            onClick={() => onGenerate(node.id, 'video')}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '12px',
              border: 'none',
              background: `linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)`,
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            视频生视频
          </button>
        )}
      </div>
    </div>
  );
}