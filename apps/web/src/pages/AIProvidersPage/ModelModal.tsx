import { CheckSquare, Square, Save, Loader2 } from 'lucide-react';
import { Modal } from '../../components/ui/ModalModern';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { CONTENT_TYPES } from './constants';
import { ModelModalProps } from './types';

export function ModelModal({
  open,
  onClose,
  onSave,
  modelFormData,
  onModelFormDataChange,
  saving,
  isEdit,
}: ModelModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? '编辑模型配置' : '添加新模型'}
      size="large"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <label style={{
            display: 'block',
            fontSize: '15px',
            fontWeight: '700',
            color: 'var(--text-primary)',
            marginBottom: '12px',
          }}>
            模型名称 <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <Input
            type="text"
            placeholder="例如：GLM-4.7、GPT-4"
            value={modelFormData.name}
            onChange={(e) => onModelFormDataChange({ ...modelFormData, name: e.target.value })}
            style={{ 
              width: '100%',
              fontSize: '14px',
              padding: '14px 16px',
            }}
          />
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '15px',
            fontWeight: '700',
            color: 'var(--text-primary)',
            marginBottom: '12px',
          }}>
            API Model ID <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <Input
            type="text"
            placeholder="例如：glm-4.7、gpt-4"
            value={modelFormData.modelId || ''}
            onChange={(e) => onModelFormDataChange({ ...modelFormData, modelId: e.target.value })}
            style={{ 
              width: '100%',
              fontSize: '14px',
              padding: '14px 16px',
            }}
          />
          <p style={{
            fontSize: '13px',
            color: 'var(--text-tertiary)',
            marginTop: '8px',
            margin: '8px 0 0 0',
            lineHeight: '1.5',
          }}>
            在 AI 提供商 API 文档中查找此模型的 Model ID
          </p>
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '15px',
            fontWeight: '700',
            color: 'var(--text-primary)',
            marginBottom: '16px',
          }}>
            选择内容类型（可多选）
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
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
                    padding: '20px',
                    borderRadius: '14px',
                    border: `2px solid ${isSelected ? type.color : 'var(--border-primary)'}`,
                    backgroundColor: isSelected ? `${type.color}08` : 'var(--bg-surface)',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = type.color;
                      e.currentTarget.style.backgroundColor = `${type.color}05`;
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = `0 8px 24px ${type.color}15`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = 'var(--border-primary)';
                      e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                >
                  <div style={{
                    width: '24px',
                    height: '24px',
                    flexShrink: 0,
                  }}>
                    {isSelected ? (
                      <CheckSquare style={{ width: '24px', height: '24px', color: type.color }} />
                    ) : (
                      <Square style={{ width: '24px', height: '24px', color: 'var(--text-tertiary)' }} />
                    )}
                  </div>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: `linear-gradient(135deg, ${type.color} 0%, ${type.color}cc 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 4px 12px ${type.color}30`,
                  }}>
                    <type.icon style={{ width: '20px', height: '20px', color: '#ffffff' }} />
                  </div>
                  <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
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
            fontSize: '15px',
            fontWeight: '700',
            color: 'var(--text-secondary)',
            marginBottom: '12px',
          }}>
            模型描述（可选）
          </label>
          <textarea
            placeholder="简要描述此模型的用途、特点和适用场景"
            value={modelFormData.description}
            onChange={(e) => onModelFormDataChange({ ...modelFormData, description: e.target.value })}
            style={{
              width: '100%',
              minHeight: '120px',
              padding: '14px 16px',
              borderRadius: '12px',
              border: '1px solid var(--border-primary)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              fontSize: '14px',
              resize: 'vertical',
              outline: 'none',
              transition: 'border-color 0.2s ease',
              lineHeight: '1.6',
              fontFamily: 'var(--font-sans)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent)';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(181, 147, 107, 0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-primary)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '15px',
            fontWeight: '700',
            color: 'var(--text-secondary)',
            marginBottom: '12px',
          }}>
            能力标签（可选）
          </label>
          <Input
            type="text"
            placeholder="例如：对话, 创作, 翻译, 代码（用逗号分隔）"
            value={modelFormData.capabilities.join(', ')}
            onChange={(e) => onModelFormDataChange({
              ...modelFormData,
              capabilities: e.target.value.split(',').map(c => c.trim()).filter(c => c),
            })}
            style={{ 
              width: '100%',
              fontSize: '14px',
              padding: '14px 16px',
            }}
          />
          <p style={{
            fontSize: '13px',
            color: 'var(--text-tertiary)',
            marginTop: '8px',
            margin: '8px 0 0 0',
            lineHeight: '1.5',
          }}>
            这些标签将帮助用户更好地了解模型的能力
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '8px' }}>
          <Button
            variant="outline"
            onClick={onClose}
            style={{ 
              height: '48px', 
              padding: '0 28px',
              fontSize: '15px',
              fontWeight: '600',
            }}
          >
            取消
          </Button>
          <Button
            onClick={onSave}
            disabled={saving}
            style={{ 
              height: '48px', 
              padding: '0 36px',
              fontSize: '15px',
              fontWeight: '600',
              background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)',
              boxShadow: '0 4px 16px rgba(181, 147, 107, 0.3)',
              border: 'none',
            }}
          >
            {saving ? (
              <>
                <Loader2 style={{ width: '18px', height: '18px', animation: 'spin 1s linear infinite' }} />
                <span style={{ marginLeft: '10px' }}>保存中...</span>
              </>
            ) : (
              <>
                <Save style={{ width: '18px', height: '18px' }} />
                <span style={{ marginLeft: '10px' }}>保存模型</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
