import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  size?: 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge';
  showClose?: boolean;
  closeOnOverlay?: boolean;
  closeOnEscape?: boolean;
  footer?: ReactNode;
  icon?: 'success' | 'error' | 'warning' | 'info' | ReactNode;
  iconColor?: string;
  className?: string;
  animation?: 'fade' | 'slide' | 'zoom';
  overlayVariant?: 'default' | 'light';
}

const SIZE_CONFIG = {
  small: { maxWidth: '360px', padding: '24px' },
  medium: { maxWidth: '480px', padding: '32px' },
  large: { maxWidth: '640px', padding: '32px' },
  xlarge: { maxWidth: '800px', padding: '32px' },
  xxlarge: { maxWidth: '860px', padding: '24px' },
};

const ICON_COLORS = {
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = 'medium',
  showClose = true,
  closeOnOverlay = true,
  closeOnEscape = true,
  footer,
  icon,
  iconColor,
  className,
  overlayVariant = 'default',
}: ModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setIsVisible(true);
      setTimeout(() => setIsAnimating(true), 10);
      document.body.style.overflow = 'hidden';
    } else {
      setIsAnimating(false);
      setTimeout(() => {
        setIsVisible(false);
        document.body.style.overflow = '';
      }, 200);
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape && open) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [open, closeOnEscape, onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlay && e.target === overlayRef.current) {
      onClose();
    }
  };

  const renderIcon = () => {
    if (!icon) return null;

    if (React.isValidElement(icon)) {
      return (
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: `${iconColor || ICON_COLORS.info}15`,
          marginBottom: '16px',
        }}>
          {icon}
        </div>
      );
    }

    const iconNode = (icon as 'success' | 'error' | 'warning' | 'info');
    const color = iconColor || ICON_COLORS[iconNode];
    const IconComponent = iconNode === 'success' ? CheckCircle :
                         iconNode === 'error' ? AlertCircle :
                         iconNode === 'warning' ? AlertTriangle : Info;

    return (
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: `${color}15`,
        marginBottom: '16px',
      }}>
        <IconComponent style={{ width: '24px', height: '24px', color }} />
      </div>
    );
  };

  const getAnimationStyle = (): React.CSSProperties => {
    if (!isVisible) {
      return { opacity: 0, transform: 'scale(0.95)' };
    }
    if (!isAnimating) {
      return { opacity: 0, transform: 'scale(0.95)' };
    }
    return { opacity: 1, transform: 'scale(1)' };
  };

  if (!isVisible && !isAnimating) return null;

  const sizeConfig = SIZE_CONFIG[size];
  const isLightOverlay = overlayVariant === 'light';

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: isLightOverlay ? 'rgba(0, 0, 0, 0.18)' : 'rgba(0, 0, 0, 0.6)',
        backdropFilter: isLightOverlay ? 'none' : 'blur(2px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: isLightOverlay ? '24px' : '48px 24px',
        animation: isAnimating ? 'modal-overlay-enter 0.2s ease-out' : 'modal-overlay-exit 0.2s ease-out',
      }}
    >
      <div
        className={className}
        style={{
          backgroundColor: 'var(--bg-base)',
          borderRadius: '16px',
          maxWidth: sizeConfig.maxWidth,
          width: '100%',
          maxHeight: isLightOverlay ? 'calc(100vh - 48px)' : 'calc(100vh - 72px)',
          margin: isLightOverlay ? '24px auto' : '36px auto',
          overflow: 'auto',
          padding: sizeConfig.padding,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
          border: '1px solid var(--border-primary)',
          position: 'relative',
          ...getAnimationStyle(),
          transition: 'opacity 0.2s ease-out, transform 0.2s ease-out',
        }}
      >
        <style>{`
          @keyframes modal-overlay-enter {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes modal-overlay-exit {
            from { opacity: 1; }
            to { opacity: 0; }
          }
          @keyframes modal-content-enter {
            from {
              opacity: 0;
              transform: scale(0.95) translateY(10px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }
        `}</style>

        {showClose && (
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: 'none',
              background: 'transparent',
              color: 'var(--text-tertiary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--text-tertiary)';
            }}
          >
            <X style={{ width: '18px', height: '18px' }} />
          </button>
        )}

        <div style={{ paddingRight: showClose ? '40px' : 0 }}>
          {renderIcon()}

          {title && (
            <h2 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: 'var(--text-primary)',
              margin: 0,
              marginBottom: description ? '8px' : 0,
              lineHeight: 1.4,
            }}>
              {title}
            </h2>
          )}

          {description && (
            <p style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              margin: 0,
              marginBottom: '24px',
              lineHeight: 1.6,
            }}>
              {description}
            </p>
          )}

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}>
            {children}
          </div>

          {footer && (
            <div style={{
              marginTop: '24px',
              paddingTop: '24px',
              borderTop: '1px solid var(--border-primary)',
            }}>
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: ReactNode;
  description?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'danger' | 'success';
  icon?: 'success' | 'error' | 'warning' | 'info' | ReactNode;
  iconColor?: string;
  loading?: boolean;
  className?: string;
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = '确认',
  cancelText = '取消',
  confirmVariant = 'primary',
  icon,
  iconColor,
  loading = false,
  className,
}: ConfirmModalProps) {
  const variantStyles = {
    primary: {
      backgroundColor: 'var(--accent)',
      hoverBackgroundColor: 'var(--accent-hover)',
      color: 'var(--accent-on)',
    },
    danger: {
      backgroundColor: 'var(--error)',
      hoverBackgroundColor: '#dc2626',
      color: '#fff',
    },
    success: {
      backgroundColor: '#10b981',
      hoverBackgroundColor: '#059669',
      color: '#fff',
    },
  };

  const handleConfirm = () => {
    if (!loading) {
      onConfirm();
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      icon={icon as ReactNode}
      iconColor={iconColor}
      className={className}
      footer={
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end',
        }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              height: '40px',
              padding: '0 20px',
              fontSize: '14px',
              fontWeight: '500',
              background: 'transparent',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-primary)',
              borderRadius: '10px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease',
              opacity: loading ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            style={{
              height: '40px',
              padding: '0 24px',
              fontSize: '14px',
              fontWeight: '600',
              background: variantStyles[confirmVariant].backgroundColor,
              color: variantStyles[confirmVariant].color,
              border: 'none',
              borderRadius: '10px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              opacity: loading ? 0.7 : 1,
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = variantStyles[confirmVariant].hoverBackgroundColor;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = variantStyles[confirmVariant].backgroundColor;
            }}
          >
            {loading && (
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderTopColor: '#fff',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }} />
            )}
            {confirmText}
          </button>
        </div>
      }
    />
  );
}
