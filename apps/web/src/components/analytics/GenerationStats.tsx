import { Zap, CheckCircle, XCircle } from 'lucide-react';
import { Card } from '../ui/card';
import { cn } from '../../lib/utils';

interface GenerationStatsProps {
  total: number;
  success: number;
  failed: number;
  successRate: number;
}

export function GenerationStats({ total, success, failed, successRate }: GenerationStatsProps) {
  const stats = [
    {
      label: '总生成',
      value: total,
      icon: Zap,
      color: 'bg-blue-500/20',
    },
    {
      label: '成功',
      value: success,
      icon: CheckCircle,
      color: 'bg-green-500/20',
    },
    {
      label: '失败',
      value: failed,
      icon: XCircle,
      color: 'bg-red-500/20',
    },
  ];

  return (
    <Card className="p-6">
      <div className="text-sm text-slate-400 mb-4">
        生成统计
      </div>
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center justify-between p-4 rounded-lg border border-slate-700 hover:border-accent transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <div className={cn('p-3 rounded-lg', stat.color)}>
                <stat.icon className="w-6 h-6 text-slate-300" />
              </div>
              <div>
                <div className="text-sm text-slate-400">
                  {stat.label}
                </div>
                <div className="text-3xl font-bold text-slate-100">
                  {stat.value}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500">
                次
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-3 rounded-lg bg-green-500/20">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <div className="text-sm text-slate-400">
                成功率
              </div>
              <div className="text-3xl font-bold text-slate-100">
                {successRate.toFixed(1)}%
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500">
              总成功率
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
