import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../lib/api';
import {
  Video,
  Loader2,
  Play,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Settings,
  Sparkles,
  Download,
  ChevronDown,
  ChevronUp,
  X,
  Upload,
  Film,
  Palette,
  Timer,
  Trash2,
  Share2,
  Copy,
  ZoomIn,
} from 'lucide-react';

const DURATION_OPTIONS = [
  { value: '4', label: '4秒', description: '快速预览' },
  { value: '8', label: '8秒', description: '标准时长' },
  { value: '16', label: '16秒', description: '完整展示' },
];

const STYLE_PRESETS = [
  { value: 'cinematic', label: '电影风格', color: '#3b82f6', description: '电影质感，戏剧性光影' },
  { value: 'anime', label: '动漫风格', color: '#ec4899', description: '日系动漫，清新明亮' },
  { value: 'realistic', label: '写实风格', color: '#10b981', description: '真实感强，细节丰富' },
  { value: 'documentary', label: '纪录片风格', color: '#f59e0b', description: '纪实风格，自然真实' },
];

const QUICK_PROMPTS = [
  { label: '无人机航拍', prompt: 'Aerial drone shot, cinematic camera movement, scenic landscape, golden hour lighting', icon: '🚁' },
  { label: '人物特写', prompt: 'Close-up shot of character, emotional expression, shallow depth of field', icon: '👤' },
  { label: '动态场景', prompt: 'Dynamic scene with fast movement, action sequence, professional cinematography', icon: '🎬' },
  { label: '自然风景', prompt: 'Nature landscape, peaceful scene, sunrise lighting, wildlife', icon: '🌄' },
  { label: '城市夜景', prompt: 'City night scene, neon lights, urban atmosphere, cinematic lighting', icon: '🌃' },
  { label: '慢动作', prompt: 'Slow motion shot, dramatic effect, high frame rate, smooth movement', icon: '🎥' },
];

interface VideoTask {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  params?: {
    prompt?: string;
    url?: string;
  };
  progress?: number;
  duration?: number;
  createdAt: string;
}

interface ReferenceImage {
  id: string;
  file: File;
  preview: string;
  strength: number;
}

