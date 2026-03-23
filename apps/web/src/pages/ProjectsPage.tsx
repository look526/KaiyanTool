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
    bgPage: '#050505',
    bgHeader: 'rgba(5, 5, 10, 0.95)',
    bgGlass: 'rgba(5, 5, 10, 0.6)',
    bgGlassHover: 'rgba(255, 255, 255, 0.06)',
    bgSecondary: 'rgba(255, 255, 255, 0.03)',
    bgInput: 'rgba(255, 255, 255, 0.04)',
    textPrimary: '#dfe4fe',
    textSecondary: '#a5aac2',
    textMuted: 'rgba(165, 170, 194, 0.8)',
    border: 'rgba(65, 71, 91, 0.15)',
    borderLight: 'rgba(255, 255, 255, 0.05)',
    borderHover: 'rgba(139, 92, 246, 0.25)',
    accent: '#ba9eff',
    accentLight: '#ae8dff',
    accentDim: '#8455ef',
    onAccent: '#39008c',
    shadowAccent: 'rgba(186, 158, 255, 0.3)',
    surfaceContainerLow: '#0c1326',
    surfaceContainerHigh: '#1c253e',
    hoverBg: 'rgba(255, 255, 255, 0.05)',
    glassBg: 'rgba(28, 37, 62, 0.4)',
  } : {
    bgBase: '#f5f5f5',
    bgSurface: '#ffffff',
    bgElevated: '#ffffff',
    bgPage: '#f5f5f5',
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
    switch (type) {
      case 'SCRIPT':
        return { icon: 'description' as any, gradient: 'linear-gradient(135deg, #ba9eff 0%, #ae8dff 100%)', label: '剧本', color: '#ba9eff' };
      case 'NOVEL':
        return { icon: 'menu_book' as any, gradient: 'linear-gradient(135deg, #ec63ff 0%, #f487ff 100%)', label: '小说', color: '#ec63ff' };
      case 'MIXED':
        return { icon: 'auto_awesome' as any, gradient: 'linear-gradient(135deg, #34b5fa 0%, #81ccff 100%)', label: '混合', color: '#34b5fa' };
      default:
        return { icon: 'folder_open' as any, gradient: 'linear-gradient(135deg, #ba9eff 0%, #ae8dff 100%)', label: '项目', color: '#ba9eff' };
    }
  }, []);

  const getStatusConfig = useCallback((status: string) => {
    switch (status) {
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
    }}>
      <main style={{
        marginLeft: '256px',
        flex: 1,
        position: 'relative',
      }}>
        {/* Header */}
        <header style={{
          position: 'fixed',
          top: 0,
          right: 0,
          left: '256px',
          height: '80px',
          background: colors.bgHeader,
          backdropFilter: 'blur(24px)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 32px',
          zIndex: 40,
          borderBottom: `1px solid ${colors.borderLight}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 700,
              color: colors.textPrimary,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              margin: 0,
            }}>项目列表</h2>
            <div style={{ width: '1px', height: '24px', background: colors.border }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: colors.textSecondary, fontSize: '14px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>trending_up</span>
              <span>状态统计</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: colors.surfaceContainerLow,
              padding: '8px 16px',
              borderRadius: '16px',
              border: `1px solid ${colors.border}`,
              gap: '8px',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: colors.textSecondary }}>search</span>
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
                  width: '256px',
                  color: colors.textPrimary,
                }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>grid_view</span>
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
          </div>
        </header>

        {/* Content */}
        <div style={{ padding: '120px 48px 48px' }}>
          {/* Page Header */}
          <section style={{ marginBottom: '40px' }}>
            <h1 style={{
              fontSize: '36px',
              fontWeight: 800,
              color: colors.textPrimary,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              letterSpacing: '-0.02em',
              margin: '0 0 8px 0',
            }}>我的项目</h1>
            <p style={{ fontSize: '14px', fontWeight: 500, color: colors.textSecondary, margin: 0 }}>管理您的创作项目</p>
          </section>

          {/* Statistics */}
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

          {/* Filters & Actions */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px',
            flexWrap: 'wrap',
            gap: '16px',
          }}>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
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
                background: colors.surfaceContainerLow,
                padding: '4px',
                borderRadius: '16px',
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
                    borderRadius: '12px',
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
                    borderRadius: '12px',
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
                  padding: '10px 24px',
                  borderRadius: '16px',
                  fontSize: '14px',
                  fontWeight: 700,
                  border: 'none',
                  background: newProjectHover
                    ? `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentDim} 100%)`
                    : `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentLight} 100%)`,
                  color: colors.onAccent,
                  cursor: 'pointer',
                  boxShadow: `0 4px 15px ${colors.shadowAccent}`,
                  transform: newProjectHover ? 'scale(1.05)' : 'scale(1)',
                  transition: 'all 0.3s ease',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px', fill: 'white' }}>add</span>
                <span>新建项目</span>
              </button>
            </div>
          </div>

          {/* Project Grid */}
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
                width: '80px',
                height: '80px',
                borderRadius: '24px',
                background: colors.glassBg,
                backdropFilter: 'blur(30px)',
                border: `1px solid ${colors.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px',
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '40px', color: colors.textSecondary }}>folder_open</span>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: colors.textPrimary, marginBottom: '8px', margin: '0 0 8px 0' }}>暂无项目</h3>
              <p style={{ fontSize: '14px', color: colors.textSecondary, marginBottom: '24px', maxWidth: '300px', margin: '0 0 24px 0' }}>创建您的第一个项目，开始精彩的创作之旅</p>
              <button
                onClick={() => navigate('/projects/new')}
                onMouseEnter={() => setCreateHover(true)}
                onMouseLeave={() => setCreateHover(false)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  borderRadius: '16px',
                  fontSize: '14px',
                  fontWeight: 700,
                  border: 'none',
                  background: createHover
                    ? `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentDim} 100%)`
                    : `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentLight} 100%)`,
                  color: colors.onAccent,
                  cursor: 'pointer',
                  boxShadow: `0 4px 15px ${colors.shadowAccent}`,
                  transform: createHover ? 'scale(1.05)' : 'scale(1)',
                  transition: 'all 0.3s ease',
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
                ? 'repeat(auto-fill, minmax(320px, 1fr))'
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
