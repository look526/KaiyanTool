import { useState, useEffect } from 'react';
import { X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export interface AIProcessingTask {
  id: string;
  type: 'parsing' | 'optimizing' | 'continuing' | 'rewriting' | 'converting';
  title: string;
  progress: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

interface AIProcessingProgressProps {
  tasks: AIProcessingTask[];
  onClear?: () => void;
}

export function AIProcessingProgress({ tasks, onClear }: AIProcessingProgressProps) {
  console.log('[AIProcessingProgress] 渲染，任务数量:', tasks.length, '任务列表:', tasks);
  if (tasks.length === 0) {
    console.log('[AIProcessingProgress] 没有任务，不渲染');
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-[9999] bg-white rounded-lg shadow-2xl border border-gray-200 w-80">
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
          <span className="font-semibold text-gray-900">AI处理中</span>
        </div>
        <button
          onClick={onClear}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          title="关闭"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      <div className="p-3 space-y-3 max-h-96 overflow-y-auto">
        {tasks.map(task => (
          <div
            key={task.id}
            className="bg-gray-50 rounded-lg p-3 border border-gray-200"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2 flex-1">
                {task.status === 'pending' && (
                  <Loader2 className="w-4 h-4 text-gray-400" />
                )}
                {task.status === 'processing' && (
                  <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                )}
                {task.status === 'completed' && (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                )}
                {task.status === 'failed' && (
                  <AlertCircle className="w-4 h-4 text-red-600" />
                )}
                <span className="text-sm font-medium text-gray-900 flex-1">
                  {task.title}
                </span>
              </div>
              {task.status === 'processing' && (
                <span className="text-xs font-semibold text-blue-600">
                  {task.progress}%
                </span>
              )}
            </div>

            {task.status === 'processing' && (
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-300 ease-out"
                  style={{ width: `${task.progress}%` }}
                />
              </div>
            )}

            {task.error && (
              <div className="text-xs text-red-600 mt-1">
                {task.error}
              </div>
            )}

            {task.status === 'completed' && (
              <div className="text-xs text-green-600 mt-1">
                处理完成
              </div>
            )}

            {task.status === 'failed' && (
              <div className="text-xs text-red-600 mt-1">
                处理失败
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
