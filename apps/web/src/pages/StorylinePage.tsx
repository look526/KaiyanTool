import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  Save,
  RefreshCw,
  Users,
  FileText,
  Clock,
  Palette,
  Target,
  Check,
  ChevronRight,
  BookOpen,
  Lightbulb,
  Zap
} from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { apiClient } from '../lib/api-client';
import { useTheme } from '../contexts/ThemeContext';
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
  { value: 'drama', label: '剧情', icon: '🎭' },
  { value: 'comedy', label: '喜剧', icon: '😂' },
  { value: 'romance', label: '爱情', icon: '💕' },
  { value: 'thriller', label: '惊悚', icon: '😱' },
  { value: 'action', label: '动作', icon: '💥' },
  { value: 'horror', label: '恐怖', icon: '👻' },
  { value: 'sci-fi', label: '科幻', icon: '🚀' },
  { value: 'fantasy', label: '奇幻', icon: '🧙' },
  { value: 'animation', label: '动画', icon: '🎬' },
];

const TONE_OPTIONS = [
  { value: 'dramatic', label: '戏剧性', color: '#ef4444' },
  { value: 'comedy', label: '轻松幽默', color: '#f59e0b' },
  { value: 'romance', label: '浪漫温馨', color: '#ec4899' },
  { value: 'thriller', label: '紧张悬疑', color: '#6366f1' },
  { value: 'action', label: '激烈紧张', color: '#dc2626' },
  { value: 'horror', label: '恐怖惊悚', color: '#1f2937' },
  { value: 'sci-fi', label: '未来科技', color: '#0ea5e9' },
];

