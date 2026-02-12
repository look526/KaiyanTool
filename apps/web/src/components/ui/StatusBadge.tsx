export interface StatusBadgeProps {
  status: 'pending' | 'in_progress' | 'completed' | 'generating' | 'empty';
  label?: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const STATUS_CONFIG = {
  pending: {
    color: '#64748b',
    backgroundColor: 'rgba(100, 116, 139, 0.1)',
    borderColor: 'rgba(100, 116, 139, 0.3)',
  },
  in_progress: {
    color: '#f59e0b',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  completed: {
    color: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  generating: {
    color: '#6366f1',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  empty: {
    color: '#64748b',
    backgroundColor: 'rgba(100, 116, 139, 0.1)',
    borderColor: 'rgba(100, 116, 139, 0.3)',
  },
};

const SIZE_CONFIG = {
  small: {
    padding: '2px 6px',
    fontSize: '10px',
    borderRadius: '6px',
  },
  medium: {
    padding: '3px 8px',
    fontSize: '11px',
    borderRadius: '8px',
  },
  large: {
    padding: '4px 10px',
    fontSize: '12px',
    borderRadius: '10px',
  },
};

export function StatusBadge({ status, label, size = 'medium', className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const sizeConfig = SIZE_CONFIG[size];
  const defaultLabel = {
    pending: '待生成',
    in_progress: '生成中',
    completed: '已完成',
    generating: '生成中',
    empty: '待编辑',
  }[status];

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: sizeConfig.padding,
        fontSize: sizeConfig.fontSize,
        fontWeight: '600',
        color: config.color,
        backgroundColor: config.backgroundColor,
        border: `1px solid ${config.borderColor}`,
        borderRadius: sizeConfig.borderRadius,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        whiteSpace: 'nowrap',
      }}
    >
      {label || defaultLabel}
    </span>
  );
}
