import { FileText, Folder, Inbox, Search } from 'lucide-react';

export interface EmptyStateProps {
  icon?: 'folder' | 'file' | 'inbox' | 'search';
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const ICON_MAP = {
  folder: Folder,
  file: FileText,
  inbox: Inbox,
  search: Search,
};

export function EmptyState({ icon = 'folder', title, description, action, className }: EmptyStateProps) {
  const Icon = ICON_MAP[icon];

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '64px 32px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '24px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Icon style={{ width: '40px', height: '40px', color: 'var(--text-muted)', strokeWidth: 1.5 }} />
      </div>
      <h3 style={{
        fontSize: '18px',
        fontWeight: '600',
        color: 'var(--text-primary)',
        margin: '0 0 12px 0',
        letterSpacing: '-0.02em',
      }}>
        {title}
      </h3>
      {description && (
        <p style={{
          fontSize: '15px',
          color: 'var(--text-secondary)',
          margin: '0 0 28px 0',
          maxWidth: '360px',
          lineHeight: '1.6',
        }}>
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          style={{
            height: '44px',
            padding: '0 24px',
            fontSize: '15px',
            fontWeight: '600',
            background: 'linear-gradient(135deg, var(--btn-primary-bg) 0%, var(--btn-primary-hover) 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 16px rgba(99, 102, 241, 0.3)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(99, 102, 241, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(99, 102, 241, 0.3)';
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
