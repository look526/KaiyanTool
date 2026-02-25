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
  Edit3
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/Select';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ModelSelector } from '../components/ui/ModelSelector';
import { apiClient } from '../lib/api-client';
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
  const { theme } = useTheme();
  const { addToast } = useToast();

  const [step, setStep] = useState<'select' | 'generating' | 'result'>('select');
  const [outline, setOutline] = useState<Outline | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [storylines, setStorylines] = useState<Storyline[]>([]);
  const [selectedStorylineId, setSelectedStorylineId] = useState<string>('');
  const [expandedEpisodes, setExpandedEpisodes] = useState<Set<number>>(new Set());
  const [selectedModel, setSelectedModel] = useState<string>('');

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

  const textColor = theme === 'dark' ? '#ffffff' : '#0f172a';
  const mutedTextColor = theme === 'dark' ? '#a1a1aa' : '#64748b';
  const cardBg = theme === 'dark' ? '#18181b' : '#ffffff';
  const borderColor = theme === 'dark' ? '#27272a' : '#e2e8f0';
  const inputBg = theme === 'dark' ? '#09090b' : '#f8fafc';
  const accentColor = '#6366f1';

  useEffect(() => {
    loadStorylines();
  }, [projectId]);

  const loadStorylines = async () => {
    if (!projectId) return;

    try {
      const documents = await apiClient.getProjectDocuments(projectId);
      const storylineDocs = documents.filter((d) => d.type === 'storyline') as any[];
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
        type: 'error',
        title: '信息不完整',
        message: '请选择故事线并填写标题',
      });
      return;
    }

    setStep('generating');

    try {
      const result = await apiClient.generateOutline({
        storylineId: selectedStorylineId,
        title: formData.title,
        genre: formData.genre,
        targetDuration: formData.targetDuration,
        style: formData.style,
        additionalNotes: formData.additionalNotes,
      });
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
      const result = await apiClient.saveOutline(projectId, outline);
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
        <h2 style={{ fontSize: '24px', fontWeight: '600', color: textColor, marginBottom: '8px' }}>
          创建大纲
        </h2>
        <p style={{ color: mutedTextColor }}>
          基于故事线生成详细的大纲
        </p>
      </div>

      <Card style={{ padding: '24px', backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: textColor, marginBottom: '8px' }}>
              选择故事线 *
            </label>
            <Select
              options={storylines.map(s => ({
                value: s.id,
                label: s.content.title,
              }))}
              value={selectedStorylineId}
              onChange={(value) => {
                setSelectedStorylineId(typeof value === 'string' ? value : value[0]);
                const selected = storylines.find(s => s.id === (typeof value === 'string' ? value : value[0]));
                if (selected) {
                  setFormData({ ...formData, title: selected.content.title, style: selected.content.suggestedStyle });
                }
              }}
              placeholder="选择故事线"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: textColor, marginBottom: '8px' }}>
              大纲标题 *
            </label>
            <Input
              placeholder="输入大纲标题..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              style={{ backgroundColor: inputBg }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: textColor, marginBottom: '8px' }}>
              类型 *
            </label>
            <Select
              options={GENRE_OPTIONS.map(g => ({ value: g.value, label: g.label }))}
              value={formData.genre}
              onChange={(value) => setFormData({ ...formData, genre: typeof value === 'string' ? value : value[0] })}
              placeholder="选择类型"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: textColor, marginBottom: '8px' }}>
              目标时长（分钟）
            </label>
            <Input
              type="number"
              value={formData.targetDuration}
              onChange={(e) => setFormData({ ...formData, targetDuration: parseInt(e.target.value) || 15 })}
              style={{ backgroundColor: inputBg }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: textColor, marginBottom: '8px' }}>
              风格参考（可选）
            </label>
            <Input
              value={formData.style}
              onChange={(e) => setFormData({ ...formData, style: e.target.value })}
              placeholder="如：宫崎骏风格、赛博朋克..."
              style={{ backgroundColor: inputBg }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: textColor, marginBottom: '8px' }}>
              额外备注（可选）
            </label>
            <textarea
              placeholder="任何额外的需求或备注..."
              value={formData.additionalNotes}
              onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
              style={{
                width: '100%',
                minHeight: '100px',
                backgroundColor: inputBg,
                border: `1px solid ${borderColor}`,
                borderRadius: '8px',
                padding: '12px',
                fontSize: '14px',
                color: textColor,
                resize: 'vertical'
              }}
            />
          </div>

          <Button
            onClick={handleGenerate}
            style={{
              marginTop: '8px',
              backgroundColor: accentColor,
              color: 'white',
              padding: '14px 24px',
              fontSize: '16px',
              fontWeight: '500',
            }}
          >
            <Sparkles style={{ width: '18px', height: '18px', marginRight: '8px' }} />
            生成大纲
          </Button>
        </div>
      </Card>
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
      <LoadingSpinner size="large" />
      <h3 style={{ fontSize: '20px', fontWeight: '600', color: textColor, marginTop: '24px', marginBottom: '8px' }}>
        AI 正在创作中...
      </h3>
      <p style={{ color: mutedTextColor, maxWidth: '400px' }}>
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
            variant="outline"
            onClick={() => setStep('select')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <ArrowLeft style={{ width: '16px', height: '16px' }} />
            重新选择
          </Button>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Button
              variant="outline"
              onClick={handleGenerate}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <RefreshCw style={{ width: '16px', height: '16px' }} />
              再次生成
            </Button>
            <Button
              onClick={handleSave}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: savedId ? '#22c55e' : accentColor,
                color: 'white'
              }}
            >
              <Save style={{ width: '16px', height: '16px' }} />
              {savedId ? '已保存' : '保存大纲'}
            </Button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Card style={{ padding: '24px', backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', color: textColor, marginBottom: '16px' }}>
              {outline.title}
            </h2>
            <p style={{ fontSize: '16px', color: mutedTextColor, lineHeight: '1.6' }}>
              {outline.summary}
            </p>
          </Card>

          <Card style={{ padding: '24px', backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: textColor, marginBottom: '16px' }}>
              概览
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: `${accentColor}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <FileText style={{ width: '24px', height: '24px', color: accentColor }} />
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: textColor }}>
                    {outline.episodes.length}
                  </div>
                  <div style={{ fontSize: '14px', color: mutedTextColor }}>集数</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: `${accentColor}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <PlayCircle style={{ width: '24px', height: '24px', color: accentColor }} />
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: textColor }}>
                    {outline.totalScenes}
                  </div>
                  <div style={{ fontSize: '14px', color: mutedTextColor }}>场景</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: `${accentColor}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Clock style={{ width: '24px', height: '24px', color: accentColor }} />
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: textColor }}>
                    {formatDuration(outline.estimatedDuration)}
                  </div>
                  <div style={{ fontSize: '14px', color: mutedTextColor }}>总时长</div>
                </div>
              </div>
            </div>
          </Card>

          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: textColor, marginBottom: '16px' }}>
              分集详情
            </h3>

            {outline.episodes.map((episode, index) => {
              const isExpanded = expandedEpisodes.has(episode.id);
              return (
                <Card
                  key={episode.id}
                  style={{
                    padding: '20px',
                    backgroundColor: cardBg,
                    border: `1px solid ${borderColor}`,
                    marginBottom: '16px',
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
                          backgroundColor: `${accentColor}20`,
                          color: accentColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '600',
                          fontSize: '14px',
                        }}>
                          {index + 1}
                        </span>
                        <h4 style={{ fontSize: '18px', fontWeight: '600', color: textColor, margin: 0 }}>
                          {episode.title}
                        </h4>
                      </div>
                      <p style={{ fontSize: '14px', color: mutedTextColor, margin: 0, lineHeight: '1.6' }}>
                        {episode.summary}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '12px', fontSize: '13px', color: mutedTextColor }}>
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
                      <ChevronUp style={{ width: '20px', height: '20px', color: mutedTextColor }} />
                    ) : (
                      <ChevronDown style={{ width: '20px', height: '20px', color: mutedTextColor }} />
                    )}
                  </div>

                  {isExpanded && (
                    <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: `1px solid ${borderColor}` }}>
                      {episode.scenes.map((scene) => (
                        <div
                          key={scene.id}
                          style={{
                            padding: '16px',
                            backgroundColor: inputBg,
                            borderRadius: '8px',
                            marginBottom: '12px',
                            borderLeft: `3px solid ${accentColor}`,
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                            <h5 style={{ fontSize: '15px', fontWeight: '600', color: textColor, margin: 0 }}>
                              {scene.title}
                            </h5>
                            <span style={{
                              fontSize: '12px',
                              padding: '4px 8px',
                              backgroundColor: `${accentColor}15`,
                              color: accentColor,
                              borderRadius: '4px',
                            }}>
                              {formatDuration(scene.duration)}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px', fontSize: '13px', color: mutedTextColor }}>
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
                              <Users style={{ width: '14px', height: '14px', color: mutedTextColor }} />
                              <span style={{ fontSize: '13px', color: mutedTextColor }}>
                                {scene.characters.join(', ')}
                              </span>
                            </div>
                          )}
                          <p style={{ fontSize: '14px', color: textColor, margin: 0, lineHeight: '1.6' }}>
                            {scene.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <header style={{
          height: '64px',
          borderBottom: `1px solid ${borderColor}`,
          backgroundColor: cardBg,
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => navigate(`/projects/${projectId}`)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: '8px',
                textDecoration: 'none',
                color: mutedTextColor,
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
              }}
            >
              <ArrowLeft style={{ width: '16px', height: '16px' }} />
              <span style={{ fontSize: '14px' }}>返回项目</span>
            </button>
            <h1 style={{ fontSize: '18px', fontWeight: '600', color: textColor }}>
              大纲生成
            </h1>
          </div>
          <ModelSelector
            contentType="outline"
            value={selectedModel}
            onChange={setSelectedModel}
            placeholder="选择大纲模型"
            style={{ width: '240px' }}
          />
        </header>

        <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          {step === 'select' && renderSelectStep()}
          {step === 'generating' && renderGeneratingStep()}
          {step === 'result' && renderResultStep()}
        </div>
    </div>
  );
};

export default OutlinePage;
