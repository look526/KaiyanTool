import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  FileText,
  Sparkles,
  Loader2,
  Eye,
  Type,
  FileDown,
  Upload,
  Settings,
  ChevronDown,
  Plus,
  RotateCw,
  BrainCircuit,
  Wand2,
  LayoutGrid,
  FileCode,
  Maximize2,
  Minimize2,
  Zap,
  FileSearch,
  FileEdit,
  MapPin,
  X,
  Check,
} from 'lucide-react';
import { Button } from '../components/ui/button-new';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import MonacoEditor from '../components/MonacoEditor';
import { ModelSelector } from '../components/ui';
import { apiClient } from '../lib/api';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../components/ui/Toast';

interface Scene {
  id: number;
  description: string;
  type: string;
  dialogue: any[];
  action?: string;
}

const SCRIPT_TEMPLATES = [
  {
    name: '标准剧本',
    template: `场景1 - 室内，白天

主角A：你好，这是一段对话。
主角B：你好！
（动作描述）

场景2 - 室外，夜晚

主角A：这里是第二个场景。
（夜景描述）`,
  },
  {
    name: '电影剧本',
    template: `[场景1] 室内，白天
主角A
你好，这是一段对话。

主角B
你好！

[动作]
角色A做了一个手势。

[场景2] 室外，夜晚
主角A
这里是第二个场景。

[动作]
夜风吹过。`,
  },
];

