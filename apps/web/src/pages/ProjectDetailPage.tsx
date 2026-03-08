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
  MapPin,
  Calendar,
  TrendingUp,
  Clock
} from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import { GlassActionButton } from '../components/ui/GlassActionButton';
import { QuickActionCard } from '../components/QuickActionCard';
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
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = screenWidth < 768;
  const isTablet = screenWidth >= 768 && screenWidth < 1024;

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

  const formatDate = (date: Date | string | undefined | null) => {
    if (!date) return '未知';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return '未知';
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
      <div style={{ 
        minHeight: '100vh', 
        background: 'var(--bg-page)',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'var(--gradient-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 0 40px var(--accent-shadow)',
          }}>
            <Loader2 style={{ width: '32px', height: '32px', color: 'white', animation: 'spin 1s linear infinite' }} />
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>加载项目中...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'var(--bg-page)',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'var(--bg-hover)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            <FolderKanban style={{ width: '40px', height: '40px', color: 'var(--text-muted)' }} />
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '18px', marginBottom: '24px' }}>项目不存在</p>
          <GlassActionButton variant="primary" onClick={() => navigate('/projects')}>
            返回项目列表
          </GlassActionButton>
        </div>
      </div>
    );
  }

  const isOwner = project.owner_id === user?.id;

  const quickActions = [
    { to: `/projects/${project.id}/editor`, icon: FileText, label: '内容创作', desc: '剧本和小说统一编辑', gradient: 'var(--gradient-primary)', shadow: 'var(--accent-shadow)' },
    { to: `/projects/${project.id}/characters`, icon: Image, label: '管理角色', desc: '创建和管理角色形象', gradient: 'var(--gradient-secondary)', shadow: 'var(--success-shadow)' },
    { to: `/projects/${project.id}/members`, icon: Users, label: '管理成员', desc: '管理项目成员和权限', gradient: 'var(--gradient-accent)', shadow: 'var(--warning-shadow)' },
    { to: `/projects/${project.id}/scenes`, icon: MapPin, label: '管理场景', desc: '创建和管理拍摄场景', gradient: 'var(--gradient-pink)', shadow: 'var(--error-shadow)' },
    { to: `/projects/${project.id}/shots`, icon: FolderKanban, label: '分镜管理', desc: '查看和编辑镜头列表', gradient: 'var(--gradient-teal)', shadow: 'var(--info-shadow)' },
    { to: `/projects/${project.id}/outline`, icon: BookOpen, label: '生成大纲', desc: 'AI智能生成剧情大纲', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)', shadow: '0 8px 24px rgba(139, 92, 246, 0.3)' },
  ];

  return (
    <div style={{ 
      flex: 1, 
      display: 'flex', 
      flexDirection: 'column', 
      background: 'var(--bg-page)',
      minHeight: '100vh',
    }}>
      <header style={{
        height: isMobile ? '64px' : '80px',
        backgroundColor: 'var(--bg-header)',
        backdropFilter: 'var(--glass-blur)',
        borderBottom: '1px solid var(--border-primary)',
        padding: `0 ${isMobile ? '16px' : '32px'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '12px' : '16px' }}>
          <Link 
            to="/projects" 
            style={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              textDecoration: 'none',
              color: 'var(--text-tertiary)',
              transition: 'all 0.2s ease',
              backgroundColor: 'var(--bg-hover)',
              border: '1px solid var(--border-primary)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--nav-hover-bg)';
              e.currentTarget.style.color = 'var(--text-primary)';
              e.currentTarget.style.transform = 'translateX(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
              e.currentTarget.style.color = 'var(--text-tertiary)';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
            <ArrowLeft style={{ width: '20px', height: '20px' }} />
          </Link>
          <div>
            <h1 style={{ 
              fontSize: isMobile ? '18px' : '22px', 
              fontWeight: '600',
              color: 'var(--text-primary)',
              margin: 0,
              letterSpacing: '-0.02em',
            }}>{project.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              <span style={{ 
                padding: '2px 8px', 
                borderRadius: '6px', 
                background: 'var(--gradient-primary)',
                color: 'white',
                fontWeight: '500',
                fontSize: '11px',
              }}>
                {getProjectTypeLabel(project.type)}
              </span>
              <span style={{ display: isMobile ? 'none' : 'inline', opacity: 0.7 }}>创建于 {formatDate(project.created_at)}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '12px' }}>
          {isOwner && (
            <>
              <GlassActionButton
                onClick={() => {
                  setEditingProject({ 
                    name: project.name, 
                    description: (project as any).description || '' 
                  });
                  setShowSettingsModal(true);
                }}
                variant="default"
                icon={<Settings size={16} />}
              >
                {!isMobile && '项目设置'}
              </GlassActionButton>
              <GlassActionButton
                onClick={() => setShowDeleteModal(true)}
                variant="danger"
                icon={<Trash2 size={16} />}
              >
                {!isMobile && '删除'}
              </GlassActionButton>
            </>
          )}
          <GlassActionButton
            onClick={() => navigate(`/projects/${id}/script`)}
            variant="primary"
            icon={<Play size={16} />}
          >
            开始创作
          </GlassActionButton>
        </div>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '16px' : '32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Breadcrumb items={[
            { label: '首页', path: '/' },
            { label: '我的项目', path: '/projects' },
            { label: project.name },
          ]} />
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr' : '1.5fr 1fr', 
            gap: isMobile ? '16px' : '24px', 
            marginBottom: '32px' 
          }}>
            <div style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-primary)',
              padding: isMobile ? '20px' : '28px',
              backdropFilter: 'var(--glass-blur)',
            }}>
              <h2 style={{ 
                fontSize: '14px', 
                fontWeight: '600',
                color: 'var(--text-muted)',
                marginBottom: '16px',
                margin: '0 0 16px 0',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>项目描述</h2>
              <p style={{ 
                fontSize: '15px',
                color: 'var(--text-secondary)',
                lineHeight: '1.7',
                margin: 0,
                whiteSpace: 'pre-wrap',
              }}>
                {project.description || '暂无描述，点击"项目设置"添加项目描述...'}
              </p>
            </div>

            <div style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-primary)',
              padding: isMobile ? '20px' : '28px',
              backdropFilter: 'var(--glass-blur)',
            }}>
              <h2 style={{ 
                fontSize: '14px', 
                fontWeight: '600',
                color: 'var(--text-muted)',
                marginBottom: '20px',
                margin: '0 0 20px 0',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>项目信息</h2>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  background: 'var(--gradient-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  fontWeight: '600',
                  color: 'white',
                  boxShadow: '0 4px 14px var(--accent-shadow)',
                }}>
                  {project.owner?.name?.charAt(0) || project.owner?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>
                    {project.owner?.name || project.owner?.email}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>项目所有者</div>
                </div>
              </div>

              <div style={{ height: '1px', background: 'var(--border-secondary)', margin: '20px 0' }} />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div style={{ 
                  padding: '16px', 
                  background: 'var(--bg-hover)', 
                  borderRadius: '14px',
                  textAlign: 'center',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '8px' }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(139, 92, 246, 0.4)',
                    }}>
                      <Users style={{ width: '14px', height: '14px', color: 'white' }} />
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>成员</span>
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)' }}>
                    {project._count?.members || 1}
                  </div>
                </div>
                <div style={{ 
                  padding: '16px', 
                  background: 'var(--bg-hover)', 
                  borderRadius: '14px',
                  textAlign: 'center',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '8px' }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)',
                    }}>
                      <Image style={{ width: '14px', height: '14px', color: 'white' }} />
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>角色</span>
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)' }}>
                    {project._count?.characters || 0}
                  </div>
                </div>
                <div style={{ 
                  padding: '16px', 
                  background: 'var(--bg-hover)', 
                  borderRadius: '14px',
                  textAlign: 'center',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '8px' }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(249, 115, 22, 0.4)',
                    }}>
                      <FileText style={{ width: '14px', height: '14px', color: 'white' }} />
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>镜头</span>
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)' }}>
                    {project._count?.shots || 0}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <h2 style={{ 
            fontSize: '18px', 
            fontWeight: '600',
            color: 'var(--text-primary)',
            marginBottom: '20px',
            margin: '0 0 20px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <span style={{
              width: '4px',
              height: '20px',
              background: 'var(--gradient-primary)',
              borderRadius: '2px',
            }} />
            快速操作
          </h2>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(280px, 1fr))', 
            gap: isMobile ? '12px' : '16px',
            marginBottom: '32px',
          }}>
            {quickActions.map((action, index) => (
              <QuickActionCard
                key={action.to}
                to={action.to}
                icon={<action.icon style={{ width: '22px', height: '22px', color: 'white' }} />}
                label={action.label}
                desc={action.desc}
                gradient={action.gradient}
                shadow={action.shadow}
              />
            ))}

            <QuickActionCard
              icon={<Download style={{ width: '22px', height: '22px', color: 'white' }} />}
              label="导出项目"
              desc="导出项目数据或视频"
              gradient="var(--gradient-gray)"
              shadow="var(--shadow-md)"
              onClick={() => {}}
            />
          </div>
        </div>
      </div>

      {showSettingsModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'var(--overlay-heavy)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px',
        }}
        onClick={() => setShowSettingsModal(false)}
        >
          <div 
            style={{ 
              padding: isMobile ? '28px' : '36px',
              maxWidth: '480px',
              width: '100%',
              background: 'var(--bg-elevated)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-primary)',
              backdropFilter: 'var(--glass-blur)',
              animation: 'modalIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: 'var(--gradient-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px var(--accent-shadow)',
              }}>
                <Settings style={{ width: '24px', height: '24px', color: 'white' }} />
              </div>
              <h2 style={{ 
                fontSize: '22px', 
                fontWeight: '600',
                color: 'var(--text-primary)',
                margin: 0,
              }}>项目设置</h2>
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ 
                display: 'block',
                fontSize: '13px',
                fontWeight: '500',
                color: 'var(--text-muted)',
                marginBottom: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                项目名称
              </label>
              <input
                type="text"
                value={editingProject.name}
                onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })}
                placeholder="输入项目名称"
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--input-border)',
                  background: 'var(--input-bg)',
                  color: 'var(--text-primary)',
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                }}
              />
            </div>
            
            <div style={{ marginBottom: '32px' }}>
              <label style={{ 
                display: 'block',
                fontSize: '13px',
                fontWeight: '500',
                color: 'var(--text-muted)',
                marginBottom: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                项目描述
              </label>
              <textarea
                value={editingProject.description}
                onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                placeholder="输入项目描述"
                style={{
                  width: '100%',
                  minHeight: '120px',
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--input-border)',
                  background: 'var(--input-bg)',
                  color: 'var(--text-primary)',
                  fontSize: '15px',
                  resize: 'vertical',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit',
                  lineHeight: '1.6',
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
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <GlassActionButton
                onClick={() => setShowSettingsModal(false)}
                variant="default"
                style={{ flex: 1 }}
              >
                取消
              </GlassActionButton>
              <GlassActionButton
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
                variant="primary"
                style={{ flex: 1 }}
              >
                保存更改
              </GlassActionButton>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'var(--overlay-heavy)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px',
        }}
        onClick={() => setShowDeleteModal(false)}
        >
          <div 
            style={{ 
              padding: isMobile ? '28px' : '36px',
              maxWidth: '420px',
              width: '100%',
              background: 'var(--bg-elevated)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-primary)',
              backdropFilter: 'var(--glass-blur)',
              animation: 'modalIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: 'var(--btn-danger-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px var(--btn-danger-shadow)',
              }}>
                <Trash2 style={{ width: '24px', height: '24px', color: 'white' }} />
              </div>
              <h2 style={{ 
                fontSize: '22px', 
                fontWeight: '600',
                color: 'var(--text-primary)',
                margin: 0,
              }}>确认删除</h2>
            </div>
            
            <p style={{ 
              fontSize: '15px',
              color: 'var(--text-secondary)',
              marginBottom: '32px',
              lineHeight: '1.6',
            }}>
              您确定要删除项目 <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>"{project.name}"</span> 吗？此操作不可撤销，所有相关数据将被永久删除。
            </p>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <GlassActionButton
                onClick={() => setShowDeleteModal(false)}
                variant="default"
                style={{ flex: 1 }}
              >
                取消
              </GlassActionButton>
              <GlassActionButton
                onClick={handleDeleteProject}
                variant="danger"
                style={{ flex: 1 }}
                icon={<Trash2 size={16} />}
              >
                删除项目
              </GlassActionButton>
            </div>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes modalIn {
            from {
              opacity: 0;
              transform: scale(0.95) translateY(10px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}
