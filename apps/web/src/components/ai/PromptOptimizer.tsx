import { useState } from 'react';
import { Search, Star, Copy, Save, X, Tag, Clock, Sparkles, Loader2 } from 'lucide-react';

interface PromptTemplate {
  id: string;
  name: string;
  content: string;
  category: string;
  tags: string[];
  usageCount: number;
  isFavorite: boolean;
  createdAt: string;
}

interface PromptOptimizerProps {
  initialPrompt?: string;
  onOptimize: (prompt: string) => Promise<string>;
  onSave?: (prompt: string, name: string, category: string) => void;
}

const defaultTemplates: PromptTemplate[] = [
  {
    id: '1',
    name: '电影感人像',
    content: 'cinematic portrait, 35mm film, shallow depth of field, soft natural lighting, dramatic shadows, moody atmosphere, high contrast, film grain',
    category: '人物',
    tags: ['人像', '电影感', '35mm'],
    usageCount: 128,
    isFavorite: true,
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    name: '梦幻场景',
    content: 'dreamy atmosphere, soft ethereal lighting, pastel colors, magical glow, floating elements, fantasy landscape, enchanted forest',
    category: '场景',
    tags: ['梦幻', '魔法', '幻想'],
    usageCount: 89,
    isFavorite: false,
    createdAt: '2024-01-20'
  },
  {
    id: '3',
    name: '赛博朋克',
    content: 'cyberpunk city, neon lights, rain, reflections, futuristic architecture, holograms, high tech, low life, dramatic lighting',
    category: '风格',
    tags: ['赛博朋克', '科幻', '霓虹'],
    usageCount: 256,
    isFavorite: true,
    createdAt: '2024-02-01'
  }
];

