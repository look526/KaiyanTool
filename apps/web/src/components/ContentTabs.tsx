import { useState } from 'react';
import { FileText, BookOpen, Sparkles } from 'lucide-react';

interface ContentTabsProps {
  value: 'script' | 'novel' | 'adaptation';
  onChange: (value: 'script' | 'novel' | 'adaptation') => void;
}

export default function ContentTabs({ value, onChange }: ContentTabsProps) {
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  const tabs = [
    {
      id: 'script' as const,
      label: '剧本模式',
      icon: FileText,
      gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      gradientHover: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    },
    {
      id: 'novel' as const,
      label: '小说模式',
      icon: BookOpen,
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      gradientHover: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    },
    {
      id: 'adaptation' as const,
      label: '改编预览',
      icon: Sparkles,
      gradient: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
      gradientHover: 'linear-gradient(135deg, #db2777 0%, #e11d48 100%)',
    },
  ];

  return (
    <div style={{
      display: 'flex',
      gap: '4px',
      padding: '6px',
      background: 'var(--bg-surface)',
      borderRadius: '16px',
      border: '1px solid var(--border-primary)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
    }}>
      {tabs.map((tab) => {
        const isActive = value === tab.id;
        const isHovered = hoveredTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              borderRadius: '12px',
              border: 'none',
              background: isActive ? tab.gradient : (isHovered ? 'var(--bg-hover)' : 'transparent'),
              color: isActive ? '#fff' : (isHovered ? 'var(--text-primary)' : 'var(--text-muted)'),
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: isActive ? `0 4px 16px ${tab.gradient.includes('6366f1') ? 'rgba(99, 102, 241, 0.4)' : (tab.gradient.includes('10b981') ? 'rgba(16, 185, 129, 0.4)' : 'rgba(236, 72, 153, 0.4)')}` : 'none',
              transform: isActive ? 'scale(1.02)' : (isHovered ? 'scale(1)' : 'scale(0.98)'),
              opacity: isActive ? 1 : (isHovered ? 0.9 : 0.7),
            }}
            onMouseEnter={() => setHoveredTab(tab.id)}
            onMouseLeave={() => setHoveredTab(null)}
          >
            <tab.icon style={{
              width: '18px',
              height: '18px',
              transition: 'transform 0.3s ease',
            }} />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
