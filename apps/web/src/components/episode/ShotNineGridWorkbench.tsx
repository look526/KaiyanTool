import type { CSSProperties } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Grid3X3, ImageOff, Loader2, RotateCcw, Sparkles, Upload, Layers } from 'lucide-react';
import { apiClient } from '../../lib/api';
import { GlassButton } from '../ui/GlassButton';
import { useToast } from '../ui/Toast';

type ProviderOption = {
  id: string;
  type?: string;
  name?: string;
  enabled?: boolean;
};

export type ShotNineGridWorkbenchProps = {
  shotId: string;
  defaultPrompt: string;
  onApplyImage: (target: 'start' | 'end', imageUrl: string) => void;
  imageProviderId: string | null;
  /** 合成图或批量出图后刷新父级分镜（更新 nine_grid_image_url 等） */
  onRemoteShotChange?: () => void | Promise<void>;
};

interface NineGridComposite {
  id: string;
  shot_id: string;
  prompt: string;
  image_url: string | null;
  created_at: string;
}

interface NineGridPanelRow {
  id: string;
  shot_id: string;
  position: number;
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

/** 兼容 legacyResponseMiddleware：`{ success: true, data: T }` */
function unwrapLegacyApi<T>(r: unknown): T {
  if (
    r !== null &&
    typeof r === 'object' &&
    'success' in r &&
    (r as { success: boolean }).success === true &&
    'data' in r &&
    (r as { data: unknown }).data !== undefined
  ) {
    return (r as { data: T }).data;
  }
  return r as T;
}

export function ShotNineGridWorkbench({
  shotId,
  defaultPrompt,
  onApplyImage,
  imageProviderId,
  onRemoteShotChange,
}: ShotNineGridWorkbenchProps) {
  const { addToast } = useToast();
  const [tab, setTab] = useState<'cells' | 'composite'>('cells');
  const [loading, setLoading] = useState(true);
  const [nineGrid, setNineGrid] = useState<NineGridComposite | null>(null);
  const [panels, setPanels] = useState<NineGridPanelRow[]>([]);
  const [providers, setProviders] = useState<ProviderOption[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatingAll, setGeneratingAll] = useState(false);
  const [generatingPanelId, setGeneratingPanelId] = useState<string | null>(null);
  const [selectedCell, setSelectedCell] = useState<number | null>(null);

  const resolvedProviderId = useMemo(
    () => imageProviderId || selectedProviderId || providers[0]?.id || '',
    [imageProviderId, providers, selectedProviderId]
  );

  const loadNineGrid = useCallback(async () => {
    try {
      const raw = await apiClient.get<unknown>(`/shots/${shotId}/ninegrid`);
      const response = unwrapLegacyApi<Record<string, unknown>>(raw);
      if (response && typeof response === 'object' && 'id' in response) {
        setNineGrid({
          id: String(response.id),
          shot_id: String((response as any).shot_id || shotId),
          prompt: String((response as any).prompt || ''),
          image_url: ((response as any).image_url as string | null) || null,
          created_at: String((response as any).created_at || ''),
        });
      } else {
        setNineGrid(null);
      }
    } catch {
      setNineGrid(null);
    }
  }, [shotId]);

  const loadPanels = useCallback(async () => {
    try {
      const rawGet = await apiClient.get<unknown>(`/shots/${shotId}/ninegrid/panels`);
      let list = unwrapLegacyApi<NineGridPanelRow[]>(rawGet);
      let rows = Array.isArray(list) ? list : [];
      if (rows.length < 9) {
        const rawEnsure = await apiClient.post<unknown>(`/shots/${shotId}/ninegrid/panels/ensure`, {});
        list = unwrapLegacyApi<NineGridPanelRow[]>(rawEnsure);
        rows = Array.isArray(list) ? list : [];
      }
      setPanels(rows);
    } catch {
      setPanels([]);
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

  const refreshAll = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([loadNineGrid(), loadPanels(), loadProviders()]);
    } finally {
      setLoading(false);
    }
  }, [loadNineGrid, loadPanels, loadProviders]);

  useEffect(() => {
    void refreshAll();
  }, [refreshAll]);

  const handleGenerateComposite = async () => {
    if (!resolvedProviderId) {
      addToast({ type: 'warning', title: '缺少可用提供商', message: '请先启用出图模型。' });
      return;
    }
    try {
      setGenerating(true);
      const prompt = buildNineGridPrompt(defaultPrompt);
      const raw = await apiClient.post<unknown>(`/shots/${shotId}/ninegrid/generate`, {
        provider_id: resolvedProviderId,
        prompt,
      });
      const response = unwrapLegacyApi<Record<string, unknown>>(raw);
      const imageUrl = (response as any)?.image_url as string | undefined;
      if (response && imageUrl) {
        setNineGrid({
          id: String((response as any).id || shotId),
          shot_id: shotId,
          prompt,
          image_url: imageUrl,
          created_at: new Date().toISOString(),
        });
        addToast({ type: 'success', title: '合成九宫格已生成', message: '可用于视频参考或回填关键帧。' });
        void onRemoteShotChange?.();
      } else {
        throw new Error('No image URL');
      }
    } catch (error) {
      console.error(error);
      addToast({ type: 'error', title: '生成失败', message: '请稍后重试。' });
    } finally {
      setGenerating(false);
    }
  };

  const handleGeneratePanel = async (panelId: string) => {
    if (!resolvedProviderId) {
      addToast({ type: 'warning', title: '缺少可用提供商', message: '请选择出图模型。' });
      return;
    }
    try {
      setGeneratingPanelId(panelId);
      const raw = await apiClient.post<unknown>(
        `/shots/${shotId}/ninegrid/panels/${panelId}/generate`,
        { provider_id: resolvedProviderId }
      );
      const updated = unwrapLegacyApi<NineGridPanelRow>(raw);
      setPanels((prev) => prev.map((p) => (p.id === panelId ? { ...p, ...updated } : p)));
      addToast({ type: 'success', title: '本格已生成', message: '已写入独立出图结果。' });
    } catch (error) {
      console.error(error);
      addToast({ type: 'error', title: '单格生成失败', message: '请稍后重试。' });
    } finally {
      setGeneratingPanelId(null);
    }
  };

  const handleGenerateAllPanels = async () => {
    if (!resolvedProviderId) {
      addToast({ type: 'warning', title: '缺少可用提供商', message: '请选择出图模型。' });
      return;
    }
    try {
      setGeneratingAll(true);
      await apiClient.post(`/shots/${shotId}/ninegrid/panels/generate`, {
        provider_id: resolvedProviderId,
      });
      await loadPanels();
      void onRemoteShotChange?.();
      addToast({
        type: 'success',
        title: '九格批量出图已提交',
        message: '将依次调用模型，可能产生较高费用，请留意资产库。',
      });
    } catch (error) {
      console.error(error);
      addToast({ type: 'error', title: '批量出图失败', message: '请稍后重试。' });
    } finally {
      setGeneratingAll(false);
    }
  };

  const updatePanelPromptLocal = (panelId: string, prompt: string) => {
    setPanels((prev) => prev.map((p) => (p.id === panelId ? { ...p, prompt } : p)));
  };

  const persistPanelPrompt = async (panelId: string, prompt: string) => {
    try {
      await apiClient.put(`/shots/${shotId}/ninegrid/panels/${panelId}`, { prompt });
    } catch (e) {
      console.error(e);
    }
  };

  const sortedPanels = useMemo(() => [...panels].sort((a, b) => a.position - b.position), [panels]);

  const handleApplyImage = (target: 'start' | 'end') => {
    if (tab === 'composite' && nineGrid?.image_url) {
      onApplyImage(target, nineGrid.image_url);
      addToast({
        type: 'success',
        title: target === 'start' ? '已回填开始帧' : '已回填结束帧',
        message: '别忘了保存分镜。',
      });
      return;
    }
    if (tab === 'cells' && selectedCell !== null) {
      const p = sortedPanels.find((x) => x.position === selectedCell - 1);
      if (p?.image_url) {
        onApplyImage(target, p.image_url);
        addToast({
          type: 'success',
          title: target === 'start' ? '已回填开始帧' : '已回填结束帧',
          message: '使用所选格的独立出图。',
        });
        return;
      }
    }
    addToast({ type: 'warning', title: '无可用图片', message: '请先生成合成图或选择已有出图的格子。' });
  };

  return (
    <section style={containerStyle}>
      <div style={headerStyle}>
        <div>
          <div style={titleRowStyle}>
            <Grid3X3 style={{ width: '16px', height: '16px' }} />
            九宫格工作台
          </div>
          <p style={subtitleStyle}>
            <strong>逐格生成</strong>：九张独立描述与出图；<strong>一键合成</strong>：单提示词生成整张 3×3 组合图。九格批量出图将连续调用模型，请注意费用。
          </p>
        </div>
      </div>

      <div style={tabRowStyle}>
        <button
          type="button"
          style={{ ...tabBtnStyle, ...(tab === 'cells' ? tabBtnActiveStyle : undefined) }}
          onClick={() => setTab('cells')}
        >
          九格独立
        </button>
        <button
          type="button"
          style={{ ...tabBtnStyle, ...(tab === 'composite' ? tabBtnActiveStyle : undefined) }}
          onClick={() => setTab('composite')}
        >
          一键合成
        </button>
      </div>

      <div style={toolbarStyle}>
        <div style={providerRowStyle}>
          <span style={toolbarLabelStyle}>出图提供商</span>
          <select
            value={resolvedProviderId}
            onChange={(e) => setSelectedProviderId(e.target.value)}
            style={selectStyle}
            disabled={!!imageProviderId}
          >
            {providers.length === 0 ? (
              <option value="">暂无</option>
            ) : (
              providers.map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {getProviderLabel(provider)}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={loadingStyle}>
          <Loader2 style={spinnerLargeStyle} />
        </div>
      ) : tab === 'composite' ? (
        <div>
          <div style={toolbarActionsStyle}>
            <GlassButton
              variant="secondary"
              icon={<RotateCcw style={{ width: '16px', height: '16px' }} />}
              isDark={false}
              onClick={handleGenerateComposite}
              disabled={generating || !nineGrid?.image_url}
            >
              重新合成
            </GlassButton>
            <GlassButton
              variant="primary"
              icon={generating ? <Loader2 style={spinnerStyle} /> : <Sparkles style={{ width: '16px', height: '16px' }} />}
              isDark={false}
              loading={generating}
              onClick={handleGenerateComposite}
            >
              一键合成整张
            </GlassButton>
          </div>
          {!nineGrid?.image_url ? (
            <div style={emptyStyle}>
              <ImageOff style={{ width: '40px', height: '40px', color: 'var(--text-muted)' }} />
              <div style={emptyTitleStyle}>暂无合成图</div>
              <div style={emptyDescStyle}>使用当前分镜描述生成单张 3×3 组合图。</div>
            </div>
          ) : (
            <div style={bodyStyle}>
              <div style={previewContainerStyle}>
                <img src={nineGrid.image_url} alt="九宫格合成" style={nineGridImageStyle} />
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
                    >
                      <span style={cellNumberStyle}>{num}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div style={actionsContainerStyle}>
                <GlassButton variant="secondary" icon={<Upload style={{ width: '16px', height: '16px' }} />} isDark={false} onClick={() => handleApplyImage('start')}>
                  回填开始帧
                </GlassButton>
                <GlassButton variant="secondary" icon={<Upload style={{ width: '16px', height: '16px' }} />} isDark={false} onClick={() => handleApplyImage('end')}>
                  回填结束帧
                </GlassButton>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          <div style={toolbarActionsStyle}>
            <GlassButton
              variant="primary"
              icon={generatingAll ? <Loader2 style={spinnerStyle} /> : <Layers style={{ width: '16px', height: '16px' }} />}
              isDark={false}
              loading={generatingAll}
              onClick={() => void handleGenerateAllPanels()}
            >
              九格一键出图（逐张调用模型）
            </GlassButton>
          </div>
          <div style={cellsGridStyle}>
            {sortedPanels.slice(0, 9).map((panel) => (
              <div key={panel.id} style={cellCardStyle}>
                <div style={cellCardHeadStyle}>格 {panel.position + 1}</div>
                <textarea
                  value={panel.prompt}
                  onChange={(e) => updatePanelPromptLocal(panel.id, e.target.value)}
                  onBlur={() => void persistPanelPrompt(panel.id, panel.prompt)}
                  style={cellTextareaStyle}
                  rows={3}
                  placeholder="本格独立描述"
                />
                {panel.image_url ? (
                  <img src={panel.image_url} alt="" style={cellThumbStyle} />
                ) : (
                  <div style={cellPlaceholderStyle}>未出图</div>
                )}
                <GlassButton
                  variant="secondary"
                  icon={
                    generatingPanelId === panel.id ? (
                      <Loader2 style={spinnerStyle} />
                    ) : (
                      <Sparkles style={{ width: '14px', height: '14px' }} />
                    )
                  }
                  isDark={false}
                  loading={generatingPanelId === panel.id}
                  disabled={!resolvedProviderId || generatingAll}
                  onClick={() => void handleGeneratePanel(panel.id)}
                >
                  生成本格
                </GlassButton>
                <button
                  type="button"
                  style={pickCellBtnStyle}
                  onClick={() => setSelectedCell(panel.position + 1)}
                >
                  {selectedCell === panel.position + 1 ? '已选为回填源' : '选为回填源'}
                </button>
              </div>
            ))}
          </div>
          <div style={actionsContainerStyle}>
            <GlassButton variant="secondary" icon={<Upload style={{ width: '16px', height: '16px' }} />} isDark={false} onClick={() => handleApplyImage('start')}>
              回填开始帧
            </GlassButton>
            <GlassButton variant="secondary" icon={<Upload style={{ width: '16px', height: '16px' }} />} isDark={false} onClick={() => handleApplyImage('end')}>
              回填结束帧
            </GlassButton>
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
  marginBottom: '12px',
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
};

const tabRowStyle: CSSProperties = {
  display: 'flex',
  gap: '8px',
  marginBottom: '14px',
};

const tabBtnStyle: CSSProperties = {
  padding: '8px 14px',
  borderRadius: '999px',
  border: '1px solid var(--border-primary)',
  background: 'var(--bg-page)',
  color: 'var(--text-secondary)',
  fontSize: '12px',
  fontWeight: 600,
  cursor: 'pointer',
};

const tabBtnActiveStyle: CSSProperties = {
  border: '1px solid rgba(139, 92, 246, 0.45)',
  background: 'rgba(139, 92, 246, 0.12)',
  color: 'var(--text-primary)',
};

const toolbarStyle: CSSProperties = {
  marginBottom: '12px',
};

const providerRowStyle: CSSProperties = {
  display: 'grid',
  gap: '8px',
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
  marginBottom: '14px',
};

const loadingStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '120px',
};

const emptyStyle: CSSProperties = {
  minHeight: '160px',
  borderRadius: '16px',
  border: '1px dashed var(--border-primary)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
  textAlign: 'center',
};

const emptyTitleStyle: CSSProperties = { fontWeight: 700, marginTop: '8px' };
const emptyDescStyle: CSSProperties = { fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px' };

const bodyStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  gap: '16px',
  alignItems: 'start',
};

const previewContainerStyle: CSSProperties = {
  position: 'relative',
  borderRadius: '16px',
  overflow: 'hidden',
  border: '1px solid var(--border-primary)',
};

const nineGridImageStyle: CSSProperties = {
  width: '100%',
  height: 'auto',
  display: 'block',
};

const gridOverlayStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gridTemplateRows: 'repeat(3, 1fr)',
  gap: '2px',
  padding: '2px',
  pointerEvents: 'none',
};

const cellButtonStyle: CSSProperties = {
  pointerEvents: 'auto',
  background: 'rgba(0, 0, 0, 0.25)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '6px',
  cursor: 'pointer',
};

const cellButtonActiveStyle: CSSProperties = {
  background: 'rgba(99, 102, 241, 0.45)',
  border: '2px solid #8b5cf6',
};

const cellNumberStyle: CSSProperties = { fontSize: '11px', color: '#fff' };

const actionsContainerStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
  marginTop: '12px',
};

const cellsGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  gap: '12px',
};

const cellCardStyle: CSSProperties = {
  border: '1px solid var(--border-primary)',
  borderRadius: '14px',
  padding: '10px',
  background: 'var(--bg-elevated)',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const cellCardHeadStyle: CSSProperties = {
  fontSize: '12px',
  fontWeight: 700,
  color: 'var(--text-primary)',
};

const cellTextareaStyle: CSSProperties = {
  width: '100%',
  resize: 'vertical',
  borderRadius: '8px',
  border: '1px solid var(--border-primary)',
  background: 'var(--bg-input)',
  color: 'var(--text-primary)',
  padding: '8px',
  fontSize: '12px',
};

const cellThumbStyle: CSSProperties = {
  width: '100%',
  borderRadius: '8px',
  maxHeight: '120px',
  objectFit: 'cover',
};

const cellPlaceholderStyle: CSSProperties = {
  fontSize: '11px',
  color: 'var(--text-muted)',
  padding: '16px',
  textAlign: 'center',
  borderRadius: '8px',
  background: 'var(--bg-page)',
};

const pickCellBtnStyle: CSSProperties = {
  border: 'none',
  background: 'transparent',
  color: 'var(--accent, #8b5cf6)',
  fontSize: '11px',
  fontWeight: 600,
  cursor: 'pointer',
  padding: 0,
  textAlign: 'left',
};
