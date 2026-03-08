import { useState } from 'react';
import { CheckSquare, Square, Save, Loader2, Sparkles, ChevronDown } from 'lucide-react';
import { Modal } from '../../components/ui/ModalModern';
import { CONTENT_TYPES } from './constants';
import { ModelModalProps } from './types';
import { getModelsByProvider, ModelInfo } from './model-constants';

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

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? '编辑模型配置' : '添加新模型'}
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
            marginBottom: '14px',
          }}>
            选择模型 <span style={{ color: '#ef4444' }}>*</span>
            <Sparkles style={{ 
              width: '16px', 
              height: '16px', 
              color: accentColor,
              animation: 'pulse 2s infinite',
            }} />
          </label>
          <div style={{ position: 'relative' }}>
            <div
              onClick={() => setShowModelDropdown(!showModelDropdown)}
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
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = accentColor;
                e.currentTarget.style.boxShadow = `0 0 0 3px ${accentColor}15, 0 8px 24px ${accentColor}10`;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = finalColors.border;
                e.currentTarget.style.boxShadow = isDark 
                  ? '0 8px 24px rgba(0, 0, 0, 0.15)' 
                  : '0 4px 12px rgba(0, 0, 0, 0.05)';
                e.currentTarget.style.transform = 'translateY(0)';
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
                top: '60px',
                left: 0,
                right: 0,
                backgroundColor: finalColors.bgPrimary,
                border: `1px solid ${finalColors.border}`,
                borderRadius: '16px',
                boxShadow: `0 20px 40px rgba(0, 0, 0, 0.15), 0 0 30px ${accentColor}10`,
                backdropFilter: 'blur(20px)',
                zIndex: 1000,
                maxHeight: '300px',
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
                      padding: '16px 24px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      borderBottom: `1px solid ${finalColors.border}`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = finalColors.bgGlassHover;
                      e.currentTarget.style.transform = 'translateX(8px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.transform = 'translateX(0)';
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
          <p style={{
            fontSize: '14px',
            color: finalColors.textMuted,
            marginTop: '10px',
            margin: '10px 0 0 0',
            lineHeight: '1.5',
          }}>
            从列表中选择一个适合的模型
          </p>
        </div>

        <div>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '16px',
            fontWeight: '700',
            color: finalColors.textPrimary,
            marginBottom: '20px',
          }}>
            选择内容类型（可多选）
            <Sparkles style={{ 
              width: '16px', 
              height: '16px', 
              color: accentColor,
              animation: 'pulse 2s infinite',
            }} />
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
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
                    padding: '24px',
                    borderRadius: '20px',
                    border: `2px solid ${isSelected ? type.color : finalColors.border}`,
                    backgroundColor: isSelected ? `${type.color}08` : finalColors.bgGlass,
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    position: 'relative',
                    overflow: 'hidden',
                    backdropFilter: 'blur(20px)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = type.color;
                      e.currentTarget.style.backgroundColor = `${type.color}05`;
                      e.currentTarget.style.transform = 'translateY(-6px)';
                      e.currentTarget.style.boxShadow = `0 12px 32px ${type.color}20`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = finalColors.border;
                      e.currentTarget.style.backgroundColor = finalColors.bgGlass;
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                >
                  <div style={{
                    width: '28px',
                    height: '28px',
                    flexShrink: 0,
                  }}>
                    {isSelected ? (
                      <CheckSquare style={{ width: '28px', height: '28px', color: type.color }} />
                    ) : (
                      <Square style={{ width: '28px', height: '28px', color: finalColors.textMuted }} />
                    )}
                  </div>
                  <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '16px',
                    background: `linear-gradient(135deg, ${type.color} 0%, ${type.color}cc 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 12px 32px ${type.color}40`,
                    transition: 'all 0.3s ease',
                    transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                  }}>
                    <type.icon style={{ width: '24px', height: '24px', color: '#ffffff' }} />
                  </div>
                  <span style={{ fontSize: '16px', fontWeight: '700', color: finalColors.textPrimary }}>
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
            fontSize: '16px',
            fontWeight: '700',
            color: finalColors.textSecondary,
            marginBottom: '14px',
          }}>
            模型描述（可选）
          </label>
          <textarea
            placeholder="简要描述此模型的用途、特点和适用场景"
            value={modelFormData.description}
            onChange={(e) => onModelFormDataChange({ ...modelFormData, description: e.target.value })}
            style={{
              width: '100%',
              minHeight: '140px',
              padding: '20px 24px',
              borderRadius: '16px',
              border: `1px solid ${finalColors.border}`,
              backgroundColor: finalColors.bgGlass,
              color: finalColors.textPrimary,
              fontSize: '14px',
              resize: 'vertical',
              outline: 'none',
              transition: 'all 0.3s ease',
              lineHeight: '1.6',
              fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
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
            marginBottom: '14px',
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
          <p style={{
            fontSize: '14px',
            color: finalColors.textMuted,
            marginTop: '10px',
            margin: '10px 0 0 0',
            lineHeight: '1.5',
          }}>
            这些标签将帮助用户更好地了解模型的能力
          </p>
        </div>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', paddingTop: '12px' }}>
          <button
            onClick={onClose}
            style={{
              height: '56px',
              padding: '0 36px',
              fontSize: '15px',
              fontWeight: '600',
              color: finalColors.textSecondary,
              backgroundColor: finalColors.bgGlass,
              border: `1px solid ${finalColors.border}`,
              borderRadius: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: isDark 
                ? '0 8px 24px rgba(0, 0, 0, 0.15)' 
                : '0 4px 12px rgba(0, 0, 0, 0.05)',
              backdropFilter: 'blur(10px)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = accentColor;
              e.currentTarget.style.color = finalColors.textPrimary;
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = `0 8px 24px ${accentColor}20`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = finalColors.border;
              e.currentTarget.style.color = finalColors.textSecondary;
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = isDark 
                ? '0 8px 24px rgba(0, 0, 0, 0.15)' 
                : '0 4px 12px rgba(0, 0, 0, 0.05)';
            }}
          >
            取消
          </button>
          <button
            onClick={onSave}
            disabled={saving}
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
              boxShadow: `0 8px 24px ${accentColor}40`,
              transform: 'translateY(0)',
            }}
            onMouseEnter={(e) => {
              if (!saving) {
                e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                e.currentTarget.style.boxShadow = `0 12px 32px ${accentColor}50`;
              }
            }}
            onMouseLeave={(e) => {
              if (!saving) {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = `0 8px 24px ${accentColor}40`;
              }
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
                <span>保存模型</span>
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