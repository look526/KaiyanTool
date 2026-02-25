import { cn } from '../../lib/utils';
import { STYLE_PRESETS, StylePreset } from '../../config/styles';

interface StyleSelectorProps {
  value: string;
  onChange: (styleId: string) => void;
  disabled?: boolean;
}

export function StyleSelector({ value, onChange, disabled = false }: StyleSelectorProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {STYLE_PRESETS.map((style) => (
        <button
          key={style.id}
          onClick={() => !disabled && onChange(style.id)}
          disabled={disabled}
          className={cn(
            "p-4 rounded-xl border-2 text-left",
            "transition-all duration-200",
            "cursor-pointer",
            value === style.id
              ? "border-accent bg-accent text-white shadow-lg"
              : "border-slate-700 bg-transparent text-slate-300",
            "hover:border-accent hover:bg-accent/10",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          aria-label={style.name}
          aria-pressed={value === style.id}
        >
          <div className="text-sm font-semibold mb-1">
            {style.name}
          </div>
          <div className="text-xs opacity-80">
            {style.description.substring(0, 25)}...
          </div>
        </button>
      ))}
    </div>
  );
}
