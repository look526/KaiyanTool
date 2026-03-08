import { useState } from 'react';
import { Settings, Plus, LayoutGrid } from 'lucide-react';

interface EmptyStateProps {
  type: 'providers' | 'models';
  onAddProvider?: () => void;
  providerColor?: string;
  isDark?: boolean;
  colors?: {
    bgPrimary: string;
    bgSecondary: string;
    bgGlass: string;
    bgGlassHover: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    border: string;
    borderHover: string;
  };
  accentColor?: string;
}

export function EmptyState({ 
  type, 
  onAddProvider, 
  providerColor, 
  isDark = false,
  colors,
  accentColor = '#8b5cf6'
}: EmptyStateProps) {
  const [buttonHover, setButtonHover] = useState(false);
  const [cardHover, setCardHover] = useState(false);

  // 确保colors有默认值
  const defaultColors = isDark ? {
    bgPrimary: 'rgba(5, 5, 10, 0.95)',
    bgSecondary: 'rgba(255, 255, 255, 0.03)',
    bgGlass: 'rgba(255, 255, 255, 0.04)',
    bgGlassHover: 'rgba(255, 255, 255, 0.06)',
    textPrimary: '#fafafa',
    textSecondary: 'rgba(250, 250, 250, 0.6)',
    textMuted: 'rgba(250, 250, 250, 0.4)',
    border: 'rgba(255, 255, 255, 0.06)',
    borderHover: 'rgba(139, 92, 246, 0.25)',
  } : {
    bgPrimary: 'rgba(255, 255, 255, 0.92)',
    bgSecondary: 'rgba(0, 0, 0, 0.02)',
    bgGlass: 'rgba(0, 0, 0, 0.02)',
    bgGlassHover: 'rgba(0, 0, 0, 0.04)',
    textPrimary: '#18181b',
    textSecondary: 'rgba(24, 24, 27, 0.6)',
    textMuted: 'rgba(24, 24, 27, 0.4)',
    border: 'rgba(0, 0, 0, 0.06)',
    borderHover: 'rgba(139, 92, 246, 0.25)',
  };

  const finalColors = colors || defaultColors;

  if (type === 'providers') {
    return (
      <div 
        style={{
          padding: '64px',
          textAlign: 'center',
          background: finalColors.bgGlass,
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          border: `2px dashed ${finalColors.border}`,
          transition: 'all 0.3s ease',
          boxShadow: isDark 
            ? '0 20px 40px rgba(0, 0, 0, 0.15), 0 0 30px rgba(139, 92, 246, 0.1)'
            : '0 8px 24px rgba(0, 0, 0, 0.05), 0 0 20px rgba(139, 92, 246, 0.05)',
          transform: cardHover ? 'translateY(-4px)' : 'translateY(0)',
        }}
        onMouseEnter={() => setCardHover(true)}
        onMouseLeave={() => setCardHover(false)}
      >
        <div style={{
          width: '80px',
          height: '80px',
          margin: '0 auto 24px',
          background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}cc 100%)`,
          borderRadius: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 8px 24px ${accentColor}40`,
          transition: 'all 0.3s ease',
          transform: cardHover ? 'scale(1.05)' : 'scale(1)',
        }}>
          <Settings style={{ width: '40px', height: '40px', color: '#ffffff' }} />
        </div>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: finalColors.textPrimary,
          margin: '0 0 16px 0',
          transition: 'all 0.3s ease',
        }}>
          暂无 AI 服务提供商
        </h2>
        <p style={{
          fontSize: '16px',
          color: finalColors.textSecondary,
          margin: '0 0 32px 0',
          lineHeight: '1.6',
          transition: 'all 0.3s ease',
        }}>
          添加您的第一个 AI 服务提供商开始使用
        </p>
        <button
          onClick={onAddProvider}
          onMouseEnter={() => setButtonHover(true)}
          onMouseLeave={() => setButtonHover(false)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            height: '52px',
            padding: '0 32px',
            background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}cc 100%)`,
            border: 'none',
            borderRadius: '14px',
            fontSize: '15px',
            fontWeight: '600',
            color: 'white',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: buttonHover 
              ? `0 12px 32px ${accentColor}50`
              : `0 8px 24px ${accentColor}40`,
            transform: buttonHover ? 'translateY(-2px) scale(1.02)' : 'translateY(0) scale(1)',
          }}
        >
          <Plus style={{ width: '20px', height: '20px' }} />
          添加提供商
        </button>
      </div>
    );
  }

  return (
    <div 
      style={{
        padding: '64px',
        textAlign: 'center',
        background: finalColors.bgGlass,
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        border: `2px dashed ${finalColors.border}`,
        transition: 'all 0.3s ease',
        boxShadow: isDark 
          ? '0 20px 40px rgba(0, 0, 0, 0.15), 0 0 30px rgba(139, 92, 246, 0.1)'
          : '0 8px 24px rgba(0, 0, 0, 0.05), 0 0 20px rgba(139, 92, 246, 0.05)',
        transform: cardHover ? 'translateY(-4px)' : 'translateY(0)',
      }}
      onMouseEnter={(e) => {
        setCardHover(true);
        if (providerColor) {
          e.currentTarget.style.borderColor = providerColor;
          e.currentTarget.style.background = `${providerColor}08`;
        }
      }}
      onMouseLeave={(e) => {
        setCardHover(false);
        e.currentTarget.style.borderColor = finalColors.border;
        e.currentTarget.style.background = finalColors.bgGlass;
      }}
    >
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '20px',
        background: providerColor ? `linear-gradient(135deg, ${providerColor} 0%, ${providerColor}cc 100%)` : `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}cc 100%)`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '24px',
        boxShadow: providerColor 
          ? `0 8px 24px ${providerColor}40`
          : `0 8px 24px ${accentColor}40`,
        transition: 'all 0.3s ease',
        transform: cardHover ? 'scale(1.05)' : 'scale(1)',
      }}>
        <LayoutGrid style={{ width: '32px', height: '32px', color: '#ffffff' }} />
      </div>
      <h3 style={{
        fontSize: '18px',
        fontWeight: '700',
        color: finalColors.textPrimary,
        margin: '0 0 16px 0',
        transition: 'all 0.3s ease',
      }}>
        暂无模型
      </h3>
      <p style={{
        fontSize: '14px',
        color: finalColors.textSecondary,
        margin: 0,
        lineHeight: '1.6',
        transition: 'all 0.3s ease',
      }}>
        点击上方"添加模型"按钮开始配置您的第一个AI模型
      </p>
    </div>
  );
}
