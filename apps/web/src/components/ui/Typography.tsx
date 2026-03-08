import React from 'react';

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body1' | 'body2' | 'caption' | 'overline';
  color?: 'primary' | 'secondary' | 'tertiary' | 'muted' | 'accent' | 'danger' | 'success' | 'warning';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  align?: 'left' | 'center' | 'right' | 'justify';
  truncate?: boolean;
  gutterBottom?: boolean;
  as?: keyof React.JSX.IntrinsicElements;
  children: React.ReactNode;
}

const variantStyles = {
  h1: {
    fontSize: '36px',
    fontWeight: 700,
    lineHeight: '1.2',
    letterSpacing: '-0.025em',
  },
  h2: {
    fontSize: '30px',
    fontWeight: 700,
    lineHeight: '1.2',
    letterSpacing: '-0.025em',
  },
  h3: {
    fontSize: '24px',
    fontWeight: 600,
    lineHeight: '1.3',
    letterSpacing: '-0.025em',
  },
  h4: {
    fontSize: '20px',
    fontWeight: 600,
    lineHeight: '1.4',
    letterSpacing: '-0.025em',
  },
  h5: {
    fontSize: '18px',
    fontWeight: 600,
    lineHeight: '1.4',
    letterSpacing: '-0.025em',
  },
  h6: {
    fontSize: '16px',
    fontWeight: 600,
    lineHeight: '1.5',
    letterSpacing: '-0.025em',
  },
  body1: {
    fontSize: '16px',
    fontWeight: 400,
    lineHeight: '1.6',
    letterSpacing: '0',
  },
  body2: {
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: '1.6',
    letterSpacing: '0',
  },
  caption: {
    fontSize: '12px',
    fontWeight: 400,
    lineHeight: '1.5',
    letterSpacing: '0.025em',
  },
  overline: {
    fontSize: '12px',
    fontWeight: 600,
    lineHeight: '1.5',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
};

const colorStyles = {
  primary: 'var(--text-primary)',
  secondary: 'var(--text-secondary)',
  tertiary: 'var(--text-tertiary)',
  muted: 'var(--text-muted)',
  accent: 'var(--accent)',
  danger: 'var(--gradient-danger)',
  success: 'var(--gradient-success)',
  warning: 'var(--gradient-warning)',
};

const weightStyles = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
};

export const Typography: React.FC<TextProps> = ({
  variant = 'body1',
  color = 'primary',
  weight,
  align = 'left',
  truncate = false,
  gutterBottom = false,
  as,
  children,
  style,
  className,
  ...props
}) => {
  const Component = as || (variant.startsWith('h') ? variant : 'p');

  const baseStyles = {
    margin: '0',
    color: colorStyles[color],
    textAlign: align,
    fontFamily: 'var(--font-family-sans)',
    ...variantStyles[variant],
    ...(weight && { fontWeight: weightStyles[weight] }),
    ...(truncate && {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    }),
    ...(gutterBottom && { marginBottom: 'var(--spacing-2)' }),
    ...style,
  };

  return React.createElement(
    Component,
    {
      className,
      style: baseStyles,
      ...props,
    },
    children
  );
};

Typography.displayName = 'Typography';

export const H1: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Typography variant="h1" {...props} />
);

export const H2: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Typography variant="h2" {...props} />
);

export const H3: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Typography variant="h3" {...props} />
);

export const H4: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Typography variant="h4" {...props} />
);

export const H5: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Typography variant="h5" {...props} />
);

export const H6: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Typography variant="h6" {...props} />
);

export const Body1: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Typography variant="body1" {...props} />
);

export const Body2: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Typography variant="body2" {...props} />
);

export const Caption: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Typography variant="caption" {...props} />
);

export const Overline: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Typography variant="overline" {...props} />
);
