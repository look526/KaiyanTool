import React, { useState, useRef, useEffect, useCallback } from 'react';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  placement?: TooltipPlacement;
  trigger?: 'hover' | 'click' | 'focus' | 'manual';
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  delay?: number;
  size?: 'small' | 'medium' | 'large';
  theme?: 'light' | 'dark';
  disabled?: boolean;
  offset?: number;
  className?: string;
}

const SIZE_CONFIG = {
  small: {
    padding: '4px 8px',
    fontSize: '12px',
    arrowSize: 6,
  },
  medium: {
    padding: '8px 12px',
    fontSize: '14px',
    arrowSize: 8,
  },
  large: {
    padding: '12px 16px',
    fontSize: '15px',
    arrowSize: 10,
  },
};

export function Tooltip({
  content,
  children,
  placement = 'top',
  trigger = 'hover',
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
  delay = 150,
  size = 'medium',
  theme = 'dark',
  disabled = false,
  offset = 8,
  className,
}: TooltipProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [currentPlacement, setCurrentPlacement] = useState(placement);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isControlled = controlledOpen !== undefined;

  const isVisible = isControlled ? controlledOpen : isOpen;

  const getTooltipPosition = useCallback(() => {
    if (!containerRef.current || !tooltipRef.current) return { top: 0, left: 0 };

    const containerRect = containerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();

    let top = 0;
    let left = 0;
    let finalPlacement = placement;

    const containerCenterX = containerRect.left + containerRect.width / 2;
    const containerCenterY = containerRect.top + containerRect.height / 2;

    const availableSpace = {
      top: containerRect.top,
      bottom: window.innerHeight - containerRect.bottom,
      left: containerRect.left,
      right: window.innerWidth - containerRect.right,
    };

    const tooltipSpace = {
      width: tooltipRect.width + offset,
      height: tooltipRect.height + offset,
    };

    if (placement === 'top' && availableSpace.top < tooltipSpace.height) {
      if (availableSpace.bottom > tooltipSpace.height) {
        finalPlacement = 'bottom';
      } else if (availableSpace.left > tooltipSpace.width) {
        finalPlacement = 'left';
      } else if (availableSpace.right > tooltipSpace.width) {
        finalPlacement = 'right';
      }
    } else if (placement === 'bottom' && availableSpace.bottom < tooltipSpace.height) {
      if (availableSpace.top > tooltipSpace.height) {
        finalPlacement = 'top';
      } else if (availableSpace.left > tooltipSpace.width) {
        finalPlacement = 'left';
      } else if (availableSpace.right > tooltipSpace.width) {
        finalPlacement = 'right';
      }
    } else if (placement === 'left' && availableSpace.left < tooltipSpace.width) {
      if (availableSpace.right > tooltipSpace.width) {
        finalPlacement = 'right';
      } else if (availableSpace.top > tooltipSpace.height) {
        finalPlacement = 'top';
      } else if (availableSpace.bottom > tooltipSpace.height) {
        finalPlacement = 'bottom';
      }
    } else if (placement === 'right' && availableSpace.right < tooltipSpace.width) {
      if (availableSpace.left > tooltipSpace.width) {
        finalPlacement = 'left';
      } else if (availableSpace.top > tooltipSpace.height) {
        finalPlacement = 'top';
      } else if (availableSpace.bottom > tooltipSpace.height) {
        finalPlacement = 'bottom';
      }
    }

    setCurrentPlacement(finalPlacement);

    switch (finalPlacement) {
      case 'top':
        top = containerRect.top - offset;
        left = containerCenterX - tooltipRect.width / 2;
        break;
      case 'bottom':
        top = containerRect.bottom + offset;
        left = containerCenterX - tooltipRect.width / 2;
        break;
      case 'left':
        top = containerCenterY - tooltipRect.height / 2;
        left = containerRect.left - offset;
        break;
      case 'right':
        top = containerCenterY - tooltipRect.height / 2;
        left = containerRect.right + offset;
        break;
    }

    return { top, left };
  }, [placement, offset, size]);

  useEffect(() => {
    if (isVisible) {
      const pos = getTooltipPosition();
      setPosition(pos);
    }
  }, [isVisible, getTooltipPosition]);

  const handleOpen = useCallback(() => {
    if (disabled) return;
    if (!isControlled) {
      setIsOpen(true);
    }
    onOpenChange?.(true);
  }, [disabled, isControlled, onOpenChange]);

  const handleClose = useCallback(() => {
    if (!isControlled) {
      setIsOpen(false);
    }
    onOpenChange?.(false);
  }, [isControlled, onOpenChange]);

  const handleMouseEnter = () => {
    if (trigger === 'hover' || trigger === 'focus') {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(handleOpen, delay);
    }
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover' || trigger === 'focus') {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(handleClose, delay);
    }
  };

  const handleClick = () => {
    if (trigger === 'click') {
      if (isControlled) {
        onOpenChange?.(!isVisible);
      } else {
        setIsOpen(!isOpen);
      }
    }
  };

  const handleFocus = () => {
    if (trigger === 'focus') {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(handleOpen, delay);
    }
  };

  const handleBlur = () => {
    if (trigger === 'focus') {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(handleClose, delay);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isVisible && trigger !== 'manual') {
      const handleScroll = () => {
        if (isVisible) {
          const pos = getTooltipPosition();
          setPosition(pos);
        }
      };

      const handleResize = () => {
        if (isVisible) {
          const pos = getTooltipPosition();
          setPosition(pos);
        }
      };

      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [isVisible, trigger, getTooltipPosition]);

  const renderArrow = () => {
    const arrowSize = SIZE_CONFIG[size].arrowSize;
    const isDark = theme === 'dark';

    const arrowStyle: React.CSSProperties = {
      position: 'absolute',
      width: arrowSize,
      height: arrowSize,
      backgroundColor: isDark ? 'var(--bg-primary)' : '#fff',
      border: `1px solid ${isDark ? 'var(--border-primary)' : 'var(--border-secondary)'}`,
      transform: 'rotate(45deg)',
    };

    switch (currentPlacement) {
      case 'top':
        return (
          <div
            style={{
              ...arrowStyle,
              bottom: -arrowSize / 2 + 1,
              left: '50%',
              marginLeft: -arrowSize / 2,
              borderTop: 'none',
              borderLeft: 'none',
            }}
          />
        );
      case 'bottom':
        return (
          <div
            style={{
              ...arrowStyle,
              top: -arrowSize / 2 + 1,
              left: '50%',
              marginLeft: -arrowSize / 2,
              borderBottom: 'none',
              borderRight: 'none',
            }}
          />
        );
      case 'left':
        return (
          <div
            style={{
              ...arrowStyle,
              right: -arrowSize / 2 + 1,
              top: '50%',
              marginTop: -arrowSize / 2,
              borderTop: 'none',
              borderRight: 'none',
            }}
          />
        );
      case 'right':
        return (
          <div
            style={{
              ...arrowStyle,
              left: -arrowSize / 2 + 1,
              top: '50%',
              marginTop: -arrowSize / 2,
              borderBottom: 'none',
              borderLeft: 'none',
            }}
          />
        );
    }
  };

  const tooltipStyle: React.CSSProperties = {
    position: 'fixed',
    top: position.top,
    left: position.left,
    zIndex: 9999,
  };

  return (
    <div ref={containerRef} className={className} style={{ display: 'inline-block' }}>
      {React.isValidElement(children) &&
        React.cloneElement(children as React.ReactElement<any>, {
          onMouseEnter: (e: React.MouseEvent) => {
            (children.props as any)?.onMouseEnter?.(e);
            handleMouseEnter();
          },
          onMouseLeave: (e: React.MouseEvent) => {
            (children.props as any)?.onMouseLeave?.(e);
            handleMouseLeave();
          },
          onClick: (e: React.MouseEvent) => {
            (children.props as any)?.onClick?.(e);
            handleClick();
          },
          onFocus: (e: React.FocusEvent) => {
            (children.props as any)?.onFocus?.(e);
            handleFocus();
          },
          onBlur: (e: React.FocusEvent) => {
            (children.props as any)?.onBlur?.(e);
            handleBlur();
          },
          'aria-describedby': isVisible ? 'tooltip' : undefined,
        })}

      {isVisible && (
        <div
          ref={tooltipRef}
          id="tooltip"
          role="tooltip"
          style={tooltipStyle}
        >
          <div
            style={{
              padding: SIZE_CONFIG[size].padding,
              fontSize: SIZE_CONFIG[size].fontSize,
              lineHeight: 1.5,
              backgroundColor: theme === 'dark' ? 'var(--bg-primary)' : '#fff',
              color: theme === 'dark' ? '#fff' : 'var(--text-primary)',
              border: `1px solid ${theme === 'dark' ? 'var(--border-primary)' : 'var(--border-secondary)'}`,
              borderRadius: '6px',
              boxShadow: theme === 'dark'
                ? '0 4px 12px rgba(0, 0, 0, 0.3)'
                : '0 4px 12px rgba(0, 0, 0, 0.1)',
              maxWidth: size === 'small' ? '120px' : size === 'medium' ? '200px' : '300px',
              wordWrap: 'break-word',
              animation: 'tooltip-enter 0.15s ease-out',
            }}
          >
            {content}
          </div>
          {renderArrow()}
          <style>{`
            @keyframes tooltip-enter {
              from {
                opacity: 0;
                transform: scale(0.95);
              }
              to {
                opacity: 1;
                transform: scale(1);
              }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
