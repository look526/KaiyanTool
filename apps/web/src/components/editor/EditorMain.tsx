import React, { useState } from 'react';
import { FileText, LayoutGrid } from 'lucide-react';
import MonacoEditor from '../MonacoEditor';

interface EditorMainProps {
  content: string;
  onContentChange: (content: string) => void;
  theme: string;
  showAIPanel: boolean;
  lastSaved: Date | null;
  autoSaveEnabled: boolean;
  onSave: () => void;
}

export function EditorMain({
  content,
  onContentChange,
  theme,
  showAIPanel,
  lastSaved,
  autoSaveEnabled,
  onSave,
}: EditorMainProps) {
  const editorOptions = {
    fontSize: 15,
    fontFamily: "'Fira Code', 'Consolas', monospace",
    lineNumbers: 'on' as const,
    minimap: { enabled: true },
    wordWrap: 'on' as const,
    automaticLayout: true,
    scrollBeyondLastLine: false,
    formatOnPaste: true,
    tabSize: 2,
    insertSpaces: true,
    padding: { top: 20, bottom: 20 },
  };

  return (
    <div style={{ 
      flex: 1,
      width: '100%',
      padding: '16px', 
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{
        flex: 1,
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid var(--border-primary)',
        background: 'var(--bg-surface)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
      }}>
        <MonacoEditor 
          height="100%" 
          language="plaintext" 
          theme={theme === 'dark' ? 'vs-dark' : 'vs-light'} 
          value={content} 
          onChange={(value) => onContentChange(value || '')} 
          options={editorOptions} 
          onSave={onSave} 
        />
      </div>
      <EditorStatusBar 
        contentLength={content.length}
        lineCount={content.split('\n').length}
        lastSaved={lastSaved}
        autoSaveEnabled={autoSaveEnabled}
      />
    </div>
  );
}

function EditorStatusBar({ 
  contentLength, 
  lineCount, 
  lastSaved, 
  autoSaveEnabled 
}: {
  contentLength: number;
  lineCount: number;
  lastSaved: Date | null;
  autoSaveEnabled: boolean;
}) {
  return (
    <div style={{
      height: '32px',
      marginTop: '8px',
      padding: '0 12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontSize: '11px',
      color: 'var(--text-muted)',
      fontFamily: 'monospace',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <FileText style={{ width: '10px', height: '10px' }} />
          {contentLength} 字符
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <LayoutGrid style={{ width: '10px', height: '10px' }} />
          {lineCount} 行
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <div style={{ 
          width: '6px', 
          height: '6px', 
          borderRadius: '50%', 
          backgroundColor: autoSaveEnabled ? '#10b981' : 'var(--text-muted)',
          boxShadow: autoSaveEnabled ? '0 0 8px rgba(16, 185, 129, 0.5)' : 'none',
        }} />
        <span>{lastSaved ? `已保存 ${lastSaved.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}` : '准备就绪'}</span>
      </div>
    </div>
  );
}
