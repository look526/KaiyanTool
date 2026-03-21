import type { CSSProperties } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Grid3X3, ImageOff, Loader2, RotateCcw, Sparkles, Upload } from 'lucide-react';
import { apiClient } from '../../lib/api';
import { GlassButton } from '../ui/GlassButton';
import { useToast } from '../ui/Toast';

type ProviderOption = {
  id: string;
  type?: string;
  name?: string;
  enabled?: boolean;
};

type ShotNineGridWorkbenchProps = {
  shotId: string;
  defaultPrompt: string;
  onApplyImage: (target: 'start' | 'end', imageUrl: string) => void;
};

interface NineGridData {
  id: string;
  shot_id: string;
  prompt: string;
  image_url: string | null;
  created_at: string;
}

function buildNineGridPrompt(basePrompt: string): string {
  const normalized = basePrompt.trim();
  if (!normalized) {
    return 'A cinematic 3x3 storyboard grid layout, each cell showing a different moment of the scene, with consistent lighting and style';
  }
  return `Create a 3x3 storyboard grid image. Layout: ${normalized}. Each of the 9 cells should show a different moment or angle of this scene, maintaining visual consistency across all cells. Cinematic style, high quality.`;
}

function getProviderLabel(provider: ProviderOption): string {
  if (provider.name && provider.type) {
    return `${provider.name} (${provider.type})`;
  }
  return provider.name || provider.type || provider.id;
}

