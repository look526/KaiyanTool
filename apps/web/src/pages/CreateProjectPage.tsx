import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, FileText, BookOpen, Layers, Sparkles, Info, ArrowRight, Zap } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { apiClient, CreateProjectData } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';

export default function CreateProjectPage() {
  const [formData, setFormData] = useState<CreateProjectData>({
    name: '',
    description: '',
    type: 'script',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; speed: number; opacity: number }>>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { theme } = useTheme();

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
      size: Math.random() * 3 + 1,
      speed: Math.random() * 0.5 + 0.2,
      opacity: Math.random() * 0.5 + 0.2,
    }));
    setParticles(newParticles);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('项目名称不能为空');
      return;
    }

    setLoading(true);

    try {
      const project = await apiClient.createProject(formData);
      navigate(`/projects/${project.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建项目失败');
    } finally {
      setLoading(false);
    }
  };

  const projectTypes = [
    { 
      value: 'script' as const, 
      label: '剧本项目', 
      icon: FileText, 
      description: '基于剧本格式的内容创作',
      features: ['场景管理', '角色系统', '对白生成', '场景转换'],
      gradient: 'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)'
    },
    { 
      value: 'novel' as const, 
      label: '小说项目', 
      icon: BookOpen, 
      description: '基于小说文本的内容创作',
      features: ['章节管理', '世界观设定', '人物档案', '情节规划'],
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)'
    },
    { 
      value: 'mixed' as const, 
      label: '混合项目', 
      icon: Layers, 
      description: '结合剧本和小说的混合模式',
      features: ['多格式支持', '灵活切换', '智能同步', '综合管理'],
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)'
    },
  ];

  const selectedType = projectTypes.find(t => t.value === formData.type);

  return (
    <div ref={containerRef} style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-primary)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <style>{`
        @keyframes gradientMove {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes particleFloat {
          0%, 100% { transform: translateY(0) translateX(0); opacity: var(--opacity); }
          50% { transform: translateY(-30px) translateX(10px); opacity: calc(var(--opacity) * 0.5); }
        }

        .cursor-glow {
          position: fixed;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.08) 40%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
          transform: translate(-50%, -50%);
          transition: opacity 0.3s ease;
          z-index: 1;
          filter: blur(40px);
        }

        .background-decoration {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
        }

        .particle {
          position: absolute;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.6), rgba(139, 92, 246, 0.4));
          border-radius: 50%;
          pointer-events: none;
          animation: particleFloat 8s ease-in-out infinite;
          --opacity: var(--p-opacity, 0.3);
        }
      `}</style>

      <div className="cursor-glow" style={{
        left: mousePosition.x,
        top: mousePosition.y,
      }}></div>

      <div className="background-decoration">
        {particles.map(p => (
          <div
            key={p.id}
            className="particle"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              '--p-opacity': p.opacity,
              animationDelay: `${p.id * 0.1}s`,
              animationDuration: `${8 / p.speed}s`,
            }}
          />
        ))}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '15%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(139, 92, 246, 0.15) 35%, transparent 70%)',
          filter: 'blur(120px)',
          animation: 'float 12s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '15%',
          right: '10%',
          width: '450px',
          height: '450px',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, rgba(168, 85, 247, 0.12) 40%, transparent 70%)',
          filter: 'blur(100px)',
          animation: 'float 15s ease-in-out infinite reverse',
        }} />
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 60%)',
          filter: 'blur(80px)',
        }} />
      </div>

      <nav style={{
        position: 'relative',
        height: '88px',
        padding: '0 40px',
        display: 'flex',
        alignItems: 'center',
        zIndex: 10,
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      }}>
        <Link to="/projects" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 20px',
          borderRadius: '14px',
          textDecoration: 'none',
          color: 'var(--text-secondary)',
          transition: 'all 0.3s ease',
          fontWeight: '600',
          fontSize: '14px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.1)';
          e.currentTarget.style.color = 'var(--text-primary)';
          e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.2)';
          e.currentTarget.style.transform = 'translateX(-4px) translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
          e.currentTarget.style.color = 'var(--text-secondary)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
          e.currentTarget.style.transform = 'translateX(0) translateY(0)';
        }}
        >
          <ArrowLeft style={{ width: '18px', height: '18px' }} />
          返回项目列表
        </Link>
      </nav>

      <div style={{ 
        maxWidth: '900px', 
        margin: '0 auto', 
        padding: '0 24px 48px',
        position: 'relative',
        zIndex: 10,
        animation: 'fadeIn 0.8s ease-out',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            borderRadius: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 28px',
            boxShadow: '0 12px 32px rgba(99, 102, 241, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.15) inset',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '24px',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              filter: 'blur(20px)',
              opacity: 0.5,
              zIndex: -1,
            }} />
            <Sparkles style={{ width: '40px', height: '40px', color: 'white' }} />
          </div>
          <h1 style={{
            fontSize: '40px',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '16px',
            letterSpacing: '-0.5px',
            backgroundSize: '200% 200%',
            animation: 'gradientMove 8s ease infinite',
          }}>创建新项目</h1>
          <p style={{
            fontSize: '18px',
            color: 'var(--text-secondary)',
            lineHeight: '1.7',
            maxWidth: '500px',
            margin: '0 auto',
          }}>
            开启您的AI内容创作之旅，选择最适合您需求的项目类型
          </p>
        </div>

        {error && (
          <div style={{
            padding: '20px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '16px',
            color: '#ef4444',
            marginBottom: '32px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            fontSize: '15px',
            fontWeight: '600',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)',
          }}>
            <Info style={{ width: '22px', height: '22px', flexShrink: 0 }} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <Card style={{
            padding: '48px',
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.05) inset',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}>
            <div style={{ marginBottom: '32px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '700',
                color: 'var(--text-secondary)',
                marginBottom: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
              }}>
                项目名称
              </label>
              <Input
                placeholder="为您的项目取一个名字"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                style={{
                  fontSize: '16px',
                  padding: '16px 20px',
                  borderRadius: '14px',
                  transition: 'all 0.3s ease',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              />
            </div>

            <div style={{ marginBottom: '40px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '700',
                color: 'var(--text-secondary)',
                marginBottom: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
              }}>
                项目描述（可选）
              </label>
              <textarea
                placeholder="简要描述您的项目内容和目标..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  borderRadius: '14px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--text-primary)',
                  fontSize: '15px',
                  lineHeight: '1.7',
                  resize: 'vertical',
                  transition: 'all 0.3s ease',
                  outline: 'none',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
                  e.currentTarget.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.1)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '700',
                color: 'var(--text-secondary)',
                marginBottom: '16px',
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
              }}>
                选择项目类型
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {projectTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = formData.type === type.value;
                  return (
                    <div
                      key={type.value}
                      onClick={() => setFormData({ ...formData, type: type.value })}
                      style={{
                        padding: '24px',
                        border: '2px solid ' + (isSelected ? 'transparent' : 'rgba(255, 255, 255, 0.08)'),
                        borderRadius: '20px',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.transform = 'translateY(-4px)';
                          e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.2)';
                          e.currentTarget.style.boxShadow = '0 8px 24px rgba(99, 102, 241, 0.2)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                          e.currentTarget.style.boxShadow = 'none';
                        }
                      }}
                    >
                      {isSelected && (
                        <div style={{
                          position: 'absolute',
                          inset: 0,
                          background: type.gradient,
                          opacity: 0.08,
                          borderRadius: '18px',
                        }} />
                      )}
                      <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                          <div style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: type.gradient,
                            boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)',
                            transition: 'transform 0.3s ease',
                          }}>
                            <Icon style={{ width: '28px', height: '28px', color: 'white' }} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <h4 style={{
                              fontSize: '18px',
                              fontWeight: '700',
                              color: 'var(--text-primary)',
                              margin: '0 0 6px 0',
                            }}>{type.label}</h4>
                            <p style={{
                              fontSize: '14px',
                              color: 'var(--text-secondary)',
                              margin: '0 0 12px 0',
                              lineHeight: '1.6',
                            }}>{type.description}</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                              {type.features.map((feature, idx) => (
                                <span key={idx} style={{
                                  padding: '4px 12px',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  borderRadius: '8px',
                                  backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                                  color: isSelected ? '#6366f1' : 'var(--text-secondary)',
                                  border: '1px solid ' + (isSelected ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.08)'),
                                }}>
                                  {feature}
                                </span>
                              ))}
                            </div>
                          </div>
                          {isSelected && (
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: type.gradient,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
                            }}>
                              <ArrowRight style={{ width: '16px', height: '16px', color: 'white' }} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          <div style={{ 
            display: 'flex', 
            gap: '16px',
            padding: '0 8px',
          }}>
            <Button
              type="button"
              variant="outline"
              style={{
                flex: 1,
                padding: '18px 32px',
                fontSize: '16px',
                fontWeight: '700',
                borderRadius: '16px',
                borderColor: 'rgba(255, 255, 255, 0.15)',
                color: 'var(--text-secondary)',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
              }}
              onClick={() => navigate('/projects')}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(99, 102, 241, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              取消
            </Button>
            <Button
              type="submit"
              style={{
                flex: 1,
                padding: '18px 32px',
                fontSize: '16px',
                fontWeight: '700',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'white',
                boxShadow: '0 8px 32px rgba(99, 102, 241, 0.4)',
                transition: 'all 0.3s ease',
              }}
              disabled={loading}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 16px 40px rgba(99, 102, 241, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.2) inset';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(99, 102, 241, 0.4)';
              }}
            >
              {loading ? '创建中...' : '创建项目'}
            </Button>
          </div>
        </form>

        {selectedType && (
          <div style={{
            marginTop: '40px',
            padding: '24px',
            borderRadius: '20px',
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: selectedType.gradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)',
            }}>
              <Zap style={{ width: '24px', height: '24px', color: 'white' }} />
            </div>
            <div style={{ flex: 1 }}>
              <h5 style={{ 
                fontSize: '15px', 
                fontWeight: '700',
                color: 'var(--text-primary)',
                margin: '0 0 4px 0',
              }}>
                已选择: {selectedType.label}
              </h5>
              <p style={{ 
                fontSize: '13px',
                color: 'var(--text-secondary)',
                margin: 0,
              }}>
                {selectedType.description}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
