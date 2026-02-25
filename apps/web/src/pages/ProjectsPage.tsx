import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, MoreVertical, Sparkles, Users, FolderKanban, FileJson, FileVideo, FileArchive, Filter, X, LayoutGrid, LayoutList, TrendingUp, Calendar, CheckCircle2, Pause, FileText, BookOpen, Layers, Menu } from 'lucide-react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  const ProjectCard = React.memo(({ project }: { project: Project }) => {
    const status = getStatusInfo(project.status);
    const StatusIcon = status.icon;
    const TypeIcon = getProjectTypeIcon(project.type);

    return (
      <Link to={`/projects/${project.id}`} style={{ textDecoration: 'none' }}>
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: '16px',
          border: '1px solid var(--border-subtle)',
          overflow: 'hidden',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          padding: isMobile ? '16px' : '20px',
        }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.1)';
            e.currentTarget.style.borderColor = 'var(--border-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: isMobile ? '12px' : '16px' }}>
            <div style={{ position: 'relative', width: isMobile ? '48px' : '56px', height: isMobile ? '48px' : '56px' }}>
              <div style={{
                width: '100%',
                height: '100%',
                borderRadius: '12px',
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <TypeIcon style={{ width: isMobile ? '24px' : '28px', height: isMobile ? '24px' : '28px', color: 'var(--accent)' }} />
              </div>
              <div style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                width: isMobile ? '18px' : '20px',
                height: isMobile ? '18px' : '20px',
                borderRadius: '50%',
                backgroundColor: status.color,
                border: '2px solid var(--bg-surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <StatusIcon style={{ width: isMobile ? '8px' : '10px', height: isMobile ? '8px' : '10px', color: 'white' }} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={(e) => toggleExportMenu(e, project.id)}
                aria-label="导出菜单"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: 'var(--text-tertiary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <MoreVertical size={18} />
              </button>
            </div>
          </div>

          <h3 style={{
            fontSize: isMobile ? '15px' : '17px',
            fontWeight: '600',
            color: 'var(--text-primary)',
            marginBottom: '6px',
            whiteSpace: 'nowrap' as const,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {project.name}
          </h3>

          <p style={{
            fontSize: '13px',
            color: 'var(--text-secondary)',
            marginBottom: isMobile ? '12px' : '16px',
            lineHeight: '1.5',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical' as const,
            overflow: 'hidden',
            minHeight: '40px',
          }}>
            {project.description || '暂无描述'}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: isMobile ? '12px' : '16px', flexWrap: 'wrap' as const }}>
            <span style={{
              padding: '4px 10px',
              borderRadius: '6px',
              backgroundColor: 'var(--bg-elevated)',
              color: 'var(--text-secondary)',
              fontSize: '12px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              border: '1px solid var(--border-subtle)',
            }}>
              <StatusIcon style={{ width: '12px', height: '12px' }} />
              {status.label}
            </span>
            <span style={{
              padding: '4px 10px',
              borderRadius: '6px',
              backgroundColor: 'var(--bg-elevated)',
              color: 'var(--text-secondary)',
              fontSize: '12px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              border: '1px solid var(--border-subtle)',
            }}>
              <TypeIcon style={{ width: '12px', height: '12px' }} />
              {getProjectTypeLabel(project.type)}
            </span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: isMobile ? '12px' : '14px',
            borderTop: '1px solid var(--border-subtle)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '12px' : '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-tertiary)', fontSize: '12px' }}>
                <Calendar style={{ width: '14px', height: '14px' }} />
                <span>{formatDate(project.updatedAt)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-tertiary)', fontSize: '12px' }}>
                <Users style={{ width: '14px', height: '14px' }} />
                <span>{project._count?.members || 1}</span>
              </div>
            </div>
          </div>

          {exportMenu === project.id && (
            <div style={{
              position: 'absolute',
              top: '72px',
              right: '12px',
              borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
              minWidth: '180px',
              zIndex: 50,
              padding: '6px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
            }}>
              <button
                onClick={() => handleExport('json', project.id, project.name)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  gap: '12px',
                  padding: '12px 16px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: 'transparent',
                  color: 'var(--text-tertiary)',
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'all 0.3s ease',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255, 0.05)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--text-tertiary)';
                }}
              >
                <FileJson size={18} />
                <span>导出 JSON</span>
              </button>
              <button
                onClick={() => handleExport('videos', project.id, project.name)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  gap: '12px',
                  padding: '12px 16px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: 'transparent',
                  color: 'var(--text-tertiary)',
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'all 0.3s ease',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255, 0.05)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--text-tertiary)';
                }}
              >
                <FileVideo size={18} />
                <span>导出视频</span>
              </button>
              <button
                onClick={() => handleExport('bundle', project.id, project.name)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  gap: '12px',
                  padding: '12px 16px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: 'transparent',
                  color: 'var(--text-tertiary)',
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'all 0.3s ease',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255, 0.05)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--text-tertiary)';
                }}
              >
                <FileArchive size={18} />
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
        <div className="glass" style={{
          display: 'flex',
          alignItems: isMobile ? 'flex-start' : 'center',
          gap: isMobile ? '12px' : '24px',
          padding: isMobile ? '16px' : '24px',
          borderRadius: '16px',
          transition: 'all 0.3s ease-out',
          cursor: 'pointer',
        }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 20px 60px rgba(99, 102, 241, 0.2)';
            if (!isMobile) {
              e.currentTarget.style.transform = 'translateX(4px)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            if (!isMobile) {
              e.currentTarget.style.transform = 'translateX(0)';
            }
          }}
        >
          <div className="card-glow"></div>
          
          <div style={{ position: 'relative', width: isMobile ? '56px' : '72px', height: isMobile ? '56px' : '72px', flexShrink: 0 }}>
            <div style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 24px rgba(99, 102, 241, 0.2)',
            }}>
              <TypeIcon style={{ width: isMobile ? '28px' : '36px', height: isMobile ? '28px' : '36px', color: 'var(--primary-500)' }} />
            </div>
            <div style={{
              position: 'absolute',
              top: isMobile ? '-6px' : '-8px',
              right: isMobile ? '-6px' : '-8px',
              width: isMobile ? '22px' : '28px',
              height: isMobile ? '22px' : '28px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%)',
              border: '3px solid rgba(255,255,255, 0.03)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(99, 102, 241, 0.4)',
            }}>
              <StatusIcon style={{ width: isMobile ? '12px' : '14px', height: isMobile ? '12px' : '14px', color: 'white' }} />
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 0, position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px', flexDirection: isMobile ? 'column' : 'row' as const, alignItems: isMobile ? 'flex-start' : 'center' }}>
              <h3 style={{
                fontSize: isMobile ? '16px' : '18px',
                fontWeight: '700',
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap' as const,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                letterSpacing: '-0.5px',
                margin: 0,
              }}>
                {project.name}
              </h3>
              <span style={{
                padding: isMobile ? '4px 10px' : '6px 14px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                color: 'var(--primary-500)',
                fontSize: isMobile ? '10px' : '12px',
                fontWeight: '700',
                textTransform: 'uppercase' as const,
                letterSpacing: '0.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                border: '1px solid rgba(99, 102, 241, 0.2)',
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
              margin: '0 0 12px 0',
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
                background: 'rgba(255,255,255, 0.05)',
                fontWeight: '600',
                color: 'var(--text-tertiary)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                border: '1px solid rgba(255,255,255, 0.1)',
              }}>
                <TypeIcon style={{ width: isMobile ? '12px' : '14px', height: isMobile ? '12px' : '14px' }} />
                {getProjectTypeLabel(project.type)}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative', zIndex: 1 }}>
            <button
              onClick={(e) => toggleExportMenu(e, project.id)}
              aria-label="导出菜单"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: 'rgba(255,255,255, 0.05)',
                color: 'var(--text-tertiary)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255, 0.05)';
              }}
            >
              <MoreVertical size={20} />
            </button>
          </div>

          {exportMenu === project.id && (
            <div className="glass" style={{
              position: 'fixed',
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
                  justifyContent: 'flex-start',
                  gap: '12px',
                  padding: '12px 16px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: 'transparent',
                  color: 'var(--text-tertiary)',
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'all 0.3s ease',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255, 0.05)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--text-tertiary)';
                }}
              >
                <FileJson size={18} />
                <span>导出 JSON</span>
              </button>
              <button
                onClick={() => handleExport('videos', project.id, project.name)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  gap: '12px',
                  padding: '12px 16px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: 'transparent',
                  color: 'var(--text-tertiary)',
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'all 0.3s ease',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255, 0.05)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--text-tertiary)';
                }}
              >
                <FileVideo size={18} />
                <span>导出视频</span>
              </button>
              <button
                onClick={() => handleExport('bundle', project.id, project.name)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  gap: '12px',
                  padding: '12px 16px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: 'transparent',
                  color: 'var(--text-tertiary)',
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'all 0.3s ease',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255, 0.05)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--text-tertiary)';
                }}
              >
                <FileArchive size={18} />
                <span>导出完整包</span>
              </button>
            </div>
          )}
        </div>
      </Link>
    );
  });

  return (
    <div ref={containerRef} style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <div className="background-decoration" style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}>
      </div>

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
          <div style={{ height: '64px', display: 'flex', alignItems: 'center', padding: '0 16px', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 24px rgba(99, 102, 241, 0.5)',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute',
                inset: -2,
                borderRadius: '14px',
                background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))',
                filter: 'blur(8px)',
                opacity: 0.6,
              }}></div>
              <Sparkles style={{ width: '20px', height: '20px', color: 'white', position: 'relative', zIndex: 1 }} />
            </div>
            <span style={{ marginLeft: '12px', fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
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
                  color: 'var(--text-tertiary)',
                  textDecoration: 'none',
                  borderRadius: '12px',
                  marginBottom: '8px',
                  transition: 'all 0.3s ease',
                }}
                onClick={() => setMobileMenuOpen(false)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--text-tertiary)';
                }}
              >
                <item.icon style={{ width: '24px', height: '24px', color: 'var(--text-tertiary)' }} />
                <span style={{ fontSize: '16px', fontWeight: '500' }}>{item.title}</span>
              </Link>
            ))}
          </nav>
        </div>
      )}

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', zIndex: 1 }}>
        <header className="glass" style={{
          height: isMobile ? '64px' : '80px',
          borderBottom: '1px solid var(--border-subtle)',
          padding: `0 ${isMobile ? '16px' : isTablet ? '24px' : '32px'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          gap: isMobile ? '12px' : '0',
          margin: isMobile ? '16px' : '24px',
          borderRadius: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '12px' : '24px', flex: 1, minWidth: 0 }}>
            {isMobile && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="移动端菜单"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                }}
              >
                <Menu size={24} />
              </button>
            )}
            <div style={{ display: isMobile ? 'none' : 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h1 style={{
                  fontSize: '26px',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  margin: 0,
                  letterSpacing: '-0.3px',
                }}>
                  我的项目
                </h1>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  fontWeight: '600',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
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
                <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--text-tertiary)' }} />
                <input
                  placeholder="搜索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input"
                  style={{
                    width: '140px',
                    paddingLeft: '40px',
                    height: '36px',
                    fontSize: '13px',
                    borderRadius: '10px',
                  }}
                />
              </div>
            ) : (
              <div style={{ position: 'relative' }}>
                <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: 'var(--text-tertiary)' }} />
                <input
                  placeholder="搜索项目名称或描述..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input"
                  style={{
                    width: isTablet ? '200px' : '320px',
                    paddingLeft: '48px',
                    height: '44px',
                    fontSize: '14px',
                  }}
                />
              </div>
            )}

            <div style={{ display: 'flex', gap: isMobile ? '8px' : '12px', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  aria-label="筛选"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: isMobile ? '8px 12px' : '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: (filterType !== 'all' || filterStatus !== 'all') ? 'var(--primary-500)' : 'var(--text-tertiary)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  }}
                >
                  <Filter size={isMobile ? 16 : 18} />
                  {!isMobile && <span style={{ fontSize: '14px', fontWeight: '500' }}>筛选</span>}
                </button>

                {showFilters && (
                  <div className="glass" style={{
                    position: 'absolute',
                    top: isMobile ? '52px' : '56px',
                    right: 0,
                    borderRadius: '16px',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
                    padding: '16px',
                    zIndex: 50,
                    minWidth: '200px',
                  }}>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-tertiary)', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: '12px' }}>
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
                            transition: 'all 0.3s ease',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: filterType === type ? 'var(--primary-500)' : 'var(--text-tertiary)',
                            backgroundColor: filterType === type ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                          }}
                          onMouseEnter={(e) => {
                            if (filterType !== type) {
                              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
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

                    <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-tertiary)', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: '12px' }}>
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
                              transition: 'all 0.3s ease',
                              fontSize: '14px',
                              fontWeight: '500',
                              color: filterStatus === status ? 'var(--text-primary)' : 'var(--text-tertiary)',
                              backgroundColor: filterStatus === status ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                            }}
                            onMouseEnter={(e) => {
                              if (filterStatus !== status) {
                                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
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

              <div style={{ display: 'flex', gap: '6px', padding: '6px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px' }}>
                <Button
                  onClick={() => setViewMode('grid')}
                  aria-label="网格视图"
                  variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                  size="icon"
                  icon={<LayoutGrid size={20} />}
                />
                <Button
                  onClick={() => setViewMode('list')}
                  aria-label="列表视图"
                  variant={viewMode === 'list' ? 'primary' : 'ghost'}
                  size="icon"
                  icon={<LayoutList size={20} />}
                />
              </div>

              <Button
                onClick={() => navigate('/projects/new')}
                variant="primary"
                size={isMobile ? 'sm' : 'md'}
                icon={<Plus size={16} />}
                iconPosition="left"
              >
                {!isMobile && '创建项目'}
              </Button>
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
                <div key={index} className="glass" style={{ padding: '24px', borderRadius: '16px', height: '300px' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.05)', marginBottom: '20px' }}></div>
                  <div style={{ width: '80%', height: '20px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.05)', marginBottom: '12px' }}></div>
                  <div style={{ width: '60%', height: '16px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.05)', marginBottom: '20px' }}></div>
                  <div style={{ width: '40%', height: '12px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.05)' }}></div>
                </div>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column' as const,
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '400px',
              padding: isMobile ? '40px 20px' : '60px 20px',
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%)',
                display: 'flex',
                alignItems: 'center' as const,
                justifyContent: 'center',
                marginBottom: '24px',
                boxShadow: '0 12px 48px rgba(99, 102, 241, 0.4)',
              }}>
                <Plus style={{ width: '36px', height: '36px', color: 'white' }} />
              </div>

              <h2 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: '12px',
                letterSpacing: '-0.5px',
                textAlign: 'center' as const,
              }}>
                创建第一个项目
              </h2>

              <p style={{
                fontSize: '16px',
                color: 'var(--text-tertiary)',
                marginBottom: '32px',
                textAlign: 'center' as const,
                maxWidth: '320px',
                lineHeight: '1.6',
              }}>
                开始你的AI内容创作之旅
              </p>

              <button
                onClick={() => navigate('/projects/new')}
                className="btn-primary"
                style={{
                  padding: '16px 40px',
                  fontSize: '16px',
                }}
              >
                <Plus size={16} />
                <span>创建项目</span>
              </button>
            </div>
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
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    variant="outline"
                    size="md"
                  >
                    上一页
                  </Button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 20px', fontSize: '15px', color: 'var(--text-tertiary)', fontWeight: '500' }}>
                    <span style={{ color: 'var(--text-tertiary)' }}>第</span>
                    <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{page}</span>
                  </div>
                  <span style={{ fontSize: '15px', color: 'var(--text-tertiary)' }}>/</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 20px', fontSize: '15px', color: 'var(--text-tertiary)', fontWeight: '500' }}>
                    <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{totalPages}</span>
                  </div>
                  <span style={{ fontSize: '15px', color: 'var(--text-tertiary)', marginRight: '8px' }}>页</span>
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
