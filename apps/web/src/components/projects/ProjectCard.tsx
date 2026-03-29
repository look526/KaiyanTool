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

function getCoverImageUrl(project: Project): string {
  if (project.thumbnail_url) {
    return project.thumbnail_url;
  }
  return `https://picsum.photos/seed/${project.id}/800/600`;
}

export function ProjectCard({ project, viewMode, typeConfig, statusConfig, formatDate }: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
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
    overlayGradient: 'linear-gradient(to top, rgba(17, 25, 46, 0.95) 0%, rgba(17, 25, 46, 0.6) 40%, transparent 100%)',
    hoverOverlay: 'rgba(0, 0, 0, 0.5)',
  } : {
    glassBg: 'rgba(255, 255, 255, 0.9)',
    border: 'rgba(0, 0, 0, 0.06)',
    textPrimary: '#18181b',
    textSecondary: 'rgba(24, 24, 27, 0.6)',
    hoverBg: 'rgba(0, 0, 0, 0.05)',
    cardGradientTop: 'rgba(0, 0, 0, 0.05)',
    cardBg: 'rgba(139, 92, 246, 0.1)',
    avatarBorder: 'rgba(255, 255, 255, 0.9)',
    overlayGradient: 'linear-gradient(to top, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.6) 40%, transparent 100%)',
    hoverOverlay: 'rgba(0, 0, 0, 0.3)',
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
            borderRadius: '18px',
            background: colors.glassBg,
            backdropFilter: 'blur(30px)',
            border: `1px solid ${colors.border}`,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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
            overflow: 'hidden',
          }}>
            {project.thumbnail_url || !typeConfig ? (
              <img
                src={getCoverImageUrl(project)}
                alt={project.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onLoad={() => setImageLoaded(true)}
              />
            ) : (
              <span className="material-symbols-outlined" style={{
                fontSize: '22px',
                color: 'white',
                fontVariationSettings: "'FILL' 1, 'wght' 500",
              }}>{typeConfig.icon}</span>
            )}
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

  const coverUrl = getCoverImageUrl(project);

  return (
    <Link to={`/projects/${project.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          position: 'relative',
          borderRadius: '24px',
          background: colors.glassBg,
          backdropFilter: 'blur(30px)',
          border: `1px solid ${isHovered ? 'rgba(139, 92, 246, 0.25)' : colors.border}`,
          overflow: 'hidden',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
          boxShadow: isHovered ? '0 20px 40px rgba(139, 92, 246, 0.15), 0 0 60px rgba(139, 92, 246, 0.05)' : 'none',
        }}
      >
        <div style={{
          position: 'relative',
          height: '200px',
          overflow: 'hidden',
          background: colors.cardBg,
        }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            background: typeConfig.gradient,
            opacity: isHovered ? 0.7 : 0.6,
            transition: 'opacity 0.6s ease',
          }} />

          <img
            src={coverUrl}
            alt={project.name}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: imageLoaded ? 0.8 : 0,
              transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: isHovered ? 'scale(1.08)' : 'scale(1)',
            }}
            onLoad={() => setImageLoaded(true)}
          />

          <div style={{
            position: 'absolute',
            inset: 0,
            background: colors.overlayGradient,
            opacity: isHovered ? 1 : 0.7,
            transition: 'opacity 0.4s ease',
          }} />

          <div style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            padding: '6px 14px',
            borderRadius: '9999px',
            background: isHovered ? typeConfig.color : `${typeConfig.color}90`,
            backdropFilter: 'blur(10px)',
            fontSize: '10px',
            fontWeight: 700,
            color: 'white',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            transition: 'all 0.4s ease',
            boxShadow: isHovered ? `0 4px 12px ${typeConfig.color}40` : 'none',
          }}>
            {typeConfig.label}
          </div>

          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.4s ease',
          }}>
            <span style={{
              padding: '12px 28px',
              borderRadius: '9999px',
              background: `linear-gradient(135deg, ${typeConfig.color} 0%, ${typeConfig.color}cc 100%)`,
              color: 'white',
              fontSize: '13px',
              fontWeight: 600,
              boxShadow: `0 8px 24px ${typeConfig.color}50`,
              transform: isHovered ? 'translateY(0)' : 'translateY(10px)',
              transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            }}>
              点击查看
            </span>
          </div>
        </div>

        <div style={{ padding: '20px 24px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '14px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: typeConfig.gradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: `0 4px 12px ${typeConfig.color}30`,
            }}>
              <span className="material-symbols-outlined" style={{
                fontSize: '22px',
                color: 'white',
                fontVariationSettings: "'FILL' 1, 'wght' 500",
              }}>{typeConfig.icon}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 700,
                color: colors.textPrimary,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                marginBottom: '6px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                margin: '0 0 6px 0',
              }}>{project.name}</h3>
              <p style={{
                fontSize: '13px',
                color: colors.textSecondary,
                margin: 0,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: 1.5,
              }}>{project.description || '暂无描述'}</p>
            </div>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '16px',
            borderTop: `1px solid ${colors.border}`,
          }}>
            <span style={{
              padding: '5px 12px',
              borderRadius: '8px',
              background: statusConfig.bg,
              fontSize: '12px',
              fontWeight: 600,
              color: statusConfig.color,
            }}>{statusConfig.label}</span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: colors.textSecondary }}>
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>calendar_today</span>
                <span style={{ fontSize: '12px' }}>{formatDate(project.updated_at)}</span>
              </div>

              <div style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                border: `1.5px solid ${colors.avatarBorder}`,
                background: `${typeConfig.color}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 600,
                color: typeConfig.color,
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
