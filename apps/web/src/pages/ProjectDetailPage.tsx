import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Settings,
  Users,
  FolderKanban,
  Image,
  Trash2,
  Loader2,
  Play,
  FileText,
  BookOpen,
  MapPin,
  Tv,
  X,
} from 'lucide-react';
import { apiClient, Project } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const QuickActionCard = ({ 
  to, 
  icon, 
  label, 
  desc, 
  gradient, 
  shadow,
  onClick,
  isDark,
}: { 
  to?: string;
  icon: React.ReactNode;
  label: string;
  desc: string;
  gradient: string;
  shadow: string;
  onClick?: () => void;
  isDark: boolean;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const colors = isDark ? {
    bgCard: 'rgba(255, 255, 255, 0.04)',
    bgCardHover: 'rgba(255, 255, 255, 0.08)',
    border: 'rgba(255, 255, 255, 0.06)',
    textPrimary: '#fafafa',
    textMuted: 'rgba(250, 250, 250, 0.5)',
  } : {
    bgCard: 'rgba(255, 255, 255, 0.9)',
    bgCardHover: 'rgba(255, 255, 255, 1)',
    border: 'rgba(0, 0, 0, 0.06)',
    textPrimary: '#18181b',
    textMuted: 'rgba(24, 24, 27, 0.5)',
  };

  const content = (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '20px 24px',
        background: isHovered ? colors.bgCardHover : colors.bgCard,
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        border: `1px solid ${colors.border}`,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered ? shadow : 'none',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div style={{
        width: '52px',
        height: '52px',
        borderRadius: '14px',
        background: gradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: `0 4px 14px ${shadow.replace('0 8px 24px ', '')}`,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ 
          fontSize: '15px', 
          fontWeight: '600', 
          color: colors.textPrimary,
          marginBottom: '4px',
        }}>
          {label}
        </div>
        <div style={{ 
          fontSize: '13px', 
          color: colors.textMuted,
        }}>
          {desc}
        </div>
      </div>
    </div>
  );

  if (to) {
    return <Link to={to} style={{ textDecoration: 'none' }}>{content}</Link>;
  }
  return content;
};

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editingProject, setEditingProject] = useState({ name: '', description: '' });
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [backHover, setBackHover] = useState(false);
  const [settingsHover, setSettingsHover] = useState(false);
  const [deleteHover, setDeleteHover] = useState(false);
  const [createHover, setCreateHover] = useState(false);

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = screenWidth < 768;
  const isTablet = screenWidth >= 768 && screenWidth < 1024;

  const colors = isDark ? {
    bgPage: 'linear-gradient(180deg, #070d1f 0%, #0c1326 50%, #11192e 100%)',
    bgHeader: 'rgba(7, 13, 31, 0.8)',
    bgGlass: 'rgba(255, 255, 255, 0.04)',
    bgGlassHover: 'rgba(255, 255, 255, 0.08)',
    bgCard: 'rgba(255, 255, 255, 0.04)',
    bgHover: 'rgba(255, 255, 255, 0.06)',
    textPrimary: '#fafafa',
    textSecondary: 'rgba(250, 250, 250, 0.6)',
    textMuted: 'rgba(250, 250, 250, 0.4)',
    border: 'rgba(255, 255, 255, 0.06)',
    accent: '#8b5cf6',
    accentLight: '#a78bfa',
    glow: 'rgba(139, 92, 246, 0.12)',
    overlay: 'rgba(0, 0, 0, 0.7)',
  } : {
    bgPage: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
    bgHeader: 'rgba(255, 255, 255, 0.9)',
    bgGlass: 'rgba(0, 0, 0, 0.04)',
    bgGlassHover: 'rgba(0, 0, 0, 0.08)',
    bgCard: 'rgba(255, 255, 255, 0.9)',
    bgHover: 'rgba(0, 0, 0, 0.04)',
    textPrimary: '#18181b',
    textSecondary: 'rgba(24, 24, 27, 0.6)',
    textMuted: 'rgba(24, 24, 27, 0.4)',
    border: 'rgba(0, 0, 0, 0.06)',
    accent: '#7c3aed',
    accentLight: '#8b5cf6',
    glow: 'rgba(139, 92, 246, 0.08)',
    overlay: 'rgba(0, 0, 0, 0.5)',
  };

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

  const getProjectTypeGradient = (type: string) => {
    switch (type) {
      case 'SCRIPT': return 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)';
      case 'NOVEL': return 'linear-gradient(135deg, #ec63ff 0%, #f487ff 100%)';
      case 'MIXED': return 'linear-gradient(135deg, #34b5fa 0%, #81ccff 100%)';
      default: return 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)';
    }
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: colors.bgPage,
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '400px',
          height: '400px',
          background: `radial-gradient(ellipse at center, ${colors.glow} 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '24px',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 8px 24px rgba(139, 92, 246, 0.4)',
          }}>
            <Loader2 style={{ width: '36px', height: '36px', color: 'white', animation: 'spin 1s linear infinite' }} />
          </div>
          <p style={{ color: colors.textMuted, fontSize: '16px', fontFamily: 'Manrope, sans-serif' }}>加载项目中...</p>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: colors.bgPage,
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        position: 'relative',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '28px',
            background: colors.bgGlass,
            border: `1px solid ${colors.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            <FolderKanban style={{ width: '48px', height: '48px', color: colors.textMuted }} />
          </div>
          <p style={{ color: colors.textMuted, fontSize: '18px', marginBottom: '24px', fontFamily: 'Manrope, sans-serif' }}>项目不存在</p>
          <button
            onClick={() => navigate('/projects')}
            style={{
              padding: '14px 28px',
              borderRadius: '14px',
              border: 'none',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              fontFamily: 'Manrope, sans-serif',
              boxShadow: '0 8px 24px rgba(139, 92, 246, 0.3)',
            }}
          >
            返回项目列表
          </button>
        </div>
      </div>
    );
  }

  const isOwner = project.owner_id === user?.id;

  const quickActions = [
    { to: `/projects/${project.id}/editor`, icon: FileText, label: '内容创作', desc: '剧本和小说统一编辑', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)', shadow: '0 8px 24px rgba(139, 92, 246, 0.3)' },
    { to: `/projects/${project.id}/characters`, icon: Image, label: '管理角色', desc: '创建和管理角色形象', gradient: 'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)', shadow: '0 8px 24px rgba(6, 182, 212, 0.3)' },
    { to: `/projects/${project.id}/members`, icon: Users, label: '管理成员', desc: '管理项目成员和权限', gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)', shadow: '0 8px 24px rgba(245, 158, 11, 0.3)' },
    { to: `/projects/${project.id}/scenes`, icon: MapPin, label: '管理场景', desc: '创建和管理拍摄场景', gradient: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)', shadow: '0 8px 24px rgba(236, 72, 153, 0.3)' },
    { to: `/projects/${project.id}/shots`, icon: Tv, label: '分镜管理', desc: '剧集 - 场景 - 分镜三层管理', gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', shadow: '0 8px 24px rgba(99, 102, 241, 0.3)' },
    { to: `/projects/${project.id}/outline`, icon: BookOpen, label: '生成大纲', desc: 'AI 智能生成剧情大纲', gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)', shadow: '0 8px 24px rgba(16, 185, 129, 0.3)' },
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: colors.bgPage,
      fontFamily: 'Manrope, sans-serif',
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: '20%',
        width: '60%',
        height: '500px',
        background: `radial-gradient(ellipse at center, ${colors.glow} 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      <header style={{
        position: 'sticky',
        top: 0,
        height: '80px',
        background: colors.bgHeader,
        backdropFilter: 'blur(40px)',
        borderBottom: `1px solid ${colors.border}`,
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link 
            to="/projects" 
            style={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '44px',
              height: '44px',
              borderRadius: '14px',
              textDecoration: 'none',
              color: backHover ? colors.accent : colors.textMuted,
              backgroundColor: backHover ? `${colors.accent}15` : colors.bgGlass,
              border: `1px solid ${backHover ? `${colors.accent}30` : colors.border}`,
              transition: 'all 0.3s ease',
              transform: backHover ? 'translateX(-2px)' : 'translateX(0)',
            }}
            onMouseEnter={() => setBackHover(true)}
            onMouseLeave={() => setBackHover(false)}
          >
            <ArrowLeft style={{ width: '20px', height: '20px' }} />
          </Link>
          <div>
            <h1 style={{ 
              fontSize: '20px', 
              fontWeight: '700',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: colors.textPrimary,
              margin: 0,
              letterSpacing: '-0.02em',
            }}>{project.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: colors.textMuted, marginTop: '4px' }}>
              <span style={{ 
                padding: '3px 10px', 
                borderRadius: '8px', 
                background: getProjectTypeGradient(project.type),
                color: 'white',
                fontWeight: '600',
                fontSize: '11px',
                letterSpacing: '0.02em',
              }}>
                {getProjectTypeLabel(project.type)}
              </span>
              <span>创建于 {formatDate(project.created_at)}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                  padding: '10px 18px',
                  borderRadius: '14px',
                  border: `1px solid ${settingsHover ? colors.accent : colors.border}`,
                  background: settingsHover ? `${colors.accent}15` : 'transparent',
                  color: settingsHover ? colors.accent : colors.textSecondary,
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={() => setSettingsHover(true)}
                onMouseLeave={() => setSettingsHover(false)}
              >
                <Settings style={{ width: '16px', height: '16px' }} />
                {!isMobile && '项目设置'}
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  borderRadius: '14px',
                  border: `1px solid ${deleteHover ? '#ef4444' : colors.border}`,
                  background: deleteHover ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                  color: deleteHover ? '#ef4444' : colors.textSecondary,
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={() => setDeleteHover(true)}
                onMouseLeave={() => setDeleteHover(false)}
              >
                <Trash2 style={{ width: '16px', height: '16px' }} />
                {!isMobile && '删除'}
              </button>
            </>
          )}
          <button
            onClick={() => navigate(`/projects/${id}/script`)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              borderRadius: '14px',
              border: 'none',
              background: createHover 
                ? 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)'
                : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: createHover 
                ? '0 12px 32px rgba(139, 92, 246, 0.5)'
                : '0 8px 24px rgba(139, 92, 246, 0.3)',
              transform: createHover ? 'translateY(-2px)' : 'translateY(0)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={() => setCreateHover(true)}
            onMouseLeave={() => setCreateHover(false)}
          >
            <Play style={{ width: '16px', height: '16px' }} />
            开始创作
          </button>
        </div>
      </header>

      <main style={{ 
        padding: isMobile ? '24px 16px' : '48px 32px',
        maxWidth: '1200px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr' : '1.5fr 1fr', 
          gap: '24px', 
          marginBottom: '48px' 
        }}>
          <div style={{
            background: colors.bgCard,
            borderRadius: '24px',
            border: `1px solid ${colors.border}`,
            padding: isMobile ? '24px' : '32px',
            backdropFilter: 'blur(20px)',
          }}>
            <h2 style={{ 
              fontSize: '12px', 
              fontWeight: '600',
              color: colors.textMuted,
              marginBottom: '16px',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}>项目描述</h2>
            <p style={{ 
              fontSize: '15px',
              color: colors.textSecondary,
              lineHeight: '1.7',
              margin: 0,
              whiteSpace: 'pre-wrap',
            }}>
              {project.description || '暂无描述，点击"项目设置"添加项目描述...'}
            </p>
          </div>

          <div style={{
            background: colors.bgCard,
            borderRadius: '24px',
            border: `1px solid ${colors.border}`,
            padding: isMobile ? '24px' : '32px',
            backdropFilter: 'blur(20px)',
          }}>
            <h2 style={{ 
              fontSize: '12px', 
              fontWeight: '600',
              color: colors.textMuted,
              marginBottom: '20px',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}>项目信息</h2>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                fontWeight: '700',
                color: 'white',
                boxShadow: '0 4px 14px rgba(139, 92, 246, 0.4)',
              }}>
                {project.owner?.name?.charAt(0) || project.owner?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: '600', color: colors.textPrimary }}>
                  {project.owner?.name || project.owner?.email}
                </div>
                <div style={{ fontSize: '13px', color: colors.textMuted }}>项目所有者</div>
              </div>
            </div>

            <div style={{ height: '1px', background: colors.border, margin: '24px 0' }} />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <div style={{ 
                padding: '18px', 
                background: colors.bgHover, 
                borderRadius: '16px',
                textAlign: 'center',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '10px' }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(139, 92, 246, 0.4)',
                  }}>
                    <Users style={{ width: '14px', height: '14px', color: 'white' }} />
                  </div>
                </div>
                <div style={{ fontSize: '32px', fontWeight: '700', color: colors.textPrimary, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {project._count?.members || 1}
                </div>
                <div style={{ fontSize: '11px', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>成员</div>
              </div>
              <div style={{ 
                padding: '18px', 
                background: colors.bgHover, 
                borderRadius: '16px',
                textAlign: 'center',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '10px' }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)',
                  }}>
                    <Image style={{ width: '14px', height: '14px', color: 'white' }} />
                  </div>
                </div>
                <div style={{ fontSize: '32px', fontWeight: '700', color: colors.textPrimary, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {project._count?.characters || 0}
                </div>
                <div style={{ fontSize: '11px', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>角色</div>
              </div>
              <div style={{ 
                padding: '18px', 
                background: colors.bgHover, 
                borderRadius: '16px',
                textAlign: 'center',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '10px' }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(249, 115, 22, 0.4)',
                  }}>
                    <FileText style={{ width: '14px', height: '14px', color: 'white' }} />
                  </div>
                </div>
                <div style={{ fontSize: '32px', fontWeight: '700', color: colors.textPrimary, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {project._count?.shots || 0}
                </div>
                <div style={{ fontSize: '11px', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>镜头</div>
              </div>
            </div>
          </div>
        </div>

        <h2 style={{ 
          fontSize: '14px', 
          fontWeight: '600',
          color: colors.textMuted,
          marginBottom: '20px',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
        }}>快速操作</h2>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(280px, 1fr))', 
          gap: '16px',
        }}>
          {quickActions.map((action) => (
            <QuickActionCard
              key={action.to}
              to={action.to}
              icon={<action.icon style={{ width: '22px', height: '22px', color: 'white' }} />}
              label={action.label}
              desc={action.desc}
              gradient={action.gradient}
              shadow={action.shadow}
              isDark={isDark}
            />
          ))}
        </div>
      </main>

      {showSettingsModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: colors.overlay,
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
              background: isDark ? 'rgba(15, 15, 26, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              borderRadius: '24px',
              border: `1px solid ${colors.border}`,
              backdropFilter: 'blur(20px)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(139, 92, 246, 0.4)',
                }}>
                  <Settings style={{ width: '24px', height: '24px', color: 'white' }} />
                </div>
                <h2 style={{ 
                  fontSize: '20px', 
                  fontWeight: '700',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  color: colors.textPrimary,
                  margin: 0,
                }}>项目设置</h2>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  border: `1px solid ${colors.border}`,
                  background: 'transparent',
                  color: colors.textMuted,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                }}
              >
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ 
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: colors.textMuted,
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
                  borderRadius: '14px',
                  border: `1px solid ${colors.border}`,
                  background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
                  color: colors.textPrimary,
                  fontSize: '15px',
                  fontFamily: 'Manrope, sans-serif',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = colors.accent;
                  e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.accent}15`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = colors.border;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>
            
            <div style={{ marginBottom: '32px' }}>
              <label style={{ 
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: colors.textMuted,
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
                  borderRadius: '14px',
                  border: `1px solid ${colors.border}`,
                  background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
                  color: colors.textPrimary,
                  fontSize: '15px',
                  fontFamily: 'Manrope, sans-serif',
                  resize: 'vertical',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  lineHeight: '1.6',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = colors.accent;
                  e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.accent}15`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = colors.border;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowSettingsModal(false)}
                style={{
                  flex: 1,
                  padding: '14px 24px',
                  borderRadius: '14px',
                  border: `1px solid ${colors.border}`,
                  background: 'transparent',
                  color: colors.textSecondary,
                  fontSize: '14px',
                  fontWeight: '600',
                  fontFamily: 'Manrope, sans-serif',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                取消
              </button>
              <button
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
                style={{
                  flex: 1,
                  padding: '14px 24px',
                  borderRadius: '14px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  fontFamily: 'Manrope, sans-serif',
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(139, 92, 246, 0.3)',
                  transition: 'all 0.2s ease',
                }}
              >
                保存更改
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: colors.overlay,
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
              background: isDark ? 'rgba(15, 15, 26, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              borderRadius: '24px',
              border: `1px solid ${colors.border}`,
              backdropFilter: 'blur(20px)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)',
              }}>
                <Trash2 style={{ width: '24px', height: '24px', color: 'white' }} />
              </div>
              <h2 style={{ 
                fontSize: '20px', 
                fontWeight: '700',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: colors.textPrimary,
                margin: 0,
              }}>确认删除</h2>
            </div>
            
            <p style={{ 
              fontSize: '15px',
              color: colors.textSecondary,
              marginBottom: '32px',
              lineHeight: '1.6',
            }}>
              您确定要删除项目 <span style={{ color: colors.textPrimary, fontWeight: '600' }}>"{project.name}"</span> 吗？此操作不可撤销，所有相关数据将被永久删除。
            </p>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{
                  flex: 1,
                  padding: '14px 24px',
                  borderRadius: '14px',
                  border: `1px solid ${colors.border}`,
                  background: 'transparent',
                  color: colors.textSecondary,
                  fontSize: '14px',
                  fontWeight: '600',
                  fontFamily: 'Manrope, sans-serif',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                取消
              </button>
              <button
                onClick={handleDeleteProject}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '14px 24px',
                  borderRadius: '14px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  fontFamily: 'Manrope, sans-serif',
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(239, 68, 68, 0.3)',
                  transition: 'all 0.2s ease',
                }}
              >
                <Trash2 style={{ width: '16px', height: '16px' }} />
                删除项目
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
