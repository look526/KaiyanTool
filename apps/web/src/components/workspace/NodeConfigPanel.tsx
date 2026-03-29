import { useState, useEffect } from 'react';
import { X, Star, Clock, Image, Video, Type, Sparkles } from 'lucide-react';
import { AIPromptEditor } from './AIPromptEditor';
import { WorkspacePromptJson, AIProvider } from '../../types/workspace';
import { getModelCapabilities, isVideoModel, isVEO3Model, getModelDefaultParams } from '../../types/ai';
import { ModelParameters } from '../ai/ModelParameters';

interface CanvasNode {
  id: string;
  type: 'text' | 'image' | 'video';
  position_x: number;
  position_y: number;
  content: { text?: string; url?: string };
  output_url?: string;
  is_starred?: boolean;
  labels?: string[];
  history?: any[];
  config?: Record<string, any>;
}

interface NodeConfigPanelProps {
  node: CanvasNode | null;
  onClose: () => void;
  onUpdate: (nodeId: string, data: Partial<CanvasNode>) => void;
  onStar: (nodeId: string, isStarred: boolean) => void;
  onGenerate: (
    nodeId: string,
    type: string,
    promptJson?: WorkspacePromptJson,
    providerId?: string,
    modelId?: string,
    modelParams?: Record<string, any>
  ) => void;
  onRevertToVersion: (nodeId: string, version: any) => void;
  isDark?: boolean;
  colors: Record<string, string>;
}

const LABEL_COLORS = [
  { name: 'red', color: '#ef4444' },
  { name: 'yellow', color: '#f59e0b' },
  { name: 'green', color: '#10b981' },
  { name: 'blue', color: '#3b82f6' },
  { name: 'purple', color: '#8b5cf6' },
];

const STYLE_PRESETS = [
  { id: 'pixar', name: '皮克斯风格', desc: '3D卡通，色彩鲜艳' },
  { id: 'anime', name: '动漫风格', desc: '日漫风格，线条清晰' },
  { id: 'real', name: '写实风格', desc: '逼真还原，细节丰富' },
  { id: 'oil', name: '油画风格', desc: '艺术感强，笔触明显' },
  { id: 'watercolor', name: '水彩风格', desc: '柔和通透，色彩淡雅' },
];

