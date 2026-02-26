import { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { apiClient } from '../lib/api';
import {
  Image as ImageIcon,
  Loader2,
  Sparkles,
  Settings,
  Download,
  Heart,
  Share2,
  Trash2,
  Copy,
  Wand2,
  Palette,
  Maximize2,
  ChevronDown,
  ChevronUp,
  X,
  Upload,
  Sliders,
  RefreshCw,
  Check,
  ZoomIn,
} from 'lucide-react';

const STYLE_PRESETS = [
  { value: 'cinematic', label: '电影风格', color: '#6366f1', description: '电影质感，戏剧性光影' },
  { value: 'anime', label: '动漫风格', color: '#ec4899', description: '日系动漫，清新明亮' },
  { value: 'realistic', label: '写实风格', color: '#10b981', description: '真实感强，细节丰富' },
  { value: 'illustration', label: '插画风格', color: '#f59e0b', description: '手绘插画，艺术感强' },
  { value: 'watercolor', label: '水彩风格', color: '#06b6d4', description: '水彩晕染，柔和淡雅' },
];

const SIZE_PRESETS = [
  { value: '1024x576', label: '16:9 宽屏', width: 1024, height: 576, icon: '▭' },
  { value: '1024x1024', label: '1:1 方形', width: 1024, height: 1024, icon: '◻' },
  { value: '576x1024', label: '9:16 竖屏', width: 576, height: 1024, icon: '▯' },
  { value: '768x768', label: '3:4 竖屏', width: 768, height: 768, icon: '▢' },
];

const QUICK_PROMPTS = [
  'cinematic lighting', 'dramatic shadows', 'soft focus background',
  'highly detailed', '8k resolution', 'professional photography',
  'golden hour', 'moody atmosphere', 'vibrant colors',
];

interface GeneratedItem {
  id: string;
  url: string;
  prompt: string;
  negativePrompt?: string;
  style: string;
  size: string;
  isFavorite?: boolean;
  createdAt: Date;
}

interface ReferenceImage {
  id: string;
  file: File;
  preview: string;
  strength: number;
}

export function ImageGenerationPage() {
  const { id } = useParams<{ id: string }>();
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [style, setStyle] = useState('cinematic');
  const [size, setSize] = useState('1024x576');
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<GeneratedItem[]>([]);
  const [referenceImages, setReferenceImages] = useState<ReferenceImage[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [hoveredResult, setHoveredResult] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim() || !id || generating) return;

    const [width, height] = size.split('x').map(Number);
    setGenerating(true);

    try {
      const result = await apiClient.generateImage({
        prompt,
        negativePrompt,
        width,
        height,
        style,
        projectId: id
      });

      const newItem: GeneratedItem = {
        id: `img-${Date.now()}`,
        url: result.asset.url,
        prompt,
        negativePrompt,
        style,
        size,
        createdAt: new Date(),
      };

      setResults(prev => [newItem, ...prev]);
    } catch (error) {
      console.error('Failed to generate image:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = useCallback(async (item: GeneratedItem) => {
    try {
      const link = document.createElement('a');
      link.href = item.url;
      link.download = `generated-${item.id}.png`;
      link.click();
    } catch (error) {
      console.error('Download failed:', error);
    }
  }, []);

  const handleFavorite = useCallback((item: GeneratedItem) => {
    setResults(prev => prev.map(r => 
      r.id === item.id ? { ...r, isFavorite: !r.isFavorite } : r
    ));
  }, []);

  const handleShare = useCallback(async (item: GeneratedItem) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: '开演AI - 图像生成',
          text: item.prompt,
          url: item.url
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      await navigator.clipboard.writeText(item.url);
    }
  }, []);

  const handleCopyPrompt = useCallback((item: GeneratedItem) => {
    navigator.clipboard.writeText(item.prompt);
  }, []);

  const handleDelete = useCallback((itemId: string) => {
    setResults(prev => prev.filter(r => r.id !== itemId));
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

  const selectedStyleInfo = STYLE_PRESETS.find(s => s.value === style) || STYLE_PRESETS[0];
  const selectedSizeInfo = SIZE_PRESETS.find(s => s.value === size) || SIZE_PRESETS[0];

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
              background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
              boxShadow: '0 4px 14px rgba(236, 72, 153, 0.3)',
            }}>
              <ImageIcon style={{ width: '24px', height: '24px', color: 'white' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>图像生成</h1>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>使用 AI 创造精美图像</p>
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
                    图像描述 <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="描述你想要的图像内容（英文效果更好）..."
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
                      e.currentTarget.style.borderColor = '#ec4899';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(236, 72, 153, 0.1)';
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

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '10px' }}>
                    负面提示词
                  </label>
                  <textarea
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    placeholder="不想出现在图像中的元素..."
                    style={{
                      width: '100%',
                      minHeight: '80px',
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
                      e.currentTarget.style.borderColor = '#ec4899';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(236, 72, 153, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-primary)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
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

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                        <Maximize2 style={{ width: '14px', height: '14px', marginRight: '6px', display: 'inline', verticalAlign: 'middle' }} />
                        尺寸
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                        {SIZE_PRESETS.map((preset) => {
                          const isSelected = size === preset.value;
                          return (
                            <div
                              key={preset.value}
                              onClick={() => setSize(preset.value)}
                              style={{
                                padding: '10px 8px',
                                borderRadius: '10px',
                                border: `2px solid ${isSelected ? '#ec4899' : 'var(--border-primary)'}`,
                                background: isSelected ? 'rgba(236, 72, 153, 0.1)' : 'var(--bg-hover)',
                                cursor: 'pointer',
                                textAlign: 'center',
                                transition: 'all 0.2s ease',
                              }}
                            >
                              <div style={{ fontSize: '18px', marginBottom: '4px', opacity: 0.7 }}>{preset.icon}</div>
                              <div style={{ fontSize: '11px', fontWeight: '600', color: isSelected ? '#ec4899' : 'var(--text-secondary)' }}>
                                {preset.label}
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
                    background: generating ? '#6b7280' : 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                    border: 'none',
                    borderRadius: '14px',
                    cursor: generating ? 'not-allowed' : 'pointer',
                    boxShadow: generating ? 'none' : '0 4px 14px rgba(236, 72, 153, 0.3)',
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
                      <Sparkles style={{ width: '20px', height: '20px' }} />
                      生成图像
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
                <Wand2 style={{ width: '18px', height: '18px', color: '#ec4899' }} />
                <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>快捷提示词</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {QUICK_PROMPTS.map((qp, idx) => (
                  <span
                    key={idx}
                    onClick={() => handleQuickPrompt(qp)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      background: 'var(--bg-hover)',
                      border: '1px solid var(--border-primary)',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    + {qp}
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
                  <Upload style={{ width: '18px', height: '18px', color: '#ec4899' }} />
                  <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>参考图片</span>
                </div>
                <label style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
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
                          style={{ width: '100%', accentColor: '#ec4899' }}
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
                <ImageIcon style={{ width: '18px', height: '18px', color: '#ec4899' }} />
                <span style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>生成结果</span>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>({results.length})</span>
              </div>
              {results.length > 0 && (
                <button
                  onClick={() => setResults([])}
                  style={{
                    height: '32px',
                    padding: '0 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Trash2 style={{ width: '14px', height: '14px' }} />
                  清空
                </button>
              )}
            </div>

            <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
              {generating && results.length === 0 ? (
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
                    background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '24px',
                    animation: 'pulse 2s infinite',
                  }}>
                    <Sparkles style={{ width: '40px', height: '40px', color: 'white' }} />
                  </div>
                  <p style={{ fontSize: '16px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '8px' }}>
                    正在生成图像...
                  </p>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                    请稍候，AI 正在创作中
                  </p>
                </div>
              ) : results.length === 0 ? (
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
                    <ImageIcon style={{ width: '40px', height: '40px', color: 'var(--text-muted)' }} />
                  </div>
                  <p style={{ fontSize: '16px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '8px' }}>
                    暂无生成结果
                  </p>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)', textAlign: 'center', maxWidth: '300px' }}>
                    在左侧输入图像描述，点击生成按钮开始创作
                  </p>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '20px',
                }}>
                  {results.map((item) => {
                    const isHovered = hoveredResult === item.id;
                    const styleInfo = STYLE_PRESETS.find(s => s.value === item.style) || STYLE_PRESETS[0];
                    
                    return (
                      <div
                        key={item.id}
                        style={{
                          borderRadius: '16px',
                          border: '1px solid var(--border-primary)',
                          overflow: 'hidden',
                          transition: 'all 0.3s ease',
                          transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                          boxShadow: isHovered ? '0 12px 30px rgba(0,0,0,0.15)' : 'none',
                        }}
                        onMouseEnter={() => setHoveredResult(item.id)}
                        onMouseLeave={() => setHoveredResult(null)}
                      >
                        <div style={{ position: 'relative' }}>
                          <img
                            src={item.url}
                            alt={item.prompt}
                            style={{
                              width: '100%',
                              aspectRatio: '4/3',
                              objectFit: 'cover',
                              cursor: 'pointer',
                            }}
                            onClick={() => setPreviewImage(item.url)}
                          />
                          {isHovered && (
                            <div style={{
                              position: 'absolute',
                              inset: 0,
                              background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)',
                              display: 'flex',
                              alignItems: 'flex-end',
                              padding: '16px',
                            }}>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                  onClick={() => handleDownload(item)}
                                  style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    background: 'rgba(255,255,255,0.2)',
                                    backdropFilter: 'blur(8px)',
                                    color: 'white',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  <Download style={{ width: '18px', height: '18px' }} />
                                </button>
                                <button
                                  onClick={() => handleFavorite(item)}
                                  style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    background: item.isFavorite ? '#ec4899' : 'rgba(255,255,255,0.2)',
                                    backdropFilter: 'blur(8px)',
                                    color: 'white',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  <Heart style={{ width: '18px', height: '18px', fill: item.isFavorite ? 'white' : 'none' }} />
                                </button>
                                <button
                                  onClick={() => handleShare(item)}
                                  style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    background: 'rgba(255,255,255,0.2)',
                                    backdropFilter: 'blur(8px)',
                                    color: 'white',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  <Share2 style={{ width: '18px', height: '18px' }} />
                                </button>
                                <button
                                  onClick={() => handleDelete(item.id)}
                                  style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    background: 'rgba(239, 68, 68, 0.8)',
                                    color: 'white',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  <Trash2 style={{ width: '18px', height: '18px' }} />
                                </button>
                              </div>
                            </div>
                          )}
                          <button
                            onClick={() => setPreviewImage(item.url)}
                            style={{
                              position: 'absolute',
                              top: '12px',
                              right: '12px',
                              width: '36px',
                              height: '36px',
                              borderRadius: '10px',
                              border: 'none',
                              background: 'rgba(0,0,0,0.5)',
                              backdropFilter: 'blur(8px)',
                              color: 'white',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              opacity: isHovered ? 1 : 0,
                              transition: 'opacity 0.2s ease',
                            }}
                          >
                            <ZoomIn style={{ width: '18px', height: '18px' }} />
                          </button>
                        </div>
                        <div style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                            <span style={{
                              padding: '4px 10px',
                              borderRadius: '6px',
                              background: `${styleInfo.color}20`,
                              color: styleInfo.color,
                              fontSize: '11px',
                              fontWeight: '600',
                            }}>
                              {styleInfo.label}
                            </span>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                              {item.size}
                            </span>
                          </div>
                          <p style={{
                            fontSize: '13px',
                            color: 'var(--text-secondary)',
                            lineHeight: '1.5',
                            margin: 0,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}>
                            {item.prompt}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                              {item.createdAt.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <button
                              onClick={() => handleCopyPrompt(item)}
                              style={{
                                padding: '4px 10px',
                                borderRadius: '6px',
                                border: '1px solid var(--border-primary)',
                                background: 'transparent',
                                color: 'var(--text-muted)',
                                fontSize: '11px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <Copy style={{ width: '12px', height: '12px' }} />
                              复制
                            </button>
                          </div>
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

      {previewImage && (
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
          onClick={() => setPreviewImage(null)}
        >
          <button
            onClick={() => setPreviewImage(null)}
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
          <img
            src={previewImage}
            alt="Preview"
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
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}

export default ImageGenerationPage;
