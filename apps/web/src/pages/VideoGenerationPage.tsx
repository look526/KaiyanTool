import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { apiClient } from '../lib/api';
import { BentoGrid, BentoCardMedium, BentoCardSmall } from '../components/bento';
import { QuickPrompts, ReferenceImageUploader, ResultGallery, ResultCard, BatchActionBar, DEFAULT_ACTIONS, type GeneratedItem, type ReferenceImage } from '../components/bento';
import { Video, Loader2, Play, Clock, CheckCircle, XCircle, RefreshCw, Settings, Sparkles, Download } from 'lucide-react';

const DURATION_OPTIONS = [
  { value: '4', label: '4秒' },
  { value: '8', label: '8秒' },
  { value: '16', label: '16秒' },
];

const STYLE_PRESETS = [
  { value: 'cinematic', label: '电影风格' },
  { value: 'anime', label: '动漫风格' },
  { value: 'realistic', label: '写实风格' },
  { value: 'documentary', label: '纪录片风格' },
];

const VIDEO_QUICK_PROMPTS = [
  {
    id: '1',
    label: '无人机航拍',
    icon: '🚁',
    prompt: 'Aerial drone shot, cinematic camera movement, scenic landscape, golden hour lighting',
    tags: ['航拍', '风景']
  },
  {
    id: '2',
    label: '人物特写',
    icon: '👤',
    prompt: 'Close-up shot of character, emotional expression, shallow depth of field',
    tags: ['特写', '人物']
  },
  {
    id: '3',
    label: '动态场景',
    icon: '🎬',
    prompt: 'Dynamic scene with fast movement, action sequence, professional cinematography',
    tags: ['动态', '动作']
  },
  {
    id: '4',
    label: '自然风景',
    icon: '🌄',
    prompt: 'Nature landscape, peaceful scene, sunrise lighting, wildlife',
    tags: ['自然', '风景']
  },
  {
    id: '5',
    label: '城市夜景',
    icon: '🌃',
    prompt: 'City night scene, neon lights, urban atmosphere, cinematic lighting',
    tags: ['城市', '夜景']
  },
  {
    id: '6',
    label: '慢动作',
    icon: '🎥',
    prompt: 'Slow motion shot, dramatic effect, high frame rate, smooth movement',
    tags: ['慢动作', '特效']
  }
];

