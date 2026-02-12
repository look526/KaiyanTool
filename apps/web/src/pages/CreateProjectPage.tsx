import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, FileText, BookOpen, Layers, Sparkles, Info } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { apiClient, CreateProjectData } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';

export default function CreateProjectPage() {
  const [formData, setFormData] = useState<CreateProjectData>({
    name: '',
    description: '',
    type: 'SCRIPT',
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
    { value: 'SCRIPT' as const, label: '剧本项目', icon: FileText, description: '基于剧本格式的内容创作' },
    { value: 'NOVEL' as const, label: '小说项目', icon: BookOpen, description: '基于小说文本的内容创作' },
    { value: 'MIXED' as const, label: '混合项目', icon: Layers, description: '结合剧本和小说的混合模式' },
  ];

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: theme === 'dark' ? '#000000' : '#ffffff',
    }}>
      <nav style={{
        height: '64px',
        borderBottom: '1px solid ' + (theme === 'dark' ? '#222222' : '#e5e5eb'),
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
      }}>
        <Link to="/projects" style={{ 
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          borderRadius: '8px',
          textDecoration: 'none',
          color: theme === 'dark' ? '#888888' : '#999999',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = theme === 'dark' ? '#1a1a1a' : '#f5f5f5';
          e.currentTarget.style.color = theme === 'dark' ? '#ffffff' : '#000000';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = theme === 'dark' ? '#888888' : '#999999';
        }}
        >
          <ArrowLeft style={{ width: '16px', height: '16px' }} />
          返回项目列表
        </Link>
      </nav>

      <div style={{ maxWidth: '768px', margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)',
          }}>
            <Sparkles style={{ width: '32px', height: '32px', color: 'white' }} />
          </div>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: '800',
            color: theme === 'dark' ? '#ffffff' : '#000000',
            marginBottom: '16px',
            margin: '0 0 16px 0',
          }}>创建新项目</h1>
          <p style={{ 
            fontSize: '16px',
            color: theme === 'dark' ? '#a1a1aa' : '#666666',
            lineHeight: '1.6',
          }}>
            开始您的AI内容创作之旅，选择适合您需求的项目类型
          </p>
        </div>

        {error && (
          <div style={{
            padding: '16px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '12px',
            color: '#ef4444',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <Info style={{ width: '20px', height: '20px' }} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Card style={{ padding: '32px' }}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: theme === 'dark' ? '#ffffff' : '#000000',
                marginBottom: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                项目名称
              </label>
              <Input
                placeholder="为您的项目取一个名字"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: theme === 'dark' ? '#ffffff' : '#000000',
                marginBottom: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                项目描述（可选）
              </label>
              <textarea
                placeholder="简要描述您的项目内容和目标"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid ' + (theme === 'dark' ? '#333333' : '#e5e5eb'),
                  backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
                  color: theme === 'dark' ? '#ffffff' : '#000000',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  resize: 'vertical',
                  transition: 'border 0.2s ease',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#6366f1';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = theme === 'dark' ? '#333333' : '#e5e5eb';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: theme === 'dark' ? '#ffffff' : '#000000',
                marginBottom: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                项目类型
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {projectTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = formData.type === type.value;
                  return (
                    <div
                      key={type.value}
                      onClick={() => setFormData({ ...formData, type: type.value })}
                      style={{
                        padding: '16px',
                        border: '2px solid ' + (isSelected ? '#6366f1' : (theme === 'dark' ? '#333333' : '#e5e5eb')),
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.05)' : 'transparent',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = '#6366f1';
                          e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.02)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = theme === 'dark' ? '#333333' : '#e5e5eb';
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: isSelected ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' : (theme === 'dark' ? '#222222' : '#f5f5f5'),
                        }}>
                          <Icon style={{ width: '24px', height: '24px', color: isSelected ? 'white' : (theme === 'dark' ? '#888888' : '#666666') }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ 
                            fontSize: '16px', 
                            fontWeight: '600',
                            color: theme === 'dark' ? '#ffffff' : '#000000',
                            margin: '0 0 4px 0',
                          }}>{type.label}</h4>
                          <p style={{ 
                            fontSize: '14px',
                            color: theme === 'dark' ? '#888888' : '#999999',
                            margin: 0,
                          }}>{type.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Button 
              type="button" 
              variant="outline" 
              style={{ flex: 1 }}
              onClick={() => navigate('/projects')}
            >
              取消
            </Button>
            <Button 
              type="submit" 
              size="lg" 
              style={{ flex: 1 }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg style={{ animation: 'spin 1s linear infinite', height: '16px', width: '16px', marginRight: '8px' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-0V4a8 8 0 00-8 0z"></path>
                  </svg>
                  创建中...
                </>
              ) : (
                <>
                  <Sparkles style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                  创建项目
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
