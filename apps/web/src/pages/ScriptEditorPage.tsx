import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  TrendingUp,
  History,
  Wand2,
  ArrowRightLeft,
  BarChart3,
  Mountain,
  Maximize,
  ChevronDown,
  Bell,
  Zap,
  Moon,
  Sun,
  Loader2,
  Save,
  RotateCcw,
  FileText,
  Eye,
  Pencil,
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
import { useAuth } from '../contexts/AuthContext';
import { ConfirmModal } from '../components/ui/ModalModern';
import { getApiErrorMessage } from '../lib/api-error';

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
  const { resolvedTheme, toggleTheme } = useTheme();
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
  const [serverBaseline, setServerBaseline] = useState<string | null>(null);
  const [lastServerSavedAt, setLastServerSavedAt] = useState<Date | null>(null);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [pendingDestructive, setPendingDestructive] = useState<
    | null
    | { kind: 'template'; text: string }
    | { kind: 'ai'; op: 'continue' | 'rewrite' | 'optimize' | 'format' }
  >(null);
  const { addToast } = useToast();
  const { user } = useAuth();
  const templateMenuRef = useRef<HTMLDivElement>(null);

  const addTask = (type: AIProcessingTask['type'], title: string) => {
    const id = Date.now().toString();
    const newTask: AIProcessingTask = { id, type, title, progress: 0, status: 'pending' };
    setTasks(prev => [...prev, newTask]);
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

  const pushUndoSnapshot = useCallback(() => {
    setUndoStack((s) => [...s.slice(-9), content]);
  }, [content]);

  const handleUndoLast = useCallback(() => {
    setUndoStack((s) => {
      if (s.length === 0) return s;
      const prev = s[s.length - 1];
      setContent(prev);
      addToast({ type: 'info', title: '已撤销上一步内容' });
      return s.slice(0, -1);
    });
  }, [setContent, addToast]);

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
      addToast({
        type: 'error',
        title: '解析失败',
        message: getApiErrorMessage(error, '请检查剧本格式后再试。'),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;
    try {
      setIsSaving(true);
      await apiClient.saveScript(projectIdStr, title, content);
      const snap = `${title}\n${content}`;
      setServerBaseline(snap);
      setLastServerSavedAt(new Date());
      addToast({ type: 'success', title: '已保存到服务器' });
      saveToLocalStorage(mode);
    } catch (error) {
      console.error('保存失败:', error);
      addToast({
        type: 'error',
        title: '保存失败',
        message: getApiErrorMessage(error, '请检查网络后重试。'),
      });
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

  const commitTemplate = (template: string) => {
    setContent(template);
    setShowTemplateMenu(false);
    addToast({ type: 'success', title: '已套用模板' });
  };

  const requestApplyTemplate = (template: string) => {
    if (content.trim().length > 0) {
      setPendingDestructive({ kind: 'template', text: template });
    } else {
      commitTemplate(template);
    }
  };

  const executeContinueScript = async () => {
    if (!content.trim() || isContinuing) return;
    if (!selectedModel) {
      addToast({ type: 'warning', title: '请选择模型' });
      return;
    }
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
      updateTask(taskId, {
        status: 'failed',
        error: getApiErrorMessage(error, '未知错误'),
      });
      addToast({
        type: 'error',
        title: 'AI 续写失败',
        message: getApiErrorMessage(error, '请稍后重试'),
      });
    } finally {
      setIsContinuing(false);
    }
  };

  const requestContinueScript = () => {
    if (!content.trim() || isContinuing) return;
    if (!selectedModel) {
      addToast({ type: 'warning', title: '请选择模型' });
      return;
    }
    setPendingDestructive({ kind: 'ai', op: 'continue' });
  };

  const executeRewriteScript = async () => {
    if (!content.trim() || isRewriting) return;
    if (!selectedModel) {
      addToast({ type: 'warning', title: '请选择模型' });
      return;
    }
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
      updateTask(taskId, {
        status: 'failed',
        error: getApiErrorMessage(error, '未知错误'),
      });
      addToast({
        type: 'error',
        title: 'AI 改写失败',
        message: getApiErrorMessage(error, '请稍后重试'),
      });
    } finally {
      setIsRewriting(false);
    }
  };

  const requestRewriteScript = () => {
    if (!content.trim() || isRewriting) return;
    if (!selectedModel) {
      addToast({ type: 'warning', title: '请选择模型' });
      return;
    }
    setPendingDestructive({ kind: 'ai', op: 'rewrite' });
  };

  const executeOptimizeScript = async () => {
    if (!content.trim() || isOptimizing) return;
    if (!selectedModel) {
      addToast({ type: 'warning', title: '请选择模型' });
      return;
    }
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
      updateTask(taskId, {
        status: 'failed',
        error: getApiErrorMessage(error, '未知错误'),
      });
      addToast({
        type: 'error',
        title: 'AI 优化失败',
        message: getApiErrorMessage(error, '请稍后重试'),
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const requestOptimizeScript = () => {
    if (!content.trim() || isOptimizing) return;
    if (!selectedModel) {
      addToast({ type: 'warning', title: '请选择模型' });
      return;
    }
    setPendingDestructive({ kind: 'ai', op: 'optimize' });
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
      updateTask(taskId, {
        status: 'failed',
        error: getApiErrorMessage(error, '未知错误'),
      });
      addToast({
        type: 'error',
        title: '剧本解析失败',
        message: getApiErrorMessage(error, '请稍后重试'),
      });
    } finally {
      setIsParsingScenes(false);
    }
  };

  const handleGenerateAssets = async () => {
    if (!projectIdStr || parsedScenes.length === 0) {
      addToast({ type: 'warning', title: '无法生成', message: '请先解析剧本' });
      return;
    }
    const taskId = addTask('converting', '生成资产生成中');
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
        } catch (err) {
          console.warn('创建物品失败:', err, item);
        }
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
      updateTask(taskId, {
        status: 'failed',
        error: getApiErrorMessage(error, '未知错误'),
      });
      addToast({
        type: 'error',
        title: '生成失败',
        message: getApiErrorMessage(error, '请稍后重试'),
      });
    } finally {
      setIsGeneratingAssets(false);
    }
  };

  const executeFormatScript = async () => {
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
        error: getApiErrorMessage(error, '未知错误'),
      });
      addToast({
        type: 'error',
        title: '格式转换失败',
        message: getApiErrorMessage(error, '请稍后重试'),
      });
    } finally {
      setIsFormatting(false);
    }
  };

  const requestFormatScript = () => {
    if (!content.trim() || isFormatting) {
      if (!content.trim()) addToast({ type: 'warning', title: '内容为空' });
      return;
    }
    if (!selectedModel) {
      addToast({ type: 'warning', title: '请选择模型' });
      return;
    }
    setPendingDestructive({ kind: 'ai', op: 'format' });
  };

  const handleConfirmFormat = () => {
    if (formattedResult) {
      pushUndoSnapshot();
      setScriptContent(formattedResult.formatted_text);
      setMode('script');
      setShowFormatDialog(false);
      setFormattedResult(null);
      addToast({ type: 'success', title: '已保存为剧本' });
    }
  };

  const aiActions = [
    { icon: Sparkles, label: 'AI 续写', color: 'var(--accent)' },
    { icon: History, label: 'AI 改写', color: 'var(--secondary)' },
    { icon: Wand2, label: 'AI 优化', color: 'var(--tertiary)' },
    { icon: ArrowRightLeft, label: '格式转换', color: 'var(--text-secondary)' },
    { icon: BarChart3, label: '剧本解析', color: 'var(--text-secondary)' },
    { icon: Mountain, label: '场景优化', color: 'var(--text-secondary)' },
  ];

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

  const savedTimeLabel = lastSaved
    ? lastSaved.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    : null;
  const snapshot = `${title}\n${content}`;
  const serverDirty =
    snapshot.trim().length > 0 &&
    (serverBaseline === null || snapshot !== serverBaseline);
  const serverTimeLabel = lastServerSavedAt
    ? lastServerSavedAt.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    : null;
  const aiBusy = isContinuing || isRewriting || isOptimizing || isParsingScenes || isFormatting || isGeneratingAssets;

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (templateMenuRef.current && !templateMenuRef.current.contains(e.target as Node)) {
        setShowTemplateMenu(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const handleSharePage = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      addToast({ type: 'success', title: '链接已复制' });
    } catch {
      addToast({ type: 'info', title: '当前链接', message: url });
    }
  };

  const runAiAction = (label: string) => {
    switch (label) {
      case 'AI 续写':
        return requestContinueScript();
      case 'AI 改写':
        return requestRewriteScript();
      case 'AI 优化':
        return requestOptimizeScript();
      case '格式转换':
        return requestFormatScript();
      case '剧本解析':
        return handleParseScenes();
      case '场景优化':
        return setShowSceneOptimizerModal(true);
      default:
        return undefined;
    }
  };

  const handleConfirmDestructive = () => {
    if (!pendingDestructive) return;
    if (pendingDestructive.kind === 'template') {
      pushUndoSnapshot();
      setContent(pendingDestructive.text);
      setShowTemplateMenu(false);
      setPendingDestructive(null);
      addToast({ type: 'success', title: '已套用模板' });
      return;
    }
    const op = pendingDestructive.op;
    setPendingDestructive(null);
    pushUndoSnapshot();
    void (async () => {
      switch (op) {
        case 'continue':
          await executeContinueScript();
          break;
        case 'rewrite':
          await executeRewriteScript();
          break;
        case 'optimize':
          await executeOptimizeScript();
          break;
        case 'format':
          await executeFormatScript();
          break;
      }
    })();
  };

  const destructiveModalCopy =
    pendingDestructive?.kind === 'template'
      ? {
          title: '套用模板',
          description: '将用模板替换编辑器中的全部正文。若需保留当前稿，请先导出或先保存到服务器。',
          confirm: '替换正文',
        }
      : pendingDestructive?.kind === 'ai'
        ? {
            continue: {
              title: '确认 AI 续写',
              description: '续写结果将替换当前编辑器中的全文。可先保存到服务器再操作。',
              confirm: '开始续写',
            },
            rewrite: {
              title: '确认 AI 改写',
              description: '改写将替换当前全文。',
              confirm: '开始改写',
            },
            optimize: {
              title: '确认 AI 优化',
              description: '优化将替换当前全文。',
              confirm: '开始优化',
            },
            format: {
              title: '确认格式转换',
              description: '将调用模型把当前正文转为剧本格式，完成后可在预览中确认再写入正文。',
              confirm: '开始转换',
            },
          }[pendingDestructive.op]
        : null;

  return (
    <div style={{
      flex: 1,
      minHeight: 0,
      height: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-base)',
      color: 'var(--text-primary)',
      fontFamily: 'Manrope, sans-serif',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <header style={{
        flexShrink: 0,
        zIndex: 40,
        minHeight: '64px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: '12px 32px',
        background: 'var(--bg-header)',
        backdropFilter: 'blur(24px)',
        borderBottom: '1px solid var(--border-primary)',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0 }}>
            <Link
              to={projectIdStr ? `/projects/${projectIdStr}` : '/projects'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              <ArrowLeft style={{ width: '18px', height: '18px' }} />
              项目
            </Link>
            <div style={{ height: '16px', width: '1px', background: 'var(--border-secondary)', flexShrink: 0 }} />
            <h1 style={{
              fontSize: '18px',
              fontWeight: 800,
              background: 'var(--gradient-accent)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              letterSpacing: '-0.02em',
              margin: 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              剧本编辑器
            </h1>
          </div>
          <div
            style={{
              fontSize: '11px',
              color: 'var(--text-tertiary)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              flexWrap: 'wrap',
            }}
            title="主流程：撰写 → 保存到服务器 → 解析预览 → 后续在资产页同步"
          >
            <span style={{ fontWeight: 700, color: editorMode === 'edit' ? 'var(--accent)' : undefined }}>① 撰写</span>
            <span style={{ opacity: 0.6 }}>→</span>
            <span style={{ fontWeight: 700, color: !serverDirty && serverBaseline !== null ? 'var(--secondary)' : serverDirty ? 'var(--warning, #f59e0b)' : undefined }}>
              ② 保存服务器
            </span>
            <span style={{ opacity: 0.6 }}>→</span>
            <span style={{ fontWeight: 700, color: editorMode === 'preview' || hasParsedResult ? 'var(--accent)' : undefined }}>③ 解析预览</span>
            <span style={{ opacity: 0.6 }}>→</span>
            <span style={{ opacity: 0.75 }}>④ 同步资产</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>
            {isSaving ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} />
                正在保存到服务器…
              </span>
            ) : serverDirty ? (
              <span style={{ color: 'var(--warning, #f59e0b)', fontWeight: 600 }}>有修改未保存到服务器（Ctrl+S）</span>
            ) : serverBaseline !== null ? (
              <span style={{ color: 'var(--secondary)' }}>服务器已保存 {serverTimeLabel ?? ''}</span>
            ) : (
              <span>尚未保存到服务器</span>
            )}
            <span style={{ opacity: 0.5 }}>|</span>
            <span>
              {autoSaveEnabled
                ? savedTimeLabel
                  ? `本地草稿 ${savedTimeLabel}`
                  : '本地草稿将自动缓存'
                : '本地自动缓存已关闭'}
            </span>
            {undoStack.length > 0 && (
              <button
                type="button"
                onClick={handleUndoLast}
                title="撤销上一次正文替换（如 AI 或模板）"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-primary)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <RotateCcw style={{ width: '12px', height: '12px' }} />
                撤销
              </button>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0, paddingTop: '2px' }}>
          <button
            type="button"
            onClick={() => toggleTheme()}
            title="切换主题"
            style={{
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '12px',
              background: 'var(--bg-input)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-primary)',
              cursor: 'pointer',
            }}
          >
            {resolvedTheme === 'dark' ? (
              <Moon style={{ width: '20px', height: '20px' }} />
            ) : (
              <Sun style={{ width: '20px', height: '20px' }} />
            )}
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={isSaving || !title.trim() || !content.trim() || !serverDirty}
            title="保存到服务器（Ctrl+S）"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '12px',
              background: serverDirty ? 'var(--accent)' : 'var(--bg-input)',
              color: serverDirty ? 'var(--accent-text, #fff)' : 'var(--text-tertiary)',
              border: serverDirty ? 'none' : '1px solid var(--border-primary)',
              fontSize: '13px',
              fontWeight: 700,
              cursor: isSaving || !title.trim() || !content.trim() || !serverDirty ? 'not-allowed' : 'pointer',
              opacity: !title.trim() || !content.trim() ? 0.5 : 1,
            }}
          >
            {isSaving ? <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} /> : <Save style={{ width: '16px', height: '16px' }} />}
            保存
          </button>
          <div ref={templateMenuRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowTemplateMenu((v) => !v);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 16px',
                borderRadius: '9999px',
                border: '1px solid var(--border-primary)',
                background: 'var(--bg-input)',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              剧本模板
              <ChevronDown style={{ width: '18px', height: '18px' }} />
            </button>
            {showTemplateMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  minWidth: '220px',
                  padding: '8px',
                  borderRadius: '12px',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-primary)',
                  boxShadow: 'var(--shadow-card)',
                  zIndex: 60,
                }}
              >
                {SCRIPT_TEMPLATES.map((t) => (
                  <button
                    key={t.name}
                    type="button"
                    onClick={() => requestApplyTemplate(t.template)}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    {t.icon} {t.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleSharePage}
            style={{
              padding: '6px 16px',
              borderRadius: '9999px',
              background: 'var(--bg-elevated)',
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              border: '1px solid var(--border-primary)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            分享
          </button>
          <button
            type="button"
            onClick={handleExport}
            style={{
              padding: '6px 20px',
              borderRadius: '9999px',
              background: 'var(--gradient-accent)',
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--accent-text)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: 'var(--shadow-accent)',
            }}
          >
            导出文本
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '4px' }}>
            <span title="通知即将推出">
              <Bell style={{ width: '20px', height: '20px', color: 'var(--text-secondary)', cursor: 'default', opacity: 0.5 }} />
            </span>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--accent-bg)',
              border: '1px solid var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--accent)',
            }}>
              {user?.avatar_url ? (
                <img
                  alt=""
                  src={user.avatar_url}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                (user?.name || user?.email || '?').slice(0, 1).toUpperCase()
              )}
            </div>
          </div>
        </div>
      </header>

      <main style={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        overflow: 'hidden',
      }}>
        <section style={{
          flex: 1,
          background: 'var(--bg-page)',
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          overflow: 'hidden',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '12px 32px',
            borderBottom: '1px solid var(--border-primary)',
            background: 'var(--bg-surface)',
            backdropFilter: 'blur(12px)',
          }}>
            <div
              style={{
                display: 'inline-flex',
                padding: '3px',
                borderRadius: '10px',
                background: 'var(--bg-page)',
                border: '1px solid var(--border-primary)',
                gap: '2px',
              }}
              title="在正文编辑与解析预览（含生成资产）之间切换"
            >
              <button
                type="button"
                onClick={() => setEditorMode('edit')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: editorMode === 'edit' ? 'var(--accent-bg)' : 'transparent',
                  color: editorMode === 'edit' ? 'var(--accent)' : 'var(--text-muted)',
                }}
              >
                <Pencil style={{ width: '14px', height: '14px' }} />
                编辑
              </button>
              <button
                type="button"
                disabled={!hasParsedResult || parsedScenes.length === 0}
                onClick={() => setEditorMode('preview')}
                title={
                  !hasParsedResult || parsedScenes.length === 0
                    ? '请先点击「剧本解析」或侧栏解析，成功解析后可在此预览并生成资产'
                    : '查看解析结果并生成角色 / 场景 / 分镜等资产'
                }
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor:
                    !hasParsedResult || parsedScenes.length === 0 ? 'not-allowed' : 'pointer',
                  opacity: !hasParsedResult || parsedScenes.length === 0 ? 0.45 : 1,
                  background: editorMode === 'preview' ? 'var(--accent-bg)' : 'transparent',
                  color: editorMode === 'preview' ? 'var(--accent)' : 'var(--text-muted)',
                }}
              >
                <Eye style={{ width: '14px', height: '14px' }} />
                预览与资产
              </button>
            </div>
            <div style={{ height: '16px', width: '1px', background: 'var(--border-secondary)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} title="纯文本剧本，请直接按剧本文法书写">
              <FileText style={{ width: '18px', height: '18px', color: 'var(--text-tertiary)', opacity: 0.6 }} />
              <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>纯文本编辑</span>
            </div>
            <div style={{ height: '16px', width: '1px', background: 'var(--border-secondary)' }} />
            <button
              type="button"
              disabled={aiBusy || !content.trim()}
              onClick={requestRewriteScript}
              title="使用右侧所选模型改写全文（确认后执行）"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 12px',
                borderRadius: '8px',
                background: 'var(--accent-bg)',
                color: 'var(--accent)',
                fontSize: '12px',
                fontWeight: 700,
                border: 'none',
                cursor: aiBusy || !content.trim() ? 'not-allowed' : 'pointer',
                opacity: aiBusy || !content.trim() ? 0.55 : 1,
                transition: 'all 0.2s ease',
              }}
            >
              {isRewriting ? <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} /> : <Zap style={{ width: '16px', height: '16px' }} />}
              AI 改写
            </button>
            <button
              type="button"
              disabled={aiBusy || !content.trim()}
              onClick={handleParseScenes}
              title="解析场景结构（与侧栏「剧本解析」相同）"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 12px',
                borderRadius: '8px',
                background: 'var(--secondary-bg)',
                color: 'var(--secondary)',
                fontSize: '12px',
                fontWeight: 700,
                border: 'none',
                cursor: aiBusy || !content.trim() ? 'not-allowed' : 'pointer',
                opacity: aiBusy || !content.trim() ? 0.55 : 1,
                transition: 'all 0.2s ease',
              }}
            >
              {isParsingScenes ? <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} /> : <TrendingUp style={{ width: '16px', height: '16px' }} />}
              剧本解析
            </button>
          </div>

          <div style={{
            flex: 1,
            overflow: 'hidden',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
          }}>
            {editorMode === 'edit' ? (
              <div style={{ flex: 1, minHeight: 0, borderRadius: '16px', overflow: 'hidden' }}>
                <MonacoEditor
                  height="100%"
                  language="plaintext"
                  theme={resolvedTheme === 'dark' ? 'vs-dark' : 'vs-light'}
                  value={content}
                  onChange={(value) => setContent(value || '')}
                  options={{ ...editorOptions, wordWrap: 'on' }}
                  onSave={handleSave}
                />
              </div>
            ) : (
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
        </section>

        {!isFullscreen && (
        <aside style={{
          width: '320px',
          minWidth: '320px',
          maxWidth: '320px',
          background: 'var(--bg-card)',
          backdropFilter: 'blur(40px)',
          borderLeft: '1px solid var(--border-primary)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '24px',
            borderBottom: '1px solid var(--border-primary)',
          }}>
            <h2 style={{
              fontSize: '14px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--accent)',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              letterSpacing: '-0.02em',
            }}>
              <Sparkles style={{ width: '20px', height: '20px' }} />
              AI 剧本助手
            </h2>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '24px', overflowX: 'hidden' }}>
            <div style={{ marginBottom: '32px' }}>
              <p style={{
                fontSize: '10px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color: 'var(--text-secondary)',
                marginBottom: '16px',
              }}>
                剧本解析模式
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '4px',
                padding: '4px',
                background: 'var(--bg-page)',
                borderRadius: '12px',
                border: '1px solid var(--border-primary)',
              }}>
                <button
                  type="button"
                  onClick={() => setUseAIParsing(true)}
                  style={{
                    padding: '8px',
                    fontSize: '11px',
                    fontWeight: 700,
                    borderRadius: '8px',
                    background: useAIParsing ? 'var(--bg-elevated)' : 'transparent',
                    color: useAIParsing ? 'var(--accent)' : 'var(--text-secondary)',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: useAIParsing ? '0 2px 8px var(--shadow-md)' : 'none',
                  }}
                >
                  AI 智能
                </button>
                <button
                  type="button"
                  onClick={() => setUseAIParsing(false)}
                  style={{
                    padding: '8px',
                    fontSize: '11px',
                    fontWeight: 700,
                    borderRadius: '8px',
                    background: !useAIParsing ? 'var(--bg-elevated)' : 'transparent',
                    color: !useAIParsing ? 'var(--accent)' : 'var(--text-secondary)',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: !useAIParsing ? '0 2px 8px var(--shadow-md)' : 'none',
                  }}
                >
                  快速正则
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <p style={{
                fontSize: '10px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color: 'var(--text-secondary)',
                marginBottom: '16px',
              }}>
                小说转剧本格式配置
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>预期集数</label>
                  <input
                    type="number"
                    min={1}
                    value={formatEpisodes}
                    onChange={(e) => setFormatEpisodes(Math.max(1, Number(e.target.value) || 1))}
                    style={{
                      width: '64px',
                      background: 'var(--bg-page)',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: 'var(--accent)',
                      textAlign: 'center',
                      outline: 'none',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>单集时长 (min)</label>
                  <input
                    type="number"
                    min={1}
                    value={formatMinutes}
                    onChange={(e) => setFormatMinutes(Math.max(1, Number(e.target.value) || 1))}
                    style={{
                      width: '64px',
                      background: 'var(--bg-page)',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: 'var(--accent)',
                      textAlign: 'center',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>
            </div>

            <div>
              <p style={{
                fontSize: '10px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color: 'var(--text-secondary)',
                marginBottom: '16px',
              }}>
                核心指令
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
              }}>
                {aiActions.map((action, index) => {
                  const needsContent = action.label !== '场景优化';
                  const needsModel =
                    action.label === 'AI 续写' ||
                    action.label === 'AI 改写' ||
                    action.label === 'AI 优化' ||
                    action.label === '格式转换' ||
                    (action.label === '剧本解析' && useAIParsing);
                  const disabled =
                    aiBusy ||
                    (needsContent && !content.trim()) ||
                    (needsModel && !selectedModel);
                  return (
                  <button
                    key={index}
                    type="button"
                    disabled={disabled}
                    onClick={() => runAiAction(action.label)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '12px',
                      borderRadius: '16px',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-primary)',
                      cursor: disabled ? 'not-allowed' : 'pointer',
                      opacity: disabled ? 0.5 : 1,
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (disabled) return;
                      e.currentTarget.style.borderColor = action.color;
                      e.currentTarget.style.background = 'var(--bg-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-primary)';
                      e.currentTarget.style.background = 'var(--bg-surface)';
                    }}
                  >
                    <action.icon style={{ width: '22px', height: '22px', color: action.color, marginBottom: '4px' }} />
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      textAlign: 'center',
                    }}>
                      {action.label}
                    </span>
                  </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div style={{
            padding: '24px',
            background: 'var(--bg-surface)',
            backdropFilter: 'blur(24px)',
            borderTop: '1px solid var(--border-primary)',
          }}>
            <div style={{ marginBottom: '16px' }}>
              <p style={{
                fontSize: '10px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: 'var(--text-secondary)',
                marginBottom: '8px',
              }}>
                模型
              </p>
              <ModelSelector
                content_type="script"
                value={selectedModel}
                on_change={setSelectedModel}
                auto_select_when_empty={true}
                show_last_used={true}
                show_default={true}
                placeholder="选择剧本模型"
                style={{ width: '100%' }}
              />
            </div>
            <button
              type="button"
              onClick={() => setIsFullscreen((v) => !v)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px',
                borderRadius: '14px',
                background: 'var(--bg-elevated)',
                backdropFilter: 'blur(40px)',
                border: '1px solid var(--border-primary)',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.06em',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <Maximize style={{ width: '20px', height: '20px' }} />
              {isFullscreen ? '退出全屏编辑' : '进入全屏编辑'}
            </button>
          </div>
        </aside>
        )}
      </main>

      {isFullscreen && (
        <button
          type="button"
          onClick={() => setIsFullscreen(false)}
          style={{
            position: 'absolute',
            bottom: '24px',
            right: '24px',
            zIndex: 45,
            padding: '10px 16px',
            borderRadius: '12px',
            border: '1px solid var(--border-primary)',
            background: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          显示 AI 助手
        </button>
      )}

      <div style={{
        position: 'fixed',
        top: '-10%',
        right: '-10%',
        width: '40%',
        height: '40%',
        background: 'var(--accent-glow)',
        borderRadius: '50%',
        filter: 'blur(120px)',
        pointerEvents: 'none',
        zIndex: -1,
      }} />
      <div style={{
        position: 'fixed',
        bottom: '-10%',
        left: '5%',
        width: '30%',
        height: '30%',
        background: 'var(--tertiary-glow)',
        borderRadius: '50%',
        filter: 'blur(100px)',
        pointerEvents: 'none',
        zIndex: -1,
      }} />

      <ConfirmModal
        open={!!pendingDestructive && !!destructiveModalCopy}
        onClose={() => setPendingDestructive(null)}
        onConfirm={handleConfirmDestructive}
        title={destructiveModalCopy?.title ?? ''}
        description={destructiveModalCopy?.description ?? ''}
        confirmText={destructiveModalCopy?.confirm ?? '确定'}
        cancelText="取消"
        confirmVariant={pendingDestructive?.kind === 'template' ? 'danger' : 'primary'}
        icon="warning"
      />

      <ConfirmModal
        open={showReparseConfirm}
        onClose={() => setShowReparseConfirm(false)}
        onConfirm={() => void executeParse()}
        title="重新解析剧本"
        description="当前已有解析结果，重新解析将用新结果替换场景列表与预览。是否继续？"
        confirmText="重新解析"
        cancelText="取消"
        confirmVariant="primary"
        icon="warning"
      />

      <SceneOptimizer
        is_open={showSceneOptimizerModal}
        on_close={() => setShowSceneOptimizerModal(false)}
        script_content={content}
        on_apply_optimization={(optimized_content) => {
          pushUndoSnapshot();
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

      <AIProcessingProgress tasks={tasks} onClear={removeCompletedTasks} />

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--accent-bg); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: var(--accent); }
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