export function PromptOptimizer({ initialPrompt = '', onOptimize, onSave }: PromptOptimizerProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [optimizedPrompt, setOptimizedPrompt] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [templates, setTemplates] = useState<PromptTemplate[]>(defaultTemplates);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveCategory, setSaveCategory] = useState('未分类');

  const [optimizeHover, setOptimizeHover] = useState(false);
  const [saveHover, setSaveHover] = useState(false);
  const [copyHover, setCopyHover] = useState(false);
  const [templateHovered, setTemplateHovered] = useState<string | null>(null);
  const [categoryHover, setCategoryHover] = useState<string | null>(null);
  const [useButtonHover, setUseButtonHover] = useState<string | null>(null);
  const [favoriteHover, setFavoriteHover] = useState<string | null>(null);

  const categories = ['全部', '人物', '场景', '风格', '特效', '其他'];

  const handleOptimize = async () => {
    if (!prompt.trim()) return;
    
    setIsOptimizing(true);
    try {
      const result = await onOptimize(prompt);
      setOptimizedPrompt(result);
    } finally {
      setIsOptimizing(false);
    }
  };

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         t.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = !selectedCategory || selectedCategory === '全部' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const applyTemplate = (template: PromptTemplate) => {
    setPrompt(template.content);
    setTemplates(prev =>
      prev.map(t =>
        t.id === template.id ? { ...t, usageCount: t.usageCount + 1 } : t
      )
    );
  };

  const toggleFavorite = (id: string) => {
    setTemplates(prev =>
      prev.map(t => t.id === id ? { ...t, isFavorite: !t.isFavorite } : t)
    );
  };

  const handleSave = () => {
    if (!saveName.trim() || !optimizedPrompt.trim()) return;
    
    onSave?.(optimizedPrompt, saveName, saveCategory);
    setShowSaveDialog(false);
    setSaveName('');
    setSaveCategory('未分类');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(optimizedPrompt);
  };

  return (
    <div style={{
      background: 'var(--bg-surface)',
      borderRadius: '20px',
      border: '1px solid var(--border-primary)',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--border-primary)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}>
        <Tag style={{ width: '20px', height: '20px', color: 'var(--accent)' }} />
        <h3 style={{
          fontSize: '17px',
          fontWeight: '600',
          color: 'var(--text-primary)',
          margin: 0,
        }}>
          提示词优化器
        </h3>
      </div>

      <div style={{ display: 'flex' }}>
        <div style={{
          width: '50%',
          padding: '20px',
          borderRight: '1px solid var(--border-primary)',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: 'var(--text-primary)',
                marginBottom: '8px',
              }}>原始提示词</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="输入你的原始提示词..."
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-primary)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  minHeight: '120px',
                  resize: 'none',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                }}
              />
            </div>

            <button
              onClick={handleOptimize}
              disabled={isOptimizing || !prompt.trim()}
              onMouseEnter={() => setOptimizeHover(true)}
              onMouseLeave={() => setOptimizeHover(false)}
              style={{
                width: '100%',
                padding: '14px 20px',
                borderRadius: '12px',
                border: 'none',
                background: isOptimizing || !prompt.trim() 
                  ? 'var(--bg-secondary)' 
                  : optimizeHover 
                    ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' 
                    : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                color: isOptimizing || !prompt.trim() ? 'var(--text-muted)' : '#fff',
                fontSize: '15px',
                fontWeight: '500',
                cursor: isOptimizing || !prompt.trim() ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                transform: optimizeHover && !isOptimizing ? 'translateY(-1px)' : 'translateY(0)',
                boxShadow: optimizeHover && !isOptimizing ? '0 8px 24px rgba(99, 102, 241, 0.4)' : '0 4px 14px rgba(99, 102, 241, 0.3)',
              }}
            >
              {isOptimizing ? (
                <>
                  <Loader2 style={{ width: '18px', height: '18px', animation: 'spin 1s linear infinite' }} />
                  优化中...
                </>
              ) : (
                <>
                  <Sparkles style={{ width: '18px', height: '18px' }} />
                  AI 优化
                </>
              )}
            </button>

            {optimizedPrompt && (
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                }}>
                  <label style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: 'var(--text-primary)',
                  }}>优化后提示词</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={handleCopy}
                      onMouseEnter={() => setCopyHover(true)}
                      onMouseLeave={() => setCopyHover(false)}
                      title="复制"
                      style={{
                        padding: '6px',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'transparent',
                        color: copyHover ? 'var(--accent)' : 'var(--text-muted)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <Copy style={{ width: '16px', height: '16px' }} />
                    </button>
                    <button
                      onClick={() => setShowSaveDialog(true)}
                      onMouseEnter={() => setSaveHover(true)}
                      onMouseLeave={() => setSaveHover(false)}
                      title="保存到模板"
                      style={{
                        padding: '6px',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'transparent',
                        color: saveHover ? '#10b981' : 'var(--text-muted)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <Save style={{ width: '16px', height: '16px' }} />
                    </button>
                  </div>
                </div>
                <div style={{
                  padding: '16px',
                  borderRadius: '12px',
                  background: 'rgba(99, 102, 241, 0.1)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                }}>
                  <p style={{
                    fontSize: '14px',
                    color: 'var(--accent)',
                    whiteSpace: 'pre-wrap',
                    margin: 0,
                  }}>
                    {optimizedPrompt}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{
          width: '50%',
          padding: '20px',
        }}>
          <div style={{ marginBottom: '16px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '12px',
            }}>
              <Search style={{ width: '16px', height: '16px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索提示词模板..."
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-primary)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              paddingBottom: '8px',
            }}>
              {categories.map(cat => {
                const isActive = selectedCategory === cat || (cat === '全部' && !selectedCategory);
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat === '全部' ? null : cat)}
                    onMouseEnter={() => setCategoryHover(cat)}
                    onMouseLeave={() => setCategoryHover(null)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: '500',
                      whiteSpace: 'nowrap',
                      border: 'none',
                      background: isActive 
                        ? 'var(--accent)' 
                        : categoryHover === cat 
                          ? 'var(--bg-hover)' 
                          : 'var(--bg-secondary)',
                      color: isActive ? '#fff' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            maxHeight: '320px',
            overflowY: 'auto',
          }}>
            {filteredTemplates.map(template => (
              <div
                key={template.id}
                onMouseEnter={() => setTemplateHovered(template.id)}
                onMouseLeave={() => setTemplateHovered(null)}
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  background: templateHovered === template.id ? 'var(--bg-hover)' : 'var(--bg-secondary)',
                  border: '1px solid var(--border-secondary)',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  marginBottom: '4px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => toggleFavorite(template.id)}
                      onMouseEnter={() => setFavoriteHover(template.id)}
                      onMouseLeave={() => setFavoriteHover(null)}
                      style={{
                        padding: 0,
                        border: 'none',
                        background: 'transparent',
                        color: template.isFavorite || favoriteHover === template.id ? '#f59e0b' : 'var(--text-muted)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <Star style={{ width: '14px', height: '14px', fill: template.isFavorite ? '#f59e0b' : 'none' }} />
                    </button>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: 'var(--text-primary)',
                    }}>{template.name}</span>
                    <span style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      background: 'rgba(99, 102, 241, 0.15)',
                      color: 'var(--accent)',
                    }}>
                      {template.category}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}>
                      <Clock style={{ width: '12px', height: '12px' }} />
                      {template.usageCount}次
                    </span>
                    <button
                      onClick={() => applyTemplate(template)}
                      onMouseEnter={() => setUseButtonHover(template.id)}
                      onMouseLeave={() => setUseButtonHover(null)}
                      style={{
                        padding: '4px 10px',
                        fontSize: '12px',
                        borderRadius: '6px',
                        border: 'none',
                        background: useButtonHover === template.id 
                          ? 'var(--accent)' 
                          : 'var(--bg-primary)',
                        color: useButtonHover === template.id ? '#fff' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      使用
                    </button>
                  </div>
                </div>
                <p style={{
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                  margin: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}>{template.content}</p>
                <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                  {template.tags.map(tag => (
                    <span key={tag} style={{
                      fontSize: '11px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: 'var(--bg-hover)',
                      color: 'var(--text-secondary)',
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showSaveDialog && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
        }} onClick={() => setShowSaveDialog(false)}>
          <div style={{
            background: 'var(--bg-surface)',
            borderRadius: '20px',
            padding: '24px',
            width: '380px',
            border: '1px solid var(--border-primary)',
          }} onClick={e => e.stopPropagation()}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}>
              <h4 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: 'var(--text-primary)',
                margin: 0,
              }}>保存到模板库</h4>
              <button
                onClick={() => setShowSaveDialog(false)}
                style={{
                  padding: '4px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                }}
              >
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: 'var(--text-primary)',
                  marginBottom: '6px',
                }}>模板名称</label>
                <input
                  type="text"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="输入模板名称..."
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-primary)',
                    background: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: 'var(--text-primary)',
                  marginBottom: '6px',
                }}>分类</label>
                <select
                  value={saveCategory}
                  onChange={(e) => setSaveCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-primary)',
                    background: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                >
                  {categories.slice(1).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleSave}
                disabled={!saveName.trim()}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: 'none',
                  background: !saveName.trim() 
                    ? 'var(--bg-secondary)' 
                    : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  color: !saveName.trim() ? 'var(--text-muted)' : '#fff',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: !saveName.trim() ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
