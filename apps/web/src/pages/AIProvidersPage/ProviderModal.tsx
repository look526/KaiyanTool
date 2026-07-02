import { useState } from 'react';
import { CheckCircle, Save, Loader2, Info } from 'lucide-react';
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
  const fieldStyle = {
    width: '100%',
    height: '44px',
    padding: '0 14px',
    fontSize: '14px',
    color: finalColors.textPrimary,
    backgroundColor: finalColors.bgGlass,
    border: `1px solid ${finalColors.border}`,
    borderRadius: '10px',
    outline: 'none',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
    boxSizing: 'border-box' as const,
  };

  const focusField = (element: HTMLInputElement) => {
    element.style.borderColor = accentColor;
    element.style.boxShadow = `0 0 0 3px ${accentColor}15`;
  };

  const blurField = (element: HTMLInputElement) => {
    element.style.borderColor = finalColors.border;
    element.style.boxShadow = 'none';
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? '编辑 AI 服务提供商' : '添加 AI 服务提供商'}
      size="xxlarge"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: '700',
            color: finalColors.textPrimary,
            marginBottom: '10px',
          }}>
            选择提供商类型
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, minmax(0, 1fr))' : 'repeat(4, minmax(0, 1fr))',
            gap: '8px',
          }}>
            {PROVIDER_TYPES.map((provider) => {
              const isSelected = selectedType === provider.value;
              return (
                <div
                  key={provider.value}
                  onClick={() => onFormDataChange({ ...formData, type: provider.value })}
                  style={{
                    minHeight: '48px',
                    padding: '8px 10px',
                    borderRadius: '10px',
                    border: `1px solid ${isSelected ? provider.color : finalColors.border}`,
                    backgroundColor: isSelected ? `${provider.color}10` : finalColors.bgGlass,
                    cursor: 'pointer',
                    transition: 'border-color 0.15s ease, background-color 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = provider.color;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = finalColors.border;
                    }
                  }}
                >
                  {isSelected && (
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: provider.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <CheckCircle style={{ width: '13px', height: '13px', color: '#ffffff' }} />
                    </div>
                  )}
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    background: provider.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <provider.icon style={{ width: '15px', height: '15px', color: '#ffffff' }} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '700',
                      color: finalColors.textPrimary,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {provider.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))',
          gap: '14px',
        }}>
          {selectedType === 'custom' && (
            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '700',
                color: finalColors.textPrimary,
                marginBottom: '8px',
              }}>
                自定义供应商标识 <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="moonshot、siliconflow、my-provider"
                value={customTypeValue}
                onChange={(e) => onFormDataChange({ ...formData, type: e.target.value.trim() || 'custom' })}
                style={fieldStyle}
                onFocus={(e) => focusField(e.currentTarget)}
                onBlur={(e) => blurField(e.currentTarget)}
              />
            </div>
          )}

          <div>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '700',
              color: finalColors.textPrimary,
              marginBottom: '8px',
            }}>
              API 密钥 <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="password"
              placeholder="请输入您的 API 密钥"
              value={formData.api_key}
              onChange={(e) => onFormDataChange({ ...formData, api_key: e.target.value })}
              style={fieldStyle}
              onFocus={(e) => focusField(e.currentTarget)}
              onBlur={(e) => blurField(e.currentTarget)}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '700',
              color: finalColors.textSecondary,
              marginBottom: '8px',
            }}>
              请求地址（可选）
            </label>
            <input
              type="text"
              placeholder="https://api.example.com"
              value={formData.base_url}
              onChange={(e) => onFormDataChange({ ...formData, base_url: e.target.value })}
              style={fieldStyle}
              onFocus={(e) => focusField(e.currentTarget)}
              onBlur={(e) => blurField(e.currentTarget)}
            />
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 14px',
          backgroundColor: finalColors.bgGlassHover,
          borderRadius: '10px',
          border: `1px solid ${finalColors.border}`,
        }}>
          <input
            type="checkbox"
            id={isEdit ? 'enabled-edit' : 'enabled'}
            checked={formData.enabled}
            onChange={(e) => onFormDataChange({ ...formData, enabled: e.target.checked })}
            style={{
              width: '18px',
              height: '18px',
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
          padding: '10px 12px',
          backgroundColor: `${accentColor}08`,
          borderRadius: '10px',
          border: `1px solid ${accentColor}20`,
          display: 'flex',
          gap: '10px',
          alignItems: 'flex-start',
        }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            backgroundColor: `${accentColor}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Info style={{ width: '15px', height: '15px', color: accentColor }} />
          </div>
          <div>
            <div style={{ fontSize: '13px', color: finalColors.textSecondary, lineHeight: '1.5' }}>
              添加提供商后，可继续配置模型列表及模型支持的内容类型。
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end',
          flexDirection: isMobile ? 'column' : 'row',
          paddingTop: '4px',
        }}>
          <button
            onClick={onClose}
            onMouseEnter={() => setCancelHover(true)}
            onMouseLeave={() => setCancelHover(false)}
            style={{
              height: '42px',
              padding: '0 22px',
              fontSize: '14px',
              fontWeight: '600',
              color: cancelHover ? finalColors.textPrimary : finalColors.textSecondary,
              backgroundColor: finalColors.bgGlass,
              border: `1px solid ${cancelHover ? accentColor : finalColors.border}`,
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'border-color 0.15s ease, color 0.15s ease',
              width: isMobile ? '100%' : 'auto',
            }}
          >
            取消
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            style={{
              height: '42px',
              padding: '0 24px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#ffffff',
              background: accentColor,
              border: 'none',
              borderRadius: '10px',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1,
              transition: 'opacity 0.15s ease, background-color 0.15s ease',
              boxShadow: 'none',
              width: isMobile ? '100%' : 'auto',
            }}
          >
            {saving ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Loader2 style={{ width: '18px', height: '18px', animation: 'spin 1s linear infinite' }} />
                <span>保存中...</span>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Save style={{ width: '18px', height: '18px' }} />
                <span>保存配置</span>
              </div>
            )}
          </button>
        </div>
      </div>

    </Modal>
  );
}
