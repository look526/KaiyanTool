import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  Save,
  RefreshCw,
  FileText,
  Clock,
  MapPin,
  Users,
  PlayCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '../components/ui/button-new';
import { apiClient } from '../lib/api';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../components/ui/Toast';

interface Scene {
  id: number;
  title: string;
  location: string;
  time: string;
  description: string;
  characters: string[];
  duration: number;
}

interface Episode {
  id: number;
  title: string;
  summary: string;
  scenes: Scene[];
  duration: number;
}

interface Outline {
  title: string;
  summary: string;
  episodes: Episode[];
  totalScenes: number;
  estimatedDuration: number;
  pacing: {
    overall: 'slow' | 'moderate' | 'fast';
    breakdown: Array<{ act: string; pace: string }>;
  };
}

interface Storyline {
  id: string;
  title: string;
  content: {
    title: string;
    logline: string;
    synopsis: string;
    structure: any;
    characters: any[];
    suggestedDuration: number;
    suggestedStyle: string;
  };
}

const GENRE_OPTIONS = [
  { value: 'drama', label: '剧情' },
  { value: 'comedy', label: '喜剧' },
  { value: 'romance', label: '爱情' },
  { value: 'thriller', label: '惊悚' },
  { value: 'action', label: '动作' },
  { value: 'horror', label: '恐怖' },
  { value: 'sci-fi', label: '科幻' },
  { value: 'fantasy', label: '奇幻' },
  { value: 'animation', label: '动画' },
];

