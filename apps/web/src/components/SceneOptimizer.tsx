import { useState, useEffect } from 'react';
import { X, Check, Sparkles, RotateCcw, ArrowRight, ChevronDown } from 'lucide-react';

interface Scene {
  id: number;
  heading: string;
  content: string;
  originalContent: string;
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
  scriptContent: string;
  onApplyOptimization: (optimizedContent: string) => void;
}

const OPTIMIZATION_DIRECTIONS: OptimizationDirection[] = [
  { id: 'dialogue', label: '对话增强', description: '让对话更自然流畅', icon: '💬' },
  { id: 'plot', label: '情节紧凑', description: '提升剧情节奏感', icon: '📖' },
  { id: 'character', label: '角色塑造', description: '强化人物性格', icon: '👤' },
  { id: 'atmosphere', label: '场景氛围', description: '增强环境描写', icon: '🎬' },
  { id: 'visual', label: '画面增强', description: '提升视觉表现', icon: '🎨' },
  { id: 'emotional', label: '情感深化', description: '增加情感层次', icon: '❤️' },
];

export function SceneOptimizer({ isOpen, onClose, scriptContent, onApplyOptimization }: SceneOptimizerProps) {
  const [step, setStep] = useState<'list' | 'configure' | 'processing' | 'result'>('list');
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [selectedSceneIds, setSelectedSceneIds] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [selectedDirections, setSelectedDirections] = useState<string[]>([]);
  const [customPrompt, setCustomPrompt] = useState('');

  const [optimizationResult, setOptimizationResult] = useState<Record<number, string> | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationProgress, setOptimizationProgress] = useState(0);
  const [expandedScenes, setExpandedScenes] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (isOpen && scriptContent) {
      parseScriptIntoScenes(scriptContent);
    }
  }, [isOpen, scriptContent]);

  useEffect(() => {
    if (!isOpen) {
      setStep('list');
      setSelectedSceneIds(new Set());
      setSearchQuery('');
      setCurrentPage(1);
      setSelectedDirections([]);
      setCustomPrompt('');
      setOptimizationResult(null);
      setExpandedScenes(new Set());
    }
  }, [isOpen]);

  const parseScriptIntoScenes = (content: string) => {
    const sceneRegex = /(?:^|\n)\s*场景\s*(\d+)\s*[:：\-]?\s*([^\n]*)/g;
    const matches = Array.from(content.matchAll(sceneRegex));
    
    if (matches.length === 0) {
      setScenes([{
        id: 1,
        heading: '整篇剧本',
        content: content,
        originalContent: content,
      }]);
      return;
    }

    const parsedScenes: Scene[] = [];
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const sceneNumber = parseInt(match[1]);
      const sceneHeading = match[2].trim() || `场景 ${sceneNumber}`;
      
      const startIdx = match.index!;
      const endIdx = i < matches.length - 1 ? matches[i + 1].index! : content.length;
      
      const sceneContent = content.slice(startIdx, endIdx).trim();
      
      parsedScenes.push({
        id: sceneNumber,
        heading: sceneHeading,
        content: sceneContent,
        originalContent: sceneContent,
      });
    }

    setScenes(parsedScenes);
  };

  const handleSceneToggle = (sceneId: number) => {
    const newSelected = new Set(selectedSceneIds);
    if (newSelected.has(sceneId)) {
      newSelected.delete(sceneId);
    } else {
      newSelected.add(sceneId);
    }
    setSelectedSceneIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedSceneIds.size === currentScenes.length) {
      setSelectedSceneIds(new Set());
    } else {
      setSelectedSceneIds(new Set(currentScenes.map(s => s.id)));
    }
  };

  const handleDirectionToggle = (directionId: string) => {
    const newSelected = selectedDirections.includes(directionId)
      ? selectedDirections.filter(d => d !== directionId)
      : [...selectedDirections, directionId];
    setSelectedDirections(newSelected);
  };

  const handleSceneExpand = (sceneId: number) => {
    const newExpanded = new Set(expandedScenes);
    if (newExpanded.has(sceneId)) {
      newExpanded.delete(sceneId);
    } else {
      newExpanded.add(sceneId);
    }
    setExpandedScenes(newExpanded);
  };

  const filteredScenes = scenes.filter(scene => {
    const query = searchQuery.toLowerCase();
    return scene.heading.toLowerCase().includes(query) ||
           scene.content.toLowerCase().includes(query);
  });

  const totalPages = Math.ceil(filteredScenes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentScenes = filteredScenes.slice(startIndex, endIndex);

  const handleContinueToConfigure = () => {
    if (selectedSceneIds.size === 0) return;
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

    try {
      const results: Record<number, string> = {};
      let processedCount = 0;
      const totalToProcess = selectedSceneIds.size;

      for (const sceneId of selectedSceneIds) {
        const scene = scenes.find(s => s.id === sceneId);
        if (!scene) continue;

        const directionText = selectedDirections.length > 0
          ? OPTIMIZATION_DIRECTIONS
              .filter(d => selectedDirections.includes(d.id))
              .map(d => `${d.label}（${d.description}）`)
              .join('、')
          : '';

        const prompt = customPrompt.trim()
          ? customPrompt.trim()
          : `请按照以下方向优化以下场景内容：${directionText}\n\n场景内容：\n${scene.content}`;

        const response = await fetch('/api/optimize-scene', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sceneContent: scene.content, prompt }),
        });

        if (!response.ok) throw new Error('优化失败');

        const data = await response.json();
        results[sceneId] = data.optimizedContent;

        processedCount++;
        setOptimizationProgress(Math.round((processedCount / totalToProcess) * 100));
      }

      setOptimizationResult(results);
      setStep('result');
    } catch (error) {
      console.error('场景优化失败:', error);
      alert('场景优化失败，请重试');
      setStep('list');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleApplyAll = () => {
    if (!optimizationResult) return;

    let optimizedContent = scriptContent;
    for (const [sceneId, optimized] of Object.entries(optimizationResult)) {
      const scene = scenes.find(s => s.id === parseInt(sceneId));
      if (scene) {
        optimizedContent = optimizedContent.replace(scene.originalContent, optimized);
      }
    }

    onApplyOptimization(optimizedContent);
    onClose();
  };

  const handleResetScene = (sceneId: number) => {
    const newResults = { ...optimizationResult };
    delete newResults[sceneId];
    setOptimizationResult(newResults);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
    }} onClick={onClose}>
      <div
        style={{
          backgroundColor: 'var(--bg-primary)',
          borderRadius: '12px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          width: '100%',
          maxWidth: '900px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-color)',
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)' }}>
              {step === 'list' && '场景优化'}
              {step === 'configure' && '配置优化参数'}
              {step === 'processing' && '正在优化...'}
              {step === 'result' && '优化结果'}
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
              {step === 'list' && `共 ${scenes.length} 个场景，已选择 ${selectedSceneIds.size} 个`}
              {step === 'configure' && '选择优化方向或输入自定义提示词'}
              {step === 'processing' && '正在使用AI优化场景内容...'}
              {step === 'result' && '查看并应用优化结果'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '8px',
              borderRadius: '8px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
        }}>
          {step === 'list' && (
            <>
              <div style={{
                display: 'flex',
                gap: '12px',
                marginBottom: '16px',
              }}>
                <div style={{
                  flex: 1,
                  position: 'relative',
                }}>
                  <input
                    type="text"
                    placeholder="搜索场景..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      fontSize: '14px',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      background: 'var(--bg-input)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                    }}
                  />
                </div>
                <button
                  onClick={handleSelectAll}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                  }}
                >
                  {selectedSceneIds.size === currentScenes.length ? '取消全选' : '全选'}
                </button>
              </div>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}>
                {currentScenes.map((scene) => (
                  <div
                    key={scene.id}
                    style={{
                      border: selectedSceneIds.has(scene.id) ? '2px solid #10b981' : '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '16px',
                      background: selectedSceneIds.has(scene.id) ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-secondary)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onClick={() => handleSceneToggle(scene.id)}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                    }}>
                      <div style={{ marginTop: '2px' }}>
                        <input
                          type="checkbox"
                          checked={selectedSceneIds.has(scene.id)}
                          onChange={() => handleSceneToggle(scene.id)}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            width: '18px',
                            height: '18px',
                            cursor: 'pointer',
                          }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '8px',
                        }}>
                          <h3 style={{
                            margin: 0,
                            fontSize: '15px',
                            fontWeight: '600',
                            color: 'var(--text-primary)',
                          }}>
                            {scene.heading}
                          </h3>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSceneExpand(scene.id);
                            }}
                            style={{
                              padding: '4px',
                              border: 'none',
                              background: 'transparent',
                              cursor: 'pointer',
                              color: 'var(--text-muted)',
                            }}
                          >
                            <ChevronDown
                              size={16}
                              style={{
                                transform: expandedScenes.has(scene.id) ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s',
                              }}
                            />
                          </button>
                        </div>
                        {expandedScenes.has(scene.id) && (
                          <p style={{
                            margin: 0,
                            fontSize: '13px',
                            color: 'var(--text-secondary)',
                            lineHeight: '1.6',
                            whiteSpace: 'pre-wrap',
                            maxHeight: '300px',
                            overflowY: 'auto',
                            background: 'var(--bg-input)',
                            padding: '12px',
                            borderRadius: '6px',
                          }}>
                            {scene.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  marginTop: '16px',
                }}>
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-input)',
                      color: currentPage === 1 ? 'var(--text-muted)' : 'var(--text-primary)',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      fontSize: '13px',
                    }}
                  >
                    上一页
                  </button>
                  <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-input)',
                      color: currentPage === totalPages ? 'var(--text-muted)' : 'var(--text-primary)',
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      fontSize: '13px',
                    }}
                  >
                    下一页
                  </button>
                </div>
              )}
            </>
          )}

          {step === 'configure' && (
            <>
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{
                  margin: '0 0 12px 0',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                }}>
                  选择优化方向
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '12px',
                }}>
                  {OPTIMIZATION_DIRECTIONS.map((direction) => (
                    <div
                      key={direction.id}
                      onClick={() => handleDirectionToggle(direction.id)}
                      style={{
                        padding: '16px',
                        borderRadius: '8px',
                        border: selectedDirections.includes(direction.id) ? '2px solid #10b981' : '1px solid var(--border-color)',
                        background: selectedDirections.includes(direction.id) ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-secondary)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ fontSize: '24px', marginBottom: '8px' }}>
                        {direction.icon}
                      </div>
                      <h4 style={{
                        margin: '0 0 4px 0',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                      }}>
                        {direction.label}
                      </h4>
                      <p style={{
                        margin: 0,
                        fontSize: '12px',
                        color: 'var(--text-muted)',
                      }}>
                        {direction.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 style={{
                  margin: '0 0 12px 0',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                }}>
                  自定义提示词（可选）
                </h3>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="输入自定义的优化提示词，例如：让对话更加幽默风趣，增加角色之间的互动..."
                  rows={6}
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '14px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    background: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    resize: 'vertical',
                    outline: 'none',
                    fontFamily: 'inherit',
                  }}
                />
              </div>
            </>
          )}

          {step === 'processing' && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px',
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                border: '4px solid #e5e7eb',
                borderTopColor: '#10b981',
                animation: 'spin 1s linear infinite',
              }} />
              <p style={{
                marginTop: '24px',
                fontSize: '16px',
                fontWeight: '600',
                color: 'var(--text-primary)',
              }}>
                正在优化场景...
              </p>
              <p style={{
                marginTop: '8px',
                fontSize: '14px',
                color: 'var(--text-muted)',
              }}>
                进度: {optimizationProgress}%
              </p>
            </div>
          )}

          {step === 'result' && optimizationResult && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}>
              {Array.from(selectedSceneIds).map((sceneId) => {
                const scene = scenes.find(s => s.id === sceneId);
                if (!scene) return null;
                const optimized = optimizationResult[sceneId];
                return (
                  <div key={sceneId} style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      padding: '12px 16px',
                      background: 'var(--bg-secondary)',
                      borderBottom: '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                      <h3 style={{
                        margin: 0,
                        fontSize: '14px',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                      }}>
                        {scene.heading}
                      </h3>
                      <button
                        onClick={() => handleResetScene(sceneId)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: '1px solid var(--border-color)',
                          background: 'var(--bg-input)',
                          color: 'var(--text-secondary)',
                          cursor: 'pointer',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <RotateCcw size={14} />
                        重置
                      </button>
                    </div>
                    <div style={{
                      padding: '16px',
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '16px',
                    }}>
                      <div>
                        <h4 style={{
                          margin: '0 0 8px 0',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: 'var(--text-muted)',
                        }}>
                          原文
                        </h4>
                        <p style={{
                          margin: 0,
                          fontSize: '13px',
                          color: 'var(--text-secondary)',
                          lineHeight: '1.6',
                          whiteSpace: 'pre-wrap',
                        }}>
                          {scene.originalContent}
                        </p>
                      </div>
                      <div>
                        <h4 style={{
                          margin: '0 0 8px 0',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: 'var(--text-primary)',
                        }}>
                          优化后
                        </h4>
                        <p style={{
                          margin: 0,
                          fontSize: '13px',
                          color: 'var(--text-primary)',
                          lineHeight: '1.6',
                          whiteSpace: 'pre-wrap',
                          background: 'rgba(16, 185, 129, 0.05)',
                          padding: '12px',
                          borderRadius: '6px',
                        }}>
                          {optimized}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {step === 'list' && (
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            padding: '16px 24px',
            borderTop: '1px solid var(--border-color)',
          }}>
            <button
              onClick={onClose}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              取消
            </button>
            <button
              onClick={handleContinueToConfigure}
              disabled={selectedSceneIds.size === 0}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                background: selectedSceneIds.size > 0 ? '#10b981' : '#d1d5db',
                color: 'white',
                cursor: selectedSceneIds.size > 0 ? 'pointer' : 'not-allowed',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              继续
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {step === 'configure' && (
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            padding: '16px 24px',
            borderTop: '1px solid var(--border-color)',
          }}>
            <button
              onClick={() => setStep('list')}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              返回
            </button>
            <button
              onClick={handleStartOptimization}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                background: '#10b981',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Sparkles size={16} />
              开始优化
            </button>
          </div>
        )}

        {step === 'result' && (
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            padding: '16px 24px',
            borderTop: '1px solid var(--border-color)',
          }}>
            <button
              onClick={() => setStep('list')}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              返回重新选择
            </button>
            <button
              onClick={handleApplyAll}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                background: '#10b981',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Check size={16} />
              应用所有优化
            </button>
          </div>
        )}

        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}
