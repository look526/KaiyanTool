import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  Save,
  RefreshCw,
  Users,
  Clock,
  Palette,
  Target,
  BookOpen,
  Lightbulb,
  Zap
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassSelect } from '../components/ui/GlassSelect';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { apiClient } from '../lib/api';
import { useToast } from '../components/ui/Toast';

interface Storyline {
  title: string;
  logline: string;
  synopsis: string;
  themes: string[];
  structure: {
    act1: { title: string; beats: string[] };
    act2: { title: string; beats: string[] };
    act3: { title: string; beats: string[] };
  };
  characters: Array<{
    name: string;
    role: string;
    arc: string;
    description: string;
  }>;
  suggestedDuration: number;
  suggestedStyle: string;
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

const TONE_OPTIONS = [
  { value: 'dramatic', label: '戏剧性' },
  { value: 'comedy', label: '轻松幽默' },
  { value: 'romance', label: '浪漫温馨' },
  { value: 'thriller', label: '紧张悬疑' },
  { value: 'action', label: '激烈紧张' },
  { value: 'horror', label: '恐怖惊悚' },
  { value: 'sci-fi', label: '未来科技' },
];

const StorylinePage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const accentColor = '#8b5cf6';
  const accentLight = '#a78bfa';

  const [step, setStep] = useState<'input' | 'generating' | 'result'>('input');
  const [storyline, setStoryline] = useState<Storyline | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('');

  const [formData, setFormData] = useState({
    title: '',
    genre: 'drama',
    description: '',
    style: '',
    targetDuration: 15,
    targetAudience: '大众',
    tone: 'dramatic',
  });