const OutlinePage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();
  const { addToast } = useToast();

  const isDark = resolvedTheme === 'dark';

  const accentColor = '#8b5cf6';
  const accentLight = '#a78bfa';

  const colors = isDark ? {
    bgPrimary: 'rgba(5, 5, 10, 0.95)',
    bgSecondary: 'rgba(255, 255, 255, 0.03)',
    bgGlass: 'rgba(255, 255, 255, 0.04)',
    bgGlassHover: 'rgba(255, 255, 255, 0.06)',
    textPrimary: '#fafafa',
    textSecondary: 'rgba(250, 250, 250, 0.6)',
    textMuted: 'rgba(250, 250, 250, 0.4)',
    border: 'rgba(255, 255, 255, 0.06)',
    borderHover: 'rgba(139, 92, 246, 0.25)',
  } : {
    bgPrimary: 'rgba(255, 255, 255, 0.92)',
    bgSecondary: 'rgba(0, 0, 0, 0.02)',
    bgGlass: 'rgba(0, 0, 0, 0.02)',
    bgGlassHover: 'rgba(0, 0, 0, 0.04)',
    textPrimary: '#18181b',
    textSecondary: 'rgba(24, 24, 27, 0.6)',
    textMuted: 'rgba(24, 24, 27, 0.4)',
    border: 'rgba(0, 0, 0, 0.06)',
    borderHover: 'rgba(139, 92, 246, 0.25)',
  };

  const [step, setStep] = useState<'select' | 'generating' | 'result'>('select');
  const [outline, setOutline] = useState<Outline | null>(null);
  const [loading, setLoading] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [storylines, setStorylines] = useState<Storyline[]>([]);
  const [selectedStorylineId, setSelectedStorylineId] = useState<string>('');
  const [expandedEpisodes, setExpandedEpisodes] = useState<Set<number>>(new Set());

  const [formData, setFormData] = useState<{
    title: string;
    genre: string;
    targetDuration: number;
    style: string;
    additionalNotes: string;
  }>({
    title: '',
    genre: 'drama',
    targetDuration: 15,
    style: '',
    additionalNotes: '',
  });

  useEffect(() => {
    loadStorylines();
  }, [projectId]);

  const loadStorylines = async () => {
    if (!projectId) return;

    try {
      const documents = await apiClient.getProjectDocuments(projectId);
      const storylineDocs = documents.filter((d) => (d as any).type === 'storyline') as any[];
      setStorylines(storylineDocs);
      if (storylineDocs.length > 0 && !selectedStorylineId) {
        setSelectedStorylineId(storylineDocs[0].id);
        if (storylineDocs[0].content) {
          setFormData({ ...formData, title: (storylineDocs[0].content as any).title });
        }
      }
    } catch (error) {
      console.error('Failed to load storylines:', error);
    }
  };

  const handleGenerate = async () => {
    if (!selectedStorylineId || !formData.title) {
      addToast({
        type: 'warning',
        title: '请选择剧情线',
        message: '请先选择一个剧情线并填写标题',
      });
      return;
    }

    try {
      setLoading(true);
      const result = await (apiClient as any).generateOutline({
        storylineId: selectedStorylineId,
        title: formData.title,
        genre: formData.genre,
        targetDuration: formData.targetDuration,
        style: formData.style,
        additionalNotes: formData.additionalNotes,
      }) as Outline;
      setOutline(result);
      setStep('result');
      addToast({
        type: 'success',
        title: '生成成功',
        message: '大纲已生成完成',
      });
    } catch (error) {
      console.error('生成大纲失败:', error);
      setStep('select');
      addToast({
        type: 'error',
        title: '生成失败',
        message: '请稍后重试',
      });
    }
  };

  const handleSave = async () => {
    if (!outline || !projectId) return;

    try {
      const result = await (apiClient as any).saveOutline(projectId, outline) as { id: string };
      setSavedId(result.id);
      addToast({
        type: 'success',
        title: '保存成功',
        message: '大纲已保存到项目',
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: '保存失败',
        message: '请稍后重试',
      });
    }
  };

  const toggleEpisode = (episodeId: number) => {
    const newExpanded = new Set(expandedEpisodes);
    if (newExpanded.has(episodeId)) {
      newExpanded.delete(episodeId);
    } else {
      newExpanded.add(episodeId);
    }
    setExpandedEpisodes(newExpanded);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0 ? `${minutes}分${remainingSeconds}秒` : `${remainingSeconds}秒`;
  };

  const renderSelectStep = () => (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', color: colors.textPrimary, marginBottom: '8px' }}>
          创建大纲
        </h2>
        <p style={{ color: colors.textMuted }}>
          基于故事线生成详细的大纲
        </p>
      </div>

      <div style={{
        background: colors.bgGlass,
        borderRadius: '24px',
        padding: '24px',
        border: `1px solid ${colors.border}`,
        backdropFilter: 'blur(20px)',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: colors.textPrimary, marginBottom: '8px' }}>
              选择故事线 *
            </label>
            <select
              value={selectedStorylineId}
              onChange={(e) => {
                setSelectedStorylineId(e.target.value);
                const selected = storylines.find(s => s.id === e.target.value);
                if (selected) {
                  setFormData({ ...formData, title: selected.content.title, style: selected.content.suggestedStyle });
                }
              }}
              style={{
                width: '100%',
                height: '44px',
                padding: '0 14px',
                border: `1px solid ${colors.border}`,
                borderRadius: '12px',
                background: colors.bgSecondary,
                color: colors.textPrimary,
                fontSize: '14px',
                outline: 'none',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = accentColor;
                e.currentTarget.style.boxShadow = `0 0 0 3px ${accentColor}20`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = colors.border;
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <option value="">选择故事线</option>
              {storylines.map(s => (
                <option key={s.id} value={s.id}>{s.content.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: colors.textPrimary, marginBottom: '8px' }}>
              大纲标题 *
            </label>
            <input
              type="text"
              placeholder="输入大纲标题..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              style={{
                width: '100%',
                height: '44px',
                padding: '0 14px',
                border: `1px solid ${colors.border}`,
                borderRadius: '12px',
                background: colors.bgSecondary,
                color: colors.textPrimary,
                fontSize: '14px',
                outline: 'none',
                transition: 'all 0.25s ease',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = accentColor;
                e.currentTarget.style.boxShadow = `0 0 0 3px ${accentColor}20`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = colors.border;
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: colors.textPrimary, marginBottom: '8px' }}>
              类型 *
            </label>
            <select
              value={formData.genre}
              onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
              style={{
                width: '100%',
                height: '44px',
                padding: '0 14px',
                border: `1px solid ${colors.border}`,
                borderRadius: '12px',
                background: colors.bgSecondary,
                color: colors.textPrimary,
                fontSize: '14px',
                outline: 'none',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = accentColor;
                e.currentTarget.style.boxShadow = `0 0 0 3px ${accentColor}20`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = colors.border;
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {GENRE_OPTIONS.map(g => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: colors.textPrimary, marginBottom: '8px' }}>
              目标时长（分钟）
            </label>
            <input
              type="number"
              value={formData.targetDuration}
              onChange={(e) => setFormData({ ...formData, targetDuration: parseInt(e.target.value) || 15 })}
              style={{
                width: '100%',
                height: '44px',
                padding: '0 14px',
                border: `1px solid ${colors.border}`,
                borderRadius: '12px',
                background: colors.bgSecondary,
                color: colors.textPrimary,
                fontSize: '14px',
                outline: 'none',
                transition: 'all 0.25s ease',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = accentColor;
                e.currentTarget.style.boxShadow = `0 0 0 3px ${accentColor}20`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = colors.border;
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: colors.textPrimary, marginBottom: '8px' }}>
              风格参考（可选）
            </label>
            <input
              type="text"
              value={formData.style}
              onChange={(e) => setFormData({ ...formData, style: e.target.value })}
              placeholder="如：宫崎骏风格、赛博朋克..."
              style={{
                width: '100%',
                height: '44px',
                padding: '0 14px',
                border: `1px solid ${colors.border}`,
                borderRadius: '12px',
                background: colors.bgSecondary,
                color: colors.textPrimary,
                fontSize: '14px',
                outline: 'none',
                transition: 'all 0.25s ease',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = accentColor;
                e.currentTarget.style.boxShadow = `0 0 0 3px ${accentColor}20`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = colors.border;
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: colors.textPrimary, marginBottom: '8px' }}>
              额外备注（可选）
            </label>
            <textarea
              placeholder="任何额外的需求或备注..."
              value={formData.additionalNotes}
              onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
              style={{
                width: '100%',
                minHeight: '100px',
                background: colors.bgSecondary,
                border: `1px solid ${colors.border}`,
                borderRadius: '12px',
                padding: '12px',
                fontSize: '14px',
                color: colors.textPrimary,
                resize: 'vertical',
                outline: 'none',
                transition: 'all 0.25s ease',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = accentColor;
                e.currentTarget.style.boxShadow = `0 0 0 3px ${accentColor}20`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = colors.border;
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          <Button
            variant="primary"
            onClick={handleGenerate}
            style={{
              marginTop: '8px',
              height: '48px',
              background: `linear-gradient(135deg, ${accentColor} 0%, ${accentLight} 100%)`,
              fontSize: '16px',
              fontWeight: '500',
            }}
          >
            <Sparkles style={{ width: '18px', height: '18px' }} />
            生成大纲
          </Button>
        </div>
      </div>
    </div>
  );

  const renderGeneratingStep = () => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '64px 24px',
      textAlign: 'center'
    }}>
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '16px',
        background: `linear-gradient(135deg, ${accentColor} 0%, ${accentLight} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'pulse 2s ease-in-out infinite',
      }}>
        <Sparkles style={{ width: '32px', height: '32px', color: 'white' }} />
      </div>
      <h3 style={{ fontSize: '20px', fontWeight: '600', color: colors.textPrimary, marginTop: '24px', marginBottom: '8px' }}>
        AI 正在创作中...
      </h3>
      <p style={{ color: colors.textMuted, maxWidth: '400px' }}>
        大纲生成可能需要一些时间，请稍候...
      </p>
    </div>
  );

  const renderResultStep = () => {
    if (!outline) return null;

    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <Button
            variant="secondary"
            onClick={() => setStep('select')}
          >
            <ArrowLeft style={{ width: '16px', height: '16px' }} />
            重新选择
          </Button>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Button
              variant="secondary"
              onClick={handleGenerate}
            >
              <RefreshCw style={{ width: '16px', height: '16px' }} />
              再次生成
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              style={{
                background: savedId ? '#22c55e' : `linear-gradient(135deg, ${accentColor} 0%, ${accentLight} 100%)`,
              }}
            >
              <Save style={{ width: '16px', height: '16px' }} />
              {savedId ? '已保存' : '保存大纲'}
            </Button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{
            background: colors.bgGlass,
            borderRadius: '24px',
            padding: '24px',
            border: `1px solid ${colors.border}`,
            backdropFilter: 'blur(20px)',
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', color: colors.textPrimary, marginBottom: '16px' }}>
              {outline.title}
            </h2>
            <p style={{ fontSize: '16px', color: colors.textSecondary, lineHeight: '1.6' }}>
              {outline.summary}
            </p>
          </div>

          <div style={{
            background: colors.bgGlass,
            borderRadius: '24px',
            padding: '24px',
            border: `1px solid ${colors.border}`,
            backdropFilter: 'blur(20px)',
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: colors.textPrimary, marginBottom: '16px' }}>
              概览
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: `linear-gradient(135deg, ${accentColor}20 0%, ${accentLight}20 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <FileText style={{ width: '24px', height: '24px', color: accentColor }} />
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: colors.textPrimary }}>
                    {outline.episodes.length}
                  </div>
                  <div style={{ fontSize: '14px', color: colors.textMuted }}>集数</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: `linear-gradient(135deg, ${accentColor}20 0%, ${accentLight}20 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <PlayCircle style={{ width: '24px', height: '24px', color: accentColor }} />
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: colors.textPrimary }}>
                    {outline.totalScenes}
                  </div>
                  <div style={{ fontSize: '14px', color: colors.textMuted }}>场景</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: `linear-gradient(135deg, ${accentColor}20 0%, ${accentLight}20 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Clock style={{ width: '24px', height: '24px', color: accentColor }} />
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: colors.textPrimary }}>
                    {formatDuration(outline.estimatedDuration)}
                  </div>
                  <div style={{ fontSize: '14px', color: colors.textMuted }}>总时长</div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: colors.textPrimary, marginBottom: '16px' }}>
              分集详情
            </h3>

            {outline.episodes.map((episode, index) => {
              const isExpanded = expandedEpisodes.has(episode.id);
              return (
                <div
                  key={episode.id}
                  style={{
                    background: colors.bgGlass,
                    borderRadius: '18px',
                    padding: '20px',
                    border: `1px solid ${colors.border}`,
                    marginBottom: '16px',
                    backdropFilter: 'blur(20px)',
                    transition: 'all 0.25s ease',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      cursor: 'pointer',
                    }}
                    onClick={() => toggleEpisode(episode.id)}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <span style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: `linear-gradient(135deg, ${accentColor} 0%, ${accentLight} 100%)`,
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '600',
                          fontSize: '14px',
                        }}>
                          {index + 1}
                        </span>
                        <h4 style={{ fontSize: '18px', fontWeight: '600', color: colors.textPrimary, margin: 0 }}>
                          {episode.title}
                        </h4>
                      </div>
                      <p style={{ fontSize: '14px', color: colors.textSecondary, margin: 0, lineHeight: '1.6' }}>
                        {episode.summary}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '12px', fontSize: '13px', color: colors.textMuted }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <PlayCircle style={{ width: '14px', height: '14px' }} />
                          {episode.scenes.length} 场
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Clock style={{ width: '14px', height: '14px' }} />
                          {formatDuration(episode.duration)}
                        </span>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp style={{ width: '20px', height: '20px', color: colors.textMuted }} />
                    ) : (
                      <ChevronDown style={{ width: '20px', height: '20px', color: colors.textMuted }} />
                    )}
                  </div>

                  {isExpanded && (
                    <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: `1px solid ${colors.border}` }}>
                      {episode.scenes.map((scene) => (
                        <div
                          key={scene.id}
                          style={{
                            padding: '16px',
                            background: colors.bgSecondary,
                            borderRadius: '12px',
                            marginBottom: '12px',
                            borderLeft: `3px solid ${accentColor}`,
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                            <h5 style={{ fontSize: '15px', fontWeight: '600', color: colors.textPrimary, margin: 0 }}>
                              {scene.title}
                            </h5>
                            <span style={{
                              fontSize: '12px',
                              padding: '4px 8px',
                              background: `${accentColor}15`,
                              color: accentColor,
                              borderRadius: '6px',
                            }}>
                              {formatDuration(scene.duration)}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px', fontSize: '13px', color: colors.textMuted }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <MapPin style={{ width: '14px', height: '14px' }} />
                              {scene.location}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Clock style={{ width: '14px', height: '14px' }} />
                              {scene.time}
                            </span>
                          </div>
                          {scene.characters.length > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                              <Users style={{ width: '14px', height: '14px', color: colors.textMuted }} />
                              <span style={{ fontSize: '13px', color: colors.textMuted }}>
                                {scene.characters.join(', ')}
                              </span>
                            </div>
                          )}
                          <p style={{ fontSize: '14px', color: colors.textPrimary, margin: 0, lineHeight: '1.6' }}>
                            {scene.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ 
      flex: 1, 
      display: 'flex', 
      flexDirection: 'column',
      minHeight: '100vh',
      background: isDark 
        ? 'linear-gradient(180deg, #05050a 0%, #0a0a12 50%, #0f0f1a 100%)'
        : 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(ellipse at 20% 20%, rgba(139, 92, 246, 0.08) 0%, transparent 50%)',
        pointerEvents: 'none',
      }} />

      <header style={{
          height: '64px',
          borderBottom: `1px solid ${colors.border}`,
          background: colors.bgPrimary,
          backdropFilter: 'blur(40px)',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          position: 'relative',
          zIndex: 1,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => navigate(`/projects/${projectId}`)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: '10px',
                textDecoration: 'none',
                color: colors.textSecondary,
                border: `1px solid ${colors.border}`,
                background: colors.bgSecondary,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <ArrowLeft style={{ width: '16px', height: '16px' }} />
              <span style={{ fontSize: '14px' }}>返回项目</span>
            </button>
            <h1 style={{ fontSize: '18px', fontWeight: '600', color: colors.textPrimary }}>
              大纲生成
            </h1>
          </div>
        </header>

        <div style={{ flex: 1, padding: '24px', overflowY: 'auto', position: 'relative', zIndex: 1 }}>
          {step === 'select' && renderSelectStep()}
          {step === 'generating' && renderGeneratingStep()}
          {step === 'result' && renderResultStep()}
        </div>

        <style>
          {`
            @keyframes pulse {
              0%, 100% { opacity: 1; transform: scale(1); }
              50% { opacity: 0.7; transform: scale(1.05); }
            }
          `}
        </style>
    </div>
  );
};

export default OutlinePage;
