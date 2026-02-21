import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Zap, Layers, BarChart3, Sun, Moon, Users, FileText, Play } from 'lucide-react';

export default function HomePage() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const features = [
    {
      Icon: Sparkles,
      name: 'AI 驱动创作',
      description: '利用先进AI技术，从剧本到视频，全程智能辅助',
      href: '/projects',
    },
    {
      Icon: FileText,
      name: '剧本/小说输入',
      description: '支持多种输入方式，灵活适配您的创作流程',
      href: '/projects',
    },
    {
      Icon: Users,
      name: '角色一致性',
      description: '强大的角色管理系统，确保视觉高度一致',
      href: '/projects',
    },
    {
      Icon: Layers,
      name: '分镜管理',
      description: '专业的镜头规划和九宫格预览',
      href: '/projects',
    },
    {
      Icon: Zap,
      name: '批量生成',
      description: '高效的图像和视频批量生成能力',
      href: '/projects',
    },
    {
      Icon: BarChart3,
      name: '数据可视化',
      description: '清晰的项目进度和资产视图',
      href: '/projects',
    },
  ];

  const getCardStyle = (theme: string) => ({
    display: 'flex' as const,
    flexDirection: 'column' as const,
    padding: '24px',
    backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
    border: '2px solid ' + (theme === 'dark' ? '#333333' : '#e5e7eb'),
    borderRadius: '16px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease-out',
    minHeight: '200px',
    cursor: 'pointer',
    textDecoration: 'none' as const,
  });

  const getIconContainerStyle = () => ({
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    width: '56px',
    height: '56px',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    marginBottom: '16px',
  });

  const getGridStyle = () => ({
    display: 'grid' as const,
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
  });

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: theme === 'dark' ? '#000000' : '#ffffff',
      position: 'relative',
    }}>
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid ' + (theme === 'dark' ? '#222222' : '#e5e5eb'),
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
            <div style={{
              width: '36px',
              height: '36px',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              borderRadius: '9px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Sparkles style={{ width: '20px', height: '20px', color: 'white' }} />
            </div>
            <span style={{
              fontSize: '20px',
              fontWeight: '700',
              color: theme === 'dark' ? '#ffffff' : '#000000',
              letterSpacing: '-0.5px',
            }}>开演AI</span>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              onClick={toggleTheme}
              style={{
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                background: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              {theme === 'dark' ? <Sun style={{ width: '20px', height: '20px', color: '#ffffff' }} /> : <Moon style={{ width: '20px', height: '20px', color: '#000000' }} />}
            </button>
            <button 
              onClick={() => navigate('/projects')}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: '600',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                color: '#ffffff',
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(99, 102, 241, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(99, 102, 241, 0.3)';
              }}
            >
              开始创作
            </button>
          </div>
        </div>
      </nav>

      <section style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '120px 24px',
      }}>
        <div style={{ textAlign: 'center', maxWidth: '800px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '9999px',
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            color: '#6366f1',
            fontSize: '13px',
            fontWeight: '500',
            marginBottom: '32px',
          }}>
            <Sparkles style={{ width: '16px', height: '16px' }} />
            AI 内容创作平台
          </div>

          <h1 style={{
            fontSize: 'clamp(48px, 6vw, 64px)',
            fontWeight: '800',
            color: theme === 'dark' ? '#ffffff' : '#000000',
            marginBottom: '24px',
            letterSpacing: '-2px',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            开演AI
          </h1>

          <p style={{
            fontSize: '18px',
            color: theme === 'dark' ? '#a1a1aa' : '#666666',
            lineHeight: '1.7',
            marginBottom: '48px',
            maxWidth: '560px',
          }}>
            从剧本到视频的完整创作工作流，让AI成为您的创作伙伴
          </p>

          <a 
            href="/projects" 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '16px 32px',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)',
              transition: 'all 0.3s ease',
              textDecoration: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(99, 102, 241, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(99, 102, 241, 0.3)';
            }}
          >
            <Play style={{ width: '20px', height: '20px' }} />
            立即开始
          </a>
        </div>
      </section>

      <section style={{
        padding: '80px 24px',
        borderTop: '1px solid ' + (theme === 'dark' ? '#222222' : '#e5e5eb'),
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: theme === 'dark' ? '#666666' : '#999999',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            marginBottom: '32px',
            textAlign: 'center',
          }}>
            核心功能
          </h2>
          
          <div style={getGridStyle()}>
            {features.map((feature) => (
              <a
                key={feature.name}
                href={feature.href}
                style={getCardStyle(theme)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = '#6366f1';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(99, 102, 241, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = theme === 'dark' ? '#333333' : '#e5e7eb';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                }}
              >
                <div style={getIconContainerStyle()}>
                  <feature.Icon style={{ width: '28px', height: '28px', color: 'white' }} />
                </div>
                <div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: theme === 'dark' ? '#ffffff' : '#000000',
                    marginBottom: '8px',
                    margin: 0,
                  }}>{feature.name}</h3>
                  <p style={{
                    fontSize: '14px',
                    color: theme === 'dark' ? '#888888' : '#666666',
                    lineHeight: '1.6',
                    margin: 0,
                  }}>{feature.description}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <footer style={{
        padding: '32px 24px',
        borderTop: '1px solid ' + (theme === 'dark' ? '#222222' : '#e5e5eb'),
        textAlign: 'center',
      }}>
        <p style={{
          fontSize: '14px',
          color: theme === 'dark' ? '#666666' : '#999999',
          margin: 0,
        }}>
          © 2025 开演AI. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
