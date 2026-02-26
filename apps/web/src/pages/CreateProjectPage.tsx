import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, FileText, BookOpen, Layers, Sparkles, Info, ArrowRight, Zap, Loader2 } from 'lucide-react';
import { apiClient, CreateProjectData } from '../lib/api';

export default function CreateProjectPage() {
  const [formData, setFormData] = useState<CreateProjectData>({
    name: '',
    description: '',
    type: 'script',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [hoveredType, setHoveredType] = useState<string | null>(null);
  const [cancelHover, setCancelHover] = useState(false);
  const navigate = useNavigate();

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
      gradient: 'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)',
      color: '#06b6d4'
    },
    { 
      value: 'novel' as const, 
      label: '小说项目', 
      icon: BookOpen, 
      description: '基于小说文本的内容创作',
      features: ['章节管理', '世界观设定', '人物档案', '情节规划'],
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
      color: '#8b5cf6'
    },
    { 
      value: 'mixed' as const, 
      label: '混合项目', 
      icon: Layers, 
      description: '结合剧本和小说的混合模式',
      features: ['多格式支持', '灵活切换', '智能同步', '综合管理'],
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
      color: '#f59e0b'
    },
  ];

  const selectedType = projectTypes.find(t => t.value === formData.type);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, var(--bg-page) 0%, var(--bg-base) 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '15%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.08) 35%, transparent 70%)',
        filter: 'blur(120px)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '15%',
        right: '10%',
        width: '450px',
        height: '450px',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, rgba(168, 85, 247, 0.06) 40%, transparent 70%)',
        filter: 'blur(100px)',
        pointerEvents: 'none',
      }} />

      <nav style={{
        position: 'relative',
        height: '72px',
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        zIndex: 10,
        background: 'var(--bg-header)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-primary)',
      }}>
        <Link 
          to="/projects" 
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            borderRadius: '10px',
            textDecoration: 'none',
            color: 'var(--text-muted)',
            transition: 'all 0.2s ease',
            fontWeight: '500',
            fontSize: '14px',
            background: 'var(--bg-hover)',
            border: '1px solid var(--border-primary)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
            e.currentTarget.style.color = '#fff'
            e.currentTarget.style.borderColor = 'transparent'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--bg-hover)'
            e.currentTarget.style.color = 'var(--text-muted)'
            e.currentTarget.style.borderColor = 'var(--border-primary)'
          }}
        >
          <ArrowLeft style={{ width: '16px', height: '16px' }} />
          返回项目列表
        </Link>
      </nav>

      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto', 
        padding: '0 24px 48px',
        position: 'relative',
        zIndex: 10,
      }}>
        <div style={{ textAlign: 'center', marginBottom: '48px', paddingTop: '32px' }}>
          <div style={{
            width: '72px',
            height: '72px',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)',
          }}>
            <Sparkles style={{ width: '36px', height: '36px', color: 'white' }} />
          </div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '12px',
          }}>创建新项目</h1>
          <p style={{
            fontSize: '16px',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
            maxWidth: '450px',
            margin: '0 auto',
          }}>
            开启您的AI内容创作之旅，选择最适合您需求的项目类型
          </p>
        </div>

        {error && (
          <div style={{
            padding: '16px 20px',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            color: '#ef4444',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '14px',
            fontWeight: '500',
          }}>
            <Info style={{ width: '20px', height: '20px', flexShrink: 0 }} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{
            padding: '32px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-primary)',
            borderRadius: '20px',
          }}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                color: 'var(--text-secondary)',
                marginBottom: '10px',
              }}>
                项目名称 <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="为您的项目取一个名字"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                style={{
                  width: '100%',
                  fontSize: '15px',
                  padding: '14px 18px',
                  borderRadius: '12px',
                  transition: 'all 0.2s ease',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-primary)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#6366f1'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-primary)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: '32px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                color: 'var(--text-secondary)',
                marginBottom: '10px',
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
                  padding: '14px 18px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-primary)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  resize: 'vertical',
                  transition: 'all 0.2s ease',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#6366f1'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-primary)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                color: 'var(--text-secondary)',
                marginBottom: '14px',
              }}>
                选择项目类型
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {projectTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = formData.type === type.value;
                  const isHovered = hoveredType === type.value;
                  
                  return (
                    <div
                      key={type.value}
                      onClick={() => setFormData({ ...formData, type: type.value })}
                      style={{
                        padding: '20px',
                        border: `2px solid ${isSelected ? type.color : 'var(--border-primary)'}`,
                        borderRadius: '16px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        background: isSelected ? `${type.color}08` : 'var(--bg-hover)',
                        position: 'relative',
                        overflow: 'hidden',
                        transform: isHovered && !isSelected ? 'translateY(-2px)' : 'translateY(0)',
                        boxShadow: isHovered && !isSelected ? `0 8px 24px ${type.color}20` : 'none',
                      }}
                      onMouseEnter={() => setHoveredType(type.value)}
                      onMouseLeave={() => setHoveredType(null)}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: type.gradient,
                          boxShadow: `0 4px 12px ${type.color}40`,
                        }}>
                          <Icon style={{ width: '24px', height: '24px', color: 'white' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: 'var(--text-primary)',
                            margin: '0 0 4px 0',
                          }}>{type.label}</h4>
                          <p style={{
                            fontSize: '13px',
                            color: 'var(--text-muted)',
                            margin: '0 0 10px 0',
                            lineHeight: 1.5,
                          }}>{type.description}</p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {type.features.map((feature, idx) => (
                              <span key={idx} style={{
                                padding: '4px 10px',
                                fontSize: '11px',
                                fontWeight: '600',
                                borderRadius: '6px',
                                background: isSelected ? `${type.color}15` : 'var(--bg-input)',
                                color: isSelected ? type.color : 'var(--text-muted)',
                                border: `1px solid ${isSelected ? `${type.color}30` : 'var(--border-primary)'}`,
                              }}>
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                        {isSelected && (
                          <div style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            background: type.gradient,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: `0 4px 12px ${type.color}40`,
                          }}>
                            <ArrowRight style={{ width: '14px', height: '14px', color: 'white' }} />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div style={{ 
            display: 'flex', 
            gap: '12px',
          }}>
            <button
              type="button"
              onClick={() => navigate('/projects')}
              style={{
                flex: 1,
                padding: '14px 24px',
                fontSize: '15px',
                fontWeight: '600',
                borderRadius: '12px',
                border: '1px solid var(--border-primary)',
                color: cancelHover ? '#ef4444' : 'var(--text-primary)',
                background: cancelHover ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-hover)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={() => setCancelHover(true)}
              onMouseLeave={() => setCancelHover(false)}
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: '14px 24px',
                fontSize: '15px',
                fontWeight: '600',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                border: 'none',
                color: 'white',
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {loading ? (
                <>
                  <Loader2 style={{ width: '18px', height: '18px', animation: 'spin 1s linear infinite' }} />
                  创建中...
                </>
              ) : (
                <>
                  <Sparkles style={{ width: '18px', height: '18px' }} />
                  创建项目
                </>
              )}
            </button>
          </div>
        </form>

        {selectedType && (
          <div style={{
            marginTop: '32px',
            padding: '20px',
            borderRadius: '16px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: selectedType.gradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 4px 12px ${selectedType.color}40`,
            }}>
              <Zap style={{ width: '22px', height: '22px', color: 'white' }} />
            </div>
            <div style={{ flex: 1 }}>
              <h5 style={{ 
                fontSize: '14px', 
                fontWeight: '600',
                color: 'var(--text-primary)',
                margin: '0 0 2px 0',
              }}>
                已选择: {selectedType.label}
              </h5>
              <p style={{ 
                fontSize: '13px',
                color: 'var(--text-muted)',
                margin: 0,
              }}>
                {selectedType.description}
              </p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
