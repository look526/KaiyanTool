import React from 'react';

interface BentoGridProps {
  children: React.ReactNode;
  columns?: number | { default?: number; sm?: number; md?: number; lg?: number; xl?: number };
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: React.CSSProperties;
}

const gapValues = {
  sm: 'var(--spacing-3)',
  md: 'var(--bento-gap)',
  lg: 'var(--bento-gap-lg)',
};

export function BentoGrid({
  children,
  columns = { default: 1, sm: 2, md: 3, lg: 4 },
  gap = 'md',
  className = '',
  style,
}: BentoGridProps) {
  const getColumnsStyle = () => {
    if (typeof columns === 'number') {
      return `repeat(${columns}, 1fr)`;
    }
    return {
      gridTemplateColumns: columns.default
        ? `repeat(${columns.default}, 1fr)`
        : 'repeat(auto-fit, minmax(var(--bento-min-width), 1fr))',
    };
  };

  const columnsStyle = (() => {
    if (typeof columns === 'number') {
      return { gridTemplateColumns: `repeat(${columns}, 1fr)` };
    }
    const style = getColumnsStyle();
    if (style && typeof style === 'object') {
      return style;
    }
    return {};
  })();

  return (
    <div
      className={className}
      style={{
        display: 'grid',
        gap: gapValues[gap],
        ...columnsStyle,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export default BentoGrid;
