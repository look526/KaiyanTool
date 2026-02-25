import { Users, Film, Package } from 'lucide-react';
import { Card } from '../ui/card';
import { cn } from '../../lib/utils';

interface ResourceUsageCardProps {
  characters: number;
  scenes: number;
  items: number;
}

export function ResourceUsageCard({ characters, scenes, items }: ResourceUsageCardProps) {
  const resources = [
    {
      label: '角色',
      count: characters,
      icon: Users,
      color: 'bg-blue-500/20',
    },
    {
      label: '场景',
      count: scenes,
      icon: Film,
      color: 'bg-purple-500/20',
    },
    {
      label: '物品',
      count: items,
      icon: Package,
      color: 'bg-pink-500/20',
    },
  ];

  return (
    <Card className="p-6">
      <div className="text-sm text-slate-400 mb-4">
        资源使用
      </div>
      <div className="space-y-3">
        {resources.map((resource) => (
          <div
            key={resource.label}
            className="flex items-center justify-between p-4 rounded-lg border border-slate-700 hover:border-accent transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <div className={cn('p-3 rounded-lg', resource.color)}>
                <resource.icon className="w-6 h-6 text-slate-300" />
              </div>
              <div>
                <div className="text-sm text-slate-400">
                  {resource.label}
                </div>
                <div className="text-3xl font-bold text-slate-100">
                  {resource.count}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500">
                个
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
