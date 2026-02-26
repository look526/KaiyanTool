import { useState, useEffect } from 'react';
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
  ChevronDown,
  LayoutGrid,
  Maximize2,
  Minimize2,
  Zap,
  FileSearch,
  FileEdit,
  MapPin,
  X,
  Check,
  Wand2,
  Clock,
  ChevronRight,
  BookOpen,
  FileCode,
} from 'lucide-react';
import { Button } from '../components/ui/button-new';
import MonacoEditor from '../components/MonacoEditor';
import { ModelSelector } from '../components/ui';
import { apiClient } from '../lib/api';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../components/ui/Toast';
import { ContentProvider, useContent, ContentMode } from '../contexts/ContentContext';

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

function UnifiedEditorContent() {
  const { projectId } = useParams<{ projectId: string }>();
  const projectIdStr = projectId || '';
  const { theme } = useTheme();
  const {
    mode,
    setMode,
    scriptContent,
    setScriptContent,
    scriptTitle,
    setScriptTitle,
    selectedChapterId,
    setSelectedChapterId,
    lastSaved,
    setLastSaved,
    autoSaveEnabled,
    setAutoSaveEnabled,
    isSaving,
    setIsSaving,
    saveToLocalStorage,
    loadFromLocalStorage,
  } = useContent();

  const [parsedScenes, setParsedScenes] = useState<Scene[]>([]);
  const [characters, setCharacters] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showTemplateMenu, setShowTemplateMenu] = useState(false);
  const [isContinuing, setIsContinuing] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isParsingScenes, setIsParsingScenes] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [showSceneOptimizer, setShowSceneOptimizer] = useState(false);
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [showNovelToScriptDialog, setShowNovelToScriptDialog] = useState(false);
  const [novelFile, setNovelFile] = useState<File | null>(null);
  const [novelText, setNovelText] = useState('');
  const [scriptOptions, setScriptOptions] = useState({
    episodes: 12,
    durationPerEpisode: 45,
    genre: 'short_drama' as 'short_drama' | 'tv_series' | 'movie' | 'web_series',
    targetAudience: 'general' as 'children' | 'teen' | 'adult' | 'general',
    tone: 'drama' as 'comedy' | 'tragedy' | 'action' | 'romance' | 'suspense' | 'drama' | 'sci_fi' | 'horror',
    focus: 'plot' as 'plot' | 'dialogue' | 'emotion' | 'action',
    keepNarrator: true,
    dialogueStyle: 'natural' as 'natural' | 'classical' | 'modern',
    includeShotList: false,
    endingType: 'closed' as 'closed' | 'open' | 'happy' | 'sad',
    customPrompt: '',
    enableCustomPrompt: false,
  });
  const [conversionResult, setConversionResult] = useState<string>('');
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

  const title = scriptTitle;
  const setTitle = setScriptTitle;
  const content = scriptContent;
  const setContent = setScriptContent;

  useEffect(() => {
    loadFromLocalStorage(mode);
  }, [mode, loadFromLocalStorage]);

  useEffect(() => {
    if (!autoSaveEnabled) return;
    const timer = setTimeout(() => {
      if (title || content) {
        saveToLocalStorage(mode);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [title, content, autoSaveEnabled, mode, saveToLocalStorage]);

  const handleModeChange = (newMode: ContentMode) => {
    setMode(newMode);
  };

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
      setIsSaving(true);
      await apiClient.saveScript(projectIdStr, title, content);
      saveToLocalStorage(mode);
      addToast({ type: 'success', title: '保存成功' });
    } catch (error) {
      console.error('保存失败:', error);
      addToast({ type: 'error', title: '保存失败', message: '请稍后重试。' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = () => {
    if (!content.trim()) return;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || mode === 'script' ? '剧本' : '小说'}.txt`;
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
      const result = await apiClient.continueScript(content, selectedModel);
      setContent(result.content);
      saveToLocalStorage(mode);
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
      const result = await apiClient.rewriteScript(content, selectedModel);
      setContent(result.content);
      saveToLocalStorage(mode);
    } catch (error: any) {
      console.error('AI改写失败:', error);
      const errorMsg = error?.response?.data?.error || error?.message || '请稍后重试';
      addToast({ type: 'error', title: 'AI改写失败', message: errorMsg });
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
      const result = await apiClient.rewriteScript(content, selectedModel);
      setContent(result.content);
      saveToLocalStorage(mode);
      addToast({ type: 'success', title: '优化完成', message: mode === 'script' ? '剧本已优化' : '小说已优化' });
    } catch (error: any) {
      console.error('AI优化失败:', error);
      const errorMsg = error?.response?.data?.error || error?.message || '请稍后重试';
      addToast({ type: 'error', title: 'AI优化失败', message: errorMsg });
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

  const handleNovelToScript = async () => {
    const sourceText = novelText || content;
    if (!sourceText.trim() || isConverting) return;

    setShowNovelToScriptDialog(false);
    
    try {
      setIsConverting(true);
      addToast({ type: 'info', title: '正在转换', message: `正在将小说转换为${scriptOptions.episodes}集剧本，每集${scriptOptions.durationPerEpisode}分钟...` });
      
      const result = await apiClient.adaptToScript({
        title: title || '未命名',
        content: sourceText,
        chapters: [],
      }, { 
        model: selectedModel,
        targetLength: scriptOptions.episodes * scriptOptions.durationPerEpisode,
        genre: scriptOptions.genre,
        targetAudience: scriptOptions.targetAudience,
        tone: scriptOptions.tone,
        focus: scriptOptions.focus,
        keepNarrator: scriptOptions.keepNarrator,
        dialogueStyle: scriptOptions.dialogueStyle,
        includeShotList: scriptOptions.includeShotList,
        endingType: scriptOptions.endingType,
        customPrompt: scriptOptions.enableCustomPrompt ? scriptOptions.customPrompt : undefined,
      });
      
      const scriptContent = result.script || result.content || '';
      
      if (scriptContent.length > 50000) {
        setConversionResult(scriptContent);
        setShowDownloadDialog(true);
        addToast({ type: 'info', title: '结果较长', message: '转换结果已生成，您可以下载文件或在编辑器中查看' });
      } else {
        setContent(scriptContent);
        saveToLocalStorage(mode);
        addToast({ type: 'success', title: '转换成功', message: `小说已成功转换为${scriptOptions.episodes}集剧本格式` });
      }
      
      setNovelFile(null);
      setNovelText('');
    } catch (error) {
      console.error('小说转换失败:', error);
      addToast({ type: 'error', title: '转换失败', message: '转换过程中出现错误，请稍后重试' });
    } finally {
      setIsConverting(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setNovelFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setNovelText(text);
    };
    reader.readAsText(file);
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
    saveToLocalStorage(mode);
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
    saveToLocalStorage(mode);
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
    { id: 'continue', label: 'AI续写', icon: Sparkles, color: '#007AFF', handler: handleContinueScript, loading: isContinuing, disabled: isContinuing || isRewriting || isOptimizing || isConverting || !content.trim() || !selectedModel },
    { id: 'rewrite', label: 'AI改写', icon: Wand2, color: '#10b981', handler: handleRewriteScript, loading: isRewriting, disabled: isContinuing || isRewriting || isOptimizing || isConverting || !content.trim() || !selectedModel },
    { id: 'optimize', label: 'AI优化', icon: Zap, color: '#f59e0b', handler: handleOptimizeScript, loading: isOptimizing, disabled: isContinuing || isRewriting || isOptimizing || isConverting || !content.trim() || !selectedModel },
    { id: 'parse', label: '场景解析', icon: MapPin, color: '#ec4899', handler: handleParseScenes, loading: isParsingScenes, disabled: isParsingScenes || isConverting || !content.trim() },
    { id: 'novelToScript', label: '小说转剧本', icon: FileText, color: '#8b5cf6', handler: () => { if (!selectedModel) { addToast({ type: 'warning', title: '请选择模型', message: '请先选择一个 AI 模型来转换内容。' }); return; } setShowNovelToScriptDialog(true); }, loading: isConverting, disabled: isContinuing || isRewriting || isOptimizing || isParsingScenes || isConverting || !selectedModel },
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
              color: 'var(--text-muted)',
              transition: 'all 0.2s ease',
              backgroundColor: 'var(--bg-hover)',
              border: '1px solid var(--border-primary)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)';
              e.currentTarget.style.color = '#fff';
              e.currentTarget.style.transform = 'translateX(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
              e.currentTarget.style.color = 'var(--text-muted)';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
            <ArrowLeft style={{ width: '18px', height: '18px' }} />
          </Link>
          <div>
            <h1 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
              剧本编辑器
            </h1>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>{title || '未命名'}</p>
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
              border: '1px solid var(--border-primary)',
              background: autoSaveEnabled ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-hover)',
              color: autoSaveEnabled ? '#6366f1' : 'var(--text-secondary)',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <Clock style={{ width: '14px', height: '14px' }} />
            {autoSaveEnabled ? '自动保存' : '手动保存'}
          </button>

          {mode === 'script' && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowTemplateMenu(!showTemplateMenu)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-primary)',
                  background: 'var(--bg-hover)',
                  color: 'var(--text-primary)',
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
                  background: 'var(--bg-surface)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '14px',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
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
                        borderBottom: idx < SCRIPT_TEMPLATES.length - 1 ? '1px solid var(--border-primary)' : 'none',
                        color: 'var(--text-primary)',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        transition: 'background-color 0.2s ease',
                      }} 
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }} 
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <span style={{ fontSize: '18px' }}>{tmpl.icon}</span>
                      {tmpl.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleImport}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              border: '1px solid var(--border-primary)',
              background: 'var(--bg-hover)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-input)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--bg-hover)';
              e.currentTarget.style.color = 'var(--text-muted)';
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
              border: '1px solid var(--border-primary)',
              background: 'var(--bg-hover)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-input)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--bg-hover)';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
          >
            <FileDown style={{ width: '16px', height: '16px' }} />
          </button>

          <Button 
            variant="primary" 
            size="sm" 
            onClick={handleSave} 
            disabled={isSaving || !title || !content} 
            loading={isSaving} 
            icon={isSaving ? null : <Save size={16} />}
          >
            {isSaving ? '保存中...' : '保存'}
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
              border: '1px solid var(--border-primary)',
              background: 'var(--bg-surface)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
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
              color: 'var(--text-muted)',
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
                  backgroundColor: autoSaveEnabled ? '#10b981' : 'var(--text-muted)',
                  boxShadow: autoSaveEnabled ? '0 0 8px rgba(16, 185, 129, 0.5)' : 'none',
                }} />
                <span>{lastSaved ? `已保存 ${lastSaved.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}` : '准备就绪'}</span>
              </div>
            </div>
          </div>
        </div>

        {editorMode === 'preview' && mode === 'script' && (
          <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
            <div style={{ 
              padding: '28px', 
              maxWidth: '900px', 
              margin: '0 auto', 
              borderRadius: '20px', 
              background: 'var(--bg-surface)', 
              border: '1px solid var(--border-primary)', 
              backdropFilter: 'blur(20px)',
            }}>
              <div style={{ marginBottom: '28px', paddingBottom: '24px', borderBottom: '1px solid var(--border-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>剧本解析结果概览</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setEditorMode('edit')} icon={<FileCode style={{ width: '14px', height: '14px' }} />}>编辑</Button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '28px' }}>
                <div style={{ 
                  padding: '20px', 
                  background: 'var(--bg-hover)', 
                  borderRadius: '16px', 
                  textAlign: 'center',
                  border: '1px solid var(--border-primary)',
                }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>场景数量</div>
                  <div style={{ fontSize: '36px', fontWeight: '700', color: 'var(--text-primary)' }}>{parsedScenes.length}</div>
                </div>
                <div style={{ 
                  padding: '20px', 
                  background: 'var(--bg-hover)', 
                  borderRadius: '16px', 
                  textAlign: 'center',
                  border: '1px solid var(--border-primary)',
                }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>角色数量</div>
                  <div style={{ fontSize: '36px', fontWeight: '700', color: 'var(--text-primary)' }}>{characters.length}</div>
                </div>
              </div>

              {characters.length > 0 && (
                <div style={{ marginBottom: '28px', paddingBottom: '24px', borderBottom: '1px solid var(--border-primary)' }}>
                  <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <FileText style={{ width: '14px', height: '14px', color: 'white' }} />
                    </div>
                    角色列表
                  </h2>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {characters.map((char) => (
                      <span 
                        key={char} 
                        style={{
                          padding: '8px 16px',
                          background: 'rgba(0, 122, 255, 0.1)',
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

              <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                    background: 'var(--bg-hover)',
                    borderRadius: '16px',
                    border: '1px solid var(--border-primary)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                  }} 
                  onMouseEnter={(e) => { 
                    e.currentTarget.style.transform = 'translateY(-2px)'; 
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; 
                    e.currentTarget.style.borderColor = 'rgba(0, 122, 255, 0.3)'; 
                  }} 
                  onMouseLeave={(e) => { 
                    e.currentTarget.style.transform = 'translateY(0)'; 
                    e.currentTarget.style.boxShadow = 'none'; 
                    e.currentTarget.style.borderColor = 'var(--border-primary)'; 
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
                    <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', margin: 0, flex: 1 }}>{scene.description}</h3>
                  </div>
                  {scene.action && <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '12px', lineHeight: '1.6' }}>({scene.action})</p>}
                  {scene.dialogue && scene.dialogue.map((d, i) => (
                    <div key={i} style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ padding: '4px 10px', background: 'var(--bg-surface)', borderRadius: '8px', fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', border: '1px solid var(--border-primary)' }}>{d.character}</span>
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--text-primary)', margin: '0 0 8px 16px', lineHeight: '1.6' }}>
                        {d.lines.map((line: string, j: number) => (<span key={j}>{line}<br /></span>))}
                      </p>
                      {d.action && <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', margin: '0 0 8px 16px', lineHeight: '1.6' }}>({d.action})</p>}
                    </div>
                  ))}
                </div>
              ))}

              {parsedScenes.length === 0 && content && (
                <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)', background: 'var(--bg-hover)', borderRadius: '16px', border: '2px dashed var(--border-primary)' }}>
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
            border: '1px solid var(--border-primary)',
            borderRight: 'none',
            background: 'var(--bg-card)',
            backdropFilter: 'blur(20px)',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--bg-card)';
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
        >
          <ChevronRight style={{ width: '16px', height: '16px', transform: showAIPanel ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }} />
        </button>

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

          {aiTools.map((tool) => {
            const toolColors: Record<string, string> = {
              '#007AFF': '#3b82f6',
              '#10b981': '#10b981',
              '#f59e0b': '#f59e0b',
              '#ec4899': '#ec4899',
            }
            const color = toolColors[tool.color] || tool.color
            return (
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
                border: `1px solid ${tool.disabled ? 'var(--border-primary)' : `${color}30`}`,
                background: `${color}08`,
                color: tool.disabled ? 'var(--text-muted)' : color,
                fontSize: '13px',
                fontWeight: '500',
                cursor: tool.disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                width: '100%',
                textAlign: 'left',
                opacity: tool.disabled ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                if (!tool.disabled) {
                  e.currentTarget.style.background = `${color}15`
                  e.currentTarget.style.borderColor = `${color}50`
                  e.currentTarget.style.transform = 'translateX(4px)'
                }
              }}
              onMouseLeave={(e) => {
                if (!tool.disabled) {
                  e.currentTarget.style.background = `${color}08`
                  e.currentTarget.style.borderColor = `${color}30`
                  e.currentTarget.style.transform = 'translateX(0)'
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
          )})}

          <div style={{ height: '1px', background: 'var(--border-primary)', margin: '4px 0' }} />

          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '500' }}>选择AI模型</div>
            <ModelSelector 
              contentType={mode === 'script' ? 'script' : 'novel'} 
              value={selectedModel} 
              onChange={setSelectedModel} 
              placeholder="选择模型" 
              showLastUsed={true} 
              showDefault={true} 
            />
          </div>

          {mode === 'script' && (
            <>
              <div style={{ height: '1px', background: 'var(--border-primary)', margin: '4px 0' }} />

              <button
                onClick={parseScript}
                disabled={loading || !content}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-primary)',
                  background: 'var(--bg-hover)',
                  color: (loading || !content) ? 'var(--text-muted)' : '#8b5cf6',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: (loading || !content) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  width: '100%',
                  textAlign: 'left',
                  opacity: (loading || !content) ? 0.6 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!loading && content) {
                    e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)'
                    e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading && content) {
                    e.currentTarget.style.background = 'var(--bg-hover)'
                    e.currentTarget.style.borderColor = 'var(--border-primary)'
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
                  border: '1px solid var(--border-primary)',
                  background: 'var(--bg-hover)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  width: '100%',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-input)'
                  e.currentTarget.style.borderColor = 'var(--text-muted)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--bg-hover)'
                  e.currentTarget.style.borderColor = 'var(--border-primary)'
                }}
              >
                {editorMode === 'edit' ? <Eye style={{ width: '16px', height: '16px' }} /> : <FileEdit style={{ width: '16px', height: '16px' }} />}
                {editorMode === 'edit' ? '预览模式' : '编辑模式'}
              </button>
            </>
          )}

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 14px',
              borderRadius: '12px',
              border: '1px solid var(--border-primary)',
              background: 'var(--bg-hover)',
              color: 'var(--text-primary)',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              width: '100%',
              textAlign: 'left',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-input)'
              e.currentTarget.style.borderColor = 'var(--text-muted)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--bg-hover)'
              e.currentTarget.style.borderColor = 'var(--border-primary)'
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
          backgroundColor: 'rgba(0, 0, 0, 0.5)', 
          backdropFilter: 'blur(4px)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 1000,
          padding: '20px',
        }} onClick={() => setShowSceneOptimizer(false)}>
          <div style={{
            background: 'var(--bg-elevated)',
            borderRadius: '20px',
            maxWidth: '900px',
            width: '100%',
            maxHeight: '85vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
            border: '1px solid var(--border-primary)',
            animation: 'modalIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ 
              padding: '24px', 
              borderBottom: '1px solid var(--border-primary)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              background: 'var(--bg-surface)',
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
                  <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', margin: '0 0 4px 0' }}>场景优化器</h2>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>解析到 {parsedScenesForOptimization.length} 个场景，选择优化方向后生成建议</p>
                </div>
              </div>
              <button
                onClick={() => setShowSceneOptimizer(false)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-primary)',
                  background: 'var(--bg-hover)',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                  e.currentTarget.style.color = '#ef4444';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--bg-hover)';
                  e.currentTarget.style.borderColor = 'var(--border-primary)';
                  e.currentTarget.style.color = 'var(--text-muted)';
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
                    background: 'var(--bg-hover)', 
                    borderRadius: '16px', 
                    padding: '20px', 
                    marginBottom: '16px', 
                    border: '1px solid var(--border-primary)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ 
                        padding: '4px 12px', 
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', 
                        color: 'white', 
                        borderRadius: '8px', 
                        fontSize: '12px', 
                        fontWeight: '600',
                        boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
                      }}>场景 {scene.id}</span>
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{scene.location} · {scene.time}</span>
                    </div>
                  </div>

                  <div style={{ 
                    padding: '14px', 
                    background: 'var(--bg-input)', 
                    borderRadius: '12px', 
                    marginBottom: '16px', 
                    fontSize: '13px', 
                    color: 'var(--text-secondary)', 
                    lineHeight: '1.7', 
                    whiteSpace: 'pre-wrap',
                    border: '1px solid var(--border-primary)',
                  }}>
                    {scene.content}
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>优化方向 (可选)</label>
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
                          border: '1px solid var(--border-primary)',
                          background: 'var(--bg-input)',
                          color: 'var(--text-primary)',
                          fontSize: '13px',
                          outline: 'none',
                          transition: 'all 0.2s ease',
                        }} 
                        onFocus={(e) => { 
                          e.currentTarget.style.borderColor = '#6366f1'; 
                          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)'; 
                        }} 
                        onBlur={(e) => { 
                          e.currentTarget.style.borderColor = 'var(--border-primary)'; 
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
                      <div style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>{scene.optimized}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ 
              padding: '16px 24px', 
              borderTop: '1px solid var(--border-primary)', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              background: 'var(--bg-hover)',
            }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
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

      {showDownloadDialog && (
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
        }} onClick={() => setShowDownloadDialog(false)}>
          <div style={{
            background: 'var(--bg-elevated)',
            borderRadius: '20px',
            maxWidth: '600px',
            width: '100%',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
            border: '1px solid var(--border-primary)',
            animation: 'modalIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ 
              padding: '24px', 
              borderBottom: '1px solid var(--border-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>转换结果</h2>
              <button 
                onClick={() => setShowDownloadDialog(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                  fontSize: '20px',
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ padding: '24px' }}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.6' }}>
                转换结果较长（{conversionResult.length} 字符），建议下载文件保存。
              </p>
              
              <div style={{ 
                background: 'var(--bg-hover)', 
                borderRadius: '12px', 
                padding: '16px',
                maxHeight: '200px',
                overflow: 'auto',
                marginBottom: '20px',
                fontFamily: 'monospace',
                fontSize: '12px',
                color: 'var(--text-muted)',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}>
                {conversionResult.substring(0, 1000)}...
              </div>
              
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setContent(conversionResult);
                    saveToLocalStorage(mode);
                    setShowDownloadDialog(false);
                    addToast({ type: 'success', title: '已应用到编辑器' });
                  }}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-primary)',
                    background: 'var(--bg-elevated)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                  }}
                >
                  应用到编辑器
                </button>
                <button
                  onClick={() => {
                    const blob = new Blob([conversionResult], { type: 'text/plain;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `${title || '剧本'}_改编.txt`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                    setShowDownloadDialog(false);
                    addToast({ type: 'success', title: '文件已下载' });
                  }}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)',
                  }}
                >
                  下载文件
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showNovelToScriptDialog && (
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
        }} onClick={() => setShowNovelToScriptDialog(false)}>
          <div style={{
            background: 'var(--bg-elevated)',
            borderRadius: '20px',
            maxWidth: '600px',
            width: '100%',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
            border: '1px solid var(--border-primary)',
            animation: 'modalIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ 
              padding: '24px', 
              borderBottom: '1px solid var(--border-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>小说转剧本</h2>
              <button 
                onClick={() => setShowNovelToScriptDialog(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                  fontSize: '20px',
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: 'var(--text-primary)', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                  上传小说文件
                </label>
                <div style={{
                  border: '2px dashed var(--border-primary)',
                  borderRadius: '12px',
                  padding: '24px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background: novelFile ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-surface)',
                }}
                onClick={() => document.getElementById('novel-file-input')?.click()}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#6366f1';
                }}
                onMouseLeave={(e) => {
                  if (!novelFile) {
                    e.currentTarget.style.borderColor = 'var(--border-primary)';
                  }
                }}
                >
                  <input 
                    id="novel-file-input"
                    type="file" 
                    accept=".txt,.md,.novel"
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                  />
                  {novelFile ? (
                    <div>
                      <div style={{ color: '#10b981', fontSize: '24px', marginBottom: '8px' }}>✓</div>
                      <div style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{novelFile.name}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>
                        {(novelFile.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '24px', marginBottom: '8px' }}>📄</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                        点击上传小说文件（支持 .txt, .md）
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {(novelText || content) && (
                <div style={{ 
                  marginBottom: '20px', 
                  padding: '12px', 
                  background: 'var(--bg-hover)', 
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                }}>
                  {novelText ? `已加载小说内容：${novelText.length} 字符` : `编辑器内容：${content.length} 字符`}
                </div>
              )}
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', color: 'var(--text-primary)', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                  目标集数
                  <input
                    type="number"
                    value={scriptOptions.episodes}
                    onChange={(e) => setScriptOptions(prev => ({ ...prev, episodes: parseInt(e.target.value) || 1 }))}
                    style={{
                      marginLeft: '12px',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-primary)',
                      background: 'var(--bg-input)',
                      color: 'var(--text-primary)',
                      width: '80px',
                      fontSize: '14px',
                    }}
                    min={1}
                    max={100}
                  />
                  <span style={{ marginLeft: '8px', color: 'var(--text-muted)' }}>集</span>
                </label>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', color: 'var(--text-primary)', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                  每集时长
                  <input
                    type="number"
                    value={scriptOptions.durationPerEpisode}
                    onChange={(e) => setScriptOptions(prev => ({ ...prev, durationPerEpisode: parseInt(e.target.value) || 1 }))}
                    style={{
                      marginLeft: '12px',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-primary)',
                      background: 'var(--bg-input)',
                      color: 'var(--text-primary)',
                      width: '80px',
                      fontSize: '14px',
                    }}
                    min={1}
                    max={180}
                  />
                  <span style={{ marginLeft: '8px', color: 'var(--text-muted)' }}>分钟</span>
                </label>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: 'var(--text-primary)', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                  作品类型
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[
                    { value: 'short_drama', label: '短剧' },
                    { value: 'tv_series', label: '电视剧' },
                    { value: 'movie', label: '电影' },
                    { value: 'web_series', label: '网剧' },
                  ].map(item => (
                    <button
                      key={item.value}
                      onClick={() => setScriptOptions(prev => ({ ...prev, genre: item.value as any }))}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-primary)',
                        background: scriptOptions.genre === item.value ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' : 'var(--bg-elevated)',
                        color: scriptOptions.genre === item.value ? '#fff' : 'var(--text-primary)',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: scriptOptions.genre === item.value ? '600' : '400',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: 'var(--text-primary)', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                  目标受众
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[
                    { value: 'general', label: '全年龄' },
                    { value: 'children', label: '儿童' },
                    { value: 'teen', label: '青少年' },
                    { value: 'adult', label: '成人' },
                  ].map(item => (
                    <button
                      key={item.value}
                      onClick={() => setScriptOptions(prev => ({ ...prev, targetAudience: item.value as any }))}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-primary)',
                        background: scriptOptions.targetAudience === item.value ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' : 'var(--bg-elevated)',
                        color: scriptOptions.targetAudience === item.value ? '#fff' : 'var(--text-primary)',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: scriptOptions.targetAudience === item.value ? '600' : '400',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: 'var(--text-primary)', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                  剧情基调
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[
                    { value: 'drama', label: '剧情' },
                    { value: 'comedy', label: '喜剧' },
                    { value: 'action', label: '动作' },
                    { value: 'romance', label: '爱情' },
                    { value: 'suspense', label: '悬疑' },
                    { value: 'tragedy', label: '悲剧' },
                    { value: 'sci_fi', label: '科幻' },
                    { value: 'horror', label: '恐怖' },
                  ].map(item => (
                    <button
                      key={item.value}
                      onClick={() => setScriptOptions(prev => ({ ...prev, tone: item.value as any }))}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-primary)',
                        background: scriptOptions.tone === item.value ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' : 'var(--bg-elevated)',
                        color: scriptOptions.tone === item.value ? '#fff' : 'var(--text-primary)',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: scriptOptions.tone === item.value ? '600' : '400',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: 'var(--text-primary)', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                  改编重点
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[
                    { value: 'plot', label: '剧情' },
                    { value: 'dialogue', label: '台词' },
                    { value: 'emotion', label: '情感' },
                    { value: 'action', label: '动作' },
                  ].map(item => (
                    <button
                      key={item.value}
                      onClick={() => setScriptOptions(prev => ({ ...prev, focus: item.value as any }))}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-primary)',
                        background: scriptOptions.focus === item.value ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' : 'var(--bg-elevated)',
                        color: scriptOptions.focus === item.value ? '#fff' : 'var(--text-primary)',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: scriptOptions.focus === item.value ? '600' : '400',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: 'var(--text-primary)', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                  对话风格
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[
                    { value: 'natural', label: '自然口语' },
                    { value: 'classical', label: '古典雅致' },
                    { value: 'modern', label: '现代时尚' },
                  ].map(item => (
                    <button
                      key={item.value}
                      onClick={() => setScriptOptions(prev => ({ ...prev, dialogueStyle: item.value as any }))}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-primary)',
                        background: scriptOptions.dialogueStyle === item.value ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' : 'var(--bg-elevated)',
                        color: scriptOptions.dialogueStyle === item.value ? '#fff' : 'var(--text-primary)',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: scriptOptions.dialogueStyle === item.value ? '600' : '400',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: 'var(--text-primary)', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                  结局类型
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[
                    { value: 'closed', label: '闭合式' },
                    { value: 'open', label: '开放式' },
                    { value: 'happy', label: '大团圆' },
                    { value: 'sad', label: '悲剧收尾' },
                  ].map(item => (
                    <button
                      key={item.value}
                      onClick={() => setScriptOptions(prev => ({ ...prev, endingType: item.value as any }))}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-primary)',
                        background: scriptOptions.endingType === item.value ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' : 'var(--bg-elevated)',
                        color: scriptOptions.endingType === item.value ? '#fff' : 'var(--text-primary)',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: scriptOptions.endingType === item.value ? '600' : '400',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', color: 'var(--text-primary)', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                  <input
                    type="checkbox"
                    checked={scriptOptions.keepNarrator}
                    onChange={(e) => setScriptOptions(prev => ({ ...prev, keepNarrator: e.target.checked }))}
                    style={{ marginRight: '8px', width: '16px', height: '16px' }}
                  />
                  保留旁白叙述
                </label>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', color: 'var(--text-primary)', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                  <input
                    type="checkbox"
                    checked={scriptOptions.includeShotList}
                    onChange={(e) => setScriptOptions(prev => ({ ...prev, includeShotList: e.target.checked }))}
                    style={{ marginRight: '8px', width: '16px', height: '16px' }}
                  />
                  包含分镜列表
                </label>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', color: 'var(--text-primary)', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                  <input
                    type="checkbox"
                    checked={scriptOptions.enableCustomPrompt}
                    onChange={(e) => setScriptOptions(prev => ({ ...prev, enableCustomPrompt: e.target.checked }))}
                    style={{ marginRight: '8px', width: '16px', height: '16px' }}
                  />
                  自定义提示词（关闭所有选项）
                </label>
                {scriptOptions.enableCustomPrompt && (
                  <textarea
                    value={scriptOptions.customPrompt}
                    onChange={(e) => setScriptOptions(prev => ({ ...prev, customPrompt: e.target.value }))}
                    placeholder="请输入自定义提示词，描述您希望如何将小说转换为剧本..."
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
                    }}
                  />
                )}
              </div>

              <div style={{ 
                padding: '12px', 
                background: 'var(--bg-hover)', 
                borderRadius: '8px',
                marginBottom: '20px',
                border: '1px solid var(--border-primary)',
              }}>
                <div style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>转换概览</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                  {scriptOptions.enableCustomPrompt ? (
                    <span>使用自定义提示词转换</span>
                  ) : (
                    <>
                      将小说改编为 <span style={{ color: '#8b5cf6', fontWeight: '600' }}>{scriptOptions.episodes} 集</span> {scriptOptions.genre === 'short_drama' ? '短剧' : (scriptOptions.genre === 'tv_series' ? '电视剧' : (scriptOptions.genre === 'movie' ? '电影' : '网剧'))}，
                      每集 <span style={{ color: '#8b5cf6', fontWeight: '600' }}>{scriptOptions.durationPerEpisode} 分钟</span>，
                      总时长约 <span style={{ color: '#8b5cf6', fontWeight: '600' }}>{scriptOptions.episodes * scriptOptions.durationPerEpisode} 分钟</span>
                    </>
                  )}
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setShowNovelToScriptDialog(false);
                    setNovelFile(null);
                    setNovelText('');
                  }}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-primary)',
                    background: 'var(--bg-elevated)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                  }}
                >
                  取消
                </button>
                <button
                  onClick={handleNovelToScript}
                  disabled={isConverting || (!novelText && !content.trim())}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '10px',
                    border: 'none',
                    background: isConverting || (!novelText && !content.trim()) 
                      ? 'rgba(99, 102, 241, 0.5)' 
                      : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    color: '#fff',
                    cursor: isConverting || (!novelText && !content.trim()) ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    boxShadow: isConverting || (!novelText && !content.trim()) ? 'none' : '0 4px 14px rgba(99, 102, 241, 0.3)',
                  }}
                >
                  {isConverting ? '转换中...' : '开始转换'}
                </button>
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

export default function UnifiedEditorPage() {
  const { projectId } = useParams<{ projectId: string }>();

  return (
    <ContentProvider projectId={projectId || ''}>
      <UnifiedEditorContent />
    </ContentProvider>
  );
}
