import React from 'react';
import { Upload, Wand2, Images } from 'lucide-react';
import type { TabType } from './types';

interface ImageSelectorTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

/**
 * Tab navigation for ImageSelector modal
 */
export function ImageSelectorTabs({ activeTab, onTabChange }: ImageSelectorTabsProps) {
  const tabs = [
    { id: 'upload' as TabType, label: '本地上传', icon: Upload },
    { id: 'generate' as TabType, label: 'AI 生成', icon: Wand2 },
    { id: 'library' as TabType, label: '素材库', icon: Images },
  ];

  return (
    <div className="flex border-b border-gray-300 dark:border-gray-700">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 py-3 border-none bg-transparent cursor-pointer flex items-center justify-center gap-1.5 transition-all duration-200 ${activeTab === tab.id ? 'border-b-2 border-primary-500 text-primary-900 dark:text-primary-100 font-semibold' : 'border-b-2 border-transparent text-gray-500 dark:text-gray-400 font-normal'}`}
        >
          <tab.icon className="w-4 h-4" />
          {tab.label}
        </button>
      ))}
    </div>
  );
}
