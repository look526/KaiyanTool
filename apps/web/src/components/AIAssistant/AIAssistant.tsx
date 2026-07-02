import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { X, Send, MessageSquare, Sparkles, Loader2, Minimize2, Settings } from 'lucide-react';
import { getCsrfToken } from '../../lib/csrf';
import { ModelSelector } from '../ui/ModelSelector';
import { useAvailableAIModels } from '../../hooks/useAvailableAIModels';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onMinimize?: () => void;
}

const MESSAGE_PLACEHOLDER = '输入问题或描述需求...';
const WELCOME_ACTIONS = [
  { icon: '✨', text: '快速入门指导' },
  { icon: '📚', text: '创作功能说明' },
  { icon: '🔧', text: '问题解答' },
  { icon: '💡', text: '创意激发' }
];

function AIAssistantComponent({ isOpen, onClose, onMinimize }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [csrfToken, setCsrfTokenState] = useState<string>('');
  const { models, getModel } = useAvailableAIModels('text');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (isOpen) {
      getCsrfToken().then(setCsrfTokenState).catch(console.error);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!selectedModel && models.length > 0) {
      setSelectedModel(models[0].id);
    }
  }, [models, selectedModel]);

  useEffect(() => {
    const selected = getModel(selectedModel);
    if (selected?.provider_id && selected.provider_id !== selectedProvider) {
      setSelectedProvider(selected.provider_id);
    }
  }, [getModel, selectedModel, selectedProvider]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const handleSend = useCallback(async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) {
      return;
    }

    const userMessage: Message = {
      role: 'user',
      content: trimmedInput,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        credentials: 'include',
        signal: abortController.signal,
        body: JSON.stringify({
          message: trimmedInput,
          conversation: messages.slice(-5).map(m => ({
            role: m.role,
            content: m.content
          })),
          context: {
            page: window.location.pathname
          },
          provider: selectedProvider,
          model: selectedModel
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error Response:', errorData);
        
        let errorMessage = '请求失败';
        if (typeof errorData.error === 'string') {
          errorMessage = errorData.error;
        } else if (errorData.error && typeof errorData.error === 'object') {
          errorMessage = errorData.error.message || errorData.error.code || JSON.stringify(errorData.error);
        } else if (errorData.code) {
          errorMessage = errorData.code;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI assistant error:', error);
      
      let errorMessage = '抱歉，我遇到了一些问题。请稍后再试。';
      if (error instanceof Error) {
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
        
        if (error.name === 'AbortError') {
          return;
        }
        
        if (error.message.includes('CSRF') || error.message.includes('CSRF_TOKEN')) {
          errorMessage = 'CSRF令牌无效或已过期，请刷新页面重试';
          getCsrfToken().then(setCsrfTokenState).catch(console.error);
        } else if (error.message.includes('权限不足') || error.message.includes('FORBIDDEN')) {
          errorMessage = '您没有使用AI助手的权限';
        } else if (error.message.includes('未配置AI提供商') || error.message.includes('No AI provider available')) {
          errorMessage = '系统未配置AI服务，请联系管理员';
        } else if (error.message.includes('timeout') || error.message.includes('超时')) {
          errorMessage = 'AI响应超时，请稍后再试';
        } else if (error.message.includes('请求失败')) {
          errorMessage = '请求失败，请检查网络连接后重试';
        } else {
          errorMessage = error.message;
        }
      } else {
        console.error('Unknown error type:', typeof error, error);
      }
      
      const errorInfo: Message = {
        role: 'assistant',
        content: errorMessage,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorInfo]);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [input, isLoading, messages, selectedProvider, selectedModel]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handleMinimize = useCallback(() => {
    setIsMinimized(prev => !prev);
    onMinimize?.();
  }, [onMinimize]);

  const handleClearHistory = useCallback(() => {
    setMessages([]);
  }, []);

  if (!isOpen) return null;

  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    right: '20px',
    bottom: '20px',
    width: isMinimized ? '280px' : '400px',
    maxWidth: 'calc(100vw - 40px)',
    maxHeight: isMinimized ? 'auto' : (showSettings ? '700px' : '600px'),
    backgroundColor: 'var(--bg-base)',
    border: '1px solid var(--border-primary)',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.3s ease'
  };

  return (
    <div style={containerStyle} role="dialog" aria-label="AI助手对话框">
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px',
        borderBottom: '1px solid var(--border-primary)',
        backgroundColor: 'var(--bg-secondary)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }} aria-hidden="true">
            <Sparkles style={{ width: '20px', height: '20px', color: 'white' }} />
          </div>
          <div>
            <div style={{
              fontSize: '16px',
              fontWeight: '600',
              color: 'var(--text-primary)'
            }}>
              AI助手
            </div>
            <div style={{
              fontSize: '12px',
              color: 'var(--text-tertiary)'
            }}>
              随时为您服务
            </div>
          </div>
        </div>
        <div style={{
          display: 'flex',
          gap: '8px'
        }}>
          <button
            onClick={() => setShowSettings(!showSettings)}
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              padding: '4px',
              color: showSettings ? 'var(--accent)' : 'var(--text-tertiary)',
              borderRadius: '4px'
            }}
            aria-label="模型设置"
          >
            <Settings style={{ width: '20px', height: '20px' }} />
          </button>
          <button
            onClick={handleMinimize}
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              padding: '4px',
              color: 'var(--text-tertiary)',
              borderRadius: '4px'
            }}
            aria-label={isMinimized ? '展开' : '收起'}
          >
            <Minimize2 style={{ width: '20px', height: '20px' }} />
          </button>
          <button
            onClick={onClose}
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              padding: '4px',
              color: 'var(--text-tertiary)',
              borderRadius: '4px'
            }}
            aria-label="关闭"
          >
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>
      </div>

      {showSettings && !isMinimized && (
        <div style={{
          padding: '16px',
          borderBottom: '1px solid var(--border-primary)',
          backgroundColor: 'var(--bg-surface)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          maxHeight: '280px',
          overflowY: 'auto'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span style={{
              fontSize: '13px',
              fontWeight: '600',
              color: 'var(--text-primary)'
            }}>
              AI 模型设置
            </span>
          </div>
          
          {models.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                <label style={{
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  fontWeight: '500'
                }}>
                  选择模型
                </label>
                <ModelSelector
                  content_type="text"
                  value={selectedModel}
                  on_change={setSelectedModel}
                  placeholder="选择 AI 助手模型"
                  auto_select_when_empty
                  show_default
                  show_last_used
                />
              </div>
            </div>
          ) : (
            <div style={{
              padding: '20px',
              textAlign: 'center',
              color: 'var(--text-tertiary)',
              fontSize: '13px',
              backgroundColor: 'var(--bg-elevated)',
              borderRadius: '12px',
              border: '1px solid var(--border-primary)'
            }}>
              暂无可用的AI提供商，请先在设置中配置
            </div>
          )}
        </div>
      )}

      {!isMinimized && (
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          minHeight: '300px',
          maxHeight: '450px'
        }} role="log" aria-live="polite" aria-atomic="true">
          {messages.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: 'var(--text-tertiary)'
            }}>
              <MessageSquare style={{ 
                width: '48px', 
                height: '48px', 
                margin: '0 auto 16px',
                color: 'var(--accent)'
              }} aria-hidden="true" />
              <p style={{ marginBottom: '12px', fontSize: '14px', margin: 0 }}>
                你好！我是你的AI助手，可以帮助你：
              </p>
              <div style={{
                textAlign: 'left',
                display: 'inline-block',
                fontSize: '13px',
                lineHeight: '1.8'
              }}>
                {WELCOME_ACTIONS.map((action, index) => (
                  <div key={index}>
                    {action.icon} {action.text}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    alignItems: message.role === 'user' ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div style={{
                    maxWidth: '80%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    backgroundColor: message.role === 'user' 
                      ? 'var(--accent)' 
                      : 'var(--bg-secondary)',
                    color: message.role === 'user' 
                      ? 'white' 
                      : 'var(--text-primary)',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    wordWrap: 'break-word'
                  }}>
                    {message.content}
                  </div>
                  <span style={{
                    fontSize: '11px',
                    color: 'var(--text-muted)'
                  }}>
                    {message.timestamp.toLocaleTimeString('zh-CN', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
              ))}
              {isLoading && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 16px',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '12px',
                  color: 'var(--text-tertiary)',
                  fontSize: '14px'
                }} aria-live="polite">
                  <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} aria-hidden="true" />
                  AI正在思考...
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      <div style={{
        padding: '12px',
        borderTop: '1px solid var(--border-primary)',
        backgroundColor: 'var(--bg-secondary)'
      }}>
        <div style={{
          display: 'flex',
          gap: '8px'
        }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={MESSAGE_PLACEHOLDER}
            disabled={isLoading}
            aria-label="输入消息"
            style={{
              flex: 1,
              padding: '10px 14px',
              border: '1px solid var(--border-primary)',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-base)',
              color: 'var(--text-primary)',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.2s ease'
            }}
          />
          {messages.length > 0 && !isMinimized && (
            <button
              onClick={handleClearHistory}
              disabled={isLoading}
              style={{
                padding: '10px 16px',
                border: '1px solid var(--border-primary)',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-base)',
                color: 'var(--text-tertiary)',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.5 : 1,
                fontSize: '13px',
                fontWeight: '500'
              }}
              aria-label="清空对话历史"
            >
              清空
            </button>
          )}
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            style={{
              padding: '10px 16px',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: 'var(--accent)',
              color: 'white',
              cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
              opacity: input.trim() && !isLoading ? 1 : 0.5,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px',
              fontWeight: '500'
            }}
            aria-label="发送消息"
          >
            {isLoading ? (
              <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} aria-hidden="true" />
            ) : (
              <Send style={{ width: '16px', height: '16px' }} />
            )}
            发送
          </button>
        </div>
      </div>
    </div>
  );
}

const AIAssistant = memo(AIAssistantComponent);
AIAssistant.displayName = 'AIAssistant';

export default AIAssistant;
