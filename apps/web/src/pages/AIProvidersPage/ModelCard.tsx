import { Edit2, TestTube, Trash2, CheckCircle, Sparkles, Loader2 } from 'lucide-react';
import { CONTENT_TYPES } from './constants';
import { AIProviderModel } from './types';

interface ModelCardProps {
  model: AIProviderModel;
  isAdmin: boolean;
  providerColor: string;
  testingModel: string | null;
  onEdit: () => void;
  onDelete: () => void;
  onTest: () => void;
  onSetAssistantDefault: () => void;
  onUnsetAssistantDefault: () => void;
}

const ActionButton = ({
  icon: Icon,
  label,
  variant = 'secondary',
  onClick,
  disabled = false,
  loading = false,
}: {
  icon?: React.ElementType;
  label: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}) => (
  <button
    onClick={onClick}
    disabled={disabled || loading}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
      padding: '8px 16px',
      fontSize: '13px',
      fontWeight: 'var(--font-weight-semibold)',
      borderRadius: '10px',
      border: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      transition: 'border-color 0.15s ease, background-color 0.15s ease, color 0.15s ease, opacity 0.15s ease',
      ...(variant === 'primary' && {
        background: 'var(--accent-primary)',
        color: '#ffffff',
        boxShadow: 'none',
      }),
      ...(variant === 'secondary' && {
        background: 'var(--bg-hover)',
        color: 'var(--text-primary)',
        border: '1px solid var(--border-primary)',
      }),
      ...(variant === 'danger' && {
        background: 'var(--btn-danger-bg)',
        color: '#ffffff',
        boxShadow: 'none',
      }),
      ...(variant === 'success' && {
        background: '#10b981',
        color: '#ffffff',
        boxShadow: 'none',
      }),
    }}
  >
    {loading ? <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} /> : Icon && <Icon style={{ width: '14px', height: '14px' }} />}
    {label}
  </button>
);

export function ModelCard({
  model,
  isAdmin,
  testingModel,
  onEdit,
  onDelete,
  onTest,
  onSetAssistantDefault,
  onUnsetAssistantDefault,
}: ModelCardProps) {
  const getContentTypeInfo = (type: string) => CONTENT_TYPES.find((c) => c.value === type) || CONTENT_TYPES[0];
  const contentTypeInfo = (model.types && model.types.length > 0) ? getContentTypeInfo(model.types[0]) : CONTENT_TYPES[0];

  return (
    <div
      style={{
        padding: '24px',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: '16px',
        border: '1px solid var(--border-primary)',
        boxShadow: 'none',
        transition: 'border-color 0.15s ease, background-color 0.15s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = contentTypeInfo.color;
        e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-primary)';
        e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              background: contentTypeInfo.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'none',
              flexShrink: 0,
            }}
          >
            <contentTypeInfo.icon style={{ width: '28px', height: '28px', color: '#ffffff' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h4 style={{ fontSize: '18px', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginBottom: '8px', margin: 0 }}>
              {model.name}
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {model.types?.map((type, idx) => {
                const typeInfo = getContentTypeInfo(type);
                return (
                  <span
                    key={idx}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      backgroundColor: `${typeInfo.color}15`,
                      color: typeInfo.color,
                      fontSize: '11px',
                      fontWeight: 'var(--font-weight-semibold)',
                    }}
                  >
                    <typeInfo.icon style={{ width: '11px', height: '11px' }} />
                    {typeInfo.label}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {(model as any).description && (
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px', margin: 0, lineHeight: '1.7', padding: '16px', backgroundColor: 'var(--bg-elevated)', borderRadius: '12px' }}>
          {(model as any).description}
        </p>
      )}

      {(model as any).capabilities?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
          {(model as any).capabilities.map((cap: string, idx: number) => (
            <span key={idx} style={{ padding: '6px 14px', backgroundColor: `${contentTypeInfo.color}12`, color: contentTypeInfo.color, borderRadius: '20px', fontSize: '12px', fontWeight: 'var(--font-weight-semibold)' }}>
              {cap}
            </span>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', paddingTop: '16px', borderTop: '1px solid var(--border-primary)', justifyContent: 'flex-end' }}>
        {isAdmin && (
          <>
            {(model as any).isAssistantDefault ? (
              <ActionButton icon={CheckCircle} label="AI助手" variant="primary" onClick={onUnsetAssistantDefault} />
            ) : (
              <ActionButton icon={Sparkles} label="设为AI助手" variant="secondary" onClick={onSetAssistantDefault} />
            )}
            <ActionButton icon={Edit2} label="编辑" variant="secondary" onClick={onEdit} />
          </>
        )}
        <ActionButton icon={TestTube} label={testingModel === model.id ? '测试中' : '测试'} variant="success" onClick={onTest} disabled={testingModel === model.id} loading={testingModel === model.id} />
        <ActionButton icon={Trash2} label="删除" variant="danger" onClick={onDelete} />
      </div>
    </div>
  );
}
