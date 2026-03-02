import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Sparkles, Wand2, Zap, FileCode, MapPin, FileEdit, FileText } from 'lucide-react';
import { 
  EditorHeader, 
  AIToolsPanel, 
  EditorMain, 
  PreviewPanel, 
  DownloadDialog, 
  NovelToScriptDialog 
} from '../components/editor';
import { SceneOptimizer } from '../components/SceneOptimizer';
import { PromptOptimizer } from '../components/ai/PromptOptimizer';
import { ParsePreview } from '../components/ParsePreview';
import { AIProcessingProgress, AIProcessingTask } from '../components/AIProcessingProgress';
import { apiClient } from '../lib/api';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../components/ui/Toast';
import { ContentProvider, useContent, ContentMode } from '../contexts/ContentContext';
import { Button } from '../components/ui/button-new';

interface Scene {
  id: string | number;
  number?: number;
  heading?: string;
  location?: string;
  time?: string;
  description: string;
  characters?: string[];
  dialogues?: Array<{ characterName: string; text: string }>;
  actions?: Array<{ description: string; type: string }>;
  items?: Array<{ name: string; size?: string; shape?: string; color?: string }>;
  dialogue?: any[];
  action?: string;
  type?: string;
}

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
  const [characters, setCharacters] = useState<Array<string | { name: string; description?: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [isContinuing, setIsContinuing] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isParsingScenes, setIsParsingScenes] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [useAIParsing, setUseAIParsing] = useState(true);
  const [showSceneOptimizerModal, setShowSceneOptimizerModal] = useState(false);
  const [showPromptOptimizerModal, setShowPromptOptimizerModal] = useState(false);
  const [showParsePreview, setShowParsePreview] = useState(false);
  const [parsePreviewData, setParsePreviewData] = useState<any>(null);
  const [aiProcessingTasks, setAiProcessingTasks] = useState<AIProcessingTask[]>([]);
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [showNovelToScriptDialog, setShowNovelToScriptDialog] = useState(false);
  const [novelText, setNovelText] = useState('');
  const [conversionResult, setConversionResult] = useState<string>('');
  const [editorMode, setEditorMode] = useState<'edit' | 'preview'>('edit');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [showAIPanel, setShowAIPanel] = useState(true);
  const [isGeneratingAssets, setIsGeneratingAssets] = useState(false);
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

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;
    try {
      setIsSaving(true);
      await apiClient.saveScript(projectIdStr, title, content);
      saveToLocalStorage(mode);
      setLastSaved(new Date());
      addToast({ type: 'success', title: '保存成功' });
    } catch (error) {
      console.error('保存失败:', error);
      addToast({ type: 'error', title: '保存失败', message: '请稍后重试。' });
    } finally {
      setIsSaving(false);
    }
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

  const handleContinueScript = async () => {
    if (!content.trim() || isContinuing) return;
    if (!selectedModel) {
      addToast({ type: 'warning', title: '请选择模型', message: '请先选择一个 AI 模型来生成内容。' });
      return;
    }
    try {
      setIsContinuing(true);
      const result = await apiClient.processContentWithFile(content, 'continue', selectedModel);
      
      if (result.fileUrl) {
        const fileResponse = await fetch(result.fileUrl);
        const fileContent = await fileResponse.text();
        setContent(fileContent);
        addToast({ type: 'success', title: 'AI续写完成', message: '文件已自动下载并填入编辑器' });
      } else if (result.content) {
        setContent(result.content);
      }
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
      const result = await apiClient.processContentWithFile(content, 'rewrite', selectedModel);
      
      if (result.fileUrl) {
        const fileResponse = await fetch(result.fileUrl);
        const fileContent = await fileResponse.text();
        setContent(fileContent);
        addToast({ type: 'success', title: 'AI改写完成', message: '文件已自动下载并填入编辑器' });
      } else if (result.content) {
        setContent(result.content);
      }
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

  const handleParseScript = async () => {
    if (!content.trim() || isParsingScenes) {
      if (!content.trim()) {
        addToast({ type: 'warning', title: '内容为空', message: '请先在编辑器中输入剧本内容' });
      }
      return;
    }
    
    try {
      setIsParsingScenes(true);

      const taskId = Date.now().toString();
      const newTask: AIProcessingTask = {
        id: taskId,
        type: 'parsing',
        title: useAIParsing ? 'AI智能解析剧本' : '快速正则解析',
        progress: 0,
        status: 'processing'
      };
      setAiProcessingTasks(prev => [...prev, newTask]);

      let result;
      if (useAIParsing) {
        setAiProcessingTasks(prev => 
          prev.map(t => t.id === taskId ? { ...t, progress: 20 } : t)
        );
        result = await apiClient.parseScriptWithAI(content, selectedModel);
        setAiProcessingTasks(prev => 
          prev.map(t => t.id === taskId ? { ...t, progress: 80 } : t)
        );
      } else {
        setAiProcessingTasks(prev => 
          prev.map(t => t.id === taskId ? { ...t, progress: 50 } : t)
        );
        result = await apiClient.parseScript(content);
        setAiProcessingTasks(prev => 
          prev.map(t => t.id === taskId ? { ...t, progress: 100 } : t)
        );
      }
      
      setAiProcessingTasks(prev => 
        prev.map(t => t.id === taskId ? { ...t, progress: 100, status: 'completed' } : t)
      );
      
      console.log('[剧本解析] 结果:', result);
      console.log('[剧本解析] scenes:', result.scenes);
      console.log('[剧本解析] scenes.length:', result.scenes?.length);
      console.log('[剧本解析] items:', result.items);
      console.log('[剧本解析] 第一个场景:', result.scenes?.[0]);
      console.log('[剧本解析] 第一个场景的dialogues:', result.scenes?.[0]?.dialogues);
      console.log('[剧本解析] 第一个场景的items:', result.scenes?.[0]?.items);
      
      if (result.scenes && result.scenes.length > 0) {
        console.log('[剧本解析] 切换到预览模式');
        setParsedScenes(result.scenes);
        setCharacters(result.characters || []);
        setEditorMode('preview');
        const itemsCount = result.items?.length || result.scenes.reduce((sum: number, s: any) => sum + (s.items?.length || 0), 0);
        addToast({ type: 'success', title: '解析成功', message: `成功解析 ${result.scenes.length} 个场景，${result.characters?.length || 0} 个角色，${itemsCount} 个物品` });
      } else {
        setAiProcessingTasks(prev => 
          prev.map(t => t.id === taskId ? { ...t, status: 'failed', error: '未检测到场景' } : t)
        );
        addToast({ type: 'info', title: '未检测到场景', message: '请确保剧本格式正确，包含场景标记' });
      }
    } catch (error) {
      console.error('[剧本解析] 失败:', error);
      setAiProcessingTasks(prev => 
        prev.map(t => t.id === (prev.find(t => t.status === 'processing')?.id || '') 
          ? { ...t, status: 'failed', error: error instanceof Error ? error.message : '未知错误' } 
          : t)
      );
      addToast({ type: 'error', title: '剧本解析失败', message: error instanceof Error ? error.message : '请稍后重试' });
    } finally {
      setIsParsingScenes(false);
    }
  };

  const handleNovelToScript = async (options: any) => {
    const sourceText = novelText || content;
    if (!sourceText.trim() || isConverting) return;

    setShowNovelToScriptDialog(false);
    
    try {
      setIsConverting(true);
      addToast({ type: 'info', title: '正在转换', message: `正在将小说转换为${options.episodes}集剧本...` });
      
      const result = await apiClient.adaptToScript({
        title: title || '未命名',
        content: sourceText,
        chapters: [],
      }, { 
        model: selectedModel,
        targetLength: options.episodes * options.durationPerEpisode,
        genre: options.genre,
        targetAudience: options.targetAudience,
        tone: options.tone,
        focus: options.focus,
        keepNarrator: options.keepNarrator,
        dialogueStyle: options.dialogueStyle,
        includeShotList: options.includeShotList,
        endingType: options.endingType,
        customPrompt: options.enableCustomPrompt ? options.customPrompt : undefined,
      });
      
      const scriptContent = result.script || result.content || '';
      
      if (scriptContent.length > 50000) {
        setConversionResult(scriptContent);
        setShowDownloadDialog(true);
        addToast({ type: 'info', title: '结果较长', message: '转换结果已生成，您可以下载文件或在编辑器中查看' });
      } else {
        setContent(scriptContent);
        saveToLocalStorage(mode);
        addToast({ type: 'success', title: '转换成功', message: `小说已成功转换为${options.episodes}集剧本格式` });
      }
      
      setNovelText('');
    } catch (error) {
      console.error('小说转换失败:', error);
      addToast({ type: 'error', title: '转换失败', message: '转换过程中出现错误，请稍后重试' });
    } finally {
      setIsConverting(false);
    }
  };

  const handleGenerateAssets = async () => {
    if (!projectIdStr || parsedScenes.length === 0) return;
    
    try {
      setIsGeneratingAssets(true);
      addToast({ type: 'info', title: '开始生成', message: '正在根据解析结果创建角色、物品、场景和分镜...' });

      const createdAssets = {
        characters: 0,
        items: 0,
        scenes: 0,
        shots: 0,
      };

      const errors: string[] = [];

      for (const char of characters) {
        try {
          const charName = typeof char === 'string' ? char : char.name;
          const charObj = typeof char === 'object' ? char : {} as any;
          
          // 组合外貌属性生成完整的外貌描述
          const appearanceParts: string[] = [];
          
          // 发型
          if (charObj.appearance?.hairStyle) {
            appearanceParts.push(charObj.appearance.hairStyle);
          }
          // 五官
          if (charObj.appearance?.facialFeatures) {
            appearanceParts.push(charObj.appearance.facialFeatures);
          }
          // 身材
          if (charObj.appearance?.bodyProportion) {
            appearanceParts.push(charObj.appearance.bodyProportion);
          }
          // 其他外貌细节
          if (charObj.appearance?.otherDetails && Array.isArray(charObj.appearance.otherDetails)) {
            appearanceParts.push(...charObj.appearance.otherDetails);
          }
          // 服装类型和颜色
          if (charObj.costume?.type) {
            const costumeParts = [charObj.costume.type];
            if (charObj.costume.color) costumeParts.push(charObj.costume.color);
            if (charObj.costume.material) costumeParts.push(charObj.costume.material);
            if (charObj.costume.decoration) costumeParts.push(charObj.costume.decoration);
            appearanceParts.push(`穿着${costumeParts.join('、')}`);
          }
          
          const appearanceDesc = appearanceParts.length > 0 
            ? appearanceParts.join('，') 
            : (charObj.description || `角色 ${charName} 的外貌描述`);

          await apiClient.createCharacter(projectIdStr, {
            name: charName,
            appearance: appearanceDesc,
            age: 25,
            gender: 'unknown',
          } as any);
          createdAssets.characters++;
        } catch (err: any) {
          const errMsg = err?.message || String(err);
          console.warn(`创建角色失败: ${char}`, err);
          if (!errors.includes(errMsg)) errors.push(errMsg);
        }
      }

      const allItems = parsedScenes.flatMap(s => s.items || []);
      const uniqueItems = Array.from(new Map(allItems.map(i => [i.name, i])).values());
      
      for (const item of uniqueItems) {
        try {
          await apiClient.createItem(projectIdStr, {
            name: item.name,
            description: `${item.size || ''} ${item.shape || ''} ${item.color || ''}`.trim(),
          } as any);
          createdAssets.items++;
        } catch (err: any) {
          const errMsg = err?.message || String(err);
          console.warn(`创建物品失败: ${item.name}`, err);
          if (!errors.includes(errMsg)) errors.push(errMsg);
        }
      }

      for (let i = 0; i < parsedScenes.length; i++) {
        const scene = parsedScenes[i];
        try {
          const sceneData = await apiClient.createScene(projectIdStr, {
            location: scene.location || scene.heading?.substring(0, 30) || `场景 ${i + 1}`,
            time: scene.time || '白天',
            atmosphere: scene.description || '',
          } as any);

          if (scene.dialogues && scene.dialogues.length > 0) {
            for (let j = 0; j < scene.dialogues.length; j++) {
              const dialogue = scene.dialogues[j];
              const charName = dialogue.characterName || '角色';
              const dialogueText = dialogue.text || '';
              const sceneItems = scene.items?.map((i: any) => i.name).filter(Boolean) || [];
              const shot = (dialogue as any).shot || {};
              
              const startPrompt = `【场景】${scene.location || scene.heading || '室内'}，${scene.time || '白天'}\n` +
                `【氛围】${scene.description?.substring(0, 100) || '普通场景'}\n` +
                `【角色】${charName}${scene.characters?.filter((c: string) => c !== charName).length ? `，${scene.characters?.filter((c: string) => c !== charName).join('、')}` : ''}\n` +
                `【物品】${sceneItems.length > 0 ? sceneItems.join('、') : '无特殊物品'}\n` +
                `【镜头】${shot.type || '中景'}，${shot.movement || '固定'}，${shot.angle || '平视'}\n` +
                `【镜头描述】${shot.description || `${charName}正在说话`}\n` +
                `【台词】${charName}："${dialogueText}"`;
              
              const endPrompt = `【场景】${scene.location || scene.heading || '室内'}，${scene.time || '白天'}\n` +
                `【氛围】${scene.description?.substring(0, 100) || '普通场景'}\n` +
                `【角色】${charName}说完台词后的表情变化\n` +
                `【镜头】${shot.transition || '切'}转场`;

              try {
                await apiClient.createShot(projectIdStr, {
                  sceneId: sceneData.id,
                  chapterNumber: i + 1,
                  episodeNumber: 1,
                  segmentId: 1,
                  cellId: j + 1,
                  actionSummary: `${charName}: "${dialogueText}"`,
                  startPrompt,
                  endPrompt,
                  duration: shot.duration || Math.max(3, Math.ceil(dialogueText.length / 8)),
                  aspectRatio: '16:9',
                  cameraMovement: `${shot.type || '中景'}，${shot.movement || '固定'}，${shot.angle || '平视'}`,
                } as any);
                createdAssets.shots++;
              } catch (err: any) {
                const errMsg = err?.message || String(err);
                console.warn(`创建分镜失败:`, err);
                if (!errors.includes(errMsg)) errors.push(errMsg);
              }
            }
          }
          createdAssets.scenes++;
        } catch (err: any) {
          const errMsg = err?.message || String(err);
          console.warn(`创建场景失败:`, err);
          if (!errors.includes(errMsg)) errors.push(errMsg);
        }
      }

      const totalCreated = createdAssets.characters + createdAssets.items + createdAssets.scenes + createdAssets.shots;
      
      if (totalCreated === 0 && errors.length > 0) {
        addToast({ 
          type: 'error', 
          title: '生成失败', 
          message: `无法创建资产: ${errors[0]}` 
        });
      } else if (errors.length > 0) {
        addToast({ 
          type: 'warning', 
          title: '部分生成成功', 
          message: `已创建 ${createdAssets.characters} 角色、${createdAssets.items} 物品、${createdAssets.scenes} 场景、${createdAssets.shots} 分镜。部分失败: ${errors[0]}` 
        });
      } else {
        addToast({ 
          type: 'success', 
          title: '生成完成', 
          message: `已创建 ${createdAssets.characters} 个角色、${createdAssets.items} 个物品、${createdAssets.scenes} 个场景、${createdAssets.shots} 个分镜` 
        });
      }
    } catch (error) {
      console.error('生成资产失败:', error);
      addToast({ type: 'error', title: '生成失败', message: '创建资产时发生错误' });
    } finally {
      setIsGeneratingAssets(false);
    }
  };

  const aiTools = [
    { id: 'continue', label: 'AI续写', icon: Sparkles, color: '#007AFF', handler: handleContinueScript, loading: isContinuing, disabled: isContinuing || isRewriting || isOptimizing || isConverting || !content.trim() || !selectedModel },
    { id: 'rewrite', label: 'AI改写', icon: Wand2, color: '#10b981', handler: handleRewriteScript, loading: isRewriting, disabled: isContinuing || isRewriting || isOptimizing || isConverting || !content.trim() || !selectedModel },
    { id: 'optimize', label: 'AI优化', icon: Zap, color: '#f59e0b', handler: handleOptimizeScript, loading: isOptimizing, disabled: isContinuing || isRewriting || isOptimizing || isConverting || !content.trim() || !selectedModel },
    { id: 'prompt-optimize', label: 'Prompt优化', icon: FileCode, color: '#06b6d4', handler: () => setShowPromptOptimizerModal(true), loading: false, disabled: false },
    { id: 'parse', label: '剧本解析', icon: MapPin, color: '#ec4899', handler: handleParseScript, loading: isParsingScenes, disabled: isParsingScenes || isConverting || !content.trim() },
    { id: 'scene-optimizer', label: '场景优化', icon: FileEdit, color: '#6366f1', handler: () => setShowSceneOptimizerModal(true), loading: false, disabled: !content.trim() },
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
      <EditorHeader
        projectId={projectIdStr}
        title={title}
        mode={mode}
        autoSaveEnabled={autoSaveEnabled}
        isSaving={isSaving}
        lastSaved={lastSaved}
        onToggleAutoSave={() => setAutoSaveEnabled(!autoSaveEnabled)}
        onSave={handleSave}
        onImport={handleImport}
        onExport={handleExport}
        onApplyTemplate={(template) => setContent(template)}
      />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {editorMode === 'edit' ? (
          <EditorMain
            content={content}
            onContentChange={setContent}
            theme={theme}
            showAIPanel={showAIPanel}
            lastSaved={lastSaved}
            autoSaveEnabled={autoSaveEnabled}
            onSave={handleSave}
          />
        ) : (
          <PreviewPanel
            scenes={parsedScenes}
            characters={characters}
            onEdit={() => setEditorMode('edit')}
            onGenerateAssets={handleGenerateAssets}
            isGenerating={isGeneratingAssets}
          />
        )}
      </div>

      <AIToolsPanel
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
        showAIPanel={showAIPanel}
        onTogglePanel={() => setShowAIPanel(!showAIPanel)}
        useAIParsing={useAIParsing}
        onToggleAIParsing={setUseAIParsing}
        editorMode={editorMode}
        onToggleEditorMode={() => setEditorMode(editorMode === 'edit' ? 'preview' : 'edit')}
        tools={aiTools}
      />

      <DownloadDialog
        isOpen={showDownloadDialog}
        onClose={() => setShowDownloadDialog(false)}
        content={conversionResult}
        title={title}
        onApply={() => {
          setContent(conversionResult);
          saveToLocalStorage(mode);
          setShowDownloadDialog(false);
          addToast({ type: 'success', title: '已应用到编辑器' });
        }}
      />

      <SceneOptimizer
        isOpen={showSceneOptimizerModal}
        onClose={() => setShowSceneOptimizerModal(false)}
        scriptContent={content}
        onApplyOptimization={(optimizedContent) => {
          setContent(optimizedContent);
          addToast({ type: 'success', title: '优化已应用', message: '剧本优化内容已应用' });
        }}
      />

      {showParsePreview && (
        <ParsePreview
          isOpen={showParsePreview}
          onClose={() => setShowParsePreview(false)}
          data={parsePreviewData}
          onSave={() => {
            setShowParsePreview(false);
            addToast({ type: 'success', title: '已保存', message: '解析结果已保存' });
          }}
        />
      )}

      {showPromptOptimizerModal && (
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
        }} onClick={() => setShowPromptOptimizerModal(false)}>
          <div style={{
            backgroundColor: 'var(--bg-primary)',
            borderRadius: '12px',
            maxWidth: '900px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
          }} onClick={e => e.stopPropagation()}>
            <PromptOptimizer
              initialPrompt=""
              onOptimize={async (prompt: string) => {
                const result = await apiClient.optimizePrompt(prompt, selectedModel);
                return result.optimized;
              }}
              onSave={(prompt, name, category) => {
                addToast({ type: 'success', title: '模板已保存', message: `模板 "${name}" 已保存到 ${category}` });
              }}
            />
            <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)' }}>
              <Button variant="outline" onClick={() => setShowPromptOptimizerModal(false)}>
                关闭
              </Button>
            </div>
          </div>
        </div>
      )}

      <NovelToScriptDialog
        isOpen={showNovelToScriptDialog}
        onClose={() => {
          setShowNovelToScriptDialog(false);
          setNovelText('');
        }}
        onConvert={handleNovelToScript}
        isConverting={isConverting}
        novelText={novelText}
        editorContent={content}
      />

      <AIProcessingProgress
        tasks={aiProcessingTasks}
        onClear={() => setAiProcessingTasks([])}
      />

      <style>
        {`
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
