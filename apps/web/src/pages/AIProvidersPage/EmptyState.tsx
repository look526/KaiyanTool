import { Settings, Plus, LayoutGrid } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';

interface EmptyStateProps {
  type: 'providers' | 'models';
  onAddProvider?: () => void;
  providerColor?: string;
}

export function EmptyState({ type, onAddProvider, providerColor }: EmptyStateProps) {
  if (type === 'providers') {
    return (
      <Card style={{
        padding: '64px',
        textAlign: 'center',
        border: '2px dashed var(--border-secondary)',
      }}>
        <Settings style={{ width: '80px', height: '80px', marginBottom: '24px', display: 'inline-block', color: 'var(--text-muted)' }} />
        <h2 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: 'var(--text-primary)',
          marginBottom: '12px',
          margin: '0 0 12px 0',
        }}>
          暂无 AI 服务提供商
        </h2>
        <p style={{ fontSize: '16px', color: 'var(--text-tertiary)', marginBottom: '32px' }}>
          添加您的第一个 AI 服务提供商开始使用
        </p>
        <Button
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
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 14px rgba(139, 92, 246, 0.35)',
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
        </Button>
      </Card>
    );
  }

  return (
    <div style={{
      padding: '64px',
      textAlign: 'center',
      backgroundColor: 'var(--bg-surface)',
      borderRadius: '16px',
      border: '2px dashed var(--border-secondary)',
      transition: 'all 0.3s ease',
    }}
    onMouseEnter={(e) => {
      if (providerColor) {
        e.currentTarget.style.borderColor = providerColor;
        e.currentTarget.style.backgroundColor = `${providerColor}05`;
      }
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = 'var(--border-secondary)';
      e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
    }}>
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '20px',
        backgroundColor: providerColor ? `${providerColor}15` : 'var(--bg-surface)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '20px',
      }}>
        <LayoutGrid style={{ width: '32px', height: '32px', color: providerColor || 'var(--text-tertiary)' }} />
      </div>
      <h3 style={{
        fontSize: '18px',
        fontWeight: '700',
        color: 'var(--text-primary)',
        marginBottom: '12px',
        margin: '0 0 12px 0',
      }}>
        暂无模型
      </h3>
      <p style={{ fontSize: '14px', color: 'var(--text-tertiary)', margin: 0, lineHeight: '1.6' }}>
        点击上方"添加模型"按钮开始配置您的第一个AI模型
      </p>
    </div>
  );
}
