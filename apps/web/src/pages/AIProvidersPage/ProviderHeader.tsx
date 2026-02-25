import { Zap, Cpu, LayoutGrid, CheckCircle, Plus } from 'lucide-react';
import { AIProvider } from './types';

interface ProviderHeaderProps {
  providers: AIProvider[];
  isMobile: boolean;
  isTablet: boolean;
  onAddProvider?: () => void;
}

export function ProviderHeader({ providers, isMobile, isTablet, onAddProvider }: ProviderHeaderProps) {
  return (
    <div style={{
      marginBottom: isMobile ? '24px' : '48px',
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: 'space-between',
      alignItems: isMobile ? 'flex-start' : 'flex-start',
      gap: isMobile ? '20px' : 0,
    }}>
      <div style={{ flex: 1, width: isMobile ? '100%' : 'auto' }}>
        <div style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? '12px' : '20px', marginBottom: '16px', flexDirection: isMobile ? 'column' : 'row' }}>
          <div style={{
            width: isMobile ? '48px' : '64px',
            height: isMobile ? '48px' : '64px',
            borderRadius: isMobile ? '14px' : '20px',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px -4px rgba(139, 92, 246, 0.4)',
          }}>
            <Zap style={{ width: isMobile ? '24px' : '32px', height: isMobile ? '24px' : '32px', color: '#ffffff' }} />
          </div>
          <div>
            <h1 style={{
              fontSize: isMobile ? '24px' : '36px',
              fontWeight: '800',
              color: 'var(--text-primary)',
              marginBottom: '8px',
              margin: '0 0 8px 0',
              letterSpacing: '-0.5px',
            }}>
              AI 服务提供商
            </h1>
            <p style={{ fontSize: isMobile ? '14px' : '15px', color: 'var(--text-tertiary)', margin: 0, lineHeight: '1.6' }}>
              管理您的 AI 服务提供商和模型配置，轻松连接多个AI服务
            </p>
          </div>
        </div>
        
        <div style={{
          display: 'flex',
          gap: isMobile ? '12px' : '24px',
          marginTop: '24px',
          padding: isMobile ? '16px' : '20px',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: '16px',
          border: '1px solid var(--border-primary)',
          flexDirection: isMobile ? 'column' : 'row',
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              backgroundColor: 'var(--success-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Cpu style={{ width: '20px', height: '20px', color: 'var(--success)' }} />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', lineHeight: 1 }}>
                {providers?.length || 0}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
                已配置提供商
              </div>
            </div>
          </div>
          <div style={{ width: isMobile ? '100%' : '1px', height: isMobile ? '1px' : 'auto', backgroundColor: 'var(--border-secondary)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              backgroundColor: 'var(--info-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <LayoutGrid style={{ width: '20px', height: '20px', color: 'var(--info)' }} />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', lineHeight: 1 }}>
                {providers?.reduce((acc, p) => acc + (p.models?.length || 0), 0) || 0}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
                模型总数
              </div>
            </div>
          </div>
          <div style={{ width: isMobile ? '100%' : '1px', height: isMobile ? '1px' : 'auto', backgroundColor: 'var(--border-secondary)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              backgroundColor: 'var(--success-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <CheckCircle style={{ width: '20px', height: '20px', color: 'var(--success)' }} />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', lineHeight: 1 }}>
                {providers?.filter(p => p.enabled).length || 0}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
                已启用服务
              </div>
            </div>
          </div>
        </div>
      </div>

      {onAddProvider && (
        <button
          onClick={onAddProvider}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            height: '48px',
            padding: '0 28px',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
            border: 'none',
            borderRadius: '14px',
            fontSize: '15px',
            fontWeight: '600',
            color: 'white',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 14px rgba(139, 92, 246, 0.35)',
            alignSelf: 'flex-start',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(139, 92, 246, 0.45)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 14px rgba(139, 92, 246, 0.35)';
          }}
        >
          <Plus style={{ width: '20px', height: '20px' }} />
          添加提供商
        </button>
      )}
    </div>
  );
}
