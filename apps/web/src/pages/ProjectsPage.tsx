import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, MoreVertical, FolderKanban, FileText, BookOpen, Layers, Users, Calendar, TrendingUp, CheckCircle2, Pause, FileJson, FileVideo, FileArchive, Filter, X, LayoutGrid, LayoutList, ChevronRight, Sparkles } from 'lucide-react';
import { apiClient, Project } from '../lib/api';
import { useToast } from '../components/ui/Toast';
import { Button } from '../components/ui/button-new';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [exportMenu, setExportMenu] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = screenWidth < 768;

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

  const getProjectTypeLabel = useCallback((type: string) => {
    switch (type) {
      case 'SCRIPT': return '剧本';
      case 'NOVEL': return '小说';
      case 'MIXED': return '混合';
      default: return type;
    }
  }, []);

  const getProjectTypeIcon = useCallback((type: string) => {
    switch (type) {
      case 'SCRIPT': return FileText;
      case 'NOVEL': return BookOpen;
      case 'MIXED': return Layers;
      default: return FolderKanban;
    }
  }, []);

  const getProjectTypeGradient = useCallback((type: string) => {
    switch (type) {
      case 'SCRIPT': return 'var(--gradient-primary)';
      case 'NOVEL': return 'var(--gradient-secondary)';
      case 'MIXED': return 'var(--gradient-purple)';
      default: return 'var(--gradient-gray)';
    }
  }, []);

  const getStatusInfo = useCallback((status: string) => {
    switch (status) {
      case 'ACTIVE':
        return { label: '进行中', color: 'var(--success)', bgColor: 'var(--success-bg)', borderColor: 'var(--success-border)', icon: TrendingUp };
      case 'COMPLETED':
        return { label: '已完成', color: 'var(--accent)', bgColor: 'var(--accent-bg)', borderColor: 'var(--accent-border)', icon: CheckCircle2 };
      case 'PAUSED':
        return { label: '已暂停', color: 'var(--warning)', bgColor: 'var(--warning-bg)', borderColor: 'var(--warning-border)', icon: Pause };
      default:
        return { label: '草稿', color: 'var(--text-muted)', bgColor: 'var(--bg-hover)', borderColor: 'var(--border-primary)', icon: FileText };
    }
  }, []);

  const formatDate = useCallback((date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return '今天';
    if (diffDays === 1) return '昨天';
    if (diffDays < 7) return `${diffDays}天前`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`;
    return `${Math.floor(diffDays / 30)}月前`;
  }, []);

  const handleExport = async (type: string, projectId: string, projectName: string) => {
    try {
      switch (type) {
        case 'json':
          const data = await apiClient.exportProject(projectId);
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${projectName}-${Date.now()}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          break;
        case 'videos':
          const videosBlob = await apiClient.exportProjectVideos(projectId);
          const videosUrl = URL.createObjectURL(videosBlob);
          const videosA = document.createElement('a');
          videosA.href = videosUrl;
          videosA.download = `${projectName}-videos.zip`;
          document.body.appendChild(videosA);
          videosA.click();
          document.body.removeChild(videosA);
          URL.revokeObjectURL(videosUrl);
          break;
        case 'bundle':
          const bundleBlob = await apiClient.exportProjectBundle(projectId);
          const bundleUrl = URL.createObjectURL(bundleBlob);
          const bundleA = document.createElement('a');
          bundleA.href = bundleUrl;
          bundleA.download = `${projectName}-bundle.zip`;
          document.body.appendChild(bundleA);
          bundleA.click();
          document.body.removeChild(bundleA);
          URL.revokeObjectURL(bundleUrl);
          break;
      }
      setExportMenu(null);
    } catch (error) {
      console.error('Export failed:', error);
      addToast({
        type: 'error',
        title: '导出失败',
        message: '请稍后重试。',
      });
    }
  };

  const toggleExportMenu = (e: React.MouseEvent, projectId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setExportMenu(exportMenu === projectId ? null : projectId);
  };

  useEffect(() => {
    const handleClickOutside = () => setExportMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [exportMenu]);

  const ProjectCard = React.memo(({ project }: { project: Project }) => {
    const status = getStatusInfo(project.status);
    const StatusIcon = status.icon;
    const TypeIcon = getProjectTypeIcon(project.type);
    const typeGradient = getProjectTypeGradient(project.type);

    return (
      <Link to={`/projects/${project.id}`} style={{ textDecoration: 'none', display: 'block' }}>
        <div style={{
          background: 'var(--bg-card)',
          backdropFilter: 'var(--glass-blur)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-primary)',
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          padding: '24px',
          position: 'relative',
        }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
            e.currentTarget.style.borderColor = 'var(--accent-border)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.borderColor = 'var(--border-primary)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ position: 'relative' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: typeGradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px var(--accent-shadow)',
              }}>
                <TypeIcon style={{ width: '28px', height: '28px', color: 'white' }} />
              </div>
              <div style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: status.color,
                border: '2px solid var(--bg-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <StatusIcon style={{ width: '10px', height: '10px', color: 'white' }} />
              </div>
            </div>

            <button
              onClick={(e) => toggleExportMenu(e, project.id)}
              aria-label="导出菜单"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                border: '1px solid var(--border-primary)',
                backgroundColor: 'var(--bg-hover)',
                color: 'var(--text-tertiary)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--nav-hover-bg)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                e.currentTarget.style.color = 'var(--text-tertiary)';
              }}
            >
              <MoreVertical size={18} />
            </button>
          </div>

          <h3 style={{
            fontSize: '17px',
            fontWeight: '600',
            color: 'var(--text-primary)',
            marginBottom: '8px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {project.name}
          </h3>

          <p style={{
            fontSize: '13px',
            color: 'var(--text-muted)',
            marginBottom: '16px',
            lineHeight: '1.6',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '42px',
          }}>
            {project.description || '暂无描述'}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <span style={{
              padding: '6px 12px',
              borderRadius: '8px',
              backgroundColor: status.bgColor,
              color: status.color,
              fontSize: '12px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              border: `1px solid ${status.borderColor}`,
            }}>
              <StatusIcon style={{ width: '12px', height: '12px' }} />
              {status.label}
            </span>
            <span style={{
              padding: '6px 12px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-hover)',
              color: 'var(--text-secondary)',
              fontSize: '12px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              border: '1px solid var(--border-primary)',
            }}>
              <TypeIcon style={{ width: '12px', height: '12px' }} />
              {getProjectTypeLabel(project.type)}
            </span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-secondary)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '12px' }}>
                <Calendar style={{ width: '14px', height: '14px' }} />
                <span>{formatDate(project.updatedAt)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '12px' }}>
                <Users style={{ width: '14px', height: '14px' }} />
                <span>{project._count?.members || 1}</span>
              </div>
            </div>
            <ChevronRight style={{ width: '16px', height: '16px', color: 'var(--text-muted)' }} />
          </div>

          {exportMenu === project.id && (
            <div style={{
              position: 'absolute',
              top: '80px',
              right: '16px',
              borderRadius: '14px',
              boxShadow: 'var(--shadow-lg)',
              minWidth: '180px',
              zIndex: 50,
              padding: '8px',
              background: 'var(--bg-elevated)',
              backdropFilter: 'var(--glass-blur)',
              border: '1px solid var(--border-primary)',
            }}>
              <button
                onClick={() => handleExport('json', project.id, project.name)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  gap: '12px',
                  padding: '12px 14px',
                  border: 'none',
                  borderRadius: '10px',
                  backgroundColor: 'transparent',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'all 0.2s ease',
                  fontSize: '13px',
                  fontWeight: '500',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--accent-bg)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                <FileJson size={16} />
                <span>导出 JSON</span>
              </button>
              <button
                onClick={() => handleExport('videos', project.id, project.name)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  gap: '12px',
                  padding: '12px 14px',
                  border: 'none',
                  borderRadius: '10px',
                  backgroundColor: 'transparent',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'all 0.2s ease',
                  fontSize: '13px',
                  fontWeight: '500',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--success-bg)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                <FileVideo size={16} />
                <span>导出视频</span>
              </button>
              <button
                onClick={() => handleExport('bundle', project.id, project.name)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  gap: '12px',
                  padding: '12px 14px',
                  border: 'none',
                  borderRadius: '10px',
                  backgroundColor: 'transparent',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'all 0.2s ease',
                  fontSize: '13px',
                  fontWeight: '500',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--accent-bg)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                <FileArchive size={16} />
                <span>导出完整包</span>
              </button>
            </div>
          )}
        </div>
      </Link>
    );
  });

  return (
    <div ref={containerRef} style={{ 
      flex: 1, 
      display: 'flex', 
      flexDirection: 'column', 
      overflow: 'hidden', 
      background: 'var(--bg-page)',
      minHeight: '100vh',
    }}>
      <header style={{
        height: isMobile ? '64px' : '80px',
        backgroundColor: 'var(--bg-header)',
        backdropFilter: 'var(--glass-blur)',
        borderBottom: '1px solid var(--border-primary)',
        padding: isMobile ? '0 16px' : '0 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{
              fontSize: isMobile ? '20px' : '26px',
              fontWeight: '600',
              color: 'var(--text-primary)',
              margin: 0,
              letterSpacing: '-0.02em',
            }}>
              我的项目
            </h1>
            <span style={{
              padding: '4px 12px',
              borderRadius: '20px',
              background: 'var(--gradient-primary)',
              color: 'white',
              fontSize: '12px',
              fontWeight: '600',
              boxShadow: '0 2px 8px var(--accent-shadow)',
            }}>
              {projects.length}
            </span>
          </div>
          {!isMobile && (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
              管理和追踪所有你的创作项目
            </p>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '16px' }}>
          {!isMobile && (
            <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: 'var(--text-muted)' }} />
              <input
                placeholder="搜索项目..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '280px',
                  paddingLeft: '44px',
                  height: '42px',
                  fontSize: '14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--input-border)',
                  background: 'var(--input-bg)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--input-focus-border)';
                  e.currentTarget.style.boxShadow = 'var(--input-focus-shadow)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--input-border)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>
          )}

          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              aria-label="筛选"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: isMobile ? '10px' : '10px 16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-primary)',
                backgroundColor: (filterType !== 'all' || filterStatus !== 'all') ? 'var(--accent-bg)' : 'var(--bg-hover)',
                color: (filterType !== 'all' || filterStatus !== 'all') ? 'var(--accent-text)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--nav-hover-bg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = (filterType !== 'all' || filterStatus !== 'all') ? 'var(--accent-bg)' : 'var(--bg-hover)';
              }}
            >
              <Filter size={16} />
              {!isMobile && <span style={{ fontSize: '13px', fontWeight: '500' }}>筛选</span>}
            </button>

            {showFilters && (
              <div style={{
                position: 'absolute',
                top: '52px',
                right: 0,
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)',
                padding: '16px',
                zIndex: 50,
                minWidth: '220px',
                background: 'var(--bg-elevated)',
                backdropFilter: 'var(--glass-blur)',
                border: '1px solid var(--border-primary)',
              }}>
                <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                  项目类型
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '16px' }}>
                  {['all', 'SCRIPT', 'NOVEL', 'MIXED'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        border: 'none',
                        cursor: 'pointer',
                        width: '100%',
                        borderRadius: '10px',
                        transition: 'all 0.2s ease',
                        fontSize: '13px',
                        fontWeight: '500',
                        color: filterType === type ? 'var(--text-primary)' : 'var(--text-tertiary)',
                        backgroundColor: filterType === type ? 'var(--accent-bg)' : 'transparent',
                      }}
                      onMouseEnter={(e) => {
                        if (filterType !== type) {
                          e.currentTarget.style.backgroundColor = 'var(--nav-hover-bg)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (filterType !== type) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      <span>{type === 'all' ? '全部类型' : getProjectTypeLabel(type)}</span>
                      {filterType === type && <X style={{ width: '14px', height: '14px' }} />}
                    </button>
                  ))}
                </div>

                <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                  项目状态
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {['all', 'ACTIVE', 'COMPLETED', 'PAUSED'].map((status) => {
                    const statusInfo = getStatusInfo(status);
                    const StatusIcon = statusInfo.icon;
                    return (
                      <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          border: 'none',
                          cursor: 'pointer',
                          width: '100%',
                          borderRadius: '10px',
                          transition: 'all 0.2s ease',
                          fontSize: '13px',
                          fontWeight: '500',
                          color: filterStatus === status ? 'var(--text-primary)' : 'var(--text-tertiary)',
                          backgroundColor: filterStatus === status ? 'var(--accent-bg)' : 'transparent',
                        }}
                        onMouseEnter={(e) => {
                          if (filterStatus !== status) {
                            e.currentTarget.style.backgroundColor = 'var(--nav-hover-bg)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (filterStatus !== status) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <StatusIcon style={{ width: '14px', height: '14px' }} />
                          <span>{status === 'all' ? '全部状态' : statusInfo.label}</span>
                        </div>
                        {filterStatus === status && <X style={{ width: '14px', height: '14px' }} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '4px', padding: '4px', backgroundColor: 'var(--bg-hover)', borderRadius: '10px', border: '1px solid var(--border-primary)' }}>
            <button
              onClick={() => setViewMode('grid')}
              aria-label="网格视图"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: viewMode === 'grid' ? 'var(--accent-bg)' : 'transparent',
                color: viewMode === 'grid' ? 'var(--text-primary)' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              aria-label="列表视图"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: viewMode === 'list' ? 'var(--accent-bg)' : 'transparent',
                color: viewMode === 'list' ? 'var(--text-primary)' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <LayoutList size={18} />
            </button>
          </div>

          <Button
            onClick={() => navigate('/projects/new')}
            variant="primary"
            size={isMobile ? 'sm' : 'md'}
            icon={<Plus size={16} />}
            iconPosition="left"
          >
            {isMobile ? '创建' : '创建项目'}
          </Button>
        </div>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '16px' : '32px' }}>
        {loading ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '20px',
          }}>
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} style={{ 
                padding: '24px', 
                borderRadius: 'var(--radius-xl)', 
                height: '280px', 
                background: 'var(--bg-card)', 
                border: '1px solid var(--border-primary)',
                animation: 'pulse 2s infinite',
              }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--bg-hover)', marginBottom: '20px' }}></div>
                <div style={{ width: '80%', height: '18px', borderRadius: '8px', background: 'var(--bg-hover)', marginBottom: '12px' }}></div>
                <div style={{ width: '60%', height: '14px', borderRadius: '8px', background: 'var(--bg-hover)', marginBottom: '20px' }}></div>
                <div style={{ width: '40%', height: '12px', borderRadius: '8px', background: 'var(--bg-hover)' }}></div>
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '24px',
              background: 'var(--gradient-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px',
              boxShadow: '0 8px 24px var(--accent-shadow)',
            }}>
              <Sparkles style={{ width: '36px', height: '36px', color: 'white' }} />
            </div>

            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: 'var(--text-primary)',
              marginBottom: '12px',
            }}>
              创建第一个项目
            </h2>

            <p style={{
              fontSize: '15px',
              color: 'var(--text-muted)',
              marginBottom: '32px',
            }}>
              开始你的AI内容创作之旅
            </p>

            <Button
              onClick={() => navigate('/projects/new')}
              variant="primary"
              size="lg"
              icon={<Plus size={18} />}
              iconPosition="left"
            >
              创建项目
            </Button>
          </div>
        ) : (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '20px',
            }}>
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>

            {!loading && totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '40px', padding: '24px' }}>
                <Button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  variant="outline"
                  size="md"
                >
                  上一页
                </Button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 20px', fontSize: '14px', color: 'var(--text-muted)', fontWeight: '500' }}>
                  <span>第</span>
                  <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{page}</span>
                </div>
                <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>/</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 20px', fontSize: '14px', color: 'var(--text-muted)', fontWeight: '500' }}>
                  <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{totalPages}</span>
                </div>
                <span style={{ fontSize: '14px', color: 'var(--text-muted)', marginRight: '8px' }}>页</span>
                <Button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  variant="outline"
                  size="md"
                >
                  下一页
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }
        `}
      </style>
    </div>
  );
}
