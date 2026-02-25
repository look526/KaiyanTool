import React, { useRef, useEffect } from 'react';

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: string;
  placeholder?: string;
  onSave?: () => void;
}

const TextEditor: React.FC<TextEditorProps> = ({
  value,
  onChange,
  height = '500px',
  placeholder = '请输入剧本内容...',
  onSave,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (onSave) {
          onSave();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSave]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: '100%',
        height,
        padding: '16px',
        fontSize: '14px',
        fontFamily: 'Menlo, Monaco, "Courier New", monospace',
        lineHeight: '1.6',
        border: 'none',
        outline: 'none',
        resize: 'none',
        backgroundColor: 'var(--bg-surface)',
        color: 'var(--text-primary)',
      }}
    />
  );
};

export default TextEditor;
