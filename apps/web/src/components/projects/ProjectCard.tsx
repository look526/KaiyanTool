import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Project } from '../../lib/api';

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
  return `https://picsum.photos/seed/${project.id}/800/1200`;
}

export function ProjectCard({ project, viewMode, typeConfig, statusConfig, formatDate }: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [moreHover, setMoreHover] = useState(false);

  if (viewMode === 'list') {
    return (
      <Link to={`/projects/${project.id}`} style={{ textDecoration: 'none' }}>
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            padding: '20px 24px',
            borderRadius: '20px',
            background: isHovered ? 'rgba(139, 92, 246, 0.08)' : 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: isHovered ? 'translateX(6px)' : 'translateX(0)',
          }}
        >
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: typeConfig.gradient,
            overflow: 'hidden',
            flexShrink: 0,
            position: 'relative',
          }}>
            {project.thumbnail_url ? (
              <img
                src={getCoverImageUrl(project)}
                alt={project.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onLoad={() => setImageLoaded(true)}
              />
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <span className="material-symbols-outlined" style={{
                  fontSize: '28px',
                  color: 'white',
                  fontVariationSettings: "'FILL' 1, 'wght' 500",
                }}>{typeConfig.icon}</span>
              </div>
            )}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{
              fontSize: '17px',
              fontWeight: 700,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: '#dfe4fe',
              marginBottom: '6px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>{project.name}</h3>
            <p style={{
              fontSize: '13px',
              color: '#a5aac2',
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>{project.description || '暂无描述'}</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexShrink: 0 }}>
            <span style={{
              padding: '6px 14px',
              borderRadius: '9999px',
              background: statusConfig.bg,
              fontSize: '12px',
              fontWeight: 600,
              color: statusConfig.color,
            }}>{statusConfig.label}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#a5aac2' }}>
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
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                border: 'none',
                background: moreHover ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                color: moreHover ? '#dfe4fe' : '#a5aac2',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>more_vert</span>
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
          borderRadius: '28px',
          overflow: 'hidden',
          height: '480px',
          background: '#0c1326',
          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isHovered ? 'translateY(-10px) scale(1.02)' : 'translateY(0) scale(1)',
          boxShadow: isHovered
            ? '0 30px 60px rgba(0, 0, 0, 0.4), 0 0 80px rgba(139, 92, 246, 0.15)'
            : '0 10px 40px rgba(0, 0, 0, 0.2)',
        }}
      >
        <div style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
        }}>
          <img
            src={coverUrl}
            alt={project.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: imageLoaded ? (isHovered ? 0.9 : 0.75) : 0,
              transition: 'all 0.6s ease',
              transform: isHovered ? 'scale(1.08)' : 'scale(1)',
            }}
            onLoad={() => setImageLoaded(true)}
          />

          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(7, 13, 31, 0.98) 0%, rgba(7, 13, 31, 0.7) 35%, transparent 60%)',
            transition: 'opacity 0.5s ease',
          }} />

          <div style={{
            position: 'absolute',
            inset: 0,
            background: typeConfig.gradient,
            opacity: isHovered ? 0.15 : 0.08,
            transition: 'opacity 0.5s ease',
          }} />
        </div>

        <div style={{
          position: 'absolute',
          top: '24px',
          left: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span style={{
            padding: '6px 16px',
            borderRadius: '9999px',
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(20px)',
            fontSize: '10px',
            fontWeight: 600,
            fontFamily: "'Manrope', sans-serif",
            color: typeConfig.color,
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            border: `1px solid ${typeConfig.color}40`,
          }}>
            {typeConfig.label}
          </span>
        </div>

        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '32px',
          transition: 'all 0.5s ease',
        }}>
          <h3 style={{
            fontSize: '28px',
            fontWeight: 800,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            color: '#ffffff',
            marginBottom: '12px',
            lineHeight: 1.2,
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            letterSpacing: '-0.01em',
          }}>
            {project.name}
          </h3>

          <p style={{
            fontSize: '14px',
            fontFamily: "'Manrope', sans-serif",
            fontWeight: 400,
            color: 'rgba(223, 228, 254, 0.7)',
            marginBottom: '20px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            lineHeight: 1.5,
          }}>
            {project.description || '暂无描述'}
          </p>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{
                padding: '5px 12px',
                borderRadius: '8px',
                background: statusConfig.bg,
                fontSize: '11px',
                fontWeight: 600,
                color: statusConfig.color,
              }}>
                {statusConfig.label}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#a5aac2' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>calendar_today</span>
                <span style={{ fontSize: '12px', fontWeight: 400 }}>{formatDate(project.updated_at)}</span>
              </div>
            </div>

            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: isHovered ? 1 : 0,
              transform: isHovered ? 'scale(1)' : 'scale(0.5)',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 8px 24px rgba(139, 92, 246, 0.4)',
            }}>
              <span className="material-symbols-outlined" style={{
                fontSize: '20px',
                color: 'white',
                fontVariationSettings: "'FILL' 1, 'wght' 500",
              }}>arrow_forward</span>
            </div>
          </div>
        </div>

        <div style={{
          position: 'absolute',
          top: '24px',
          right: '24px',
          opacity: isHovered ? 1 : 0,
          transform: isHovered ? 'translateX(0)' : 'translateX(10px)',
          transition: 'all 0.4s ease',
        }}>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              border: 'none',
              background: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(20px)',
              color: '#ffffff',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>more_vert</span>
          </button>
        </div>
      </div>
    </Link>
  );
}
