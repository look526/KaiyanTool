import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Loader2, TestTube } from 'lucide-react';

interface TestProgressPanelProps {
  testingProvider: string | null;
  testingModel: string | null;
  isDark: boolean;
  accentColor: string;
}

export function TestProgressPanel({ testingProvider, testingModel, isDark, accentColor }: TestProgressPanelProps) {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'testing' | 'success' | 'error'>('testing');

  useEffect(() => {
    if (testingProvider || testingModel) {
      setShow(true);
      setType('testing');
      if (testingProvider) {
        setMessage('正在测试 AI 服务提供商...');
      } else if (testingModel) {
        setMessage('正在测试 AI 模型...');
      }
    } else {
      // When testing completes, show success message briefly
      if (show && type === 'testing') {
        setType('success');
        setMessage('测试完成');
        
        // Auto dismiss after 2 seconds
        const timer = setTimeout(() => {
          setShow(false);
        }, 2000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [testingProvider, testingModel, show, type]);

  if (!show) return null;

  const colors = isDark ? {
    bgPrimary: 'rgba(5, 5, 10, 0.95)',
    bgSecondary: 'rgba(255, 255, 255, 0.03)',
    textPrimary: '#fafafa',
    textSecondary: 'rgba(250, 250, 250, 0.6)',
  } : {
    bgPrimary: 'rgba(255, 255, 255, 0.92)',
    bgSecondary: 'rgba(0, 0, 0, 0.02)',
    textPrimary: '#18181b',
    textSecondary: 'rgba(24, 24, 27, 0.6)',
  };

  const getBorderColor = () => {
    switch (type) {
      case 'testing':
        return accentColor;
      case 'success':
        return '#10b981';
      case 'error':
        return '#ef4444';
      default:
        return accentColor;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'testing':
        return <Loader2 style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} />;
      case 'success':
        return <CheckCircle style={{ width: '20px', height: '20px' }} />;
      case 'error':
        return <XCircle style={{ width: '20px', height: '20px' }} />;
      default:
        return <TestTube style={{ width: '20px', height: '20px' }} />;
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '32px',
        right: '32px',
        background: colors.bgPrimary,
        backdropFilter: 'blur(20px)',
        border: `2px solid ${getBorderColor()}`,
        borderRadius: '16px',
        padding: '20px 24px',
        boxShadow: `0 12px 32px rgba(0, 0, 0, 0.15), 0 0 20px ${accentColor}10`,
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        zIndex: 1000,
        animation: 'slideIn 0.3s ease',
        minWidth: '280px',
      }}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          background: type === 'testing' 
            ? `${accentColor}20` 
            : type === 'success' 
            ? 'rgba(16, 185, 129, 0.1)' 
            : 'rgba(239, 68, 68, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: getBorderColor(),
        }}
      >
        {getIcon()}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '14px',
          fontWeight: '600',
          color: colors.textPrimary,
          marginBottom: '4px',
        }}>
          {type === 'testing' ? '测试中' : type === 'success' ? '测试成功' : '测试失败'}
        </div>
        <div style={{
          fontSize: '13px',
          color: colors.textSecondary,
          lineHeight: '1.4',
        }}>
          {message}
        </div>
      </div>
      
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100%) translateY(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0) translateY(0);
          }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
