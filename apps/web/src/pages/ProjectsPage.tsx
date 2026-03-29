import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient, Project } from '../lib/api';
import { StatCard } from '../components/projects/StatCard';
import { FilterSelect } from '../components/projects/FilterSelect';
import { ProjectCard } from '../components/projects/ProjectCard';
import { useTheme } from '../contexts/ThemeContext';

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

  const colors = isDark ? {
    bgBase: '#05050a',
    bgSurface: '#0a0a12',
    bgElevated: '#0f0f1a',
    bgPage: 'linear-gradient(180deg, #05050a 0%, #0a0a12 50%, #0f0f1a 100%)',
    bgHeader: 'rgba(5, 5, 10, 0.95)',
    bgGlass: 'rgba(5, 5, 10, 0.6)',
    bgGlassHover: 'rgba(255, 255, 255, 0.06)',
    bgSecondary: 'rgba(255, 255, 255, 0.03)',
    bgInput: 'rgba(255, 255, 255, 0.04)',
    textPrimary: '#fafafa',
    textSecondary: 'rgba(250, 250, 250, 0.6)',
    textMuted: 'rgba(250, 250, 250, 0.4)',
    border: 'rgba(255, 255, 255, 0.06)',
    borderLight: 'rgba(255, 255, 255, 0.05)',
    borderHover: 'rgba(139, 92, 246, 0.25)',
    accent: '#8b5cf6',
    accentLight: '#a78bfa',
    accentDim: '#7c3aed',
    onAccent: '#ffffff',
    shadowAccent: 'rgba(139, 92, 246, 0.3)',
    surfaceContainerLow: '#0c1326',
    surfaceContainerHigh: '#1c253e',
    hoverBg: 'rgba(255, 255, 255, 0.05)',
    glassBg: 'rgba(28, 37, 62, 0.4)',
    glowPrimary: 'rgba(139, 92, 246, 0.08)',
  } : {
    bgBase: '#f5f5f5',
    bgSurface: '#ffffff',
    bgElevated: '#ffffff',
    bgPage: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
    bgHeader: 'rgba(255, 255, 255, 0.95)',
    bgGlass: 'rgba(255, 255, 255, 0.8)',
    bgGlassHover: 'rgba(0, 0, 0, 0.04)',
    bgSecondary: 'rgba(0, 0, 0, 0.02)',
    bgInput: 'rgba(0, 0, 0, 0.04)',
    textPrimary: '#18181b',
    textSecondary: 'rgba(24, 24, 27, 0.6)',
    textMuted: 'rgba(24, 24, 27, 0.4)',
    border: 'rgba(0, 0, 0, 0.06)',
    borderLight: 'rgba(0, 0, 0, 0.04)',
    borderHover: 'rgba(139, 92, 246, 0.25)',
    accent: '#8b5cf6',
    accentLight: '#a78bfa',
    accentDim: '#7c3aed',
    onAccent: '#ffffff',
    shadowAccent: 'rgba(139, 92, 246, 0.3)',
    surfaceContainerLow: '#f1f5f9',
    surfaceContainerHigh: '#e2e8f0',
    hoverBg: 'rgba(0, 0, 0, 0.04)',
    glassBg: 'rgba(255, 255, 255, 0.9)',
    glowPrimary: 'rgba(139, 92, 246, 0.05)',
  };

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
    switch (type.toUpperCase()) {
      case 'SCRIPT':
        return { icon: 'description' as const, gradient: 'linear-gradient(135deg, #ba9eff 0%, #ae8dff 100%)', label: '剧本', color: '#ba9eff' };
      case 'NOVEL':
        return { icon: 'menu_book' as const, gradient: 'linear-gradient(135deg, #ec63ff 0%, #f487ff 100%)', label: '小说', color: '#ec63ff' };
      case 'MIXED':
        return { icon: 'auto_awesome' as const, gradient: 'linear-gradient(135deg, #34b5fa 0%, #81ccff 100%)', label: '混合', color: '#34b5fa' };
      default:
        return { icon: 'folder_open' as const, gradient: 'linear-gradient(135deg, #ba9eff 0%, #ae8dff 100%)', label: '项目', color: '#ba9eff' };
    }
  }, []);

  const getStatusConfig = useCallback((status: string) => {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
        return { label: '进行中', color: '#34b5fa', bg: 'rgba(52, 181, 250, 0.15)' };
      case 'COMPLETED':
        return { label: '已完成', color: '#ba9eff', bg: 'rgba(186, 158, 255, 0.15)' };
      case 'PAUSED':
        return { label: '已暂停', color: '#f487ff', bg: 'rgba(244, 135, 255, 0.15)' };
      case 'ARCHIVED':
        return { label: '已归档', color: '#a5aac2', bg: 'rgba(165, 170, 194, 0.15)' };
      default:
        return { label: '草稿', color: '#a5aac2', bg: 'rgba(165, 170, 194, 0.15)' };
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
      display: 'flex',
      fontFamily: "'Manrope', sans-serif",
      color: colors.textPrimary,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `radial-gradient(ellipse at 20% 20%, ${colors.glowPrimary} 0%, transparent 50%)`,
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `radial-gradient(ellipse at 80% 80%, ${isDark ? 'rgba(139, 92, 246, 0.05)' : 'rgba(139, 92, 246, 0.03)'} 0%, transparent 50%)`,
        pointerEvents: 'none',
      }} />

      <main style={{
        marginLeft: '256px',
        flex: 1,
        position: 'relative',
        zIndex: 1,
      }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: 700,
              color: colors.textPrimary,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              margin: 0,
            }}>项目列表</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: colors.bgInput,
              backdropFilter: 'blur(20px)',
              padding: '10px 16px',
              borderRadius: '14px',
              border: `1px solid ${colors.border}`,
              gap: '10px',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: colors.textSecondary }}>search</span>
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
                  width: '220px',
                  color: colors.textPrimary,
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
              color: colors.textSecondary,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = colors.accent; e.currentTarget.style.background = colors.hoverBg; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = colors.textSecondary; e.currentTarget.style.background = 'transparent'; }}
            >
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
              color: colors.textSecondary,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = colors.accent; e.currentTarget.style.background = colors.hoverBg; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = colors.textSecondary; e.currentTarget.style.background = 'transparent'; }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>account_circle</span>
            </button>
          </div>
        </header>

        <div style={{ padding: '112px 48px 48px' }}>
          <section style={{ marginBottom: '40px' }}>
            <h1 style={{
              fontSize: '36px',
              fontWeight: 800,
              color: colors.textPrimary,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              letterSpacing: '-0.02em',
              margin: '0 0 8px 0',
            }}>我的项目</h1>
            <p style={{ fontSize: '15px', fontWeight: 500, color: colors.textSecondary, margin: 0 }}>管理您的创作项目</p>
          </section>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px',
            marginBottom: '40px',
          }}>
            <StatCard
              icon="dataset"
              value={stats.total}
              label="全部项目"
              gradient="linear-gradient(135deg, #ba9eff 0%, #ae8dff 100%)"
              iconColor="#ba9eff"
              hoverGlow="rgba(186, 158, 255, 0.15)"
            />
            <StatCard
              icon="pending"
              value={stats.active}
              label="进行中"
              gradient="linear-gradient(135deg, #34b5fa 0%, #81ccff 100%)"
              iconColor="#34b5fa"
              hoverGlow="rgba(52, 181, 250, 0.15)"
            />
            <StatCard
              icon="check_circle"
              value={stats.completed}
              label="已完成"
              gradient="linear-gradient(135deg, #ec63ff 0%, #f487ff 100%)"
              iconColor="#ec63ff"
              hoverGlow="rgba(236, 99, 255, 0.15)"
            />
          </div>

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
                background: colors.bgInput,
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
                    background: viewMode === 'grid' ? colors.surfaceContainerHigh : 'transparent',
                    color: viewMode === 'grid' ? colors.accent : colors.textSecondary,
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
                    background: viewMode === 'list' ? colors.surfaceContainerHigh : 'transparent',
                    color: viewMode === 'list' ? colors.accent : colors.textSecondary,
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
                  gap: '8px',
                  padding: '10px 20px',
                  borderRadius: '14px',
                  fontSize: '14px',
                  fontWeight: 600,
                  border: 'none',
                  background: newProjectHover
                    ? `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentDim} 100%)`
                    : `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentLight} 100%)`,
                  color: colors.onAccent,
                  cursor: 'pointer',
                  boxShadow: `0 8px 24px ${colors.accent}40`,
                  transform: newProjectHover ? 'scale(1.03)' : 'scale(1)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px', fill: 'white' }}>add</span>
                <span>新建项目</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '120px 0' }}>
              <div style={{
                width: '48px',
                height: '48px',
                border: `3px solid ${colors.surfaceContainerHigh}`,
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
                width: '96px',
                height: '96px',
                borderRadius: '28px',
                background: colors.glassBg,
                backdropFilter: 'blur(40px)',
                border: `1px solid ${colors.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px',
                boxShadow: `0 20px 40px rgba(0, 0, 0, 0.1), 0 0 60px ${colors.accent}10`,
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '44px', color: colors.textSecondary }}>folder_open</span>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 600, color: colors.textPrimary, marginBottom: '8px', margin: '0 0 8px 0' }}>暂无项目</h3>
              <p style={{ fontSize: '14px', color: colors.textSecondary, marginBottom: '28px', maxWidth: '320px', lineHeight: 1.6 }}>创建您的第一个项目，开始精彩的创作之旅</p>
              <button
                onClick={() => navigate('/projects/new')}
                onMouseEnter={() => setCreateHover(true)}
                onMouseLeave={() => setCreateHover(false)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 28px',
                  borderRadius: '14px',
                  fontSize: '14px',
                  fontWeight: 600,
                  border: 'none',
                  background: createHover
                    ? `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentDim} 100%)`
                    : `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentLight} 100%)`,
                  color: colors.onAccent,
                  cursor: 'pointer',
                  boxShadow: `0 8px 24px ${colors.accent}40`,
                  transform: createHover ? 'scale(1.03)' : 'scale(1)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px', fill: 'white' }}>add</span>
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
