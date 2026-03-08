import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, MoreVertical, FolderKanban, FileText, BookOpen, Layers, Calendar, LayoutGrid, LayoutList, Sparkles } from 'lucide-react';
import { apiClient, Project } from '../lib/api';
import { useTheme } from '../contexts/ThemeContext';

export default function ProjectsPage() {
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
  const navigate = useNavigate();

  useEffect(() => {
    setPage(1);
  }, [searchQuery, filterType, filterStatus, viewMode]);

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.getProjects({
        page,
        limit: viewMode === 'grid' ? 9 : 10,
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
        return {
          icon: FileText,
          gradient: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)',
          label: '剧本',
          color: '#0ea5e9',
        };
      case 'NOVEL':
        return {
          icon: BookOpen,
          gradient: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
          label: '小说',
          color: '#8b5cf6',
        };
      case 'MIXED':
        return {
          icon: Layers,
          gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
          label: '混合',
          color: '#f59e0b',
        };
      default:
        return {
          icon: FolderKanban,
          gradient: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 100%)',
          label: '项目',
          color: 'var(--accent)',
        };
    }
  }, []);

  const getStatusConfig = useCallback((status: string) => {
    switch (status) {
      case 'ACTIVE':
        return {
          label: '进行中',
          color: '#10b981',
          bg: 'rgba(16, 185, 129, 0.1)',
        };
      case 'COMPLETED':
        return {
          label: '已完成',
          color: 'var(--accent)',
          bg: 'var(--accent-bg)',
        };
      case 'PAUSED':
        return {
          label: '已暂停',
          color: '#f59e0b',
          bg: 'rgba(245, 158, 11, 0.1)',
        };
      case 'ARCHIVED':
        return {
          label: '已归档',
          color: '#6b7280',
          bg: 'rgba(107, 114, 128, 0.1)',
        };
      default:
        return {
          label: '草稿',
          color: '#6b7280',
          bg: 'rgba(107, 114, 128, 0.1)',
        };
    }
  }, []);

  const formatDate = useCallback((date: Date | string | undefined | null) => {
    if (!date) return '未知';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return '未知';
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return '今天';
    if (diffDays === 1) return '昨天';
    if (diffDays < 7) return `${diffDays}天前`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`;
    return `${Math.floor(diffDays / 30)}月前`;
  }, []);

  const stats = useMemo(() => ({
    total: projects.length,
    active: projects.filter(p => p.status === 'ACTIVE').length,
    completed: projects.filter(p => p.status === 'COMPLETED').length,
  }), [projects]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-base)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <header style={{
        height: '80px',
        background: 'var(--bg-elevated)',
        borderBottom: '1px solid var(--border-primary)',
        padding: '0 48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}>
        <div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: 'var(--text-primary)',
            margin: 0,
            letterSpacing: '-0.01em',
          }}>
            我的项目
          </h1>
          <p style={{
            fontSize: '13px',
            color: 'var(--text-muted)',
            margin: '4px 0 0 0',
          }}>
            管理您的创作项目
          </p>
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button
            onClick={() => setViewMode('grid')}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              border: viewMode === 'grid' ? '2px solid var(--accent)' : '1px solid var(--border-primary)',
              background: viewMode === 'grid' ? 'var(--accent-bg)' : 'transparent',
              color: viewMode === 'grid' ? 'var(--accent)' : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
          >
            <LayoutGrid style={{ width: '18px', height: '18px' }} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              border: viewMode === 'list' ? '2px solid var(--accent)' : '1px solid var(--border-primary)',
              background: viewMode === 'list' ? 'var(--accent-bg)' : 'transparent',
              color: viewMode === 'list' ? 'var(--accent)' : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
          >
            <LayoutList style={{ width: '18px', height: '18px' }} />
          </button>

          <button
            onClick={() => navigate('/projects/new')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              border: 'none',
              background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 100%)',
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(139, 92, 246, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(139, 92, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(139, 92, 246, 0.3)';
            }}
          >
            <Plus style={{ width: '16px', height: '16px' }} />
            <span>新建项目</span>
          </button>
        </div>
      </header>

      <div style={{
        padding: '32px 48px',
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '20px',
          marginBottom: '32px',
        }}>
          <div style={{
            padding: '20px',
            borderRadius: '16px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <FolderKanban style={{ width: '24px', height: '24px', color: 'white' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '28px',
                fontWeight: '700',
                color: 'var(--text-primary)',
                lineHeight: 1,
              }}>
                {stats.total}
              </div>
              <div style={{
                fontSize: '13px',
                color: 'var(--text-muted)',
                marginTop: '4px',
              }}>
                全部项目
              </div>
            </div>
          </div>

          <div style={{
            padding: '20px',
            borderRadius: '16px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Sparkles style={{ width: '24px', height: '24px', color: 'white' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '28px',
                fontWeight: '700',
                color: 'var(--text-primary)',
                lineHeight: 1,
              }}>
                {stats.active}
              </div>
              <div style={{
                fontSize: '13px',
                color: 'var(--text-muted)',
                marginTop: '4px',
              }}>
                进行中
              </div>
            </div>
          </div>

          <div style={{
            padding: '20px',
            borderRadius: '16px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Layers style={{ width: '24px', height: '24px', color: 'white' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '28px',
                fontWeight: '700',
                color: 'var(--text-primary)',
                lineHeight: 1,
              }}>
                {stats.completed}
              </div>
              <div style={{
                fontSize: '13px',
                color: 'var(--text-muted)',
                marginTop: '4px',
              }}>
                已完成
              </div>
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '32px',
          flexWrap: 'wrap',
        }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px', maxWidth: '400px' }}>
            <Search style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '16px',
              height: '16px',
              color: 'var(--text-muted)',
            }} />
            <input
              type="text"
              placeholder="搜索项目..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                height: '40px',
                padding: '0 14px 0 42px',
                border: '1px solid var(--border-primary)',
                borderRadius: '10px',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s ease',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-primary)';
              }}
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{
              height: '40px',
              padding: '0 36px 0 14px',
              fontSize: '14px',
              fontWeight: '500',
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border-primary)',
              borderRadius: '10px',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              outline: 'none',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 12px center',
              transition: 'border-color 0.2s ease',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-primary)';
            }}
          >
            <option value="all">全部类型</option>
            <option value="SCRIPT">剧本</option>
            <option value="NOVEL">小说</option>
            <option value="MIXED">混合</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              height: '40px',
              padding: '0 36px 0 14px',
              fontSize: '14px',
              fontWeight: '500',
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border-primary)',
              borderRadius: '10px',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              outline: 'none',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 12px center',
              transition: 'border-color 0.2s ease',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-primary)';
            }}
          >
            <option value="all">全部状态</option>
            <option value="ACTIVE">进行中</option>
            <option value="COMPLETED">已完成</option>
            <option value="PAUSED">已暂停</option>
          </select>
        </div>

        {loading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '120px 0',
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              border: '3px solid var(--border-primary)',
              borderTopColor: 'var(--accent)',
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
              borderRadius: '20px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px',
            }}>
              <FolderKanban style={{ width: '40px', height: '40px', color: 'var(--text-muted)' }} />
            </div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: 'var(--text-primary)',
              margin: '0 0 8px 0',
            }}>
              暂无项目
            </h3>
            <p style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              margin: '0 0 24px 0',
              maxWidth: '300px',
            }}>
              创建您的第一个项目，开始精彩的创作之旅
            </p>
            <button
              onClick={() => navigate('/projects/new')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                border: 'none',
                background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 100%)',
                color: '#ffffff',
                boxShadow: '0 4px 14px rgba(139, 92, 246, 0.3)',
              }}
            >
              <Plus style={{ width: '16px', height: '16px' }} />
              <span>创建项目</span>
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px',
            paddingBottom: '40px',
          }}>
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                getProjectTypeConfig={getProjectTypeConfig}
                getStatusConfig={getStatusConfig}
                formatDate={formatDate}
              />
            ))}
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            paddingBottom: '40px',
          }}>
            {projects.map((project) => (
              <ProjectListItem
                key={project.id}
                project={project}
                getProjectTypeConfig={getProjectTypeConfig}
                getStatusConfig={getStatusConfig}
                formatDate={formatDate}
              />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '12px',
            marginTop: '24px',
            paddingBottom: '24px',
          }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid var(--border-primary)',
                background: page === 1 ? 'var(--bg-surface)' : 'var(--bg-elevated)',
                color: page === 1 ? 'var(--text-muted)' : 'var(--text-primary)',
                fontSize: '14px',
                fontWeight: '500',
                cursor: page === 1 ? 'not-allowed' : 'pointer',
                opacity: page === 1 ? 0.5 : 1,
                transition: 'all 0.2s ease',
              }}
            >
              上一页
            </button>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '8px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-primary)',
            }}>
              <span style={{
                color: 'var(--text-primary)',
                fontSize: '15px',
                fontWeight: '600',
              }}>
                {page}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>/</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                {totalPages}
              </span>
            </div>

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid var(--border-primary)',
                background: page === totalPages ? 'var(--bg-surface)' : 'var(--bg-elevated)',
                color: page === totalPages ? 'var(--text-muted)' : 'var(--text-primary)',
                fontSize: '14px',
                fontWeight: '500',
                cursor: page === totalPages ? 'not-allowed' : 'pointer',
                opacity: page === totalPages ? 0.5 : 1,
                transition: 'all 0.2s ease',
              }}
            >
              下一页
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

interface ProjectCardProps {
  project: Project;
  getProjectTypeConfig: (type: string) => { icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; gradient: string; label: string; color: string; shadow?: string };
  getStatusConfig: (status: string) => { label: string; color: string; bg: string; border?: string };
  formatDate: (date: Date | string | undefined | null) => string;
}

const ProjectCard = ({ project, getProjectTypeConfig, getStatusConfig, formatDate }: ProjectCardProps) => {
  const typeConfig = getProjectTypeConfig(project.type);
  const statusConfig = getStatusConfig(project.status);
  const TypeIcon = typeConfig.icon;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link to={`/projects/${project.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        style={{
          background: 'var(--bg-surface)',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid var(--border-primary)',
          transition: 'all 0.2s ease',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => {
          setIsHovered(true);
          e.currentTarget.style.borderColor = 'var(--accent)';
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.08)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          setIsHovered(false);
          e.currentTarget.style.borderColor = 'var(--border-primary)';
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '16px' }}>
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
            <TypeIcon style={{ width: '24px', height: '24px', color: 'white' }} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: 'var(--text-primary)',
              margin: '0 0 6px 0',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {project.name}
            </h3>
            <p style={{
              fontSize: '13px',
              color: 'var(--text-secondary)',
              margin: 0,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: '1.5',
            }}>
              {project.description || '暂无描述'}
            </p>
          </div>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '16px',
          borderTop: '1px solid var(--border-primary)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '6px',
            background: statusConfig.bg,
            fontSize: '12px',
            fontWeight: '600',
            color: statusConfig.color,
          }}>
            {statusConfig.label}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar style={{ width: '14px', height: '14px', color: 'var(--text-muted)' }} />
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {formatDate(project.updated_at)}
              </span>
            </div>

            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                border: 'none',
                background: 'transparent',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg-hover)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-muted)';
              }}
            >
              <MoreVertical size={16} />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

