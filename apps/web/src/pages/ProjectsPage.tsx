import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, MoreVertical, Sparkles, Users, FolderKanban, FileJson, FileVideo, FileArchive, Filter, X, LayoutGrid, LayoutList, TrendingUp, Calendar, CheckCircle2, Pause, FileText, BookOpen, Layers, Menu } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { SkeletonCard, SkeletonList } from '../components/ui/Skeleton';
import { apiClient, Project } from '../lib/api';
import { useToast } from '../components/ui/Toast';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = screenWidth < 768;
  const isTablet = screenWidth >= 768 && screenWidth < 1024;

  useEffect(() => {
    setPage(1);
  }, [searchQuery, filterType, filterStatus, viewMode]);

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      const limit = isMobile ? 6 : isTablet ? 9 : 12;
      const response = await apiClient.getProjects({
        page,
        limit: viewMode === 'grid' ? limit : 10,
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
  }, [page, filterType, filterStatus, searchQuery, viewMode, isMobile, isTablet]);

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
      default: return Sparkles;
    }
  }, []);

  const getStatusInfo = useCallback((status: string) => {
    switch (status) {
      case 'ACTIVE':
        return { label: '进行中', color: 'var(--success)', bg: 'var(--success-bg)', textColor: 'var(--success-text)', icon: TrendingUp };
      case 'COMPLETED':
        return { label: '已完成', color: 'var(--info)', bg: 'var(--info-bg)', textColor: 'var(--info-text)', icon: CheckCircle2 };
      case 'PAUSED':
        return { label: '已暂停', color: 'var(--warning)', bg: 'var(--warning-bg)', textColor: 'var(--warning-text)', icon: Pause };
      default:
        return { label: '草稿', color: 'var(--text-muted)', bg: 'var(--bg-hover)', textColor: 'var(--text-tertiary)', icon: FileText };
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

  const EmptyState = () => (
    <div style={{
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '400px',
      padding: isMobile ? '40px 20px' : '60px 20px',
    }}>
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '16px',
        backgroundColor: 'var(--accent-bg)',
        display: 'flex',
        alignItems: 'center' as const,
        justifyContent: 'center',
        marginBottom: '20px',
      }}>
        <Plus style={{ width: '32px', height: '32px', color: 'var(--accent)' }} />
      </div>

      <h2 style={{
        fontSize: '20px',
        fontWeight: '600',
        color: 'var(--text-primary)',
        marginBottom: '8px',
        letterSpacing: '-0.01em',
        textAlign: 'center' as const,
      }}>
        创建第一个项目
      </h2>

      <p style={{
        fontSize: '14px',
        color: 'var(--text-tertiary)',
        marginBottom: '24px',
        textAlign: 'center' as const,
        maxWidth: '320px',
        lineHeight: '1.5',
      }}>
        开始你的AI内容创作之旅
      </p>

      <button
        onClick={() => navigate('/projects/new')}
        style={{
          height: '38px',
          padding: '0 20px',
          fontSize: '14px',
          fontWeight: '500',
          background: 'var(--accent)',
          color: 'var(--accent-on)',
          border: 'none',
          borderRadius: '9px',
          cursor: 'pointer',
          boxShadow: 'none',
          transition: 'all 0.15s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--accent-hover)';
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'var(--accent)';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        创建项目
      </button>
    </div>
  );

  const ProjectCard = React.memo(({ project }: { project: Project }) => {
    const status = getStatusInfo(project.status);
    const StatusIcon = status.icon;
    const TypeIcon = getProjectTypeIcon(project.type);

    return (
      <Link to={`/projects/${project.id}`} style={{ textDecoration: 'none' }}>
        <div style={{
          position: 'relative',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: isMobile ? '12px' : '20px',
          border: '2px solid var(--border-primary)',
          overflow: 'hidden',
          transition: 'all 0.3s ease-out',
          cursor: 'pointer',
        }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-6px)';
            e.currentTarget.style.borderColor = 'var(--accent)';
            e.currentTarget.style.boxShadow = '0 20px 60px rgba(99, 102, 241, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'var(--border-primary)';
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
          }}
        >
          <div style={{
            height: '5px',
            background: 'linear-gradient(90deg, var(--accent) 0%, var(--accent-hover) 50%, #a855f7 100%)',
          }} />

          <div style={{ padding: isMobile ? '16px' : '24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: isMobile ? '12px' : '20px' }}>
              <div style={{ position: 'relative', width: isMobile ? '48px' : '64px', height: isMobile ? '48px' : '64px' }}>
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: isMobile ? '10px' : '12px',
                  background: 'linear-gradient(135deg, #e0e7ff 0%, #ede9fe 100%)',
                  border: '2px solid #c7d2fe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <TypeIcon style={{ width: isMobile ? '24px' : '32px', height: isMobile ? '24px' : '32px', color: '#4f46e5' }} />
                </div>
                <div style={{
                  position: 'absolute',
                  top: isMobile ? '-4px' : '-6px',
                  right: isMobile ? '-4px' : '-6px',
                  width: isMobile ? '20px' : '24px',
                  height: isMobile ? '20px' : '24px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--success-bg)',
                  border: '3px solid var(--bg-surface)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                }}>
                  <StatusIcon style={{ width: isMobile ? '10px' : '12px', height: isMobile ? '10px' : '12px', color: 'var(--success-text)' }} />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={(e) => toggleExportMenu(e, project.id)}
                  aria-label="导出菜单"
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <MoreVertical style={{ width: '20px', height: '20px', color: 'var(--text-tertiary)' }} />
                </button>
              </div>
            </div>

            <h3 style={{
              fontSize: isMobile ? '16px' : '20px',
              fontWeight: '700',
              color: 'var(--text-primary)',
              marginBottom: isMobile ? '8px' : '10px',
              letterSpacing: '-0.5px',
              whiteSpace: 'nowrap' as const,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {project.name}
            </h3>

            <p style={{
              fontSize: '14px',
              color: 'var(--text-tertiary)',
              marginBottom: isMobile ? '16px' : '24px',
              lineHeight: '1.6',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical' as const,
              overflow: 'hidden',
              minHeight: '45px',
            }}>
              {project.description || '暂无描述'}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: isMobile ? '12px' : '20px', flexWrap: 'wrap' as const }}>
              <span style={{
                padding: isMobile ? '4px 10px' : '6px 14px',
                borderRadius: '8px',
                backgroundColor: 'var(--success-bg)',
                color: 'var(--success-text)',
                fontSize: isMobile ? '10px' : '12px',
                fontWeight: '700',
                textTransform: 'uppercase' as const,
                letterSpacing: '0.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                <StatusIcon style={{ width: isMobile ? '12px' : '14px', height: isMobile ? '12px' : '14px' }} />
                {status.label}
              </span>
              <span style={{
                padding: isMobile ? '4px 10px' : '6px 14px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-hover)',
                color: 'var(--text-tertiary)',
                fontSize: isMobile ? '10px' : '12px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                <TypeIcon style={{ width: isMobile ? '12px' : '14px', height: isMobile ? '12px' : '14px' }} />
                {getProjectTypeLabel(project.type)}
              </span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: isMobile ? '12px' : '20px',
              borderTop: '1px solid var(--border-primary)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '12px' : '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-tertiary)', fontSize: isMobile ? '11px' : '13px', fontWeight: '500' }}>
                  <Calendar style={{ width: '16px', height: '16px' }} />
                  <span>{formatDate(project.updatedAt)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-tertiary)', fontSize: isMobile ? '11px' : '13px', fontWeight: '500' }}>
                  <Users style={{ width: '16px', height: '16px' }} />
                  <span>{project._count?.members || 1}</span>
                </div>
              </div>
            </div>
          </div>

          {exportMenu === project.id && (
            <div style={{
              position: 'absolute',
              top: '80px',
              right: '16px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-primary)',
              borderRadius: '12px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
              minWidth: '200px',
              zIndex: 50,
              padding: '8px',
            }}>
              <button
                onClick={() => handleExport('json', project.id, project.name)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  color: 'var(--text-tertiary)',
                  width: '100%',
                  textAlign: 'left' as const,
                  borderRadius: '8px',
                  transition: 'background 0.2s ease',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <FileJson style={{ width: '18px', height: '18px', color: '#4f46e5' }} />
                <span>导出 JSON</span>
              </button>
              <button
                onClick={() => handleExport('videos', project.id, project.name)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  color: 'var(--text-tertiary)',
                  width: '100%',
                  textAlign: 'left' as const,
                  borderRadius: '8px',
                  transition: 'background 0.2s ease',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <FileVideo style={{ width: '18px', height: '18px', color: '#8b5cf6' }} />
                <span>导出视频</span>
              </button>
              <button
                onClick={() => handleExport('bundle', project.id, project.name)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  color: 'var(--text-tertiary)',
                  width: '100%',
                  textAlign: 'left' as const,
                  borderRadius: '8px',
                  transition: 'background 0.2s ease',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <FileArchive style={{ width: '18px', height: '18px', color: '#a855f7' }} />
                <span>导出完整包</span>
              </button>
            </div>
          )}
        </div>
      </Link>
    );
  });

  const ProjectListItem = React.memo(({ project }: { project: Project }) => {
    const status = getStatusInfo(project.status);
    const StatusIcon = status.icon;
    const TypeIcon = getProjectTypeIcon(project.type);

    return (
      <Link to={`/projects/${project.id}`} style={{ textDecoration: 'none' }}>
        <div style={{
          display: 'flex',
          alignItems: isMobile ? 'flex-start' : 'center',
          gap: isMobile ? '12px' : '24px',
          padding: isMobile ? '16px' : '24px',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: '16px',
          border: '2px solid var(--border-primary)',
          transition: 'all 0.3s ease-out',
          cursor: 'pointer',
        }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent)';
            e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
            if (!isMobile) {
              e.currentTarget.style.transform = 'translateX(4px)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-primary)';
            e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
            if (!isMobile) {
              e.currentTarget.style.transform = 'translateX(0)';
            }
          }}
        >
          <div style={{ position: 'relative', width: isMobile ? '56px' : '72px', height: isMobile ? '56px' : '72px', flexShrink: 0 }}>
            <div style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #e0e7ff 0%, #ede9fe 100%)',
              border: '2px solid #c7d2fe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <TypeIcon style={{ width: isMobile ? '28px' : '36px', height: isMobile ? '28px' : '36px', color: '#4f46e5' }} />
            </div>
            <div style={{
              position: 'absolute',
              top: isMobile ? '-6px' : '-8px',
              right: isMobile ? '-6px' : '-8px',
              width: isMobile ? '22px' : '28px',
              height: isMobile ? '22px' : '28px',
              borderRadius: '50%',
              backgroundColor: 'var(--success-bg)',
              border: '3px solid var(--bg-surface)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            }}>
              <StatusIcon style={{ width: isMobile ? '12px' : '14px', height: isMobile ? '12px' : '14px', color: 'var(--success-text)' }} />
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px', flexDirection: isMobile ? 'column' : 'row' as const }}>
              <h3 style={{
                fontSize: isMobile ? '16px' : '18px',
                fontWeight: '700',
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap' as const,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                letterSpacing: '-0.5px',
              }}>
                {project.name}
              </h3>
              <span style={{
                padding: isMobile ? '4px 10px' : '6px 14px',
                borderRadius: '8px',
                backgroundColor: 'var(--success-bg)',
                color: 'var(--success-text)',
                fontSize: isMobile ? '10px' : '12px',
                fontWeight: '700',
                textTransform: 'uppercase' as const,
                letterSpacing: '0.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                <StatusIcon style={{ width: isMobile ? '12px' : '14px', height: isMobile ? '12px' : '14px' }} />
                {status.label}
              </span>
            </div>

            <p style={{
              fontSize: '14px',
              color: 'var(--text-tertiary)',
              whiteSpace: 'nowrap' as const,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              marginBottom: '12px',
              lineHeight: '1.6',
              display: isMobile ? 'none' : 'block',
            }}>
              {project.description || '暂无描述'}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '12px' : '24px', fontSize: '13px', color: 'var(--text-tertiary)', flexWrap: 'wrap' as const }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}>
                <Calendar style={{ width: '16px', height: '16px' }} />
                {formatDate(project.updatedAt)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}>
                <Users style={{ width: '16px', height: '16px' }} />
                {project._count?.members || 1}
              </div>
              <span style={{
                padding: isMobile ? '4px 8px' : '4px 10px',
                borderRadius: '6px',
                backgroundColor: 'var(--bg-hover)',
                fontWeight: '600',
                color: 'var(--text-tertiary)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                <TypeIcon style={{ width: isMobile ? '12px' : '14px', height: isMobile ? '12px' : '14px' }} />
                {getProjectTypeLabel(project.type)}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={(e) => toggleExportMenu(e, project.id)}
              style={{
                width: isMobile ? '36px' : '40px',
                height: isMobile ? '36px' : '40px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <MoreVertical style={{ width: '20px', height: '20px', color: 'var(--text-tertiary)' }} />
            </button>
          </div>

          {exportMenu === project.id && (
            <div style={{
              position: 'fixed',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-primary)',
              borderRadius: '12px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
              minWidth: '200px',
              zIndex: 100,
              padding: '8px',
            }}>
              <button
                onClick={() => handleExport('json', project.id, project.name)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  color: 'var(--text-tertiary)',
                  width: '100%',
                  textAlign: 'left' as const,
                  borderRadius: '8px',
                  transition: 'background 0.2s ease',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <FileJson style={{ width: '18px', height: '18px', color: '#4f46e5' }} />
                <span>导出 JSON</span>
              </button>
              <button
                onClick={() => handleExport('videos', project.id, project.name)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  color: 'var(--text-tertiary)',
                  width: '100%',
                  textAlign: 'left' as const,
                  borderRadius: '8px',
                  transition: 'background 0.2s ease',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <FileVideo style={{ width: '18px', height: '18px', color: '#8b5cf6' }} />
                <span>导出视频</span>
              </button>
              <button
                onClick={() => handleExport('bundle', project.id, project.name)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  color: 'var(--text-tertiary)',
                  width: '100%',
                  textAlign: 'left' as const,
                  borderRadius: '8px',
                  transition: 'background 0.2s ease',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <FileArchive style={{ width: '18px', height: '18px', color: '#a855f7' }} />
                <span>导出完整包</span>
              </button>
            </div>
          )}
        </div>
      </Link>
    );
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)', display: 'flex', height: '100vh' }}>
      {isMobile ? null : <Sidebar />}

      {isMobile && mobileMenuOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9999,
        }} onClick={() => setMobileMenuOpen(false)} />
      )}

      {isMobile && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'var(--bg-secondary)',
          zIndex: 10000,
          transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease',
        }}>
          <div style={{ height: '64px', display: 'flex', alignItems: 'center', padding: '0 16px', borderBottom: '1px solid var(--border-primary)' }}>
            <div className="w-8 h-8 bg-[var(--accent)] rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span style={{ marginLeft: '12px', fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
              开演AI
            </span>
          </div>
          <nav style={{ padding: '16px' }}>
            {[
              { title: '我的项目', icon: FolderKanban, href: '/projects' },
              { title: '文档管理', icon: FileText, href: '/documents' },
              { title: '团队管理', icon: Users, href: '/team' },
              { title: '设置', icon: MoreVertical, href: '/settings' },
            ].map((item) => (
              <Link
                key={item.href}
                to={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px',
                  color: 'var(--text-primary)',
                  textDecoration: 'none',
                  borderRadius: '12px',
                  marginBottom: '8px',
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon style={{ width: '24px', height: '24px', color: 'var(--text-tertiary)' }} />
                <span style={{ fontSize: '16px', fontWeight: '500' }}>{item.title}</span>
              </Link>
            ))}
          </nav>
        </div>
      )}

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{
          height: isMobile ? '64px' : '80px',
          borderBottom: '1px solid var(--border-primary)',
          backgroundColor: 'var(--bg-elevated)',
          padding: `0 ${isMobile ? '16px' : isTablet ? '24px' : '32px'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          gap: isMobile ? '12px' : '0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '12px' : '24px', flex: 1, minWidth: 0 }}>
            {isMobile && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                style={{
                  padding: '8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                }}
              >
                <Menu style={{ width: '24px', height: '24px' }} />
              </button>
            )}
            <div style={{ display: isMobile ? 'none' : 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h1 style={{
                  fontSize: '26px',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  margin: 0,
                  letterSpacing: '-0.01em',
                }}>
                  我的项目
                </h1>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  backgroundColor: 'var(--accent-bg)',
                  color: 'var(--accent-text)',
                  fontSize: '12px',
                  fontWeight: '600',
                }}>
                  {projects.length}
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', margin: 0, fontWeight: '400' }}>
                管理和追踪所有你的创作项目
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '16px' }}>
            {isMobile ? (
              <div style={{ position: 'relative' }}>
                <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--text-muted)' }} />
                <Input
                  placeholder="搜索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '140px',
                    paddingLeft: '40px',
                    height: '36px',
                    fontSize: '13px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-primary)',
                    backgroundColor: 'var(--bg-hover)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
            ) : (
              <div style={{ position: 'relative' }}>
                <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: 'var(--text-muted)' }} />
                <Input
                  placeholder="搜索项目名称或描述..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: isTablet ? '200px' : '320px',
                    paddingLeft: '48px',
                    height: '44px',
                    fontSize: '14px',
                    borderRadius: '12px',
                    border: '1px solid var(--border-primary)',
                    backgroundColor: 'var(--bg-hover)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
            )}

            <div style={{ display: 'flex', gap: isMobile ? '8px' : '12px', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  aria-label="筛选"
                  style={{
                    padding: isMobile ? '0 12px' : '0 16px',
                    height: isMobile ? '40px' : '44px',
                    gap: '10px',
                    borderRadius: '12px',
                    fontWeight: '600',
                    fontSize: isMobile ? '13px' : '14px',
                    border: '1px solid var(--border-primary)',
                    backgroundColor: 'var(--bg-surface)',
                    color: (filterType !== 'all' || filterStatus !== 'all') ? '#4f46e5' : 'var(--text-tertiary)',
                  }}
                >
                  <Filter style={{ width: isMobile ? '16px' : '18px', height: isMobile ? '16px' : '18px' }} />
                  {!isMobile && <span>筛选</span>}
                </Button>

                {showFilters && (
                  <div style={{
                    position: 'absolute',
                    top: isMobile ? '52px' : '56px',
                    right: 0,
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: '16px',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
                    padding: '16px',
                    zIndex: 50,
                    minWidth: '200px',
                  }}>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: '12px' }}>
                      项目类型
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '6px', marginBottom: '16px' }}>
                      {['all', 'SCRIPT', 'NOVEL', 'MIXED'].map((type) => (
                        <button
                          key={type}
                          onClick={() => setFilterType(type)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px 16px',
                            border: 'none',
                            cursor: 'pointer',
                            width: '100%',
                            borderRadius: '12px',
                            transition: 'background 0.2s ease',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: filterType === type ? '#4f46e5' : 'var(--text-tertiary)',
                            backgroundColor: filterType === type ? 'var(--accent-bg)' : 'transparent',
                          }}
                          onMouseEnter={(e) => {
                            if (filterType !== type) {
                              e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (filterType !== type) {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }
                          }}
                        >
                          <span>{type === 'all' ? '全部类型' : getProjectTypeLabel(type)}</span>
                          {filterType === type && <X style={{ width: '16px', height: '16px' }} />}
                        </button>
                      ))}
                    </div>

                    <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: '12px' }}>
                      项目状态
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '6px' }}>
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
                              padding: '12px 16px',
                              border: 'none',
                              cursor: 'pointer',
                              width: '100%',
                              borderRadius: '12px',
                              transition: 'background 0.2s ease',
                              fontSize: '14px',
                              fontWeight: '500',
                              color: filterStatus === status ? statusInfo.textColor : 'var(--text-tertiary)',
                              backgroundColor: filterStatus === status ? statusInfo.bg : 'transparent',
                            }}
                            onMouseEnter={(e) => {
                              if (filterStatus !== status) {
                                e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (filterStatus !== status) {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <StatusIcon style={{ width: '16px', height: '16px' }} />
                              <span>{status === 'all' ? '全部状态' : statusInfo.label}</span>
                            </div>
                            {filterStatus === status && <X style={{ width: '16px', height: '16px' }} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '6px', padding: '6px', backgroundColor: 'var(--bg-hover)', borderRadius: '12px' }}>
                <button
                  onClick={() => setViewMode('grid')}
                  aria-label="网格视图"
                  style={{
                    padding: '10px',
                    border: 'none',
                    backgroundColor: viewMode === 'grid' ? 'var(--bg-surface)' : 'transparent',
                    cursor: 'pointer',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease',
                    color: viewMode === 'grid' ? '#4f46e5' : 'var(--text-muted)',
                    boxShadow: viewMode === 'grid' ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none',
                  }}
                >
                  <LayoutGrid style={{ width: '20px', height: '20px' }} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  aria-label="列表视图"
                  style={{
                    padding: '10px',
                    border: 'none',
                    backgroundColor: viewMode === 'list' ? 'var(--bg-surface)' : 'transparent',
                    cursor: 'pointer',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease',
                    color: viewMode === 'list' ? '#4f46e5' : 'var(--text-muted)',
                    boxShadow: viewMode === 'list' ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none',
                  }}
                >
                  <LayoutList style={{ width: '20px', height: '20px' }} />
                </button>
              </div>

              <button
                onClick={() => navigate('/projects/new')}
                style={{
                  height: '38px',
                  padding: '0 20px',
                  fontSize: '14px',
                  fontWeight: '500',
                  background: 'var(--accent)',
                  color: 'var(--accent-on)',
                  border: 'none',
                  borderRadius: '9px',
                  cursor: 'pointer',
                  boxShadow: 'none',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--accent-hover)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--accent)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <Plus style={{ width: '16px', height: '16px' }} />
                {!isMobile && <span>创建项目</span>}
              </button>
            </div>
          </div>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '16px' : isTablet ? '24px' : '32px', position: 'relative' }}>
          {loading ? (
            <div style={{
              display: viewMode === 'grid' ? 'grid' : 'flex',
              flexDirection: viewMode === 'list' ? 'column' : 'inherit',
              gridTemplateColumns: viewMode === 'grid' ? (isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(380px, 1fr))') : undefined,
              gap: viewMode === 'grid' ? (isMobile ? '16px' : '24px') : '16px'
            }}>
              {Array.from({ length: viewMode === 'grid' ? (isMobile ? 2 : isTablet ? 4 : 6) : 4 }).map((_, index) => (
                <div key={index}>
                  {viewMode === 'grid' ? <SkeletonCard /> : <SkeletonList />}
                </div>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {viewMode === 'grid' ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(380px, 1fr))',
                  gap: isMobile ? '16px' : '24px',
                }}>
                  {projects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '16px' }}>
                  {projects.map((project) => (
                    <ProjectListItem key={project.id} project={project} />
                  ))}
                </div>
              )}

              {!loading && totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '40px', padding: '24px', flexWrap: 'wrap' as const }}>
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    style={{
                      padding: '0 20px',
                      height: '44px',
                      borderRadius: '12px',
                      fontWeight: '600',
                      fontSize: '14px',
                      border: '1px solid var(--border-primary)',
                      backgroundColor: 'var(--bg-surface)',
                      color: 'var(--text-tertiary)',
                      cursor: page === 1 ? 'not-allowed' : 'pointer',
                      opacity: page === 1 ? 0.5 : 1,
                    }}
                  >
                    上一页
                  </Button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 20px', fontSize: '15px', color: 'var(--text-tertiary)', fontWeight: '500' }}>
                    <span style={{ color: 'var(--text-muted)' }}>第</span>
                    <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{page}</span>
                  </div>
                  <span style={{ fontSize: '15px', color: 'var(--text-muted)' }}>/</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 20px', fontSize: '15px', color: 'var(--text-tertiary)', fontWeight: '500' }}>
                    <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{totalPages}</span>
                  </div>
                  <span style={{ fontSize: '15px', color: 'var(--text-muted)', marginRight: '8px' }}>页</span>
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    style={{
                      padding: '0 20px',
                      height: '44px',
                      borderRadius: '12px',
                      fontWeight: '600',
                      fontSize: '14px',
                      border: '1px solid var(--border-primary)',
                      backgroundColor: 'var(--bg-surface)',
                      color: 'var(--text-tertiary)',
                      cursor: page === totalPages ? 'not-allowed' : 'pointer',
                      opacity: page === totalPages ? 0.5 : 1,
                    }}
                  >
                    下一页
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0) scale(1); }
            50% { transform: translateY(-10px) scale(1.02); }
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @media (max-width: 767px) {
            .sidebar-hidden { display: none; }
          }
        `}
      </style>
    </div>
  );
}
