import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Project } from '../../lib/api';
import { useTheme } from '../../contexts/ThemeContext';

interface ProjectCardProps {
  project: Project;
  viewMode: 'grid' | 'list';
  typeConfig: { icon: string; gradient: string; label: string; color: string };
  statusConfig: { label: string; color: string; bg: string };
  formatDate: (date: Date | string | undefined | null) => string;
}

export function ProjectCard({ project, viewMode, typeConfig, statusConfig, formatDate }: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [moreHover, setMoreHover] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const colors = isDark ? {
    glassBg: 'rgba(28, 37, 62, 0.4)',
    border: 'rgba(65, 71, 91, 0.15)',
    textPrimary: '#dfe4fe',
    textSecondary: '#a5aac2',
    hoverBg: 'rgba(255, 255, 255, 0.1)',
    cardGradientTop: '#11192e',
    cardBg: '#171f36',
    avatarBorder: '#070d1f',
  } : {
    glassBg: 'rgba(255, 255, 255, 0.9)',
    border: 'rgba(0, 0, 0, 0.06)',
    textPrimary: '#18181b',
    textSecondary: 'rgba(24, 24, 27, 0.6)',
    hoverBg: 'rgba(0, 0, 0, 0.05)',
    cardGradientTop: 'rgba(0, 0, 0, 0.05)',
    cardBg: 'rgba(139, 92, 246, 0.1)',
    avatarBorder: 'rgba(255, 255, 255, 0.9)',
  };

  if (viewMode === 'list') {
    return (
      <Link to={`/projects/${project.id}`} style={{ textDecoration: 'none' }}>
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '16px 20px',
            borderRadius: '16px',
            background: colors.glassBg,
            backdropFilter: 'blur(30px)',
            border: `1px solid ${colors.border}`,
            transition: 'all 0.3s ease',
            transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
          }}
        >
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: typeConfig.gradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <span className="material-symbols-outlined" style={{
              fontSize: '22px',
              color: 'white',
              fontVariationSettings: "'FILL' 1, 'wght' 500",
            }}>{typeConfig.icon}</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{
              fontSize: '15px',
              fontWeight: 600,
              color: colors.textPrimary,
              marginBottom: '4px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              margin: '0 0 4px 0',
            }}>{project.name}</h3>
            <p style={{
              fontSize: '13px',
              color: colors.textSecondary,
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>{project.description || '暂无描述'}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
            <span style={{
              padding: '4px 12px',
              borderRadius: '9999px',
              background: statusConfig.bg,
              fontSize: '12px',
              fontWeight: 600,
              color: statusConfig.color,
            }}>{statusConfig.label}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: colors.textSecondary }}>
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>calendar_today</span>
              <span style={{ fontSize: '12px' }}>{formatDate(project.updated_at)}</span>
            </div>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onMouseEnter={() => setMoreHover(true)}
              onMouseLeave={() => setMoreHover(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                border: 'none',
                background: moreHover ? colors.hoverBg : 'transparent',
                color: moreHover ? colors.textPrimary : colors.textSecondary,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>more_vert</span>
            </button>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/projects/${project.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          position: 'relative',
          borderRadius: '16px',
          background: colors.glassBg,
          backdropFilter: 'blur(30px)',
          border: `1px solid ${colors.border}`,
          overflow: 'hidden',
          transition: 'all 0.5s ease',
          transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
          boxShadow: isHovered ? '0 20px 40px rgba(186, 158, 255, 0.15)' : 'none',
        }}
      >
        {/* 封面图片区域 */}
        <div style={{
          position: 'relative',
          height: '192px',
          overflow: 'hidden',
          background: colors.cardBg,
        }}>
          {/* 封面图 - 使用渐变色块代替 */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: typeConfig.gradient,
            opacity: 0.6,
            transition: 'transform 0.7s ease',
            transform: isHovered ? 'scale(1.1)' : 'scale(1)',
          }} />

          {/* 渐变覆盖层 */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(to top, ${colors.cardGradientTop}, transparent)`,
          }} />

          {/* 状态标签 */}
          <div style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            padding: '6px 12px',
            borderRadius: '9999px',
            background: `${typeConfig.color}20`,
            backdropFilter: 'blur(10px)',
            fontSize: '10px',
            fontWeight: 700,
            color: typeConfig.color,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}>{typeConfig.label}</div>

          {/* Hover 时的覆盖层 */}
          {isHovered && (
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0, 0, 0, 0.4)',
              transition: 'all 0.3s ease',
            }}>
              <span style={{
                padding: '8px 16px',
                borderRadius: '9999px',
                background: `linear-gradient(135deg, ${typeConfig.color} 0%, ${typeConfig.color}cc 100%)`,
                color: 'white',
                fontSize: '12px',
                fontWeight: 600,
              }}>点击查看</span>
            </div>
          )}
        </div>

        {/* 卡片内容 */}
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: typeConfig.gradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <span className="material-symbols-outlined" style={{
                fontSize: '20px',
                color: 'white',
                fontVariationSettings: "'FILL' 1, 'wght' 500",
              }}>{typeConfig.icon}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: 700,
                color: colors.textPrimary,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                marginBottom: '8px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                margin: '0 0 8px 0',
              }}>{project.name}</h3>
              <p style={{
                fontSize: '14px',
                color: colors.textSecondary,
                margin: 0,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: 1.6,
              }}>{project.description || '暂无描述'}</p>
            </div>
          </div>

          {/* 底部信息 */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '16px',
            borderTop: `1px solid ${colors.border}`,
          }}>
            <span style={{
              padding: '4px 10px',
              borderRadius: '6px',
              background: statusConfig.bg,
              fontSize: '12px',
              fontWeight: 600,
              color: statusConfig.color,
            }}>{statusConfig.label}</span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: colors.textSecondary }}>calendar_today</span>
              <span style={{ fontSize: '12px', color: colors.textSecondary }}>{formatDate(project.updated_at)}</span>

              {/* 用户头像 */}
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                border: `1px solid ${colors.avatarBorder}`,
                background: `${typeConfig.color}30`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 600,
                color: typeConfig.color,
                marginLeft: '8px',
              }}>
                {project.name?.[0]?.toUpperCase() || 'K'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}