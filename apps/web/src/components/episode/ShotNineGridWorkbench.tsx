import type { CSSProperties } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ImagePlus, Images, LayoutGrid, Loader2, Save, Sparkles, Trash2 } from 'lucide-react';
import { apiClient } from '../../lib/api';
import type { Panel } from '../../lib/panelUtils';
import {
  getPanelStatus,
  getPanelStatusBackgroundColor,
  getPanelStatusBorderColor,
  getPanelStatusColor,
  getPanelStatusLabel,
} from '../../lib/panelUtils';
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

/**
 * @description 统一兼容九宫格面板接口的字段命名。
 */
function normalizePanel(panel: Record<string, any>): Panel {
  return {
    id: panel.id,
    shotId: panel.shotId ?? panel.shot_id ?? '',
    position: Number(panel.position ?? 0),
    prompt: panel.prompt ?? '',
    imageUrl: panel.imageUrl ?? panel.image_url ?? '',
    createdAt: panel.createdAt ?? panel.created_at ?? '',
  };
}

/**
 * @description 为新建的格子生成默认提示词，便于后续细化。
 */
function buildDefaultPanelPrompt(basePrompt: string, position: number): string {
  const normalized = basePrompt.trim();

  if (!normalized) {
    return `请补充分镜第 ${position} 格的构图、动作和画面重点。`;
  }

  return `${normalized}\n请继续细化为九宫格第 ${position} 格的独立画面描述。`;
}

/**
 * @description 生成提供商下拉框的展示文案。
 */
function getProviderLabel(provider: ProviderOption): string {
  if (provider.name && provider.type) {
    return `${provider.name} (${provider.type})`;
  }

  return provider.name || provider.type || provider.id;
}

/**
 * @description 分镜详情页内嵌九宫格工作台，用于细化当前分镜并回填关键帧。
 */
