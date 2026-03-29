import { useState } from 'react';
import { Sparkles, Copy, RefreshCw } from 'lucide-react';
import { WorkspacePromptJson } from '../../types/workspace';

const accentColor = '#8b5cf6';

interface AIPromptEditorProps {
  sourceText: string;
  initialPrompt?: WorkspacePromptJson;
  isDark?: boolean;
  onPromptChange: (prompt: WorkspacePromptJson) => void;
  onAnalyze: () => void;
  onOptimize: () => void;
  isAnalyzing: boolean;
  isOptimizing: boolean;
}

export function AIPromptEditor({
  sourceText,
  initialPrompt,
  isDark = true,
  onPromptChange,
  onAnalyze,
  onOptimize,
  isAnalyzing,
  isOptimizing,
}: AIPromptEditorProps) {
  const [prompt, setPrompt] = useState<WorkspacePromptJson>(
    initialPrompt || {
      version: 1,
      scene: '',
      shot: '',
      subject: '',
      props: [],
      style: '',
    }
  );

  const colors = isDark ? {
    bgPrimary: 'rgba(5, 5, 10, 0.95)',
    bgSecondary: 'rgba(255, 255, 255, 0.03)',
    border: 'rgba(255, 255, 255, 0.06)',
    textPrimary: '#fafafa',
    textSecondary: 'rgba(250, 250, 250, 0.6)',
  } : {
    bgPrimary: 'rgba(255, 255, 255, 0.92)',
    bgSecondary: 'rgba(0, 0, 0, 0.02)',
    border: 'rgba(0, 0, 0, 0.06)',
    textPrimary: '#18181b',
    textSecondary: 'rgba(24, 24, 27, 0.6)',
  };

  const handleFieldChange = (field: keyof WorkspacePromptJson, value: unknown) => {
    const updated = { ...prompt, [field]: value };
    setPrompt(updated);
    onPromptChange(updated);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(prompt, null, 2));
  };

  return (
    <div style={{
      background: colors.bgSecondary,
      borderRadius: '16px',
      padding: '16px',
      border: `1px solid ${colors.border}`,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px',
      }}>
        <span style={{ fontSize: '14px', fontWeight: 600, color: colors.textPrimary }}>
          JSON Prompt
        </span>
        <button
          onClick={handleCopyJson}
          style={{
            padding: '6px 10px',
            borderRadius: '8px',
            border: `1px solid ${colors.border}`,
            background: colors.bgPrimary,
            color: colors.textSecondary,
            cursor: 'pointer',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <Copy size={14} /> 复制
        </button>
      </div>

      <div style={{ display: 'grid', gap: '12px' }}>
        <div>
          <label style={{ fontSize: '12px', color: colors.textSecondary, marginBottom: '4px', display: 'block' }}>
            场景
          </label>
          <input
            type="text"
            value={typeof prompt.scene === 'string' ? prompt.scene : ''}
            onChange={(e) => handleFieldChange('scene', e.target.value)}
            placeholder="描述场景..."
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '8px',
              border: `1px solid ${colors.border}`,
              background: colors.bgPrimary,
              color: colors.textPrimary,
              fontSize: '13px',
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: '12px', color: colors.textSecondary, marginBottom: '4px', display: 'block' }}>
            镜头
          </label>
          <input
            type="text"
            value={typeof prompt.shot === 'string' ? prompt.shot : ''}
            onChange={(e) => handleFieldChange('shot', e.target.value)}
            placeholder="中景/特写/远景等"
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '8px',
              border: `1px solid ${colors.border}`,
              background: colors.bgPrimary,
              color: colors.textPrimary,
              fontSize: '13px',
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: '12px', color: colors.textSecondary, marginBottom: '4px', display: 'block' }}>
            主体
          </label>
          <textarea
            value={typeof prompt.subject === 'string' ? prompt.subject : ''}
            onChange={(e) => handleFieldChange('subject', e.target.value)}
            placeholder="描述主体..."
            rows={2}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '8px',
              border: `1px solid ${colors.border}`,
              background: colors.bgPrimary,
              color: colors.textPrimary,
              fontSize: '13px',
              resize: 'none',
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: '12px', color: colors.textSecondary, marginBottom: '4px', display: 'block' }}>
            风格
          </label>
          <input
            type="text"
            value={typeof prompt.style === 'string' ? prompt.style : ''}
            onChange={(e) => handleFieldChange('style', e.target.value)}
            placeholder="皮克斯风格/写实风格等"
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '8px',
              border: `1px solid ${colors.border}`,
              background: colors.bgPrimary,
              color: colors.textPrimary,
              fontSize: '13px',
            }}
          />
        </div>
      </div>

      <div style={{
        display: 'flex',
        gap: '8px',
        marginTop: '16px',
        paddingTop: '16px',
        borderTop: `1px solid ${colors.border}`,
      }}>
        <button
          onClick={onAnalyze}
          disabled={isAnalyzing || !sourceText}
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: '10px',
            border: 'none',
            background: isAnalyzing ? `${accentColor}50` : accentColor,
            color: 'white',
            cursor: isAnalyzing || !sourceText ? 'not-allowed' : 'pointer',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <Sparkles size={16} />
          {isAnalyzing ? '分析中...' : 'AI 分析'}
        </button>

        <button
          onClick={onOptimize}
          disabled={isOptimizing}
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: '10px',
            border: `1px solid ${colors.border}`,
            background: colors.bgPrimary,
            color: colors.textPrimary,
            cursor: isOptimizing ? 'not-allowed' : 'pointer',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <RefreshCw size={16} />
          {isOptimizing ? '优化中...' : '一键优化'}
        </button>
      </div>
    </div>
  );
}
