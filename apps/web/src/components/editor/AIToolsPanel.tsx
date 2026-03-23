import React, { useState } from 'react';
import { 
  Sparkles, 
  Loader2, 
  Wand2, 
  Zap, 
  FileCode, 
  MapPin, 
  FileEdit, 
  FileText,
  Eye,
  ChevronRight,
  LucideIcon,
} from 'lucide-react';
import { ModelSelector } from '../ui';

interface AITool {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
  handler: () => void;
  loading: boolean;
  disabled: boolean;
}

interface AIToolsPanelProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  showAIPanel: boolean;
  onTogglePanel: () => void;
  useAIParsing: boolean;
  onToggleAIParsing: (v: boolean) => void;
  editorMode: 'edit' | 'preview';
  onToggleEditorMode: () => void;
  tools: AITool[];
}

export function AIToolsPanel({
  selectedModel,
  onModelChange,
  showAIPanel,
  onTogglePanel,
  useAIParsing,
  onToggleAIParsing,
  editorMode,
  onToggleEditorMode,
  tools,
}: AIToolsPanelProps) {
  return (
    <div style={{ 
      position: 'fixed', 
      top: '80px',
      right: showAIPanel ? '16px' : '-260px',
      width: '240px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      zIndex: 50,
      transition: 'right 0.3s ease',
    }}>
      <TogglePanelButton showAIPanel={showAIPanel} onClick={onTogglePanel} />

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '20px',
        background: 'var(--bg-card)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        border: '1px solid var(--border-primary)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      }}>
        <PanelHeader />

        {tools.map((tool) => (
          <div key={tool.id}>
            <ToolButton tool={tool} />
            {tool.id === 'parse' && (
              <ParsingModeSelector 
                useAIParsing={useAIParsing} 
                onToggle={onToggleAIParsing} 
              />
            )}
          </div>
        ))}

        <Divider />

        <ModelSelectorSection 
          selectedModel={selectedModel} 
          onModelChange={onModelChange}
        />

        <>
          <Divider />
          <EditorModeButton 
            editorMode={editorMode} 
            onClick={onToggleEditorMode} 
          />
        </>
      </div>
    </div>
  );
}

function TogglePanelButton({ showAIPanel, onClick }: { showAIPanel: boolean; onClick: () => void }) {
  const [hover, setHover] = useState(false);

  return (
    <button
      onClick={onClick}
      style={{
        position: 'absolute',
        left: '-36px',
        top: '0',
        width: '32px',
        height: '32px',
        borderRadius: '10px 0 0 10px',
        border: '1px solid var(--border-primary)',
        borderRight: 'none',
        background: hover 
          ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' 
          : 'var(--bg-card)',
        backdropFilter: 'blur(20px)',
        color: hover ? '#fff' : 'var(--text-muted)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <ChevronRight style={{ 
        width: '16px', 
        height: '16px', 
        transform: showAIPanel ? 'rotate(180deg)' : 'rotate(0deg)', 
        transition: 'transform 0.3s ease' 
      }} />
    </button>
  );
}

function PanelHeader() {
  return (
    <div style={{ textAlign: 'center', marginBottom: '8px' }}>
      <div style={{ 
        width: '44px',
        height: '44px',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 12px',
        boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)',
      }}>
        <Sparkles style={{ width: '22px', height: '22px', color: 'white' }} />
      </div>
      <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>AI 助手</div>
      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>智能创作辅助工具</div>
    </div>
  );
}

