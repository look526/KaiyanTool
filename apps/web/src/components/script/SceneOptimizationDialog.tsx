import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  X,
  Sparkles,
  Zap,
  Users,
  MessageSquare,
  FileText,
  ChevronRight,
  Check,
  Copy,
  RotateCcw,
  Bookmark,
  Star,
  AlertCircle,
  Loader2,
  Settings2,
  Wand2,
  Layers,
  ArrowRight,
  Target,
  Palette,
  Gauge,
  Lightbulb,
} from 'lucide-react';
import { ParsedScene } from '../../utils/SceneParser';
import { Button } from '../ui/button';
import styles from './SceneOptimizationDialog.module.css';

export type OptimizationDirection = 
  | 'plot_pacing'
  | 'character_development'
  | 'dialogue_quality'
  | 'scene_description'
  | 'conflict_design'
  | 'emotional_depth'
  | 'visual_imagery';

export type OptimizationIntensity = 'light' | 'medium' | 'deep';

export interface OptimizationResult {
  sceneId: string;
  originalContent: string;
  optimizedContent: string;
  suggestions: string[];
  changes: {
    type: string;
    description: string;
    before?: string;
    after?: string;
  }[];
  score: number;
}

export interface OptimizationTemplate {
  id: string;
  name: string;
  direction: OptimizationDirection;
  customPrompt: string;
  intensity: OptimizationIntensity;
  createdAt: string;
}

interface SceneOptimizationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  scenes: ParsedScene[];
  selectedSceneIds: string[];
  onSceneSelect: (sceneIds: string[]) => void;
  onOptimize: (params: {
    sceneIds: string[];
    direction: OptimizationDirection;
    customPrompt: string;
    intensity: OptimizationIntensity;
    stylePreference?: string;
  }) => Promise<OptimizationResult[]>;
  onApplyOptimization: (results: OptimizationResult[]) => void;
  templates: OptimizationTemplate[];
  onSaveTemplate: (template: Omit<OptimizationTemplate, 'id' | 'createdAt'>) => void;
}

const OPTIMIZATION_DIRECTIONS: Record<OptimizationDirection, { label: string; icon: React.ElementType; description: string; gradient: string; bgGradient: string }> = {
  plot_pacing: {
    label: '剧情节奏',
    icon: Zap,
    description: '优化场景节奏，增强紧张感',
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    bgGradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.08) 100%)',
  },
  character_development: {
    label: '角色塑造',
    icon: Users,
    description: '深化角色性格，增强立体感',
    gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
    bgGradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(124, 58, 237, 0.08) 100%)',
  },
  dialogue_quality: {
    label: '对话质量',
    icon: MessageSquare,
    description: '提升对话自然度和表现力',
    gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    bgGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.08) 100%)',
  },
  scene_description: {
    label: '场景描述',
    icon: FileText,
    description: '丰富场景细节，增强画面感',
    gradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
    bgGradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.08) 100%)',
  },
  conflict_design: {
    label: '冲突设计',
    icon: Sparkles,
    description: '强化戏剧冲突，提升张力',
    gradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
    bgGradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.08) 100%)',
  },
  emotional_depth: {
    label: '情感深度',
    icon: Star,
    description: '增强情感表达，触动观众',
    gradient: 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)',
    bgGradient: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(219, 39, 119, 0.08) 100%)',
  },
  visual_imagery: {
    label: '视觉意象',
    icon: Wand2,
    description: '增强视觉表现力和画面感',
    gradient: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
    bgGradient: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(8, 145, 178, 0.08) 100%)',
  },
};

const STYLE_PREFERENCES = [
  { id: 'cinematic', label: '电影风格', icon: Layers, description: '注重视觉冲击' },
  { id: 'literary', label: '文学风格', icon: FileText, description: '注重文字美感' },
  { id: 'commercial', label: '商业风格', icon: Target, description: '注重观众体验' },
  { id: 'artistic', label: '艺术风格', icon: Palette, description: '注重创新表达' },
];

const INTENSITY_CONFIG: Record<OptimizationIntensity, { label: string; description: string; icon: React.ElementType }> = {
  light: { label: '轻度', description: '微调细节', icon: Lightbulb },
  medium: { label: '中度', description: '适度改写', icon: Gauge },
  deep: { label: '深度', description: '重构内容', icon: Target },
};