export function ShotNineGridWorkbench({ shotId, defaultPrompt, onApplyImage }: ShotNineGridWorkbenchProps) {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [panels, setPanels] = useState<Panel[]>([]);
  const [activePanelId, setActivePanelId] = useState<string | null>(null);
  const [draftPrompt, setDraftPrompt] = useState('');
  const [providers, setProviders] = useState<ProviderOption[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState('');
  const [savingPanelId, setSavingPanelId] = useState<string | null>(null);
  const [deletingPanelId, setDeletingPanelId] = useState<string | null>(null);
  const [creatingPanel, setCreatingPanel] = useState(false);
  const [batchCreating, setBatchCreating] = useState(false);
  const [generatingAll, setGeneratingAll] = useState(false);
  const [generatingIds, setGeneratingIds] = useState<Set<string>>(new Set());

  const loadPanels = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<any[]>(`/shots/${shotId}/panels`);
      const nextPanels = (Array.isArray(response) ? response : [])
        .map(normalizePanel)
        .sort((left, right) => left.position - right.position);

      setPanels(nextPanels);
    } catch (error) {
      console.error('Failed to load nine-grid panels:', error);
      addToast({
        type: 'error',
        title: '九宫格加载失败',
        message: '请稍后重试。',
      });
    } finally {
      setLoading(false);
    }
  }, [addToast, shotId]);

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
    void loadPanels();
    void loadProviders();
  }, [loadPanels, loadProviders]);

  useEffect(() => {
    if (panels.length === 0) {
      setActivePanelId(null);
      setDraftPrompt('');
      return;
    }

    if (!activePanelId || !panels.some((panel) => panel.id === activePanelId)) {
      setActivePanelId(panels[0].id);
    }
  }, [activePanelId, panels]);

  const activePanel = useMemo(
    () => panels.find((panel) => panel.id === activePanelId) ?? null,
    [activePanelId, panels]
  );

  useEffect(() => {
    setDraftPrompt(activePanel?.prompt ?? '');
  }, [activePanel]);

  const resolvedProviderId = useMemo(
    () => selectedProviderId || providers[0]?.id || '',
    [providers, selectedProviderId]
  );

  const generatedCount = useMemo(
    () => panels.filter((panel) => Boolean(panel.imageUrl)).length,
    [panels]
  );

  const emptyCount = useMemo(
    () => panels.filter((panel) => !panel.prompt.trim() && !panel.imageUrl).length,
    [panels]
  );

  const isDraftDirty = useMemo(() => {
    if (!activePanel) {
      return false;
    }

    return draftPrompt.trim() !== (activePanel.prompt ?? '').trim();
  }, [activePanel, draftPrompt]);

  const handleCreatePanel = async () => {
    if (panels.length >= 9) {
      addToast({
        type: 'warning',
        title: '已达到上限',
        message: '一期最多支持 9 格。',
      });
      return;
    }

    try {
      setCreatingPanel(true);
      const position = panels.length + 1;
      const created = await apiClient.post<any>(`/shots/${shotId}/panels`, {
        prompt: buildDefaultPanelPrompt(defaultPrompt, position),
        position,
      });
      const nextPanel = normalizePanel(created);

      setPanels((prev) => [...prev, nextPanel].sort((left, right) => left.position - right.position));
      setActivePanelId(nextPanel.id);
      addToast({
        type: 'success',
        title: '已新增面板',
        message: `第 ${position} 格已创建。`,
      });
    } catch (error) {
      console.error('Failed to create panel:', error);
      addToast({
        type: 'error',
        title: '新增失败',
        message: '请稍后重试。',
      });
    } finally {
      setCreatingPanel(false);
    }
  };

  const handleCreateBatch = async () => {
    if (panels.length >= 9) {
      addToast({
        type: 'warning',
        title: '无需补齐',
        message: '当前已经是 9 格。',
      });
      return;
    }

    try {
      setBatchCreating(true);
      const remaining = 9 - panels.length;
      const startPosition = panels.length + 1;
      const batchPanels = Array.from({ length: remaining }, (_, index) => ({
        prompt: buildDefaultPanelPrompt(defaultPrompt, startPosition + index),
        position: startPosition + index,
      }));
      const response = await apiClient.post<any>(`/shots/${shotId}/panels/batch`, {
        panels: batchPanels,
      });
      const nextPanels = Array.isArray((response as any)?.panels)
        ? (response as any).panels
            .map(normalizePanel)
            .sort((left: Panel, right: Panel) => left.position - right.position)
        : [];

      setPanels(nextPanels);
      setActivePanelId(nextPanels[0]?.id ?? null);
      addToast({
        type: 'success',
        title: '九宫格已补齐',
        message: `本次新增 ${remaining} 格。`,
      });
    } catch (error) {
      console.error('Failed to create batch panels:', error);
      addToast({
        type: 'error',
        title: '批量创建失败',
        message: '请稍后重试。',
      });
    } finally {
      setBatchCreating(false);
    }
  };

  const handleSavePanel = async () => {
    if (!activePanel) {
      return;
    }

    try {
      setSavingPanelId(activePanel.id);
      const updated = await apiClient.put<any>(`/panels/${activePanel.id}`, {
        prompt: draftPrompt.trim(),
        image_url: activePanel.imageUrl,
        position: activePanel.position,
      });
      const nextPanel = normalizePanel(updated);

      setPanels((prev) =>
        prev
          .map((panel) => (panel.id === nextPanel.id ? nextPanel : panel))
          .sort((left, right) => left.position - right.position)
      );
      addToast({
        type: 'success',
        title: '面板已保存',
        message: '当前格的提示词已更新。',
      });
    } catch (error) {
      console.error('Failed to save panel:', error);
      addToast({
        type: 'error',
        title: '保存失败',
        message: '请稍后重试。',
      });
    } finally {
      setSavingPanelId(null);
    }
  };

  const handleDeletePanel = async () => {
    if (!activePanel) {
      return;
    }

    try {
      setDeletingPanelId(activePanel.id);
      await apiClient.delete(`/panels/${activePanel.id}`);
      const nextPanels = panels.filter((panel) => panel.id !== activePanel.id);

      setPanels(nextPanels);
      setActivePanelId(nextPanels[0]?.id ?? null);
      addToast({
        type: 'success',
        title: '面板已删除',
      });
    } catch (error) {
      console.error('Failed to delete panel:', error);
      addToast({
        type: 'error',
        title: '删除失败',
        message: '请稍后重试。',
      });
    } finally {
      setDeletingPanelId(null);
    }
  };

  const handleGeneratePanel = async () => {
    if (!activePanel) {
      return;
    }

    if (!resolvedProviderId) {
      addToast({
        type: 'warning',
        title: '缺少可用提供商',
        message: '请先启用一个 AI 提供商。',
      });
      return;
    }

    try {
      setGeneratingIds((prev) => new Set(prev).add(activePanel.id));
      const response = await apiClient.post<any>(`/panels/${activePanel.id}/generate`, {
        provider_id: resolvedProviderId,
      });
      const nextPanel = normalizePanel((response as any)?.panel ?? {
        ...activePanel,
        image_url: (response as any)?.image_url,
      });

      setPanels((prev) =>
        prev
          .map((panel) => (panel.id === nextPanel.id ? nextPanel : panel))
          .sort((left, right) => left.position - right.position)
      );
      addToast({
        type: 'success',
        title: '当前格已生成',
      });
    } catch (error) {
      console.error('Failed to generate panel image:', error);
      addToast({
        type: 'error',
        title: '生成失败',
        message: '请稍后重试。',
      });
    } finally {
      setGeneratingIds((prev) => {
        const next = new Set(prev);
        next.delete(activePanel.id);
        return next;
      });
    }
  };

  const handleGenerateAll = async () => {
    if (panels.length === 0) {
      addToast({
        type: 'warning',
        title: '暂无可生成面板',
        message: '请先创建至少一格。',
      });
      return;
    }

    if (!resolvedProviderId) {
      addToast({
        type: 'warning',
        title: '缺少可用提供商',
        message: '请先启用一个 AI 提供商。',
      });
      return;
    }

    try {
      setGeneratingAll(true);
      await apiClient.post(`/shots/${shotId}/generate-panels`, {
        provider_id: resolvedProviderId,
      });
      await loadPanels();
      addToast({
        type: 'success',
        title: '九宫格已批量生成',
      });
    } catch (error) {
      console.error('Failed to generate all panels:', error);
      addToast({
        type: 'error',
        title: '批量生成失败',
        message: '请稍后重试。',
      });
    } finally {
      setGeneratingAll(false);
    }
  };

  const handleApplyImage = (target: 'start' | 'end') => {
    if (!activePanel?.imageUrl) {
      addToast({
        type: 'warning',
        title: '当前格还没有图片',
        message: '请先生成图片后再回填。',
      });
      return;
    }

    onApplyImage(target, activePanel.imageUrl);
    addToast({
      type: 'success',
      title: target === 'start' ? '已回填到开始帧' : '已回填到结束帧',
      message: '别忘了点击上方“保存分镜”。',
    });
  };

  return (
    <section style={containerStyle}>
      <div style={headerStyle}>
        <div>
          <div style={titleRowStyle}>
            <LayoutGrid style={{ width: '16px', height: '16px' }} />
            九宫格细化
          </div>
          <p style={subtitleStyle}>
            围绕当前分镜拆解 1 到 9 个关键格，并把生成结果快速回填到开始帧或结束帧。
          </p>
        </div>
        <div style={summaryRowStyle}>
          <span style={summaryBadgeStyle}>已建 {panels.length}/9</span>
          <span style={summaryBadgeStyle}>已出图 {generatedCount}</span>
          <span style={summaryBadgeStyle}>待细化 {emptyCount}</span>
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
            icon={batchCreating ? <Loader2 style={spinnerStyle} /> : <Images style={{ width: '16px', height: '16px' }} />}
            isDark={false}
            loading={batchCreating}
            onClick={handleCreateBatch}
          >
            补齐 9 格
          </GlassButton>
          <GlassButton
            variant="secondary"
            icon={creatingPanel ? <Loader2 style={spinnerStyle} /> : <ImagePlus style={{ width: '16px', height: '16px' }} />}
            isDark={false}
            loading={creatingPanel}
            onClick={handleCreatePanel}
          >
            新增面板
          </GlassButton>
          <GlassButton
            variant="primary"
            icon={generatingAll ? <Loader2 style={spinnerStyle} /> : <Sparkles style={{ width: '16px', height: '16px' }} />}
            isDark={false}
            loading={generatingAll}
            onClick={handleGenerateAll}
          >
            批量生成
          </GlassButton>
        </div>
      </div>

      {loading ? (
        <div style={loadingStyle}>
          <Loader2 style={spinnerLargeStyle} />
        </div>
      ) : panels.length === 0 ? (
        <div style={emptyStyle}>
          <LayoutGrid style={{ width: '32px', height: '32px', color: 'var(--text-muted)' }} />
          <div style={emptyTitleStyle}>当前分镜还没有九宫格</div>
          <div style={emptyDescStyle}>可以先新增单格，也可以一键补齐 9 格后逐格细化。</div>
          <div style={emptyActionsStyle}>
            <GlassButton variant="secondary" icon={<ImagePlus style={{ width: '16px', height: '16px' }} />} isDark={false} onClick={handleCreatePanel}>
              新增 1 格
            </GlassButton>
            <GlassButton variant="primary" icon={<Images style={{ width: '16px', height: '16px' }} />} isDark={false} onClick={handleCreateBatch}>
              一键补齐 9 格
            </GlassButton>
          </div>
        </div>
      ) : (
        <div style={bodyStyle}>
          <div style={gridStyle}>
            {panels.map((panel) => {
              const status = getPanelStatus(panel, generatingIds);
              const isActive = panel.id === activePanelId;

              return (
                <button
                  key={panel.id}
                  type="button"
                  style={{
                    ...panelCardStyle,
                    ...(isActive ? panelCardActiveStyle : null),
                  }}
                  onClick={() => setActivePanelId(panel.id)}
                >
                  <div style={panelCardHeaderStyle}>
                    <span style={panelIndexStyle}>#{String(panel.position).padStart(2, '0')}</span>
                    <span
                      style={{
                        ...panelStatusStyle,
                        color: getPanelStatusColor(status),
                        background: getPanelStatusBackgroundColor(status),
                        border: `1px solid ${getPanelStatusBorderColor(status)}`,
                      }}
                    >
                      {getPanelStatusLabel(status)}
                    </span>
                  </div>
                  <div style={panelImageWrapStyle}>
                    {panel.imageUrl ? (
                      <img src={panel.imageUrl} alt={`九宫格第 ${panel.position} 格`} style={panelImageStyle} />
                    ) : (
                      <div style={panelPlaceholderStyle}>待生成</div>
                    )}
                  </div>
                  <div style={panelPromptStyle}>{panel.prompt || '未填写提示词'}</div>
                </button>
              );
            })}
          </div>

          <div style={editorStyle}>
            {activePanel ? (
              <>
                <div style={editorHeaderStyle}>
                  <div>
                    <div style={editorTitleStyle}>第 {activePanel.position} 格</div>
                    <div style={editorSubtitleStyle}>编辑提示词，生成后可直接回填为当前分镜关键帧。</div>
                  </div>
                  <span style={summaryBadgeStyle}>{isDraftDirty ? '未保存' : activePanel.imageUrl ? '已生成图片' : '待生成图片'}</span>
                </div>

                <textarea
                  value={draftPrompt}
                  onChange={(event) => setDraftPrompt(event.target.value)}
                  placeholder="填写这一格的构图、动作、景别和画面重点。"
                  style={textareaStyle}
                />

                {activePanel.imageUrl ? (
                  <div style={previewWrapStyle}>
                    <img src={activePanel.imageUrl} alt={`第 ${activePanel.position} 格预览`} style={previewImageStyle} />
                  </div>
                ) : null}

                <div style={editorActionsStyle}>
                  <GlassButton
                    variant={isDraftDirty ? 'primary' : 'secondary'}
                    icon={savingPanelId === activePanel.id ? <Loader2 style={spinnerStyle} /> : <Save style={{ width: '16px', height: '16px' }} />}
                    isDark={false}
                    loading={savingPanelId === activePanel.id}
                    onClick={handleSavePanel}
                  >
                    保存当前格
                  </GlassButton>
                  <GlassButton
                    variant="secondary"
                    icon={generatingIds.has(activePanel.id) ? <Loader2 style={spinnerStyle} /> : <Sparkles style={{ width: '16px', height: '16px' }} />}
                    isDark={false}
                    loading={generatingIds.has(activePanel.id)}
                    onClick={handleGeneratePanel}
                  >
                    生成当前格
                  </GlassButton>
                  <GlassButton
                    variant="danger"
                    icon={deletingPanelId === activePanel.id ? <Loader2 style={spinnerStyle} /> : <Trash2 style={{ width: '16px', height: '16px' }} />}
                    isDark={false}
                    loading={deletingPanelId === activePanel.id}
                    onClick={handleDeletePanel}
                  >
                    删除当前格
                  </GlassButton>
                </div>

                <div style={applyActionsStyle}>
                  <button type="button" style={applyButtonStyle} onClick={() => handleApplyImage('start')}>
                    回填到开始帧
                  </button>
                  <button type="button" style={applyButtonStyle} onClick={() => handleApplyImage('end')}>
                    回填到结束帧
                  </button>
                </div>
              </>
            ) : null}
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

const summaryRowStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(92px, auto))',
  gap: '8px',
  alignItems: 'stretch',
  justifyContent: 'flex-end',
};

const summaryBadgeStyle: CSSProperties = {
  padding: '10px 12px',
  borderRadius: '14px',
  border: '1px solid var(--border-primary)',
  background: 'var(--bg-elevated)',
  fontSize: '12px',
  fontWeight: 700,
  color: 'var(--text-secondary)',
  textAlign: 'center',
  minWidth: '96px',
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

const emptyActionsStyle: CSSProperties = {
  display: 'flex',
  gap: '10px',
  marginTop: '18px',
};

const bodyStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) minmax(360px, 1.08fr)',
  gap: '16px',
  alignItems: 'start',
};

