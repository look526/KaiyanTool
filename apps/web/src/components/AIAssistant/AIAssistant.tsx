import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { X, Send, MessageSquare, Sparkles, Loader2, Minimize2, Settings, Check } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIProvider {
  id: string;
  type: string;
  models: Array<{
    id: string;
    name: string;
    isAssistantDefault?: boolean;
  }>;
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
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [defaultAssistantModelId, setDefaultAssistantModelId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchProviders = useCallback(async () => {
    try {
      console.log('Fetching providers from /api/assistant/providers');
      const response = await fetch('/api/assistant/providers', {
        credentials: 'include'
      });
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        try {
          const errorJson = JSON.parse(errorText);
          console.error('Parsed error:', errorJson);
        } catch {
          console.error('Error text:', errorText);
        }
        return;
      }
      
      const data = await response.json();
      console.log('Providers data:', JSON.stringify(data, null, 2));
      setProviders(data.providers || []);
      
      // Find the default assistant model
      let defaultModelId = '';
      for (const provider of data.providers || []) {
        for (const model of provider.models || []) {
          if (model.isAssistantDefault) {
            defaultModelId = model.id;
            break;
          }
        }
        if (defaultModelId) break;
      }
      setDefaultAssistantModelId(defaultModelId);
      
      // Set selected provider and model
      if (data.providers && data.providers.length > 0) {
        const firstProvider = data.providers[0];
        setSelectedProvider(firstProvider.id);
        
        // If there's a default assistant model, use it
        if (defaultModelId) {
          setSelectedModel(defaultModelId);
        } else if (firstProvider.models && firstProvider.models.length > 0) {
          setSelectedModel(firstProvider.models[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch providers:', error);
      if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
      }
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchProviders();
    }
  }, [isOpen, fetchProviders]);

  useEffect(() => {
    const provider = providers.find(p => p.id === selectedProvider);
    if (provider && provider.models && provider.models.length > 0) {
      const modelExists = provider.models.some(m => m.id === selectedModel);
      if (modelExists) {
        return;
      }
      setSelectedModel(provider.models[0].id);
    }
  }, [selectedProvider, providers, selectedModel]);

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
          'Content-Type': 'application/json'
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
        const error = await response.json();
        throw new Error(error.error || '请求失败');
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
        if (error.name === 'AbortError') {
          return;
        }
        if (error.message.includes('权限不足')) {
          errorMessage = '您没有使用AI助手的权限';
        } else if (error.message.includes('未配置AI提供商')) {
          errorMessage = '系统未配置AI服务，请联系管理员';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'AI响应超时，请稍后再试';
        }
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
          
          {providers.length > 0 ? (
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
                  选择提供商
                </label>
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  flexWrap: 'wrap'
                }}>
                  {providers.map(provider => {
                    const isSelected = selectedProvider === provider.id;
                    return (
                      <button
                        key={provider.id}
                        onClick={() => {
                          setSelectedProvider(provider.id);
                          const p = providers.find(p => p.id === provider.id);
                          if (p && p.models && p.models.length > 0) {
                            const defaultModel = p.models.find(m => m.isAssistantDefault);
                            setSelectedModel(defaultModel?.id || p.models[0].id);
                          }
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 14px',
                          borderRadius: '10px',
                          border: isSelected ? '2px solid #6366f1' : '2px solid var(--border-primary)',
                          backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-elevated)',
                          color: isSelected ? '#6366f1' : 'var(--text-primary)',
                          fontSize: '13px',
                          fontWeight: isSelected ? '600' : '500',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {isSelected && (
                          <Check style={{ width: '14px', height: '14px', flexShrink: 0 }} />
                        )}
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '6px',
                          background: isSelected 
                            ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' 
                            : 'var(--bg-tertiary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontSize: '10px',
                          fontWeight: '700'
                        }}>
                          {provider.type === 'openai' ? 'O' : 
                           provider.type === 'google' ? 'G' : 
                           provider.type === 'zhipuai' ? 'Z' : 
                           provider.type === 'anthropic' ? 'A' :
                           provider.type?.[0]?.toUpperCase() || '?'}
                        </div>
                        {provider.type === 'openai' ? 'OpenAI' : 
                         provider.type === 'google' ? 'Google' : 
                         provider.type === 'zhipuai' ? '智谱AI' : 
                         provider.type === 'anthropic' ? 'Anthropic' :
                         provider.type || 'Unknown'}
                      </button>
                    );
                  })}
                </div>
              </div>

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
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  flexWrap: 'wrap'
                }}>
                  {(() => {
                    const provider = providers.find(p => p.id === selectedProvider);
                    if (!provider || !provider.models) return null;
                    return provider.models.map(model => {
                      const isSelected = selectedModel === model.id;
                      const isDefault = model.isAssistantDefault;
                      return (
                        <button
                          key={model.id}
                          onClick={() => setSelectedModel(model.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 14px',
                            borderRadius: '10px',
                            border: isSelected ? '2px solid #6366f1' : '2px solid var(--border-primary)',
                            backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-elevated)',
                            color: isSelected ? '#6366f1' : 'var(--text-primary)',
                            fontSize: '13px',
                            fontWeight: isSelected ? '600' : '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {isSelected && (
                            <Check style={{ width: '14px', height: '14px', flexShrink: 0 }} />
                          )}
                          {model.name}
                          {isDefault && (
                            <span style={{
                              fontSize: '10px',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                              color: '#fff',
                              fontWeight: '600',
                              textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                            }}>
                              AI助手
                            </span>
                          )}
                        </button>
                      );
                    });
                  })()}
                </div>
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
