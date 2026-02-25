import { Plus, Zap } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { QuickCreateButtonProps } from './types';

export function QuickCreateButton({ template, onClick }: QuickCreateButtonProps) {
  const { theme } = useTheme();
  const Icon = template.icon;
  const [gradientStart, gradientEnd] = template.gradient.replace('from-', '').replace('to-', '').split(' ');

  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '20px 28px',
        background: `linear-gradient(135deg, ${gradientStart} 0%, ${gradientEnd} 100%)`,
        border: 'none',
        borderRadius: '16px',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = `0 12px 32px ${gradientStart}40`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.15)';
      }}
    >
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 100%)',
        pointerEvents: 'none',
      }} />
      
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        background: 'rgba(255, 255, 255, 0.25)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        position: 'relative',
      }}>
        <Icon style={{ width: '24px', height: '24px', color: 'white', position: 'relative', zIndex: 1 }} />
      </div>

      <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '6px',
        }}>
          <h4 style={{
            fontSize: '16px',
            fontWeight: '700',
            color: '#ffffff',
            margin: 0,
            letterSpacing: '-0.3px',
          }}>
            {template.name}
          </h4>
          <Zap style={{ width: '14px', height: '14px', color: '#fbbf24' }} />
        </div>
        <p style={{
          fontSize: '13px',
          color: 'rgba(255, 255, 255, 0.85)',
          margin: 0,
          lineHeight: '1.5',
        }}>
          {template.description}
        </p>
      </div>

      <div style={{
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.25)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        position: 'relative',
      }}>
        <Plus style={{ width: '18px', height: '18px', color: 'white', position: 'relative', zIndex: 1 }} />
      </div>
    </button>
  );
}