const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: '12px',
};

const panelCardStyle: CSSProperties = {
  border: '1px solid var(--border-primary)',
  background: 'rgba(255, 255, 255, 0.72)',
  borderRadius: '16px',
  padding: '12px',
  textAlign: 'left',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  display: 'grid',
  gap: '10px',
  minHeight: '220px',
};

const panelCardActiveStyle: CSSProperties = {
  border: '1px solid rgba(99, 102, 241, 0.45)',
  boxShadow: '0 10px 28px rgba(99, 102, 241, 0.14)',
  transform: 'translateY(-1px)',
};

const panelCardHeaderStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '8px',
};

const panelIndexStyle: CSSProperties = {
  fontSize: '11px',
  fontWeight: 700,
  color: 'var(--text-secondary)',
  fontFamily: 'monospace',
};

const panelStatusStyle: CSSProperties = {
  padding: '4px 8px',
  borderRadius: '999px',
  fontSize: '10px',
  fontWeight: 700,
};

const panelImageWrapStyle: CSSProperties = {
  width: '100%',
  aspectRatio: '1 / 1',
  borderRadius: '12px',
  overflow: 'hidden',
  background: 'var(--bg-secondary)',
  border: '1px solid var(--border-primary)',
};

const panelImageStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
};

const panelPlaceholderStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '12px',
  color: 'var(--text-muted)',
};

