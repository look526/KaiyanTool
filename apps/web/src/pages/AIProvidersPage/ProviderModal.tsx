import { useState } from 'react';
import { CheckCircle, Save, Loader2, Info, Sparkles } from 'lucide-react';
import { Modal } from '../../components/ui/ModalModern';
import { PROVIDER_TYPES } from './constants';
import { ProviderModalProps } from './types';

export function ProviderModal({
  open,
  onClose,
  onSave,
  formData,
  onFormDataChange,
  saving,
  isEdit = false,
  isMobile,
  isDark = false,
  colors,
  accentColor = '#8b5cf6',
}: ProviderModalProps) {
  const [cancelHover, setCancelHover] = useState(false);
  const [saveHover, setSaveHover] = useState(false);

  // 确保colors有默认值
  const defaultColors = isDark ? {
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
  };

  const finalColors = colors || defaultColors;
  const knownProviderTypes = PROVIDER_TYPES.map(provider => provider.value);
  const isKnownType = knownProviderTypes.includes(formData.type);
  const selectedType = isKnownType ? formData.type : 'custom';
  const customTypeValue = selectedType === 'custom' && formData.type !== 'custom' ? formData.type : '';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? '编辑 AI 服务提供商' : '添加 AI 服务提供商'}
      size="large"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        <div>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '16px',
            fontWeight: '700',
            color: finalColors.textPrimary,
            marginBottom: '16px',
          }}>
            选择提供商类型
            <Sparkles style={{
              width: '18px',
              height: '18px',
              color: accentColor,
              animation: 'pulse 2s infinite',
            }} />
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '20px' }}>
            {PROVIDER_TYPES.map((provider) => {
              const isSelected = selectedType === provider.value;
              return (
                <div
                  key={provider.value}
                  onClick={() => onFormDataChange({ ...formData, type: provider.value })}
                  style={{
                    padding: '24px',
                    borderRadius: '20px',
                    border: `2px solid ${isSelected ? provider.color : finalColors.border}`,
                    backgroundColor: isSelected ? `${provider.color}10` : finalColors.bgGlass,
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    position: 'relative',
                    backdropFilter: 'blur(20px)',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = provider.color;
                      e.currentTarget.style.transform = 'translateY(-6px)';
                      e.currentTarget.style.boxShadow = `0 12px 32px ${provider.color}20`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = finalColors.border;
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                >
                  {isSelected && (
                    <div style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: provider.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 4px 12px ${provider.color}40`,
                      animation: 'pulse 2s infinite',
                    }}>
                      <CheckCircle style={{ width: '18px', height: '18px', color: '#ffffff' }} />
                    </div>
                  )}
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '16px',
                    background: `linear-gradient(135deg, ${provider.color} 0%, ${provider.color}cc 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 12px 32px ${provider.color}40`,
                    transition: 'all 0.3s ease',
                    transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                  }}>
                    <provider.icon style={{ width: '28px', height: '28px', color: '#ffffff' }} />
                  </div>
                  <div>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: finalColors.textPrimary,
                      marginBottom: '8px',
                    }}>
                      {provider.label}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: finalColors.textMuted,
                      lineHeight: '1.5',
                    }}>
                      {provider.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {selectedType === 'custom' && (
          <div>
            <label style={{
              display: 'block',
              fontSize: '16px',
              fontWeight: '700',
              color: finalColors.textPrimary,
              marginBottom: '12px',
            }}>
              自定义供应商标识 <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="例如：moonshot、siliconflow、my-openai-compatible"
              value={customTypeValue}
              onChange={(e) => onFormDataChange({ ...formData, type: e.target.value.trim() || 'custom' })}
              style={{
                width: '100%',
                height: '52px',
                padding: '0 24px',
                fontSize: '14px',
                color: finalColors.textPrimary,
                backgroundColor: finalColors.bgGlass,
                border: `1px solid ${finalColors.border}`,
                borderRadius: '16px',
                outline: 'none',
                transition: 'all 0.3s ease',
                boxShadow: isDark
                  ? '0 8px 24px rgba(0, 0, 0, 0.15)'
                  : '0 4px 12px rgba(0, 0, 0, 0.05)',
                backdropFilter: 'blur(10px)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = accentColor;
                e.currentTarget.style.boxShadow = `0 0 0 3px ${accentColor}15, 0 8px 24px ${accentColor}10`;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = finalColors.border;
                e.currentTarget.style.boxShadow = isDark
                  ? '0 8px 24px rgba(0, 0, 0, 0.15)'
                  : '0 4px 12px rgba(0, 0, 0, 0.05)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            />
          </div>
        )}

        <div>
          <label style={{
            display: 'block',
            fontSize: '16px',
            fontWeight: '700',
            color: finalColors.textPrimary,
            marginBottom: '12px',
          }}>
            API 密钥 <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="password"
            placeholder="请输入您的 API 密钥"
            value={formData.api_key}
            onChange={(e) => onFormDataChange({ ...formData, api_key: e.target.value })}
            style={{
              width: '100%',
              height: '52px',
              padding: '0 24px',
              fontSize: '14px',
              color: finalColors.textPrimary,
              backgroundColor: finalColors.bgGlass,
              border: `1px solid ${finalColors.border}`,
              borderRadius: '16px',
              outline: 'none',
              transition: 'all 0.3s ease',
              boxShadow: isDark
                ? '0 8px 24px rgba(0, 0, 0, 0.15)'
                : '0 4px 12px rgba(0, 0, 0, 0.05)',
              backdropFilter: 'blur(10px)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = accentColor;
              e.currentTarget.style.boxShadow = `0 0 0 3px ${accentColor}15, 0 8px 24px ${accentColor}10`;
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = finalColors.border;
              e.currentTarget.style.boxShadow = isDark
                ? '0 8px 24px rgba(0, 0, 0, 0.15)'
                : '0 4px 12px rgba(0, 0, 0, 0.05)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          />
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '16px',
            fontWeight: '700',
            color: finalColors.textSecondary,
            marginBottom: '12px',
          }}>
            自定义 API 地址（可选）
          </label>
          <input
            type="text"
            placeholder="https://api.example.com"
            value={formData.base_url}
            onChange={(e) => onFormDataChange({ ...formData, base_url: e.target.value })}
            style={{
              width: '100%',
              height: '52px',
              padding: '0 24px',
              fontSize: '14px',
              color: finalColors.textPrimary,
              backgroundColor: finalColors.bgGlass,
              border: `1px solid ${finalColors.border}`,
              borderRadius: '16px',
              outline: 'none',
              transition: 'all 0.3s ease',
              boxShadow: isDark
                ? '0 8px 24px rgba(0, 0, 0, 0.15)'
                : '0 4px 12px rgba(0, 0, 0, 0.05)',
              backdropFilter: 'blur(10px)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = accentColor;
              e.currentTarget.style.boxShadow = `0 0 0 3px ${accentColor}15, 0 8px 24px ${accentColor}10`;
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = finalColors.border;
              e.currentTarget.style.boxShadow = isDark
                ? '0 8px 24px rgba(0, 0, 0, 0.15)'
                : '0 4px 12px rgba(0, 0, 0, 0.05)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          />
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '24px',
          backgroundColor: finalColors.bgGlassHover,
          borderRadius: '20px',
          border: `1px solid ${finalColors.border}`,
          backdropFilter: 'blur(20px)',
          transition: 'all 0.3s ease',
        }}>
          <input
            type="checkbox"
            id={isEdit ? 'enabled-edit' : 'enabled'}
            checked={formData.enabled}
            onChange={(e) => onFormDataChange({ ...formData, enabled: e.target.checked })}
            style={{
              width: '24px',
              height: '24px',
              cursor: 'pointer',
              accentColor: accentColor
            }}
          />
          <label htmlFor={isEdit ? 'enabled-edit' : 'enabled'} style={{
            fontSize: '15px',
            fontWeight: '600',
            color: finalColors.textPrimary,
            cursor: 'pointer',
            margin: 0,
          }}>
            立即启用此提供商
          </label>
        </div>

        <div style={{
          padding: '24px',
          backgroundColor: `${accentColor}08`,
          borderRadius: '20px',
          border: `1px solid ${accentColor}20`,
          display: 'flex',
          gap: '20px',
          alignItems: 'flex-start',
          backdropFilter: 'blur(10px)',
        }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '16px',
            backgroundColor: `${accentColor}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: `0 8px 24px ${accentColor}30`,
          }}>
            <Info style={{ width: '24px', height: '24px', color: accentColor }} />
          </div>
          <div>
            <div style={{
              fontSize: '16px',
              fontWeight: '700',
              color: finalColors.textPrimary,
              marginBottom: '12px',
            }}>
              使用提示
            </div>
            <div style={{ fontSize: '14px', color: finalColors.textSecondary, lineHeight: '1.6' }}>
              添加提供商后，您可以配置多个模型，每个模型可以支持不同的内容类型（文本、图像、视频等）。请确保您的 API 密钥具有足够的权限。
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', flexDirection: isMobile ? 'column' : 'row' }}>
          <button
            onClick={onClose}
            onMouseEnter={() => setCancelHover(true)}
            onMouseLeave={() => setCancelHover(false)}
            style={{
              height: '56px',
              padding: '0 36px',
              fontSize: '15px',
              fontWeight: '600',
              color: cancelHover ? finalColors.textPrimary : finalColors.textSecondary,
              backgroundColor: finalColors.bgGlass,
              border: `1px solid ${cancelHover ? accentColor : finalColors.border}`,
              borderRadius: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              width: isMobile ? '100%' : 'auto',
              boxShadow: cancelHover
                ? `0 8px 24px ${accentColor}20`
                : 'none',
              transform: cancelHover ? 'translateY(-2px)' : 'translateY(0)',
              backdropFilter: 'blur(10px)',
            }}
          >
            取消
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            onMouseEnter={() => setSaveHover(true)}
            onMouseLeave={() => setSaveHover(false)}
            style={{
              height: '56px',
              padding: '0 40px',
              fontSize: '15px',
              fontWeight: '600',
              color: '#ffffff',
              background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}cc 100%)`,
              border: 'none',
              borderRadius: '16px',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1,
              transition: 'all 0.3s ease',
              boxShadow: saveHover
                ? `0 12px 32px ${accentColor}50`
                : `0 6px 20px ${accentColor}30`,
              transform: saveHover ? 'translateY(-4px) scale(1.02)' : 'translateY(0) scale(1)',
              width: isMobile ? '100%' : 'auto',
            }}
          >
            {saving ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                <Loader2 style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} />
                <span>保存中...</span>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                <Save style={{ width: '20px', height: '20px' }} />
                <span>保存配置</span>
              </div>
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modalFadeIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </Modal>
  );
}