export function VideoGenerationPage() {
  const { id } = useParams<{ id: string }>();
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState('4');
  const [style, setStyle] = useState('cinematic');
  const [generating, setGenerating] = useState(false);
  const [queue, setQueue] = useState<any[]>([]);
  const [loadingQueue, setLoadingQueue] = useState(true);
  const [referenceImages, setReferenceImages] = useState<ReferenceImage[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const loadQueue = async () => {
    if (!id) return;
    try {
      const data = await apiClient.getProjectVideoQueue(id);
      setQueue(data);
    } catch (error) {
      console.error('Failed to load queue:', error);
    } finally {
      setLoadingQueue(false);
    }
  };

  useEffect(() => {
    loadQueue();
    const interval = setInterval(loadQueue, 5000);
    return () => clearInterval(interval);
  }, [id]);

  const handleGenerate = async () => {
    if (!prompt.trim() || !id) return;

    setGenerating(true);

    try {
      await apiClient.generateVideoFromPrompt(id, {
        prompt,
      });
      await loadQueue();
    } catch (error) {
      console.error('Failed to generate video:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = useCallback(async (item: GeneratedItem) => {
    try {
      const link = document.createElement('a');
      link.href = item.url;
      link.download = `generated-video-${item.id}.mp4`;
      link.click();
    } catch (error) {
      console.error('Download failed:', error);
    }
  }, []);

  const handleFavorite = useCallback((item: GeneratedItem) => {
    setQueue(prev => prev.map(q => 
      q.id === item.id ? { ...q, isFavorite: !q.isFavorite } : q
    ));
  }, []);

  const handleShare = useCallback(async (item: GeneratedItem) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: '开演AI - 视频生成',
          text: item.prompt,
          url: item.url
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      navigator.clipboard.writeText(item.url);
    }
  }, []);

  const handleUploadReference = useCallback((files: File[]) => {
    const newImages: ReferenceImage[] = files.map(file => ({
      id: `ref-${Date.now()}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
      strength: 50
    }));
    setReferenceImages(prev => [...prev, ...newImages]);
  }, []);

  const handleRemoveReference = useCallback((id: string) => {
    setReferenceImages(prev => prev.filter(img => img.id !== id));
  }, []);

  const handleStrengthChange = useCallback((id: string, strength: number) => {
    setReferenceImages(prev => prev.map(img => 
      img.id === id ? { ...img, strength } : img
    ));
  }, []);

  const handleQuickPrompt = useCallback((selectedPrompt: string) => {
    setPrompt(prev => {
      if (prev.trim() === '') {
        return selectedPrompt;
      }
      return `${prev}, ${selectedPrompt}`;
    });
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'processing':
        return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const handleBatchActions = DEFAULT_ACTIONS.map(action => ({
    ...action,
    handler: async () => {
      console.log(`Batch action: ${action.id}`);
    }
  }));

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
          <Video className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">视频生成</h1>
          <p className="text-sm text-gray-500">使用 AI 创造精彩视频</p>
        </div>
      </div>

      <BentoGrid columns={{ default: 1, lg: 3 }} gap="lg">
        <div className="lg:col-span-1 space-y-4">
          <BentoCardMedium>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                  视频描述 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="描述你想要的视频内容..."
                  className="min-h-[120px] w-full p-3 border border-gray-200 dark:border-gray-700 rounded-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-white dark:bg-gray-800 transition-all duration-200"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  建议使用英文描述，可获得更好的生成效果
                </p>
              </div>

              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="h-10 px-4 flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200 cursor-pointer"
              >
                <Settings className="w-4 h-4" />
                {showAdvanced ? '收起高级设置' : '展开高级设置'}
              </button>

              {showAdvanced && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">时长</label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="h-10 w-full p-2.5 border border-gray-200 dark:border-gray-700 rounded-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 transition-all duration-200 cursor-pointer"
                    >
                      {DURATION_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">风格</label>
                    <select
                      value={style}
                      onChange={(e) => setStyle(e.target.value)}
                      className="h-10 w-full p-2.5 border border-gray-200 dark:border-gray-700 rounded-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 transition-all duration-200 cursor-pointer"
                    >
                      {STYLE_PRESETS.map(preset => (
                        <option key={preset.value} value={preset.value}>
                          {preset.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={!prompt.trim() || generating}
                className="h-11 px-6 w-full flex items-center justify-center gap-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-cyan-500 rounded-[14px] shadow-[0_2px_4px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_12px_rgba(59,130,246,0.25)] hover:-translate-y-px active:shadow-[0_1px_2px_rgba(0,0,0,0.08)] active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-[0_2px_4px_rgba(0,0,0,0.08)] disabled:hover:translate-y-0"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    生成视频
                  </>
                )}
              </button>
            </div>
          </BentoCardMedium>

          <QuickPrompts 
            prompts={VIDEO_QUICK_PROMPTS}
            onSelect={handleQuickPrompt}
            maxDisplay={6}
          />

          <ReferenceImageUploader
            images={referenceImages}
            onUpload={handleUploadReference}
            onRemove={handleRemoveReference}
            onStrengthChange={handleStrengthChange}
            maxImages={2}
          />
        </div>

        <div className="lg:col-span-2 space-y-4">
          <BentoCardMedium>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">生成队列</h3>
              <button
                onClick={loadQueue}
                className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 cursor-pointer"
                title="刷新"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {loadingQueue ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : queue.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                  <Video className="w-8 h-8" />
                </div>
                <p className="text-lg font-medium mb-2">暂无生成任务</p>
                <p className="text-sm">输入描述并点击生成按钮开始创作</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {queue.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {getStatusIcon(task.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium mb-1 line-clamp-2">
                          {task.params?.prompt || '视频生成任务'}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span>
                            {new Date(task.createdAt).toLocaleString('zh-CN')}
                          </span>
                          {task.duration && (
                            <span>· {task.duration}秒</span>
                          )}
                        </div>
                        {task.status === 'processing' && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-gray-500">生成进度</span>
                              <span className="text-blue-500">{task.progress || 0}%</span>
                            </div>
                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 transition-all duration-300"
                                style={{ width: `${task.progress || 0}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      {task.status === 'completed' && task.params?.url && (
                        <button
                          onClick={() => {
                            const item: GeneratedItem = {
                              id: task.id,
                              url: task.params.url,
                              prompt: task.params?.prompt || ''
                            };
                            handleDownload(item);
                          }}
                          className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                          title="下载"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </BentoCardMedium>
        </div>
      </BentoGrid>

      <BatchActionBar
        selectedCount={0}
        actions={handleBatchActions}
        onClearSelection={() => {}}
        position="bottom"
      />
    </div>
  );
}

export default VideoGenerationPage;
