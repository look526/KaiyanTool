import { X, Loader2, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

export interface AIProcessingTask {
  id: string;
  type: 'parsing' | 'optimizing' | 'continuing' | 'rewriting' | 'converting' | 'formatting';
  title: string;
  progress: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

interface AIProcessingProgressProps {
  tasks: AIProcessingTask[];
  onClear?: () => void;
}

const TYPE_CONFIG = {
  parsing: { gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)' },
  optimizing: { gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
  continuing: { gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' },
  rewriting: { gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
  converting: { gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' },
  formatting: { gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)' },
};

export function AIProcessingProgress({ tasks, onClear }: AIProcessingProgressProps) {
  if (tasks.length === 0) return null;

  const processingCount = tasks.filter(t => t.status === 'processing').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const failedCount = tasks.filter(t => t.status === 'failed').length;
  const overallProgress = Math.round(tasks.reduce((sum, t) => sum + t.progress, 0) / tasks.length);

  return (
    <>
      <style>{`
        @keyframes aiSlideIn { from { opacity: 0; transform: translateX(50px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes aiSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999,
        width: '340px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '14px',
        lineHeight: 1.5,
        boxSizing: 'border-box',
      }}>
        <div style={{
          background: '#1a1a2e',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          overflow: 'hidden',
          animation: 'aiSlideIn 0.3s ease',
        }}>
          <div style={{
            padding: '16px',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.3) 0%, rgba(139,92,246,0.3) 100%)',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Sparkles style={{ width: '18px', height: '18px', color: 'white' }} />
              </div>
              <div>
                <div style={{ fontWeight: 600, color: 'white' }}>AI 处理中</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                  {processingCount > 0 && <span style={{ color: '#818cf8' }}>{processingCount} 进行中 </span>}
                  {completedCount > 0 && <span style={{ color: '#34d399' }}>{completedCount} 完成 </span>}
                  {failedCount > 0 && <span style={{ color: '#f87171' }}>{failedCount} 失败</span>}
                </div>
              </div>
            </div>
            {onClear && (
              <button onClick={onClear} style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                border: 'none',
                background: 'rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.6)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <X style={{ width: '14px', height: '14px' }} />
              </button>
            )}
          </div>

          <div style={{ padding: '12px', maxHeight: '240px', overflowY: 'auto' }}>
            {tasks.map(task => {
              const config = TYPE_CONFIG[task.type] || TYPE_CONFIG.parsing;
              return (
                <div key={task.id} style={{
                  marginBottom: '8px',
                  padding: '12px',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '10px',
                  border: `1px solid ${task.status === 'failed' ? 'rgba(248,113,113,0.3)' : 'rgba(255,255,255,0.08)'}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: task.status === 'processing' ? '10px' : 0 }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: task.status === 'processing' ? 'rgba(99,102,241,0.2)'
                        : task.status === 'completed' ? 'rgba(52,211,153,0.2)'
                        : task.status === 'failed' ? 'rgba(248,113,113,0.2)'
                        : 'rgba(255,255,255,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {task.status === 'processing' && <Loader2 style={{ width: '16px', height: '16px', color: '#818cf8', animation: 'aiSpin 1s linear infinite' }} />}
                      {task.status === 'completed' && <CheckCircle style={{ width: '16px', height: '16px', color: '#34d399' }} />}
                      {task.status === 'failed' && <AlertCircle style={{ width: '16px', height: '16px', color: '#f87171' }} />}
                      {task.status === 'pending' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.4)' }} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 500, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {task.title}
                      </div>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                        {task.status === 'processing' && '正在处理...'}
                        {task.status === 'completed' && '处理完成'}
                        {task.status === 'failed' && (task.error || '处理失败')}
                        {task.status === 'pending' && '等待中...'}
                      </div>
                    </div>
                    {task.status === 'processing' && (
                      <div style={{ fontWeight: 700, color: '#818cf8', minWidth: '40px', textAlign: 'right' }}>
                        {task.progress}%
                      </div>
                    )}
                  </div>
                  {task.status === 'processing' && (
                    <div style={{ height: '3px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${task.progress}%`, background: config.gradient, borderRadius: '2px', transition: 'width 0.2s' }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {tasks.length > 1 && (
            <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px' }}>
                <span style={{ color: 'rgba(255,255,255,0.5)' }}>总体进度</span>
                <span style={{ color: 'white', fontWeight: 600 }}>{overallProgress}%</span>
              </div>
              <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${overallProgress}%`, background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', borderRadius: '2px' }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
