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
  const { addToast } = useToast();

  const textColor = theme === 'dark' ? '#ffffff' : '#0f172a';
  const mutedTextColor = theme === 'dark' ? '#a1a1aa' : '#64748b';
  const cardBg = theme === 'dark' ? '#18181b' : '#ffffff';
  const borderColor = theme === 'dark' ? '#27272a' : '#e2e8f0';
  const inputBg = theme === 'dark' ? '#09090b' : '#f8fafc';
  const editorTheme = theme === 'dark' ? 'vs-dark' : 'vs-light';

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
      setShowPreview(true);
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

  const editorOptions = {
    fontSize: 14,
    fontFamily: "'Fira Code', 'Consolas', monospace",
    lineNumbers: 'on' as const,
    minimap: { enabled: true },
    wordWrap: 'on' as const,
    automaticLayout: true,
    scrollBeyondLastLine: false,
    formatOnPaste: true,
    tabSize: 2,
    insertSpaces: true,
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: inputBg, display: 'flex' }}>
      <Sidebar />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{
          height: '64px',
          borderBottom: `1px solid ${borderColor}`,
          backgroundColor: cardBg,
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link to={`/projects/${projectId}`} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              borderRadius: '8px',
              textDecoration: 'none',
              color: mutedTextColor,
              transition: 'all 0.2s ease',
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = inputBg;
                e.currentTarget.style.color = textColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = mutedTextColor;
              }}
            >
              <ArrowLeft style={{ width: '16px', height: '16px' }} />
            </Link>
            <Input
              placeholder="剧本标题"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: '320px' }}
            />
            {lastSaved && (
              <span style={{ fontSize: '12px', color: mutedTextColor }}>
                {autoSaveEnabled ? '自动保存' : '上次保存'}: {lastSaved.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleContinueScript}
              disabled={isContinuing || isRewriting || !content.trim()}
              style={{
                height: '38px',
                padding: '0 20px',
                fontSize: '14px',
                fontWeight: '500',
                background: isContinuing || isRewriting || !content.trim() ? 'transparent' : 'var(--accent)',
                color: isContinuing || isRewriting || !content.trim() ? 'var(--text-tertiary)' : 'var(--accent-on)',
                border: '1px solid var(--border-primary)',
                borderRadius: '9px',
                cursor: isContinuing || isRewriting || !content.trim() ? 'not-allowed' : 'pointer',
                boxShadow: 'none',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
              onMouseEnter={(e) => {
                if (!isContinuing && !isRewriting && content.trim()) {
                  e.currentTarget.style.background = 'var(--accent-hover)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isContinuing && !isRewriting && content.trim()) {
                  e.currentTarget.style.background = 'var(--accent)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              {isContinuing ? (
                <>
                  <BrainCircuit style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                  续写中...
                </>
              ) : (
                <>
                  <Plus style={{ width: '16px', height: '16px' }} />
                  AI续写
                </>
              )}
            </button>

            <button
              onClick={handleRewriteScript}
              disabled={isContinuing || isRewriting || !content.trim()}
              style={{
                height: '38px',
                padding: '0 20px',
                fontSize: '14px',
                fontWeight: '500',
                background: isContinuing || isRewriting || !content.trim() ? 'transparent' : 'var(--accent)',
                color: isContinuing || isRewriting || !content.trim() ? 'var(--text-tertiary)' : 'var(--accent-on)',
                border: '1px solid var(--border-primary)',
                borderRadius: '9px',
                cursor: isContinuing || isRewriting || !content.trim() ? 'not-allowed' : 'pointer',
                boxShadow: 'none',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
              onMouseEnter={(e) => {
                if (!isContinuing && !isRewriting && content.trim()) {
                  e.currentTarget.style.background = 'var(--accent-hover)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isContinuing && !isRewriting && content.trim()) {
                  e.currentTarget.style.background = 'var(--accent)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              {isRewriting ? (
                <>
                  <BrainCircuit style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                  改写中...
                </>
              ) : (
                <>
                  <RotateCw style={{ width: '16px', height: '16px' }} />
                  AI改写
                </>
              )}
            </button>

            <div style={{ position: 'relative' }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTemplateMenu(!showTemplateMenu)}
              >
                <Type style={{ width: '14px', height: '14px', marginRight: '8px' }} />
                模板
                <ChevronDown style={{ width: '14px', height: '14px', marginLeft: '4px' }} />
              </Button>
              {showTemplateMenu && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  backgroundColor: cardBg,
                  border: `1px solid ${borderColor}`,
                  borderRadius: '8px',
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
                  minWidth: '180px',
                  zIndex: 10,
                }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {SCRIPT_TEMPLATES.map((tmpl, idx) => (
                    <div
                      key={idx}
                      onClick={() => applyTemplate(tmpl.template)}
                      style={{
                        padding: '12px 16px',
                        cursor: 'pointer',
                        borderBottom: idx < SCRIPT_TEMPLATES.length - 1 ? `1px solid ${borderColor}` : 'none',
                        color: textColor,
                        fontSize: '14px',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = inputBg;
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
              onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
              title={autoSaveEnabled ? '禁用自动保存' : '启用自动保存'}
            >
              <Settings style={{ width: '14px', height: '14px', marginRight: '8px' }} />
              {autoSaveEnabled ? '自动' : '手动'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleImport}
            >
              <Upload style={{ width: '14px', height: '14px', marginRight: '8px' }} />
              导入
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
            >
              <FileDown style={{ width: '14px', height: '14px', marginRight: '8px' }} />
              导出
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={parseScript}
              disabled={loading || !content}
            >
              {loading ? (
                <Loader2 style={{ width: '16px', height: '16px' }} className="animate-spin" />
              ) : (
                <>
                  <Sparkles style={{ width: '14px', height: '14px', marginRight: '8px' }} />
                  解析
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              <Eye style={{ width: '14px', height: '14px', marginRight: '8px' }} />
              {showPreview ? '编辑' : '预览'}
            </Button>

            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving || !title || !content}
            >
              {saving ? (
                <Loader2 style={{ width: '16px', height: '16px' }} className="animate-spin" />
              ) : (
                <>
                  <Save style={{ width: '14px', height: '14px', marginRight: '8px' }} />
                  保存
                </>
              )}
            </Button>
          </div>
        </header>

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <div style={{
            flex: 1,
            overflowY: 'auto',
            display: showPreview ? 'none' : 'block',
          }}>
            <div style={{
              height: '100%',
              padding: '16px',
            }}>
              <div style={{
                height: 'calc(100vh - 140px)',
                borderRadius: '8px',
                overflow: 'hidden',
                border: `1px solid ${borderColor}`,
              }}>
                <MonacoEditor
                  height="100%"
                  language="plaintext"
                  theme={editorTheme}
                  value={content}
                  onChange={(value) => setContent(value || '')}
                  options={editorOptions}
                  onSave={handleSave}
                />
              </div>

              <div style={{
                height: '32px',
                borderTop: `1px solid ${borderColor}`,
                backgroundColor: inputBg,
                padding: '0 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '11px',
                color: mutedTextColor,
                fontFamily: 'monospace',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span>{content.length} 字符</span>
                  <span>{content.split('\n').length} 行</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: autoSaveEnabled ? '#10b981' : '#64748b' }} />
                  {lastSaved ? '已自动保存' : '准备就绪'}
                </div>
              </div>
            </div>
          </div>

          {showPreview && (
            <div style={{
              flex: 1,
              padding: '24px',
              overflowY: 'auto',
            }}>
              <Card style={{ padding: '24px' }}>
                <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: `1px solid ${borderColor}` }}>
                  <h2 style={{ fontSize: '16px', fontWeight: '600', color: textColor, marginBottom: '12px', margin: '0 0 12px 0' }}>
                    剧本统计
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                    <div style={{ padding: '16px', backgroundColor: inputBg, borderRadius: '8px' }}>
                      <div style={{ fontSize: '12px', color: mutedTextColor, marginBottom: '4px' }}>场景数量</div>
                      <div style={{ fontSize: '24px', fontWeight: '700', color: textColor }}>
                        {parsedScenes.length}
                      </div>
                    </div>
                    <div style={{ padding: '16px', backgroundColor: inputBg, borderRadius: '8px' }}>
                      <div style={{ fontSize: '12px', color: mutedTextColor, marginBottom: '4px' }}>角色数量</div>
                      <div style={{ fontSize: '24px', fontWeight: '700', color: textColor }}>
                        {characters.length}
                      </div>
                    </div>
                  </div>
                </div>

                {characters.length > 0 && (
                  <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: `1px solid ${borderColor}` }}>
                    <h2 style={{ fontSize: '16px', fontWeight: '600', color: textColor, marginBottom: '12px', margin: '0 0 12px 0' }}>
                      角色列表
                    </h2>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {characters.map((char) => (
                        <span
                          key={char}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: 'rgba(99, 102, 241, 0.1)',
                            border: '1px solid rgba(99, 102, 241, 0.3)',
                            borderRadius: '20px',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#6366f1',
                          }}
                        >
                          {char}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <h2 style={{ fontSize: '16px', fontWeight: '600', color: textColor, marginBottom: '16px', margin: '0 0 16px 0' }}>
                  场景预览
                </h2>

                {parsedScenes.map((scene) => (
                  <div key={scene.id} style={{ marginBottom: '24px', padding: '20px', backgroundColor: inputBg, borderRadius: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <span style={{
                        padding: '4px 12px',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#6366f1',
                      }}>
                        场景 {scene.id}
                      </span>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', color: textColor, margin: 0 }}>
                        {scene.description}
                      </h3>
                    </div>

                    {scene.action && (
                      <p style={{ fontSize: '14px', color: mutedTextColor, fontStyle: 'italic', marginBottom: '12px', margin: '0 0 12px 0' }}>
                        （{scene.action}）
                      </p>
                    )}

                    {scene.dialogue && scene.dialogue.map((d, i) => (
                      <div key={i} style={{ marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{
                            padding: '4px 12px',
                            backgroundColor: cardBg,
                            borderRadius: '4px',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#64748b',
                          }}>
                            {d.character}
                          </span>
                        </div>
                        <p style={{
                          fontSize: '14px',
                          color: textColor,
                          margin: '0 0 12px 12px',
                          lineHeight: '1.6',
                        }}>
                          {d.lines.map((line: string, j: number) => (
                            <span key={j}>{line}<br /></span>
                          ))}
                        </p>
                        {d.action && (
                          <p style={{
                            fontSize: '13px',
                            color: mutedTextColor,
                            fontStyle: 'italic',
                            margin: '0 0 12px 12px',
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
                    padding: '48px',
                    color: mutedTextColor
                  }}>
                    <FileText style={{ width: '64px', height: '64px', marginBottom: '16px', display: 'inline-block' }} />
                    <p>点击"解析"按钮查看剧本预览</p>
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