const StorylinePage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { addToast } = useToast();

  const [step, setStep] = useState<'input' | 'generating' | 'result'>('input');
  const [storyline, setStoryline] = useState<Storyline | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    genre: 'drama',
    description: '',
    style: '',
    targetDuration: 15,
    targetAudience: '大众',
    tone: 'dramatic' as const,
  });

  const textColor = theme === 'dark' ? '#ffffff' : '#0f172a';
  const mutedTextColor = theme === 'dark' ? '#a1a1aa' : '#64748b';
  const cardBg = theme === 'dark' ? '#18181b' : '#ffffff';
  const borderColor = theme === 'dark' ? '#27272a' : '#e2e8f0';
  const inputBg = theme === 'dark' ? '#09090b' : '#f8fafc';
  const accentColor = '#6366f1';

  const handleGenerate = async () => {
    if (!formData.title || !formData.description) {
      addToast({
        type: 'error',
        title: '信息不完整',
        message: '请填写标题和故事描述',
      });
      return;
    }

    setStep('generating');

    try {
      const result = await apiClient.generateStoryline(formData);
      setStoryline(result);
      setStep('result');
      addToast({
        type: 'success',
        title: '生成成功',
        message: '故事线已生成完成',
      });
    } catch (error) {
      console.error('生成故事线失败:', error);
      setStep('input');
      addToast({
        type: 'error',
        title: '生成失败',
        message: '请稍后重试',
      });
    }
  };

  const handleSave = async () => {
    if (!storyline || !projectId) return;

    try {
      const result = await apiClient.saveStoryline(projectId, storyline);
      setSavedId(result.id);
      addToast({
        type: 'success',
        title: '保存成功',
        message: '故事线已保存到项目',
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: '保存失败',
        message: '请稍后重试',
      });
    }
  };

  const handleRefine = async (feedback: string) => {
    if (!savedId) return;

    try {
      const result = await apiClient.refineStoryline(savedId, feedback);
      setStoryline(result);
      addToast({
        type: 'success',
        title: '优化成功',
        message: '故事线已根据反馈优化',
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: '优化失败',
        message: '请稍后重试',
      });
    }
  };

  const renderInputStep = () => (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', color: textColor, marginBottom: '8px' }}>
          创建故事线
        </h2>
        <p style={{ color: mutedTextColor }}>
          填写基本信息，AI将为您生成完整的故事线
        </p>
      </div>

      <Card style={{ padding: '24px', backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: textColor, marginBottom: '8px' }}>
              故事标题 *
            </label>
            <Input
              placeholder="输入您的故事标题..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              style={{ backgroundColor: inputBg }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: textColor, marginBottom: '8px' }}>
              故事类型 *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {GENRE_OPTIONS.map((genre) => (
                <button
                  key={genre.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, genre: genre.value })}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: formData.genre === genre.value 
                      ? `2px solid ${accentColor}` 
                      : `1px solid ${borderColor}`,
                    backgroundColor: formData.genre === genre.value 
                      ? `${accentColor}10` 
                      : 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s',
                  }}
                >
                  <span>{genre.icon}</span>
                  <span style={{ 
                    fontSize: '14px', 
                    color: formData.genre === genre.value ? accentColor : textColor 
                  }}>
                    {genre.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: textColor, marginBottom: '8px' }}>
              故事概述 *
            </label>
            <Textarea
              placeholder="详细描述您的故事想法、情节、主题等..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={{ 
                minHeight: '150px', 
                backgroundColor: inputBg,
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
                目标观众
              </label>
              <Input
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                placeholder="如：年轻人、家庭..."
                style={{ backgroundColor: inputBg }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: textColor, marginBottom: '8px' }}>
                基调
              </label>
              <Select
                value={formData.tone}
                onValueChange={(value: any) => setFormData({ ...formData, tone: value })}
              >
                <SelectTrigger style={{ backgroundColor: inputBg }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TONE_OPTIONS.map((tone) => (
                    <SelectItem key={tone.value} value={tone.value}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ 
                          width: '12px', 
                          height: '12px', 
                          borderRadius: '50%', 
                          backgroundColor: tone.color 
                        }} />
                        {tone.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            生成故事线
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
        故事线生成可能需要一些时间，请稍候...
      </p>
    </div>
  );

  const renderResultStep = () => {
    if (!storyline) return null;

    return (
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <Button
            variant="outline"
            onClick={() => setStep('input')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <ArrowLeft style={{ width: '16px', height: '16px' }} />
            重新生成
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
              {savedId ? '已保存' : '保存故事线'}
            </Button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <Card style={{ padding: '24px', backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>
              <div style={{ marginBottom: '16px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', color: textColor }}>
                  {storyline.title}
                </h2>
              </div>
              
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: accentColor, 
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <Lightbulb style={{ width: '14px', height: '14px' }} />
                  Logline
                </h4>
                <p style={{ fontSize: '16px', color: textColor, lineHeight: '1.6' }}>
                  {storyline.logline}
                </p>
              </div>

              <div>
                <h4 style={{ 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: accentColor, 
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <BookOpen style={{ width: '14px', height: '14px' }} />
                  故事梗概
                </h4>
                <p style={{ fontSize: '14px', color: mutedTextColor, lineHeight: '1.8' }}>
                  {storyline.synopsis}
                </p>
              </div>
            </Card>

            <Card style={{ padding: '24px', backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: textColor, marginBottom: '16px' }}>
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
                    <h4 style={{ 
                      fontSize: '14px', 
                      fontWeight: '500', 
                      color: act.color,
                      marginBottom: '8px'
                    }}>
                      {act.title}: {actData.title}
                    </h4>
                    <ul style={{ 
                      listStyle: 'none', 
                      padding: 0, 
                      margin: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}>
                      {actData.beats.map((beat, i) => (
                        <li key={i} style={{ 
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '8px',
                          fontSize: '14px',
                          color: mutedTextColor
                        }}>
                          <span style={{ 
                            color: accentColor,
                            fontWeight: '500'
                          }}>
                            {i + 1}.
                          </span>
                          {beat}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </Card>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <Card style={{ padding: '20px', backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: textColor, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users style={{ width: '16px', height: '16px', color: accentColor }} />
                角色列表
              </h3>
              
              {storyline.characters.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {storyline.characters.map((char, i) => (
                    <div key={i} style={{ 
                      padding: '12px',
                      backgroundColor: inputBg,
                      borderRadius: '8px'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '4px'
                      }}>
                        <span style={{ fontWeight: '500', color: textColor }}>{char.name}</span>
                        <span style={{ 
                          fontSize: '12px', 
                          padding: '2px 8px',
                          backgroundColor: `${accentColor}20`,
                          color: accentColor,
                          borderRadius: '4px'
                        }}>
                          {char.role}
                        </span>
                      </div>
                      <p style={{ fontSize: '12px', color: mutedTextColor, margin: 0 }}>
                        {char.description.substring(0, 60)}...
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '14px', color: mutedTextColor, textAlign: 'center' }}>
                  暂无角色信息
                </p>
              )}
            </Card>

            <Card style={{ padding: '20px', backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: textColor, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Target style={{ width: '16px', height: '16px', color: accentColor }} />
                主题标签
              </h3>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {storyline.themes.map((theme, i) => (
                  <span key={i} style={{
                    padding: '4px 12px',
                    backgroundColor: `${accentColor}15`,
                    color: accentColor,
                    borderRadius: '16px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    {theme}
                  </span>
                ))}
              </div>
            </Card>

            <Card style={{ padding: '20px', backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: textColor, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap style={{ width: '16px', height: '16px', color: accentColor }} />
                建议信息
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock style={{ width: '14px', height: '14px', color: mutedTextColor }} />
                  <span style={{ fontSize: '14px', color: textColor }}>
                    {storyline.suggestedDuration} 分钟
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <Palette style={{ width: '14px', height: '14px', color: mutedTextColor, marginTop: '2px' }} />
                  <span style={{ fontSize: '14px', color: mutedTextColor }}>
                    {storyline.suggestedStyle}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: inputBg, display: 'flex' }}>
      <Sidebar />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{
          height: '64px',
          borderBottom: `1px solid ${borderColor}`,
          backgroundColor: cardBg,
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
        }}>
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
        </header>

        <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          {step === 'input' && renderInputStep()}
          {step === 'generating' && renderGeneratingStep()}
          {step === 'result' && renderResultStep()}
        </div>
      </main>
    </div>
  );
};

export default StorylinePage;
