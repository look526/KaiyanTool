import { useState } from 'react';
import { Plus, Trash2, RefreshCw, Wand2, Grid, Image as ImageIcon } from 'lucide-react';

interface NineGridPanel {
  id: string;
  position: number;
  prompt: string;
  imageUrl?: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
}

interface BatchGeneratePanelProps {
  projectId: string;
  defaultPrompt?: string;
  onGenerate: (prompts: string[]) => Promise<void>;
}

export function BatchGeneratePanel({ defaultPrompt = '', onGenerate }: BatchGeneratePanelProps) {
  const [panels, setPanels] = useState<NineGridPanel[]>([
    { id: '1', position: 1, prompt: defaultPrompt, status: 'pending' },
    { id: '2', position: 2, prompt: defaultPrompt, status: 'pending' },
    { id: '3', position: 3, prompt: defaultPrompt, status: 'pending' },
    { id: '4', position: 4, prompt: defaultPrompt, status: 'pending' },
    { id: '5', position: 5, prompt: defaultPrompt, status: 'pending' },
    { id: '6', position: 6, prompt: defaultPrompt, status: 'pending' },
    { id: '7', position: 7, prompt: defaultPrompt, status: 'pending' },
    { id: '8', position: 8, prompt: defaultPrompt, status: 'pending' },
    { id: '9', position: 9, prompt: defaultPrompt, status: 'pending' }
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [basePrompt, setBasePrompt] = useState(defaultPrompt);
  const [variations, setVariations] = useState(true);

  const updatePanel = (id: string, updates: Partial<NineGridPanel>) => {
    setPanels(prev =>
      prev.map(p => p.id === id ? { ...p, ...updates } : p)
    );
  };

  const addPanel = () => {
    const newId = String(Math.max(...panels.map(p => parseInt(p.id))) + 1);
    setPanels(prev => [
      ...prev,
      { id: newId, position: prev.length + 1, prompt: basePrompt, status: 'pending' }
    ]);
  };

  const removePanel = (id: string) => {
    setPanels(prev => prev.filter(p => p.id !== id));
  };

  const regeneratePrompt = async (panel: NineGridPanel) => {
    if (!variations || !basePrompt) return panel.prompt;
    return `${basePrompt}, variation ${panel.position}`;
  };

  const handleBatchGenerate = async () => {
    setIsGenerating(true);
    try {
      const prompts = await Promise.all(
        panels.map(async (panel) => {
          const prompt = variations ? await regeneratePrompt(panel) : panel.prompt;
          updatePanel(panel.id, { status: 'generating', prompt });
          return prompt;
        })
      );

      await onGenerate(prompts);

      setPanels(prev =>
        prev.map(p => ({ ...p, status: 'completed' }))
      );
    } catch (error) {
      setPanels(prev =>
        prev.map(p => ({ ...p, status: 'failed' }))
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const getStatusBadge = (status: NineGridPanel['status']) => {
    switch (status) {
      case 'pending':
        return <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 rounded">等待</span>;
      case 'generating':
        return <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-500 rounded">生成中</span>;
      case 'completed':
        return <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-500 rounded">完成</span>;
      case 'failed':
        return <span className="text-xs px-2 py-0.5 bg-red-100 dark:bg-red-900 text-red-500 rounded">失败</span>;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Grid className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold">九宫格批量生成</h3>
          </div>
          <button
            onClick={addPanel}
            className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg flex items-center gap-1 transition-colors"
          >
            <Plus className="w-4 h-4" />
            添加面板
          </button>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium mb-2">基础提示词</label>
          <textarea
            value={basePrompt}
            onChange={(e) => setBasePrompt(e.target.value)}
            placeholder="输入统一的提示词基础..."
            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 min-h-[80px] resize-none"
          />
          <label className="flex items-center gap-2 mt-2 text-sm">
            <input
              type="checkbox"
              checked={variations}
              onChange={(e) => setVariations(e.target.checked)}
              className="rounded border-gray-300"
            />
            自动生成变体（每个面板添加细微变化）
          </label>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-3 gap-3">
          {panels.map((panel) => (
            <div
              key={panel.id}
              className="relative aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 transition-colors group"
            >
              {panel.imageUrl ? (
                <img src={panel.imageUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <ImageIcon className="w-8 h-8" />
                </div>
              )}

              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => updatePanel(panel.id, { status: 'pending' })}
                  className="p-1.5 bg-white/20 hover:bg-white/30 rounded text-white"
                  title="重新编辑"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => removePanel(panel.id)}
                  className="p-1.5 bg-red-500/50 hover:bg-red-500/70 rounded text-white"
                  title="删除"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="absolute top-1 right-1">
                {getStatusBadge(panel.status)}
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                <input
                  type="text"
                  value={panel.prompt}
                  onChange={(e) => updatePanel(panel.id, { prompt: e.target.value })}
                  placeholder="输入提示词..."
                  className="w-full px-2 py-1 text-xs bg-white/10 border border-white/20 rounded text-white placeholder:text-white/50"
                />
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleBatchGenerate}
          disabled={isGenerating || panels.length === 0}
          className="w-full mt-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              批量生成中...
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5" />
              一键生成全部 ({panels.length}个)
            </>
          )}
        </button>
      </div>
    </div>
  );
}
