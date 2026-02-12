import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

export type ProgressType = 'line' | 'circle' | 'dashboard';
export type ProgressSize = 'small' | 'medium' | 'large';

export interface ProgressProps {
  percent?: number;
  min?: number;
  max?: number;
  type?: ProgressType;
  size?: ProgressSize;
  status?: 'active' | 'success' | 'error';
  showInfo?: boolean;
  infoPosition?: 'start' | 'end' | 'inside' | 'outside';
  strokeColor?: string;
  trailColor?: string;
  strokeWidth?: number;
  strokeLinecap?: 'round' | 'square';
  gapDegree?: number;
  gapPosition?: 'top' | 'right' | 'bottom' | 'left';
  animation?: boolean;
  animationDuration?: number;
  className?: string;
}

export interface ProgressCircleProps extends Omit<ProgressProps, 'type'> {
  type?: 'circle' | 'dashboard';
}

const SIZE_CONFIG = {
  line: {
    small: { height: '4px', fontSize: '12px' },
    medium: { height: '8px', fontSize: '14px' },
    large: { height: '12px', fontSize: '16px' },
  },
  circle: {
    small: { size: 48, strokeWidth: 3 },
    medium: { size: 80, strokeWidth: 5 },
    large: { size: 120, strokeWidth: 7 },
  },
  dashboard: {
    small: { size: 48, strokeWidth: 3, gapDegree: 75 },
    medium: { size: 80, strokeWidth: 5, gapDegree: 75 },
    large: { size: 120, strokeWidth: 7, gapDegree: 75 },
  },
};

const STATUS_COLORS = {
  active: 'var(--accent)',
  success: 'var(--success)',
  error: 'var(--error)',
};

const calculatePercent = (value: number, min: number, max: number): number => {
  const percent = ((value - min) / (max - min)) * 100;
  return Math.min(Math.max(percent, 0), 100);
};

const formatPercent = (percent: number): string => {
  if (Number.isInteger(percent)) {
    return `${percent}%`;
  }
  return `${percent.toFixed(1)}%`;
};

