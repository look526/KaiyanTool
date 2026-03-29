import { useState, useRef, useEffect } from 'react';
import { Type, Image as ImageIcon, Video, Star, Sparkles } from 'lucide-react';
import { CanvasNode as CanvasNodeType } from '../../types/workspace';

const accentColor = '#8b5cf6';

const labelColors: Record<string, string> = {
  red: '#ef4444',
  yellow: '#f59e0b',
  green: '#10b981',
  blue: '#3b82f6',
  purple: '#8b5cf6',
};

interface CanvasNodeProps {
  node: CanvasNodeType;
  isSelected: boolean;
  isMultiSelected: boolean;
  zoom: number;
  onSelect: () => void;
  onDragStart: (e: React.MouseEvent) => void;
  onDoubleClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onTextChange?: (text: string) => void;
  isDark: boolean;
}

export function CanvasNode({
  node,
  isSelected,
  isMultiSelected,
  zoom,
  onSelect,
  onDragStart,
  onDoubleClick,
  onContextMenu,
  onTextChange,
  isDark,
}: CanvasNodeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(node.content.text || '');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const colors = isDark ? {
    bgPrimary: 'rgba(5, 5, 10, 0.95)',
    bgSecondary: 'rgba(255, 255, 255, 0.03)',
    border: 'rgba(255, 255, 255, 0.06)',
    textPrimary: '#fafafa',
    textSecondary: 'rgba(250, 250, 250, 0.6)',
    textMuted: 'rgba(250, 250, 250, 0.4)',
  } : {
    bgPrimary: 'rgba(255, 255, 255, 0.92)',
    bgSecondary: 'rgba(0, 0, 0, 0.02)',
    border: 'rgba(0, 0, 0, 0.06)',
    textPrimary: '#18181b',
    textSecondary: 'rgba(24, 24, 27, 0.6)',
    textMuted: 'rgba(24, 24, 27, 0.4)',
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'text': return <Type size={20} />;
      case 'image': return <ImageIcon size={20} />;
      case 'video': return <Video size={20} />;
      default: return <Sparkles size={20} />;
    }
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'text': return '#8b5cf6';
      case 'image': return '#10b981';
      case 'video': return '#f59e0b';
      default: return accentColor;
    }
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClickForEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (node.type === 'text') {
      setIsEditing(true);
      setEditText(node.content.text || '');
    } else {
      onDoubleClick();
    }
  };

  const handleEditComplete = () => {
    setIsEditing(false);
    if (onTextChange && editText !== node.content.text) {
      onTextChange(editText);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEditComplete();
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
      setEditText(node.content.text || '');
    }
  };

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
      onContextMenu={onContextMenu}
      onMouseDown={onDragStart}
      onDoubleClick={handleDoubleClickForEdit}
      style={{
        position: 'absolute',
        left: node.position_x,
        top: node.position_y,
        width: '240px',
        borderRadius: '16px',
        background: colors.bgPrimary,
        backdropFilter: 'blur(20px)',
        border: isSelected || isMultiSelected ? `2px solid ${accentColor}` : `1px solid ${colors.border}`,
        boxShadow: isSelected || isMultiSelected
          ? `0 0 30px ${accentColor}30, 0 20px 40px rgba(0,0,0,0.15)`
          : `0 8px 24px rgba(0,0,0,0.1)`,
        cursor: 'move',
        userSelect: 'none',
        transform: `scale(${zoom})`,
        transformOrigin: 'top left',
      }}
    >
      {node.is_starred && (
        <div style={{
          position: 'absolute',
          top: '-8px',
          right: '-8px',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: accentColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Star size={12} fill="white" color="white" />
        </div>
      )}

      {node.labels && node.labels.length > 0 && (
        <div style={{ position: 'absolute', top: '-4px', left: '8px', display: 'flex', gap: '4px' }}>
          {node.labels.map((label, i) => (
            <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: labelColors[label] || accentColor }} />
          ))}
        </div>
      )}

      <div style={{
        padding: '12px 16px',
        borderBottom: `1px solid ${colors.border}`,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '10px',
          background: `${getNodeColor(node.type)}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: getNodeColor(node.type),
        }}>
          {getNodeIcon(node.type)}
        </div>
        <span style={{ fontSize: '14px', fontWeight: 600, color: colors.textPrimary }}>
          {node.type === 'text' ? '文字' : node.type === 'image' ? '图片' : '视频'}
        </span>
        {node.is_generating && (
          <div style={{
            marginLeft: 'auto',
            padding: '4px 8px',
            borderRadius: '6px',
            background: `${accentColor}20`,
            color: accentColor,
            fontSize: '11px',
            fontWeight: 600,
          }}>
            生成中 {Math.round(node.generation_progress || 0)}%
          </div>
        )}
      </div>

      <div style={{ padding: '12px 16px' }}>
        {node.type === 'text' && (
          isEditing ? (
            <textarea
              ref={inputRef}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onBlur={handleEditComplete}
              onKeyDown={handleKeyDown}
              style={{
                width: '100%',
                minHeight: '80px',
                background: 'transparent',
                border: `1px solid ${accentColor}`,
                borderRadius: '8px',
                padding: '8px',
                color: colors.textPrimary,
                fontSize: '13px',
                lineHeight: 1.5,
                resize: 'none',
                outline: 'none',
              }}
            />
          ) : (
            <div style={{
              fontSize: '13px',
              color: colors.textSecondary,
              lineHeight: 1.5,
              maxHeight: '80px',
              overflow: 'hidden',
              cursor: 'text',
            }}>
              {node.content.text || '双击编辑文字'}
            </div>
          )
        )}
        {node.type === 'image' && (
          <div style={{
            width: '100%',
            height: '120px',
            borderRadius: '12px',
            background: colors.bgSecondary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}>
            {node.content.url ? (
              <img src={node.content.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <ImageIcon size={32} color={colors.textMuted} />
            )}
          </div>
        )}
        {node.type === 'video' && (
          <div style={{
            width: '100%',
            height: '120px',
            borderRadius: '12px',
            background: colors.bgSecondary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}>
            {node.content.url ? (
              <video src={node.content.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <Video size={32} color={colors.textMuted} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
