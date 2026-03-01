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
    bg: 'rgba(52, 199, 89, 0.15)',
    color: '#34C759',
    border: 'rgba(52, 199, 89, 0.3)',
  },
  error: {
    bg: 'rgba(255, 59, 48, 0.15)',
    color: '#FF3B30',
    border: 'rgba(255, 59, 48, 0.3)',
  },
  warning: {
    bg: 'rgba(255, 149, 0, 0.15)',
    color: '#FF9500',
    border: 'rgba(255, 149, 0, 0.3)',
  },
  info: {
    bg: 'rgba(0, 122, 255, 0.15)',
    color: '#007AFF',
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
        gap: '12px',
        padding: '16px',
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
        border: '1px solid #E5E5EA',
        borderLeftWidth: '4px',
        borderLeftColor: colors.color,
        minWidth: '320px',
        maxWidth: '420px',
        animation: 'slideInRight 0.3s ease-out forwards',
      }}
    >
      <div
        style={{
          padding: '8px',
          borderRadius: '8px',
          backgroundColor: colors.bg,
          color: colors.color,
        }}
      >
        {toastIcons[type]}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#1C1C1E',
          }}
        >
          {title}
        </div>
        {message && (
          <div
            style={{
              fontSize: '14px',
              color: '#8E8E93',
              marginTop: '4px',
            }}
          >
            {message}
          </div>
        )}
      </div>
      <button
        onClick={() => onClose(id)}
        style={{
          padding: '4px',
          borderRadius: '6px',
          border: 'none',
          background: 'transparent',
          color: '#8E8E93',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background = '#F2F2F7';
          (e.currentTarget as HTMLElement).style.color = '#1C1C1E';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = 'transparent';
          (e.currentTarget as HTMLElement).style.color = '#8E8E93';
        }}
      >
        <X size={16} />
      </button>
      <style>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
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
  position = 'bottom-right',
}: ToastContainerProps) {
  const positionStyles: Record<string, React.CSSProperties> = {
    'top-right': { top: '20px', right: '20px' },
    'top-left': { top: '20px', left: '20px' },
    'bottom-right': { bottom: '20px', right: '20px' },
    'bottom-left': { bottom: '20px', left: '20px' },
  };

  return (
    <div
      style={{
        position: 'fixed',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
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

export function ToastProvider({ children, position = 'bottom-right' }: ToastProviderProps) {
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
