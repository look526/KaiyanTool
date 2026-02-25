import {
  ChevronDown,
  ChevronRight,
  TestTube,
  CheckCircle,
  XCircle,
  Loader2,
  Edit2,
  Trash2,
  Shield,
  Eye,
  EyeOff,
  Plus,
  LayoutGrid,
  Settings2,
  Trash,
  Sparkles,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { PROVIDER_TYPES, CONTENT_TYPES } from './constants';
import { ProviderCardProps, AIProviderModel } from './types';

const ActionButton = ({ 
  icon: Icon, 
  label, 
  variant = 'secondary', 
  onClick, 
  disabled = false,
  loading = false,
  className = ''
}: { 
  icon?: React.ElementType, 
  label: string, 
  variant?: 'primary' | 'secondary' | 'danger' | 'success',
  onClick?: () => void, 
  disabled?: boolean,
  loading?: boolean,
  className?: string
}) => (
  <button
    onClick={onClick}
    disabled={disabled || loading}
    className={className}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
      padding: '8px 16px',
      fontSize: '13px',
      fontWeight: '600',
      borderRadius: '10px',
      border: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      transition: 'all 0.2s ease',
      ...(variant === 'primary' && {
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        color: '#ffffff',
        boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
      }),
      ...(variant === 'secondary' && {
        background: 'var(--bg-surface)',
        color: 'var(--text-primary)',
        border: '1px solid var(--border-primary)',
      }),
      ...(variant === 'danger' && {
        background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
        color: '#ffffff',
        boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
      }),
      ...(variant === 'success' && {
        background: 'linear-gradient(135deg, #10b981 0%, #22c55e 100%)',
        color: '#ffffff',
        boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
      }),
    }}
    onMouseEnter={(e) => {
      if (disabled) return;
      e.currentTarget.style.transform = 'translateY(-1px)';
      if (variant === 'primary') {
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.4)';
      } else if (variant === 'danger') {
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
      } else if (variant === 'success') {
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
      } else {
        e.currentTarget.style.borderColor = '#6366f1';
        e.currentTarget.style.color = '#6366f1';
      }
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      if (variant === 'primary') {
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(99, 102, 241, 0.3)';
      } else if (variant === 'danger') {
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.3)';
      } else if (variant === 'success') {
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.3)';
      } else {
        e.currentTarget.style.borderColor = 'var(--border-primary)';
        e.currentTarget.style.color = 'var(--text-primary)';
      }
    }}
  >
    {loading ? (
      <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} />
    ) : Icon ? (
      <Icon style={{ width: '14px', height: '14px' }} />
    ) : null}
    {label}
  </button>
);

const IconButton = ({ 
  icon: Icon, 
  label, 
  variant = 'secondary', 
  onClick, 
  disabled = false,
  loading = false,
}: { 
  icon: React.ElementType, 
  label: string, 
  variant?: 'secondary' | 'danger' | 'success',
  onClick?: () => void, 
  disabled?: boolean,
  loading?: boolean,
}) => (
  <button
    onClick={onClick}
    disabled={disabled || loading}
    aria-label={label}
    title={label}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '36px',
      height: '36px',
      borderRadius: '10px',
      border: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      transition: 'all 0.2s ease',
      ...(variant === 'secondary' && {
        background: 'var(--bg-surface)',
        color: 'var(--text-secondary)',
        border: '1px solid var(--border-primary)',
      }),
      ...(variant === 'danger' && {
        background: 'rgba(239, 68, 68, 0.1)',
        color: '#ef4444',
      }),
      ...(variant === 'success' && {
        background: 'rgba(16, 185, 129, 0.1)',
        color: '#10b981',
      }),
    }}
    onMouseEnter={(e) => {
      if (disabled) return;
      if (variant === 'danger') {
        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
      } else if (variant === 'success') {
        e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)';
      } else {
        e.currentTarget.style.borderColor = '#6366f1';
        e.currentTarget.style.color = '#6366f1';
      }
    }}
    onMouseLeave={(e) => {
      if (variant === 'danger') {
        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
      } else if (variant === 'success') {
        e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)';
      } else {
        e.currentTarget.style.borderColor = 'var(--border-primary)';
        e.currentTarget.style.color = 'var(--text-secondary)';
      }
    }}
  >
    {loading ? (
      <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
    ) : (
      <Icon style={{ width: '16px', height: '16px' }} />
    )}
  </button>
);