export default function ScriptEditorPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const projectIdStr = projectId || '';
  const { theme } = useTheme();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [parsedScenes, setParsedScenes] = useState<Scene[]>([]);
  const [characters, setCharacters] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showTemplateMenu, setShowTemplateMenu] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isContinuing, setIsContinuing] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isParsingScenes, setIsParsingScenes] = useState(false);
  const [showSceneOptimizer, setShowSceneOptimizer] = useState(false);
  const [parsedScenesForOptimization, setParsedScenesForOptimization] = useState<Array<{
    id: number;
    original: string;
    location: string;
    time: string;
    content: string;
    suggestion?: string;
    optimized?: string;
    userDirection?: string;
    isOptimizing?: boolean;
  }>>([]);
  const [editorMode, setEditorMode] = useState<'edit' | 'preview'>('edit');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const { addToast } = useToast();

  const loadFromLocalStorage = useCallback(() => {
    const saved = localStorage.getItem(`script-${projectIdStr}`);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setTitle(data.title || '');
        setContent(data.content || '');
        setLastSaved(new Date(data.timestamp));
      } catch (err) {
        console.error('加载本地存储失败:', err);
      }
    }
  }, [projectIdStr]);

  const saveToLocalStorage = useCallback(() => {
    localStorage.setItem(`script-${projectIdStr}`, JSON.stringify({
      title,
      content,
      timestamp: Date.now(),
    }));
    setLastSaved(new Date());
  }, [projectIdStr, title, content]);

  useEffect(() => {
    loadFromLocalStorage();
  }, [loadFromLocalStorage]);

  useEffect(() => {
    if (!autoSaveEnabled) return;

    const timer = setTimeout(() => {
      if (title || content) {
        saveToLocalStorage();
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [title, content, autoSaveEnabled, saveToLocalStorage]);

  const parseScript = async () => {
    if (!content.trim()) return;

    try {
      setLoading(true);
      const result = await apiClient.parseScript(content);
      setParsedScenes(result.scenes);
      setCharacters(result.characters);
      setEditorMode('preview');
    } catch (error) {
      console.error('解析剧本失败:', error);
      addToast({
        type: 'error',
        title: '解析失败',
        message: '请检查剧本格式后再试。',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;

    try {
      setSaving(true);
      await apiClient.saveScript(projectIdStr, title, content);
      addToast({
        type: 'success',
        title: '保存成功',
      });
      saveToLocalStorage();
    } catch (error) {
      console.error('保存失败:', error);
      addToast({
        type: 'error',
        title: '保存失败',
        message: '请稍后重试。',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    if (!content.trim()) return;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || '剧本'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.script';
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target?.result as string;
          setContent(text);
          if (!title) {
            setTitle(file.name.replace(/\.[^/.]+$/, ''));
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const applyTemplate = (template: string) => {
    setContent(template);
    setShowTemplateMenu(false);
  };

  const handleContinueScript = async () => {
    if (!content.trim() || isContinuing) return;
    
    if (!selectedModel) {
      addToast({
        type: 'warning',
        title: '请选择模型',
        message: '请先选择一个 AI 模型来生成内容。',
      });
      return;
    }

    try {
      setIsContinuing(true);
      const result = await apiClient.continueScript(content);
      setContent(result.content);
      saveToLocalStorage();
    } catch (error) {
      console.error('AI续写失败:', error);
      addToast({
        type: 'error',
        title: 'AI续写失败',
        message: '请稍后重试。',
      });
    } finally {
      setIsContinuing(false);
    }
  };

  const handleRewriteScript = async () => {
    if (!content.trim() || isRewriting) return;
    
    if (!selectedModel) {
      addToast({
        type: 'warning',
        title: '请选择模型',
        message: '请先选择一个 AI 模型来生成内容。',
      });
      return;
    }

    try {
      setIsRewriting(true);
      const result = await apiClient.rewriteScript(content);
      setContent(result.content);
      saveToLocalStorage();
    } catch (error) {
      console.error('AI改写失败:', error);
      addToast({
        type: 'error',
        title: 'AI改写失败',
        message: '请稍后重试。',
      });
    } finally {
      setIsRewriting(false);
    }
  };

  const handleOptimizeScript = async () => {
    if (!content.trim() || isOptimizing) return;
    
    if (!selectedModel) {
      addToast({
        type: 'warning',
        title: '请选择模型',
        message: '请先选择一个 AI 模型来生成内容。',
      });
      return;
    }

    try {
      setIsOptimizing(true);
      const result = await apiClient.rewriteScript(content);
      setContent(result.content);
      saveToLocalStorage();
      addToast({
        type: 'success',
        title: '优化完成',
        message: '剧本已优化',
      });
    } catch (error) {
      console.error('AI优化失败:', error);
      addToast({
        type: 'error',
        title: 'AI优化失败',
        message: '请稍后重试。',
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleParseScenes = async () => {
    if (!content.trim() || isParsingScenes) return;
    
    try {
      setIsParsingScenes(true);
      const result = await apiClient.parseScript(content);
      
      if (result.scenes && result.scenes.length > 0) {
        const scenesWithContent = result.scenes.map((scene: any, index: number) => ({
          id: index + 1,
          original: scene.original || scene.content || '',
          location: scene.location || `场景${index + 1}`,
          time: scene.time || '白天',
          content: scene.content || scene.description || '',
          suggestion: '',
          optimized: '',
          userDirection: '',
          isOptimizing: false,
        }));
        setParsedScenesForOptimization(scenesWithContent);
        setShowSceneOptimizer(true);
      } else {
        addToast({
          type: 'info',
          title: '未检测到场景',
          message: '请确保剧本格式正确，包含场景标记',
        });
      }
    } catch (error) {
      console.error('场景解析失败:', error);
      addToast({
        type: 'error',
        title: '场景解析失败',
        message: '请稍后重试。',
      });
    } finally {
      setIsParsingScenes(false);
    }
  };

  const handleOptimizeScene = async (sceneId: number, direction: string) => {
    const sceneIndex = parsedScenesForOptimization.findIndex(s => s.id === sceneId);
    if (sceneIndex === -1) return;

    const scene = parsedScenesForOptimization[sceneIndex];
    
    setParsedScenesForOptimization(prev => prev.map(s => 
      s.id === sceneId ? { ...s, isOptimizing: true } : s
    ));

    try {
      const result = await apiClient.optimizeScene({
        sceneContent: scene.content,
        location: scene.location,
        time: scene.time,
        direction: direction || '增强场景描述，使画面感更强',
      });

      setParsedScenesForOptimization(prev => prev.map(s => 
        s.id === sceneId ? { 
          ...s, 
          suggestion: result.suggestion || result.optimized,
          optimized: result.optimized || result.suggestion,
          isOptimizing: false 
        } : s
      ));
    } catch (error) {
      console.error('场景优化失败:', error);
      addToast({
        type: 'error',
        title: '场景优化失败',
        message: '请稍后重试。',
      });
      setParsedScenesForOptimization(prev => prev.map(s => 
        s.id === sceneId ? { ...s, isOptimizing: false } : s
      ));
    }
  };

  const handleApplySceneOptimization = (sceneId: number) => {
    const scene = parsedScenesForOptimization.find(s => s.id === sceneId);
    if (!scene || !scene.optimized) return;

    const sceneRegex = new RegExp(
      `(场景\\s*${sceneId}[\\s\\-：:]*[^\\n]*(?:\\n[^场景]*)*)`,
      'gi'
    );
    
    const newContent = content.replace(sceneRegex, scene.optimized);
    setContent(newContent);
    saveToLocalStorage();

    setParsedScenesForOptimization(prev => prev.map(s => 
      s.id === sceneId ? { ...s, original: s.optimized, optimized: '', suggestion: '' } : s
    ));

    addToast({
      type: 'success',
      title: '已应用优化',
      message: `场景 ${sceneId} 已更新`,
    });
  };

  const handleApplyAllOptimizations = () => {
    let newContent = content;
    
    parsedScenesForOptimization.forEach(scene => {
      if (scene.optimized) {
        const sceneRegex = new RegExp(
          `(场景\\s*${scene.id}[\\s\\-：:]*[^\\n]*(?:\\n[^场景]*)*)`,
          'gi'
        );
        newContent = newContent.replace(sceneRegex, scene.optimized);
      }
    });

    setContent(newContent);
    saveToLocalStorage();
    setShowSceneOptimizer(false);

    addToast({
      type: 'success',
      title: '全部应用成功',
      message: '所有场景优化已应用到剧本',
    });
  };

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
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg-base)' }}>
      <header style={{
          height: '80px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(15, 23, 42, 0.8)',
          padding: '0 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <Link
              to={`/projects/${projectId}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 20px',
                borderRadius: '14px',
                textDecoration: 'none',
                color: 'var(--text-muted)',
                transition: 'all 0.25s ease',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.color = 'var(--text-primary)';
              e.currentTarget.style.borderColor = 'var(--accent)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.color = 'var(--text-muted)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            }}
            >
              <ArrowLeft style={{ width: '20px', height: '20px' }} />
            </Link>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <h1 style={{
                fontSize: '28px',
                fontWeight: '800',
                color: 'var(--text-primary)',
                margin: 0,
                letterSpacing: '-0.5px',
                lineHeight: 1.2,
              }}>剧本编辑器</h1>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                {title || '新剧本'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
                title={autoSaveEnabled ? '禁用自动保存' : '启用自动保存'}
                icon={<Settings size={16} />}
              >
                {autoSaveEnabled ? '自动' : '手动'}
              </Button>

              <div style={{ position: 'relative' }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTemplateMenu(!showTemplateMenu)}
                  icon={<Type size={16} />}
                >
                  模板
                  <ChevronDown style={{ width: '14px', height: '14px', marginLeft: '6px', transition: 'transform 0.2s ease', transform: showTemplateMenu ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                </Button>
                {showTemplateMenu && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '8px',
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
                    minWidth: '200px',
                    zIndex: 100,
                    overflow: 'hidden',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                    {SCRIPT_TEMPLATES.map((tmpl, idx) => (
                      <div
                        key={idx}
                        onClick={() => applyTemplate(tmpl.template)}
                        style={{
                          padding: '14px 20px',
                          cursor: 'pointer',
                          borderBottom: idx < SCRIPT_TEMPLATES.length - 1 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                          color: 'var(--text-primary)',
                          fontSize: '14px',
                          transition: 'all 0.15s ease',
                        }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                        {tmpl.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleImport}
                title="导入剧本"
                icon={<Upload size={16} />}
              />

              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                title="导出剧本"
                icon={<FileDown size={16} />}
              />
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={saving || !title || !content}
              loading={saving}
              title="保存剧本"
              icon={saving ? null : <Save size={16} />}
            >
              {saving ? '保存中...' : '保存'}
            </Button>
          </div>
        </header>

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <div style={{
            flex: 1,
            overflowY: 'auto',
            display: editorMode === 'edit' ? 'block' : 'none',
          }}>
            <div style={{
              height: '100%',
              padding: '24px',
            }}>
              <div style={{
                height: 'calc(100vh - 160px)',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: 'rgba(15, 23, 42, 0.7)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
              }}>
                <MonacoEditor
                  height="100%"
                  language="plaintext"
                  theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
                  value={content}
                  onChange={(value) => setContent(value || '')}
                  options={editorOptions}
                  onSave={handleSave}
                />
              </div>

              <div style={{
                height: '48px',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: 'rgba(15, 23, 42, 0.8)',
                padding: '0 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '12px',
                color: 'var(--text-tertiary)',
                fontFamily: 'monospace',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileText style={{ width: '14px', height: '14px' }} />
                    {content.length} 字符
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <LayoutGrid style={{ width: '14px', height: '14px' }} />
                    {content.split('\n').length} 行
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: autoSaveEnabled ? 'var(--success)' : 'var(--text-muted)' }} />
                  <span>{lastSaved ? '已自动保存' : '准备就绪'}</span>
                </div>
              </div>
            </div>
          </div>

          {editorMode === 'preview' && (
            <div style={{
              flex: 1,
              padding: '32px',
              overflowY: 'auto',
            }}>
              <div style={{
                padding: '32px',
                maxWidth: '900px',
                margin: '0 auto',
                borderRadius: '16px',
                backgroundColor: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
              }}>
                <div style={{
                  marginBottom: '32px',
                  paddingBottom: '32px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}>
                  <div>
                    <h2 style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: 'var(--text-primary)',
                      marginBottom: '8px',
                      margin: '0 0 16px 0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}>
                      <FileText style={{ width: '20px', height: '20px', color: 'var(--accent)' }} />
                      剧本统计
                    </h2>
                    <p style={{ fontSize: '14px', color: 'var(--text-tertiary)', margin: 0 }}>
                      剧本解析结果概览
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditorMode('edit')}
                    icon={<FileCode size={14} />}
                  >
                    编辑
                  </Button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '32px' }}>
                  <div style={{
                    padding: '24px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '12px' }}>场景数量</div>
                    <div style={{ fontSize: '36px', fontWeight: '800', color: 'var(--text-primary)' }}>
                      {parsedScenes.length}
                    </div>
                  </div>
                  <div style={{
                    padding: '24px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '12px' }}>角色数量</div>
                    <div style={{ fontSize: '36px', fontWeight: '800', color: 'var(--text-primary)' }}>
                      {characters.length}
                    </div>
                  </div>
                </div>

                {characters.length > 0 && (
                  <div style={{ marginBottom: '32px', paddingBottom: '32px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <h2 style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: 'var(--text-primary)',
                      marginBottom: '20px',
                      margin: '0 0 20px 0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}>
                      <Sparkles style={{ width: '20px', height: '20px', color: 'var(--accent)' }} />
                      角色列表
                    </h2>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                      {characters.map((char) => (
                        <span
                          key={char}
                          style={{
                            padding: '10px 20px',
                            backgroundColor: 'rgba(99, 102, 241, 0.15)',
                            border: '1px solid rgba(99, 102, 241, 0.3)',
                            borderRadius: '24px',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#6366f1',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.25)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.15)';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          {char}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <h2 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: 'var(--text-primary)',
                  marginBottom: '24px',
                  margin: '0 0 24px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}>
                  <Eye style={{ width: '20px', height: '20px', color: 'var(--accent)' }} />
                  场景预览
                </h2>

                {parsedScenes.map((scene) => (
                  <div key={scene.id} style={{
                    marginBottom: '28px',
                    padding: '24px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.2)';
                    e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                      <span style={{
                        padding: '6px 16px',
                        backgroundColor: 'rgba(99, 102, 241, 0.15)',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '700',
                        color: '#6366f1',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}>
                        场景 {scene.id}
                      </span>
                      <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', margin: 0, flex: 1 }}>
                        {scene.description}
                      </h3>
                    </div>

                    {scene.action && (
                      <p style={{
                        fontSize: '14px',
                        color: 'var(--text-tertiary)',
                        fontStyle: 'italic',
                        marginBottom: '16px',
                        margin: '0 0 16px 0',
                        lineHeight: '1.7',
                      }}>
                        （{scene.action}）
                      </p>
                    )}

                    {scene.dialogue && scene.dialogue.map((d, i) => (
                      <div key={i} style={{ marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <span style={{
                            padding: '8px 16px',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: '700',
                            color: 'var(--text-secondary)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                          }}>
                            {d.character}
                          </span>
                        </div>
                        <p style={{
                          fontSize: '15px',
                          color: 'var(--text-primary)',
                          margin: '0 0 16px 16px',
                          lineHeight: '1.8',
                        }}>
                          {d.lines.map((line: string, j: number) => (
                            <span key={j}>{line}<br /></span>
                          ))}
                        </p>
                        {d.action && (
                          <p style={{
                            fontSize: '13px',
                            color: 'var(--text-tertiary)',
                            fontStyle: 'italic',
                            margin: '0 0 16px 16px',
                            lineHeight: '1.7',
                          }}>
                            （{d.action}）
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ))}

                {parsedScenes.length === 0 && content && (
                  <div style={{
                    textAlign: 'center',
                    padding: '64px 32px',
                    color: 'var(--text-tertiary)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '16px',
                    border: '2px dashed rgba(255, 255, 255, 0.1)',
                  }}>
                    <FileText style={{ width: '64px', height: '64px', marginBottom: '20px', display: 'inline-block', opacity: 0.5 }} />
                    <p style={{ fontSize: '16px', marginBottom: '16px' }}>点击"解析"按钮查看剧本预览</p>
                    <Button size="sm" onClick={parseScript} disabled={loading} loading={loading} icon={loading ? null : <Sparkles size={16} />}>
                      {loading ? '解析中...' : '解析剧本'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div style={{
          position: 'fixed',
          bottom: '40px',
          right: '40px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          zIndex: 50,
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            padding: '16px',
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
            minWidth: '240px',
          }}>
            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>AI 剧本助手</div>
              <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>提升创作效率</div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              fullWidth
              onClick={handleContinueScript}
              disabled={isContinuing || isRewriting || isOptimizing || !content.trim()}
              loading={isContinuing}
              icon={isContinuing ? null : <Sparkles size={16} />}
            >
              {isContinuing ? 'AI续写中...' : 'AI续写'}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              fullWidth
              onClick={handleRewriteScript}
              disabled={isContinuing || isRewriting || isOptimizing || !content.trim()}
              loading={isRewriting}
              icon={isRewriting ? null : <Wand2 size={16} />}
            >
              {isRewriting ? 'AI改写中...' : 'AI改写'}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              fullWidth
              onClick={handleOptimizeScript}
              disabled={isContinuing || isRewriting || isOptimizing || !content.trim()}
              loading={isOptimizing}
              icon={isOptimizing ? null : <Zap size={16} />}
            >
              {isOptimizing ? '优化中...' : 'AI优化'}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              fullWidth
              onClick={handleParseScenes}
              disabled={isParsingScenes || !content.trim()}
              loading={isParsingScenes}
              icon={isParsingScenes ? null : <MapPin size={16} />}
            >
              {isParsingScenes ? '解析中...' : '场景解析'}
            </Button>

            <div style={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.1)', margin: '8px 0' }} />

            <div style={{ padding: '8px 0' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
                选择AI模型
              </div>
              <ModelSelector
                contentType="script"
                value={selectedModel}
                onChange={setSelectedModel}
                placeholder="选择剧本生成模型"
                showLastUsed={true}
                showDefault={true}
              />
            </div>

            <div style={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.1)', margin: '8px 0' }} />

            <Button
              variant="ghost"
              size="sm"
              fullWidth
              onClick={parseScript}
              disabled={loading || !content}
              loading={loading}
              icon={loading ? null : <FileSearch size={16} />}
            >
              {loading ? '解析中...' : '解析预览'}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              fullWidth
              onClick={() => setEditorMode(editorMode === 'edit' ? 'preview' : 'edit')}
              icon={editorMode === 'edit' ? <Eye size={16} /> : <FileEdit size={16} />}
            >
              {editorMode === 'edit' ? '预览' : '编辑'}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              fullWidth
              onClick={() => setIsFullscreen(!isFullscreen)}
              icon={isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            >
              {isFullscreen ? '退出全屏' : '全屏编辑'}
            </Button>
          </div>
        </div>

        {showSceneOptimizer && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => setShowSceneOptimizer(false)}
          >
            <div style={{
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              borderRadius: '16px',
              maxWidth: '900px',
              width: '90%',
              maxHeight: '85vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
            onClick={(e) => e.stopPropagation()}
            >
              <div style={{
                padding: '24px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div>
                  <h2 style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: 'var(--text-primary)',
                    margin: '0 0 4px 0',
                  }}>
                    场景优化器
                  </h2>
                  <p style={{
                    fontSize: '14px',
                    color: 'var(--text-muted)',
                    margin: 0,
                  }}>
                    解析到 {parsedScenesForOptimization.length} 个场景，选择优化方向后生成建议
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSceneOptimizer(false)}
                >
                  <X style={{ width: '20px', height: '20px' }} />
                </Button>
              </div>

              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '24px',
              }}>
                {parsedScenesForOptimization.map((scene, index) => (
                  <div key={scene.id} style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '16px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{
                          padding: '4px 12px',
                          backgroundColor: 'rgba(99, 102, 241, 0.15)',
                          color: '#6366f1',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: '600',
                        }}>
                          场景 {scene.id}
                        </span>
                        <span style={{
                          fontSize: '14px',
                          color: 'var(--text-secondary)',
                        }}>
                          {scene.location} · {scene.time}
                        </span>
                      </div>
                    </div>

                    <div style={{
                      padding: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '8px',
                      marginBottom: '16px',
                      fontSize: '14px',
                      color: 'var(--text-secondary)',
                      lineHeight: '1.6',
                      whiteSpace: 'pre-wrap',
                    }}>
                      {scene.content}
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '13px',
                        fontWeight: '500',
                        color: 'var(--text-muted)',
                        marginBottom: '8px',
                      }}>
                        优化方向（可选）
                      </label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="text"
                          placeholder="例如：增加环境细节、强化氛围描写..."
                          value={scene.userDirection || ''}
                          onChange={(e) => {
                            setParsedScenesForOptimization(prev => prev.map(s => 
                              s.id === scene.id ? { ...s, userDirection: e.target.value } : s
                            ));
                          }}
                          style={{
                            flex: 1,
                            padding: '10px 14px',
                            borderRadius: '8px',
                            border: '1px solid var(--border-primary)',
                            backgroundColor: 'var(--bg-surface)',
                            color: 'var(--text-primary)',
                            fontSize: '14px',
                          }}
                        />
                        <Button
                          onClick={() => handleOptimizeScene(scene.id, scene.userDirection || '')}
                          disabled={scene.isOptimizing}
                          style={{
                            padding: '10px 20px',
                            borderRadius: '8px',
                            backgroundColor: 'var(--accent)',
                            color: 'white',
                            fontWeight: 500,
                          }}
                        >
                          {scene.isOptimizing ? (
                            <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                          ) : (
                            <>
                              <Sparkles style={{ width: '16px', height: '16px', marginRight: '6px' }} />
                              生成建议
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {scene.suggestion && (
                      <div style={{
                        padding: '16px',
                        backgroundColor: 'rgba(34, 197, 94, 0.08)',
                        border: '1px solid rgba(34, 197, 94, 0.2)',
                        borderRadius: '8px',
                        marginBottom: '12px',
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '12px',
                        }}>
                          <span style={{
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#22c55e',
                          }}>
                            AI 优化建议
                          </span>
                          <Button
                            size="sm"
                            onClick={() => handleApplySceneOptimization(scene.id)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              backgroundColor: '#22c55e',
                              color: 'white',
                              fontSize: '12px',
                              fontWeight: 500,
                            }}
                          >
                            <Check style={{ width: '14px', height: '14px', marginRight: '4px' }} />
                            采纳
                          </Button>
                        </div>
                        <div style={{
                          fontSize: '14px',
                          color: 'var(--text-primary)',
                          lineHeight: '1.6',
                          whiteSpace: 'pre-wrap',
                        }}>
                          {scene.optimized}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div style={{
                padding: '20px 24px',
                borderTop: '1px solid var(--border-primary)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <span style={{
                  fontSize: '13px',
                  color: 'var(--text-muted)',
                }}>
                  {parsedScenesForOptimization.filter(s => s.optimized).length} / {parsedScenesForOptimization.length} 个场景已优化
                </span>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <Button
                    variant="outline"
                    onClick={() => setShowSceneOptimizer(false)}
                  >
                    取消
                  </Button>
                  <Button
                    onClick={handleApplyAllOptimizations}
                    disabled={parsedScenesForOptimization.filter(s => s.optimized).length === 0}
                    style={{
                      padding: '10px 24px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--accent)',
                      color: 'white',
                      fontWeight: 500,
                    }}
                  >
                    应用全部优化
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