export function ShotNineGridWorkbench({ shotId, defaultPrompt, onApplyImage }: ShotNineGridWorkbenchProps) {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [nineGrid, setNineGrid] = useState<NineGridData | null>(null);
  const [providers, setProviders] = useState<ProviderOption[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState('');
  const [generating, setGenerating] = useState(false);
  const [selectedCell, setSelectedCell] = useState<number | null>(null);

  const loadNineGrid = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<any>(`/shots/${shotId}/ninegrid`);
      if (response && response.id) {
        setNineGrid({
          id: response.id,
          shot_id: response.shot_id,
          prompt: response.prompt || '',
          image_url: response.image_url || null,
          created_at: response.created_at,
        });
      } else {
        setNineGrid(null);
      }
    } catch (error) {
      console.error('Failed to load nine-grid:', error);
      setNineGrid(null);
    } finally {
      setLoading(false);
    }
  }, [shotId]);

  const loadProviders = useCallback(async () => {
    try {
      const response = await apiClient.getAIProviders();
      const nextProviders = Array.isArray((response as any)?.providers)
        ? (response as any).providers
        : Array.isArray(response)
          ? (response as any)
          : [];
      const enabledProviders = nextProviders.filter((provider: ProviderOption) => provider.enabled !== false);
      setProviders(enabledProviders);
      setSelectedProviderId((current) => current || enabledProviders[0]?.id || '');
    } catch (error) {
      console.error('Failed to load AI providers:', error);
    }
  }, []);

  useEffect(() => {
    void loadNineGrid();
    void loadProviders();
  }, [loadNineGrid, loadProviders]);

  const resolvedProviderId = useMemo(
    () => selectedProviderId || providers[0]?.id || '',
    [providers, selectedProviderId]
  );

  const handleGenerate = async () => {
    if (!resolvedProviderId) {
      addToast({
        type: 'warning',
        title: '缺少可用提供商',
        message: '请先启用一个 AI 提供商。',
      });
      return;
    }

    try {
      setGenerating(true);
      const prompt = buildNineGridPrompt(defaultPrompt);
      const response = await apiClient.post<any>(`/shots/${shotId}/ninegrid/generate`, {
        provider_id: resolvedProviderId,
        prompt,
      });

      if (response && response.image_url) {
        setNineGrid({
          id: response.id || shotId,
          shot_id: shotId,
          prompt,
          image_url: response.image_url,
          created_at: new Date().toISOString(),
        });
        addToast({
          type: 'success',
          title: '九宫格已生成',
          message: '可以根据分镜描述选择单元格回填。',
        });
      } else {
        throw new Error('No image URL in response');
      }
    } catch (error) {
      console.error('Failed to generate nine-grid:', error);
      addToast({
        type: 'error',
        title: '生成失败',
        message: '请稍后重试。',
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleRegenerate = async () => {
    await handleGenerate();
  };

  const handleApplyImage = (target: 'start' | 'end') => {
    if (!nineGrid?.image_url) {
      addToast({
        type: 'warning',
        title: '暂无九宫格图片',
        message: '请先生成九宫格。',
      });
      return;
    }

    if (selectedCell !== null) {
      addToast({
        type: 'info',
        title: '单元格选择已记录',
        message: `将使用第 ${selectedCell} 格回填到${target === 'start' ? '开始帧' : '结束帧'}（完整九宫格图片）`,
      });
    }

    onApplyImage(target, nineGrid.image_url);
    addToast({
      type: 'success',
      title: target === 'start' ? '已回填到开始帧' : '已回填到结束帧',
      message: '别忘了点击上方"保存分镜"。',
    });
  };

  return (
    <section style={containerStyle}>
      <div style={headerStyle}>
        <div>
          <div style={titleRowStyle}>
            <Grid3X3 style={{ width: '16px', height: '16px' }} />
            九宫格预览
          </div>
          <p style={subtitleStyle}>
            根据分镜描述生成一张 3×3 九宫格图片，选择单元格后可回填到开始帧或结束帧。
          </p>
        </div>
      </div>

      <div style={toolbarStyle}>
        <div style={providerRowStyle}>
          <span style={toolbarLabelStyle}>生成提供商</span>
          <select
            value={selectedProviderId}
            onChange={(event) => setSelectedProviderId(event.target.value)}
            style={selectStyle}
          >
            {providers.length === 0 ? (
              <option value="">暂无可用提供商</option>
            ) : (
              providers.map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {getProviderLabel(provider)}
                </option>
              ))
            )}
          </select>
        </div>

        <div style={toolbarActionsStyle}>
          <GlassButton
            variant="secondary"
            icon={<RotateCcw style={{ width: '16px', height: '16px' }} />}
            isDark={false}
            onClick={handleRegenerate}
            disabled={generating || !nineGrid?.image_url}
          >
            重新生成
          </GlassButton>
          <GlassButton
            variant="primary"
            icon={generating ? <Loader2 style={spinnerStyle} /> : <Sparkles style={{ width: '16px', height: '16px' }} />}
            isDark={false}
            loading={generating}
            onClick={handleGenerate}
          >
            生成九宫格
          </GlassButton>
        </div>
      </div>

      {loading ? (
        <div style={loadingStyle}>
          <Loader2 style={spinnerLargeStyle} />
        </div>
      ) : !nineGrid?.image_url ? (
        <div style={emptyStyle}>
          <Grid3X3 style={{ width: '48px', height: '48px', color: 'var(--text-muted)' }} />
          <div style={emptyTitleStyle}>暂无九宫格</div>
          <div style={emptyDescStyle}>点击"生成九宫格"根据分镜描述创建一张 3×3 组合图。</div>
        </div>
      ) : (
        <div style={bodyStyle}>
          <div style={previewContainerStyle}>
            <div style={nineGridImageWrapper}>
              <img
                src={nineGrid.image_url}
                alt="九宫格预览"
                style={nineGridImageStyle}
              />
              <div style={gridOverlayStyle}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    type="button"
                    style={{
                      ...cellButtonStyle,
                      ...(selectedCell === num ? cellButtonActiveStyle : null),
                    }}
                    onClick={() => setSelectedCell(selectedCell === num ? null : num)}
                    title={`第 ${num} 格`}
                  >
                    <span style={cellNumberStyle}>{num}</span>
                  </button>
                ))}
              </div>
            </div>
            <div style={infoRowStyle}>
              <span style={infoBadgeStyle}>
                {selectedCell !== null ? `已选第 ${selectedCell} 格` : '点击选择单元格'}
              </span>
            </div>
          </div>

          <div style={actionsContainerStyle}>
            <div style={sectionTitleStyle}>回填到关键帧</div>
            <p style={sectionDescStyle}>
              将九宫格图片回填到分镜的开始帧或结束帧。选中单元格后会记录您的选择。
            </p>
            <div style={applyActionsStyle}>
              <GlassButton
                variant="secondary"
                icon={<Upload style={{ width: '16px', height: '16px' }} />}
                isDark={false}
                onClick={() => handleApplyImage('start')}
              >
                回填到开始帧
              </GlassButton>
              <GlassButton
                variant="secondary"
                icon={<Upload style={{ width: '16px', height: '16px' }} />}
                isDark={false}
                onClick={() => handleApplyImage('end')}
              >
                回填到结束帧
              </GlassButton>
            </div>

            {nineGrid.prompt && (
              <div style={promptPreviewStyle}>
                <div style={promptLabelStyle}>生成提示词</div>
                <div style={promptTextStyle}>{nineGrid.prompt}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

const spinnerStyle: CSSProperties = {
  width: '16px',
  height: '16px',
  animation: 'spin 1s linear infinite',
};

const spinnerLargeStyle: CSSProperties = {
  width: '28px',
  height: '28px',
  animation: 'spin 1s linear infinite',
  color: 'var(--accent)',
};

const containerStyle: CSSProperties = {
  background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.04) 0%, var(--bg-card) 16%, var(--bg-card) 100%)',
  border: '1px solid var(--border-primary)',
  borderRadius: '18px',
  padding: '18px',
};

const headerStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '16px',
  marginBottom: '16px',
};

const titleRowStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '15px',
  fontWeight: 700,
  color: 'var(--text-primary)',
};

