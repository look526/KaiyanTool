import { cn } from '../../lib/utils';
import { StylePreset } from '../../config/styles';

interface StyleDetailCardProps {
  style: StylePreset;
}

export function StyleDetailCard({ style }: StyleDetailCardProps) {
  if (style.id === 'custom') return null;

  return (
    <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700 backdrop-blur-sm">
      <div className="text-sm font-semibold text-slate-200 mb-2">
        推荐用于：{style.recommendedFor.join('、')}
      </div>
      <div className="flex gap-2 flex-wrap">
        {style.colorPalette?.map((color, index) => (
          <div
            key={index}
            className="w-6 h-6 rounded border border-slate-600 transition-transform hover:scale-110"
            style={{ backgroundColor: color }}
            title={color}
            aria-label={`色板颜色 ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
