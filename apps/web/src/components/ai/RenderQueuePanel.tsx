import { useState, useEffect } from 'react';
import { RefreshCw, Pause, Play, Trash2, AlertCircle, CheckCircle, Clock, FileVideo, Image as ImageIcon } from 'lucide-react';

interface Task {
  id: string;
  type: 'image' | 'video' | 'video-interpolation';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'paused';
  progress: number;
  prompt?: string;
  createdAt: string;
  error?: string;
}

interface RenderQueuePanelProps {
  projectId?: string;
}

export function RenderQueuePanel({ projectId }: RenderQueuePanelProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ pending: 0, processing: 0, completed: 0, failed: 0 });

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, [projectId]);

  const fetchQueue = async () => {
    try {
      const url = projectId
        ? `/api/video-generation/queue/project/${projectId}`
        : '/api/video-generation/queue';
      const response = await fetch(url);
      const data = await response.json();
      setTasks(data.tasks || []);
      setStats({
        pending: data.pending || 0,
        processing: data.processing || 0,
        completed: data.completed || 0,
        failed: data.failed || 0
      });
    } catch (error) {
      console.error('Failed to fetch queue:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePause = async (taskId: string) => {
    await fetch(`/api/video-generation/queue/${taskId}/pause`, { method: 'POST' });
    fetchQueue();
  };

  const handleResume = async (taskId: string) => {
    await fetch(`/api/video-generation/queue/${taskId}/resume`, { method: 'POST' });
    fetchQueue();
  };

  const handleCancel = async (taskId: string) => {
    await fetch(`/api/video-generation/queue/${taskId}/cancel`, { method: 'POST' });
    fetchQueue();
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'processing':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'paused':
        return <Pause className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTypeIcon = (type: Task['type']) => {
    switch (type) {
      case 'video':
      case 'video-interpolation':
        return <FileVideo className="w-4 h-4" />;
      case 'image':
        return <ImageIcon className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">渲染队列</h3>
          <button
            onClick={fetchQueue}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-4 mt-3 text-sm">
          <span className="flex items-center gap-1 text-yellow-500">
            <Clock className="w-3 h-3" /> {stats.pending} 等待中
          </span>
          <span className="flex items-center gap-1 text-blue-500">
            <RefreshCw className="w-3 h-3 animate-spin" /> {stats.processing} 处理中
          </span>
          <span className="flex items-center gap-1 text-green-500">
            <CheckCircle className="w-3 h-3" /> {stats.completed} 已完成
          </span>
          <span className="flex items-center gap-1 text-red-500">
            <AlertCircle className="w-3 h-3" /> {stats.failed} 失败
          </span>
        </div>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto">
        {tasks.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>暂无渲染任务</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-750">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-1">{getStatusIcon(task.status)}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(task.type)}
                      <span className="font-medium capitalize">
                        {task.type === 'video-interpolation' ? '帧插值' : task.type}
                      </span>
                    </div>
                    {task.prompt && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2 max-w-xs">
                        {task.prompt}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(task.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {task.status === 'processing' && (
                    <div className="w-20 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  )}
                  {task.status === 'pending' && (
                    <button
                      onClick={() => handlePause(task.id)}
                      className="p-1.5 text-gray-400 hover:text-yellow-500"
                      title="暂停"
                    >
                      <Pause className="w-4 h-4" />
                    </button>
                  )}
                  {task.status === 'paused' && (
                    <button
                      onClick={() => handleResume(task.id)}
                      className="p-1.5 text-gray-400 hover:text-green-500"
                      title="继续"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  )}
                  {(task.status === 'pending' || task.status === 'paused') && (
                    <button
                      onClick={() => handleCancel(task.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500"
                      title="取消"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  {task.status === 'failed' && task.error && (
                    <span className="text-xs text-red-500 max-w-[100px] truncate" title={task.error}>
                      {task.error}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