export function Progress({
  percent = 0,
  min = 0,
  max = 100,
  type = 'line',
  size = 'medium',
  status = 'active',
  showInfo = true,
  infoPosition = 'end',
  strokeColor,
  trailColor,
  strokeWidth,
  strokeLinecap = 'round',
  gapDegree = 75,
  gapPosition = 'bottom',
  animation = true,
  animationDuration = 300,
  className,
}: ProgressProps) {
  const [animatedPercent, setAnimatedPercent] = useState(min);
  const targetPercent = calculatePercent(percent, min, max);

  useEffect(() => {
    if (!animation) {
      setAnimatedPercent(targetPercent);
      return;
    }

    const start = animatedPercent;
    const change = targetPercent - start;
    const duration = animationDuration;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const current = start + change * easeOutCubic;

      setAnimatedPercent(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    const animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [targetPercent, animation, animationDuration]);

  const getDisplayPercent = (): number => {
    if (type === 'circle' || type === 'dashboard') {
      return animatedPercent;
    }
    return animatedPercent;
  };

  const getColor = (): string => {
    if (strokeColor) return strokeColor;
    if (status === 'success') return STATUS_COLORS.success;
    if (status === 'error') return STATUS_COLORS.error;
    if (status === 'active') return STATUS_COLORS.active;
    return STATUS_COLORS.active;
  };

  const renderInfo = () => {
    if (!showInfo) return null;

    const fontSizeValue = SIZE_CONFIG.line[size as keyof typeof SIZE_CONFIG.line].fontSize;
    const contentText = status === 'success' ? <CheckCircle style={{ width: '16px', height: '16px', color: 'var(--success)' }} /> :
                        status === 'error' ? <AlertCircle style={{ width: '16px', height: '16px', color: 'var(--error)' }} /> :
                        formatPercent(getDisplayPercent());

    if (infoPosition === 'inside') {
      return (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: Math.max(parseInt(fontSizeValue, 10) - 2, 10),
            fontWeight: '600',
            color: 'var(--text-primary)',
            whiteSpace: 'nowrap',
          }}
        >
          {contentText}
        </div>
      );
    }

    return (
      <div
        style={{
          fontSize: fontSizeValue,
          fontWeight: '500',
          color: 'var(--text-primary)',
          marginLeft: infoPosition === 'start' ? 0 : '12px',
          marginRight: infoPosition === 'start' ? '12px' : 0,
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        {contentText}
      </div>
    );
  };

  if (type === 'circle' || type === 'dashboard') {
    const config = SIZE_CONFIG.circle[size as keyof typeof SIZE_CONFIG.circle] || SIZE_CONFIG.circle.medium;
    const radius = (config.size - config.strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const gapAngle = type === 'dashboard' ? gapDegree : gapDegree;
    const effectiveCircumference = circumference * (1 - gapAngle / 360);
    const strokeDashoffset = effectiveCircumference - (getDisplayPercent() / 100) * effectiveCircumference;

    const rotateValue = () => {
      switch (gapPosition) {
        case 'top': return 'rotate(-90deg)';
        case 'right': return 'rotate(0deg)';
        case 'bottom': return 'rotate(90deg)';
        case 'left': return 'rotate(180deg)';
        default: return 'rotate(-90deg)';
      }
    };

    return (
      <div
        className={className}
        style={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          width={config.size}
          height={config.size}
          style={{ transform: rotateValue() }}
        >
          <circle
            cx={config.size / 2}
            cy={config.size / 2}
            r={radius}
            fill="none"
            stroke={trailColor || 'var(--bg-secondary)'}
            strokeWidth={strokeWidth || config.strokeWidth}
          />
          <circle
            cx={config.size / 2}
            cy={config.size / 2}
            r={radius}
            fill="none"
            stroke={getColor()}
            strokeWidth={strokeWidth || config.strokeWidth}
            strokeLinecap={strokeLinecap}
            strokeDasharray={effectiveCircumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: animation ? `stroke-dashoffset ${animationDuration}ms ease-out` : 'none',
            }}
          />
        </svg>
        {showInfo && infoPosition !== 'inside' && renderInfo()}
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const config = SIZE_CONFIG.line[size as keyof typeof SIZE_CONFIG.line];
  const isInside = infoPosition === 'inside';

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
      }}
    >
      {infoPosition === 'start' && renderInfo()}
      <div
        style={{
          position: 'relative',
          flex: 1,
          height: config.height,
          backgroundColor: trailColor || 'var(--bg-secondary)',
          borderRadius: strokeLinecap === 'round' ? `${Number(config.height) / 2}px` : '4px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: `${getDisplayPercent()}%`,
            backgroundColor: getColor(),
            borderRadius: strokeLinecap === 'round' ? `${Number(config.height) / 2}px` : '4px',
            transition: animation ? `width ${animationDuration}ms ease-out` : 'none',
          }}
        />
        {isInside && renderInfo()}
      </div>
      {infoPosition === 'end' && renderInfo()}
    </div>
  );
}

export interface ProgressStepProps {
  steps: {
    title: string;
    description?: string;
    status?: 'wait' | 'process' | 'finish' | 'error';
  }[];
  current?: number;
  size?: 'small' | 'medium';
  direction?: 'horizontal' | 'vertical';
  className?: string;
}

export function ProgressStep({
  steps,
  current = 0,
  size = 'medium',
  direction = 'horizontal',
  className,
}: ProgressStepProps) {
  const iconSize = size === 'small' ? 20 : 24;
  const config = {
    small: { icon: 20, line: 2, title: 12, desc: 10 },
    medium: { icon: 24, line: 2, title: 14, desc: 12 },
  };

  const getStepIcon = (index: number, status: string | undefined) => {
    if (status === 'finish') {
      return <CheckCircle style={{ width: iconSize, height: iconSize, color: 'var(--success)' }} />;
    }
    if (status === 'error') {
      return <AlertCircle style={{ width: iconSize, height: iconSize, color: 'var(--error)' }} />;
    }
    return (
      <div
        style={{
          width: iconSize,
          height: iconSize,
          borderRadius: '50%',
          backgroundColor: index < current ? 'var(--accent)' : 'transparent',
          border: index < current ? 'none' : '2px solid var(--border-primary)',
          color: index < current ? '#fff' : 'var(--text-tertiary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: size === 'small' ? 12 : 14,
          fontWeight: 600,
          transition: 'all 0.2s ease',
        }}
      >
        {index + 1}
      </div>
    );
  };

  if (direction === 'vertical') {
    return (
      <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {steps.map((step, index) => (
          <div key={index} style={{ display: 'flex', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {getStepIcon(index, step.status)}
              {index < steps.length - 1 && (
                <div
                  style={{
                    width: '2px',
                    flex: 1,
                    backgroundColor: index < current ? 'var(--accent)' : 'var(--border-primary)',
                    marginTop: '8px',
                  }}
                />
              )}
            </div>
            <div style={{ flex: 1, paddingBottom: '8px' }}>
              <div
                style={{
                  fontSize: config[size].title,
                  fontWeight: 600,
                  color: index <= current ? 'var(--text-primary)' : 'var(--text-tertiary)',
                }}
              >
                {step.title}
              </div>
              {step.description && (
                <div
                  style={{
                    fontSize: config[size].desc,
                    color: 'var(--text-secondary)',
                    marginTop: '4px',
                  }}
                >
                  {step.description}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={className} style={{ display: 'flex', alignItems: 'center' }}>
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {getStepIcon(index, step.status)}
            <div
              style={{
                marginTop: '8px',
                textAlign: 'center',
                maxWidth: '100px',
              }}
            >
              <div
                style={{
                  fontSize: config[size].title,
                  fontWeight: 500,
                  color: index <= current ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {step.title}
              </div>
            </div>
          </div>
          {index < steps.length - 1 && (
            <div
              style={{
                flex: 1,
                height: '2px',
                backgroundColor: index < current ? 'var(--accent)' : 'var(--border-primary)',
                margin: `0 ${size === 'small' ? '8px' : '16px'}`,
                marginTop: `-${(iconSize / 2) + 8}px`,
              }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
