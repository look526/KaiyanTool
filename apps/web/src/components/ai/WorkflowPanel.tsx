import { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  X,
  Check,
  Clock,
  AlertCircle,
  ChevronRight,
  Layers,
  Zap,
  User
} from 'lucide-react';

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  estimatedDuration: number;
  tags: string[];
  steps: WorkflowStep[];
}

interface WorkflowStep {
  id: string;
  name: string;
  type: 'manual' | 'ai' | 'approval';
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  duration?: number;
  inputs?: Record<string, any>;
  outputs?: Record<string, any>;
}

interface WorkflowExecution {
  id: string;
  workflowId: string;
  template?: WorkflowTemplate;
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
  currentStepId?: string;
  progress: number;
  steps: WorkflowStep[];
  startedAt?: string;
  completedAt?: string;
  error?: string;
}

interface WorkflowPanelProps {
  projectId: string;
  onClose: () => void;
}

export function WorkflowPanel({ projectId, onClose }: WorkflowPanelProps) {
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [execution, setExecution] = useState<WorkflowExecution | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/workflows/templates');
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startExecution = async (templateId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/workflows/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, templateId })
      });
      const exec = await response.json();
      
      await fetch(`/api/workflows/${exec.id}/start`, { method: 'POST' });
      
      pollExecution(exec.id);
    } catch (error) {
      console.error('Failed to start execution:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const pollExecution = async (executionId: string) => {
    const poll = async () => {
      try {
        const response = await fetch(`/api/workflows/${executionId}`);
        const exec = await response.json();
        setExecution(exec);

        if (exec.status === 'running') {
          setTimeout(poll, 2000);
        }
      } catch (error) {
        console.error('Failed to poll execution:', error);
      }
    };
    poll();
  };

  const pauseExecution = async () => {
    if (!execution) return;
    await fetch(`/api/workflows/${execution.id}/pause`, { method: 'POST' });
  };

  const resumeExecution = async () => {
    if (!execution) return;
    await fetch(`/api/workflows/${execution.id}/resume`, { method: 'POST' });
    pollExecution(execution.id);
  };

  const cancelExecution = async () => {
    if (!execution) return;
    await fetch(`/api/workflows/${execution.id}/cancel`, { method: 'POST' });
    setExecution(null);
  };

  const getStepIcon = (type: WorkflowStep['type']) => {
    switch (type) {
      case 'manual':
        return <User className="w-4 h-4" />;
      case 'ai':
        return <Zap className="w-4 h-4" />;
      case 'approval':
        return <Check className="w-4 h-4" />;
    }
  };

  const getStepStatusColor = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-500';
      case 'running':
        return 'text-blue-500';
      case 'failed':
        return 'text-red-500';
      case 'skipped':
        return 'text-gray-400';
      default:
        return 'text-gray-400';
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}分${secs}秒` : `${secs}秒`;
  };

  const TemplateCard = ({ template }: { template: WorkflowTemplate }) => (
    <div
      onClick={() => setSelectedTemplate(template.id)}
      className={`p-4 rounded-lg border cursor-pointer transition-all ${
        selectedTemplate === template.id
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-500" />
          <h4 className="font-medium">{template.name}</h4>
        </div>
        <span className="text-xs text-gray-500 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatDuration(template.estimatedDuration)}
        </span>
      </div>
      <p className="text-sm text-gray-500 mb-3">{template.description}</p>
      <div className="flex flex-wrap gap-1">
        {template.tags.map(tag => (
          <span key={tag} className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );

  if (execution) {
    const completedSteps = execution.steps.filter(s => s.status === 'completed').length;
    const totalDuration = execution.steps.reduce((acc, s) => acc + (s.duration || 0), 0);

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl w-[600px] max-w-full max-h-[80vh] overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{execution.template?.name}</h3>
              <p className="text-sm text-gray-500">
                {execution.status === 'running' ? '执行中...' :
                 execution.status === 'completed' ? '已完成' :
                 execution.status === 'failed' ? '失败' : execution.status}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {execution.status === 'running' && (
                <button
                  onClick={pauseExecution}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <Pause className="w-5 h-5" />
                </button>
              )}
              {execution.status === 'paused' && (
                <button
                  onClick={resumeExecution}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <Play className="w-5 h-5" />
                </button>
              )}
              {(execution.status === 'running' || execution.status === 'paused') && (
                <button
                  onClick={cancelExecution}
                  className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                >
                  <X className="w-5 h-5 text-red-500" />
                </button>
              )}
            </div>
          </div>

          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500">执行进度</span>
              <span className="font-medium">{Math.round(execution.progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${execution.progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
              <span>{completedSteps}/{execution.steps.length} 步骤完成</span>
              <span>预计总时长: {formatDuration(totalDuration)}</span>
            </div>

            {execution.error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg mb-4">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{execution.error}</span>
                </div>
              </div>
            )}

            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {execution.steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    step.status === 'running'
                      ? 'bg-blue-50 dark:bg-blue-900/20'
                      : step.status === 'completed'
                      ? 'bg-green-50 dark:bg-green-900/20'
                      : 'bg-gray-50 dark:bg-gray-700/50'
                  }`}
                >
                  <div className={`${getStepStatusColor(step.status)}`}>
                    {step.status === 'completed' ? (
                      <Check className="w-5 h-5" />
                    ) : step.status === 'running' ? (
                      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    ) : step.status === 'failed' ? (
                      <X className="w-5 h-5" />
                    ) : (
                      <span className="w-5 h-5 flex items-center justify-center text-xs">
                        {index + 1}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {getStepIcon(step.type)}
                      <span className="font-medium">{step.name}</span>
                    </div>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                  {step.duration && (
                    <span className="text-xs text-gray-400">
                      {formatDuration(step.duration)}
                    </span>
                  )}
                  {index < execution.steps.length - 1 && (
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg"
            >
              {execution.status === 'completed' ? '完成' : '关闭'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-[800px] max-w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold">选择工作流</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {templates.map(template => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg"
          >
            取消
          </button>
          <button
            onClick={() => selectedTemplate && startExecution(selectedTemplate)}
            disabled={!selectedTemplate || isLoading}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            <Play className="w-4 h-4" />
            开始执行
          </button>
        </div>
      </div>
    </div>
  );
}
