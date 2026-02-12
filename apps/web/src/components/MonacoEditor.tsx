import React, { useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useTheme } from '../contexts/ThemeContext';

interface MonacoEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  language?: string;
  theme?: string;
  height?: string | number;
  options?: any;
  onSave?: () => void;
}

const MonacoEditor: React.FC<MonacoEditorProps> = ({
  value,
  onChange,
  language = 'plaintext',
  theme: customTheme,
  height = '500px',
  options = {},
  onSave,
}) => {
  const editorRef = useRef<any>(null);
  const { theme } = useTheme();

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      if (onSave) {
        onSave();
      }
    });

    editor.focus();
  };

  const editorTheme = customTheme || (theme === 'dark' ? 'vs-dark' : 'vs');

  const defaultOptions = {
    minimap: { enabled: false },
    fontSize: 14,
    lineNumbers: 'on' as const,
    scrollBeyondLastLine: false,
    wordWrap: 'on' as const,
    automaticLayout: true,
    tabSize: 2,
    formatOnPaste: true,
    formatOnType: true,
    ...options,
  };

  return (
    <Editor
      height={height}
      language={language}
      theme={editorTheme}
      value={value}
      onChange={onChange}
      onMount={handleEditorDidMount}
      options={defaultOptions}
    />
  );
};

export default MonacoEditor;
