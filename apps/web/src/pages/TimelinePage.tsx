import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Film, Loader2, Play } from 'lucide-react';
import { StandardPageHeader } from '../components/ui/StandardPageHeader';
import { GlassButton } from '../components/ui/GlassButton';
import { apiClient } from '../lib/api-client';

/**
 * @description 时间线页面，提供最小可用的时间线创建与渲染入口。
 */
export default function TimelinePage() {
  const { id: projectId, episodeId } = useParams<{ id: string; episodeId: string }>();
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [timeline, setTimeline] = useState<any>(null);

  const loadTimeline = async () => {
    if (!projectId || !episodeId) return;
    try {
      setLoading(true);
      const result = await apiClient.getTimeline(projectId, episodeId);
      setTimeline(result?.data || result || null);
    } catch {
      setTimeline(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTimeline();
  }, [projectId, episodeId]);

  const handleCreate = async () => {
    if (!projectId || !episodeId) return;
    try {
      setCreating(true);
      await apiClient.createTimeline(projectId, episodeId);
      await loadTimeline();
    } finally {
      setCreating(false);
    }
  };

  const handleRender = async () => {
    if (!timeline?.id) return;
    try {
      setRendering(true);
      await apiClient.startTimelineRender(timeline.id);
      await loadTimeline();
    } finally {
      setRendering(false);
    }
  };

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 style={{ width: 40, height: 40, animation: 'spin 1s linear infinite' }} /></div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
      <StandardPageHeader
        title="时间线"
        subtitle="创建并管理当前剧集的音视频时间线"
        icon={<Film style={{ width: 24, height: 24, color: '#fff' }} />}
        iconGradient="linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
        actions={
          <>
            <GlassButton variant="secondary" onClick={handleCreate} loading={creating}>
              {timeline ? '重新生成时间线' : '创建时间线'}
            </GlassButton>
            {timeline && (
              <GlassButton variant="primary" icon={<Play style={{ width: 16, height: 16 }} />} onClick={handleRender} loading={rendering}>
                发起合成
              </GlassButton>
            )}
          </>
        }
      />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
        {!timeline ? (
          <div style={{ padding: 32, borderRadius: 20, border: '1px solid var(--border-primary)', background: 'var(--bg-card)' }}>当前还没有时间线，点击上方按钮即可自动从分镜、配音、字幕生成。</div>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            <div style={{ padding: 24, borderRadius: 20, border: '1px solid var(--border-primary)', background: 'var(--bg-card)' }}>
              <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>时间线概览</div>
              <div>状态：{timeline.status || 'draft'}</div>
              <div>时长：{timeline.duration || 0} ms</div>
              <div>分辨率：{timeline.resolution || '1080x1920'}</div>
              <div>FPS：{timeline.fps || 30}</div>
            </div>
            <div style={{ padding: 24, borderRadius: 20, border: '1px solid var(--border-primary)', background: 'var(--bg-card)' }}>
              <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>轨道数据</div>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{JSON.stringify(timeline.tracks || [], null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
