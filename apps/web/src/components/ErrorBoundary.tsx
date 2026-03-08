import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Copy, Mail } from 'lucide-react';
import { categorizeError, ErrorInfo as ErrorInfoType } from '../utils/errorHandling';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      hasError: true,
      error,
      errorInfo,
    });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleCopyError = async () => {
    const errorText = `错误信息：\n${this.state.error?.toString()}\n\n组件堆栈：\n${this.state.errorInfo?.componentStack}`;
    try {
      await navigator.clipboard.writeText(errorText);
      console.log('复制成功: 错误信息已复制到剪贴板');
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  render() {
    if (this.state.hasError) {
      const categorizedError = categorizeError(this.state.error);
      const theme = 'dark';

      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: 'var(--bg-base)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}>
          <div style={{
            maxWidth: '800px',
            width: '100%',
            backgroundColor: theme === 'dark' ? '#111111' : '#ffffff',
            borderRadius: '24px',
            padding: '48px',
            boxShadow: '0 24px 64px rgba(0, 0, 0, 0.3)',
            border: `3px solid ${categorizedError.severity === 'critical' ? '#dc2626' : '#ef4444'}`,
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              marginBottom: '32px',
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '20px',
                backgroundColor: '#fee2e2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <AlertTriangle style={{ width: '48px', height: '48px', color: '#dc2626' }} />
              </div>
              <div>
                <h1 style={{
                  fontSize: '28px',
                  fontWeight: '800',
                  color: 'var(--text-primary)',
                  margin: '0 0 8px 0',
                  letterSpacing: '-0.5px',
                }}>
                  哎呀，出错了
                </h1>
                <p style={{
                  fontSize: '16px',
                  color: 'var(--text-secondary)',
                  margin: 0,
                  lineHeight: '1.6',
                }}>
                  页面遇到了一些问题，别担心，我们的开发团队已经收到通知。
                </p>
              </div>
            </div>

            <div style={{
              padding: '24px',
              backgroundColor: theme === 'dark' ? '#1a1a1a' : '#fef3f2',
              borderRadius: '16px',
              marginBottom: '24px',
            }}>
              <h2 style={{
                fontSize: '18px',
                fontWeight: '700',
                color: 'var(--text-primary)',
                margin: '0 0 16px 0',
              }}>
                错误详情
              </h2>
              <div style={{
                marginBottom: '16px',
                padding: '16px',
                backgroundColor: theme === 'dark' ? '#0d0d0d' : '#ffffff',
                borderRadius: '12px',
                border: `1px solid ${theme === 'dark' ? '#2a2a2a' : '#e5e7eb'}`,
              }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: 'var(--text-secondary)',
                  marginBottom: '8px',
                }}>
                  错误类型：{categorizedError.title}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: 'var(--text-secondary)',
                  marginBottom: '8px',
                  lineHeight: '1.6',
                }}>
                  {categorizedError.message}
                </div>
                {categorizedError.code && (
                  <div style={{
                    fontSize: '14px',
                    color: 'var(--text-tertiary)',
                    fontFamily: 'var(--font-mono)',
                  }}>
                    错误代码：{categorizedError.code}
                  </div>
                )}
              </div>

              {categorizedError.solution && (
                <>
                  <h2 style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: 'var(--text-primary)',
                    margin: '0 0 16px 0',
                  }}>
                    解决建议
                  </h2>
                  <p style={{
                    fontSize: '15px',
                    color: 'var(--text-secondary)',
                    margin: '0 0 12px 0',
                    lineHeight: '1.6',
                  }}>
                    {categorizedError.solution.description}
                  </p>
                  <ol style={{
                    paddingLeft: '20px',
                    margin: '0 0 20px 0',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.8',
                  }}>
                    {categorizedError.solution.steps.map((step, idx) => (
                      <li key={idx} style={{ marginBottom: '8px' }}>{step}</li>
                    ))}
                  </ol>
                </>
              )}
            </div>

            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              justifyContent: 'center',
            }}>
              <button
                onClick={this.handleReset}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '14px 28px',
                  backgroundColor: '#10b981',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontSize: '15px',
                  fontWeight: '600',
                  color: '#ffffff',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                }}
              >
                <RefreshCw style={{ width: '18px', height: '18px' }} />
                <span>重试</span>
              </button>

              <button
                onClick={() => window.location.href = '/'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '14px 28px',
                  backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
                  border: `1px solid ${theme === 'dark' ? '#2a2a2a' : '#e5e7eb'}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontSize: '15px',
                  fontWeight: '600',
                  color: 'var(--text-secondary)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#10b981';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = theme === 'dark' ? '#2a2a2a' : '#e5e7eb';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <Home style={{ width: '18px', height: '18px' }} />
                <span>返回首页</span>
              </button>

              <button
                onClick={this.handleCopyError}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '14px 28px',
                  backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
                  border: `1px solid ${theme === 'dark' ? '#2a2a2a' : '#e5e7eb'}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontSize: '15px',
                  fontWeight: '600',
                  color: 'var(--text-secondary)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#10b981';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = theme === 'dark' ? '#2a2a2a' : '#e5e7eb';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <Copy style={{ width: '18px', height: '18px' }} />
                <span>复制错误</span>
              </button>

              <a
                href="mailto:support@kaiyan.com?subject=错误反馈"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '14px 28px',
                  backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
                  border: `1px solid ${theme === 'dark' ? '#2a2a2a' : '#e5e7eb'}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontSize: '15px',
                  fontWeight: '600',
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#10b981';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = theme === 'dark' ? '#2a2a2a' : '#e5e7eb';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <Mail style={{ width: '18px', height: '18px' }} />
                <span>联系客服</span>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
