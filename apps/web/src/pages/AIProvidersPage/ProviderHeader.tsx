import { useState } from 'react';
import { Cpu, Layers, CheckCircle, Plus, Zap } from 'lucide-react';
import type { AIProvider } from '../../types';

interface ProviderHeaderProps {
  providers: AIProvider[];
  isMobile: boolean;
  isTablet: boolean;
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

export function ProviderHeader({ 
  providers, 
  isMobile, 
  isTablet, 
  isDark = false,
  colors,
  accentColor = '#8b5cf6'
}: ProviderHeaderProps) {

  const [cardHovers, setCardHovers] = useState<Record<string, boolean>>({
    providers: false,
    models: false,
    enabled: false
  });

  const handleCardHover = (key: string, hover: boolean) => {
    setCardHovers(prev => ({ ...prev, [key]: hover }));
  };

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

  // 统计数据
  const providerCount = providers?.length || 0;
  const modelCount = providers?.reduce((acc, p) => acc + (p.models?.length || 0), 0) || 0;
  const enabledCount = providers?.filter(p => p.enabled).length || 0;

  return (
    <div style={{
      marginBottom: '40px',
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: 'space-between',
      alignItems: isMobile ? 'stretch' : 'center',
      gap: isMobile ? '20px' : '32px',
      flexWrap: 'wrap',
    }}>
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', flex: isMobile ? 1 : 'auto' }}>
        {/* 提供商统计卡片 */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            padding: '24px 32px',
            background: finalColors.bgGlass,
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: `1px solid ${cardHovers.providers ? accentColor : finalColors.border}`,
            transition: 'all 0.3s ease',
            boxShadow: isDark 
              ? cardHovers.providers 
                ? '0 24px 48px rgba(0, 0, 0, 0.2), 0 0 40px rgba(139, 92, 246, 0.15)'
                : '0 8px 24px rgba(0, 0, 0, 0.1)'
              : cardHovers.providers 
                ? '0 16px 36px rgba(0, 0, 0, 0.15)'
                : '0 4px 12px rgba(0, 0, 0, 0.05)',
            transform: cardHovers.providers ? 'translateY(-6px)' : 'translateY(0)',
            minWidth: '220px',
          }}
          onMouseEnter={() => handleCardHover('providers', true)}
          onMouseLeave={() => handleCardHover('providers', false)}
        >
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}cc 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 8px 24px ${accentColor}40`,
            transition: 'all 0.3s ease',
            transform: cardHovers.providers ? 'scale(1.1)' : 'scale(1)',
          }}>
            <Cpu style={{ width: '28px', height: '28px', color: '#ffffff' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ 
              fontSize: '32px', 
              fontWeight: '700', 
              color: finalColors.textPrimary, 
              lineHeight: 1, 
              marginBottom: '8px',
              background: cardHovers.providers 
                ? `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}cc 100%)`
                : 'none',
              WebkitBackgroundClip: cardHovers.providers ? 'text' : 'none',
              WebkitTextFillColor: cardHovers.providers ? 'transparent' : finalColors.textPrimary,
              transition: 'all 0.3s ease',
            }}>
              {providerCount}
            </div>
            <div style={{ 
              fontSize: '14px', 
              color: finalColors.textMuted, 
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <span>提供商</span>
              {cardHovers.providers && (
                <Zap style={{ 
                  width: '14px', 
                  height: '14px', 
                  color: accentColor,
                  animation: 'pulse 1s infinite',
                }} />
              )}
            </div>
          </div>
        </div>

        {/* 模型统计卡片 */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            padding: '24px 32px',
            background: finalColors.bgGlass,
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: `1px solid ${cardHovers.models ? '#06b6d4' : finalColors.border}`,
            transition: 'all 0.3s ease',
            boxShadow: isDark 
              ? cardHovers.models 
                ? '0 24px 48px rgba(0, 0, 0, 0.2), 0 0 40px rgba(6, 182, 212, 0.15)'
                : '0 8px 24px rgba(0, 0, 0, 0.1)'
              : cardHovers.models 
                ? '0 16px 36px rgba(0, 0, 0, 0.15)'
                : '0 4px 12px rgba(0, 0, 0, 0.05)',
            transform: cardHovers.models ? 'translateY(-6px)' : 'translateY(0)',
            minWidth: '220px',
          }}
          onMouseEnter={() => handleCardHover('models', true)}
          onMouseLeave={() => handleCardHover('models', false)}
        >
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(6, 182, 212, 0.4)',
            transition: 'all 0.3s ease',
            transform: cardHovers.models ? 'scale(1.1)' : 'scale(1)',
          }}>
            <Layers style={{ width: '28px', height: '28px', color: '#ffffff' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ 
              fontSize: '32px', 
              fontWeight: '700', 
              color: finalColors.textPrimary, 
              lineHeight: 1, 
              marginBottom: '8px',
              background: cardHovers.models 
                ? 'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)'
                : 'none',
              WebkitBackgroundClip: cardHovers.models ? 'text' : 'none',
              WebkitTextFillColor: cardHovers.models ? 'transparent' : finalColors.textPrimary,
              transition: 'all 0.3s ease',
            }}>
              {modelCount}
            </div>
            <div style={{ 
              fontSize: '14px', 
              color: finalColors.textMuted, 
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <span>模型</span>
              {cardHovers.models && (
                <Zap style={{ 
                  width: '14px', 
                  height: '14px', 
                  color: '#06b6d4',
                  animation: 'pulse 1s infinite',
                }} />
              )}
            </div>
          </div>
        </div>

        {/* 已启用统计卡片 */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            padding: '24px 32px',
            background: finalColors.bgGlass,
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: `1px solid ${cardHovers.enabled ? '#10b981' : finalColors.border}`,
            transition: 'all 0.3s ease',
            boxShadow: isDark 
              ? cardHovers.enabled 
                ? '0 24px 48px rgba(0, 0, 0, 0.2), 0 0 40px rgba(16, 185, 129, 0.15)'
                : '0 8px 24px rgba(0, 0, 0, 0.1)'
              : cardHovers.enabled 
                ? '0 16px 36px rgba(0, 0, 0, 0.15)'
                : '0 4px 12px rgba(0, 0, 0, 0.05)',
            transform: cardHovers.enabled ? 'translateY(-6px)' : 'translateY(0)',
            minWidth: '220px',
          }}
          onMouseEnter={() => handleCardHover('enabled', true)}
          onMouseLeave={() => handleCardHover('enabled', false)}
        >
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)',
            transition: 'all 0.3s ease',
            transform: cardHovers.enabled ? 'scale(1.1)' : 'scale(1)',
          }}>
            <CheckCircle style={{ width: '28px', height: '28px', color: '#ffffff' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ 
              fontSize: '32px', 
              fontWeight: '700', 
              color: finalColors.textPrimary, 
              lineHeight: 1, 
              marginBottom: '8px',
              background: cardHovers.enabled 
                ? 'linear-gradient(135deg, #10b981 0%, #34d399 100%)'
                : 'none',
              WebkitBackgroundClip: cardHovers.enabled ? 'text' : 'none',
              WebkitTextFillColor: cardHovers.enabled ? 'transparent' : finalColors.textPrimary,
              transition: 'all 0.3s ease',
            }}>
              {enabledCount}
            </div>
            <div style={{ 
              fontSize: '14px', 
              color: finalColors.textMuted, 
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <span>已启用</span>
              {cardHovers.enabled && (
                <Zap style={{ 
                  width: '14px', 
                  height: '14px', 
                  color: '#10b981',
                  animation: 'pulse 1s infinite',
                }} />
              )}
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}
