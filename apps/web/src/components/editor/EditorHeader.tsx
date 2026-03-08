import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, Type, Upload, FileDown, Save, ChevronDown, LucideIcon, Loader2 } from 'lucide-react';
import { Button } from '../ui/button-new';

interface EditorHeaderProps {
  projectId: string;
  title: string;
  mode: 'script' | 'novel' | 'adaptation';
  autoSaveEnabled: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  onToggleAutoSave: () => void;
  onSave: () => void;
  onImport: () => void;
  onExport: () => void;
  onApplyTemplate: (template: string) => void;
}

const SCRIPT_TEMPLATES = [
  {
    name: '标准剧本',
    icon: '📝',
    template: `场景1 - 室内，白天

主角A：你好，这是一段对话。
主角B：你好！
(action)

场景2 - 室外，夜晚

主角A：这里是第二个场景。
(night scene)`,
  },
  {
    name: '电影剧本',
    icon: '🎬',
    template: `[场景1] 室内，白天
主角A
你好，这是一段对话。

主角B
你好！

[动作]
角色A做了一个手势。

[场景2] 室外，夜晚
主角A
这里是第二个场景。

[动作]
夜风吹过。`,
  },
];

export function EditorHeader({
  projectId,
  title,
  mode,
  autoSaveEnabled,
  isSaving,
  lastSaved,
  onToggleAutoSave,
  onSave,
  onImport,
  onExport,
  onApplyTemplate,
}: EditorHeaderProps) {
  const [backHover, setBackHover] = useState(false);
  const [showTemplateMenu, setShowTemplateMenu] = useState(false);
  const [autoSaveHover, setAutoSaveHover] = useState(false);
  const [importHover, setImportHover] = useState(false);
  const [exportHover, setExportHover] = useState(false);

  return (
    <header style={{
      height: '64px',
      backgroundColor: 'var(--bg-header)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border-primary)',
      padding: '0 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexShrink: 0,
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link 
          to={`/projects/${projectId}`} 
          style={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            textDecoration: 'none',
            color: backHover ? '#fff' : 'var(--text-muted)',
            background: backHover 
              ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' 
              : 'var(--bg-hover)',
            border: '1px solid var(--border-primary)',
            transition: 'all 0.2s ease',
            transform: backHover ? 'translateX(-2px)' : 'translateX(0)',
          }}
          onMouseEnter={() => setBackHover(true)}
          onMouseLeave={() => setBackHover(false)}
        >
          <ArrowLeft style={{ width: '18px', height: '18px' }} />
        </Link>
        <div>
          <h1 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
            {mode === 'script' ? '剧本编辑器' : '小说编辑器'}
          </h1>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>{title || '未命名'}</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={onToggleAutoSave}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 12px',
            borderRadius: '10px',
            border: '1px solid var(--border-primary)',
            background: autoSaveEnabled ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-hover)',
            color: autoSaveEnabled ? '#6366f1' : 'var(--text-secondary)',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <Clock style={{ width: '14px', height: '14px' }} />
          {autoSaveEnabled ? '自动保存' : '手动保存'}
        </button>

        {mode === 'script' && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowTemplateMenu(!showTemplateMenu)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                borderRadius: '10px',
                border: '1px solid var(--border-primary)',
                background: 'var(--bg-hover)',
                color: 'var(--text-primary)',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <Type style={{ width: '14px', height: '14px' }} />
              模板
              <ChevronDown style={{ 
                width: '12px', 
                height: '12px', 
                transform: showTemplateMenu ? 'rotate(180deg)' : 'rotate(0deg)', 
                transition: 'transform 0.2s' 
              }} />
            </button>
            {showTemplateMenu && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '8px',
                background: 'var(--bg-surface)',
                backdropFilter: 'blur(20px)',
                border: '1px solid var(--border-primary)',
                borderRadius: '14px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                minWidth: '200px',
                zIndex: 100,
                overflow: 'hidden',
              }} onClick={(e) => e.stopPropagation()}>
                {SCRIPT_TEMPLATES.map((tmpl, idx) => (
                  <TemplateMenuItem 
                    key={idx} 
                    template={tmpl} 
                    onClick={() => {
                      onApplyTemplate(tmpl.template);
                      setShowTemplateMenu(false);
                    }} 
                    isLast={idx === SCRIPT_TEMPLATES.length - 1}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        <IconButton icon={Upload} hover={importHover} setHover={setImportHover} onClick={onImport} />
        <IconButton icon={FileDown} hover={exportHover} setHover={setExportHover} onClick={onExport} />

        <button
          onClick={onSave}
          disabled={isSaving}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 24px',
            borderRadius: '12px',
            border: 'none',
            background: isSaving 
              ? 'rgba(99, 102, 241, 0.5)' 
              : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            color: '#fff',
            cursor: isSaving ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            boxShadow: isSaving ? 'none' : '0 4px 14px rgba(99, 102, 241, 0.3)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            if (!isSaving) {
              e.currentTarget.style.background = 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isSaving) {
              e.currentTarget.style.background = 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(99, 102, 241, 0.3)';
            }
          }}
        >
          {isSaving ? (
            <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
          ) : (
            <Save style={{ width: '16px', height: '16px' }} />
          )}
          {isSaving ? '保存中...' : '保存'}
        </button>
      </div>
    </header>
  );
}

function TemplateMenuItem({ template, onClick, isLast }: { 
  template: { name: string; icon: string }; 
  onClick: () => void;
  isLast: boolean;
}) {
  const [hover, setHover] = useState(false);

  return (
    <div 
      onClick={onClick} 
      style={{
        padding: '14px 18px',
        cursor: 'pointer',
        borderBottom: isLast ? 'none' : '1px solid var(--border-primary)',
        color: 'var(--text-primary)',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        transition: 'background-color 0.2s ease',
        background: hover ? 'var(--bg-hover)' : 'transparent',
      }} 
      onMouseEnter={() => setHover(true)} 
      onMouseLeave={() => setHover(false)}
    >
      <span style={{ fontSize: '18px' }}>{template.icon}</span>
      {template.name}
    </div>
  );
}

function IconButton({ icon: Icon, hover, setHover, onClick }: {
  icon: LucideIcon;
  hover: boolean;
  setHover: (v: boolean) => void;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '36px',
        height: '36px',
        borderRadius: '10px',
        border: '1px solid var(--border-primary)',
        background: hover ? 'var(--bg-input)' : 'var(--bg-hover)',
        color: hover ? 'var(--text-primary)' : 'var(--text-muted)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Icon style={{ width: '16px', height: '16px' }} />
    </button>
  );
}
