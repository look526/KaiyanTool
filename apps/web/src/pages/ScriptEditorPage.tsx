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
  Wand2,
  Play,
  Clock,
  Users,
  ChevronRight,
} from 'lucide-react';
import { Button } from '../components/ui/button-new';
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
    icon: '📝',
    template: `场景1 - 室内，白天

主角A：你好，这是一段对话。
主角B：你好！
(action)

场景2 - 室外，夜晚

主角A：这里是第二个场景。
(night scene)`,
  },
  {
    name: '电影剧本',
    icon: '🎬',
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
  const [showAIPanel, setShowAIPanel] = useState(true);
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
      addToast({ type: 'error', title: '解析失败', message: '请检查剧本格式后再试。' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;
    try {
      setSaving(true);
      await apiClient.saveScript(projectIdStr, title, content);
      addToast({ type: 'success', title: '保存成功' });
      saveToLocalStorage();
    } catch (error) {
      console.error('保存失败:', error);
      addToast({ type: 'error', title: '保存失败', message: '请稍后重试。' });
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
      addToast({ type: 'warning', title: '请选择模型', message: '请先选择一个 AI 模型来生成内容。' });
      return;
    }
    try {
      setIsContinuing(true);
      const result = await apiClient.continueScript(content);
      setContent(result.content);
      saveToLocalStorage();
    } catch (error) {
      console.error('AI续写失败:', error);
      addToast({ type: 'error', title: 'AI续写失败', message: '请稍后重试。' });
    } finally {
      setIsContinuing(false);
    }
  };

  const handleRewriteScript = async () => {
    if (!content.trim() || isRewriting) return;
    if (!selectedModel) {
      addToast({ type: 'warning', title: '请选择模型', message: '请先选择一个 AI 模型来生成内容。' });
      return;
    }
    try {
      setIsRewriting(true);
      const result = await apiClient.rewriteScript(content);
      setContent(result.content);
      saveToLocalStorage();
    } catch (error) {
      console.error('AI改写失败:', error);
      addToast({ type: 'error', title: 'AI改写失败', message: '请稍后重试。' });
    } finally {
      setIsRewriting(false);
    }
  };

  const handleOptimizeScript = async () => {
    if (!content.trim() || isOptimizing) return;
    if (!selectedModel) {
      addToast({ type: 'warning', title: '请选择模型', message: '请先选择一个 AI 模型来生成内容。' });
      return;
    }
    try {
      setIsOptimizing(true);
      const result = await apiClient.rewriteScript(content);
      setContent(result.content);
      saveToLocalStorage();
      addToast({ type: 'success', title: '优化完成', message: '剧本已优化' });
    } catch (error) {
      console.error('AI优化失败:', error);
      addToast({ type: 'error', title: 'AI优化失败', message: '请稍后重试。' });
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
        addToast({ type: 'info', title: '未检测到场景', message: '请确保剧本格式正确，包含场景标记' });
      }
    } catch (error) {
      console.error('场景解析失败:', error);
      addToast({ type: 'error', title: '场景解析失败', message: '请稍后重试。' });
    } finally {
      setIsParsingScenes(false);
    }
  };

  const handleOptimizeScene = async (sceneId: number, direction: string) => {
    const sceneIndex = parsedScenesForOptimization.findIndex(s => s.id === sceneId);
    if (sceneIndex === -1) return;
    const scene = parsedScenesForOptimization[sceneIndex];
    setParsedScenesForOptimization(prev => prev.map(s => s.id === sceneId ? { ...s, isOptimizing: true } : s));
    try {
      const result = await apiClient.optimizeScene({
        sceneContent: scene.content,
        location: scene.location,
        time: scene.time,
        direction: direction || '增强场景描述，使画面感更强',
      });
      setParsedScenesForOptimization(prev => prev.map(s => s.id === sceneId ? { ...s, suggestion: result.suggestion || result.optimized, optimized: result.optimized || result.suggestion, isOptimizing: false } : s));
    } catch (error) {
      console.error('场景优化失败:', error);
      addToast({ type: 'error', title: '场景优化失败', message: '请稍后重试。' });
      setParsedScenesForOptimization(prev => prev.map(s => s.id === sceneId ? { ...s, isOptimizing: false } : s));
    }
  };

  const handleApplySceneOptimization = (sceneId: number) => {
    const scene = parsedScenesForOptimization.find(s => s.id === sceneId);
    if (!scene || !scene.optimized) return;
    const sceneRegex = new RegExp(`(场景\\s*${sceneId}[\\s\\-：:]*[^\\n]*(?:\\n[^场景]*)*)`, 'gi');
    const newContent = content.replace(sceneRegex, scene.optimized);
    setContent(newContent);
    saveToLocalStorage();
    setParsedScenesForOptimization(prev => prev.map(s => s.id === sceneId ? { ...s, original: s.optimized || s.original || '', optimized: '', suggestion: '' } : s));
    addToast({ type: 'success', title: '已应用优化', message: `场景 ${sceneId} 已更新` });
  };

  const handleApplyAllOptimizations = () => {
    let newContent = content;
    parsedScenesForOptimization.forEach(scene => {
      if (scene.optimized) {
        const sceneRegex = new RegExp(`(场景\\s*${scene.id}[\\s\\-：:]*[^\\n]*(?:\\n[^场景]*)*)`, 'gi');
        newContent = newContent.replace(sceneRegex, scene.optimized);
      }
    });
    setContent(newContent);
    saveToLocalStorage();
    setShowSceneOptimizer(false);
    addToast({ type: 'success', title: '全部应用成功', message: '所有场景优化已应用到剧本' });
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

  const aiTools = [
    { id: 'continue', label: 'AI续写', icon: Sparkles, color: '#007AFF', handler: handleContinueScript, loading: isContinuing, disabled: isContinuing || isRewriting || isOptimizing || !content.trim() },
    { id: 'rewrite', label: 'AI改写', icon: Wand2, color: '#10b981', handler: handleRewriteScript, loading: isRewriting, disabled: isContinuing || isRewriting || isOptimizing || !content.trim() },
    { id: 'optimize', label: 'AI优化', icon: Zap, color: '#f59e0b', handler: handleOptimizeScript, loading: isOptimizing, disabled: isContinuing || isRewriting || isOptimizing || !content.trim() },
    { id: 'parse', label: '场景解析', icon: MapPin, color: '#ec4899', handler: handleParseScenes, loading: isParsingScenes, disabled: isParsingScenes || !content.trim() },
  ];

  return (
    <div style={{ 
      flex: 1, 
      display: 'flex', 
      flexDirection: 'column', 
      overflow: 'hidden', 
      background: 'var(--bg-page)',
      minHeight: '100vh',
    }}>
      <header style={{
        height: '64px',
        backgroundColor: 'var(--bg-header)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-primary)',
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link 
            to={`/projects/${projectId}`} 
            style={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              textDecoration: 'none',
              color: 'rgba(255,255,255,0.6)',
              transition: 'all 0.2s ease',
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.transform = 'translateX(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
            <ArrowLeft style={{ width: '18px', height: '18px' }} />
          </Link>
          <div>
            <h1 style={{ fontSize: '16px', fontWeight: '600', color: 'white', margin: 0 }}>剧本编辑器</h1>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>{title || '未命名剧本'}</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: autoSaveEnabled ? 'rgba(0, 122, 255, 0.2)' : 'rgba(255,255,255,0.05)',
              color: autoSaveEnabled ? '#007AFF' : 'rgba(255,255,255,0.6)',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <Clock style={{ width: '14px', height: '14px' }} />
            {autoSaveEnabled ? '自动保存' : '手动保存'}
          </button>

          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowTemplateMenu(!showTemplateMenu)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.05)',
                color: 'rgba(255,255,255,0.8)',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <Type style={{ width: '14px', height: '14px' }} />
              模板
              <ChevronDown style={{ width: '12px', height: '12px', transform: showTemplateMenu ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
            </button>
            {showTemplateMenu && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '8px',
                background: 'rgba(30, 41, 59, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '14px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                minWidth: '200px',
                zIndex: 100,
                overflow: 'hidden',
              }} onClick={(e) => e.stopPropagation()}>
                {SCRIPT_TEMPLATES.map((tmpl, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => applyTemplate(tmpl.template)} 
                    style={{
                      padding: '14px 18px',
                      cursor: 'pointer',
                      borderBottom: idx < SCRIPT_TEMPLATES.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                      color: 'white',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      transition: 'background-color 0.2s ease',
                    }} 
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; }} 
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <span style={{ fontSize: '18px' }}>{tmpl.icon}</span>
                    {tmpl.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleImport}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.05)',
              color: 'rgba(255,255,255,0.6)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
            }}
          >
            <Upload style={{ width: '16px', height: '16px' }} />
          </button>

          <button
            onClick={handleExport}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.05)',
              color: 'rgba(255,255,255,0.6)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
            }}
          >
            <FileDown style={{ width: '16px', height: '16px' }} />
          </button>

          <Button 
            variant="primary" 
            size="sm" 
            onClick={handleSave} 
            disabled={saving || !title || !content} 
            loading={saving} 
            icon={saving ? null : <Save size={16} />}
          >
            {saving ? '保存中...' : '保存'}
          </Button>
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <div style={{ flex: 1, overflowY: 'auto', display: editorMode === 'edit' ? 'block' : 'none' }}>
          <div style={{ height: '100%', padding: '16px', paddingRight: showAIPanel ? '280px' : '16px', transition: 'padding-right 0.3s ease' }}>
            <div style={{
              height: 'calc(100vh - 112px)',
              borderRadius: '16px',
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(15, 23, 42, 0.6)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
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
              height: '32px',
              marginTop: '8px',
              padding: '0 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '11px',
              color: 'rgba(255,255,255,0.4)',
              fontFamily: 'monospace',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FileText style={{ width: '10px', height: '10px' }} />
                  {content.length} 字符
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <LayoutGrid style={{ width: '10px', height: '10px' }} />
                  {content.split('\n').length} 行
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ 
                  width: '6px', 
                  height: '6px', 
                  borderRadius: '50%', 
                  backgroundColor: autoSaveEnabled ? '#10b981' : 'rgba(255,255,255,0.3)',
                  boxShadow: autoSaveEnabled ? '0 0 8px rgba(16, 185, 129, 0.5)' : 'none',
                }} />
                <span>{lastSaved ? `已保存 ${lastSaved.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}` : '准备就绪'}</span>
              </div>
            </div>
          </div>
        </div>

        {editorMode === 'preview' && (
          <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
            <div style={{ 
              padding: '28px', 
              maxWidth: '900px', 
              margin: '0 auto', 
              borderRadius: '20px', 
              background: 'rgba(30, 41, 59, 0.6)', 
              border: '1px solid rgba(255,255,255,0.1)', 
              backdropFilter: 'blur(20px)',
            }}>
              <div style={{ marginBottom: '28px', paddingBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'white', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #007AFF 0%, #0056CC 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <FileText style={{ width: '16px', height: '16px', color: 'white' }} />
                    </div>
                    剧本统计
                  </h2>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>剧本解析结果概览</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setEditorMode('edit')} icon={<FileCode style={{ width: '14px', height: '14px' }} />}>编辑</Button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '28px' }}>
                <div style={{ 
                  padding: '20px', 
                  background: 'rgba(255,255,255,0.03)', 
                  borderRadius: '16px', 
                  textAlign: 'center',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>场景数量</div>
                  <div style={{ fontSize: '36px', fontWeight: '700', color: 'white' }}>{parsedScenes.length}</div>
                </div>
                <div style={{ 
                  padding: '20px', 
                  background: 'rgba(255,255,255,0.03)', 
                  borderRadius: '16px', 
                  textAlign: 'center',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>角色数量</div>
                  <div style={{ fontSize: '36px', fontWeight: '700', color: 'white' }}>{characters.length}</div>
                </div>
              </div>

              {characters.length > 0 && (
                <div style={{ marginBottom: '28px', paddingBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'white', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Users style={{ width: '14px', height: '14px', color: 'white' }} />
                    </div>
                    角色列表
                  </h2>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {characters.map((char) => (
                      <span 
                        key={char} 
                        style={{
                          padding: '8px 16px',
                          background: 'rgba(0, 122, 255, 0.15)',
                          border: '1px solid rgba(0, 122, 255, 0.3)',
                          borderRadius: '20px',
                          fontSize: '13px',
                          fontWeight: '500',
                          color: '#60a5fa',
                          transition: 'all 0.2s ease',
                          cursor: 'pointer',
                        }} 
                        onMouseEnter={(e) => { 
                          e.currentTarget.style.transform = 'translateY(-2px)'; 
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 122, 255, 0.3)';
                        }} 
                        onMouseLeave={(e) => { 
                          e.currentTarget.style.transform = 'translateY(0)'; 
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        {char}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'white', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Eye style={{ width: '14px', height: '14px', color: 'white' }} />
                </div>
                场景预览
              </h2>

              {parsedScenes.map((scene) => (
                <div 
                  key={scene.id} 
                  style={{
                    marginBottom: '16px',
                    padding: '20px',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                  }} 
                  onMouseEnter={(e) => { 
                    e.currentTarget.style.transform = 'translateY(-2px)'; 
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)'; 
                    e.currentTarget.style.borderColor = 'rgba(0, 122, 255, 0.3)'; 
                  }} 
                  onMouseLeave={(e) => { 
                    e.currentTarget.style.transform = 'translateY(0)'; 
                    e.currentTarget.style.boxShadow = 'none'; 
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; 
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <span style={{ 
                      padding: '4px 10px', 
                      background: 'linear-gradient(135deg, #007AFF 0%, #0056CC 100%)', 
                      borderRadius: '8px', 
                      fontSize: '11px', 
                      fontWeight: '600', 
                      color: 'white' 
                    }}>场景 {scene.id}</span>
                    <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'white', margin: 0, flex: 1 }}>{scene.description}</h3>
                  </div>
                  {scene.action && <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', marginBottom: '12px', lineHeight: '1.6' }}>({scene.action})</p>}
                  {scene.dialogue && scene.dialogue.map((d, i) => (
                    <div key={i} style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}>{d.character}</span>
                      </div>
                      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', margin: '0 0 8px 16px', lineHeight: '1.6' }}>
                        {d.lines.map((line: string, j: number) => (<span key={j}>{line}<br /></span>))}
                      </p>
                      {d.action && <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', margin: '0 0 8px 16px', lineHeight: '1.6' }}>({d.action})</p>}
                    </div>
                  ))}
                </div>
              ))}

              {parsedScenes.length === 0 && content && (
                <div style={{ textAlign: 'center', padding: '48px', color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '2px dashed rgba(255,255,255,0.1)' }}>
                  <FileText style={{ width: '48px', height: '48px', marginBottom: '16px', opacity: 0.5 }} />
                  <p style={{ fontSize: '14px', marginBottom: '16px' }}>点击"解析"按钮查看剧本预览</p>
                  <Button size="sm" onClick={parseScript} disabled={loading} loading={loading} icon={loading ? null : <Sparkles style={{ width: '16px', height: '16px' }} />}>{loading ? '解析中...' : '解析剧本'}</Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

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
        <button
          onClick={() => setShowAIPanel(!showAIPanel)}
          style={{
            position: 'absolute',
            left: '-36px',
            top: '0',
            width: '32px',
            height: '32px',
            borderRadius: '10px 0 0 10px',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRight: 'none',
            background: 'rgba(30, 41, 59, 0.9)',
            backdropFilter: 'blur(20px)',
            color: 'rgba(255,255,255,0.6)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0, 122, 255, 0.2)';
            e.currentTarget.style.color = '#007AFF';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(30, 41, 59, 0.9)';
            e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
          }}
        >
          <ChevronRight style={{ width: '16px', height: '16px', transform: showAIPanel ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }} />
        </button>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          padding: '20px',
          background: 'rgba(30, 41, 59, 0.9)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '8px' }}>
            <div style={{ 
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #007AFF 0%, #0056CC 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 10px',
              boxShadow: '0 4px 14px rgba(0, 122, 255, 0.3)',
            }}>
              <Sparkles style={{ width: '20px', height: '20px', color: 'white' }} />
            </div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: 'white', marginBottom: '4px' }}>AI 剧本助手</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>提升创作效率</div>
          </div>

          {aiTools.map((tool) => (
            <button
              key={tool.id}
              onClick={tool.handler}
              disabled={tool.disabled || tool.loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 14px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.03)',
                color: tool.disabled ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.8)',
                fontSize: '13px',
                fontWeight: '500',
                cursor: tool.disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                width: '100%',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                if (!tool.disabled) {
                  e.currentTarget.style.background = `rgba(${tool.color === '#007AFF' ? '0, 122, 255' : tool.color === '#10b981' ? '16, 185, 129' : tool.color === '#f59e0b' ? '245, 158, 11' : '236, 72, 153'}, 0.15)`;
                  e.currentTarget.style.borderColor = `${tool.color}40`;
                  e.currentTarget.style.color = tool.color;
                }
              }}
              onMouseLeave={(e) => {
                if (!tool.disabled) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
                }
              }}
            >
              {tool.loading ? (
                <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
              ) : (
                <tool.icon style={{ width: '16px', height: '16px' }} />
              )}
              {tool.loading ? `${tool.label}中...` : tool.label}
            </button>
          ))}

          <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '4px 0' }} />

          <div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>选择AI模型</div>
            <ModelSelector contentType="script" value={selectedModel} onChange={setSelectedModel} placeholder="选择模型" showLastUsed={true} showDefault={true} />
          </div>

          <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '4px 0' }} />

          <button
            onClick={parseScript}
            disabled={loading || !content}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 14px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.03)',
              color: (loading || !content) ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.8)',
              fontSize: '13px',
              fontWeight: '500',
              cursor: (loading || !content) ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              width: '100%',
              textAlign: 'left',
            }}
            onMouseEnter={(e) => {
              if (!loading && content) {
                e.currentTarget.style.background = 'rgba(139, 92, 246, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.4)';
                e.currentTarget.style.color = '#a78bfa';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && content) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
              }
            }}
          >
            {loading ? (
              <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
            ) : (
              <FileSearch style={{ width: '16px', height: '16px' }} />
            )}
            {loading ? '解析中...' : '解析预览'}
          </button>

          <button
            onClick={() => setEditorMode(editorMode === 'edit' ? 'preview' : 'edit')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 14px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.03)',
              color: 'rgba(255,255,255,0.8)',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              width: '100%',
              textAlign: 'left',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
            }}
          >
            {editorMode === 'edit' ? <Eye style={{ width: '16px', height: '16px' }} /> : <FileEdit style={{ width: '16px', height: '16px' }} />}
            {editorMode === 'edit' ? '预览模式' : '编辑模式'}
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 14px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.03)',
              color: 'rgba(255,255,255,0.8)',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              width: '100%',
              textAlign: 'left',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
            }}
          >
            {isFullscreen ? <Minimize2 style={{ width: '16px', height: '16px' }} /> : <Maximize2 style={{ width: '16px', height: '16px' }} />}
            {isFullscreen ? '退出全屏' : '全屏编辑'}
          </button>
        </div>
      </div>

      {showSceneOptimizer && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          backgroundColor: 'rgba(0, 0, 0, 0.7)', 
          backdropFilter: 'blur(8px)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 1000,
          padding: '20px',
        }} onClick={() => setShowSceneOptimizer(false)}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)',
            borderRadius: '24px',
            maxWidth: '900px',
            width: '100%',
            maxHeight: '85vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.1)',
            animation: 'modalIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ 
              padding: '24px', 
              borderBottom: '1px solid rgba(255,255,255,0.1)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              background: 'rgba(255,255,255,0.02)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(236, 72, 153, 0.3)',
                }}>
                  <MapPin style={{ width: '22px', height: '22px', color: 'white' }} />
                </div>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'white', margin: '0 0 4px 0' }}>场景优化器</h2>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>解析到 {parsedScenesForOptimization.length} 个场景，选择优化方向后生成建议</p>
                </div>
              </div>
              <button
                onClick={() => setShowSceneOptimizer(false)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'rgba(255,255,255,0.6)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                  e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                  e.currentTarget.style.color = '#ef4444';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                }}
              >
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
              {parsedScenesForOptimization.map((scene) => (
                <div 
                  key={scene.id} 
                  style={{ 
                    background: 'rgba(255,255,255,0.03)', 
                    borderRadius: '16px', 
                    padding: '20px', 
                    marginBottom: '16px', 
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ 
                        padding: '4px 12px', 
                        background: 'linear-gradient(135deg, #007AFF 0%, #0056CC 100%)', 
                        color: 'white', 
                        borderRadius: '8px', 
                        fontSize: '12px', 
                        fontWeight: '600',
                        boxShadow: '0 2px 8px rgba(0, 122, 255, 0.3)',
                      }}>场景 {scene.id}</span>
                      <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>{scene.location} · {scene.time}</span>
                    </div>
                  </div>

                  <div style={{ 
                    padding: '14px', 
                    background: 'rgba(255,255,255,0.02)', 
                    borderRadius: '12px', 
                    marginBottom: '16px', 
                    fontSize: '13px', 
                    color: 'rgba(255,255,255,0.7)', 
                    lineHeight: '1.7', 
                    whiteSpace: 'pre-wrap',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}>
                    {scene.content}
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>优化方向 (可选)</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input 
                        type="text" 
                        placeholder="例如：增加环境细节、强化氛围描写..." 
                        value={scene.userDirection || ''} 
                        onChange={(e) => { setParsedScenesForOptimization(prev => prev.map(s => s.id === scene.id ? { ...s, userDirection: e.target.value } : s)); }} 
                        style={{
                          flex: 1,
                          padding: '12px 16px',
                          borderRadius: '12px',
                          border: '1px solid rgba(255,255,255,0.1)',
                          background: 'rgba(255,255,255,0.03)',
                          color: 'white',
                          fontSize: '13px',
                          outline: 'none',
                          transition: 'all 0.2s ease',
                        }} 
                        onFocus={(e) => { 
                          e.currentTarget.style.borderColor = 'rgba(0, 122, 255, 0.5)'; 
                          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 122, 255, 0.1)'; 
                        }} 
                        onBlur={(e) => { 
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; 
                          e.currentTarget.style.boxShadow = 'none'; 
                        }} 
                      />
                      <Button 
                        variant="primary" 
                        size="sm" 
                        onClick={() => handleOptimizeScene(scene.id, scene.userDirection || '')} 
                        disabled={scene.isOptimizing} 
                        loading={scene.isOptimizing} 
                        icon={scene.isOptimizing ? null : <Sparkles style={{ width: '16px', height: '16px' }} />}
                      >
                        生成建议
                      </Button>
                    </div>
                  </div>

                  {scene.suggestion && (
                    <div style={{ 
                      padding: '16px', 
                      background: 'rgba(16, 185, 129, 0.1)', 
                      border: '1px solid rgba(16, 185, 129, 0.3)', 
                      borderRadius: '12px', 
                      marginBottom: '12px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Check style={{ width: '14px', height: '14px' }} />
                          AI 优化建议
                        </span>
                        <Button variant="success" size="sm" onClick={() => handleApplySceneOptimization(scene.id)} icon={<Check style={{ width: '14px', height: '14px' }} />}>采纳</Button>
                      </div>
                      <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>{scene.optimized}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ 
              padding: '16px 24px', 
              borderTop: '1px solid rgba(255,255,255,0.1)', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              background: 'rgba(255,255,255,0.02)',
            }}>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                {parsedScenesForOptimization.filter(s => s.optimized).length} / {parsedScenesForOptimization.length} 个场景已优化
              </span>
              <div style={{ display: 'flex', gap: '12px' }}>
                <Button variant="outline" size="md" onClick={() => setShowSceneOptimizer(false)}>取消</Button>
                <Button variant="primary" size="md" onClick={handleApplyAllOptimizations} disabled={parsedScenesForOptimization.filter(s => s.optimized).length === 0}>应用全部优化</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes modalIn {
            from {
              opacity: 0;
              transform: scale(0.95) translateY(10px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}
