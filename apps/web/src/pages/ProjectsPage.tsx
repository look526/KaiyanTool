import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient, Project } from '../lib/api';
import { FilterSelect } from '../components/projects/FilterSelect';
import { ProjectCard } from '../components/projects/ProjectCard';
import { useTheme } from '../contexts/ThemeContext';

function StatCard({ value, label }: { value: number; label: string }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [isHovered, setIsHovered] = useState(false);

  const colors = isDark ? {
    bg: 'rgba(255, 255, 255, 0.03)',
    bgHover: 'rgba(139, 92, 246, 0.15)',
    border: 'rgba(255, 255, 255, 0.06)',
    textPrimary: '#dfe4fe',
    textMuted: '#a5aac2',
    accent: '#a78bfa',
  } : {
    bg: 'rgba(255, 255, 255, 0.8)',
    bgHover: 'rgba(139, 92, 246, 0.1)',
    border: 'rgba(0, 0, 0, 0.06)',
    textPrimary: '#18181b',
    textMuted: 'rgba(24, 24, 27, 0.6)',
    accent: '#7c3aed',
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '24px 32px',
        borderRadius: '24px',
        background: isHovered ? colors.bgHover : colors.bg,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${colors.border}`,
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'default',
      }}
    >
      <span style={{
        fontSize: '48px',
        fontWeight: 800,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        color: isHovered ? colors.accent : colors.textPrimary,
        lineHeight: 1,
        marginBottom: '8px',
        transition: 'color 0.4s ease',
      }}>
        {value}
      </span>
      <span style={{
        fontSize: '12px',
        fontWeight: 300,
        color: colors.textMuted,
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
      }}>
        {label}
      </span>
    </div>
  );
}

export default function ProjectsPage() {
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [newProjectHover, setNewProjectHover] = useState(false);
  const [createHover, setCreateHover] = useState(false);

  const colors = useMemo(() => isDark ? {
    bgPage: 'linear-gradient(180deg, #070d1f 0%, #0c1326 50%, #11192e 100%)',
    bgHeader: 'rgba(7, 13, 31, 0.8)',
    bgGlass: 'rgba(255, 255, 255, 0.04)',
    bgGlassHover: 'rgba(255, 255, 255, 0.08)',
    textPrimary: '#dfe4fe',
    textSecondary: 'rgba(223, 228, 254, 0.6)',
    textMuted: '#a5aac2',
    border: 'rgba(255, 255, 255, 0.06)',
    accent: '#8b5cf6',
    accentLight: '#a78bfa',
    accentDim: '#7c3aed',
    glow1: 'rgba(139, 92, 246, 0.12)',
    glow2: 'rgba(236, 99, 255, 0.08)',
    cardBg: 'rgba(255, 255, 255, 0.03)',
    inputBg: 'rgba(255, 255, 255, 0.04)',
    cardIconBg: 'rgba(139, 92, 246, 0.1)',
  } : {
    bgPage: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
    bgHeader: 'rgba(255, 255, 255, 0.9)',
    bgGlass: 'rgba(0, 0, 0, 0.04)',
    bgGlassHover: 'rgba(0, 0, 0, 0.08)',
    textPrimary: '#18181b',
    textSecondary: 'rgba(24, 24, 27, 0.6)',
    textMuted: 'rgba(24, 24, 27, 0.5)',
    border: 'rgba(0, 0, 0, 0.06)',
    accent: '#7c3aed',
    accentLight: '#8b5cf6',
    accentDim: '#6d28d9',
    glow1: 'rgba(139, 92, 246, 0.08)',
    glow2: 'rgba(236, 99, 255, 0.05)',
    cardBg: 'rgba(255, 255, 255, 0.9)',
    inputBg: 'rgba(0, 0, 0, 0.04)',
    cardIconBg: 'rgba(139, 92, 246, 0.08)',
  }, [isDark]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, filterType, filterStatus, viewMode]);

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.getProjects({
        page,
        limit: viewMode === 'grid' ? 12 : 10,
        search: searchQuery || undefined,
        type: filterType !== 'all' ? filterType : undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined,
      });
      setProjects(response.projects);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  }, [page, filterType, filterStatus, searchQuery, viewMode]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const getProjectTypeConfig = useCallback((type: string) => {
    const upperType = (type || '').toUpperCase();
    switch (upperType) {
      case 'SCRIPT':
        return { icon: 'description' as const, gradient: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)', label: 'SCRIPT', color: '#8b5cf6' };
      case 'NOVEL':
        return { icon: 'menu_book' as const, gradient: 'linear-gradient(135deg, #ec63ff 0%, #f487ff 100%)', label: 'NOVEL', color: '#ec63ff' };
      case 'MIXED':
        return { icon: 'auto_awesome' as const, gradient: 'linear-gradient(135deg, #34b5fa 0%, #81ccff 100%)', label: 'MIXED', color: '#34b5fa' };
      default:
        return { icon: 'folder_open' as const, gradient: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)', label: 'PROJECT', color: '#8b5cf6' };
    }
  }, []);

  const getStatusConfig = useCallback((status: string) => {
    const upperStatus = (status || '').toUpperCase();
    switch (upperStatus) {
      case 'ACTIVE':
        return { label: '进行中', color: '#0891b2', bg: 'rgba(8, 145, 178, 0.15)' };
      case 'COMPLETED':
        return { label: '已完成', color: '#7c3aed', bg: 'rgba(124, 58, 237, 0.15)' };
      case 'PAUSED':
        return { label: '已暂停', color: '#db2777', bg: 'rgba(219, 39, 119, 0.15)' };
      case 'ARCHIVED':
        return { label: '已归档', color: '#6b7280', bg: 'rgba(107, 114, 128, 0.15)' };
      default:
        return { label: '草稿', color: '#6b7280', bg: 'rgba(107, 114, 128, 0.15)' };
    }
  }, []);

  const formatDate = useCallback((date: Date | string | undefined | null) => {
    if (!date) return '未知';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return '未知';
    return dateObj.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
  }, []);

  const stats = useMemo(() => ({
    total: projects.length,
    active: projects.filter(p => p.status === 'ACTIVE').length,
    completed: projects.filter(p => p.status === 'COMPLETED').length,
  }), [projects]);

  return (
    <div style={{
      minHeight: '100vh',
      background: colors.bgPage,
      fontFamily: "'Manrope', sans-serif",
      color: colors.textPrimary,
      position: 'relative',
      overflowX: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: '20%',
        width: '60%',
        height: '400px',
        background: `radial-gradient(ellipse at center, ${colors.glow1} 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        top: 100,
        right: '10%',
        width: '300px',
        height: '300px',
        background: `radial-gradient(ellipse at center, ${colors.glow2} 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      <header style={{
        position: 'fixed',
        top: 0,
        right: 0,
        left: '256px',
        height: '72px',
        background: colors.bgHeader,
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 32px',
        zIndex: 40,
        borderBottom: `1px solid ${colors.border}`,
      }}>
        <h2 style={{
          fontSize: '18px',
          fontWeight: 700,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          color: colors.textPrimary,
          margin: 0,
        }}>项目列表</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: colors.inputBg,
            backdropFilter: 'blur(20px)',
            padding: '10px 16px',
            borderRadius: '14px',
            border: `1px solid ${colors.border}`,
            gap: '10px',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: colors.textMuted }}>search</span>
            <input
              type="text"
              placeholder="搜索项目..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: '14px',
                width: '200px',
                color: colors.textPrimary,
                fontFamily: 'Manrope, sans-serif',
              }}
            />
          </div>
          <button style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            border: 'none',
            background: 'transparent',
            color: colors.textMuted,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>notifications</span>
          </button>
          <button style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            border: 'none',
            background: 'transparent',
            color: colors.textMuted,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>account_circle</span>
          </button>
        </div>
      </header>

      <main style={{
        marginLeft: '256px',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{ padding: '112px 48px 0' }}>
          <section style={{
            textAlign: 'center',
            paddingBottom: '60px',
          }}>
            <h1 style={{
              fontSize: '14px',
              fontWeight: 300,
              color: colors.textMuted,
              letterSpacing: '0.4em',
              textTransform: 'uppercase',
              marginBottom: '16px',
            }}>
              MY PROJECTS
            </h1>
            <p style={{
              fontSize: '15px',
              fontWeight: 300,
              color: colors.textMuted,
              marginBottom: '48px',
              letterSpacing: '0.05em',
            }}>
              管理您的创作项目
            </p>

            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '24px',
              flexWrap: 'wrap',
            }}>
              <StatCard value={stats.total} label="全部项目" />
              <StatCard value={stats.active} label="进行中" />
              <StatCard value={stats.completed} label="已完成" />
            </div>
          </section>
        </div>

        <div style={{ padding: '0 48px 48px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px',
            flexWrap: 'wrap',
            gap: '16px',
          }}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <FilterSelect value={filterType} onChange={setFilterType} options={[
                { value: 'all', label: '全部类型' },
                { value: 'SCRIPT', label: '剧本' },
                { value: 'NOVEL', label: '小说' },
                { value: 'MIXED', label: '混合' },
              ]} />
              <FilterSelect value={filterStatus} onChange={setFilterStatus} options={[
                { value: 'all', label: '全部状态' },
                { value: 'ACTIVE', label: '进行中' },
                { value: 'COMPLETED', label: '已完成' },
                { value: 'PAUSED', label: '已暂停' },
                { value: 'ARCHIVED', label: '已归档' },
              ]} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                display: 'flex',
                background: colors.inputBg,
                backdropFilter: 'blur(20px)',
                padding: '4px',
                borderRadius: '14px',
                border: `1px solid ${colors.border}`,
                gap: '4px',
              }}>
                <button
                  onClick={() => setViewMode('grid')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    border: 'none',
                    background: viewMode === 'grid' ? `${colors.accent}30` : 'transparent',
                    color: viewMode === 'grid' ? colors.accent : colors.textMuted,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>grid_view</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    border: 'none',
                    background: viewMode === 'list' ? `${colors.accent}30` : 'transparent',
                    color: viewMode === 'list' ? colors.accent : colors.textMuted,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>view_list</span>
                </button>
              </div>
              <button
                onClick={() => navigate('/projects/new')}
                onMouseEnter={() => setNewProjectHover(true)}
                onMouseLeave={() => setNewProjectHover(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '14px 28px',
                  borderRadius: '16px',
                  fontSize: '14px',
                  fontWeight: 600,
                  fontFamily: "'Manrope', sans-serif",
                  border: 'none',
                  background: isDark
                    ? (newProjectHover
                        ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.9) 0%, rgba(124, 58, 237, 0.95) 100%)'
                        : 'rgba(139, 92, 246, 0.7)')
                    : (newProjectHover
                        ? 'linear-gradient(135deg, rgba(124, 58, 237, 0.95) 0%, rgba(139, 92, 246, 0.9) 100%)'
                        : 'rgba(124, 58, 237, 0.85)'),
                  color: '#ffffff',
                  cursor: 'pointer',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  boxShadow: newProjectHover
                    ? `0 8px 32px ${colors.accent}40, 0 0 60px ${colors.accent}20`
                    : `0 4px 16px ${colors.accent}20`,
                  transform: newProjectHover ? 'translateY(-2px) scale(1.02)' : 'translateY(0) scale(1)',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <span className="material-symbols-outlined" style={{
                  fontSize: '20px',
                  fontVariationSettings: "'FILL' 1, 'wght' 500",
                }}>add</span>
                <span>新建项目</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '120px 0' }}>
              <div style={{
                width: '48px',
                height: '48px',
                border: `3px solid ${colors.accent}20`,
                borderTopColor: colors.accent,
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }} />
            </div>
          ) : projects.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '120px 0',
              textAlign: 'center',
            }}>
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '32px',
                background: colors.cardIconBg,
                backdropFilter: 'blur(40px)',
                border: `1px solid ${colors.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '32px',
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '56px', color: colors.textMuted }}>movie</span>
              </div>
              <h3 style={{
                fontSize: '24px',
                fontWeight: 700,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: colors.textPrimary,
                marginBottom: '12px',
              }}>暂无项目</h3>
              <p style={{
                fontSize: '14px',
                color: colors.textMuted,
                marginBottom: '32px',
                maxWidth: '320px',
                lineHeight: 1.6,
              }}>创建您的第一个项目，开始精彩的创作之旅</p>
              <button
                onClick={() => navigate('/projects/new')}
                onMouseEnter={() => setCreateHover(true)}
                onMouseLeave={() => setCreateHover(false)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '16px 32px',
                  borderRadius: '16px',
                  fontSize: '15px',
                  fontWeight: 600,
                  fontFamily: "'Manrope', sans-serif",
                  border: 'none',
                  background: isDark
                    ? (createHover
                        ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.9) 0%, rgba(124, 58, 237, 0.95) 100%)'
                        : 'rgba(139, 92, 246, 0.7)')
                    : (createHover
                        ? 'linear-gradient(135deg, rgba(124, 58, 237, 0.95) 0%, rgba(139, 92, 246, 0.9) 100%)'
                        : 'rgba(124, 58, 237, 0.85)'),
                  color: '#ffffff',
                  cursor: 'pointer',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  boxShadow: createHover
                    ? `0 12px 40px ${colors.accent}40, 0 0 80px ${colors.accent}20`
                    : `0 6px 24px ${colors.accent}25`,
                  transform: createHover ? 'translateY(-3px) scale(1.02)' : 'translateY(0) scale(1)',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <span className="material-symbols-outlined" style={{
                  fontSize: '22px',
                  fontVariationSettings: "'FILL' 1, 'wght' 500",
                }}>add</span>
                <span>创建项目</span>
              </button>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: viewMode === 'grid'
                ? 'repeat(auto-fill, minmax(340px, 1fr))'
                : '1fr',
              gap: '24px',
              paddingBottom: '40px',
            }}>
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  viewMode={viewMode}
                  typeConfig={getProjectTypeConfig(project.type)}
                  statusConfig={getStatusConfig(project.status)}
                  formatDate={formatDate}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
