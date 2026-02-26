import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
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
  Clock
} from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);
  const [hoveredStat, setHoveredStat] = useState<string | null>(null);
  const [ctaHover, setCtaHover] = useState(false);
  const [startHover, setStartHover] = useState(false);
  const [learnHover, setLearnHover] = useState(false);

  const features = [
    {
      name: 'AI 驱动创作',
      description: '从剧本到视频，全程智能辅助，让创作更高效',
      icon: Sparkles,
      color: '#6366f1',
      gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    },
    {
      name: '剧本/小说输入',
      description: '支持多种输入方式，灵活适配您的创作流程',
      icon: FileText,
      color: '#8b5cf6',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
    },
    {
      name: '角色一致性',
      description: '强大的角色管理系统，确保视觉高度一致',
      icon: Users,
      color: '#0ea5e9',
      gradient: 'linear-gradient(135deg, #0ea5e9 0%, #22d3ee 100%)',
    },
    {
      name: '分镜管理',
      description: '专业的镜头规划和九宫格预览',
      icon: LayoutGrid,
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
    },
    {
      name: '批量生成',
      description: '高效的图像和视频批量生成能力',
      icon: Zap,
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
    },
    {
      name: '数据可视化',
      description: '清晰的项目进度和资产视图',
      icon: BarChart3,
      color: '#ec4899',
      gradient: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
    },
  ];

  const globalStats = [
    { label: '总用户数', value: '100K+', icon: Globe, color: '#6366f1' },
    { label: '创作项目', value: '50K+', icon: FileText, color: '#8b5cf6' },
    { label: '生成视频', value: '1M+', icon: Play, color: '#a855f7' },
    { label: '运行时间', value: '99.9%', icon: Clock, color: '#0ea5e9' },
    { label: '用户满意度', value: '4.9/5', icon: Star, color: '#f59e0b' },
  ];

  const advantages = [
    { icon: Zap, title: '极速生成', description: '秒级响应，高效创作' },
    { icon: Shield, title: '安全可靠', description: '数据加密，隐私保护' },
    { icon: Globe, title: '云端同步', description: '随时随地，无缝衔接' },
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(180deg, var(--bg-page) 0%, var(--bg-base) 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '-5%',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.08) 40%, transparent 70%)',
        filter: 'blur(100px)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-5%',
        left: '-5%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(168, 85, 247, 0.12) 0%, rgba(236, 72, 153, 0.06) 40%, transparent 70%)',
        filter: 'blur(80px)',
        pointerEvents: 'none',
      }} />

      <section style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '100px 24px',
        position: 'relative',
      }}>
        <div style={{ 
          textAlign: 'center', 
          maxWidth: '900px', 
          position: 'relative', 
          zIndex: 1 
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '50px',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            color: '#6366f1',
            fontSize: '14px',
            fontWeight: '500',
            marginBottom: '40px',
          }}>
            <Sparkles style={{ width: '16px', height: '16px' }} />
            AI 内容创作平台
          </div>

          <h1 style={{
            fontSize: 'clamp(48px, 10vw, 80px)',
            fontWeight: '800',
            marginBottom: '24px',
            lineHeight: '1.1',
            letterSpacing: '-2px',
          }}>
            <span style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>开演AI</span>
          </h1>

          <p style={{
            fontSize: 'clamp(16px, 2vw, 20px)',
            color: 'var(--text-secondary)',
            lineHeight: '1.8',
            marginBottom: '48px',
            maxWidth: '600px',
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
              onClick={() => navigate('/projects')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 32px',
                fontSize: '16px',
                fontWeight: '600',
                borderRadius: '14px',
                border: 'none',
                background: startHover ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                color: 'white',
                cursor: 'pointer',
                boxShadow: startHover ? '0 8px 30px rgba(99, 102, 241, 0.5)' : '0 4px 20px rgba(99, 102, 241, 0.3)',
                transition: 'all 0.3s ease',
                transform: startHover ? 'translateY(-2px)' : 'translateY(0)',
              }}
              onMouseEnter={() => setStartHover(true)}
              onMouseLeave={() => setStartHover(false)}
            >
              立即开始
              <ArrowRight style={{ width: '18px', height: '18px' }} />
            </button>
            <button
              onClick={() => navigate('/help')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 32px',
                fontSize: '16px',
                fontWeight: '500',
                borderRadius: '14px',
                border: '1px solid var(--border-primary)',
                background: learnHover ? 'var(--bg-hover)' : 'var(--bg-card)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                transform: learnHover ? 'translateY(-2px)' : 'translateY(0)',
              }}
              onMouseEnter={() => setLearnHover(true)}
              onMouseLeave={() => setLearnHover(false)}
            >
              了解更多
            </button>
          </div>
        </div>
      </section>

      <section style={{
        padding: '80px 24px',
        position: 'relative',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '60px' 
          }}>
            <h2 style={{
              fontSize: 'clamp(32px, 5vw, 44px)',
              fontWeight: '700',
              color: 'var(--text-primary)',
              marginBottom: '16px',
            }}>
              平台数据
            </h2>
            <p style={{
              fontSize: '16px',
              color: 'var(--text-muted)',
              maxWidth: '500px',
              margin: '0 auto',
            }}>
              强大的 AI 工具，让创作变得前所未有的简单
            </p>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '20px',
          }}>
            {globalStats.map((stat) => {
              const Icon = stat.icon
              const isHovered = hoveredStat === stat.label
              return (
                <div 
                  key={stat.label} 
                  style={{
                    padding: '32px 24px',
                    textAlign: 'center',
                    background: 'var(--bg-card)',
                    border: `1px solid ${isHovered ? stat.color : 'var(--border-primary)'}`,
                    borderRadius: '20px',
                    transition: 'all 0.3s ease',
                    transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                    boxShadow: isHovered ? `0 12px 32px ${stat.color}20` : 'none',
                  }}
                  onMouseEnter={() => setHoveredStat(stat.label)}
                  onMouseLeave={() => setHoveredStat(null)}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '52px',
                    height: '52px',
                    borderRadius: '14px',
                    marginBottom: '16px',
                    background: `${stat.color}15`,
                    border: `1px solid ${stat.color}30`,
                    margin: '0 auto 16px',
                  }}>
                    <Icon style={{ width: '26px', height: '26px', color: stat.color }} />
                  </div>
                  <div style={{ 
                    fontSize: '36px', 
                    fontWeight: '700', 
                    color: 'var(--text-primary)', 
                    marginBottom: '8px',
                  }}>
                    {stat.value}
                  </div>
                  <div style={{ 
                    fontSize: '14px', 
                    color: 'var(--text-muted)', 
                    fontWeight: '500',
                  }}>
                    {stat.label}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section style={{
        padding: '80px 24px',
        position: 'relative',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '60px' 
          }}>
            <h2 style={{
              fontSize: 'clamp(32px, 5vw, 44px)',
              fontWeight: '700',
              color: 'var(--text-primary)',
              marginBottom: '16px',
            }}>
              核心功能
            </h2>
            <p style={{
              fontSize: '16px',
              color: 'var(--text-muted)',
              maxWidth: '500px',
              margin: '0 auto',
            }}>
              为创作者打造的专业工具集
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '24px',
          }}>
            {features.map((feature) => {
              const Icon = feature.icon
              const isHovered = hoveredFeature === feature.name
              return (
                <div 
                  key={feature.name}
                  style={{
                    padding: '36px',
                    background: 'var(--bg-card)',
                    border: `1px solid ${isHovered ? feature.color : 'var(--border-primary)'}`,
                    borderRadius: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    transform: isHovered ? 'translateY(-6px)' : 'translateY(0)',
                    boxShadow: isHovered ? `0 16px 40px ${feature.color}20` : 'none',
                  }}
                  onMouseEnter={() => setHoveredFeature(feature.name)}
                  onMouseLeave={() => setHoveredFeature(null)}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '60px',
                    height: '60px',
                    borderRadius: '16px',
                    marginBottom: '24px',
                    background: feature.gradient,
                    boxShadow: `0 4px 16px ${feature.color}30`,
                  }}>
                    <Icon style={{ width: '28px', height: '28px', color: 'white' }} />
                  </div>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    marginBottom: '12px',
                  }}>
                    {feature.name}
                  </h3>
                  <p style={{
                    fontSize: '15px',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.7',
                  }}>
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section style={{
        padding: '80px 24px',
        position: 'relative',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{
            padding: '60px 48px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-primary)',
            borderRadius: '24px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
            }} />
            
            <h2 style={{
              fontSize: 'clamp(28px, 4vw, 40px)',
              fontWeight: '700',
              color: 'var(--text-primary)',
              marginBottom: '20px',
            }}>
              开始您的创作之旅
            </h2>
            <p style={{
              fontSize: '16px',
              color: 'var(--text-secondary)',
              lineHeight: '1.8',
              marginBottom: '32px',
              maxWidth: '500px',
              margin: '0 auto 32px',
            }}>
              立即加入数万名创作者，体验 AI 带来的创作革命
            </p>
            
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '32px',
              marginBottom: '32px',
              flexWrap: 'wrap',
            }}>
              {advantages.map((adv) => {
                const Icon = adv.icon
                return (
                  <div key={adv.title} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Icon style={{ width: '20px', height: '20px', color: '#6366f1' }} />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                        {adv.title}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {adv.description}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            
            <button 
              onClick={() => navigate('/projects')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '16px 48px',
                fontSize: '16px',
                fontWeight: '600',
                borderRadius: '14px',
                border: 'none',
                background: ctaHover ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                color: 'white',
                cursor: 'pointer',
                boxShadow: ctaHover ? '0 8px 30px rgba(99, 102, 241, 0.5)' : '0 4px 20px rgba(99, 102, 241, 0.3)',
                transition: 'all 0.3s ease',
                transform: ctaHover ? 'translateY(-2px)' : 'translateY(0)',
              }}
              onMouseEnter={() => setCtaHover(true)}
              onMouseLeave={() => setCtaHover(false)}
            >
              <Sparkles style={{ width: '20px', height: '20px' }} />
              免费开始
            </button>
          </div>
        </div>
      </section>

      <footer style={{
        padding: '40px 24px',
        textAlign: 'center',
        borderTop: '1px solid var(--border-primary)',
        background: 'var(--bg-card)',
      }}>
        <p style={{
          fontSize: '14px',
          color: 'var(--text-muted)',
          margin: 0,
        }}>
          © 2025 开演AI. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
