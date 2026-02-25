import { Monitor, Smartphone } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AspectRatioSelectorProps {
  value: '16:9' | '9:16';
  onChange: (value: '16:9' | '9:16') => void;
  disabled?: boolean;
}

export function AspectRatioSelector({ value, onChange, disabled = false }: AspectRatioSelectorProps) {
  return (
    <div className="flex gap-3">
      <button
        onClick={() => !disabled && onChange('16:9')}
        disabled={disabled}
        className={cn(
          "flex-1 flex items-center justify-center gap-2",
          "p-4 rounded-xl border-2",
          "transition-all duration-200",
          "cursor-pointer",
          value === '16:9'
            ? "border-accent bg-accent text-white shadow-lg"
            : "border-slate-700 bg-transparent text-slate-300",
          "hover:border-accent hover:bg-accent/10",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        aria-label="横屏 16:9"
        aria-pressed={value === '16:9'}
      >
        <Monitor className="w-5 h-5 flex-shrink-0" />
        <span className="font-semibold text-base">16:9</span>
      </button>
      <button
        onClick={() => !disabled && onChange('9:16')}
        disabled={disabled}
        className={cn(
          "flex-1 flex items-center justify-center gap-2",
          "p-4 rounded-xl border-2",
          "transition-all duration-200",
          "cursor-pointer",
          value === '9:16'
            ? "border-accent bg-accent text-white shadow-lg"
            : "border-slate-700 bg-transparent text-slate-300",
          "hover:border-accent hover:bg-accent/10",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        aria-label="竖屏 9:16"
        aria-pressed={value === '9:16'}
      >
        <Smartphone className="w-5 h-5 flex-shrink-0" />
        <span className="font-semibold text-base">9:16</span>
      </button>
    </div>
  );
}