const STEPS = [
  { id: 'select', label: '选择场景', icon: Layers },
  { id: 'configure', label: '配置选项', icon: Settings2 },
  { id: 'result', label: '查看结果', icon: Sparkles },
];

export function SceneOptimizationDialog({
  isOpen,
  onClose,
  scenes,
  selectedSceneIds,
  onSceneSelect,
  onOptimize,
  onApplyOptimization,
  templates,
  onSaveTemplate,
}: SceneOptimizationDialogProps) {
  const [step, setStep] = useState<'select' | 'configure' | 'processing' | 'result'>('select');
  const [direction, setDirection] = useState<OptimizationDirection>('plot_pacing');
  const [customPrompt, setCustomPrompt] = useState('');
  const [intensity, setIntensity] = useState<OptimizationIntensity>('medium');
  const [stylePreference, setStylePreference] = useState<string>('cinematic');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [results, setResults] = useState<OptimizationResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showTemplateMenu, setShowTemplateMenu] = useState(false);
  const [activeResultIndex, setActiveResultIndex] = useState(0);
  const [hoveredScene, setHoveredScene] = useState<string | null>(null);

  const selectedScenes = useMemo(() => {
    return scenes.filter(s => selectedSceneIds.includes(s.id));
  }, [scenes, selectedSceneIds]);

  const totalWordCount = useMemo(() => {
    return selectedScenes.reduce((sum, s) => sum + s.wordCount, 0);
  }, [selectedScenes]);

  const currentStepIndex = STEPS.findIndex(s => s.id === (step === 'processing' ? 'configure' : step));

  const handleSceneToggle = useCallback((sceneId: string) => {
    if (selectedSceneIds.includes(sceneId)) {
      onSceneSelect(selectedSceneIds.filter(id => id !== sceneId));
    } else {
      if (selectedSceneIds.length < 5) {
        onSceneSelect([...selectedSceneIds, sceneId]);
      }
    }
  }, [selectedSceneIds, onSceneSelect]);

  const handleSelectAll = useCallback(() => {
    const allIds = scenes.slice(0, 5).map(s => s.id);
    onSceneSelect(allIds);
  }, [scenes, onSceneSelect]);

  const handleClearSelection = useCallback(() => {
    onSceneSelect([]);
  }, [onSceneSelect]);

  const handleStartOptimize = async () => {
    if (selectedSceneIds.length === 0) return;
    
    setStep('processing');
    setError(null);
    
    try {
      const optimizationResults = await onOptimize({
        sceneIds: selectedSceneIds,
        direction,
        customPrompt,
        intensity,
        stylePreference,
      });
      setResults(optimizationResults);
      setStep('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : '优化失败，请重试');
      setStep('configure');
    }
  };

  const handleApplyAll = useCallback(() => {
    onApplyOptimization(results);
    onClose();
  }, [results, onApplyOptimization, onClose]);

  const handleSaveAsTemplate = useCallback(() => {
    onSaveTemplate({
      name: `模板 ${templates.length + 1}`,
      direction,
      customPrompt,
      intensity,
    });
    setShowTemplateMenu(false);
  }, [direction, customPrompt, intensity, templates.length, onSaveTemplate]);

  const handleApplyTemplate = useCallback((template: OptimizationTemplate) => {
    setDirection(template.direction);
    setCustomPrompt(template.customPrompt);
    setIntensity(template.intensity);
    setShowTemplateMenu(false);
  }, []);

  const handleCopyResult = useCallback((result: OptimizationResult) => {
    navigator.clipboard.writeText(result.optimizedContent);
  }, []);

  const handleRetry = useCallback(() => {
    setStep('configure');
    setResults([]);
    setError(null);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setStep('select');
      setError(null);
      setResults([]);
      setActiveResultIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'O' && isOpen) {
        e.preventDefault();
        if (step === 'select' && selectedSceneIds.length > 0) {
          setStep('configure');
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, step, selectedSceneIds, onClose]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.7)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '24px',
      animation: 'fadeIn 0.2s ease-out',
    }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .scene-card:hover { transform: translateY(-2px); }
        .direction-card:hover { transform: translateY(-2px); }
      `}</style>
      
      <div style={{
        width: '100%',
        maxWidth: '1200px',
        maxHeight: '90vh',
        backgroundColor: 'var(--bg-elevated)',
        borderRadius: '24px',
        boxShadow: '0 32px 64px -16px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'slideUp 0.3s ease-out',
      }}>
        <div style={{
          padding: '28px 32px',
          borderBottom: '1px solid var(--border-primary)',
          background: 'linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-elevated) 100%)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 50%, #8B5CF6 100%)',
                backgroundSize: '200% 200%',
                animation: 'shimmer 3s ease infinite',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(139, 92, 246, 0.4)',
              }}>
                <Sparkles style={{ width: '28px', height: '28px', color: 'white' }} />
              </div>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.5px' }}>
                  场景优化
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '4px 0 0', fontWeight: '500' }}>
                  AI 智能优化您的剧本场景
                </p>
              </div>
            </div>
            <Button variant="ghost" size="default" onClick={onClose} icon={<X style={{ width: '18px', height: '18px' }} />} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {STEPS.map((s, index) => {
              const Icon = s.icon;
              const isActive = index === currentStepIndex;
              const isCompleted = index < currentStepIndex;
              
              return (
                <React.Fragment key={s.id}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 18px',
                    borderRadius: '12px',
                    backgroundColor: isActive ? 'var(--accent-bg)' : isCompleted ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-surface)',
                    border: `2px solid ${isActive ? 'var(--accent)' : isCompleted ? '#10B981' : 'var(--border-primary)'}`,
                    transition: 'all 0.3s ease',
                  }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      background: isActive ? 'var(--accent)' : isCompleted ? '#10B981' : 'var(--bg-hover)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {isCompleted ? (
                        <Check style={{ width: '16px', height: '16px', color: 'white' }} />
                      ) : (
                        <Icon style={{ width: '16px', height: '16px', color: isActive ? 'white' : 'var(--text-secondary)' }} />
                      )}
                    </div>
                    <span style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      color: isActive ? 'var(--accent-text)' : isCompleted ? '#10B981' : 'var(--text-secondary)',
                    }}>
                      {s.label}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <ChevronRight style={{ width: '16px', height: '16px', color: 'var(--text-muted)' }} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <div style={{
            width: '320px',
            borderRight: '1px solid var(--border-primary)',
            backgroundColor: 'var(--bg-surface)',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--border-primary)',
              background: 'linear-gradient(180deg, var(--bg-elevated) 0%, var(--bg-surface) 100%)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Layers style={{ width: '18px', height: '18px', color: 'var(--accent)' }} />
                  <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
                    场景列表
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <Button variant="ghost" size="sm" onClick={handleSelectAll}>全选</Button>
                  <Button variant="ghost" size="sm" onClick={handleClearSelection}>清空</Button>
                </div>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                backgroundColor: 'var(--bg-elevated)',
                borderRadius: '10px',
                border: '1px solid var(--border-primary)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: selectedSceneIds.length > 0 ? '#10B981' : 'var(--text-muted)',
                  }} />
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>已选择</span>
                </div>
                <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
                  {selectedSceneIds.length}/5
                </span>
              </div>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
              {scenes.map((scene) => {
                const isSelected = selectedSceneIds.includes(scene.id);
                const isDisabled = !isSelected && selectedSceneIds.length >= 5;
                const isHovered = hoveredScene === scene.id;
                
                return (
                  <div
                    key={scene.id}
                    onClick={() => !isDisabled && handleSceneToggle(scene.id)}
                    onMouseEnter={() => setHoveredScene(scene.id)}
                    onMouseLeave={() => setHoveredScene(null)}
                    className="scene-card"
                    style={{
                      padding: '16px 18px',
                      marginBottom: '10px',
                      backgroundColor: isSelected ? 'var(--accent-bg)' : 'var(--bg-elevated)',
                      border: `2px solid ${isSelected ? 'var(--accent)' : isHovered ? 'var(--border-hover)' : 'var(--border-primary)'}`,
                      borderRadius: '14px',
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      opacity: isDisabled ? 0.5 : 1,
                      transition: 'all 0.2s ease',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {isSelected && (
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'var(--accent)' }} />
                    )}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '8px',
                        background: isSelected ? 'var(--accent)' : 'var(--bg-hover)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        {isSelected ? (
                          <Check style={{ width: '16px', height: '16px', color: 'white' }} />
                        ) : (
                          <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>{scene.index}</span>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                          {scene.title}
                        </span>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {scene.description || '无描述'}
                        </p>
                        <div style={{ display: 'flex', gap: '16px' }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FileText style={{ width: '12px', height: '12px' }} />
                            {scene.wordCount} 字
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MessageSquare style={{ width: '12px', height: '12px' }} />
                            {scene.dialogueCount} 对话
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{
              padding: '16px 20px',
              borderTop: '1px solid var(--border-primary)',
              background: 'linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-elevated) 100%)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: 'var(--bg-hover)', borderRadius: '12px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>总字数</span>
                <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)' }}>{totalWordCount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {step === 'select' && (
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '48px',
                textAlign: 'center',
                background: 'linear-gradient(180deg, var(--bg-elevated) 0%, var(--bg-surface) 100%)',
              }}>
                <div style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '28px',
                  background: 'linear-gradient(135deg, var(--accent-bg) 0%, rgba(139, 92, 246, 0.1) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '28px',
                  border: '2px solid var(--accent-border)',
                }}>
                  <Layers style={{ width: '48px', height: '48px', color: 'var(--accent)' }} />
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)', margin: '0 0 12px', letterSpacing: '-0.3px' }}>
                  选择要优化的场景
                </h3>
                <p style={{ fontSize: '15px', color: 'var(--text-secondary)', margin: '0 0 36px', maxWidth: '420px', lineHeight: '1.6' }}>
                  从左侧列表中选择最多 5 个场景进行优化<br />支持批量处理，提升创作效率
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  disabled={selectedSceneIds.length === 0}
                  onClick={() => setStep('configure')}
                  icon={<ArrowRight style={{ width: '18px', height: '18px' }} />}
                  iconPosition="right"
                >
                  下一步：配置优化选项
                </Button>
              </div>
            )}

            {step === 'configure' && (
              <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
                <div style={{ marginBottom: '32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Target style={{ width: '20px', height: '20px', color: 'var(--accent)' }} />
                      <h3 style={{ fontSize: '17px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>优化方向</h3>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <Button variant="secondary" size="sm" onClick={() => setShowTemplateMenu(!showTemplateMenu)} icon={<Bookmark style={{ width: '14px', height: '14px' }} />}>
                        模板
                      </Button>
                      {showTemplateMenu && templates.length > 0 && (
                        <div style={{
                          position: 'absolute',
                          top: '100%',
                          right: 0,
                          marginTop: '8px',
                          backgroundColor: 'var(--bg-elevated)',
                          border: '1px solid var(--border-primary)',
                          borderRadius: '14px',
                          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.2)',
                          minWidth: '220px',
                          zIndex: 10,
                          overflow: 'hidden',
                        }}>
                          {templates.map((template) => (
                            <button
                              key={template.id}
                              onClick={() => handleApplyTemplate(template)}
                              style={{
                                width: '100%',
                                padding: '14px 18px',
                                border: 'none',
                                backgroundColor: 'transparent',
                                textAlign: 'left',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500',
                                color: 'var(--text-primary)',
                                transition: 'background 0.15s ease',
                              }}
                            >
                              {template.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                    {Object.entries(OPTIMIZATION_DIRECTIONS).map(([key, config]) => {
                      const Icon = config.icon;
                      const isActive = direction === key;
                      return (
                        <button
                          key={key}
                          onClick={() => setDirection(key as OptimizationDirection)}
                          className="direction-card"
                          style={{
                            padding: '18px 20px',
                            background: isActive ? config.bgGradient : 'var(--bg-surface)',
                            border: `2px solid ${isActive ? config.gradient.split(' ')[0] : 'var(--border-primary)'}`,
                            borderRadius: '16px',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.2s ease',
                            position: 'relative',
                            overflow: 'hidden',
                          }}
                        >
                          {isActive && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: config.gradient }} />}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <div style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '10px',
                              background: isActive ? config.gradient : 'var(--bg-hover)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                              <Icon style={{ width: '18px', height: '18px', color: isActive ? 'white' : 'var(--text-secondary)' }} />
                            </div>
                            <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>{config.label}</span>
                          </div>
                          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 0 48px' }}>{config.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ marginBottom: '28px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <Lightbulb style={{ width: '20px', height: '20px', color: 'var(--accent)' }} />
                    <h3 style={{ fontSize: '17px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>自定义需求</h3>
                  </div>
                  <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="描述您希望如何优化这些场景，例如：增强角色之间的情感张力，让对话更加生动自然..."
                    style={{
                      width: '100%',
                      minHeight: '140px',
                      padding: '18px 20px',
                      backgroundColor: 'var(--bg-surface)',
                      border: '2px solid var(--border-primary)',
                      borderRadius: '16px',
                      fontSize: '14px',
                      lineHeight: '1.7',
                      color: 'var(--text-primary)',
                      resize: 'vertical',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      fontFamily: 'inherit',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--accent)';
                      e.currentTarget.style.boxShadow = '0 0 0 4px rgba(139, 92, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-primary)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>提示：越详细的需求描述，AI 优化效果越好</span>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: customPrompt.length > 500 ? '#EF4444' : 'var(--text-muted)' }}>
                      {customPrompt.length}/500
                    </span>
                  </div>
                </div>

                <Button variant="ghost" size="default" onClick={() => setShowAdvanced(!showAdvanced)} icon={<Settings2 style={{ width: '16px', height: '16px' }} />} iconPosition="left" style={{ marginBottom: showAdvanced ? '20px' : 0 }}>
                  高级选项
                  <ChevronRight style={{ width: '16px', height: '16px', transform: showAdvanced ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', marginLeft: '8px' }} />
                </Button>

                {showAdvanced && (
                  <div style={{ padding: '24px', backgroundColor: 'var(--bg-surface)', borderRadius: '18px', border: '1px solid var(--border-primary)', marginBottom: '24px' }}>
                    <div style={{ marginBottom: '24px' }}>
                      <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 16px' }}>优化强度</h4>
                      <div style={{ display: 'flex', gap: '14px' }}>
                        {Object.entries(INTENSITY_CONFIG).map(([key, config]) => {
                          const Icon = config.icon;
                          const isActive = intensity === key;
                          return (
                            <button
                              key={key}
                              onClick={() => setIntensity(key as OptimizationIntensity)}
                              style={{
                                flex: 1,
                                padding: '16px',
                                backgroundColor: isActive ? 'var(--accent-bg)' : 'var(--bg-elevated)',
                                border: `2px solid ${isActive ? 'var(--accent)' : 'var(--border-primary)'}`,
                                borderRadius: '14px',
                                cursor: 'pointer',
                                textAlign: 'center',
                                transition: 'all 0.2s ease',
                              }}
                            >
                              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: isActive ? 'var(--accent)' : 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                                <Icon style={{ width: '20px', height: '20px', color: isActive ? 'white' : 'var(--text-secondary)' }} />
                              </div>
                              <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>{config.label}</div>
                              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{config.description}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 16px' }}>风格偏好</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                        {STYLE_PREFERENCES.map((style) => {
                          const Icon = style.icon;
                          const isActive = stylePreference === style.id;
                          return (
                            <button
                              key={style.id}
                              onClick={() => setStylePreference(style.id)}
                              style={{
                                padding: '14px 16px',
                                backgroundColor: isActive ? 'var(--accent-bg)' : 'var(--bg-elevated)',
                                border: `2px solid ${isActive ? 'var(--accent)' : 'var(--border-primary)'}`,
                                borderRadius: '12px',
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                              }}
                            >
                              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: isActive ? 'var(--accent)' : 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Icon style={{ width: '16px', height: '16px', color: isActive ? 'white' : 'var(--text-secondary)' }} />
                              </div>
                              <div>
                                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{style.label}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{style.description}</div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div style={{ padding: '16px 20px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <AlertCircle style={{ width: '20px', height: '20px', color: '#EF4444' }} />
                    <span style={{ fontSize: '14px', color: '#EF4444', fontWeight: '500' }}>{error}</span>
                  </div>
                )}
              </div>
            )}

            {step === 'processing' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px', background: 'linear-gradient(180deg, var(--bg-elevated) 0%, var(--bg-surface) 100%)' }}>
                <div style={{ width: '100px', height: '100px', borderRadius: '28px', background: 'linear-gradient(135deg, var(--accent-bg) 0%, rgba(139, 92, 246, 0.1) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '28px', border: '2px solid var(--accent-border)' }}>
                  <Loader2 style={{ width: '48px', height: '48px', color: 'var(--accent)', animation: 'spin 1s linear infinite' }} />
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)', margin: '0 0 12px' }}>AI 正在优化您的场景...</h3>
                <p style={{ fontSize: '15px', color: 'var(--text-secondary)', margin: 0 }}>正在处理 {selectedScenes.length} 个场景，请稍候</p>
              </div>
            )}

            {step === 'result' && results.length > 0 && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '16px 28px', borderBottom: '1px solid var(--border-primary)', display: 'flex', alignItems: 'center', gap: '10px', overflowX: 'auto', background: 'var(--bg-surface)' }}>
                  {results.map((result, index) => (
                    <Button
                      key={result.sceneId}
                      variant={activeResultIndex === index ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => setActiveResultIndex(index)}
                    >
                      场景 {index + 1}
                    </Button>
                  ))}
                </div>

                <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                  <div style={{ flex: 1, borderRight: '1px solid var(--border-primary)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-primary)', backgroundColor: 'var(--bg-surface)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--text-muted)' }} />
                      <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>原始内容</h4>
                    </div>
                    <div style={{ flex: 1, padding: '24px', overflowY: 'auto', fontSize: '14px', lineHeight: '1.9', color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                      {results[activeResultIndex]?.originalContent}
                    </div>
                  </div>

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-primary)', backgroundColor: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                        <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>AI 优化建议</h4>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ padding: '6px 14px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10B981', borderRadius: '8px', fontSize: '13px', fontWeight: '700' }}>
                          评分: {results[activeResultIndex]?.score}/5
                        </span>
                        <Button variant="ghost" size="sm" onClick={() => handleCopyResult(results[activeResultIndex])} icon={<Copy style={{ width: '14px', height: '14px' }} />}>
                          复制
                        </Button>
                      </div>
                    </div>
                    <div style={{ flex: 1, padding: '24px', overflowY: 'auto', fontSize: '14px', lineHeight: '1.9', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', background: 'linear-gradient(180deg, rgba(139, 92, 246, 0.03) 0%, rgba(139, 92, 246, 0.01) 100%)' }}>
                      {results[activeResultIndex]?.optimizedContent}
                    </div>
                  </div>
                </div>

                {results[activeResultIndex]?.suggestions && results[activeResultIndex].suggestions.length > 0 && (
                  <div style={{ padding: '18px 28px', borderTop: '1px solid var(--border-primary)', backgroundColor: 'var(--bg-surface)' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 12px' }}>优化建议</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                      {results[activeResultIndex].suggestions.map((suggestion, i) => (
                        <span key={i} style={{ padding: '8px 16px', backgroundColor: 'var(--bg-hover)', borderRadius: '10px', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>
                          {suggestion}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div style={{ padding: '24px 32px', borderTop: '1px solid var(--border-primary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-elevated) 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {step === 'configure' && (
              <>
                <Button variant="secondary" size="default" onClick={() => setStep('select')}>返回</Button>
                <Button variant="secondary" size="default" onClick={handleSaveAsTemplate} icon={<Bookmark style={{ width: '16px', height: '16px' }} />}>
                  保存为模板
                </Button>
              </>
            )}
            {step === 'result' && (
              <Button variant="secondary" size="default" onClick={handleRetry} icon={<RotateCcw style={{ width: '16px', height: '16px' }} />}>
                重新生成
              </Button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Button variant="ghost" size="default" onClick={onClose}>取消</Button>
            {step === 'configure' && (
              <Button variant="primary" size="lg" disabled={selectedSceneIds.length === 0} onClick={handleStartOptimize} icon={<Sparkles style={{ width: '18px', height: '18px' }} />}>
                获取 AI 建议
              </Button>
            )}
            {step === 'result' && (
              <Button variant="success" size="lg" onClick={handleApplyAll} icon={<Check style={{ width: '18px', height: '18px' }} />}>
                应用全部优化
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
