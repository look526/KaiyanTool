import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Button } from '../components/ui/button-new';

export default function HomePage() {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [cardTilt, setCardTilt] = useState<{ [key: string]: { rotateX: number; rotateY: number } }>({});
  const [animatedNumbers, setAnimatedNumbers] = useState<Record<string, number>>({});
  const [isVisible, setIsVisible] = useState<Record<string, boolean>>({});
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; speed: number; opacity: number }>>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const features = [
    {
      name: 'AI 驱动创作',
      description: '从剧本到视频，全程智能辅助',
      icon: 'M12 2L15.5 8.5L12 12L8.5 15.5L12 22',
      color: '#6366f1',
      gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    },
    {
      name: '剧本/小说输入',
      description: '支持多种输入方式，灵活适配您的创作流程',
      icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z M14 2v6h6',
      color: '#8b5cf6',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
    },
    {
      name: '角色一致性',
      description: '强大的角色管理系统，确保视觉高度一致',
      icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 0 1 4-4 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
      color: '#0ea5e9',
      gradient: 'linear-gradient(135deg, #0ea5e9 0%, #22d3ee 100%)',
    },
    {
      name: '分镜管理',
      description: '专业的镜头规划和九宫格预览',
      icon: 'M12 2L7 12L12 22L7 22L12 12 M2 17L12 22L12 17 M2 12L12 22L12 7',
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
    },
    {
      name: '批量生成',
      description: '高效的图像和视频批量生成能力',
      icon: 'M13 2L3 14L12 14L22 3L14 12L2 M13 2L3 14h9',
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
    },
    {
      name: '数据可视化',
      description: '清晰的项目进度和资产视图',
      icon: 'M18 20V10 M12 20V4 M6 20v-6',
      color: '#ec4899',
      gradient: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
    },
  ];

  const globalStats = [
    { label: '总用户数', value: '100K+', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 0 1 4-4 M16 3.13a4 4 0 0 1 0 7.75', color: '#6366f1' },
    { label: '创作项目', value: '50K+', icon: 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z', color: '#8b5cf6' },
    { label: '生成视频', value: '1M+', icon: 'M15 10l4.553-2.276A1 1 0 0 1 21 8.618v6.764a1 1 0 0 1-1.447.894L15 14M5 18h8a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2z', color: '#a855f7' },
    { label: 'AI 处理时间', value: '99.9%', icon: 'M13 2L3 14h9l-1 8 10-12h-9l1-8', color: '#0ea5e9' },
    { label: '用户满意度', value: '4.9/5', icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z', color: '#f59e0b' },
  ];

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 4,
      speed: 0.5 + Math.random() * 1.5,
      opacity: 0.2 + Math.random() * 0.4,
    }));
    setParticles(newParticles);
  }, []);

  const handleCardMouseMove = (e: React.MouseEvent, index: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;
    setCardTilt(prev => ({ ...prev, [`feature-${index}`]: { rotateX, rotateY } }));
  };

  const handleCardMouseLeave = (index: number) => {
    setCardTilt(prev => ({ ...prev, [`feature-${index}`]: { rotateX: 0, rotateY: 0 } }));
  };

  const handleIntersection = (entries: IntersectionObserverEntry[]) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('data-animate');
        if (id) {
          setIsVisible(prev => ({ ...prev, [id]: true }));
        }
      }
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const observer = new IntersectionObserver(handleIntersection, { 
        threshold: 0.1,
        rootMargin: '50px'
      });
      
      document.querySelectorAll('[data-animate]').forEach(el => {
        observer.observe(el);
      });

      return () => observer.disconnect();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    Object.entries(isVisible).forEach(([id, visible]) => {
      if (visible && !animatedNumbers[id]) {
        const stat = globalStats.find(s => s.label === id);
        if (stat) {
          const targetValue = parseInt(stat.value.replace(/[^0-9]/g, '')) || 0;
          let current = 0;
          const increment = targetValue / 50;
          const timer = setInterval(() => {
            current += increment;
            if (current >= targetValue) {
              current = targetValue;
              clearInterval(timer);
            }
            setAnimatedNumbers(prev => ({ ...prev, [id]: current }));
          }, 30);
          setAnimatedNumbers(prev => ({ ...prev, [id]: 0 }));
        }
      }
    });
  }, [isVisible]);

  return (
    <div ref={containerRef} style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #0a0a0f 0%, #12121a 50%, #0f0f16 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        .gradient-text {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          background-size: 200% 200%;
          animation: gradientMove 8s ease infinite;
        }
        
        @keyframes gradientMove {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .glass {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(40px) saturate(180%);
          -webkit-backdrop-filter: blur(40px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 24px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          transform-style: preserve-3d;
          perspective: 1000px;
        }
        
        .glass:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.1);
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6);
        }
        
        .glass-nav {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(40px) saturate(180%);
          -webkit-backdrop-filter: blur(40px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          color: white;
          font-weight: 600;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 8px 32px rgba(99, 102, 241, 0.4);
          position: relative;
          overflow: hidden;
        }
        
        .btn-primary::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: left 0.5s ease;
        }
        
        .btn-primary:hover::before {
          left: 100%;
        }
        
        .btn-primary:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 16px 48px rgba(99, 102, 241, 0.5);
        }
        
        .btn-secondary {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          color: white;
          font-weight: 500;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-3px);
        }
        
        .particle {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          animation: floatParticle ${20}s ease-in-out infinite;
        }
        
        @keyframes floatParticle {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.2; }
          25% { transform: translateY(-20px) rotate(90deg); opacity: 0.5; }
          50% { transform: translateY(-10px) rotate(180deg); opacity: 0.3; }
          75% { transform: translateY(-30px) rotate(270deg); opacity: 0.4; }
        }
        
        .cursor-glow {
          position: fixed;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, transparent 70%);
          pointer-events: none;
          transform: translate(-50%, -50%);
          transition: opacity 0.3s ease;
          z-index: 1;
        }
        
        .card-glow {
          position: absolute;
          inset: -2px;
          border-radius: 26px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7);
          z-index: -1;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .glass:hover .card-glow {
          opacity: 0.5;
        }
        
        .fade-in-up {
          opacity: 1;
          transform: translateY(0);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }
        
        .fade-in-up.visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>

      <div className="cursor-glow" style={{
        left: mousePosition.x,
        top: mousePosition.y,
      }}></div>

      <div style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}>
        {particles.map(p => (
          <div
            key={p.id}
            className="particle"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: `rgba(99, 102, 241, ${p.opacity})`,
              animationDuration: `${20 / p.speed}s`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
        
        <div style={{
          position: 'absolute',
          top: '-15%',
          right: '-10%',
          width: '900px',
          height: '900px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.35) 0%, rgba(139, 92, 246, 0.25) 35%, transparent 70%)',
          filter: 'blur(140px)',
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '-10%',
          left: '-8%',
          width: '800px',
          height: '800px',
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, rgba(236, 72, 153, 0.2) 40%, transparent 70%)',
          filter: 'blur(120px)',
        }}></div>
        <div style={{
          position: 'absolute',
          top: '30%',
          left: '-5%',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(14, 165, 233, 0.2) 0%, transparent 65%)',
          filter: 'blur(100px)',
        }}></div>
        <div style={{
          position: 'absolute',
          top: '60%',
          right: '-5%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, transparent 60%)',
          filter: 'blur(90px)',
        }}></div>
        <div style={{
          position: 'absolute',
          top: '40%',
          left: '60%',
          width: '700px',
          height: '700px',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, transparent 65%)',
          filter: 'blur(110px)',
        }}></div>
      </div>

      <nav style={{
        position: 'fixed',
        top: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100,
        borderRadius: '20px',
        boxShadow: '0 8px 40px rgba(0, 0, 0, 0.4)',
        padding: '12px 24px',
        width: 'fit-content',
      }} className="glass-nav">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '40px',
        }}>
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              cursor: 'pointer',
            }} 
            onClick={() => navigate('/')}
          >
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 24px rgba(99, 102, 241, 0.5)',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute',
                inset: -2,
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                filter: 'blur(8px)',
                opacity: 0.6,
              }}></div>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px', position: 'relative', zIndex: 1 }}>
                <path d="M12 2L15.5 8.5L12 12L8.5 15.5L12 22" />
              </svg>
            </div>
            <span style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#fafafa',
              letterSpacing: '-0.3px',
            }}>开演AI</span>
          </div>

          <Button 
            variant="primary"
            size="lg"
            onClick={() => navigate('/projects')}
          >
            开始创作
          </Button>
        </div>
      </nav>

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
            display: 'inline-block',
            padding: '12px 24px',
            borderRadius: '50px',
            background: 'rgba(99, 102, 241, 0.15)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            color: '#a5b4fc',
            fontSize: '14px',
            fontWeight: '500',
            marginBottom: '56px',
            letterSpacing: '0.5px',
          }}>
            AI 内容创作平台
          </div>

          <h1 style={{
            fontSize: 'clamp(56px, 12vw, 100px)',
            fontWeight: '800',
            marginBottom: '28px',
            lineHeight: '1.05',
            letterSpacing: '-3px',
            color: '#fafafa',
          }}>
            <span className="gradient-text">开演AI</span>
          </h1>

          <p style={{
            fontSize: 'clamp(17px, 2.2vw, 20px)',
            color: '#a1a1aa',
            lineHeight: '1.8',
            marginBottom: '56px',
            maxWidth: '600px',
            margin: '0 auto 56px',
            fontWeight: '400',
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
                padding: '14px 32px',
                fontSize: '16px',
                fontWeight: '600',
                borderRadius: '14px',
                border: 'none',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
              }}
            >
              立即开始
            </button>
            <button
              onClick={() => navigate('/projects')}
              style={{
                padding: '14px 32px',
                fontSize: '16px',
                fontWeight: '500',
                borderRadius: '14px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.08)',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              了解更多
            </button>
          </div>
        </div>
      </section>

      <section style={{
        padding: '140px 24px',
        position: 'relative',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '88px' 
          }} className="fade-in-up" data-animate="stats">
            <h2 style={{
              fontSize: 'clamp(40px, 7vw, 56px)',
              fontWeight: '700',
              color: '#fafafa',
              marginBottom: '20px',
              letterSpacing: '-1.5px',
            }}>
              平台数据
            </h2>
            <p style={{
              fontSize: '17px',
              color: '#71717a',
              maxWidth: '500px',
              margin: '20px auto 0',
              lineHeight: '1.7',
            }}>
              强大的 AI 工具，让创作变得前所未有的简单
            </p>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '24px',
          }}>
            {globalStats.map((stat) => (
              <div 
                key={stat.label} 
                className="glass fade-in-up"
                style={{
                  padding: '40px 28px',
                  textAlign: 'center',
                }}
                data-animate={`stat-${stat.label}`}
              >
                <div className="card-glow"></div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  marginBottom: '20px',
                  background: `rgba(${parseInt(stat.color.slice(1, 3), 16)}, ${parseInt(stat.color.slice(3, 5), 16)}, ${parseInt(stat.color.slice(5, 7), 16)}, 0.15)`,
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: `1px solid rgba(${parseInt(stat.color.slice(1, 3), 16)}, ${parseInt(stat.color.slice(3, 5), 16)}, ${parseInt(stat.color.slice(5, 7), 16)}, 0.3)`,
                  position: 'relative',
                  zIndex: 1,
                  margin: '0 auto 20px',
                  boxShadow: `0 4px 20px rgba(${parseInt(stat.color.slice(1, 3), 16)}, ${parseInt(stat.color.slice(3, 5), 16)}, ${parseInt(stat.color.slice(5, 7), 16)}, 0.3)`,
                }}>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke={stat.color} 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    style={{ width: '28px', height: '28px', filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.3))' }}
                  >
                    <path d={stat.icon} />
                  </svg>
                </div>
                <div style={{ 
                  fontSize: '48px', 
                  fontWeight: '700', 
                  color: '#fafafa', 
                  marginBottom: '12px', 
                  letterSpacing: '-2px',
                  position: 'relative',
                  zIndex: 1,
                }}>
                  {stat.value}
                </div>
                <div style={{ 
                  fontSize: '15px', 
                  color: '#a1a1aa', 
                  fontWeight: '500',
                  position: 'relative',
                  zIndex: 1,
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{
        padding: '140px 24px',
        position: 'relative',
      }}>
        <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '100px' 
          }} className="fade-in-up" data-animate="features">
            <h2 style={{
              fontSize: 'clamp(40px, 7vw, 56px)',
              fontWeight: '700',
              color: '#fafafa',
              marginBottom: '20px',
              letterSpacing: '-1.5px',
            }}>
              核心功能
            </h2>
            <p style={{
              fontSize: '17px',
              color: '#71717a',
              maxWidth: '500px',
              margin: '20px auto 0',
              lineHeight: '1.7',
            }}>
              为创作者打造的专业工具集
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
            gap: '28px',
          }}>
            {features.map((feature, index) => (
              <div 
                key={feature.name}
                className="glass fade-in-up"
                style={{
                  padding: '44px',
                  cursor: 'pointer',
                  transform: cardTilt[`feature-${index}`] 
                    ? `perspective(1000px) rotateX(${cardTilt[`feature-${index}`].rotateX}deg) rotateY(${cardTilt[`feature-${index}`].rotateY}deg)`
                    : 'perspective(1000px) rotateX(0) rotateY(0)',
                }}
                data-animate={`feature-${index}`}
                onMouseMove={(e) => handleCardMouseMove(e, index)}
                onMouseLeave={() => handleCardMouseLeave(index)}
              >
                <div className="card-glow" style={{
                  background: feature.gradient,
                }}></div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '68px',
                  height: '68px',
                  borderRadius: '18px',
                  marginBottom: '28px',
                  background: `${feature.color}20`,
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: `1px solid ${feature.color}30`,
                  position: 'relative',
                  zIndex: 1,
                }}>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke={feature.color} 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    style={{ width: '32px', height: '32px' }}
                  >
                    <path d={feature.icon} />
                  </svg>
                </div>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#fafafa',
                  marginBottom: '14px',
                  letterSpacing: '-0.5px',
                  position: 'relative',
                  zIndex: 1,
                }}>
                  {feature.name}
                </h3>
                <p style={{
                  fontSize: '16px',
                  color: '#a1a1aa',
                  lineHeight: '1.8',
                  fontWeight: '400',
                  position: 'relative',
                  zIndex: 1,
                }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{
        padding: '140px 24px',
        position: 'relative',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <div 
            className="glass fade-in-up"
            style={{
              padding: '100px 64px',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
            }}
            data-animate="cta"
          >
            <div className="card-glow"></div>
            <h2 style={{
              fontSize: 'clamp(36px, 5.5vw, 52px)',
              fontWeight: '700',
              color: '#fafafa',
              marginBottom: '24px',
              letterSpacing: '-0.8px',
              position: 'relative',
              zIndex: 1,
            }}>
              开始您的创作之旅
            </h2>
            <p style={{
              fontSize: '18px',
              color: '#a1a1aa',
              lineHeight: '1.9',
              marginBottom: '48px',
              fontWeight: '400',
              position: 'relative',
              zIndex: 1,
            }}>
              立即加入数万名创作者，体验 AI 带来的创作革命
            </p>
            <button 
              className="btn-primary"
              style={{
                padding: '20px 60px',
                fontSize: '17px',
              }}
              onClick={() => navigate('/projects')}
            >
              <span style={{ position: 'relative', zIndex: 1 }}>免费开始</span>
            </button>
          </div>
        </div>
      </section>

      <footer style={{
        padding: '56px 24px',
        textAlign: 'center',
        borderTop: '1px solid rgba(255, 255, 255, 0.04)',
        background: 'rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
      }}>
        <p style={{
          fontSize: '15px',
          color: '#52525b',
          margin: 0,
          fontWeight: '500',
        }}>
          © 2025 开演AI. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
