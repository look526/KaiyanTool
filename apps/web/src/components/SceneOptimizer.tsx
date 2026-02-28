import { useState, useEffect } from 'react';
import { Search, X, Check, Sparkles, RotateCcw, ArrowRight, Filter } from 'lucide-react';

interface Scene {
  id: number;
  original: string;
  location: string;
  time: string;
  content: string;
  heading: string;
}

interface OptimizationDirection {
  id: string;
  label: string;
  description: string;
  icon: string;
}

interface SceneOptimizerProps {
  isOpen: boolean;
  onClose: () => void;
  scenes: Scene[];
  onApplyOptimization: (sceneId: number, optimizedContent: string) => void;
}

const OPTIMIZATION_DIRECTIONS: OptimizationDirection[] = [
  { id: 'dialogue', label: '对话增强', description: '让对话更自然流畅', icon: '💬' },
  { id: 'plot', label: '情节紧凑', description: '提升剧情节奏感', icon: '📖' },
  { id: 'character', label: '角色塑造', description: '强化人物性格', icon: '👤' },
  { id: 'atmosphere', label: '场景氛围', description: '增强环境描写', icon: '🎬' },
  { id: 'visual', label: '画面增强', description: '提升视觉表现', icon: '🎨' },
  { id: 'emotional', label: '情感深化', description: '增加情感层次', icon: '❤️' },
];

