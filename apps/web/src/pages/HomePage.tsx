import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  Sparkles, 
  FileText, 
  Users, 
  LayoutGrid, 
  Zap, 
  BarChart3,
  ArrowRight,
  Play,
  Star,
  Globe,
  Shield,
  Clock,
  Check,
  ChevronRight
} from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const [ctaHover, setCtaHover] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const features = [
    {
      name: 'AI 驱动创作',
      description: '从剧本到视频，全程智能辅助，让创作更高效',
      icon: Sparkles,
    },
    {
      name: '剧本/小说输入',
      description: '支持多种输入方式，灵活适配您的创作流程',
      icon: FileText,
    },
    {
      name: '角色一致性',
      description: '强大的角色管理系统，确保视觉高度一致',
      icon: Users,
    },
    {
      name: '分镜管理',
      description: '专业的镜头规划和九宫格预览',
      icon: LayoutGrid,
    },
    {
      name: '批量生成',
      description: '高效的图像和视频批量生成能力',
      icon: Zap,
    },
    {
      name: '数据可视化',
      description: '清晰的项目进度和资产视图',
      icon: BarChart3,
    },
  ];

  const stats = [
    { value: '100K+', label: '活跃用户' },
    { value: '500K+', label: '创作项目' },
    { value: '10M+', label: '生成内容' },
    { value: '99.9%', label: '服务可用率' },
  ];

  const steps = [
    { num: '01', title: '输入内容', desc: '导入剧本或小说文本' },
    { num: '02', title: 'AI 分析', desc: '智能理解内容结构' },
    { num: '03', title: '生成素材', desc: '一键生成角色和场景' },
    { num: '04', title: '导出成品', desc: '输出视频或图文内容' },
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#000000',
      color: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      {/* Navigation */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '72px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 48px',
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Sparkles size={18} color="#fff" />
          </div>
          <span style={{ fontSize: '18px', fontWeight: 600, letterSpacing: '-0.02em' }}>
            开演AI
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          {['功能', '定价', '关于'].map((item) => (
            <a 
              key={item}
              href="#"
              style={{
                color: '#a1a1aa',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 500,
                transition: 'color 0.2s',
              }}
            >
              {item}
            </a>
          ))}
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '10px 20px',
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            登录
          </button>
          <button
            onClick={() => navigate('/register')}
            style={{
              padding: '10px 20px',
              background: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              color: '#000000',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            免费试用
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '120px 24px 80px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Animated background */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99, 102, 241, 0.15), transparent)',
        }} />
        
        {/* Grid pattern */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
        }} />

        {/* Glow effects */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, transparent 70%)',
          filter: 'blur(80px)',
          animation: 'float 8s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '10%',
          right: '10%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'float 10s ease-in-out infinite reverse',
        }} />

        <div style={{ 
          textAlign: 'center', 
          maxWidth: '800px', 
          position: 'relative', 
          zIndex: 1,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '100px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#a1a1aa',
            fontSize: '13px',
            fontWeight: 500,
            marginBottom: '40px',
            backdropFilter: 'blur(10px)',
          }}>
            <Sparkles size={14} style={{ color: '#6366f1' }} />
            <span>AI 内容创作平台</span>
            <ChevronRight size={14} />
          </div>

          <h1 style={{
            fontSize: 'clamp(48px, 8vw, 72px)',
            fontWeight: 700,
            marginBottom: '24px',
            lineHeight: 1.1,
            letterSpacing: '-0.04em',
            background: 'linear-gradient(180deg, #ffffff 0%, #a1a1aa 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            AI 驱动创意
          </h1>

          <p style={{
            fontSize: 'clamp(16px, 1.5vw, 20px)',
            color: '#71717a',
            lineHeight: 1.7,
            marginBottom: '48px',
            maxWidth: '560px',
            margin: '0 auto 48px',
          }}>
            从剧本到视频的完整创作工作流，让 AI 成为您的创作伙伴
          </p>

          <div style={{ 
            display: 'flex', 
            gap: '16px', 
            justifyContent: 'center', 
            flexWrap: 'wrap' 
          }}>
            <button
              onClick={() => navigate('/register')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 28px',
                fontSize: '15px',
                fontWeight: 600,
                borderRadius: '10px',
                border: 'none',
                background: '#ffffff',
                color: '#000000',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={() => setCtaHover(true)}
              onMouseLeave={() => setCtaHover(false)}
            >
              免费开始
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate('/projects')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 28px',
                fontSize: '15px',
                fontWeight: 500,
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                background: 'transparent',
                color: '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <Play size={16} />
              查看演示
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '48px',
          marginTop: '100px',
          padding: '32px 48px',
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          backdropFilter: 'blur(20px)',
        }}>
          {stats.map((stat, index) => (
            <div key={index} style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '36px', 
                fontWeight: 700, 
                color: '#ffffff',
                letterSpacing: '-0.02em',
                marginBottom: '4px',
              }}>
                {stat.value}
              </div>
              <div style={{ 
                fontSize: '14px', 
                color: '#71717a',
                fontWeight: 500,
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{
        padding: '120px 24px',
        background: 'linear-gradient(180deg, transparent 0%, rgba(99, 102, 241, 0.03) 100%)',
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{
              fontSize: '40px',
              fontWeight: 600,
              color: '#ffffff',
              marginBottom: '16px',
              letterSpacing: '-0.02em',
            }}>
              工作流程
            </h2>
            <p style={{
              fontSize: '16px',
              color: '#71717a',
            }}>
              简单的四步流程，快速生成专业内容
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '24px',
          }}>
            {steps.map((step, index) => (
              <div 
                key={index}
                style={{
                  padding: '32px 24px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '16px',
                  position: 'relative',
                }}
              >
                <div style={{
                  fontSize: '48px',
                  fontWeight: 700,
                  color: 'rgba(99, 102, 241, 0.3)',
                  letterSpacing: '-0.04em',
                  marginBottom: '16px',
                  fontFamily: 'monospace',
                }}>
                  {step.num}
                </div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#ffffff',
                  marginBottom: '8px',
                }}>
                  {step.title}
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#71717a',
                  lineHeight: 1.6,
                }}>
                  {step.desc}
                </p>
                {index < steps.length - 1 && (
                  <ChevronRight 
                    size={20} 
                    style={{
                      position: 'absolute',
                      right: '-12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'rgba(255, 255, 255, 0.1)',
                    }} 
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{
        padding: '120px 24px',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{
              fontSize: '40px',
              fontWeight: 600,
              color: '#ffffff',
              marginBottom: '16px',
              letterSpacing: '-0.02em',
            }}>
              核心功能
            </h2>
            <p style={{
              fontSize: '16px',
              color: '#71717a',
            }}>
              为创作者打造的专业工具集
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '20px',
          }}>
            {features.map((feature, index) => {
              const Icon = feature.icon
              const isHovered = hoveredFeature === index
              return (
                <div 
                  key={index}
                  style={{
                    padding: '32px',
                    background: isHovered ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.02)',
                    border: `1px solid ${isHovered ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255, 255, 255, 0.06)'}`,
                    borderRadius: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={() => setHoveredFeature(index)}
                  onMouseLeave={() => setHoveredFeature(null)}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'rgba(99, 102, 241, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px',
                  }}>
                    <Icon size={24} style={{ color: '#6366f1' }} />
                  </div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    color: '#ffffff',
                    marginBottom: '8px',
                  }}>
                    {feature.name}
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#71717a',
                    lineHeight: 1.6,
                  }}>
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: '120px 24px',
      }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div style={{
            padding: '80px 48px',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            borderRadius: '24px',
            textAlign: 'center',
          }}>
            <h2 style={{
              fontSize: '36px',
              fontWeight: 600,
              color: '#ffffff',
              marginBottom: '16px',
              letterSpacing: '-0.02em',
            }}>
              立即开始创作
            </h2>
            <p style={{
              fontSize: '16px',
              color: '#a1a1aa',
              marginBottom: '32px',
              maxWidth: '400px',
              margin: '0 auto 32px',
            }}>
              免费注册，体验 AI 创作的强大能力
            </p>
            
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '12px',
              marginBottom: '32px',
              flexWrap: 'wrap',
            }}>
              {['免费试用', '无需信用卡', '24/7 支持'].map((item) => (
                <div key={item} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#a1a1aa',
                  fontSize: '14px',
                }}>
                  <Check size={14} style={{ color: '#6366f1' }} />
                  {item}
                </div>
              ))}
            </div>
            
            <button 
              onClick={() => navigate('/register')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '16px 40px',
                fontSize: '16px',
                fontWeight: 600,
                borderRadius: '10px',
                border: 'none',
                background: '#ffffff',
                color: '#000000',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <Sparkles size={18} />
              免费注册
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '48px 24px',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        textAlign: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Sparkles size={14} color="#fff" />
          </div>
          <span style={{ fontSize: '16px', fontWeight: 600 }}>开演AI</span>
        </div>
        <p style={{
          fontSize: '14px',
          color: '#52525b',
        }}>
          © 2025 开演AI. All rights reserved.
        </p>
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
}