export function VideoGenerationPage() {
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState('4');
  const [style, setStyle] = useState('cinematic');
  const [generating, setGenerating] = useState(false);
  const [queue, setQueue] = useState<VideoTask[]>([]);
  const [loadingQueue, setLoadingQueue] = useState(true);
  const [referenceImages, setReferenceImages] = useState<ReferenceImage[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [hoveredTask, setHoveredTask] = useState<string | null>(null);
  const [previewVideo, setPreviewVideo] = useState<string | null>(null);

  const loadQueue = async () => {
    try {
      const data = await apiClient.get('/video-generation/queue');
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
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    try {
      await apiClient.post('/video-generation/generate', { prompt, duration, style });
      await loadQueue();
    } catch (error) {
      console.error('Failed to generate video:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = useCallback((task: VideoTask) => {
    if (!task.params?.url) return;
    const link = document.createElement('a');
    link.href = task.params.url;
    link.download = `video-${task.id}.mp4`;
    link.click();
  }, []);

  const handleShare = useCallback(async (task: VideoTask) => {
    if (!task.params?.url) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: '开演AI - 视频生成',
          text: task.params?.prompt || '',
          url: task.params.url
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      navigator.clipboard.writeText(task.params.url);
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

  const handleRemoveReference = useCallback((refId: string) => {
    setReferenceImages(prev => prev.filter(img => img.id !== refId));
  }, []);

  const handleStrengthChange = useCallback((refId: string, strength: number) => {
    setReferenceImages(prev => prev.map(img => 
      img.id === refId ? { ...img, strength } : img
    ));
  }, []);

  const handleQuickPrompt = useCallback((quickPrompt: string) => {
    setPrompt(prev => {
      if (prev.trim() === '') return quickPrompt;
      return `${prev}, ${quickPrompt}`;
    });
  }, []);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return { icon: CheckCircle, color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.15)', label: '已完成' };
      case 'failed':
        return { icon: XCircle, color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.15)', label: '失败' };
      case 'processing':
        return { icon: Loader2, color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.15)', label: '生成中' };
      default:
        return { icon: Clock, color: '#64748b', bgColor: 'rgba(100, 116, 139, 0.15)', label: '等待中' };
    }
  };

  const selectedStyleInfo = STYLE_PRESETS.find(s => s.value === style) || STYLE_PRESETS[0];
  const selectedDurationInfo = DURATION_OPTIONS.find(d => d.value === duration) || DURATION_OPTIONS[0];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
      <div style={{
        background: 'var(--bg-header)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-primary)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              padding: '12px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
              boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)',
            }}>
              <Video style={{ width: '24px', height: '24px', color: 'white' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>视频生成</h1>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>使用 AI 创造精彩视频</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              background: 'var(--bg-card)',
              borderRadius: '20px',
              border: '1px solid var(--border-primary)',
              overflow: 'hidden',
            }}>
              <div style={{ padding: '24px' }}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                    视频描述 <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="描述你想要的视频内容（英文效果更好）..."
                    style={{
                      width: '100%',
                      minHeight: '120px',
                      padding: '14px',
                      borderRadius: '12px',
                      border: '1px solid var(--border-primary)',
                      background: 'var(--bg-input)',
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                      lineHeight: '1.6',
                      resize: 'vertical',
                      outline: 'none',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit',
                      transition: 'all 0.2s ease',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#3b82f6';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-primary)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '8px 0 0 0' }}>
                    建议使用英文描述，可获得更好的生成效果
                  </p>
                </div>

                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  style={{
                    width: '100%',
                    height: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: 'var(--text-secondary)',
                    background: 'var(--bg-hover)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    marginBottom: '20px',
                  }}
                >
                  <Settings style={{ width: '16px', height: '16px' }} />
                  {showAdvanced ? '收起高级设置' : '展开高级设置'}
                  {showAdvanced ? <ChevronUp style={{ width: '16px', height: '16px' }} /> : <ChevronDown style={{ width: '16px', height: '16px' }} />}
                </button>

                {showAdvanced && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                        <Timer style={{ width: '14px', height: '14px', marginRight: '6px', display: 'inline', verticalAlign: 'middle' }} />
                        时长
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                        {DURATION_OPTIONS.map((opt) => {
                          const isSelected = duration === opt.value;
                          return (
                            <div
                              key={opt.value}
                              onClick={() => setDuration(opt.value)}
                              style={{
                                padding: '12px',
                                borderRadius: '12px',
                                border: `2px solid ${isSelected ? '#3b82f6' : 'var(--border-primary)'}`,
                                background: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-hover)',
                                cursor: 'pointer',
                                textAlign: 'center',
                                transition: 'all 0.2s ease',
                              }}
                            >
                              <div style={{ fontSize: '15px', fontWeight: '600', color: isSelected ? '#3b82f6' : 'var(--text-primary)', marginBottom: '2px' }}>
                                {opt.label}
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                {opt.description}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                        <Palette style={{ width: '14px', height: '14px', marginRight: '6px', display: 'inline', verticalAlign: 'middle' }} />
                        风格
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                        {STYLE_PRESETS.map((preset) => {
                          const isSelected = style === preset.value;
                          return (
                            <div
                              key={preset.value}
                              onClick={() => setStyle(preset.value)}
                              style={{
                                padding: '12px',
                                borderRadius: '12px',
                                border: `2px solid ${isSelected ? preset.color : 'var(--border-primary)'}`,
                                background: isSelected ? `${preset.color}15` : 'var(--bg-hover)',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                              }}
                            >
                              <div style={{ fontSize: '13px', fontWeight: '600', color: isSelected ? preset.color : 'var(--text-primary)', marginBottom: '2px' }}>
                                {preset.label}
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                {preset.description}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || generating}
                  style={{
                    width: '100%',
                    height: '52px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    fontSize: '15px',
                    fontWeight: '600',
                    color: 'white',
                    background: generating ? '#6b7280' : 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
                    border: 'none',
                    borderRadius: '14px',
                    cursor: generating ? 'not-allowed' : 'pointer',
                    boxShadow: generating ? 'none' : '0 4px 14px rgba(59, 130, 246, 0.3)',
                    transition: 'all 0.2s ease',
                    opacity: !prompt.trim() ? 0.7 : 1,
                  }}
                >
                  {generating ? (
                    <>
                      <Loader2 style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} />
                      生成中...
                    </>
                  ) : (
                    <>
                      <Play style={{ width: '20px', height: '20px' }} />
                      生成视频
                    </>
                  )}
                </button>
              </div>
            </div>

            <div style={{
              background: 'var(--bg-card)',
              borderRadius: '20px',
              border: '1px solid var(--border-primary)',
              padding: '20px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <Film style={{ width: '18px', height: '18px', color: '#3b82f6' }} />
                <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>快捷提示词</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {QUICK_PROMPTS.map((qp, idx) => (
                  <span
                    key={idx}
                    onClick={() => handleQuickPrompt(qp.prompt)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '10px',
                      background: 'var(--bg-hover)',
                      border: '1px solid var(--border-primary)',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span>{qp.icon}</span>
                    {qp.label}
                  </span>
                ))}
              </div>
            </div>

            <div style={{
              background: 'var(--bg-card)',
              borderRadius: '20px',
              border: '1px solid var(--border-primary)',
              padding: '20px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Upload style={{ width: '18px', height: '18px', color: '#3b82f6' }} />
                  <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>参考图片</span>
                </div>
                <label style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: 'white',
                  cursor: 'pointer',
                }}>
                  上传
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => e.target.files && handleUploadReference(Array.from(e.target.files))}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              {referenceImages.length === 0 ? (
                <div style={{
                  padding: '32px',
                  textAlign: 'center',
                  borderRadius: '12px',
                  border: '2px dashed var(--border-primary)',
                  background: 'var(--bg-hover)',
                }}>
                  <Upload style={{ width: '32px', height: '32px', color: 'var(--text-muted)', marginBottom: '10px' }} />
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>拖拽或点击上传参考图片</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {referenceImages.map((ref) => (
                    <div key={ref.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      borderRadius: '12px',
                      background: 'var(--bg-hover)',
                      border: '1px solid var(--border-primary)',
                    }}>
                      <img
                        src={ref.preview}
                        alt="Reference"
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '8px',
                          objectFit: 'cover',
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                          参考强度: {ref.strength}%
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={ref.strength}
                          onChange={(e) => handleStrengthChange(ref.id, Number(e.target.value))}
                          style={{ width: '100%', accentColor: '#3b82f6' }}
                        />
                      </div>
                      <button
                        onClick={() => handleRemoveReference(ref.id)}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          border: 'none',
                          background: 'rgba(239, 68, 68, 0.1)',
                          color: '#ef4444',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <X style={{ width: '16px', height: '16px' }} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={{
            background: 'var(--bg-card)',
            borderRadius: '20px',
            border: '1px solid var(--border-primary)',
            minHeight: '600px',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--border-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Video style={{ width: '18px', height: '18px', color: '#3b82f6' }} />
                <span style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>生成队列</span>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>({queue.length})</span>
              </div>
              <button
                onClick={loadQueue}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-primary)',
                  background: 'transparent',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                }}
              >
                <RefreshCw style={{ width: '16px', height: '16px' }} />
              </button>
            </div>

            <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
              {loadingQueue ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  minHeight: '400px',
                }}>
                  <Loader2 style={{ width: '48px', height: '48px', animation: 'spin 1s linear infinite', color: '#3b82f6' }} />
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '16px' }}>加载中...</p>
                </div>
              ) : queue.length === 0 ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  minHeight: '400px',
                }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '24px',
                    background: 'var(--bg-hover)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '24px',
                  }}>
                    <Video style={{ width: '40px', height: '40px', color: 'var(--text-muted)' }} />
                  </div>
                  <p style={{ fontSize: '16px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '8px' }}>
                    暂无生成任务
                  </p>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)', textAlign: 'center', maxWidth: '300px' }}>
                    在左侧输入视频描述，点击生成按钮开始创作
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {queue.map((task) => {
                    const statusConfig = getStatusConfig(task.status);
                    const StatusIcon = statusConfig.icon;
                    const isHovered = hoveredTask === task.id;

                    return (
                      <div
                        key={task.id}
                        style={{
                          padding: '20px',
                          borderRadius: '16px',
                          border: '1px solid var(--border-primary)',
                          background: 'var(--bg-hover)',
                          transition: 'all 0.2s ease',
                          transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
                          boxShadow: isHovered ? '0 8px 24px rgba(0,0,0,0.1)' : 'none',
                        }}
                        onMouseEnter={() => setHoveredTask(task.id)}
                        onMouseLeave={() => setHoveredTask(null)}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                          <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '14px',
                            background: statusConfig.bgColor,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}>
                            <StatusIcon style={{
                              width: '24px',
                              height: '24px',
                              color: statusConfig.color,
                              animation: task.status === 'processing' ? 'spin 1s linear infinite' : 'none',
                            }} />
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                              <span style={{
                                padding: '4px 10px',
                                borderRadius: '6px',
                                background: statusConfig.bgColor,
                                color: statusConfig.color,
                                fontSize: '12px',
                                fontWeight: '600',
                              }}>
                                {statusConfig.label}
                              </span>
                              {task.duration && (
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                  {task.duration}秒
                                </span>
                              )}
                            </div>
                            <p style={{
                              fontSize: '14px',
                              color: 'var(--text-primary)',
                              lineHeight: '1.5',
                              margin: '0 0 8px 0',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}>
                              {task.params?.prompt || '视频生成任务'}
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
                              <span>
                                {new Date(task.createdAt).toLocaleString('zh-CN')}
                              </span>
                            </div>

                            {task.status === 'processing' && (
                              <div style={{ marginTop: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>生成进度</span>
                                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#3b82f6' }}>{task.progress || 0}%</span>
                                </div>
                                <div style={{
                                  height: '6px',
                                  background: 'var(--bg-card)',
                                  borderRadius: '3px',
                                  overflow: 'hidden',
                                }}>
                                  <div style={{
                                    height: '100%',
                                    width: `${task.progress || 0}%`,
                                    background: 'linear-gradient(90deg, #3b82f6 0%, #06b6d4 100%)',
                                    borderRadius: '3px',
                                    transition: 'width 0.3s ease',
                                  }} />
                                </div>
                              </div>
                            )}
                          </div>

                          {task.status === 'completed' && task.params?.url && (
                            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                              <button
                                onClick={() => setPreviewVideo(task.params?.url || null)}
                                style={{
                                  width: '40px',
                                  height: '40px',
                                  borderRadius: '10px',
                                  border: 'none',
                                  background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
                                  color: 'white',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                                }}
                              >
                                <Play style={{ width: '18px', height: '18px' }} />
                              </button>
                              <button
                                onClick={() => handleDownload(task)}
                                style={{
                                  width: '40px',
                                  height: '40px',
                                  borderRadius: '10px',
                                  border: '1px solid var(--border-primary)',
                                  background: 'transparent',
                                  color: 'var(--text-muted)',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <Download style={{ width: '18px', height: '18px' }} />
                              </button>
                              <button
                                onClick={() => handleShare(task)}
                                style={{
                                  width: '40px',
                                  height: '40px',
                                  borderRadius: '10px',
                                  border: '1px solid var(--border-primary)',
                                  background: 'transparent',
                                  color: 'var(--text-muted)',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <Share2 style={{ width: '18px', height: '18px' }} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {previewVideo && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '24px',
          }}
          onClick={() => setPreviewVideo(null)}
        >
          <button
            onClick={() => setPreviewVideo(null)}
            style={{
              position: 'absolute',
              top: '24px',
              right: '24px',
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              border: 'none',
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X style={{ width: '24px', height: '24px' }} />
          </button>
          <video
            src={previewVideo}
            controls
            autoPlay
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              borderRadius: '16px',
              boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default VideoGenerationPage;
