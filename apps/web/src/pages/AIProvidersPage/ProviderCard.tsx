import { useState } from 'react';
import { CheckCircle, XCircle, ChevronDown, TestTube, Pencil, Trash2, Plus, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';
import { PROVIDER_TYPES } from './constants';
import { ProviderCardProps } from './types';
import { EmptyState } from './EmptyState';

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
  isDark,
  colors,
  accentColor,
}: ProviderCardProps) {
  const [expandHover, setExpandHover] = useState(false);
  const [testHover, setTestHover] = useState(false);
  const [editHover, setEditHover] = useState(false);
  const [deleteHover, setDeleteHover] = useState(false);
  const [keyButtonHover, setKeyButtonHover] = useState(false);

  // 确保colors有默认值
  const finalColors = colors || (isDark ? {
    bgPrimary: 'rgba(5, 5, 10, 0.95)',
    bgSecondary: 'rgba(255, 255, 255, 0.03)',
    bgGlass: 'rgba(255, 255, 255, 0.04)',
    bgGlassHover: 'rgba(255, 255, 255, 0.06)',
    textPrimary: '#fafafa',
    textSecondary: 'rgba(250, 250, 250, 0.6)',
    textMuted: 'rgba(250, 250, 250, 0.4)',
    border: 'rgba(255, 255, 255, 0.06)',
    borderHover: 'rgba(139, 92, 246, 0.25)',
  } : {
    bgPrimary: 'rgba(255, 255, 255, 0.92)',
    bgSecondary: 'rgba(0, 0, 0, 0.02)',
    bgGlass: 'rgba(0, 0, 0, 0.02)',
    bgGlassHover: 'rgba(0, 0, 0, 0.04)',
    textPrimary: '#18181b',
    textSecondary: 'rgba(24, 24, 27, 0.6)',
    textMuted: 'rgba(24, 24, 27, 0.4)',
    border: 'rgba(0, 0, 0, 0.06)',
    borderHover: 'rgba(139, 92, 246, 0.25)',
  });

  const providerInfo = PROVIDER_TYPES.find((p) => p.value === provider.type) || PROVIDER_TYPES[0];

  return (
    <div
      style={{
        padding: '28px',
        background: finalColors.bgGlass,
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        border: isExpanded ? `1px solid ${providerInfo.color}` : `1px solid ${finalColors.border}`,
        transition: 'all 0.3s ease',
        boxShadow: isDark 
          ? '0 20px 40px rgba(0, 0, 0, 0.15), 0 0 30px rgba(139, 92, 246, 0.1)'
          : '0 8px 24px rgba(0, 0, 0, 0.05)',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        if (!isExpanded) {
          e.currentTarget.style.transform = 'translateY(-6px)';
          e.currentTarget.style.borderColor = `${providerInfo.color}40`;
          e.currentTarget.style.boxShadow = isDark 
            ? '0 28px 56px rgba(0, 0, 0, 0.25), 0 0 40px rgba(139, 92, 246, 0.15)'
            : '0 16px 36px rgba(0, 0, 0, 0.12)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isExpanded) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.borderColor = finalColors.border;
          e.currentTarget.style.boxShadow = isDark 
            ? '0 20px 40px rgba(0, 0, 0, 0.15), 0 0 30px rgba(139, 92, 246, 0.1)'
            : '0 8px 24px rgba(0, 0, 0, 0.05)';
        }
      }}
    >
      {/* 装饰性光晕 */}
      {isExpanded && (
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '200px',
          height: '200px',
          background: `radial-gradient(circle, ${providerInfo.color}20 0%, transparent 70%)`,
          pointerEvents: 'none',
          zIndex: 0,
        }} />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: `linear-gradient(135deg, ${providerInfo.color} 0%, ${providerInfo.color}cc 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: `0 12px 32px ${providerInfo.color}40`,
            transition: 'all 0.3s ease',
            transform: isExpanded ? 'scale(1.05)' : 'scale(1)',
          }}>
            <providerInfo.icon style={{ width: '32px', height: '32px', color: '#ffffff' }} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
              <h3 style={{
                fontSize: '20px', 
                fontWeight: '700', 
                color: finalColors.textPrimary, 
                margin: 0,
                background: isExpanded 
                  ? `linear-gradient(135deg, ${providerInfo.color} 0%, ${providerInfo.color}cc 100%)`
                  : 'none',
                WebkitBackgroundClip: isExpanded ? 'text' : 'none',
                WebkitTextFillColor: isExpanded ? 'transparent' : finalColors.textPrimary,
                transition: 'all 0.3s ease',
              }}>
                {providerInfo.label}
              </h3>
              <span style={{
                padding: '6px 14px',
                backgroundColor: provider.enabled ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                color: provider.enabled ? '#10b981' : '#ef4444',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease',
                border: `1px solid ${provider.enabled ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
              }}>
                {provider.enabled ? <CheckCircle style={{ width: '14px', height: '14px' }} /> : <XCircle style={{ width: '14px', height: '14px' }} />}
                {provider.enabled ? '已启用' : '已禁用'}
              </span>
            </div>
            <p style={{ 
              fontSize: '14px', 
              color: finalColors.textSecondary, 
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <span>{provider.models?.length || 0} 个模型</span>
              {isExpanded && (
                <Sparkles style={{ 
                  width: '14px', 
                  height: '14px', 
                  color: providerInfo.color,
                  animation: 'pulse 1.5s infinite',
                }} />
              )}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => onToggleExpand(provider.id)}
            onMouseEnter={() => setExpandHover(true)}
            onMouseLeave={() => setExpandHover(false)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: isExpanded ? `${providerInfo.color}15` : finalColors.bgGlassHover,
              border: isExpanded ? `1px solid ${providerInfo.color}30` : `1px solid ${finalColors.border}`,
              borderRadius: '14px',
              fontSize: '14px',
              fontWeight: '600',
              color: isExpanded ? providerInfo.color : finalColors.textPrimary,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: expandHover 
                ? `0 8px 24px ${providerInfo.color}20` 
                : '0 4px 12px rgba(0, 0, 0, 0.05)',
              transform: expandHover ? 'translateY(-2px)' : 'translateY(0)',
            }}
          >
            {isExpanded ? '收起' : '展开'}
            <ChevronDown style={{ 
              width: '18px', 
              height: '18px', 
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', 
              transition: 'transform 0.3s ease',
              color: isExpanded ? providerInfo.color : finalColors.textSecondary,
            }} />
          </button>
          <button
            onClick={() => onTest(provider.id)}
            onMouseEnter={() => setTestHover(true)}
            onMouseLeave={() => setTestHover(false)}
            disabled={testingProvider === provider.id}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: testingProvider === provider.id ? `${providerInfo.color}20` : (testHover ? `${providerInfo.color}15` : finalColors.bgGlassHover),
              border: testingProvider === provider.id ? `1px solid ${providerInfo.color}40` : (testHover ? `1px solid ${providerInfo.color}30` : `1px solid ${finalColors.border}`),
              borderRadius: '14px',
              fontSize: '14px',
              fontWeight: '600',
              color: testingProvider === provider.id ? providerInfo.color : (testHover ? providerInfo.color : finalColors.textPrimary),
              cursor: testingProvider === provider.id ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: testingProvider === provider.id 
                ? `0 8px 24px ${providerInfo.color}30` 
                : (testHover ? `0 8px 24px ${providerInfo.color}20` : '0 4px 12px rgba(0, 0, 0, 0.05)'),
              transform: testHover && testingProvider !== provider.id ? 'translateY(-2px)' : 'translateY(0)',
              opacity: testingProvider === provider.id ? 0.8 : 1,
            }}
          >
            {testingProvider === provider.id ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ 
                  width: '18px', 
                  height: '18px', 
                  borderRadius: '50%', 
                  border: `2px solid ${providerInfo.color}`, 
                  borderTop: '2px solid transparent', 
                  animation: 'spin 1s linear infinite'
                }} />
                测试中...
              </div>
            ) : (
              <>
                <TestTube style={{ width: '18px', height: '18px' }} />
                测试
              </>
            )}
          </button>
          <button
            onClick={() => onEdit(provider)}
            onMouseEnter={() => setEditHover(true)}
            onMouseLeave={() => setEditHover(false)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: editHover ? `${providerInfo.color}15` : finalColors.bgGlassHover,
              border: editHover ? `1px solid ${providerInfo.color}30` : `1px solid ${finalColors.border}`,
              borderRadius: '14px',
              fontSize: '14px',
              fontWeight: '600',
              color: editHover ? providerInfo.color : finalColors.textPrimary,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: editHover 
                ? `0 8px 24px ${providerInfo.color}20` 
                : '0 4px 12px rgba(0, 0, 0, 0.05)',
              transform: editHover ? 'translateY(-2px)' : 'translateY(0)',
            }}
          >
            <Pencil style={{ width: '18px', height: '18px' }} />
            编辑
          </button>
          <button
            onClick={() => onDelete(provider.id)}
            onMouseEnter={() => setDeleteHover(true)}
            onMouseLeave={() => setDeleteHover(false)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: deleteHover ? 'rgba(239, 68, 68, 0.1)' : finalColors.bgGlassHover,
              border: deleteHover ? '1px solid rgba(239, 68, 68, 0.3)' : `1px solid ${finalColors.border}`,
              borderRadius: '14px',
              fontSize: '14px',
              fontWeight: '600',
              color: deleteHover ? '#ef4444' : finalColors.textPrimary,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: deleteHover 
                ? '0 8px 24px rgba(239, 68, 68, 0.2)' 
                : '0 4px 12px rgba(0, 0, 0, 0.05)',
              transform: deleteHover ? 'translateY(-2px)' : 'translateY(0)',
            }}
          >
            <Trash2 style={{ width: '18px', height: '18px' }} />
            删除
          </button>
        </div>

        {isExpanded && (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '24px', 
            paddingTop: '24px', 
            borderTop: `1px solid ${finalColors.border}`,
            animation: 'slideDown 0.3s ease',
          }}>
            <div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '16px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Lock style={{ 
                    width: '20px', 
                    height: '20px', 
                    color: finalColors.textMuted,
                  }} />
                  <span style={{ 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    color: finalColors.textPrimary,
                  }}>
                    API 密钥
                  </span>
                </div>
                <button
                  onClick={() => onToggleApiKeyVisibility(provider.id)}
                  onMouseEnter={() => setKeyButtonHover(true)}
                  onMouseLeave={() => setKeyButtonHover(false)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    background: keyButtonHover ? `${providerInfo.color}15` : finalColors.bgGlassHover,
                    border: keyButtonHover ? `1px solid ${providerInfo.color}30` : `1px solid ${finalColors.border}`,
                    borderRadius: '14px',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: keyButtonHover ? providerInfo.color : finalColors.textPrimary,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: keyButtonHover 
                      ? `0 4px 12px ${providerInfo.color}20` 
                      : '0 2px 8px rgba(0, 0, 0, 0.05)',
                  }}
                >
                  {isApiKeyVisible ? <EyeOff style={{ width: '16px', height: '16px' }} /> : <Eye style={{ width: '16px', height: '16px' }} />}
                  {isApiKeyVisible ? '隐藏' : '显示'}
                </button>
              </div>
              <div style={{
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                fontSize: '14px',
                color: finalColors.textPrimary,
                wordBreak: 'break-all',
                padding: '18px 20px',
                backgroundColor: finalColors.bgGlass,
                borderRadius: '16px',
                border: `1px solid ${finalColors.border}`,
                lineHeight: '1.5',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
                backdropFilter: 'blur(10px)',
              }}>
                {isApiKeyVisible ? provider.api_key : '•'.repeat(48)}
              </div>
            </div>

            <div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '20px',
              }}>
                <span style={{ 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  color: finalColors.textPrimary,
                }}>
                  模型
                </span>
                <button
                  onClick={() => onAddModel(provider)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 24px',
                    background: `linear-gradient(135deg, ${providerInfo.color} 0%, ${providerInfo.color}cc 100%)`,
                    border: 'none',
                    borderRadius: '14px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: `0 8px 24px ${providerInfo.color}40`,
                    transform: 'translateY(-2px)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                    e.currentTarget.style.boxShadow = `0 12px 32px ${providerInfo.color}50`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1)';
                    e.currentTarget.style.boxShadow = `0 8px 24px ${providerInfo.color}40`;
                  }}
                >
                  <Plus style={{ width: '18px', height: '18px' }} />
                  添加模型
                </button>
              </div>

              {!provider.models || provider.models.length === 0 ? (
                <EmptyState 
                  type="models" 
                  providerColor={providerInfo.color}
                 
                  colors={finalColors}
                 
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {provider.models.map((model) => (
                    <div
                      key={model.id}
                      style={{
                        padding: '20px 24px',
                        backgroundColor: finalColors.bgGlassHover,
                        borderRadius: '20px',
                        border: `1px solid ${finalColors.border}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all 0.3s ease',
                        backdropFilter: 'blur(10px)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = `${providerInfo.color}40`;
                        e.currentTarget.style.transform = 'translateX(6px) translateY(-2px)';
                        e.currentTarget.style.boxShadow = `0 8px 24px ${providerInfo.color}20`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = finalColors.border;
                        e.currentTarget.style.transform = 'translateX(0) translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ 
                          fontSize: '16px', 
                          fontWeight: '600', 
                          color: finalColors.textPrimary, 
                          marginBottom: '8px',
                        }}>
                          {model.name}
                        </div>
                        <div style={{ 
                          fontSize: '13px', 
                          color: finalColors.textMuted, 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '12px',
                          flexWrap: 'wrap',
                        }}>
                          <span>{model.model_id}</span>
                          {model.is_assistant_default && (
                            <span style={{
                              padding: '6px 14px',
                              backgroundColor: `${accentColor}15`,
                              color: accentColor,
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: '600',
                              border: `1px solid ${accentColor}30`,
                            }}>
                              默认模型
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          onClick={() => onEditModel(provider, model)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '44px',
                            height: '44px',
                            borderRadius: '12px',
                            border: `1px solid ${finalColors.border}`,
                            background: finalColors.bgGlass,
                            color: finalColors.textMuted,
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = `${providerInfo.color}40`;
                            e.currentTarget.style.color = providerInfo.color;
                            e.currentTarget.style.transform = 'scale(1.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = finalColors.border;
                            e.currentTarget.style.color = finalColors.textMuted;
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        >
                          <Pencil style={{ width: '18px', height: '18px' }} />
                        </button>
                        <button
                          onClick={() => onTestModel(model.id)}
                          disabled={testingModel === model.id}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '44px',
                            height: '44px',
                            borderRadius: '12px',
                            border: testingModel === model.id ? `1px solid ${providerInfo.color}40` : `1px solid ${finalColors.border}`,
                            background: testingModel === model.id ? `${providerInfo.color}15` : finalColors.bgGlass,
                            color: testingModel === model.id ? providerInfo.color : finalColors.textMuted,
                            cursor: testingModel === model.id ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s ease',
                            opacity: testingModel === model.id ? 0.8 : 1,
                          }}
                          onMouseEnter={(e) => {
                            if (testingModel !== model.id) {
                              e.currentTarget.style.borderColor = `${providerInfo.color}40`;
                              e.currentTarget.style.color = providerInfo.color;
                              e.currentTarget.style.transform = 'scale(1.1)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (testingModel !== model.id) {
                              e.currentTarget.style.borderColor = finalColors.border;
                              e.currentTarget.style.color = finalColors.textMuted;
                              e.currentTarget.style.transform = 'scale(1)';
                            }
                          }}
                        >
                          {testingModel === model.id ? (
                            <div style={{ 
                              width: '18px', 
                              height: '18px', 
                              borderRadius: '50%', 
                              border: `2px solid ${providerInfo.color}`, 
                              borderTop: '2px solid transparent', 
                              animation: 'spin 1s linear infinite'
                            }} />
                          ) : (
                            <TestTube style={{ width: '18px', height: '18px' }} />
                          )}
                        </button>
                        <button
                          onClick={() => onDeleteModel(provider, model)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '44px',
                            height: '44px',
                            borderRadius: '12px',
                            border: `1px solid ${finalColors.border}`,
                            background: finalColors.bgGlass,
                            color: finalColors.textMuted,
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                            e.currentTarget.style.color = '#ef4444';
                            e.currentTarget.style.transform = 'scale(1.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = finalColors.border;
                            e.currentTarget.style.color = finalColors.textMuted;
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        >
                          <Trash2 style={{ width: '18px', height: '18px' }} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
