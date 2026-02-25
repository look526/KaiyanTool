import { Card } from '../ui/card';
import { cn } from '../../lib/utils';

interface ProgressChartProps {
  percentage: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ProgressChart({ percentage, label = '项目进度', size = 'md' }: ProgressChartProps) {
  const sizeStyles = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  const widthStyles = {
    sm: 'w-32',
    md: 'w-48',
    lg: 'w-64',
  };

  return (
    <Card className="p-6">
      {label && (
        <div className="text-sm text-slate-400 mb-3">
          {label}
        </div>
      )}
      <div className="flex items-center gap-4">
        <div className={cn('flex-1', sizeStyles[size], widthStyles[size])}>
          <div className="w-full bg-slate-700/50 rounded-full h-full relative overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                'bg-gradient-to-r from-accent via-purple-500 to-pink-500'
              )}
              style={{ width: `${percentage}%` }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {percentage}%
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-slate-100">
            {percentage}%
          </div>
          <div className="text-sm text-slate-400">
            完成
          </div>
        </div>
      </div>
    </Card>
  );
}
