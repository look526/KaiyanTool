import { useState } from 'react';
import { CheckCircle, XCircle, ChevronDown, TestTube, Pencil, Trash2, Plus, Lock, Eye, EyeOff } from 'lucide-react';
import { PROVIDER_TYPES } from './constants';
import { ProviderCardProps } from './types';
import { EmptyState } from './EmptyState';

export function ProviderCard({
  provider,
  isExpanded,
  isApiKeyVisible,
  onToggleExpand,
  onToggleApiKeyVisibility,
  onEdit,
  onDelete,
  onTest,
  onAddModel,
  onEditModel,
  onDeleteModel,
  onTestModel,
  testingProvider,
  testingModel,
  isDark,
  colors,
  accentColor,
}: ProviderCardProps) {
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
        borderRadius: '24px',
        border: isExpanded ? `1px solid ${providerInfo.color}` : `1px solid ${finalColors.border}`,
        transition: 'border-color 0.15s ease, background-color 0.15s ease',
        boxShadow: 'none',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        if (!isExpanded) {
          e.currentTarget.style.borderColor = `${providerInfo.color}40`;
          e.currentTarget.style.backgroundColor = finalColors.bgGlassHover;
        }
      }}
      onMouseLeave={(e) => {
        if (!isExpanded) {
          e.currentTarget.style.borderColor = finalColors.border;
          e.currentTarget.style.backgroundColor = finalColors.bgGlass;
        }
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: providerInfo.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: 'none',
            transition: 'none',
            transform: 'none',
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
                transition: 'color 0.15s ease',
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
                transition: 'none',
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
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => onToggleExpand(provider.id)}
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
              transition: 'border-color 0.15s ease, color 0.15s ease, background-color 0.15s ease',
              boxShadow: 'none',
              transform: 'none',
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
              transition: 'border-color 0.15s ease, color 0.15s ease, background-color 0.15s ease',
              boxShadow: 'none',
              transform: 'none',
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
              transition: 'border-color 0.15s ease, color 0.15s ease, background-color 0.15s ease',
              boxShadow: 'none',
              transform: 'none',
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
              transition: 'border-color 0.15s ease, color 0.15s ease, background-color 0.15s ease',
              boxShadow: 'none',
              transform: 'none',
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
            animation: 'none',
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
                    transition: 'border-color 0.15s ease, color 0.15s ease, background-color 0.15s ease',
                    boxShadow: 'none',
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
                boxShadow: 'none',
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
                    background: providerInfo.color,
                    border: 'none',
                    borderRadius: '14px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#ffffff',
                    cursor: 'pointer',
                    transition: 'opacity 0.15s ease',
                    boxShadow: 'none',
                    transform: 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
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
                        transition: 'border-color 0.15s ease, background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = `${providerInfo.color}40`;
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = finalColors.border;
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
                            transition: 'border-color 0.15s ease, color 0.15s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = `${providerInfo.color}40`;
                            e.currentTarget.style.color = providerInfo.color;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = finalColors.border;
                            e.currentTarget.style.color = finalColors.textMuted;
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
                            transition: 'border-color 0.15s ease, color 0.15s ease',
                            opacity: testingModel === model.id ? 0.8 : 1,
                          }}
                          onMouseEnter={(e) => {
                            if (testingModel !== model.id) {
                              e.currentTarget.style.borderColor = `${providerInfo.color}40`;
                              e.currentTarget.style.color = providerInfo.color;
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (testingModel !== model.id) {
                              e.currentTarget.style.borderColor = finalColors.border;
                              e.currentTarget.style.color = finalColors.textMuted;
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
                            transition: 'border-color 0.15s ease, color 0.15s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                            e.currentTarget.style.color = '#ef4444';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = finalColors.border;
                            e.currentTarget.style.color = finalColors.textMuted;
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

    </div>
  );
}
