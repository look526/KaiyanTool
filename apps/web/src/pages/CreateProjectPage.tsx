import { useState } from 'react';
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
  const navigate = useNavigate();
  const { theme } = useTheme();

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
      gradient: 'from-blue-500 to-cyan-500'
    },
    { 
      value: 'novel' as const, 
      label: '小说项目', 
      icon: BookOpen, 
      description: '基于小说文本的内容创作',
      features: ['章节管理', '世界观设定', '人物档案', '情节规划'],
      gradient: 'from-purple-500 to-pink-500'
    },
    { 
      value: 'mixed' as const, 
      label: '混合项目', 
      icon: Layers, 
      description: '结合剧本和小说的混合模式',
      features: ['多格式支持', '灵活切换', '智能同步', '综合管理'],
      gradient: 'from-orange-500 to-red-500'
    },
  ];

  const selectedType = projectTypes.find(t => t.value === formData.type);

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: theme === 'dark' ? '#0a0a0a' : '#fafafa',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '400px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        opacity: theme === 'dark' ? 0.15 : 0.05,
        borderRadius: '0 0 50% 50% / 0 0 20% 20%',
      }} />
      
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '300px',
        background: 'linear-gradient(180deg, #f093fb 0%, #f5576c 100%)',
        opacity: theme === 'dark' ? 0.08 : 0.03,
        borderRadius: '0 0 40% 40% / 0 0 15% 15%',
        transform: 'rotate(-5deg)',
      }} />

      <nav style={{
        position: 'relative',
        height: '72px',
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        zIndex: 10,
      }}>
        <Link to="/projects" style={{ 
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 20px',
          borderRadius: '12px',
          textDecoration: 'none',
          color: theme === 'dark' ? '#a0a0a0' : '#6b7280',
          transition: 'all 0.3s ease',
          fontWeight: '500',
          fontSize: '14px',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = theme === 'dark' ? '#1a1a1a' : '#e5e7eb';
          e.currentTarget.style.color = theme === 'dark' ? '#ffffff' : '#1f2937';
          e.currentTarget.style.transform = 'translateX(-4px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = theme === 'dark' ? '#a0a0a0' : '#6b7280';
          e.currentTarget.style.transform = 'translateX(0)';
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
      }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 28px',
            boxShadow: '0 20px 40px -10px rgba(102, 126, 234, 0.5)',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '24px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              filter: 'blur(20px)',
              opacity: 0.5,
              zIndex: -1,
            }} />
            <Sparkles style={{ width: '40px', height: '40px', color: 'white' }} />
          </div>
          <h1 style={{ 
            fontSize: '40px', 
            fontWeight: '800',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '16px',
            letterSpacing: '-0.5px',
          }}>创建新项目</h1>
          <p style={{ 
            fontSize: '18px',
            color: theme === 'dark' ? '#888888' : '#6b7280',
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
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '16px',
            color: '#ef4444',
            marginBottom: '32px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            fontSize: '15px',
            fontWeight: '500',
          }}>
            <Info style={{ width: '22px', height: '22px', flexShrink: 0 }} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <Card style={{ 
            padding: '48px',
            background: theme === 'dark' ? '#111111' : '#ffffff',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
            borderRadius: '24px',
          }}>
            <div style={{ marginBottom: '32px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                color: theme === 'dark' ? '#999999' : '#6b7280',
                marginBottom: '10px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
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
                  borderRadius: '12px',
                  transition: 'all 0.3s ease',
                }}
              />
            </div>

            <div style={{ marginBottom: '40px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                color: theme === 'dark' ? '#999999' : '#6b7280',
                marginBottom: '10px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
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
                  borderRadius: '12px',
                  border: '1px solid ' + (theme === 'dark' ? '#2a2a2a' : '#e5e7eb'),
                  backgroundColor: theme === 'dark' ? '#0a0a0a' : '#f9fafb',
                  color: theme === 'dark' ? '#ffffff' : '#1f2937',
                  fontSize: '15px',
                  lineHeight: '1.7',
                  resize: 'vertical',
                  transition: 'all 0.3s ease',
                  outline: 'none',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#667eea';
                  e.currentTarget.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = theme === 'dark' ? '#2a2a2a' : '#e5e7eb';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                color: theme === 'dark' ? '#999999' : '#6b7280',
                marginBottom: '16px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
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
                        border: '2px solid ' + (isSelected ? 'transparent' : (theme === 'dark' ? '#2a2a2a' : '#e5e7eb')),
                        borderRadius: '20px',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        backgroundColor: isSelected ? 'rgba(102, 126, 234, 0.05)' : (theme === 'dark' ? '#111111' : '#ffffff'),
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      {isSelected && (
                        <div style={{
                          position: 'absolute',
                          inset: 0,
                          background: `linear-gradient(135deg, ${type.gradient.split(' ')[0]} 0%, ${type.gradient.split(' ')[1]} 100%)`,
                          opacity: 0.05,
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
                            background: `linear-gradient(135deg, ${type.gradient.split(' ')[0]} 0%, ${type.gradient.split(' ')[1]} 100%)`,
                            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
                            transition: 'transform 0.3s ease',
                          }}>
                            <Icon style={{ width: '28px', height: '28px', color: 'white' }} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <h4 style={{ 
                              fontSize: '18px', 
                              fontWeight: '700',
                              color: theme === 'dark' ? '#ffffff' : '#1f2937',
                              margin: '0 0 6px 0',
                            }}>{type.label}</h4>
                            <p style={{ 
                              fontSize: '14px',
                              color: theme === 'dark' ? '#888888' : '#6b7280',
                              margin: '0 0 12px 0',
                              lineHeight: '1.6',
                            }}>{type.description}</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                              {type.features.map((feature, idx) => (
                                <span key={idx} style={{
                                  padding: '4px 12px',
                                  fontSize: '12px',
                                  fontWeight: '500',
                                  borderRadius: '8px',
                                  backgroundColor: isSelected ? 'rgba(102, 126, 234, 0.15)' : (theme === 'dark' ? '#1a1a1a' : '#f3f4f6'),
                                  color: isSelected ? '#667eea' : (theme === 'dark' ? '#a0a0a0' : '#6b7280'),
                                  border: '1px solid ' + (isSelected ? 'rgba(102, 126, 234, 0.3)' : 'transparent'),
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
                              background: `linear-gradient(135deg, ${type.gradient.split(' ')[0]} 0%, ${type.gradient.split(' ')[1]} 100%)`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
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
                fontWeight: '600',
                borderRadius: '14px',
                borderColor: theme === 'dark' ? '#2a2a2a' : '#e5e7eb',
                color: theme === 'dark' ? '#a0a0a0' : '#6b7280',
              }}
              onClick={() => navigate('/projects')}
            >
              取消
            </Button>
            <Button 
              type="submit" 
              style={{ 
                flex: 1,
                padding: '18px 32px',
                fontSize: '16px',
                fontWeight: '600',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                color: 'white',
                boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
                transition: 'all 0.3s ease',
              }}
              disabled={loading}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(102, 126, 234, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.4)';
              }}
            >
              {loading ? (
                <>
                  <svg style={{ animation: 'spin 1s linear infinite', height: '18px', width: '18px', marginRight: '10px' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-0V4a8 8 0 00-8 0z"></path>
                  </svg>
                  创建中...
                </>
              ) : (
                <>
                  <Sparkles style={{ width: '18px', height: '18px', marginRight: '10px' }} />
                  创建项目
                </>
              )}
            </Button>
          </div>
        </form>

        {selectedType && (
          <div style={{
            marginTop: '40px',
            padding: '24px',
            borderRadius: '20px',
            background: theme === 'dark' ? '#111111' : '#ffffff',
            border: '1px solid ' + (theme === 'dark' ? '#2a2a2a' : '#e5e7eb'),
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${selectedType.gradient.split(' ')[0]} 0%, ${selectedType.gradient.split(' ')[1]} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Zap style={{ width: '24px', height: '24px', color: 'white' }} />
            </div>
            <div style={{ flex: 1 }}>
              <h5 style={{ 
                fontSize: '15px', 
                fontWeight: '600',
                color: theme === 'dark' ? '#ffffff' : '#1f2937',
                margin: '0 0 4px 0',
              }}>
                已选择: {selectedType.label}
              </h5>
              <p style={{ 
                fontSize: '13px',
                color: theme === 'dark' ? '#888888' : '#6b7280',
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
