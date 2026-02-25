import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Settings,
  Users,
  FolderKanban,
  Image,
  Video,
  FileText,
  Trash2,
  Sparkles,
  Loader2,
  Play,
  Download,
  BookOpen,
  MapPin
} from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { apiClient, Project } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editingProject, setEditingProject] = useState({ name: '', description: '' });

  const loadProject = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient.getProject(id!);
      setProject(data);
    } catch (error) {
      console.error('Failed to load project:', error);
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  const handleDeleteProject = async () => {
    if (!project) return;
    
    try {
      await apiClient.deleteProject(project.id);
      navigate('/projects');
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getProjectTypeLabel = (type: string) => {
    switch (type) {
      case 'SCRIPT': return '剧本';
      case 'NOVEL': return '小说';
      case 'MIXED': return '混合';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 style={{ width: '48px', height: '48px', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <FolderKanban style={{ width: '64px', height: '64px', color: 'var(--text-muted)', marginBottom: '16px' }} />
          <p style={{ color: 'var(--text-tertiary)', fontSize: '18px' }}>项目不存在</p>
        </div>
      </div>
    );
  }

  const isOwner = project.ownerId === user?.id;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-base)' }}>
      <header style={{
          height: '64px',
          borderBottom: '1px solid var(--border-primary)',
          backgroundColor: 'var(--bg-elevated)',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link to="/projects" style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              borderRadius: '8px',
              textDecoration: 'none',
              color: 'var(--text-muted)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
            >
              <ArrowLeft style={{ width: '16px', height: '16px' }} />
            </Link>
            <div>
              <h1 style={{ 
                fontSize: '20px', 
                fontWeight: '700',
                color: 'var(--text-primary)',
                margin: '0 0 4px 0',
              }}>{project.name}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                <span style={{ padding: '2px 8px', borderRadius: '4px', backgroundColor: 'var(--bg-hover)' }}>
                  {getProjectTypeLabel(project.type)}
                </span>
                <span>创建于 {formatDate(project.createdAt)}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isOwner && (
              <>
                <button
                  onClick={() => {
                    setEditingProject({ 
                      name: project.name, 
                      description: (project as any).description || '' 
                    });
                    setShowSettingsModal(true);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    height: '48px',
                    padding: '0 24px',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: '14px',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                    position: 'relative',
                    overflow: 'hidden',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
                    e.currentTarget.style.borderColor = 'var(--accent)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
                    e.currentTarget.style.borderColor = 'var(--border-primary)';
                  }}
                >
                  <Settings style={{ width: '16px', height: '16px' }} />
                  项目设置
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    height: '48px',
                    padding: '0 24px',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: '14px',
                    color: '#ef4444',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                    position: 'relative',
                    overflow: 'hidden',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                    e.currentTarget.style.borderColor = '#ef4444';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(239, 68, 68, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                    e.currentTarget.style.borderColor = 'var(--border-primary)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
                  }}
                >
                  <Trash2 style={{ width: '16px', height: '16px' }} />
                  删除
                </button>
              </>
            )}
            <button
              onClick={() => navigate(`/projects/${id}/script`)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                height: '52px',
                padding: '0 32px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                border: 'none',
                borderRadius: '14px',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 8px 24px rgba(139, 92, 246, 0.4)',
                position: 'relative',
                overflow: 'hidden',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(139, 92, 246, 0.5)';
                e.currentTarget.style.background = 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(139, 92, 246, 0.4)';
                e.currentTarget.style.background = 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)';
              }}
            >
              <Play style={{ width: '16px', height: '16px' }} />
              开始创作
            </button>
          </div>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <Breadcrumb items={[
              { label: '首页', path: '/' },
              { label: '我的项目', path: '/projects' },
              { label: project.name },
            ]} />
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '32px' }}>
              <Card style={{ padding: '24px' }}>
                <h2 style={{ 
                  fontSize: '16px', 
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  marginBottom: '16px',
                  margin: '0 0 16px 0',
                }}>项目描述</h2>
                <p style={{ 
                  fontSize: '14px',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.7',
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                }}>
                  {project.description || '暂无描述'}
                </p>
              </Card>

              <Card style={{ padding: '24px' }}>
                <h2 style={{ 
                  fontSize: '16px', 
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  marginBottom: '16px',
                  margin: '0 0 16px 0',
                }}>项目信息</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'var(--gradient-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: 'white',
                    }}>
                      {project.owner?.name?.charAt(0) || project.owner?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                        {project.owner?.name || project.owner?.email}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>项目所有者</div>
                    </div>
                  </div>

                  <div style={{ padding: '12px 0', borderTop: '1px solid var(--border-primary)' }}></div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ padding: '12px', backgroundColor: 'var(--bg-hover)', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <Users style={{ width: '16px', height: '16px', color: 'var(--text-muted)' }} />
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>成员</span>
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>
                        {project._count?.members || 1}
                      </div>
                    </div>
                    <div style={{ padding: '12px', backgroundColor: 'var(--bg-hover)', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <Image style={{ width: '16px', height: '16px', color: 'var(--text-muted)' }} />
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>角色</span>
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>
                        {project._count?.characters || 0}
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: '12px', backgroundColor: 'var(--bg-hover)', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <FileText style={{ width: '16px', height: '16px', color: 'var(--text-muted)' }} />
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>镜头</span>
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>
                      {project._count?.shots || 0}
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: '700',
              color: 'var(--text-primary)',
              marginBottom: '24px',
              margin: '0 0 24px 0',
            }}>快速操作</h2>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
              gap: '16px',
              marginBottom: '32px',
            }}>
              <Link to={`/projects/${project.id}/script`} style={{ textDecoration: 'none' }}>
                <Card style={{ padding: '20px', cursor: 'pointer', transition: 'all 0.2s ease' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: 'var(--gradient-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <FileText style={{ width: '20px', height: '20px', color: 'white' }} />
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
                      输入剧本
                    </div>
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--text-tertiary)', margin: 0 }}>
                    上传或编写剧本内容
                  </p>
                </Card>
              </Link>

              <Link to={`/projects/${project.id}/characters`} style={{ textDecoration: 'none' }}>
                <Card style={{ padding: '20px', cursor: 'pointer', transition: 'all 0.2s ease' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: 'var(--gradient-success)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Image style={{ width: '20px', height: '20px', color: 'white' }} />
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
                      管理角色
                    </div>
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--text-tertiary)', margin: 0 }}>
                    创建和管理角色形象
                  </p>
                </Card>
              </Link>

              <Link to={`/projects/${project.id}/members`} style={{ textDecoration: 'none' }}>
                <Card style={{ padding: '20px', cursor: 'pointer', transition: 'all 0.2s ease' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: 'var(--gradient-warning)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Users style={{ width: '20px', height: '20px', color: 'white' }} />
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
                      管理成员
                    </div>
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--text-tertiary)', margin: 0 }}>
                    管理项目成员和权限
                  </p>
                </Card>
              </Link>

              <Link to={`/projects/${project.id}/scenes`} style={{ textDecoration: 'none' }}>
                <Card style={{ padding: '20px', cursor: 'pointer', transition: 'all 0.2s ease' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: 'var(--gradient-warning)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <MapPin style={{ width: '20px', height: '20px', color: 'white' }} />
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
                      管理场景
                    </div>
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--text-tertiary)', margin: 0 }}>
                    创建和管理拍摄场景
                  </p>
                </Card>
              </Link>

              <Link to={`/projects/${project.id}/shots`} style={{ textDecoration: 'none' }}>
                <Card style={{ padding: '20px', cursor: 'pointer', transition: 'all 0.2s ease' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: 'var(--gradient-info)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <FolderKanban style={{ width: '20px', height: '20px', color: 'white' }} />
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
                      分镜管理
                    </div>
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--text-tertiary)', margin: 0 }}>
                    查看和编辑镜头列表
                  </p>
                </Card>
              </Link>

              <Link to={`/projects/${project.id}/assets`} style={{ textDecoration: 'none' }}>
                <Card style={{ padding: '20px', cursor: 'pointer', transition: 'all 0.2s ease' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: 'var(--gradient-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Image style={{ width: '20px', height: '20px', color: 'white' }} />
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
                      素材库
                    </div>
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--text-tertiary)', margin: 0 }}>
                    管理项目图片和视频素材
                  </p>
                </Card>
              </Link>

              <Link to={`/projects/${project.id}/image-generation`} style={{ textDecoration: 'none' }}>
                <Card style={{ padding: '20px', cursor: 'pointer', transition: 'all 0.2s ease' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: 'var(--gradient-error)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Sparkles style={{ width: '20px', height: '20px', color: 'white' }} />
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
                      AI 图像
                    </div>
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--text-tertiary)', margin: 0 }}>
                    AI 生成项目图片素材
                  </p>
                </Card>
              </Link>

              <Link to={`/projects/${project.id}/video-generation`} style={{ textDecoration: 'none' }}>
                <Card style={{ padding: '20px', cursor: 'pointer', transition: 'all 0.2s ease' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: 'var(--gradient-info)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Video style={{ width: '20px', height: '20px', color: 'white' }} />
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
                      AI 视频
                    </div>
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--text-tertiary)', margin: 0 }}>
                    AI 生成项目视频素材
                  </p>
                </Card>
              </Link>

              <Link to={`/projects/${project.id}/novels`} style={{ textDecoration: 'none' }}>
                <Card style={{ padding: '20px', cursor: 'pointer', transition: 'all 0.2s ease' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: 'var(--gradient-error)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <BookOpen style={{ width: '20px', height: '20px', color: 'white' }} />
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
                      输入小说
                    </div>
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--text-tertiary)', margin: 0 }}>
                    上传或编写小说内容
                  </p>
                </Card>
              </Link>

              <Card style={{ padding: '20px', cursor: 'pointer', transition: 'all 0.2s ease' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: 'var(--gradient-danger)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Download style={{ width: '20px', height: '20px', color: 'white' }} />
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
                    导出项目
                  </div>
                </div>
                <p style={{ fontSize: '14px', color: 'var(--text-tertiary)', margin: 0 }}>
                  导出项目数据或视频
                </p>
              </Card>
            </div>
          </div>
        </div>

        {showSettingsModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowSettingsModal(false)}
          >
            <Card style={{ 
              padding: '32px',
              maxWidth: '500px',
              width: '100%',
              margin: '24px',
            }}
            onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ 
                fontSize: '20px', 
                fontWeight: '700',
                color: 'var(--text-primary)',
                marginBottom: '24px',
              }}>项目设置</h2>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  marginBottom: '8px',
                }}>
                  项目名称
                </label>
                <Input
                  value={editingProject.name}
                  onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })}
                  placeholder="输入项目名称"
                />
              </div>
              
              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  marginBottom: '8px',
                }}>
                  项目描述
                </label>
                <textarea
                  value={editingProject.description}
                  onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                  placeholder="输入项目描述"
                  style={{
                    width: '100%',
                    minHeight: '100px',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-primary)',
                    backgroundColor: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    resize: 'vertical',
                  }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    height: '44px',
                    padding: '0 20px',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: '12px',
                    color: 'var(--text-secondary)',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                  }}
                  onClick={() => setShowSettingsModal(false)}
                >
                  取消
                </button>
                <button
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    height: '44px',
                    padding: '0 24px',
                    background: 'var(--gradient-primary)',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '14px',
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
                  onClick={async () => {
                    try {
                      await apiClient.updateProject(project!.id, {
                        name: editingProject.name,
                        description: editingProject.description,
                      });
                      setProject({ ...project!, name: editingProject.name, description: editingProject.description });
                      setShowSettingsModal(false);
                    } catch (error) {
                      console.error('Failed to update project:', error);
                    }
                  }}
                >
                  保存
                </button>
              </div>
            </Card>
          </div>
        )}

        {showDeleteModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowDeleteModal(false)}
          >
            <Card style={{ 
              padding: '32px',
              maxWidth: '448px',
              width: '100%',
              margin: '24px',
            }}
            onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ 
                fontSize: '20px', 
                fontWeight: '700',
                color: 'var(--text-primary)',
                marginBottom: '12px',
                margin: '0 0 12px 0',
              }}>确认删除项目</h2>
              <p style={{ 
                fontSize: '14px',
                color: 'var(--text-secondary)',
                marginBottom: '24px',
                lineHeight: '1.6',
              }}>
                您确定要删除项目"{project.name}"吗？此操作不可撤销，所有相关数据将被永久删除。
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    height: '44px',
                    padding: '0 20px',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: '12px',
                    color: 'var(--text-secondary)',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                  }}
                  onClick={() => setShowDeleteModal(false)}
                >
                  取消
                </button>
                <button
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    height: '44px',
                    padding: '0 20px',
                    backgroundColor: '#ef4444',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
                  }}
                  onClick={handleDeleteProject}
                >
                  <Trash2 style={{ width: '16px', height: '16px' }} />
                  删除项目
                </button>
              </div>
            </Card>
          </div>
        )}
    </div>
  );
}
