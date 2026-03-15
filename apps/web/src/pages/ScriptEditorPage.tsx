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
  ChevronDown,
  LayoutGrid,
  FileEdit,
  MapPin,
  Clock,
  ChevronRight,
  Maximize2,
  Minimize2,
  AlertCircle,
  Zap,
  Wand2,
} from 'lucide-react';
import MonacoEditor from '../components/MonacoEditor';
import { ModelSelector } from '../components/ui';
import { apiClient } from '../lib/api';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../components/ui/Toast';
import { ContentProvider, useContent, ContentMode } from '../contexts/ContentContext';
import { SceneOptimizer } from '../components/SceneOptimizer/index';
import { AIProcessingProgress, AIProcessingTask } from '../components/AIProcessingProgress';
import { ScriptPreviewPanel, Scene, Character } from '../components/ScriptPreviewPanel';
import { FormatConfirmDialog } from '../components/editor/FormatConfirmDialog';

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

function ScriptEditorContent() {
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
    novelContent,
    setNovelContent,
    novelTitle,
    setNovelTitle,
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
  const [characters, setCharacters] = useState<any[]>([]);
  const [parsedItems, setParsedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showTemplateMenu, setShowTemplateMenu] = useState(false);
  const [isContinuing, setIsContinuing] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isParsingScenes, setIsParsingScenes] = useState(false);
  const [isGeneratingAssets, setIsGeneratingAssets] = useState(false);
  const [useAIParsing, setUseAIParsing] = useState(true);
  const [showSceneOptimizerModal, setShowSceneOptimizerModal] = useState(false);
  const [editorMode, setEditorMode] = useState<'edit' | 'preview'>('edit');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [showAIPanel, setShowAIPanel] = useState(true);
  const [tasks, setTasks] = useState<AIProcessingTask[]>([]);
  const [showReparseConfirm, setShowReparseConfirm] = useState(false);
  const [hasParsedResult, setHasParsedResult] = useState(false);
  const [formatEpisodes, setFormatEpisodes] = useState(12);
  const [formatMinutes, setFormatMinutes] = useState(45);
  const [showFormatDialog, setShowFormatDialog] = useState(false);
  const [formattedResult, setFormattedResult] = useState<{
    formatted_text: string;
    metadata?: { episodes: number; minutes_per_episode: number };
  } | null>(null);
  const [isFormatting, setIsFormatting] = useState(false);
  const { addToast } = useToast();

  const addTask = (type: AIProcessingTask['type'], title: string) => {
    const id = Date.now().toString();
    const newTask: AIProcessingTask = { id, type, title, progress: 0, status: 'pending' };
    console.log('[addTask] Creating new task:', newTask);
    setTasks(prev => {
      const updated = [...prev, newTask];
      console.log('[addTask] Updated tasks:', updated);
      return updated;
    });
    return id;
  };

  const updateTask = (id: string, updates: Partial<AIProcessingTask>) => {
    setTasks(prev => prev.map(task => task.id === id ? { ...task, ...updates } : task));
  };

  const removeCompletedTasks = useCallback(() => {
    setTasks(prev => prev.filter(task => task.status !== 'completed' && task.status !== 'failed'));
  }, []);

  const simulateProgress = (taskId: string, duration: number = 3000) => {
    const steps = 20;
    const interval = duration / steps;
    let currentProgress = 0;
    updateTask(taskId, { status: 'processing', progress: 0 });
    const timer = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 8) + 2;
      if (currentProgress >= 100) { currentProgress = 100; clearInterval(timer); }
      updateTask(taskId, { progress: currentProgress });
    }, interval);
    return () => clearInterval(timer);
  };

  const title = mode === 'script' ? scriptTitle : novelTitle;
  const setTitle = mode === 'script' ? setScriptTitle : setNovelTitle;
  const content = mode === 'script' ? scriptContent : novelContent;
  const setContent = mode === 'script' ? setScriptContent : setNovelContent;

  const PARSED_RESULT_KEY = `parsed_result_${projectIdStr}`;

  const saveParsedResult = useCallback((scenes: Scene[], chars: any[], items: any[]) => {
    try {
      localStorage.setItem(PARSED_RESULT_KEY, JSON.stringify({
        scenes,
        characters: chars,
        items,
        timestamp: Date.now(),
        contentHash: content.substring(0, 100)
      }));
      setHasParsedResult(true);
    } catch (e) {
      console.warn('保存解析结果失败:', e);
    }
  }, [PARSED_RESULT_KEY, content]);

  const loadParsedResult = useCallback(() => {
    try {
      const saved = localStorage.getItem(PARSED_RESULT_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.contentHash === content.substring(0, 100)) {
          return data;
        }
      }
    } catch (e) {
      console.warn('加载解析结果失败:', e);
    }
    return null;
  }, [PARSED_RESULT_KEY, content]);

  useEffect(() => {
    const saved = loadParsedResult();
    if (saved && saved.scenes?.length > 0) {
      setParsedScenes(saved.scenes);
      setCharacters(saved.characters || []);
      setParsedItems(saved.items || []);
      setHasParsedResult(true);
    }
  }, [loadParsedResult]);

  useEffect(() => { loadFromLocalStorage(mode); }, [mode, loadFromLocalStorage]);

  useEffect(() => {
    if (!autoSaveEnabled) return;
    const timer = setTimeout(() => { if (title || content) saveToLocalStorage(mode); }, 3000);
    return () => clearTimeout(timer);
  }, [title, content, autoSaveEnabled, mode, saveToLocalStorage]);

  const handleModeChange = (newMode: ContentMode) => setMode(newMode);

  const handleChapterSelect = (chapter: any) => {
    setSelectedChapterId(chapter.id);
    setTitle(chapter.title);
    setContent(chapter.content);
  };

  const handleChapterDelete = async (chapterId: string) => {
    if (!confirm('确定删除此章节？')) return;
    try {
      await apiClient.deleteChapter(chapterId);
      if (selectedChapterId === chapterId) { setSelectedChapterId(null); setTitle(novelTitle); setContent(novelContent); }
      addToast({ type: 'success', title: '删除成功' });
    } catch (error) {
      console.error('删除章节失败:', error);
      addToast({ type: 'error', title: '删除失败' });
    }
  };

  const handleNovelSelect = (novelTitle: string, novelContent: string) => {
    setSelectedChapterId(null);
    setTitle(novelTitle);
    setContent(novelContent);
  };

  const parseScript = async () => {
    if (!content.trim()) return;
    try {
      setLoading(true);
      const result = await apiClient.parseScript(content, selectedModel);
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
      addToast({ type: 'success', title: '保存成功' });
      saveToLocalStorage(mode);
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
          if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ''));
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
    if (!selectedModel) { addToast({ type: 'warning', title: '请选择模型' }); return; }
    const taskId = addTask('continuing', 'AI 续写剧本');
    try {
      setIsContinuing(true);
      const stopProgress = simulateProgress(taskId, 4000);
      const result = await apiClient.continueScript(content, selectedModel);
      stopProgress();
      setContent(result.content);
      updateTask(taskId, { status: 'completed', progress: 100 });
      saveToLocalStorage(mode);
    } catch (error) {
      updateTask(taskId, { status: 'failed', error: error instanceof Error ? error.message : '未知错误' });
      addToast({ type: 'error', title: 'AI续写失败' });
    } finally {
      setIsContinuing(false);
    }
  };

  const handleRewriteScript = async () => {
    if (!content.trim() || isRewriting) return;
    if (!selectedModel) { addToast({ type: 'warning', title: '请选择模型' }); return; }
    const taskId = addTask('rewriting', 'AI 改写剧本');
    try {
      setIsRewriting(true);
      const stopProgress = simulateProgress(taskId, 4000);
      const result = await apiClient.rewriteScript(content, selectedModel);
      stopProgress();
      setContent(result.content);
      updateTask(taskId, { status: 'completed', progress: 100 });
      saveToLocalStorage(mode);
    } catch (error) {
      updateTask(taskId, { status: 'failed', error: error instanceof Error ? error.message : '未知错误' });
      addToast({ type: 'error', title: 'AI改写失败' });
    } finally {
      setIsRewriting(false);
    }
  };

  const handleOptimizeScript = async () => {
    if (!content.trim() || isOptimizing) return;
    if (!selectedModel) { addToast({ type: 'warning', title: '请选择模型' }); return; }
    const taskId = addTask('optimizing', 'AI 优化剧本');
    try {
      setIsOptimizing(true);
      const stopProgress = simulateProgress(taskId, 4000);
      const result = await apiClient.rewriteScript(content, selectedModel);
      stopProgress();
      setContent(result.content);
      updateTask(taskId, { status: 'completed', progress: 100 });
      saveToLocalStorage(mode);
      addToast({ type: 'success', title: '优化完成' });
    } catch (error) {
      updateTask(taskId, { status: 'failed', error: error instanceof Error ? error.message : '未知错误' });
      addToast({ type: 'error', title: 'AI优化失败' });
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleParseScenes = async () => {
    if (!content.trim() || isParsingScenes) {
      if (!content.trim()) addToast({ type: 'warning', title: '内容为空' });
      return;
    }
    if (hasParsedResult && parsedScenes.length > 0) {
      setShowReparseConfirm(true);
      return;
    }
    await executeParse();
  };

  const executeParse = async () => {
    setShowReparseConfirm(false);
    const taskId = addTask('parsing', useAIParsing ? 'AI 智能解析剧本' : '快速正则解析剧本');
    try {
      setIsParsingScenes(true);
      const duration = useAIParsing ? 5000 : 2000;
      const stopProgress = simulateProgress(taskId, duration);
      let result;
      if (useAIParsing) {
        result = await apiClient.parseScriptWithAI(content, selectedModel || undefined);
      } else {
        result = await apiClient.parseScript(content);
      }
      stopProgress();
      updateTask(taskId, { status: 'completed', progress: 100 });
      if (result.scenes && result.scenes.length > 0) {
        setParsedScenes(result.scenes);
        setCharacters(result.characters || []);
        setParsedItems(result.items || []);
        saveParsedResult(result.scenes, result.characters || [], result.items || []);
        setEditorMode('preview');
        addToast({ type: 'success', title: '解析成功', message: `成功解析 ${result.scenes.length} 个场景` });
      } else {
        addToast({ type: 'info', title: '未检测到场景' });
      }
    } catch (error) {
      updateTask(taskId, { status: 'failed', error: error instanceof Error ? error.message : '未知错误' });
      addToast({ type: 'error', title: '剧本解析失败' });
    } finally {
      setIsParsingScenes(false);
    }
  };

  const handleGenerateAssets = async () => {
    if (!projectIdStr || parsedScenes.length === 0) {
      addToast({ type: 'warning', title: '无法生成', message: '请先解析剧本' });
      return;
    }
    console.log('[GenerateAssets] Starting asset generation...');
    const taskId = addTask('converting', '生成资产生成中');
    console.log('[GenerateAssets] Task created with ID:', taskId);
    try {
      setIsGeneratingAssets(true);
      const stopProgress = simulateProgress(taskId, 5000);
      const createdAssets = { characters: 0, scenes: 0, shots: 0, items: 0 };

      for (const char of characters) {
        try {
          const charData = char;
          const charName = charData.name || '';
          const appearance = charData.appearance
            ? `${charData.appearance.hairStyle || ''} ${charData.appearance.facialFeatures || ''} ${charData.appearance.bodyProportion || ''}`.trim()
            : (charData.description || `角色 ${charName} 的外貌描述`);
          await apiClient.createCharacter(projectIdStr, {
            name: charName,
            appearance: appearance || `角色 ${charName} 的外貌描述`,
            age: 25,
            gender: 'unknown',
          } as any);
          createdAssets.characters++;
        } catch (err) { console.warn(`创建角色失败:`, char); }
      }

      for (const item of parsedItems) {
        try {
          await apiClient.createItem(projectIdStr, {
            name: item.name || '未命名物品',
            type: '其他',
            description: `尺寸: ${item.size || '未知'}, 形状: ${item.shape || '未知'}, 颜色: ${item.color || '未知'}`,
          } as any);
          createdAssets.items++;
        } catch (err) { console.warn(`创建物品失败:`, item); }
      }

      for (let i = 0; i < parsedScenes.length; i++) {
        const scene = parsedScenes[i];
        try {
          const sceneData = await apiClient.createScene(projectIdStr, {
            location: scene.description?.substring(0, 30) || scene.heading?.substring(0, 30) || `场景 ${i + 1}`,
            time: scene.time || '白天',
            description: scene.description || scene.heading || '',
          } as any);
          
          const dialogues = scene.dialogues || scene.dialogue || [];
          if (dialogues.length > 0) {
            for (let j = 0; j < dialogues.length; j++) {
              const dialogue = dialogues[j];
              const charName = dialogue.characterName || dialogue.character || '角色';
              const dialogueText = dialogue.text || dialogue.lines?.join(' ') || '';
              try {
                await apiClient.createShot(projectIdStr, {
                  scene_id: sceneData.id,
                  chapter_number: i + 1,
                  episode_number: 1,
                  segment_id: 1,
                  cell_id: j + 1,
                  action_summary: `${charName}: "${dialogueText}"`,
                  start_prompt: `【场景】${scene.description || scene.heading || '室内'}，${scene.time || '白天'}\n【角色】${charName}\n【台词】${dialogueText}`,
                  end_prompt: `【场景】${scene.description || scene.heading || '室内'}，${scene.time || '白天'}\n【角色】${charName}说完台词`,
                  duration: Math.max(3, Math.ceil(dialogueText.length / 8)),
                  aspect_ratio: '16:9',
                  camera_movement: '中景，固定，平视',
                } as any);
                createdAssets.shots++;
              } catch (err) { console.warn(`创建分镜失败:`, err); }
            }
          }
          
          const actions = scene.actions || [];
          for (let k = 0; k < actions.length; k++) {
            const action = actions[k];
            if (action.shot) {
              try {
                await apiClient.createShot(projectIdStr, {
                  scene_id: sceneData.id,
                  chapter_number: i + 1,
                  episode_number: 1,
                  segment_id: 1,
                  cell_id: dialogues.length + k + 1,
                  action_summary: action.description || '动作描述',
                  start_prompt: `【场景】${scene.description || scene.heading || '室内'}\n【动作】${action.description || ''}`,
                  end_prompt: `【场景】${scene.description || scene.heading || '室内'}\n【动作完成】`,
                  duration: action.shot?.duration || 3,
                  aspect_ratio: '16:9',
                  camera_movement: action.shot ? `${action.shot.type || '中景'}，${action.shot.movement || '固定'}，${action.shot.angle || '平视'}` : '中景，固定，平视',
                } as any);
                createdAssets.shots++;
              } catch (err) { console.warn(`创建动作分镜失败:`, err); }
            }
          }
          
          createdAssets.scenes++;
        } catch (err) { console.warn(`创建场景失败:`, err); }
      }

      stopProgress();
      updateTask(taskId, { status: 'completed', progress: 100 });
      addToast({ type: 'success', title: '生成完成', message: `已创建 ${createdAssets.characters} 个角色、${createdAssets.scenes} 个场景、${createdAssets.items} 个物品、${createdAssets.shots} 个分镜` });
    } catch (error) {
      updateTask(taskId, { status: 'failed', error: error instanceof Error ? error.message : '未知错误' });
      addToast({ type: 'error', title: '生成失败' });
    } finally {
      setIsGeneratingAssets(false);
    }
  };

  const handleFormatScript = async () => {
    if (!content.trim() || isFormatting) {
      if (!content.trim()) addToast({ type: 'warning', title: '内容为空' });
      return;
    }
    if (!selectedModel) {
      addToast({ type: 'warning', title: '请选择模型' });
      return;
    }

    const taskId = addTask('formatting', '小说转剧本格式');
    try {
      setIsFormatting(true);
      const stopProgress = simulateProgress(taskId, 5000);
      
      const result = await apiClient.formatToScript(
        content,
        formatEpisodes,
        formatMinutes,
        selectedModel
      );
      
      stopProgress();
      updateTask(taskId, { status: 'completed', progress: 100 });
      
      setFormattedResult({
        formatted_text: result.formatted_text,
        metadata: result.metadata,
      });
      setShowFormatDialog(true);
    } catch (error) {
      updateTask(taskId, { 
        status: 'failed', 
        error: error instanceof Error ? error.message : '未知错误' 
      });
      addToast({ type: 'error', title: '格式转换失败' });
    } finally {
      setIsFormatting(false);
    }
  };

  const handleConfirmFormat = () => {
    if (formattedResult) {
      setScriptContent(formattedResult.formatted_text);
      setMode('script');
      setShowFormatDialog(false);
      setFormattedResult(null);
      addToast({ type: 'success', title: '已保存为剧本' });
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

  const aiTools = [
    { id: 'continue', label: 'AI续写', icon: Sparkles, color: '#007AFF', handler: handleContinueScript, loading: isContinuing, disabled: isContinuing || isRewriting || isOptimizing || !content.trim() || !selectedModel, requiresModel: true },
    { id: 'rewrite', label: 'AI改写', icon: Wand2, color: '#10b981', handler: handleRewriteScript, loading: isRewriting, disabled: isContinuing || isRewriting || isOptimizing || !content.trim() || !selectedModel, requiresModel: true },
    { id: 'optimize', label: 'AI优化', icon: Zap, color: '#f59e0b', handler: handleOptimizeScript, loading: isOptimizing, disabled: isContinuing || isRewriting || isOptimizing || !content.trim() || !selectedModel, requiresModel: true },
    { id: 'format', label: '小说转剧本格式', icon: FileText, color: '#06b6d4', handler: handleFormatScript, loading: isFormatting, disabled: isFormatting || !content.trim() || !selectedModel, requiresModel: true },
    { id: 'parse', label: '剧本解析', icon: MapPin, color: '#ec4899', handler: handleParseScenes, loading: isParsingScenes, disabled: isParsingScenes || !content.trim(), requiresModel: false },
    { id: 'scene-optimizer', label: '场景优化', icon: FileEdit, color: '#8b5cf6', handler: () => setShowSceneOptimizerModal(true), loading: false, disabled: !content.trim(), requiresModel: false },
  ];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg-page)', minHeight: '100vh' }}>
      {/* Header */}
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
          <Link to={`/projects/${projectId}`} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '36px', height: '36px', borderRadius: '10px',
            textDecoration: 'none', color: 'var(--text-muted)',
            transition: 'all 0.2s ease', backgroundColor: 'var(--bg-hover)',
            border: '1px solid var(--border-primary)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            <ArrowLeft style={{ width: '18px', height: '18px' }} />
          </Link>
          <div>
            <h1 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>剧本编辑器</h1>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>{title || '未命名剧本'}</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={() => setAutoSaveEnabled(!autoSaveEnabled)} style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px',
            borderRadius: '10px', border: '1px solid var(--border-primary)',
            background: autoSaveEnabled ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-hover)',
            color: autoSaveEnabled ? '#6366f1' : 'var(--text-secondary)',
            fontSize: '13px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s ease',
          }}>
            <Clock style={{ width: '14px', height: '14px' }} />
            {autoSaveEnabled ? '自动保存' : '手动保存'}
          </button>

          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowTemplateMenu(!showTemplateMenu)} style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px',
              borderRadius: '10px', border: '1px solid var(--border-primary)',
              background: 'var(--bg-hover)', color: 'var(--text-primary)',
              fontSize: '13px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s ease',
            }}>
              <Type style={{ width: '14px', height: '14px' }} />
              模板
              <ChevronDown style={{ width: '12px', height: '12px', transform: showTemplateMenu ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
            </button>
            {showTemplateMenu && (
              <div style={{
                position: 'absolute', top: '100%', right: 0, marginTop: '8px',
                background: 'var(--bg-card)', backdropFilter: 'blur(20px)',
                border: '1px solid var(--border-primary)', borderRadius: '14px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.15)', minWidth: '200px', zIndex: 100, overflow: 'hidden',
              }} onClick={(e) => e.stopPropagation()}>
                {SCRIPT_TEMPLATES.map((tmpl, idx) => (
                  <div key={idx} onClick={() => applyTemplate(tmpl.template)} style={{
                    padding: '14px 18px', cursor: 'pointer',
                    borderBottom: idx < SCRIPT_TEMPLATES.length - 1 ? '1px solid var(--border-primary)' : 'none',
                    color: 'var(--text-primary)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px',
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

          <button onClick={handleImport} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '36px', height: '36px', borderRadius: '10px',
            border: '1px solid var(--border-primary)', background: 'var(--bg-hover)',
            color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-input)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            <Upload style={{ width: '16px', height: '16px' }} />
          </button>

          <button onClick={handleExport} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '36px', height: '36px', borderRadius: '10px',
            border: '1px solid var(--border-primary)', background: 'var(--bg-hover)',
            color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-input)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            <FileDown style={{ width: '16px', height: '16px' }} />
          </button>

          <button onClick={handleSave} disabled={isSaving || !title || !content} style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px',
            borderRadius: '10px', border: 'none',
            background: isSaving || !title || !content ? 'var(--bg-hover)' : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            color: isSaving || !title || !content ? 'var(--text-muted)' : '#fff',
            fontSize: '13px', fontWeight: '500', cursor: isSaving || !title || !content ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: isSaving || !title || !content ? 'none' : '0 4px 14px rgba(99, 102, 241, 0.3)',
          }}>
            {isSaving ? <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} /> : <Save style={{ width: '14px', height: '14px' }} />}
            {isSaving ? '保存中...' : '保存'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Editor */}
        <div style={{ flex: 1, overflowY: 'auto', display: editorMode === 'edit' ? 'block' : 'none' }}>
          <div style={{ height: '100%', padding: '16px', paddingRight: showAIPanel ? '280px' : '16px', transition: 'padding-right 0.3s ease' }}>
            <div style={{
              height: 'calc(100vh - 112px)', borderRadius: '16px', overflow: 'hidden',
              border: '1px solid var(--border-primary)', background: 'var(--bg-card)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
            }}>
              <MonacoEditor height="100%" language="plaintext" theme={theme === 'dark' ? 'vs-dark' : 'vs-light'} value={content} onChange={(value) => setContent(value || '')} options={editorOptions} onSave={handleSave} />
            </div>
            <div style={{ height: '32px', marginTop: '8px', padding: '0 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FileText style={{ width: '10px', height: '10px' }} />{content.length} 字符</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><LayoutGrid style={{ width: '10px', height: '10px' }} />{content.split('\n').length} 行</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: autoSaveEnabled ? '#10b981' : 'var(--text-muted)', boxShadow: autoSaveEnabled ? '0 0 8px rgba(16, 185, 129, 0.5)' : 'none' }} />
                <span>{lastSaved ? `已保存 ${lastSaved.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}` : '准备就绪'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        {editorMode === 'preview' && (
          <ScriptPreviewPanel
            scenes={parsedScenes}
            characters={characters}
            items={parsedItems}
            onEdit={() => setEditorMode('edit')}
            onGenerateAssets={handleGenerateAssets}
            isGenerating={isGeneratingAssets}
            onParse={parseScript}
            isParsing={loading || isParsingScenes}
            hasContent={!!content}
          />
        )}
      </div>

      {/* AI Panel */}
      <div style={{
        position: 'fixed', top: '80px',
        right: showAIPanel ? '16px' : '-260px',
        width: '240px', display: 'flex', flexDirection: 'column', gap: '12px',
        zIndex: 50, transition: 'right 0.3s ease',
      }}>
        <button onClick={() => setShowAIPanel(!showAIPanel)} style={{
          position: 'absolute', left: '-36px', top: '0',
          width: '32px', height: '32px', borderRadius: '10px 0 0 10px',
          border: '1px solid var(--border-primary)', borderRight: 'none',
          background: 'var(--bg-card)', backdropFilter: 'blur(20px)',
          color: 'var(--text-muted)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'; e.currentTarget.style.color = '#fff'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          <ChevronRight style={{ width: '16px', height: '16px', transform: showAIPanel ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }} />
        </button>

        <div style={{
          display: 'flex', flexDirection: 'column', gap: '12px', padding: '20px',
          background: 'var(--bg-card)', backdropFilter: 'blur(20px)',
          borderRadius: '16px', border: '1px solid var(--border-primary)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '8px' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 12px', boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)',
            }}>
              <Sparkles style={{ width: '22px', height: '22px', color: 'white' }} />
            </div>
            <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>AI 剧本助手</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>智能创作辅助工具</div>
          </div>

          <div style={{ padding: '10px', borderRadius: '10px', background: 'var(--bg-hover)', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: '500' }}>剧本解析模式</span>
              <span style={{
                fontSize: '10px', color: useAIParsing ? '#10b981' : '#f59e0b',
                fontWeight: '600', padding: '2px 6px', borderRadius: '4px',
                background: useAIParsing ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)'
              }}>
                {useAIParsing ? 'AI智能' : '快速正则'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-input)', borderRadius: '6px', padding: '3px' }}>
              <button onClick={() => setUseAIParsing(true)} style={{
                flex: 1, padding: '6px 8px', borderRadius: '5px', border: 'none',
                background: useAIParsing ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' : 'transparent',
                color: useAIParsing ? '#fff' : 'var(--text-muted)',
                fontSize: '11px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s ease'
              }}>AI智能解析</button>
              <button onClick={() => setUseAIParsing(false)} style={{
                flex: 1, padding: '6px 8px', borderRadius: '5px', border: 'none',
                background: !useAIParsing ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' : 'transparent',
                color: !useAIParsing ? '#fff' : 'var(--text-muted)',
                fontSize: '11px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s ease'
              }}>快速正则</button>
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '6px', lineHeight: '1.4' }}>
              {useAIParsing ? '使用AI深度理解上下文，适合复杂剧本' : '快速解析，适合标准格式剧本'}
            </div>
          </div>

          <div style={{ padding: '10px', borderRadius: '10px', background: 'var(--bg-hover)', marginBottom: '12px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: '500', marginBottom: '10px' }}>
              小说转剧本格式配置
            </div>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>集数</label>
                <input
                  type="number"
                  value={formatEpisodes}
                  onChange={(e) => setFormatEpisodes(parseInt(e.target.value) || 1)}
                  min={1}
                  max={100}
                  style={{
                    width: '100%',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-primary)',
                    background: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                    outline: 'none',
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>每集时长(分钟)</label>
                <input
                  type="number"
                  value={formatMinutes}
                  onChange={(e) => setFormatMinutes(parseInt(e.target.value) || 1)}
                  min={1}
                  max={180}
                  style={{
                    width: '100%',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-primary)',
                    background: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              总时长约 {formatEpisodes * formatMinutes} 分钟
            </div>
          </div>

          {aiTools.map((tool) => {
            const toolColors: Record<string, string> = { '#007AFF': '#3b82f6', '#10b981': '#10b981', '#f59e0b': '#f59e0b', '#ec4899': '#ec4899', '#8b5cf6': '#8b5cf6', '#06b6d4': '#06b6d4' };
            const color = toolColors[tool.color] || tool.color;
            
            const handleClick = () => {
              if (tool.disabled) {
                if (!content.trim()) {
                  addToast({ type: 'warning', title: '请先输入内容' });
                } else if (tool.requiresModel && !selectedModel) {
                  addToast({ type: 'warning', title: '请先选择AI模型' });
                }
                return;
              }
              tool.handler();
            };
            
            return (
              <button key={tool.id} onClick={handleClick} disabled={tool.loading} style={{
                display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px',
                borderRadius: '12px', border: `1px solid ${tool.disabled ? 'var(--border-primary)' : `${color}30`}`,
                background: `${color}08`, color: tool.disabled ? 'var(--text-muted)' : color,
                fontSize: '13px', fontWeight: '500', cursor: tool.loading ? 'wait' : 'pointer',
                transition: 'all 0.2s ease', width: '100%', textAlign: 'left', opacity: tool.disabled ? 0.6 : 1,
              }}
              onMouseEnter={(e) => { if (!tool.disabled) { e.currentTarget.style.background = `${color}15`; e.currentTarget.style.borderColor = `${color}50`; e.currentTarget.style.transform = 'translateX(4px)'; } }}
              onMouseLeave={(e) => { if (!tool.disabled) { e.currentTarget.style.background = `${color}08`; e.currentTarget.style.borderColor = `${color}30`; e.currentTarget.style.transform = 'translateX(0)'; } }}
              >
                {tool.loading ? <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} /> : <tool.icon style={{ width: '16px', height: '16px' }} />}
                {tool.loading ? `${tool.label}中...` : tool.label}
              </button>
            );
          })}

          <div style={{ height: '1px', background: 'var(--border-primary)', margin: '4px 0' }} />

          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '500' }}>选择AI模型</div>
            <ModelSelector contentType="script" value={selectedModel} onChange={setSelectedModel} placeholder="选择模型" showLastUsed={true} showDefault={true} />
          </div>

          <div style={{ height: '1px', background: 'var(--border-primary)', margin: '4px 0' }} />

          <button onClick={() => setEditorMode(editorMode === 'edit' ? 'preview' : 'edit')} style={{
            display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px',
            borderRadius: '12px', border: '1px solid var(--border-primary)',
            background: 'var(--bg-hover)', color: 'var(--text-primary)',
            fontSize: '13px', fontWeight: '500', cursor: 'pointer',
            transition: 'all 0.2s ease', width: '100%', textAlign: 'left',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-input)'; e.currentTarget.style.borderColor = 'var(--text-muted)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.borderColor = 'var(--border-primary)'; }}
          >
            {editorMode === 'edit' ? <Eye style={{ width: '16px', height: '16px' }} /> : <FileEdit style={{ width: '16px', height: '16px' }} />}
            {editorMode === 'edit' ? '预览模式' : '编辑模式'}
          </button>

          <button onClick={() => setIsFullscreen(!isFullscreen)} style={{
            display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px',
            borderRadius: '12px', border: '1px solid var(--border-primary)',
            background: 'var(--bg-hover)', color: 'var(--text-primary)',
            fontSize: '13px', fontWeight: '500', cursor: 'pointer',
            transition: 'all 0.2s ease', width: '100%', textAlign: 'left',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-input)'; e.currentTarget.style.borderColor = 'var(--text-muted)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.borderColor = 'var(--border-primary)'; }}
          >
            {isFullscreen ? <Minimize2 style={{ width: '16px', height: '16px' }} /> : <Maximize2 style={{ width: '16px', height: '16px' }} />}
            {isFullscreen ? '退出全屏' : '全屏编辑'}
          </button>
        </div>
      </div>

      {/* Modals */}
      <SceneOptimizer
        is_open={showSceneOptimizerModal}
        on_close={() => setShowSceneOptimizerModal(false)}
        script_content={content}
        on_apply_optimization={(optimized_content) => {
          setContent(optimized_content);
          addToast({ type: 'success', title: '优化已应用' });
        }}
      />

      <FormatConfirmDialog
        isOpen={showFormatDialog}
        onClose={() => {
          setShowFormatDialog(false);
          setFormattedResult(null);
        }}
        onConfirm={handleConfirmFormat}
        formatted_text={formattedResult?.formatted_text || ''}
        metadata={formattedResult?.metadata}
      />

      {/* Reparse Confirm Modal */}
      {showReparseConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            background: 'var(--bg-surface)',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '400px',
            width: '90%',
            border: '1px solid var(--border-primary)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <AlertCircle style={{ width: '24px', height: '24px', color: '#f59e0b' }} />
              <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text-primary)' }}>重新解析确认</h3>
            </div>
            <p style={{ margin: '0 0 20px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              已有解析结果（{parsedScenes.length} 个场景、{characters.length} 个角色、{parsedItems.length} 个物品）。<br />
              是否要重新解析？这将覆盖当前结果。
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowReparseConfirm(false)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-primary)',
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                取消
              </button>
              <button
                onClick={executeParse}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#f59e0b',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >
                重新解析
              </button>
            </div>
          </div>
        </div>
      )}

      <AIProcessingProgress tasks={tasks} onClear={removeCompletedTasks} />

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default function ScriptEditorPage() {
  const { projectId } = useParams<{ projectId: string }>();
  return (
    <ContentProvider projectId={projectId || ''}>
      <ScriptEditorContent />
    </ContentProvider>
  );
}
