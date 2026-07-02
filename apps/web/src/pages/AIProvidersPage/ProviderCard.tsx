import { useState } from 'react';
import { CheckCircle, XCircle, ChevronDown, TestTube, Pencil, Trash2, Plus, Lock, Eye, EyeOff } from 'lucide-react';
import { PROVIDER_TYPES } from './constants';
import { ProviderCardProps } from './types';
import { EmptyState } from './EmptyState';

const iconButtonBase = {
  width: '36px',
  height: '36px',
  borderRadius: '10px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'border-color 0.15s ease, color 0.15s ease, background-color 0.15s ease, opacity 0.15s ease',
  boxShadow: 'none',
} as const;

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
  isMobile,
  isDark,
  colors,
  accentColor = '#8b5cf6',
}: ProviderCardProps) {
  const [testHover, setTestHover] = useState(false);
  const [editHover, setEditHover] = useState(false);
  const [deleteHover, setDeleteHover] = useState(false);
  const [keyButtonHover, setKeyButtonHover] = useState(false);

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

  const customProviderInfo = PROVIDER_TYPES.find((p) => p.value === 'custom') || PROVIDER_TYPES[0];
  const knownProviderInfo = PROVIDER_TYPES.find((p) => p.value === provider.type);
  const providerInfo = knownProviderInfo || customProviderInfo;
  const providerLabel = knownProviderInfo ? knownProviderInfo.label : provider.type;
  const modelCount = provider.models?.length || 0;
  const providerBaseUrl = (provider as any).base_url || (provider as any).baseUrl || '-';

  return (
    <div
      style={{
        background: isExpanded ? finalColors.bgGlassHover : finalColors.bgGlass,
        border: isExpanded ? `1px solid ${providerInfo.color}` : `1px solid ${finalColors.border}`,
        borderRadius: '14px',
        overflow: 'hidden',
        transition: 'border-color 0.15s ease, background-color 0.15s ease',
        boxShadow: 'none',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'minmax(220px, 1.25fr) minmax(140px, 0.8fr) minmax(150px, 0.8fr) auto',
          alignItems: 'center',
          gap: isMobile ? '14px' : '18px',
          padding: isMobile ? '14px' : '14px 16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: providerInfo.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <providerInfo.icon style={{ width: '20px', height: '20px', color: '#ffffff' }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h3
                style={{
                  fontSize: '15px',
                  fontWeight: '700',
                  color: finalColors.textPrimary,
                  margin: 0,
                  lineHeight: 1.35,
                }}
              >
                {providerLabel}
              </h3>
              <span
                style={{
                  padding: '3px 8px',
                  backgroundColor: provider.enabled ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  color: provider.enabled ? '#10b981' : '#ef4444',
                  borderRadius: '999px',
                  fontSize: '11px',
                  fontWeight: '600',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  border: `1px solid ${provider.enabled ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                }}
              >
                {provider.enabled ? <CheckCircle style={{ width: '12px', height: '12px' }} /> : <XCircle style={{ width: '12px', height: '12px' }} />}
                {provider.enabled ? '启用' : '禁用'}
              </span>
            </div>
            <div
              style={{
                fontSize: '12px',
                color: finalColors.textMuted,
                marginTop: '4px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {provider.type}
            </div>
          </div>
        </div>

        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '12px', color: finalColors.textMuted, marginBottom: '3px' }}>模型数量</div>
          <div style={{ fontSize: '14px', fontWeight: '700', color: finalColors.textPrimary }}>{modelCount}</div>
        </div>

        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '12px', color: finalColors.textMuted, marginBottom: '3px' }}>Base URL</div>
          <div
            title={providerBaseUrl}
            style={{
              fontSize: '13px',
              color: finalColors.textSecondary,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {providerBaseUrl}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'flex-start' : 'flex-end', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => onToggleExpand(provider.id)}
            title={isExpanded ? '收起详情' : '展开详情'}
            aria-label={isExpanded ? '收起详情' : '展开详情'}
            style={{
              ...iconButtonBase,
              background: isExpanded ? `${providerInfo.color}15` : finalColors.bgGlassHover,
              border: isExpanded ? `1px solid ${providerInfo.color}30` : `1px solid ${finalColors.border}`,
              color: isExpanded ? providerInfo.color : finalColors.textSecondary,
            }}
          >
            <ChevronDown
              style={{
                width: '18px',
                height: '18px',
                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
              }}
            />
          </button>
          <button
            onClick={() => onTest(provider.id)}
            onMouseEnter={() => setTestHover(true)}
            onMouseLeave={() => setTestHover(false)}
            disabled={testingProvider === provider.id}
            title="测试连接"
            aria-label="测试连接"
            style={{
              ...iconButtonBase,
              background: testingProvider === provider.id ? `${providerInfo.color}15` : (testHover ? `${providerInfo.color}12` : finalColors.bgGlassHover),
              border: testingProvider === provider.id ? `1px solid ${providerInfo.color}35` : (testHover ? `1px solid ${providerInfo.color}30` : `1px solid ${finalColors.border}`),
              color: testingProvider === provider.id || testHover ? providerInfo.color : finalColors.textSecondary,
              opacity: testingProvider === provider.id ? 0.75 : 1,
              cursor: testingProvider === provider.id ? 'not-allowed' : 'pointer',
            }}
          >
            {testingProvider === provider.id ? (
              <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: `2px solid ${providerInfo.color}`, borderTop: '2px solid transparent', animation: 'spin 1s linear infinite' }} />
            ) : (
              <TestTube style={{ width: '17px', height: '17px' }} />
            )}
          </button>
          <button
            onClick={() => onEdit(provider)}
            onMouseEnter={() => setEditHover(true)}
            onMouseLeave={() => setEditHover(false)}
            title="编辑提供商"
            aria-label="编辑提供商"
            style={{
              ...iconButtonBase,
              background: editHover ? `${providerInfo.color}12` : finalColors.bgGlassHover,
              border: editHover ? `1px solid ${providerInfo.color}30` : `1px solid ${finalColors.border}`,
              color: editHover ? providerInfo.color : finalColors.textSecondary,
            }}
          >
            <Pencil style={{ width: '17px', height: '17px' }} />
          </button>
          <button
            onClick={() => onDelete(provider.id)}
            onMouseEnter={() => setDeleteHover(true)}
            onMouseLeave={() => setDeleteHover(false)}
            title="删除提供商"
            aria-label="删除提供商"
            style={{
              ...iconButtonBase,
              background: deleteHover ? 'rgba(239, 68, 68, 0.1)' : finalColors.bgGlassHover,
              border: deleteHover ? '1px solid rgba(239, 68, 68, 0.3)' : `1px solid ${finalColors.border}`,
              color: deleteHover ? '#ef4444' : finalColors.textSecondary,
            }}
          >
            <Trash2 style={{ width: '17px', height: '17px' }} />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div style={{ borderTop: `1px solid ${finalColors.border}`, padding: isMobile ? '14px' : '16px', display: 'grid', gap: '16px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1fr) auto',
              gap: '12px',
              alignItems: 'center',
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Lock style={{ width: '16px', height: '16px', color: finalColors.textMuted }} />
                <span style={{ fontSize: '13px', fontWeight: '700', color: finalColors.textPrimary }}>API 密钥</span>
              </div>
              <div
                style={{
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                  fontSize: '13px',
                  color: finalColors.textPrimary,
                  wordBreak: 'break-all',
                  padding: '10px 12px',
                  backgroundColor: finalColors.bgGlass,
                  borderRadius: '10px',
                  border: `1px solid ${finalColors.border}`,
                  lineHeight: '1.5',
                }}
              >
                {isApiKeyVisible ? provider.api_key : '•'.repeat(32)}
              </div>
            </div>
            <button
              onClick={() => onToggleApiKeyVisibility(provider.id)}
              onMouseEnter={() => setKeyButtonHover(true)}
              onMouseLeave={() => setKeyButtonHover(false)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                height: '38px',
                padding: '0 14px',
                background: keyButtonHover ? `${providerInfo.color}15` : finalColors.bgGlassHover,
                border: keyButtonHover ? `1px solid ${providerInfo.color}30` : `1px solid ${finalColors.border}`,
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: '600',
                color: keyButtonHover ? providerInfo.color : finalColors.textPrimary,
                cursor: 'pointer',
                transition: 'border-color 0.15s ease, color 0.15s ease, background-color 0.15s ease',
              }}
            >
              {isApiKeyVisible ? <EyeOff style={{ width: '16px', height: '16px' }} /> : <Eye style={{ width: '16px', height: '16px' }} />}
              {isApiKeyVisible ? '隐藏' : '显示'}
            </button>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: finalColors.textPrimary }}>模型列表</span>
              <button
                onClick={() => onAddModel(provider)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  height: '36px',
                  padding: '0 14px',
                  background: providerInfo.color,
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#ffffff',
                  cursor: 'pointer',
                  transition: 'opacity 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                <Plus style={{ width: '16px', height: '16px' }} />
                添加模型
              </button>
            </div>

            {!provider.models || provider.models.length === 0 ? (
              <EmptyState type="models" providerColor={providerInfo.color} colors={finalColors} />
            ) : (
              <div style={{ border: `1px solid ${finalColors.border}`, borderRadius: '12px', overflow: 'hidden' }}>
                {provider.models.map((model, index) => (
                  <div
                    key={model.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: isMobile ? '1fr' : 'minmax(220px, 1fr) minmax(180px, 0.8fr) auto',
                      gap: '12px',
                      alignItems: 'center',
                      padding: '12px',
                      backgroundColor: index % 2 === 0 ? finalColors.bgGlass : finalColors.bgGlassHover,
                      borderTop: index === 0 ? 'none' : `1px solid ${finalColors.border}`,
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: finalColors.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {model.name}
                      </div>
                      <div style={{ fontSize: '12px', color: finalColors.textMuted, marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {model.model_id}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      {model.is_assistant_default && (
                        <span style={{ padding: '4px 8px', backgroundColor: `${accentColor}15`, color: accentColor, borderRadius: '999px', fontSize: '11px', fontWeight: '600', border: `1px solid ${accentColor}30` }}>
                          默认模型
                        </span>
                      )}
                      {(model.types || []).slice(0, 2).map((type) => (
                        <span key={type} style={{ padding: '4px 8px', backgroundColor: finalColors.bgGlassHover, color: finalColors.textSecondary, borderRadius: '999px', fontSize: '11px', border: `1px solid ${finalColors.border}` }}>
                          {type}
                        </span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: isMobile ? 'flex-start' : 'flex-end' }}>
                      <button onClick={() => onEditModel(provider, model)} title="编辑模型" aria-label="编辑模型" style={{ ...iconButtonBase, background: finalColors.bgGlass, border: `1px solid ${finalColors.border}`, color: finalColors.textMuted }}>
                        <Pencil style={{ width: '16px', height: '16px' }} />
                      </button>
                      <button onClick={() => onTestModel(model.id)} disabled={testingModel === model.id} title="测试模型" aria-label="测试模型" style={{ ...iconButtonBase, background: testingModel === model.id ? `${providerInfo.color}15` : finalColors.bgGlass, border: testingModel === model.id ? `1px solid ${providerInfo.color}35` : `1px solid ${finalColors.border}`, color: testingModel === model.id ? providerInfo.color : finalColors.textMuted, opacity: testingModel === model.id ? 0.75 : 1 }}>
                        {testingModel === model.id ? (
                          <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: `2px solid ${providerInfo.color}`, borderTop: '2px solid transparent', animation: 'spin 1s linear infinite' }} />
                        ) : (
                          <TestTube style={{ width: '16px', height: '16px' }} />
                        )}
                      </button>
                      <button onClick={() => onDeleteModel(provider, model)} title="删除模型" aria-label="删除模型" style={{ ...iconButtonBase, background: finalColors.bgGlass, border: `1px solid ${finalColors.border}`, color: finalColors.textMuted }}>
                        <Trash2 style={{ width: '16px', height: '16px' }} />
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
  );
}
