import React from 'react';

export interface GridProps {
  children: React.ReactNode;
  cols?: number | Record<string, number>;
  gap?: number | Record<string, number>;
  padding?: number | Record<string, number>;
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly';
}

export const Grid: React.FC<GridProps> = ({
  children,
  cols = 1,
  gap = 0,
  padding = 0,
  align = 'stretch',
  justify = 'start',
}) => {
  const getResponsiveValue = (value: number | Record<string, number>, fallback: number) => {
    if (typeof value === 'number') {
      return value;
    }
    return {
      xs: value.xs ?? fallback,
      sm: value.sm ?? value.xs ?? fallback,
      md: value.md ?? value.sm ?? value.xs ?? fallback,
      lg: value.lg ?? value.md ?? value.sm ?? value.xs ?? fallback,
      xl: value.xl ?? value.lg ?? value.md ?? value.sm ?? value.xs ?? fallback,
    };
  };

  const colsValue = getResponsiveValue(cols, 1);
  const gapValue = getResponsiveValue(gap, 0);
  const paddingValue = getResponsiveValue(padding, 0);

  const baseStyle: React.CSSProperties = {
    display: 'grid',
    alignItems: align,
    justifyContent: justify,
  };

  if (typeof colsValue === 'object') {
    baseStyle.gridTemplateColumns = `repeat(${colsValue.xs}, 1fr)`;
    baseStyle.gap = `${typeof gapValue === 'object' ? gapValue.xs : gapValue}px`;
    baseStyle.padding = `${typeof paddingValue === 'object' ? paddingValue.xs : paddingValue}px`;
  } else {
    baseStyle.gridTemplateColumns = `repeat(${colsValue}, 1fr)`;
    baseStyle.gap = `${typeof gapValue === 'number' ? gapValue : 0}px`;
    baseStyle.padding = `${typeof paddingValue === 'number' ? paddingValue : 0}px`;
  }

  return (
    <div style={baseStyle}>
      {children}
    </div>
  );
};

export interface ResponsiveGridProps extends Omit<GridProps, 'cols'> {
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  xs = 1,
  sm,
  md,
  lg,
  xl,
  gap = 0,
  padding = 0,
  align = 'stretch',
  justify = 'start',
}) => {
  const getResponsiveGap = () => {
    if (typeof gap === 'number') {
      return gap;
    }
    return {
      xs: gap.xs ?? 0,
      sm: gap.sm ?? gap.xs ?? 0,
      md: gap.md ?? gap.sm ?? gap.xs ?? 0,
      lg: gap.lg ?? gap.md ?? gap.sm ?? gap.xs ?? 0,
      xl: gap.xl ?? gap.lg ?? gap.md ?? gap.sm ?? gap.xs ?? 0,
    };
  };

  const getResponsivePadding = () => {
    if (typeof padding === 'number') {
      return padding;
    }
    return {
      xs: padding.xs ?? 0,
      sm: padding.sm ?? padding.xs ?? 0,
      md: padding.md ?? padding.sm ?? padding.xs ?? 0,
      lg: padding.lg ?? padding.md ?? padding.sm ?? padding.xs ?? 0,
      xl: padding.xl ?? padding.lg ?? padding.md ?? padding.sm ?? padding.xs ?? 0,
    };
  };

  const gapValues = getResponsiveGap();
  const paddingValues = getResponsivePadding();

  const mediaQueries = [
    {
      breakpoint: 'sm',
      cols: sm,
      gap: typeof gapValues === 'object' ? gapValues.sm : gapValues,
      padding: typeof paddingValues === 'object' ? paddingValues.sm : paddingValues,
    },
    {
      breakpoint: 'md',
      cols: md,
      gap: typeof gapValues === 'object' ? gapValues.md : gapValues,
      padding: typeof paddingValues === 'object' ? paddingValues.md : paddingValues,
    },
    {
      breakpoint: 'lg',
      cols: lg,
      gap: typeof gapValues === 'object' ? gapValues.lg : gapValues,
      padding: typeof paddingValues === 'object' ? paddingValues.lg : paddingValues,
    },
    {
      breakpoint: 'xl',
      cols: xl,
      gap: typeof gapValues === 'object' ? gapValues.xl : gapValues,
      padding: typeof paddingValues === 'object' ? paddingValues.xl : paddingValues,
    },
  ];

  const breakpointValues = {
    xs: { cols: xs, gap: typeof gapValues === 'object' ? gapValues.xs : gapValues, padding: typeof paddingValues === 'object' ? paddingValues.xs : paddingValues },
    sm: { cols: sm ?? xs, gap: typeof gapValues === 'object' ? gapValues.sm : gapValues, padding: typeof paddingValues === 'object' ? paddingValues.sm : paddingValues },
    md: { cols: md ?? sm ?? xs, gap: typeof gapValues === 'object' ? gapValues.md : gapValues, padding: typeof paddingValues === 'object' ? paddingValues.md : paddingValues },
    lg: { cols: lg ?? md ?? sm ?? xs, gap: typeof gapValues === 'object' ? gapValues.lg : gapValues, padding: typeof paddingValues === 'object' ? paddingValues.lg : paddingValues },
    xl: { cols: xl ?? lg ?? md ?? sm ?? xs, gap: typeof gapValues === 'object' ? gapValues.xl : gapValues, padding: typeof paddingValues === 'object' ? paddingValues.xl : paddingValues },
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${breakpointValues.xs.cols}, 1fr)`,
      gap: `${breakpointValues.xs.gap}px`,
      padding: `${breakpointValues.xs.padding}px`,
      alignItems: align,
      justifyContent: justify,
      '@media (min-width: 640px)': {
        gridTemplateColumns: `repeat(${breakpointValues.sm.cols}, 1fr)`,
        gap: `${breakpointValues.sm.gap}px`,
        padding: `${breakpointValues.sm.padding}px`,
      },
      '@media (min-width: 768px)': {
        gridTemplateColumns: `repeat(${breakpointValues.md.cols}, 1fr)`,
        gap: `${breakpointValues.md.gap}px`,
        padding: `${breakpointValues.md.padding}px`,
      },
      '@media (min-width: 1024px)': {
        gridTemplateColumns: `repeat(${breakpointValues.lg.cols}, 1fr)`,
        gap: `${breakpointValues.lg.gap}px`,
        padding: `${breakpointValues.lg.padding}px`,
      },
      '@media (min-width: 1280px)': {
        gridTemplateColumns: `repeat(${breakpointValues.xl.cols}, 1fr)`,
        gap: `${breakpointValues.xl.gap}px`,
        padding: `${breakpointValues.xl.padding}px`,
      },
    } as React.CSSProperties}>
      {children}
    </div>
  );
};
