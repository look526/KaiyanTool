import { Users, Activity, TrendingUp } from 'lucide-react';
import { Card } from '../ui/card';
import { cn } from '../../lib/utils';

interface TeamActivityChartProps {
  activeMembers: number;
  actionsToday: number;
  actionsThisWeek: number;
}

export function TeamActivityChart({ activeMembers, actionsToday, actionsThisWeek }: TeamActivityChartProps) {
  const activityData = [
    {
      label: '今日',
      value: actionsToday,
      icon: Activity,
    },
    {
      label: '本周',
      value: actionsThisWeek,
      icon: TrendingUp,
    },
  ];

  return (
    <Card className="p-6">
      <div className="text-sm text-slate-400 mb-4">
        团队活跃度
      </div>
      <div className="grid grid-cols-2 gap-4">
        {activityData.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between p-4 rounded-lg border border-slate-700 hover:border-accent transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <div className={cn('p-3 rounded-lg', item.label === '今日' ? 'bg-blue-500/20' : 'bg-purple-500/20')}>
                <item.icon className="w-6 h-6 text-slate-300" />
              </div>
              <div>
                <div className="text-sm text-slate-400">
                  {item.label}
                </div>
                <div className="text-3xl font-bold text-slate-100">
                  {item.value}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500">
                次操作
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-3 rounded-lg bg-green-500/20">
              <Users className="w-6 h-6 text-slate-300" />
            </div>
            <div>
              <div className="text-sm text-slate-400">
                活跃成员
              </div>
              <div className="text-3xl font-bold text-slate-100">
                {activeMembers}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500">
              人
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
