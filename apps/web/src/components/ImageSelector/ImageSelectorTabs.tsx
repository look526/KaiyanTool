import React from 'react';
import { Upload, Wand2, Images } from 'lucide-react';
import type { TabType } from './types';
import { useTheme } from '../../contexts/ThemeContext';

const ACCENT_COLOR = '#8b5cf6';

interface ImageSelectorTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function ImageSelectorTabs({ activeTab, onTabChange }: ImageSelectorTabsProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  const tabs = [
    { id: 'upload' as TabType, label: '本地上传', icon: Upload },
    { id: 'generate' as TabType, label: 'AI 生成', icon: Wand2 },
    { id: 'library' as TabType, label: '素材库', icon: Images },
  ];

  return (
    <div style={{
      display: 'flex',
      background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
      borderRadius: '14px',
      padding: '4px',
      gap: '4px',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
    }}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        
        return (
          <div
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px 16px',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: isActive 
                ? `linear-gradient(135deg, ${ACCENT_COLOR} 0%, #a78bfa 100%)`
                : 'transparent',
              boxShadow: isActive ? `0 4px 14px ${ACCENT_COLOR}40` : 'none',
            }}
          >
            <Icon 
              style={{ 
                width: '18px', 
                height: '18px', 
                color: isActive ? '#ffffff' : isDark ? 'rgba(250,250,250,0.6)' : 'rgba(24,24,27,0.6)' 
              }} 
            />
            <span style={{
              fontSize: '14px',
              fontWeight: '600',
              color: isActive ? '#ffffff' : isDark ? 'rgba(250,250,250,0.7)' : 'rgba(24,24,27,0.7)',
            }}>
              {tab.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