const subtitleStyle: CSSProperties = {
  margin: '8px 0 0',
  fontSize: '12px',
  lineHeight: 1.6,
  color: 'var(--text-secondary)',
  maxWidth: '620px',
};

const toolbarStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '280px minmax(0, 1fr)',
  gap: '12px',
  alignItems: 'stretch',
  marginBottom: '18px',
};

const providerRowStyle: CSSProperties = {
  display: 'grid',
  gap: '10px',
  alignContent: 'start',
  padding: '12px',
  borderRadius: '14px',
  border: '1px solid var(--border-primary)',
  background: 'var(--bg-elevated)',
};

const toolbarLabelStyle: CSSProperties = {
  fontSize: '12px',
  fontWeight: 600,
  color: 'var(--text-secondary)',
};

const selectStyle: CSSProperties = {
  width: '100%',
  minWidth: '220px',
  height: '40px',
  borderRadius: '10px',
  border: '1px solid var(--border-primary)',
  background: 'var(--bg-input)',
  color: 'var(--text-primary)',
  padding: '0 12px',
};

const toolbarActionsStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '10px',
  padding: '12px',
  borderRadius: '14px',
  border: '1px solid var(--border-primary)',
  background: 'var(--bg-elevated)',
  alignItems: 'center',
};

const loadingStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '180px',
};

const emptyStyle: CSSProperties = {
  minHeight: '220px',
  borderRadius: '16px',
  border: '1px dashed var(--border-primary)',
  background: 'var(--bg-elevated)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  padding: '24px',
};

const emptyTitleStyle: CSSProperties = {
  marginTop: '12px',
  fontSize: '16px',
  fontWeight: 700,
  color: 'var(--text-primary)',
};

const emptyDescStyle: CSSProperties = {
  marginTop: '8px',
  fontSize: '13px',
  lineHeight: 1.6,
  color: 'var(--text-secondary)',
  maxWidth: '420px',
};

const bodyStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) minmax(280px, 0.6fr)',
  gap: '20px',
  alignItems: 'start',
};

const previewContainerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

const nineGridImageWrapper: CSSProperties = {
  position: 'relative',
  width: '100%',
  borderRadius: '16px',
  overflow: 'hidden',
  border: '1px solid var(--border-primary)',
  background: 'var(--bg-secondary)',
};

const nineGridImageStyle: CSSProperties = {
  width: '100%',
  height: 'auto',
  display: 'block',
};

const gridOverlayStyle: CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gridTemplateRows: 'repeat(3, 1fr)',
  gap: '2px',
  padding: '2px',
};

const cellButtonStyle: CSSProperties = {
  background: 'rgba(0, 0, 0, 0.3)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '6px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s ease',
};

const cellButtonActiveStyle: CSSProperties = {
  background: 'rgba(99, 102, 241, 0.5)',
  border: '2px solid #8b5cf6',
};

const cellNumberStyle: CSSProperties = {
  fontSize: '12px',
  fontWeight: 700,
  color: 'rgba(255, 255, 255, 0.9)',
  textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)',
};

const infoRowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
};

const infoBadgeStyle: CSSProperties = {
  padding: '8px 16px',
  borderRadius: '12px',
  border: '1px solid var(--border-primary)',
  background: 'var(--bg-elevated)',
  fontSize: '12px',
  fontWeight: 600,
  color: 'var(--text-secondary)',
};

const actionsContainerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  padding: '16px',
  borderRadius: '16px',
  border: '1px solid var(--border-primary)',
  background: 'var(--bg-elevated)',
};

const sectionTitleStyle: CSSProperties = {
  fontSize: '14px',
  fontWeight: 700,
  color: 'var(--text-primary)',
};

const sectionDescStyle: CSSProperties = {
  fontSize: '12px',
  lineHeight: 1.6,
  color: 'var(--text-secondary)',
  margin: 0,
};

const applyActionsStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '10px',
};

const promptPreviewStyle: CSSProperties = {
  marginTop: '8px',
  padding: '12px',
  borderRadius: '12px',
  border: '1px solid var(--border-primary)',
  background: 'var(--bg-card)',
};

const promptLabelStyle: CSSProperties = {
  fontSize: '11px',
  fontWeight: 600,
  color: 'var(--text-muted)',
  marginBottom: '6px',
};

const promptTextStyle: CSSProperties = {
  fontSize: '12px',
  lineHeight: 1.5,
  color: 'var(--text-secondary)',
  display: '-webkit-box',
  WebkitLineClamp: 4,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
};