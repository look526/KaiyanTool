import { CheckCircle, Save, Loader2, Info } from 'lucide-react';
import { Modal } from '../../components/ui/ModalModern';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
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
}: ProviderModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? '编辑 AI 服务提供商' : '添加 AI 服务提供商'}
      size="large"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <label style={{
            display: 'block',
            fontSize: '15px',
            fontWeight: '700',
            color: 'var(--text-primary)',
            marginBottom: '16px',
          }}>
            选择提供商类型
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '16px' }}>
            {PROVIDER_TYPES.map((provider) => {
              const isSelected = formData.type === provider.value;
              return (
                <div
                  key={provider.value}
                  onClick={() => onFormDataChange({ ...formData, type: provider.value })}
                  style={{
                    padding: isMobile ? '16px' : '24px',
                    borderRadius: '16px',
                    border: `2px solid ${isSelected ? provider.color : 'var(--border-primary)'}`,
                    backgroundColor: isSelected ? `${provider.color}08` : 'var(--bg-surface)',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: isMobile ? '12px' : '16px',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = provider.color;
                      e.currentTarget.style.backgroundColor = `${provider.color}05`;
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = `0 8px 24px ${provider.color}15`;
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
                  {isSelected && (
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: provider.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <CheckCircle style={{ width: '16px', height: '16px', color: '#ffffff' }} />
                    </div>
                  )}
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '14px',
                    background: `linear-gradient(135deg, ${provider.color} 0%, ${provider.color}cc 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 4px 12px ${provider.color}30`,
                  }}>
                    <provider.icon style={{ width: '24px', height: '24px', color: '#ffffff' }} />
                  </div>
                  <div>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: '700',
                      color: 'var(--text-primary)',
                      marginBottom: '4px',
                    }}>
                      {provider.label}
                    </div>
                    <div style={{
                      fontSize: '13px',
                      color: 'var(--text-tertiary)',
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

        <div>
          <label style={{
            display: 'block',
            fontSize: '15px',
            fontWeight: '700',
            color: 'var(--text-primary)',
            marginBottom: '12px',
          }}>
            API 密钥
          </label>
          <Input
            type="password"
            placeholder="请输入您的 API 密钥"
            value={formData.apiKey}
            onChange={(e) => onFormDataChange({ ...formData, apiKey: e.target.value })}
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
            color: 'var(--text-secondary)',
            marginBottom: '12px',
          }}>
            自定义 API 地址（可选）
          </label>
          <Input
            type="text"
            placeholder="https://api.example.com"
            value={formData.baseUrl}
            onChange={(e) => onFormDataChange({ ...formData, baseUrl: e.target.value })}
            style={{ 
              width: '100%',
              fontSize: '14px',
              padding: '14px 16px',
            }}
          />
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '20px',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: '14px',
          border: '1px solid var(--border-primary)',
        }}>
          <input
            type="checkbox"
            id={isEdit ? 'enabled-edit' : 'enabled'}
            checked={formData.enabled}
            onChange={(e) => onFormDataChange({ ...formData, enabled: e.target.checked })}
            style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--accent)' }}
          />
          <label htmlFor={isEdit ? 'enabled-edit' : 'enabled'} style={{
            fontSize: '15px',
            fontWeight: '600',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            margin: 0,
          }}>
            立即启用此提供商
          </label>
        </div>

        <div style={{
          padding: '20px',
          backgroundColor: 'var(--info-bg)',
          borderRadius: '14px',
          border: `1px solid var(--info-border)`,
          display: 'flex',
          gap: '16px',
          alignItems: 'flex-start',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            backgroundColor: 'var(--info)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Info style={{ width: '22px', height: '22px', color: '#ffffff' }} />
          </div>
          <div>
            <div style={{
              fontSize: '15px',
              fontWeight: '700',
              color: 'var(--info-text)',
              marginBottom: '8px',
            }}>
              使用提示
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              添加提供商后，您可以配置多个模型，每个模型可以支持不同的内容类型（文本、图像、视频等）。
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '8px', flexDirection: isMobile ? 'column' : 'row' }}>
          <Button
            variant="outline"
            onClick={onClose}
            style={{ 
              height: '48px', 
              padding: '0 28px',
              fontSize: '15px',
              fontWeight: '600',
              width: isMobile ? '100%' : 'auto',
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
              width: isMobile ? '100%' : 'auto',
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
                <span style={{ marginLeft: '10px' }}>保存配置</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