export function ProviderCard({
  provider,
  isExpanded,
  isApiKeyVisible,
  isAdmin,
  onToggleExpand,
  onToggleApiKeyVisibility,
  onEdit,
  onDelete,
  onTest,
  onAddModel,
  onEditModel,
  onDeleteModel,
  onTestModel,
  onSetAssistantDefault,
  onUnsetAssistantDefault,
  testingProvider,
  testingModel,
  isMobile,
  isTablet,
}: ProviderCardProps) {
  const providerInfo = PROVIDER_TYPES.find((p) => p.value === provider.type) || PROVIDER_TYPES[0];

  const getContentTypeInfo = (type: string) => {
    return CONTENT_TYPES.find((c) => c.value === type) || CONTENT_TYPES[0];
  };

  const getFirstContentTypeInfo = (types: string[]) => {
    if (!types || types.length === 0) return CONTENT_TYPES[0];
    return CONTENT_TYPES.find((c) => c.value === types[0]) || CONTENT_TYPES[0];
  };

  const renderModelCard = (model: AIProviderModel) => {
    const contentTypeInfo = getFirstContentTypeInfo(model.types);
    return (
      <div key={model.id} style={{
        padding: '24px',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: '20px',
        border: `1px solid var(--border-primary)`,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = `0 24px 48px -12px rgba(0, 0, 0, 0.15), 0 12px 24px -8px rgba(0, 0, 0, 0.1)`;
        e.currentTarget.style.borderColor = contentTypeInfo.color;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)';
        e.currentTarget.style.borderColor = 'var(--border-primary)';
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: `linear-gradient(135deg, ${contentTypeInfo.color} 0%, ${contentTypeInfo.color}dd 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 8px 20px ${contentTypeInfo.color}35`,
              flexShrink: 0,
            }}>
              <contentTypeInfo.icon style={{ width: '28px', height: '28px', color: '#ffffff' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h4 style={{
                fontSize: '18px',
                fontWeight: '700',
                color: 'var(--text-primary)',
                marginBottom: '8px',
                margin: 0,
                letterSpacing: '-0.3px',
              }}>
                {model.name}
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {model.types && model.types.map((type, idx) => {
                  const typeInfo = getContentTypeInfo(type);
                  return (
                    <span key={idx} style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      backgroundColor: `${typeInfo.color}15`,
                      color: typeInfo.color,
                      fontSize: '11px',
                      fontWeight: '600',
                      letterSpacing: '0.3px',
                    }}>
                      <typeInfo.icon style={{ width: '11px', height: '11px' }} />
                      {typeInfo.label}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {model.description && (
          <p style={{
            fontSize: '14px',
            color: 'var(--text-secondary)',
            marginBottom: '20px',
            margin: 0,
            lineHeight: '1.7',
            padding: '16px',
            backgroundColor: 'var(--bg-elevated)',
            borderRadius: '12px',
          }}>
            {model.description}
          </p>
        )}

        {model.capabilities.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
            {model.capabilities.map((cap, idx) => (
              <span key={idx} style={{
                padding: '6px 14px',
                backgroundColor: `${contentTypeInfo.color}12`,
                color: contentTypeInfo.color,
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600',
                letterSpacing: '0.3px',
              }}>
                {cap}
              </span>
            ))}
          </div>
        )}

        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          paddingTop: '16px', 
          borderTop: '1px solid var(--border-primary)',
          justifyContent: 'flex-end'
        }}>
          {isAdmin && (
            model.isAssistantDefault ? (
              <ActionButton
                icon={CheckCircle}
                label="AI助手"
                variant="primary"
                onClick={() => onUnsetAssistantDefault(model.id)}
              />
            ) : (
              <ActionButton
                icon={Sparkles}
                label="设为AI助手"
                variant="secondary"
                onClick={() => onSetAssistantDefault(model.id)}
              />
            )
          )}
          <ActionButton
            icon={Edit2}
            label="编辑"
            variant="secondary"
            onClick={() => onEditModel(provider, model)}
          />
          <ActionButton
            icon={TestTube}
            label={testingModel === model.id ? '测试中' : '测试'}
            variant="success"
            onClick={() => onTestModel(model.id)}
            disabled={testingModel === model.id}
            loading={testingModel === model.id}
          />
          <ActionButton
            icon={Trash2}
            label="删除"
            variant="danger"
            onClick={() => onDeleteModel(provider, model)}
          />
        </div>
      </div>
    );
  };

  return (
    <Card key={provider.id} style={{
      padding: isMobile ? '20px' : '32px',
      border: `1px solid ${isExpanded ? providerInfo.color : 'var(--border-primary)'}`,
      boxShadow: isExpanded ? `0 10px 25px -5px ${providerInfo.color}20, 0 8px 10px -6px ${providerInfo.color}15` : '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)',
      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden',
    }}
    onMouseEnter={(e) => {
      if (!isExpanded) {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = `0 20px 40px -8px ${providerInfo.color}20, 0 8px 16px -6px ${providerInfo.color}15`;
      }
    }}
    onMouseLeave={(e) => {
      if (!isExpanded) {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)';
      }
    }}>
      {isExpanded && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${providerInfo.color} 0%, ${providerInfo.color}80 100%)`,
        }} />
      )}
      
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'flex-start' : 'flex-start',
        marginBottom: isExpanded ? '32px' : '0',
        gap: isMobile ? '16px' : 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: isMobile ? '16px' : '24px', flex: 1, width: isMobile ? '100%' : 'auto' }}>
          <div style={{
            width: isMobile ? '56px' : '72px',
            height: isMobile ? '56px' : '72px',
            borderRadius: isMobile ? '16px' : '20px',
            background: `linear-gradient(135deg, ${providerInfo.color} 0%, ${providerInfo.color}cc 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 8px 24px ${providerInfo.color}30`,
            position: 'relative',
            flexShrink: 0,
          }}>
            <providerInfo.icon style={{ width: isMobile ? '28px' : '36px', height: isMobile ? '28px' : '36px', color: '#ffffff' }} />
            <div style={{
              position: 'absolute',
              bottom: '-4px',
              right: '-4px',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: provider.enabled ? 'var(--success)' : 'var(--error)',
              border: '3px solid var(--bg-surface)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {provider.enabled ? (
                <CheckCircle style={{ width: '14px', height: '14px', color: '#ffffff' }} />
              ) : (
                <XCircle style={{ width: '14px', height: '14px', color: '#ffffff' }} />
              )}
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px', flexWrap: 'wrap' }}>
              <h3 style={{
                fontSize: '22px',
                fontWeight: '800',
                color: 'var(--text-primary)',
                margin: 0,
                letterSpacing: '-0.3px',
              }}>
                {providerInfo.label}
              </h3>
              {provider.enabled ? (
                <span style={{
                  padding: '6px 16px',
                  backgroundColor: 'var(--success-bg)',
                  color: 'var(--success)',
                  borderRadius: '24px',
                  fontSize: '13px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}>
                  <CheckCircle style={{ width: '14px', height: '14px' }} />
                  已启用
                </span>
              ) : (
                <span style={{
                  padding: '6px 16px',
                  backgroundColor: 'var(--error-bg)',
                  color: 'var(--error)',
                  borderRadius: '24px',
                  fontSize: '13px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}>
                  <XCircle style={{ width: '14px', height: '14px' }} />
                  已禁用
                </span>
              )}
            </div>

            <p style={{ fontSize: '14px', color: 'var(--text-tertiary)', margin: 0, marginBottom: '12px', lineHeight: '1.6' }}>
              {providerInfo.description}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '14px', color: 'var(--text-tertiary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: 'var(--bg-surface)', borderRadius: '12px' }}>
                <LayoutGrid style={{ width: '16px', height: '16px', color: providerInfo.color }} />
                <span style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>
                  {provider.models?.length || 0} 个模型
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: 'var(--bg-surface)', borderRadius: '12px' }}>
                <TestTube style={{ width: '16px', height: '16px', color: 'var(--text-tertiary)' }} />
                <span>
                  {new Date(provider.updatedAt).toLocaleDateString('zh-CN')}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: isMobile ? 'flex-start' : 'flex-end' }}>
          <ActionButton
            icon={isExpanded ? ChevronDown : ChevronRight}
            label={isExpanded ? '收起详情' : '查看详情'}
            variant="secondary"
            onClick={() => onToggleExpand(provider.id)}
          />

          <IconButton
            icon={TestTube}
            label="测试连接"
            variant="success"
            onClick={() => onTest(provider.id)}
            loading={testingProvider === provider.id}
          />

          <IconButton
            icon={Edit2}
            label="编辑提供商"
            variant="secondary"
            onClick={() => onEdit(provider)}
          />

          <IconButton
            icon={Trash2}
            label="删除提供商"
            variant="danger"
            onClick={() => onDelete(provider.id)}
          />
        </div>
      </div>

      {isExpanded && (
        <div style={{
          paddingTop: '32px',
          borderTop: '1px solid var(--border-primary)',
          animation: 'slideDown 0.3s ease-out',
        }}>
          <style>{`
            @keyframes slideDown {
              from {
                opacity: 0;
                transform: translateY(-10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>
          
          <div style={{
            marginBottom: '28px',
            padding: '24px',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: '16px',
            border: `1px solid ${providerInfo.color}30`,
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: `linear-gradient(90deg, ${providerInfo.color} 0%, ${providerInfo.color}80 100%)`,
            }} />
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: `${providerInfo.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Shield style={{ width: '22px', height: '22px', color: providerInfo.color }} />
                </div>
                <span style={{
                  fontSize: '16px',
                  fontWeight: '700',
                  color: 'var(--text-primary)',
                }}>
                  API 密钥
                </span>
              </div>
              <ActionButton
                icon={isApiKeyVisible ? EyeOff : Eye}
                label={isApiKeyVisible ? '隐藏密钥' : '显示密钥'}
                variant="secondary"
                onClick={() => onToggleApiKeyVisibility(provider.id)}
              />
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '14px',
              color: 'var(--text-primary)',
              wordBreak: 'break-all',
              letterSpacing: '0.5px',
              padding: '16px',
              backgroundColor: 'var(--bg-base)',
              borderRadius: '12px',
              border: '1px solid var(--border-primary)',
              lineHeight: '1.6',
            }}>
              {isApiKeyVisible ? provider.apiKey : '•'.repeat(48)}
            </div>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
          }}>
            <h4 style={{
              fontSize: '20px',
              fontWeight: '800',
              color: 'var(--text-primary)',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: `${providerInfo.color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <LayoutGrid style={{ width: '22px', height: '22px', color: providerInfo.color }} />
              </div>
              模型列表
              <span style={{
                fontSize: '14px',
                fontWeight: '600',
                color: 'var(--text-tertiary)',
                marginLeft: '12px',
              }}>
                ({provider.models?.length || 0})
              </span>
            </h4>

            <ActionButton
              icon={Plus}
              label="添加模型"
              variant="primary"
              onClick={() => onAddModel(provider)}
            />
          </div>

          {!provider.models || provider.models.length === 0 ? (
            <div style={{
              padding: '64px',
              textAlign: 'center',
              backgroundColor: 'var(--bg-surface)',
              borderRadius: '16px',
              border: '2px dashed var(--border-secondary)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = providerInfo.color;
              e.currentTarget.style.backgroundColor = `${providerInfo.color}05`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-secondary)';
              e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '20px',
                backgroundColor: `${providerInfo.color}15`,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
              }}>
                <LayoutGrid style={{ width: '32px', height: '32px', color: providerInfo.color }} />
              </div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '700',
                color: 'var(--text-primary)',
                marginBottom: '12px',
                margin: '0 0 12px 0',
              }}>
                暂无模型
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-tertiary)', margin: 0, lineHeight: '1.6' }}>
                点击上方"添加模型"按钮开始配置您的第一个AI模型
              </p>
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(380px, 1fr))', 
              gap: '24px',
              padding: '4px'
            }}>
              {provider.models.map((model) => renderModelCard(model))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
