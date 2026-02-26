import * as React from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showClose?: boolean;
  closeOnOverlayClick?: boolean;
  className?: string;
}

const sizeStyles: Record<string, string> = {
  sm: '400px',
  md: '500px',
  lg: '600px',
  xl: '800px',
  full: '90vw',
};

export function Modal({
  open,
  onClose,
  children,
  title,
  description,
  size = 'md',
  showClose = true,
  closeOnOverlayClick = true,
  className = '',
}: ModalProps) {
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 'var(--z-modal)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--spacing-4)',
      }}
      onClick={closeOnOverlayClick ? onClose : undefined}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'var(--bg-overlay)',
          backdropFilter: 'blur(4px)',
        }}
      />
      <div
        className={className}
        style={{
          position: 'relative',
          backgroundColor: 'var(--bg-elevated)',
          borderRadius: 'var(--radius-2xl)',
          boxShadow: 'var(--shadow-2xl)',
          maxWidth: sizeStyles[size],
          width: '100%',
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'scaleIn 0.2s var(--ease-out) forwards',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || showClose) && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 'var(--spacing-5) var(--spacing-6)',
              borderBottom: '1px solid var(--border-secondary)',
            }}
          >
            <div>
              {title && (
                <h2
                  style={{
                    fontSize: 'var(--font-size-lg)',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    margin: 0,
                  }}
                >
                  {title}
                </h2>
              )}
              {description && (
                <p
                  style={{
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--text-secondary)',
                    margin: 'var(--spacing-1) 0 0 0',
                  }}
                >
                  {description}
                </p>
              )}
            </div>
            {showClose && (
              <button
                onClick={onClose}
                style={{
                  padding: 'var(--spacing-2)',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--text-tertiary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-secondary)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-tertiary)';
                }}
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            padding: 'var(--spacing-6)',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;
