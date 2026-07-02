import { useState } from 'react';
import { CheckSquare, Square, Save, Loader2, ChevronDown } from 'lucide-react';
import { Modal } from '../../components/ui/ModalModern';
import { CONTENT_TYPES } from './constants';
import { ModelModalProps } from './types';
import { getModelsByProvider } from './model-constants';

export function ModelModal({
  open,
  onClose,
  onSave,
  modelFormData,
  onModelFormDataChange,
  saving,
  isEdit,
  providerType,
  isDark = false,
  colors,
  accentColor = '#8b5cf6',
}: ModelModalProps) {
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const availableModels = getModelsByProvider(providerType);
  const canSelectKnownModel = availableModels.length > 0;
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

  const focusField = (element: HTMLInputElement | HTMLTextAreaElement) => {
    element.style.borderColor = accentColor;
    element.style.boxShadow = `0 0 0 3px ${accentColor}15`;
  };

  const blurField = (element: HTMLInputElement | HTMLTextAreaElement) => {
    element.style.borderColor = finalColors.border;
    element.style.boxShadow = 'none';
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? '编辑模型配置' : '添加新模型'}
      size="xxlarge"
      overlayVariant="light"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: '700',
            color: finalColors.textPrimary,
            marginBottom: '8px',
          }}>
            {canSelectKnownModel ? '选择模型' : '模型名称'} <span style={{ color: '#ef4444' }}>*</span>
          </label>
          {canSelectKnownModel ? (
            <div style={{ position: 'relative' }}>
              <div
                onClick={() => setShowModelDropdown(!showModelDropdown)}
                style={{
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
                  boxShadow: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = accentColor;
                  e.currentTarget.style.boxShadow = `0 0 0 3px ${accentColor}15`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = finalColors.border;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <span>{modelFormData.name || '请选择模型'}</span>
                <ChevronDown style={{
                  width: '20px',
                  height: '20px',
                  color: finalColors.textSecondary,
                  transition: 'transform 0.3s ease',
                  transform: showModelDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                }} />
              </div>
              {showModelDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '50px',
                  left: 0,
                  right: 0,
                  backgroundColor: finalColors.bgPrimary,
                  border: `1px solid ${finalColors.border}`,
                  borderRadius: '10px',
                  boxShadow: 'none',
                  zIndex: 1000,
                  maxHeight: '240px',
                  overflowY: 'auto',
                }}>
                  {availableModels.map((model) => (
                    <div
                      key={model.model_id}
                      onClick={() => {
                        onModelFormDataChange({
                          ...modelFormData,
                          name: model.name,
                          model_id: model.model_id,
                          description: model.description,
                          capabilities: model.capabilities,
                        });
                        setShowModelDropdown(false);
                      }}
                      style={{
                        padding: '12px 14px',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease',
                        borderBottom: `1px solid ${finalColors.border}`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = finalColors.bgGlassHover;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <div style={{ fontWeight: '600', color: finalColors.textPrimary, marginBottom: '4px' }}>
                        {model.name}
                      </div>
                      <div style={{ fontSize: '12px', color: finalColors.textMuted, marginBottom: '8px' }}>
                        {model.model_id}
                      </div>
                      <div style={{ fontSize: '12px', color: finalColors.textSecondary, lineHeight: '1.4' }}>
                        {model.description}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <input
              type="text"
              placeholder="例如：GPT-4o、DeepSeek Chat、My Vision Model"
              value={modelFormData.name}
              onChange={(e) => onModelFormDataChange({ ...modelFormData, name: e.target.value })}
              style={fieldStyle}
              onFocus={(e) => focusField(e.currentTarget)}
              onBlur={(e) => blurField(e.currentTarget)}
            />
          )}
          <p style={{
            fontSize: '12px',
            color: finalColors.textMuted,
            margin: '6px 0 0 0',
            lineHeight: '1.4',
          }}>
            {canSelectKnownModel ? '从列表中选择一个适合的模型，也可以在下方调整描述和能力标签' : '自定义供应商没有预设模型，请手动填写模型名称和模型 ID'}
          </p>
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: '700',
            color: finalColors.textPrimary,
            marginBottom: '8px',
          }}>
            模型 ID <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="text"
            placeholder="例如：gpt-4o、deepseek-chat、qwen-plus"
            value={modelFormData.model_id}
            onChange={(e) => onModelFormDataChange({ ...modelFormData, model_id: e.target.value })}
            style={fieldStyle}
            onFocus={(e) => focusField(e.currentTarget)}
            onBlur={(e) => blurField(e.currentTarget)}
          />
        </div>

        <div>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: '700',
            color: finalColors.textPrimary,
            marginBottom: '8px',
          }}>
            选择内容类型（可多选）
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px' }}>
            {CONTENT_TYPES.map((type) => {
              const isSelected = modelFormData.types.includes(type.value);
              return (
                <div
                  key={type.value}
                  onClick={() => {
                    const newTypes = isSelected
                      ? modelFormData.types.filter(t => t !== type.value)
                      : [...modelFormData.types, type.value];
                    onModelFormDataChange({ ...modelFormData, types: newTypes });
                  }}
                  style={{
                    minHeight: '46px',
                    padding: '8px 10px',
                    borderRadius: '10px',
                    border: `1px solid ${isSelected ? type.color : finalColors.border}`,
                    backgroundColor: isSelected ? `${type.color}08` : finalColors.bgGlass,
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
                      e.currentTarget.style.borderColor = type.color;
                      e.currentTarget.style.backgroundColor = `${type.color}05`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = finalColors.border;
                      e.currentTarget.style.backgroundColor = finalColors.bgGlass;
                    }
                  }}
                >
                  <div style={{
                    width: '18px',
                    height: '18px',
                    flexShrink: 0,
                  }}>
                    {isSelected ? (
                      <CheckSquare style={{ width: '18px', height: '18px', color: type.color }} />
                    ) : (
                      <Square style={{ width: '18px', height: '18px', color: finalColors.textMuted }} />
                    )}
                  </div>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    background: type.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <type.icon style={{ width: '15px', height: '15px', color: '#ffffff' }} />
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: finalColors.textPrimary, whiteSpace: 'nowrap' }}>
                    {type.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: '700',
            color: finalColors.textSecondary,
            marginBottom: '8px',
          }}>
            模型描述（可选）
          </label>
          <textarea
            placeholder="简要描述此模型的用途、特点和适用场景"
            value={modelFormData.description}
            onChange={(e) => onModelFormDataChange({ ...modelFormData, description: e.target.value })}
            style={{
              width: '100%',
              minHeight: '88px',
              padding: '12px 14px',
              borderRadius: '10px',
              border: `1px solid ${finalColors.border}`,
              backgroundColor: finalColors.bgGlass,
              color: finalColors.textPrimary,
              fontSize: '14px',
              resize: 'vertical',
              outline: 'none',
              transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
              lineHeight: '1.5',
              fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
              boxShadow: 'none',
              boxSizing: 'border-box',
            }}
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
            能力标签（可选）
          </label>
          <input
            type="text"
            placeholder="例如：对话, 创作, 翻译, 代码（用逗号分隔）"
            value={modelFormData.capabilities.join(', ')}
            onChange={(e) => onModelFormDataChange({
              ...modelFormData,
              capabilities: e.target.value.split(',').map(c => c.trim()).filter(c => c),
            })}
            style={fieldStyle}
            onFocus={(e) => focusField(e.currentTarget)}
            onBlur={(e) => blurField(e.currentTarget)}
          />
          <p style={{
            fontSize: '12px',
            color: finalColors.textMuted,
            margin: '6px 0 0 0',
            lineHeight: '1.4',
          }}>
            这些标签将帮助用户更好地了解模型的能力
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '4px' }}>
          <button
            onClick={onClose}
            style={{
              height: '42px',
              padding: '0 22px',
              fontSize: '14px',
              fontWeight: '600',
              color: finalColors.textSecondary,
              backgroundColor: finalColors.bgGlass,
              border: `1px solid ${finalColors.border}`,
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'border-color 0.15s ease, color 0.15s ease',
              boxShadow: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = accentColor;
              e.currentTarget.style.color = finalColors.textPrimary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = finalColors.border;
              e.currentTarget.style.color = finalColors.textSecondary;
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
              transition: 'opacity 0.15s ease',
              boxShadow: 'none',
            }}
            onMouseEnter={(e) => {
              if (!saving) {
                e.currentTarget.style.opacity = '0.9';
              }
            }}
            onMouseLeave={(e) => {
              if (!saving) {
                e.currentTarget.style.opacity = '1';
              }
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
                <span>保存模型</span>
              </div>
            )}
          </button>
        </div>
      </div>

    </Modal>
  );
}