interface ProjectListItemProps {
  project: Project;
  getProjectTypeConfig: (type: string) => { icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; gradient: string; label: string; color: string; shadow?: string };
  getStatusConfig: (status: string) => { label: string; color: string; bg: string; border?: string };
  formatDate: (date: Date | string | undefined | null) => string;
}

const ProjectListItem = ({ project, getProjectTypeConfig, getStatusConfig, formatDate }: ProjectListItemProps) => {
  const typeConfig = getProjectTypeConfig(project.type);
  const statusConfig = getStatusConfig(project.status);
  const TypeIcon = typeConfig.icon;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      to={`/projects/${project.id}`}
      style={{ textDecoration: 'none', display: 'block' }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '16px 20px',
          borderRadius: '12px',
          border: '1px solid var(--border-primary)',
          background: 'var(--bg-surface)',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          setIsHovered(true);
          e.currentTarget.style.borderColor = 'var(--accent)';
          e.currentTarget.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.06)';
          e.currentTarget.style.transform = 'translateX(2px)';
        }}
        onMouseLeave={(e) => {
          setIsHovered(false);
          e.currentTarget.style.borderColor = 'var(--border-primary)';
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.transform = 'translateX(0)';
        }}
      >
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '10px',
          background: typeConfig.gradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <TypeIcon style={{ width: '22px', height: '22px', color: 'white' }} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{
            fontSize: '15px',
            fontWeight: '600',
            color: 'var(--text-primary)',
            margin: '0 0 4px 0',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {project.name}
          </h3>
          <p style={{
            fontSize: '13px',
            color: 'var(--text-secondary)',
            margin: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {project.description || '暂无描述'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexShrink: 0 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '6px',
            background: statusConfig.bg,
            fontSize: '12px',
            fontWeight: '600',
            color: statusConfig.color,
          }}>
            {statusConfig.label}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar style={{ width: '14px', height: '14px', color: 'var(--text-muted)' }} />
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {formatDate(project.updated_at)}
            </span>
          </div>

          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: 'none',
              background: 'transparent',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-hover)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
          >
            <MoreVertical size={16} />
          </button>
        </div>
      </div>
    </Link>
  );
};