export function SceneOptimizer({ isOpen, onClose, scenes, onApplyOptimization }: SceneOptimizerProps) {
  const [step, setStep] = useState<'select' | 'configure' | 'processing' | 'result'>('select');
  const [selectedScenes, setSelectedScenes] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [selectedDirections, setSelectedDirections] = useState<string[]>([]);
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('');

  const [optimizationResult, setOptimizationResult] = useState<{ sceneId: number; original: string; optimized: string } | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationProgress, setOptimizationProgress] = useState(0);

  const filteredScenes = scenes.filter(scene => {
    const query = searchQuery.toLowerCase();
    return scene.location.toLowerCase().includes(query) ||
           scene.content.toLowerCase().includes(query) ||
           scene.heading.toLowerCase().includes(query);
  });

  const totalPages = Math.ceil(filteredScenes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentScenes = filteredScenes.slice(startIndex, endIndex);

  useEffect(() => {
    if (!isOpen) {
      setStep('select');
      setSelectedScenes(new Set());
      setSearchQuery('');
      setCurrentPage(1);
      setSelectedDirections([]);
      setCustomPrompt('');
      setOptimizationResult(null);
    }
  }, [isOpen]);

  const handleSceneToggle = (sceneId: number) => {
    const newSelected = new Set(selectedScenes);
    if (newSelected.has(sceneId)) {
      newSelected.delete(sceneId);
    } else {
      newSelected.add(sceneId);
    }
    setSelectedScenes(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedScenes.size === currentScenes.length) {
      setSelectedScenes(new Set());
    } else {
      setSelectedScenes(new Set(currentScenes.map(s => s.id)));
    }
  };

  const handleDirectionToggle = (directionId: string) => {
    const newSelected = selectedDirections.includes(directionId)
      ? selectedDirections.filter(d => d !== directionId)
      : [...selectedDirections, directionId];
    setSelectedDirections(newSelected);
  };

  const handleContinueToConfigure = () => {
    if (selectedScenes.size === 0) return;
    setStep('configure');
  };

  const handleStartOptimization = async () => {
    if (selectedDirections.length === 0 && !customPrompt.trim()) {
      alert('请至少选择一个优化方向或输入自定义提示词');
      return;
    }

    setStep('processing');
    setIsOptimizing(true);
    setOptimizationProgress(0);

    const sceneIds = Array.from(selectedScenes);
    
    for (let i = 0; i < sceneIds.length; i++) {
      const sceneId = sceneIds[i];
      const scene = scenes.find(s => s.id === sceneId);
      if (!scene) continue;

      setOptimizationProgress(Math.round(((i + 1) / sceneIds.length * 100)));

      try {
        const optimizedContent = await optimizeScene(scene, selectedDirections, customPrompt);
        
        setOptimizationResult({
          sceneId,
          original: scene.content,
          optimized: optimizedContent
        });
        
        setStep('result');
        break;
      } catch (error) {
        console.error('优化场景失败:', error);
        alert(`优化场景 ${sceneId} 失败: ${error instanceof Error ? error.message : '未知错误'}`);
      }
    }

    setIsOptimizing(false);
  };

  const optimizeScene = async (scene: Scene, directions: string[], customPrompt: string): Promise<string> => {
    const directionLabels = directions
      .map(d => OPTIMIZATION_DIRECTIONS.find(opt => opt.id === d)?.label)
      .filter(Boolean)
      .join('、');

    const prompt = `请优化以下剧本场景内容：

【场景信息】
场景标题：${scene.heading}
地点：${scene.location}
时间：${scene.time}

【优化方向】
${directionLabels ? `预设方向：${directionLabels}` : ''}
${customPrompt ? `自定义要求：${customPrompt}` : ''}

【原始场景内容】
${scene.content}

【优化要求】
1. 保持原有剧情和人物设定不变
2. 根据优化方向进行针对性改进
3. 保持剧本格式规范
4. 确保内容连贯自然

请直接输出优化后的场景内容，不需要任何额外说明。`;

    const response = await fetch('/api/ai/optimize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        model: selectedModel || undefined,
      }),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('优化请求失败');
    }

    const result = await response.json();
    return result.content || scene.content;
  };

  const handleContinueOptimization = () => {
    setStep('configure');
    setOptimizationProgress(0);
  };

  const handleApplyOptimization = () => {
    if (optimizationResult) {
      onApplyOptimization(optimizationResult.sceneId, optimizationResult.optimized);
      setOptimizationResult(null);
      
      const remainingScenes = selectedScenes;
      if (remainingScenes.size > 1) {
        const newSelected = new Set(remainingScenes);
        newSelected.delete(optimizationResult.sceneId);
        setSelectedScenes(newSelected);
        if (newSelected.size > 0) {
          setStep('configure');
        } else {
          onClose();
        }
      } else {
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        maxWidth: '900px',
        width: '90%',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid var(--border-primary)',
      }}>
        {step === 'select' && (
          <>
            <div style={{
              padding: '24px',
              borderBottom: '1px solid var(--border-primary)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)' }}>
                  选择要优化的场景
                </h2>
                <p style={{ margin: '6px 0 0 0', fontSize: '14px', color: 'var(--text-muted)' }}>
                  共 {scenes.length} 个场景，已选择 {selectedScenes.size} 个
                </p>
              </div>
              <button
                onClick={onClose}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'var(--bg-hover)',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-primary)' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <Search style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '18px',
                    height: '18px',
                    color: 'var(--text-muted)',
                  }} />
                  <input
                    type="text"
                    placeholder="搜索场景..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 42px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-primary)',
                      background: 'var(--bg-input)',
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>
                <button
                  onClick={handleSelectAll}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-primary)',
                    background: selectedScenes.size === currentScenes.length ? 'var(--bg-primary)' : 'var(--bg-hover)',
                    color: selectedScenes.size === currentScenes.length ? '#fff' : 'var(--text-primary)',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {selectedScenes.size === currentScenes.length ? '取消全选' : '全选'}
                </button>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
              {currentScenes.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  color: 'var(--text-muted)',
                  fontSize: '14px',
                }}>
                  没有找到匹配的场景
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {currentScenes.map((scene) => (
                    <div
                      key={scene.id}
                      onClick={() => handleSceneToggle(scene.id)}
                      style={{
                        padding: '16px',
                        borderRadius: '12px',
                        border: `2px solid ${selectedScenes.has(scene.id) ? '#6366f1' : 'var(--border-primary)'}`,
                        background: selectedScenes.has(scene.id) ? 'rgba(99, 102, 241, 0.05)' : 'var(--bg-hover)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!selectedScenes.has(scene.id)) {
                          e.currentTarget.style.borderColor = '#6366f1';
                          e.currentTarget.style.transform = 'translateX(4px)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!selectedScenes.has(scene.id)) {
                          e.currentTarget.style.borderColor = 'var(--border-primary)';
                          e.currentTarget.style.transform = 'translateX(0)';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <div style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '6px',
                          border: `2px solid ${selectedScenes.has(scene.id) ? '#6366f1' : 'var(--border-primary)'}`,
                          background: selectedScenes.has(scene.id) ? '#6366f1' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          {selectedScenes.has(scene.id) && <Check style={{ width: '16px', height: '16px', color: '#fff' }} />}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                            <span style={{
                              fontSize: '15px',
                              fontWeight: '600',
                              color: 'var(--text-primary)',
                            }}>
                              {scene.heading}
                            </span>
                            <span style={{
                              fontSize: '12px',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              background: 'var(--bg-input)',
                              color: 'var(--text-muted)',
                            }}>
                              {scene.time}
                            </span>
                          </div>
                          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                            📍 {scene.location}
                          </div>
                          <div style={{
                            fontSize: '13px',
                            color: 'var(--text-primary)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}>
                            {scene.content.slice(0, 150)}...
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid var(--border-primary)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                第 {currentPage} / {totalPages} 页
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-primary)',
                    background: currentPage === 1 ? 'var(--bg-hover)' : 'var(--bg-card)',
                    color: 'var(--text-muted)',
                    fontSize: '14px',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    opacity: currentPage === 1 ? 0.5 : 1,
                  }}
                >
                  上一页
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-primary)',
                    background: currentPage === totalPages ? 'var(--bg-hover)' : 'var(--bg-card)',
                    color: 'var(--text-muted)',
                    fontSize: '14px',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    opacity: currentPage === totalPages ? 0.5 : 1,
                  }}
                >
                  下一页
                </button>
              </div>
            </div>

            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid var(--border-primary)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
            }}>
              <button
                onClick={onClose}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-primary)',
                  background: 'var(--bg-hover)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
              >
                取消
              </button>
              <button
                onClick={handleContinueToConfigure}
                disabled={selectedScenes.size === 0}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: selectedScenes.size === 0 ? 'var(--bg-hover)' : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: selectedScenes.size === 0 ? 'not-allowed' : 'pointer',
                  opacity: selectedScenes.size === 0 ? 0.5 : 1,
                }}
              >
                下一步 ({selectedScenes.size})
              </button>
            </div>
          </>
        )}

        {step === 'configure' && (
          <>
            <div style={{
              padding: '24px',
              borderBottom: '1px solid var(--border-primary)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)' }}>
                  配置优化选项
                </h2>
                <p style={{ margin: '6px 0 0 0', fontSize: '14px', color: 'var(--text-muted)' }}>
                  已选择 {selectedScenes.size} 个场景进行优化
                </p>
              </div>
              <button
                onClick={onClose}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'var(--bg-hover)',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
                  选择优化方向
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                  {OPTIMIZATION_DIRECTIONS.map((direction) => (
                    <button
                      key={direction.id}
                      onClick={() => handleDirectionToggle(direction.id)}
                      style={{
                        padding: '16px',
                        borderRadius: '12px',
                        border: `2px solid ${selectedDirections.includes(direction.id) ? '#6366f1' : 'var(--border-primary)'}`,
                        background: selectedDirections.includes(direction.id) ? 'rgba(99, 102, 241, 0.05)' : 'var(--bg-hover)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!selectedDirections.includes(direction.id)) {
                          e.currentTarget.style.borderColor = '#6366f1';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!selectedDirections.includes(direction.id)) {
                          e.currentTarget.style.borderColor = 'var(--border-primary)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }
                      }}
                    >
                      <div style={{ fontSize: '24px', marginBottom: '8px' }}>
                        {direction.icon}
                      </div>
                      <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
                        {direction.label}
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        {direction.description}
                      </div>
                      {selectedDirections.includes(direction.id) && (
                        <div style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: '#6366f1',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <Check style={{ width: '14px', height: '14px', color: '#fff' }} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
                  自定义优化提示
                </h3>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="输入自定义的优化要求，例如：增加更多环境细节描写、强化角色互动、调整对话节奏等..."
                  style={{
                    width: '100%',
                    minHeight: '120px',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-primary)',
                    background: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    resize: 'vertical',
                    outline: 'none',
                  }}
                />
                <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
                  可以同时使用预设优化方向和自定义提示词，两者会结合生效
                </div>
              </div>
            </div>

            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid var(--border-primary)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <button
                onClick={() => setStep('select')}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-primary)',
                  background: 'var(--bg-hover)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <ArrowRight style={{ width: '16px', height: '16px', transform: 'rotate(180deg)' }} />
                返回选择
              </button>
              <button
                onClick={handleStartOptimization}
                disabled={isOptimizing || (selectedDirections.length === 0 && !customPrompt.trim())}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: isOptimizing || (selectedDirections.length === 0 && !customPrompt.trim()) 
                    ? 'var(--bg-hover)' 
                    : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: isOptimizing || (selectedDirections.length === 0 && !customPrompt.trim()) 
                    ? 'not-allowed' 
                    : 'pointer',
                  opacity: isOptimizing || (selectedDirections.length === 0 && !customPrompt.trim()) ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Sparkles style={{ width: '16px', height: '16px' }} />
                {isOptimizing ? '优化中...' : '开始优化'}
              </button>
            </div>
          </>
        )}

        {step === 'processing' && (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px',
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              border: '4px solid var(--border-primary)',
              borderTopColor: '#6366f1',
              animation: 'spin 1s linear infinite',
              marginBottom: '24px',
            }} />
            <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>
              正在优化场景...
            </h3>
            <div style={{
              width: '300px',
              height: '8px',
              borderRadius: '4px',
              background: 'var(--bg-input)',
              overflow: 'hidden',
              marginBottom: '12px',
            }}>
              <div style={{
                width: `${optimizationProgress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
                transition: 'width 0.3s ease',
              }} />
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              进度: {optimizationProgress}%
            </div>
          </div>
        )}

        {step === 'result' && optimizationResult && (
          <>
            <div style={{
              padding: '24px',
              borderBottom: '1px solid var(--border-primary)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)' }}>
                  优化结果
                </h2>
                <p style={{ margin: '6px 0 0 0', fontSize: '14px', color: 'var(--text-muted)' }}>
                  场景 {optimizationResult.sceneId} 优化完成
                </p>
              </div>
              <button
                onClick={onClose}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'var(--bg-hover)',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600', color: 'var(--text-muted)' }}>
                  原始内容
                </h3>
                <div style={{
                  padding: '16px',
                  borderRadius: '8px',
                  background: 'var(--bg-hover)',
                  border: '1px solid var(--border-primary)',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  color: 'var(--text-primary)',
                  whiteSpace: 'pre-wrap',
                }}>
                  {optimizationResult.original}
                </div>
              </div>

              <div>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600', color: '#10b981' }}>
                  优化后内容
                </h3>
                <div style={{
                  padding: '16px',
                  borderRadius: '8px',
                  background: 'rgba(16, 185, 129, 0.05)',
                  border: '2px solid #10b981',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  color: 'var(--text-primary)',
                  whiteSpace: 'pre-wrap',
                }}>
                  {optimizationResult.optimized}
                </div>
              </div>
            </div>

            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid var(--border-primary)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <button
                onClick={handleContinueOptimization}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-primary)',
                  background: 'var(--bg-hover)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <RotateCcw style={{ width: '16px', height: '16px' }} />
                继续优化
              </button>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={onClose}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-primary)',
                    background: 'var(--bg-hover)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                  }}
                >
                  取消
                </button>
                <button
                  onClick={handleApplyOptimization}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Check style={{ width: '16px', height: '16px' }} />
                  应用
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
