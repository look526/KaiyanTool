import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Clapperboard, Loader2, Play, RefreshCw } from 'lucide-react';
import { StandardPageHeader } from '../components/ui/StandardPageHeader';
import { GlassButton } from '../components/ui/GlassButton';
import { apiClient } from '../lib/api-client';

/**
 * @description 一键出片页面，提供最小可用的任务创建与状态查看能力。
 */
export default function ProductionPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [executing, setExecuting] = useState<string | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);

  const loadTasks = async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const result = await apiClient.listProductionTasks(projectId);
      const list = Array.isArray(result) ? result : (result as { data?: unknown[] })?.data;
      setTasks(Array.isArray(list) ? list : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTasks();
  }, [projectId]);

  const handleCreate = async () => {
    if (!projectId) return;
    try {
      setCreating(true);
      await apiClient.createProductionTask(projectId, {
        episode_id: '',
        provider_id: 'seedream',
      });
      await loadTasks();
    } catch {
      // 保持最小页面，不额外弹错
    } finally {
      setCreating(false);
    }
  };

  const handleExecute = async (taskId: string) => {
    try {
      setExecuting(taskId);
      await apiClient.executeProductionTask(taskId);
      await loadTasks();
    } finally {
      setExecuting(null);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
      <StandardPageHeader
        title="一键出片"
        subtitle="管理从分镜到成片的自动化生产任务"
        icon={<Clapperboard style={{ width: 24, height: 24, color: '#fff' }} />}
        iconGradient="linear-gradient(135deg, #f97316 0%, #ea580c 100%)"
        actions={
          <>
            <GlassButton variant="secondary" isDark={false} icon={<RefreshCw style={{ width: 16, height: 16 }} />} onClick={loadTasks}>
              刷新
            </GlassButton>
            <GlassButton variant="primary" isDark={false} onClick={handleCreate} loading={creating}>
              新建任务
            </GlassButton>
          </>
        }
      />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><Loader2 style={{ width: 40, height: 40, animation: 'spin 1s linear infinite' }} /></div>
        ) : tasks.length === 0 ? (
          <div style={{ padding: 32, borderRadius: 20, border: '1px solid var(--border-primary)', background: 'var(--bg-card)' }}>暂无 Production 任务，可先创建一个占位任务，后续再补充完整参数。</div>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {tasks.map((task) => (
              <div key={task.id} style={{ padding: 24, borderRadius: 20, border: '1px solid var(--border-primary)', background: 'var(--bg-card)', display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>任务 {task.id}</div>
                  <div>状态：{task.status}</div>
                  <div>进度：{task.progress || 0}%</div>
                  <div>当前步骤：{task.current_step || '未开始'}</div>
                </div>
                <GlassButton variant="primary" isDark={false} icon={<Play style={{ width: 16, height: 16 }} />} onClick={() => handleExecute(task.id)} loading={executing === task.id}>
                  执行
                </GlassButton>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