function ToolButton({ tool }: { tool: AITool }) {
  const [hover, setHover] = useState(false);
  const toolColors: Record<string, string> = {
    '#007AFF': '#3b82f6',
    '#10b981': '#10b981',
    '#f59e0b': '#f59e0b',
    '#ec4899': '#ec4899',
    '#06b6d4': '#06b6d4',
    '#6366f1': '#6366f1',
    '#8b5cf6': '#8b5cf6',
  };
  const color = toolColors[tool.color] || tool.color;

  return (
    <button
      onClick={tool.handler}
      disabled={tool.disabled || tool.loading}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 14px',
        borderRadius: '12px',
        border: `1px solid ${tool.disabled ? 'var(--border-primary)' : `${color}30`}`,
        background: hover && !tool.disabled ? `${color}15` : `${color}08`,
        color: tool.disabled ? 'var(--text-muted)' : color,
        fontSize: '13px',
        fontWeight: '500',
        cursor: tool.disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        width: '100%',
        textAlign: 'left',
        opacity: tool.disabled ? 0.6 : 1,
        transform: hover && !tool.disabled ? 'translateX(4px)' : 'translateX(0)',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {tool.loading ? (
        <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
      ) : (
        <tool.icon style={{ width: '16px', height: '16px' }} />
      )}
      {tool.loading ? `${tool.label}中...` : tool.label}
    </button>
  );
}

function ParsingModeSelector({ useAIParsing, onToggle }: { useAIParsing: boolean; onToggle: (v: boolean) => void }) {
  return (
    <div style={{ 
      marginTop: '8px',
      padding: '10px', 
      borderRadius: '10px', 
      background: 'var(--bg-hover)' 
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '6px' 
      }}>
        <span style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: '500' }}>
          剧本解析模式
        </span>
        <span style={{ 
          fontSize: '10px', 
          color: useAIParsing ? '#10b981' : '#f59e0b',
          fontWeight: '600',
          padding: '2px 6px',
          borderRadius: '4px',
          background: useAIParsing ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)'
        }}>
          {useAIParsing ? 'AI智能' : '快速正则'}
        </span>
      </div>
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        background: 'var(--bg-input)', 
        borderRadius: '6px', 
        padding: '3px' 
      }}>
        <button
          onClick={() => onToggle(true)}
          style={{
            flex: 1,
            padding: '6px 8px',
            borderRadius: '5px',
            border: 'none',
            background: useAIParsing ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' : 'transparent',
            color: useAIParsing ? '#fff' : 'var(--text-muted)',
            fontSize: '11px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          AI智能解析
        </button>
        <button
          onClick={() => onToggle(false)}
          style={{
            flex: 1,
            padding: '6px 8px',
            borderRadius: '5px',
            border: 'none',
            background: !useAIParsing ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' : 'transparent',
            color: !useAIParsing ? '#fff' : 'var(--text-muted)',
            fontSize: '11px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          快速正则
        </button>
      </div>
      <div style={{ 
        fontSize: '10px', 
        color: 'var(--text-muted)', 
        marginTop: '6px',
        lineHeight: '1.4'
      }}>
        {useAIParsing 
          ? '使用AI深度理解上下文，适合复杂剧本'
          : '快速解析，适合标准格式剧本'}
      </div>
    </div>
  );
}

function Divider() {
  return <div style={{ height: '1px', background: 'var(--border-primary)', margin: '4px 0' }} />;
}

function ModelSelectorSection({ selectedModel, onModelChange,
}: {
  selectedModel: string;
  onModelChange: (v: string) => void;
}) {
  return (
    <div>
      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '500' }}>选择AI模型</div>
      <ModelSelector 
        content_type="script" 
        value={selectedModel} 
        on_change={onModelChange} 
        placeholder="选择模型" 
        show_last_used={true} 
        show_default={true} 
      />
    </div>
  );
}

function EditorModeButton({ editorMode, onClick }: { editorMode: 'edit' | 'preview'; onClick: () => void }) {
  const [hover, setHover] = useState(false);

  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 14px',
        borderRadius: '12px',
        border: '1px solid var(--border-primary)',
        background: hover ? 'var(--bg-input)' : 'var(--bg-hover)',
        color: 'var(--text-primary)',
        fontSize: '13px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        width: '100%',
        textAlign: 'left',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {editorMode === 'edit' ? <Eye style={{ width: '16px', height: '16px' }} /> : <FileEdit style={{ width: '16px', height: '16px' }} />}
      {editorMode === 'edit' ? '预览模式' : '编辑模式'}
    </button>
  );
}
