import { ArrowRight, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { ProjectTemplateSelectorProps } from './types';

export function ProjectTemplateSelector({
  templates,
  selectedTemplate,
  onTemplateSelect,
  showQuickCreate = false,
}: ProjectTemplateSelectorProps) {
  const { theme } = useTheme();

  const popularTemplates = templates.filter(t => t.popular);
  const otherTemplates = templates.filter(t => !t.popular);

  const TemplateCard = ({ template, isPopular = false }: { template: any; isPopular?: boolean }) => {
    const Icon = template.icon;
    const isSelected = selectedTemplate?.id === template.id;
    const [gradientStart, gradientEnd] = template.gradient.replace('from-', '').replace('to-', '').split(' ');

    return (
      <div
        key={template.id}
        onClick={() => onTemplateSelect(template)}
        style={{
          padding: '24px',
          border: `1px solid ${isSelected ? 'transparent' : (theme === 'dark' ? '#2a2a2a' : '#e5e7eb')}`,
          borderRadius: '16px',
          cursor: 'pointer',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.05)' : (theme === 'dark' ? '#111111' : '#ffffff'),
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)',
        }}
        onMouseEnter={(e) => {
          if (!isSelected) {
            e.currentTarget.style.borderColor = gradientStart;
            e.currentTarget.style.backgroundColor = `${gradientStart}08`;
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = `0 20px 40px -8px ${gradientStart}20, 0 8px 16px -6px ${gradientStart}15`;
          }
        }}
        onMouseLeave={(e) => {
          if (!isSelected) {
            e.currentTarget.style.borderColor = theme === 'dark' ? '#2a2a2a' : '#e5e7eb';
            e.currentTarget.style.backgroundColor = theme === 'dark' ? '#111111' : '#ffffff';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)';
          }
        }}
      >
        {isPopular && (
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            padding: '4px 10px',
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            borderRadius: '20px',
            fontSize: '10px',
            fontWeight: '700',
            color: '#ffffff',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)',
          }}>
            热门
          </div>
        )}
        {isSelected && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(135deg, ${gradientStart} 0%, ${gradientEnd} 100%)`,
            opacity: 0.05,
            borderRadius: '18px',
          }} />
        )}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', marginBottom: '16px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `linear-gradient(135deg, ${gradientStart} 0%, ${gradientEnd} 100%)`,
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
              transition: 'transform 0.3s ease',
            }}>
              <Icon style={{ width: '28px', height: '28px', color: 'white' }} />
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{
                fontSize: '18px',
                fontWeight: '700',
                color: theme === 'dark' ? '#ffffff' : '#1f2937',
                margin: '0 0 6px 0',
              }}>{template.name}</h4>
              <p style={{
                fontSize: '14px',
                color: theme === 'dark' ? '#888888' : '#6b7280',
                margin: '0 0 12px 0',
                lineHeight: '1.6',
              }}>{template.description}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {template.features.map((feature: string, idx: number) => (
                  <span key={idx} style={{
                    padding: '4px 12px',
                    fontSize: '12px',
                    fontWeight: '500',
                    borderRadius: '8px',
                    backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.15)' : (theme === 'dark' ? '#1a1a1a' : '#f3f4f6'),
                    color: isSelected ? '#6366f1' : (theme === 'dark' ? '#a0a0a0' : '#6b7280'),
                    border: '1px solid ' + (isSelected ? 'rgba(99, 102, 241, 0.3)' : 'transparent'),
                  }}>
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </div>
          {isSelected && (
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${gradientStart} 0%, ${gradientEnd} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
            }}>
              <ArrowRight style={{ width: '16px', height: '16px', color: 'white' }} />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {popularTemplates.length > 0 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Sparkles style={{ width: '20px', height: '20px', color: '#f59e0b' }} />
            <h3 style={{
              fontSize: '16px',
              fontWeight: '700',
              color: theme === 'dark' ? '#ffffff' : '#1f2937',
              margin: 0,
            }}>
              热门模板
            </h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '16px' }}>
            {popularTemplates.map((template) => (
              <TemplateCard key={template.id} template={template} isPopular />
            ))}
          </div>
        </>
      )}

      {otherTemplates.length > 0 && (
        <>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '700',
            color: theme === 'dark' ? '#ffffff' : '#1f2937',
            margin: '24px 0 16px 0',
          }}>
            全部模板
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '16px' }}>
            {otherTemplates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
