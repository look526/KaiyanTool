import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Sidebar } from '../components/Sidebar';
import EmptyState from '../components/EmptyState';
import { apiClient } from '../lib/api-client';

interface Document {
  id: string;
  projectId: string;
  title: string;
  content: string | null;
  type: string;
  createdAt: string;
  updatedAt: string;
  status?: string;
  project?: {
    id: string;
    name: string;
  };
}

import {
  FileText,
  FileCode,
  FileImage,
  FileVideo,
  FileAudio,
  File,
  Search,
  Grid3X3,
  List,
  Plus,
  Calendar,
  FolderOpen,
  Sparkles,
  SortAsc,
  Filter,
  MoreHorizontal,
  Clock,
  Edit3,
  FilePlus,
} from 'lucide-react';

const DOCUMENT_TYPES: Record<string, { icon: React.ElementType; color: string; bgColor: string; label: string }> = {
  script: { icon: FileCode, color: '#8b5cf6', bgColor: 'rgba(139, 92, 246, 0.1)', label: '剧本' },
  novel: { icon: FileText, color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.1)', label: '小说' },
  outline: { icon: FileText, color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)', label: '大纲' },
  storyboard: { icon: FileImage, color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)', label: '故事板' },
  video: { icon: FileVideo, color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)', label: '视频' },
  audio: { icon: FileAudio, color: '#ec4899', bgColor: 'rgba(236, 72, 153, 0.1)', label: '音频' },
  general: { icon: File, color: '#64748b', bgColor: 'rgba(100, 116, 139, 0.1)', label: '文档' },
};

const STATUS_CONFIG: Record<string, { color: string; bgColor: string; label: string }> = {
  draft: { color: '#64748b', bgColor: 'rgba(100, 116, 139, 0.1)', label: '草稿' },
  pending: { color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)', label: '待处理' },
  in_progress: { color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.1)', label: '进行中' },
  completed: { color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)', label: '已完成' },
  published: { color: '#8b5cf6', bgColor: 'rgba(139, 92, 246, 0.1)', label: '已发布' },
};

type ViewMode = 'grid' | 'list';
type SortOption = 'newest' | 'oldest' | 'title' | 'updated';

const DocumentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getDocuments();
      setDocuments(data.documents || []);
    } catch (err) {
      setError('Failed to load documents');
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDocument = () => {
    navigate('/documents/create');
  };

  const handleDocumentClick = (document: Document) => {
    navigate(`/documents/${document.id}`);
  };

  const getDocumentTypeConfig = (type: string) => {
    return DOCUMENT_TYPES[type] || DOCUMENT_TYPES.general;
  };

  const getStatusConfig = (status: string) => {
    return STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return '今天';
    } else if (diffDays === 1) {
      return '昨天';
    } else if (diffDays < 7) {
      return `${diffDays} 天前`;
    } else {
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    }
  };

  const filteredAndSortedDocuments = useMemo(() => {
    let result = [...documents];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (doc) =>
          doc.title.toLowerCase().includes(query) ||
          (doc.content?.toLowerCase().includes(query) ?? false) ||
          (doc.project?.name.toLowerCase().includes(query) ?? false)
      );
    }

    if (selectedType) {
      result = result.filter((doc) => doc.type === selectedType);
    }

    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'title':
        result.sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'));
        break;
      case 'updated':
        result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        break;
    }

    return result;
  }, [documents, searchQuery, sortBy, selectedType]);

  const uniqueTypes = useMemo(() => {
    const types = new Set(documents.map((doc) => doc.type));
    return Array.from(types);
  }, [documents]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)', padding: '32px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
            <LoadingSpinner size="large" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)', padding: '32px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '400px',
            textAlign: 'center',
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '20px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px',
            }}>
              <FileText style={{ width: '40px', height: '40px', color: '#ef4444' }} />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
              加载失败
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              {error}
            </p>
            <Button onClick={fetchDocuments}>重试</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)', display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{
        background: 'linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-base) 100%)',
        padding: '32px 32px 24px',
        borderBottom: '1px solid var(--border-primary)',
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <FolderOpen style={{ width: '20px', height: '20px', color: 'white' }} />
                </div>
                <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                  文档管理
                </h1>
              </div>
              <p style={{ fontSize: '15px', color: 'var(--text-secondary)', margin: 0 }}>
                管理和浏览您的所有创作文档
              </p>
            </div>
            <Button
              onClick={handleCreateDocument}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                height: '44px',
                padding: '0 24px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                border: 'none',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(139, 92, 246, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)';
              }}
            >
              <Plus style={{ width: '18px', height: '18px' }} />
              新建文档
            </Button>
          </div>

          <div style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}>
            <div style={{
              flex: '1',
              minWidth: '280px',
              position: 'relative',
            }}>
              <Search style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '18px',
                height: '18px',
                color: 'var(--text-muted)',
              }} />
              <input
                type="text"
                placeholder="搜索文档标题、内容或项目..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  height: '44px',
                  padding: '0 16px 0 44px',
                  fontSize: '14px',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '12px',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-primary)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                style={{
                  height: '44px',
                  padding: '0 36px 0 14px',
                  fontSize: '14px',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '12px',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  outline: 'none',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 10px center',
                }}
              >
                <option value="newest">最新创建</option>
                <option value="oldest">最早创建</option>
                <option value="updated">最近更新</option>
                <option value="title">按标题</option>
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                style={{
                  height: '44px',
                  width: '44px',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: showFilters ? 'var(--accent)' : 'var(--bg-surface)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '12px',
                  color: showFilters ? 'white' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <Filter style={{ width: '18px', height: '18px' }} />
              </button>

              <div style={{
                display: 'flex',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-primary)',
                borderRadius: '12px',
                overflow: 'hidden',
              }}>
                <button
                  onClick={() => setViewMode('grid')}
                  style={{
                    height: '44px',
                    width: '44px',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: viewMode === 'grid' ? 'var(--accent)' : 'transparent',
                    border: 'none',
                    color: viewMode === 'grid' ? 'white' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Grid3X3 style={{ width: '18px', height: '18px' }} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  style={{
                    height: '44px',
                    width: '44px',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: viewMode === 'list' ? 'var(--accent)' : 'transparent',
                    border: 'none',
                    color: viewMode === 'list' ? 'white' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <List style={{ width: '18px', height: '18px' }} />
                </button>
              </div>
            </div>
          </div>

          {showFilters && uniqueTypes.length > 0 && (
            <div style={{
              marginTop: '16px',
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
            }}>
              <button
                onClick={() => setSelectedType(null)}
                style={{
                  height: '36px',
                  padding: '0 16px',
                  fontSize: '13px',
                  fontWeight: '500',
                  backgroundColor: selectedType === null ? 'var(--accent)' : 'var(--bg-surface)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '10px',
                  color: selectedType === null ? 'white' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                全部类型
              </button>
              {uniqueTypes.map((type) => {
                const config = getDocumentTypeConfig(type);
                const ConfigIcon = config.icon;
                return (
                  <button
                    key={type}
                    onClick={() => setSelectedType(selectedType === type ? null : type)}
                    style={{
                      height: '36px',
                      padding: '0 16px',
                      fontSize: '13px',
                      fontWeight: '500',
                      backgroundColor: selectedType === type ? config.color : config.bgColor,
                      border: `1px solid ${selectedType === type ? config.color : config.color}30`,
                      borderRadius: '10px',
                      color: selectedType === type ? 'white' : config.color,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <ConfigIcon style={{ width: '14px', height: '14px' }} />
                    {config.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: '32px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {filteredAndSortedDocuments.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '80px 24px',
              textAlign: 'center',
            }}>
              <EmptyState
                icon={searchQuery ? Search : FilePlus}
                title={searchQuery ? '未找到匹配的文档' : '还没有任何文档'}
                description={searchQuery
                  ? '尝试使用不同的关键词或清除筛选条件'
                  : '创建您的第一个文档，开始您的创作之旅'}
                iconColor="#8b5cf6"
                iconBgColor="linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)"
                action={!searchQuery ? {
                  label: '创建第一个文档',
                  onClick: handleCreateDocument,
                } : undefined}
              />
            </div>
          ) : viewMode === 'grid' ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '20px',
            }}>
              {filteredAndSortedDocuments.map((document) => {
                const typeConfig = getDocumentTypeConfig(document.type);
                const statusConfig = getStatusConfig(document.status || 'draft');
                const TypeIcon = typeConfig.icon;

                return (
                  <div
                    key={document.id}
                    onClick={() => handleDocumentClick(document)}
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-primary)',
                      borderRadius: '16px',
                      padding: '24px',
                      cursor: 'pointer',
                      transition: 'all 0.25s ease',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.12)';
                      e.currentTarget.style.borderColor = 'var(--accent)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = 'var(--border-primary)';
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: `linear-gradient(90deg, ${typeConfig.color} 0%, ${typeConfig.color}80 100%)`,
                    }} />

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '14px',
                        backgroundColor: typeConfig.bgColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <TypeIcon style={{ width: '24px', height: '24px', color: typeConfig.color }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{
                          fontSize: '17px',
                          fontWeight: '600',
                          color: 'var(--text-primary)',
                          margin: '0 0 4px 0',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {document.title}
                        </h3>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 10px',
                          fontSize: '11px',
                          fontWeight: '600',
                          color: statusConfig.color,
                          backgroundColor: statusConfig.bgColor,
                          borderRadius: '6px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}>
                          {statusConfig.label}
                        </span>
                      </div>
                    </div>

                    <p style={{
                      fontSize: '14px',
                      color: 'var(--text-secondary)',
                      lineHeight: '1.6',
                      margin: '0 0 20px 0',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      minHeight: '44px',
                    }}>
                      {(document.content || '').substring(0, 120).replace(/<[^>]*>/g, '')}
                      {(document.content?.length || 0) > 120 && '...'}
                    </p>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: '16px',
                      borderTop: '1px solid var(--border-primary)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock style={{ width: '14px', height: '14px', color: 'var(--text-muted)' }} />
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                          {formatDate(document.updatedAt)}
                        </span>
                      </div>
                      {document.project && (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 10px',
                          fontSize: '12px',
                          fontWeight: '500',
                          color: 'var(--text-secondary)',
                          backgroundColor: 'var(--bg-hover)',
                          borderRadius: '8px',
                        }}>
                          <FolderOpen style={{ width: '12px', height: '12px' }} />
                          {document.project.name}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredAndSortedDocuments.map((document) => {
                const typeConfig = getDocumentTypeConfig(document.type);
                const statusConfig = getStatusConfig(document.status || 'draft');
                const TypeIcon = typeConfig.icon;

                return (
                  <div
                    key={document.id}
                    onClick={() => handleDocumentClick(document)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '20px',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-primary)',
                      borderRadius: '14px',
                      padding: '20px 24px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                      e.currentTarget.style.borderColor = 'var(--accent)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                      e.currentTarget.style.borderColor = 'var(--border-primary)';
                    }}
                  >
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      backgroundColor: typeConfig.bgColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <TypeIcon style={{ width: '22px', height: '22px', color: typeConfig.color }} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                        <h3 style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: 'var(--text-primary)',
                          margin: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {document.title}
                        </h3>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '2px 8px',
                          fontSize: '11px',
                          fontWeight: '600',
                          color: statusConfig.color,
                          backgroundColor: statusConfig.bgColor,
                          borderRadius: '6px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}>
                          {statusConfig.label}
                        </span>
                      </div>
                      <p style={{
                        fontSize: '13px',
                        color: 'var(--text-secondary)',
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {(document.content || '').substring(0, 80).replace(/<[^>]*>/g, '')}
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexShrink: 0 }}>
                      {document.project && (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          fontSize: '13px',
                          fontWeight: '500',
                          color: 'var(--text-secondary)',
                          backgroundColor: 'var(--bg-hover)',
                          borderRadius: '8px',
                        }}>
                          <FolderOpen style={{ width: '14px', height: '14px' }} />
                          {document.project.name}
                        </span>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '80px' }}>
                        <Clock style={{ width: '14px', height: '14px', color: 'var(--text-muted)' }} />
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                          {formatDate(document.updatedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {filteredAndSortedDocuments.length > 0 && (
            <div style={{
              marginTop: '24px',
              padding: '16px 0',
              borderTop: '1px solid var(--border-primary)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                显示 {filteredAndSortedDocuments.length} 个文档
                {selectedType && ` · 类型: ${getDocumentTypeConfig(selectedType).label}`}
              </span>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default DocumentsPage;
