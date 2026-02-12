import { FileText, Folder, Inbox } from 'lucide-react';

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
  search: FileText,
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
        padding: '48px 24px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '16px',
          backgroundColor: 'var(--bg-hover)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
        }}
      >
        <Icon style={{ width: '32px', height: '32px', color: 'var(--text-muted)' }} />
      </div>
      <h3 style={{
        fontSize: '16px',
        fontWeight: '600',
        color: 'var(--text-primary)',
        margin: '0 0 8px 0',
      }}>
        {title}
      </h3>
      {description && (
        <p style={{
          fontSize: '14px',
          color: 'var(--text-secondary)',
          margin: '0 0 20px 0',
          maxWidth: '320px',
          lineHeight: '1.5',
        }}>
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          style={{
            height: '40px',
            padding: '0 20px',
            fontSize: '14px',
            fontWeight: '500',
            background: 'var(--accent)',
            color: 'var(--accent-on)',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--accent-hover)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--accent)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