export default function NodeConfigPanel({
  node,
  onClose,
  onUpdate,
  onStar,
  onGenerate,
  onRevertToVersion,
  isDark = true,
  colors,
}: NodeConfigPanelProps) {
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<string>('pixar');
  const [promptJson, setPromptJson] = useState<WorkspacePromptJson | undefined>();
  const [showAIPromptEditor, setShowAIPromptEditor] = useState(false);
  const [modelParams, setModelParams] = useState<Record<string, any>>({});

  const accentColor = '#8b5cf6';

  useEffect(() => {
    fetchProviders();
  }, []);

  useEffect(() => {
    if (node?.content?.text && node.type === 'text') {
      setPromptJson({
        version: 1,
        scene: node.content.text,
        shot: '中景',
        subject: '',
        props: [],
        style: selectedStyle,
      });
    }
  }, [node?.content?.text, selectedStyle]);

  const fetchProviders = async () => {
    try {
      const res = await fetch('/api/workspace/ai/providers', { credentials: 'include' });
      const data = await res.json();
      if (data.success && data.data?.length > 0) {
        setProviders(data.data);
        setSelectedProvider(data.data[0].id);
        if (data.data[0].models?.length > 0) {
          setSelectedModel(data.data[0].models[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch providers:', error);
    }
  };

  const handleGenerateWithAI = () => {
    if (!node) return;
    onGenerate(node.id, 'image', promptJson, selectedProvider, selectedModel, modelParams);
  };

  if (!node) return null;

  return (
    <div style={{
      position: 'fixed',
      right: 0,
      top: '64px',
      bottom: 0,
      width: '340px',
      background: colors.bgPrimary,
      backdropFilter: 'blur(20px)',
      borderLeft: `1px solid ${colors.border}`,
      display: 'flex',
      flexDirection: 'column',
      zIndex: 20,
    }}>
      <div style={{
        padding: '16px 20px',
        borderBottom: `1px solid ${colors.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {node.type === 'text' && <Type size={18} color={accentColor} />}
          {node.type === 'image' && <Image size={18} color="#10b981" />}
          {node.type === 'video' && <Video size={18} color="#f59e0b" />}
          <span style={{ fontSize: '16px', fontWeight: 600, color: colors.textPrimary }}>
            {node.type === 'text' ? '文字节点' : node.type === 'image' ? '图片节点' : '视频节点'}
          </span>
        </div>
        <button onClick={onClose} style={{
          width: '32px', height: '32px', borderRadius: '8px', border: 'none',
          background: 'transparent', cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center', color: colors.textMuted,
        }}>
          <X size={18} />
        </button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px' }}>
        {node.type === 'text' && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: colors.textSecondary, marginBottom: '8px' }}>
              文字内容
            </label>
            <textarea
              value={node.content?.text || ''}
              onChange={(e) => onUpdate(node.id, { content: { text: e.target.value } })}
              style={{
                width: '100%', minHeight: '100px', padding: '12px', borderRadius: '12px',
                border: `1px solid ${colors.border}`, background: colors.bgSecondary,
                color: colors.textPrimary, fontSize: '14px', resize: 'vertical', fontFamily: 'inherit',
              }}
              placeholder="输入文字内容..."
            />
          </div>
        )}

        {node.type === 'text' && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 500, color: colors.textSecondary }}>
                AI 生成配置
              </label>
              <button
                onClick={() => setShowAIPromptEditor(!showAIPromptEditor)}
                style={{
                  padding: '4px 8px', borderRadius: '6px', border: 'none',
                  background: showAIPromptEditor ? `${accentColor}20` : 'transparent',
                  color: accentColor, cursor: 'pointer', fontSize: '12px',
                  display: 'flex', alignItems: 'center', gap: '4px',
                }}
              >
                <Sparkles size={14} /> {showAIPromptEditor ? '收起' : '编辑 Prompt'}
              </button>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '4px', display: 'block' }}>
                Provider
              </label>
              <select
                value={selectedProvider}
                onChange={(e) => {
                  setSelectedProvider(e.target.value);
                  const provider = providers.find(p => p.id === e.target.value);
                  if (provider?.models?.length) {
                    setSelectedModel(provider.models[0].id);
                    setModelParams(getModelDefaultParams(provider.models[0].id));
                  }
                }}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: '10px',
                  border: `1px solid ${colors.border}`, background: colors.bgSecondary,
                  color: colors.textPrimary, fontSize: '13px',
                }}
              >
                {providers.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.type})</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '4px', display: 'block' }}>
                模型
              </label>
              <select
                value={selectedModel}
                onChange={(e) => {
                  setSelectedModel(e.target.value);
                  setModelParams(getModelDefaultParams(e.target.value));
                }}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: '10px',
                  border: `1px solid ${colors.border}`, background: colors.bgSecondary,
                  color: colors.textPrimary, fontSize: '13px',
                }}
              >
                {(providers.find(p => p.id === selectedProvider)?.models || []).map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.type})</option>
                ))}
              </select>
            </div>

            {isVideoModel(selectedModel) && (
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '8px', display: 'block' }}>
                  模型参数
                </label>
                <ModelParameters
                  capabilities={getModelCapabilities(selectedModel)}
                  showVEO3Params={isVEO3Model(selectedModel)}
                  value={modelParams}
                  onChange={setModelParams}
                />
              </div>
            )}

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '4px', display: 'block' }}>
                风格
              </label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {STYLE_PRESETS.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedStyle(s.id)}
                    style={{
                      padding: '6px 10px', borderRadius: '8px',
                      border: selectedStyle === s.id ? `1px solid ${accentColor}` : `1px solid ${colors.border}`,
                      background: selectedStyle === s.id ? `${accentColor}20` : 'transparent',
                      color: selectedStyle === s.id ? accentColor : colors.textSecondary,
                      cursor: 'pointer', fontSize: '12px',
                    }}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            {showAIPromptEditor && (
              <AIPromptEditor
                sourceText={node.content?.text || ''}
                initialPrompt={promptJson}
               
                onPromptChange={setPromptJson}
                onAnalyze={() => {}}
                onOptimize={() => {}}
                isAnalyzing={false}
                isOptimizing={false}
              />
            )}
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: colors.textSecondary, marginBottom: '8px' }}>
            标签
          </label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {LABEL_COLORS.map(({ name, color }) => {
              const isSelected = node.labels?.includes(name);
              return (
                <button
                  key={name}
                  onClick={() => {
                    const newLabels = isSelected
                      ? (node.labels || []).filter((l: string) => l !== name)
                      : [...(node.labels || []), name];
                    onUpdate(node.id, { labels: newLabels });
                  }}
                  style={{
                    width: '28px', height: '28px', borderRadius: '6px',
                    border: isSelected ? `2px solid ${color}` : `1px solid ${colors.border}`,
                    background: isSelected ? `${color}20` : 'transparent', cursor: 'pointer',
                  }}
                >
                  <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: color, margin: 'auto' }} />
                </button>
              );
            })}
          </div>
        </div>

        {node.history && node.history.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500, color: colors.textSecondary, marginBottom: '8px' }}>
              <Clock size={14} /> 历史版本 ({node.history.length})
            </label>
            <div style={{ maxHeight: '200px', overflow: 'auto', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
              {(node.history ?? []).map((version: any, index: number) => (
                <div
                  key={index}
                  onClick={() => onRevertToVersion(node.id, version)}
                  style={{
                    padding: '10px 12px', borderBottom: index < (node.history?.length ?? 0) - 1 ? `1px solid ${colors.border}` : 'none',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
                  }}
                >
                  {version.output_url && (
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: colors.bgSecondary, overflow: 'hidden' }}>
                      <img src={version.output_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', color: colors.textMuted }}>
                      {new Date(version.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: '16px 20px', borderTop: `1px solid ${colors.border}`, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button
          onClick={() => onStar(node.id, !node.is_starred)}
          style={{
            width: '100%', padding: '10px 16px', borderRadius: '12px',
            border: `1px solid ${colors.border}`,
            background: node.is_starred ? `${accentColor}20` : 'transparent',
            color: node.is_starred ? accentColor : colors.textPrimary,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '8px', fontSize: '14px', fontWeight: 500,
          }}
        >
          <Star size={16} fill={node.is_starred ? accentColor : 'none'} />
          {node.is_starred ? '已收藏' : '收藏'}
        </button>

        {node.type === 'text' && (
          <button
            onClick={handleGenerateWithAI}
            style={{
              width: '100%', padding: '12px 16px', borderRadius: '12px', border: 'none',
              background: `linear-gradient(135deg, ${accentColor} 0%, #a78bfa 100%)`,
              color: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
          >
            <Sparkles size={16} /> AI 生成图片
          </button>
        )}

        {node.type === 'image' && (
          <>
            <button
              onClick={() => onGenerate(node.id, 'image')}
              style={{
                width: '100%', padding: '12px 16px', borderRadius: '12px', border: 'none',
                background: `linear-gradient(135deg, #10b981 0%, #34d399 100%)`,
                color: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: 600,
              }}
            >
              图生图
            </button>
            <button
              onClick={() => onGenerate(node.id, 'video')}
              style={{
                width: '100%', padding: '12px 16px', borderRadius: '12px', border: 'none',
                background: `linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)`,
                color: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: 600,
              }}
            >
              生成视频
            </button>
          </>
        )}

        {node.type === 'video' && (
          <button
            onClick={() => onGenerate(node.id, 'video')}
            style={{
              width: '100%', padding: '12px 16px', borderRadius: '12px', border: 'none',
              background: `linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)`,
              color: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: 600,
            }}
          >
            视频生视频
          </button>
        )}
      </div>
    </div>
  );
}
