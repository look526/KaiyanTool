import { useEffect, useCallback, ReactNode, useState } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'small' | 'medium' | 'large';
  showCloseButton?: boolean;
  className?: string;
}

const SIZE_CONFIG = {
  small: {
    maxWidth: '400px',
    padding: '24px',
  },
  medium: {
    maxWidth: '560px',
    padding: '32px',
  },
  large: {
    maxWidth: '720px',
    padding: '40px',
  },
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  showCloseButton = true,
  className,
}: ModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const sizeConfig = SIZE_CONFIG[size];

  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      setIsVisible(false);
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  return (
    <div
      className={className}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        animation: 'fade-in 0.2s ease-out',
      }}
    >
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          animation: 'backdrop-fade 0.3s ease-out',
        }}
      />
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: sizeConfig.maxWidth,
          maxHeight: '90vh',
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '32px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 32px 64px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(40px) saturate(200%)',
          WebkitBackdropFilter: 'blur(40px) saturate(200%)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'modal-enter 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {(title || showCloseButton) && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: sizeConfig.padding,
              paddingBottom: '20px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {title && (
              <h2 style={{
                fontSize: '22px',
                fontWeight: '700',
                color: '#ffffff',
                margin: 0,
                letterSpacing: '-0.02em',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                style={{
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  color: 'rgba(255, 255, 255, 0.6)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  marginLeft: 'auto',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.transform = 'scale(1.1) rotate(90deg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
                  e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                }}
              >
                <X style={{ width: '22px', height: '22px' }} />
              </button>
            )}
          </div>
        )}
        <div
          style={{
            padding: sizeConfig.padding,
            paddingTop: '24px',
            overflowY: 'auto',
            flex: 1,
          }}
        >
          {children}
        </div>
      </div>
      <style>{`
        @keyframes modal-enter {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-30px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes backdrop-fade {
          from {
            opacity: 0;
            backdrop-filter: blur(0px);
          }
          to {
            opacity: 1;
            backdrop-filter: blur(12px);
          }
        }
      `}</style>
    </div>
  );
}
