import * as React from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const toastIcons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={20} />,
  error: <AlertCircle size={20} />,
  warning: <AlertTriangle size={20} />,
  info: <Info size={20} />,
};

const toastColors: Record<ToastType, { bg: string; color: string; border: string }> = {
  success: {
    bg: 'rgba(52, 199, 89, 0.1)',
    color: 'var(--color-success)',
    border: 'rgba(52, 199, 89, 0.3)',
  },
  error: {
    bg: 'rgba(255, 59, 48, 0.1)',
    color: 'var(--color-error)',
    border: 'rgba(255, 59, 48, 0.3)',
  },
  warning: {
    bg: 'rgba(255, 149, 0, 0.1)',
    color: 'var(--color-warning)',
    border: 'rgba(255, 149, 0, 0.3)',
  },
  info: {
    bg: 'rgba(0, 122, 255, 0.1)',
    color: 'var(--color-info)',
    border: 'rgba(0, 122, 255, 0.3)',
  },
};

export function Toast({ id, type, title, message, duration = 5000, onClose }: ToastProps) {
  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  const colors = toastColors[type];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 'var(--spacing-3)',
        padding: 'var(--spacing-4)',
        backgroundColor: 'var(--bg-elevated)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-lg)',
        border: `1px solid var(--border-primary)`,
        borderLeftWidth: '4px',
        borderLeftColor: colors.color,
        minWidth: '320px',
        maxWidth: '420px',
        animation: 'slideInRight 0.3s var(--ease-out) forwards',
      }}
    >
      <div
        style={{
          padding: 'var(--spacing-2)',
          borderRadius: 'var(--radius-md)',
          backgroundColor: colors.bg,
          color: colors.color,
        }}
      >
        {toastIcons[type]}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 'var(--font-size-sm)',
            fontWeight: 600,
            color: 'var(--text-primary)',
          }}
        >
          {title}
        </div>
        {message && (
          <div
            style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--text-secondary)',
              marginTop: 'var(--spacing-1)',
            }}
          >
            {message}
          </div>
        )}
      </div>
      <button
        onClick={() => onClose(id)}
        style={{
          padding: 'var(--spacing-1)',
          borderRadius: 'var(--radius-sm)',
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
        <X size={16} />
      </button>
    </div>
  );
}

export interface ToastContainerProps {
  toasts: Array<Omit<ToastProps, 'onClose'>>;
  onClose: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export function ToastContainer({
  toasts,
  onClose,
  position = 'top-right',
}: ToastContainerProps) {
  const positionStyles: Record<string, React.CSSProperties> = {
    'top-right': { top: 'var(--spacing-4)', right: 'var(--spacing-4)' },
    'top-left': { top: 'var(--spacing-4)', left: 'var(--spacing-4)' },
    'bottom-right': { bottom: 'var(--spacing-4)', right: 'var(--spacing-4)' },
    'bottom-left': { bottom: 'var(--spacing-4)', left: 'var(--spacing-4)' },
  };

  return (
    <div
      style={{
        position: 'fixed',
        zIndex: 'var(--z-toast)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-3)',
        ...positionStyles[position],
      }}
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={onClose} />
      ))}
    </div>
  );
}

export interface ToastContextType {
  toasts: Array<Omit<ToastProps, 'onClose'>>;
  addToast: (toast: Omit<ToastProps, 'id' | 'onClose'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export interface ToastProviderProps {
  children: React.ReactNode;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export function ToastProvider({ children, position = 'top-right' }: ToastProviderProps) {
  const [toasts, setToasts] = React.useState<Array<Omit<ToastProps, 'onClose'>>>([]);

  const addToast = React.useCallback((toast: Omit<ToastProps, 'id' | 'onClose'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} position={position} />
    </ToastContext.Provider>
  );
}

export default Toast;
