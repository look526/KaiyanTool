import { ChevronDown, ChevronRight, TestTube, Edit2, Trash2, Loader2 } from 'lucide-react';

interface ProviderActionsProps {
  isExpanded: boolean;
  testingProvider: string | null;
  onToggleExpand: () => void;
  onTest: () => void;
  onEdit: () => void;
  onDelete: () => void;
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
  variant?: 'secondary' | 'danger' | 'success';
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
      fontWeight: '600',
      borderRadius: '10px',
      border: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      transition: 'all 0.2s ease',
      ...(variant === 'secondary' && {
        background: 'var(--bg-surface)',
        color: 'var(--text-primary)',
        border: '1px solid var(--border-primary)',
      }),
      ...(variant === 'danger' && {
        background: 'rgba(239, 68, 68, 0.1)',
        color: '#ef4444',
      }),
      ...(variant === 'success' && {
        background: 'rgba(16, 185, 129, 0.1)',
        color: '#10b981',
      }),
    }}
  >
    {loading ? <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} /> : Icon && <Icon style={{ width: '14px', height: '14px' }} />}
    {label}
  </button>
);

const IconButton = ({
  icon: Icon,
  label,
  variant = 'secondary',
  onClick,
  disabled = false,
  loading = false,
}: {
  icon: React.ElementType;
  label: string;
  variant?: 'secondary' | 'danger' | 'success';
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}) => (
  <button
    onClick={onClick}
    disabled={disabled || loading}
    aria-label={label}
    title={label}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '36px',
      height: '36px',
      borderRadius: '10px',
      border: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      transition: 'all 0.2s ease',
      ...(variant === 'secondary' && {
        background: 'var(--bg-surface)',
        color: 'var(--text-secondary)',
        border: '1px solid var(--border-primary)',
      }),
      ...(variant === 'danger' && {
        background: 'rgba(239, 68, 68, 0.1)',
        color: '#ef4444',
      }),
      ...(variant === 'success' && {
        background: 'rgba(16, 185, 129, 0.1)',
        color: '#10b981',
      }),
    }}
  >
    {loading ? <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} /> : <Icon style={{ width: '16px', height: '16px' }} />}
  </button>
);

export function ProviderActions({
  isExpanded,
  testingProvider,
  onToggleExpand,
  onTest,
  onEdit,
  onDelete,
}: ProviderActionsProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
      <ActionButton icon={isExpanded ? ChevronDown : ChevronRight} label={isExpanded ? '收起详情' : '查看详情'} variant="secondary" onClick={onToggleExpand} />
      <IconButton icon={TestTube} label="测试连接" variant="success" onClick={onTest} loading={testingProvider !== null} />
      <IconButton icon={Edit2} label="编辑提供商" variant="secondary" onClick={onEdit} />
      <IconButton icon={Trash2} label="删除提供商" variant="danger" onClick={onDelete} />
    </div>
  );
}
