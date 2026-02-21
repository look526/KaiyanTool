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
} from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import MonacoEditor from '../components/MonacoEditor';
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
  const [editorMode, setEditorMode] = useState<'edit' | 'preview'>('edit');
  const [isFullscreen, setIsFullscreen] = useState(false);
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
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)', display: 'flex' }}>
      <Sidebar />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{
          height: '72px',
          borderBottom: '1px solid var(--border-primary)',
          backgroundColor: 'var(--bg-elevated)',
          padding: '0 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <Link
              to={`/projects/${projectId}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 16px',
                borderRadius: '12px',
                textDecoration: 'none',
                color: 'var(--text-secondary)',
                transition: 'all 0.2s ease',
                border: '1px solid transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                e.currentTarget.style.borderColor = 'var(--border-secondary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = 'transparent';
              }}
            >
              <ArrowLeft style={{ width: '18px', height: '18px' }} />
              <span style={{ fontSize: '14px', fontWeight: '500' }}>返回</span>
            </Link>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '8px 16px',
              borderRadius: '12px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-primary)',
            }}>
              <FileCode style={{ width: '18px', height: '18px', color: 'var(--accent)' }} />
              <Input
                placeholder="剧本标题"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{
                  width: '280px',
                  border: 'none',
                  background: 'transparent',
                  fontSize: '15px',
                  padding: '0',
                  outline: 'none',
                }}
              />
            </div>

            {lastSaved && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '20px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-primary)',
                fontSize: '12px',
                color: 'var(--text-tertiary)',
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: autoSaveEnabled ? 'var(--success)' : 'var(--text-muted)',
                }} />
                <span>{autoSaveEnabled ? '自动保存' : '上次保存'}: {lastSaved.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
              title={autoSaveEnabled ? '禁用自动保存' : '启用自动保存'}
              style={{ height: '40px', padding: '0 16px' }}
            >
              <Settings style={{ width: '16px', height: '16px' }} />
              <span style={{ marginLeft: '8px' }}>{autoSaveEnabled ? '自动' : '手动'}</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleImport}
              style={{ height: '40px', padding: '0 16px' }}
            >
              <Upload style={{ width: '16px', height: '16px' }} />
              <span style={{ marginLeft: '8px' }}>导入</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              style={{ height: '40px', padding: '0 16px' }}
            >
              <FileDown style={{ width: '16px', height: '16px' }} />
              <span style={{ marginLeft: '8px' }}>导出</span>
            </Button>

            <div style={{ position: 'relative' }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTemplateMenu(!showTemplateMenu)}
                style={{ height: '40px', padding: '0 16px' }}
              >
                <Type style={{ width: '16px', height: '16px' }} />
                <span style={{ marginLeft: '8px' }}>模板</span>
                <ChevronDown style={{ width: '14px', height: '14px', marginLeft: '6px' }} />
              </Button>
              {showTemplateMenu && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '12px',
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '12px',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                  minWidth: '200px',
                  zIndex: 100,
                  overflow: 'hidden',
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
                        borderBottom: idx < SCRIPT_TEMPLATES.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                        color: 'var(--text-primary)',
                        fontSize: '14px',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
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
              size="sm"
              onClick={handleSave}
              disabled={saving || !title || !content}
              style={{ height: '40px', padding: '0 24px', minWidth: '100px' }}
            >
              {saving ? (
                <>
                  <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                  <span style={{ marginLeft: '8px' }}>保存中...</span>
                </>
              ) : (
                <>
                  <Save style={{ width: '16px', height: '16px' }} />
                  <span style={{ marginLeft: '8px' }}>保存</span>
                </>
              )}
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
                border: '1px solid var(--border-primary)',
                backgroundColor: 'var(--bg-surface)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
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
                borderTop: '1px solid var(--border-primary)',
                backgroundColor: 'var(--bg-elevated)',
                padding: '0 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '12px',
                color: 'var(--text-tertiary)',
                fontFamily: 'monospace',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
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
              <Card style={{ padding: '32px', maxWidth: '900px', margin: '0 auto' }}>
                <div style={{
                  marginBottom: '32px',
                  paddingBottom: '32px',
                  borderBottom: '1px solid var(--border-primary)',
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
                  >
                    <FileCode style={{ width: '14px', height: '14px', marginRight: '8px' }} />
                    编辑
                  </Button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '32px' }}>
                  <div style={{
                    padding: '24px',
                    backgroundColor: 'var(--bg-surface)',
                    borderRadius: '16px',
                    border: '1px solid var(--border-primary)',
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '12px' }}>场景数量</div>
                    <div style={{ fontSize: '36px', fontWeight: '800', color: 'var(--text-primary)' }}>
                      {parsedScenes.length}
                    </div>
                  </div>
                  <div style={{
                    padding: '24px',
                    backgroundColor: 'var(--bg-surface)',
                    borderRadius: '16px',
                    border: '1px solid var(--border-primary)',
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '12px' }}>角色数量</div>
                    <div style={{ fontSize: '36px', fontWeight: '800', color: 'var(--text-primary)' }}>
                      {characters.length}
                    </div>
                  </div>
                </div>

                {characters.length > 0 && (
                  <div style={{ marginBottom: '32px', paddingBottom: '32px', borderBottom: '1px solid var(--border-primary)' }}>
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
                            backgroundColor: 'var(--accent-bg)',
                            border: '1px solid var(--accent-border)',
                            borderRadius: '24px',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: 'var(--accent-text)',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--accent-bg-hover)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--accent-bg)';
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
                    backgroundColor: 'var(--bg-surface)',
                    borderRadius: '16px',
                    border: '1px solid var(--border-primary)',
                    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.04)';
                  }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                      <span style={{
                        padding: '6px 16px',
                        backgroundColor: 'var(--accent-bg)',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '700',
                        color: 'var(--accent-text)',
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
                            backgroundColor: 'var(--bg-elevated)',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: '700',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border-primary)',
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
                    backgroundColor: 'var(--bg-surface)',
                    borderRadius: '16px',
                    border: '2px dashed var(--border-secondary)',
                  }}>
                    <FileText style={{ width: '64px', height: '64px', marginBottom: '20px', display: 'inline-block', opacity: 0.5 }} />
                    <p style={{ fontSize: '16px', marginBottom: '16px' }}>点击"解析"按钮查看剧本预览</p>
                    <Button size="sm" onClick={parseScript} disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                          解析中...
                        </>
                      ) : (
                        <>
                          <Sparkles style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                          解析剧本
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>

        <div style={{
          position: 'fixed',
          bottom: '32px',
          right: '32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          zIndex: 50,
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            padding: '12px',
            backgroundColor: 'var(--bg-elevated)',
            borderRadius: '16px',
            border: '1px solid var(--border-primary)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
          }}>
            <Button
              size="sm"
              onClick={handleContinueScript}
              disabled={isContinuing || isRewriting || isOptimizing || !content.trim()}
              style={{ width: '100%', justifyContent: 'flex-start' }}
            >
              {isContinuing ? (
                <>
                  <BrainCircuit style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                  <span style={{ marginLeft: '8px' }}>AI续写中...</span>
                </>
              ) : (
                <>
                  <Plus style={{ width: '16px', height: '16px' }} />
                  <span style={{ marginLeft: '8px' }}>AI续写</span>
                </>
              )}
            </Button>

            <Button
              size="sm"
              onClick={handleRewriteScript}
              disabled={isContinuing || isRewriting || isOptimizing || !content.trim()}
              style={{ width: '100%', justifyContent: 'flex-start' }}
            >
              {isRewriting ? (
                <>
                  <BrainCircuit style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                  <span style={{ marginLeft: '8px' }}>AI改写中...</span>
                </>
              ) : (
                <>
                  <RotateCw style={{ width: '16px', height: '16px' }} />
                  <span style={{ marginLeft: '8px' }}>AI改写</span>
                </>
              )}
            </Button>

            <Button
              size="sm"
              onClick={handleOptimizeScript}
              disabled={isContinuing || isRewriting || isOptimizing || !content.trim()}
              style={{ width: '100%', justifyContent: 'flex-start' }}
            >
              {isOptimizing ? (
                <>
                  <BrainCircuit style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                  <span style={{ marginLeft: '8px' }}>优化中...</span>
                </>
              ) : (
                <>
                  <Wand2 style={{ width: '16px', height: '16px' }} />
                  <span style={{ marginLeft: '8px' }}>AI优化</span>
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={parseScript}
              disabled={loading || !content}
              style={{ width: '100%', justifyContent: 'flex-start' }}
            >
              {loading ? (
                <>
                  <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                  <span style={{ marginLeft: '8px' }}>解析中...</span>
                </>
              ) : (
                <>
                  <Sparkles style={{ width: '16px', height: '16px' }} />
                  <span style={{ marginLeft: '8px' }}>解析预览</span>
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditorMode(editorMode === 'edit' ? 'preview' : 'edit')}
              style={{ width: '100%', justifyContent: 'flex-start' }}
            >
              {editorMode === 'edit' ? (
                <>
                  <Eye style={{ width: '16px', height: '16px' }} />
                  <span style={{ marginLeft: '8px' }}>预览</span>
                </>
              ) : (
                <>
                  <FileCode style={{ width: '16px', height: '16px' }} />
                  <span style={{ marginLeft: '8px' }}>编辑</span>
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              style={{ width: '100%', justifyContent: 'flex-start' }}
            >
              {isFullscreen ? (
                <>
                  <Minimize2 style={{ width: '16px', height: '16px' }} />
                  <span style={{ marginLeft: '8px' }}>退出全屏</span>
                </>
              ) : (
                <>
                  <Maximize2 style={{ width: '16px', height: '16px' }} />
                  <span style={{ marginLeft: '8px' }}>全屏编辑</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