const panelPromptStyle: CSSProperties = {
  fontSize: '12px',
  color: 'var(--text-secondary)',
  lineHeight: 1.55,
  minHeight: '56px',
  display: '-webkit-box',
  WebkitLineClamp: 3,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
};

const editorStyle: CSSProperties = {
  border: '1px solid var(--border-primary)',
  background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.03) 0%, var(--bg-elevated) 18%, var(--bg-elevated) 100%)',
  borderRadius: '16px',
  padding: '16px',
};

const editorHeaderStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '12px',
  marginBottom: '14px',
};

const editorTitleStyle: CSSProperties = {
  fontSize: '15px',
  fontWeight: 700,
  color: 'var(--text-primary)',
};

const editorSubtitleStyle: CSSProperties = {
  marginTop: '6px',
  fontSize: '12px',
  lineHeight: 1.6,
  color: 'var(--text-secondary)',
};

const textareaStyle: CSSProperties = {
  width: '100%',
  minHeight: '140px',
  resize: 'vertical',
  borderRadius: '12px',
  border: '1px solid var(--border-primary)',
  background: 'var(--bg-input)',
  color: 'var(--text-primary)',
  padding: '12px 14px',
  fontSize: '14px',
  lineHeight: 1.6,
  marginBottom: '14px',
};

const previewWrapStyle: CSSProperties = {
  borderRadius: '14px',
  overflow: 'hidden',
  border: '1px solid var(--border-primary)',
  background: 'var(--bg-secondary)',
  marginBottom: '14px',
};

const previewImageStyle: CSSProperties = {
  width: '100%',
  maxHeight: '320px',
  objectFit: 'cover',
  display: 'block',
};

const editorActionsStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '10px',
  marginBottom: '12px',
};

const applyActionsStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '10px',
};

const applyButtonStyle: CSSProperties = {
  height: '40px',
  borderRadius: '10px',
  border: '1px solid var(--border-primary)',
  background: 'var(--bg-card)',
  color: 'var(--text-primary)',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
};