  const [hoveredGenre, setHoveredGenre] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!formData.title || !formData.description) {
      addToast({ type: 'error', title: '信息不完整', message: '请填写标题和故事描述' });
      return;
    }
    setStep('generating');
    try {
      const result = await (apiClient as any).generateStorylineFromForm(formData) as Storyline;
      setStoryline(result);
      setStep('result');
      addToast({ type: 'success', title: '生成成功', message: '故事线已生成完成' });
    } catch (error) {
      console.error('生成故事线失败:', error);
      setStep('input');
      addToast({ type: 'error', title: '生成失败', message: '请稍后重试' });
    }
  };

  const handleSave = async () => {
    if (!storyline || !projectId) return;
    try {
      const result = await (apiClient as any).saveStoryline(projectId, storyline) as { id: string };
      setSavedId(result.id);
      addToast({ type: 'success', title: '保存成功', message: '故事线已保存到项目' });
    } catch (error) {
      addToast({ type: 'error', title: '保存失败', message: '请稍后重试' });
    }
  };

  const renderInputStep = () => (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
          创建故事线
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>
          填写基本信息，AI将为您生成完整的故事线
        </p>
      </div>

      <GlassCard variant="glass" padding="lg">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              故事标题 *
            </label>
            <input
              type="text"
              placeholder="输入您的故事标题..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              style={{
                width: '100%', height: '44px', padding: '0 14px',
                border: '1px solid var(--border-primary)', borderRadius: '12px',
                background: 'var(--bg-secondary)', color: 'var(--text-primary)',
                fontSize: '14px', outline: 'none', transition: 'all 0.2s ease',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = accentColor; e.currentTarget.style.boxShadow = `0 0 0 3px ${accentColor}20`; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-primary)'; e.currentTarget.style.boxShadow = 'none'; }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              故事类型 *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {GENRE_OPTIONS.map((genre) => {
                const isSelected = formData.genre === genre.value;
                const isHovered = hoveredGenre === genre.value;
                return (
                  <button
                    key={genre.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, genre: genre.value })}
                    onMouseEnter={() => setHoveredGenre(genre.value)}
                    onMouseLeave={() => setHoveredGenre(null)}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '10px',
                      border: isSelected ? `2px solid ${accentColor}` : '1px solid var(--border-primary)',
                      background: isSelected ? `${accentColor}15` : isHovered ? 'var(--bg-glass-hover)' : 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.2s ease',
                      color: isSelected ? accentColor : 'var(--text-primary)',
                    }}
                  >
                    <span style={{ fontSize: '14px', fontWeight: isSelected ? '600' : '400' }}>{genre.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              故事概述 *
            </label>
            <textarea
              placeholder="详细描述您的故事想法、情节、主题等..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={{
                width: '100%', minHeight: '150px', padding: '14px',
                border: '1px solid var(--border-primary)', borderRadius: '12px',
                background: 'var(--bg-secondary)', color: 'var(--text-primary)',
                fontSize: '14px', outline: 'none', resize: 'vertical', transition: 'all 0.2s ease',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = accentColor; e.currentTarget.style.boxShadow = `0 0 0 3px ${accentColor}20`; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-primary)'; e.currentTarget.style.boxShadow = 'none'; }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                目标时长（分钟）
              </label>
              <input
                type="number"
                value={formData.targetDuration}
                onChange={(e) => setFormData({ ...formData, targetDuration: parseInt(e.target.value) || 15 })}
                style={{
                  width: '100%', height: '44px', padding: '0 14px',
                  border: '1px solid var(--border-primary)', borderRadius: '12px',
                  background: 'var(--bg-secondary)', color: 'var(--text-primary)',
                  fontSize: '14px', outline: 'none', transition: 'all 0.2s ease',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = accentColor; e.currentTarget.style.boxShadow = `0 0 0 3px ${accentColor}20`; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-primary)'; e.currentTarget.style.boxShadow = 'none'; }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                目标观众
              </label>
              <input
                type="text"
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                placeholder="如：年轻人、家庭..."
                style={{
                  width: '100%', height: '44px', padding: '0 14px',
                  border: '1px solid var(--border-primary)', borderRadius: '12px',
                  background: 'var(--bg-secondary)', color: 'var(--text-primary)',
                  fontSize: '14px', outline: 'none', transition: 'all 0.2s ease',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = accentColor; e.currentTarget.style.boxShadow = `0 0 0 3px ${accentColor}20`; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-primary)'; e.currentTarget.style.boxShadow = 'none'; }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                基调
              </label>
              <GlassSelect
                options={TONE_OPTIONS}
                value={formData.tone}
                onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                placeholder="选择基调"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                风格参考（可选）
              </label>
              <input
                type="text"
                value={formData.style}
                onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                placeholder="如：宫崎骏风格、赛博朋克..."
                style={{
                  width: '100%', height: '44px', padding: '0 14px',
                  border: '1px solid var(--border-primary)', borderRadius: '12px',
                  background: 'var(--bg-secondary)', color: 'var(--text-primary)',
                  fontSize: '14px', outline: 'none', transition: 'all 0.2s ease',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = accentColor; e.currentTarget.style.boxShadow = `0 0 0 3px ${accentColor}20`; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-primary)'; e.currentTarget.style.boxShadow = 'none'; }}
              />
            </div>
          </div>

          <GlassButton
            variant="primary"
            onClick={handleGenerate}
           
           
            style={{ marginTop: '8px', height: '52px', fontSize: '16px', justifyContent: 'center' }}
          >
            <Sparkles style={{ width: '18px', height: '18px' }} />
            生成故事线
          </GlassButton>
        </div>
      </GlassCard>
    </div>
  );

  const renderGeneratingStep = () => (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '64px 24px', textAlign: 'center',
    }}>
      <LoadingSpinner size="large" />
      <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)', marginTop: '24px', marginBottom: '8px' }}>
        AI 正在创作中...
      </h3>
      <p style={{ color: 'var(--text-muted)', maxWidth: '400px' }}>
        故事线生成可能需要一些时间，请稍候...
      </p>
    </div>
  );

  const renderResultStep = () => {
    if (!storyline) return null;

    return (
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <GlassButton variant="secondary" onClick={() => setStep('input')}>
            <ArrowLeft style={{ width: '16px', height: '16px' }} />
            重新生成
          </GlassButton>

          <div style={{ display: 'flex', gap: '12px' }}>
            <GlassButton variant="secondary" onClick={handleGenerate}>
              <RefreshCw style={{ width: '16px', height: '16px' }} />
              再次生成
            </GlassButton>
            <GlassButton
              variant="primary"
              onClick={handleSave}
             
             
            >
              <Save style={{ width: '16px', height: '16px' }} />
              {savedId ? '已保存' : '保存故事线'}
            </GlassButton>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <GlassCard variant="glass" padding="lg">
              <div style={{ marginBottom: '16px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)' }}>
                  {storyline.title}
                </h2>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <h4 style={{
                  fontSize: '14px', fontWeight: '600', color: accentColor, marginBottom: '8px',
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}>
                  <Lightbulb style={{ width: '14px', height: '14px' }} />
                  Logline
                </h4>
                <p style={{ fontSize: '16px', color: 'var(--text-primary)', lineHeight: '1.6' }}>
                  {storyline.logline}
                </p>
              </div>

              <div>
                <h4 style={{
                  fontSize: '14px', fontWeight: '600', color: accentColor, marginBottom: '8px',
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}>
                  <BookOpen style={{ width: '14px', height: '14px' }} />
                  故事梗概
                </h4>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                  {storyline.synopsis}
                </p>
              </div>
            </GlassCard>

            <GlassCard variant="glass" padding="lg">
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px' }}>
                三幕结构
              </h3>

              {[
                { key: 'act1', title: '第一幕', color: '#22c55e' },
                { key: 'act2', title: '第二幕', color: '#f59e0b' },
                { key: 'act3', title: '第三幕', color: '#ef4444' },
              ].map((act, idx) => {
                const actData = storyline.structure[act.key as keyof typeof storyline.structure];
                return (
                  <div key={act.key} style={{ marginBottom: idx < 2 ? '16px' : 0 }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', color: act.color, marginBottom: '8px' }}>
                      {act.title}: {actData.title}
                    </h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {actData.beats.map((beat, i) => (
                        <li key={i} style={{
                          display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '14px', color: 'var(--text-secondary)',
                        }}>
                          <span style={{ color: accentColor, fontWeight: '600' }}>{i + 1}.</span>
                          {beat}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </GlassCard>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <GlassCard variant="glass" padding="md">
              <h3 style={{
                fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                <Users style={{ width: '16px', height: '16px', color: accentColor }} />
                角色列表
              </h3>

              {storyline.characters.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {storyline.characters.map((char, i) => (
                    <div key={i} style={{
                      padding: '12px', background: 'var(--bg-secondary)', borderRadius: '10px',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{char.name}</span>
                        <span style={{
                          fontSize: '12px', padding: '2px 8px',
                          background: `${accentColor}20`, color: accentColor, borderRadius: '6px',
                        }}>
                          {char.role}
                        </span>
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                        {char.description.substring(0, 60)}...
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', textAlign: 'center' }}>
                  暂无角色信息
                </p>
              )}
            </GlassCard>

            <GlassCard variant="glass" padding="md">
              <h3 style={{
                fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                <Target style={{ width: '16px', height: '16px', color: accentColor }} />
                主题标签
              </h3>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {storyline.themes.map((theme, i) => (
                  <span key={i} style={{
                    padding: '4px 12px', background: `${accentColor}15`, color: accentColor,
                    borderRadius: '16px', fontSize: '12px', fontWeight: '500',
                  }}>
                    {theme}
                  </span>
                ))}
              </div>
            </GlassCard>

            <GlassCard variant="glass" padding="md">
              <h3 style={{
                fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                <Zap style={{ width: '16px', height: '16px', color: accentColor }} />
                建议信息
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock style={{ width: '14px', height: '14px', color: 'var(--text-muted)' }} />
                  <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                    {storyline.suggestedDuration} 分钟
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <Palette style={{ width: '14px', height: '14px', color: 'var(--text-muted)', marginTop: '2px' }} />
                  <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                    {storyline.suggestedStyle}
                  </span>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
      <header style={{
        height: '64px', borderBottom: '1px solid var(--border-primary)',
        background: 'var(--bg-elevated)', backdropFilter: 'blur(20px)',
        padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => navigate(`/projects/${projectId}`)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px',
              borderRadius: '8px', textDecoration: 'none', color: 'var(--text-secondary)',
              border: 'none', background: 'transparent', cursor: 'pointer', transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-glass-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <ArrowLeft style={{ width: '16px', height: '16px' }} />
            <span style={{ fontSize: '14px' }}>返回项目</span>
          </button>
          <h1 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>
            故事线生成
          </h1>
        </div>
      </header>

      <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
        {step === 'input' && renderInputStep()}
        {step === 'generating' && renderGeneratingStep()}
        {step === 'result' && renderResultStep()}
      </div>
    </div>
  );
};

export default StorylinePage;
