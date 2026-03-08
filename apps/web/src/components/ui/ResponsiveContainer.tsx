import React, { useRef, useEffect, useState } from 'react';

export interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className,
  style,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [breakpoint, setBreakpoint] = useState<'xs' | 'sm' | 'md' | 'lg' | 'xl'>('md');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setBreakpoint('xs');
      } else if (width < 768) {
        setBreakpoint('sm');
      } else if (width < 1024) {
        setBreakpoint('md');
      } else if (width < 1280) {
        setBreakpoint('lg');
      } else {
        setBreakpoint('xl');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div ref={containerRef} className={className} style={style} data-breakpoint={breakpoint}>
      {children}
    </div>
  );
};

export const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState<'xs' | 'sm' | 'md' | 'lg' | 'xl'>('md');
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      let newBreakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
      
      if (width < 640) {
        newBreakpoint = 'xs';
        setIsMobile(true);
        setIsTablet(false);
        setIsDesktop(false);
      } else if (width < 768) {
        newBreakpoint = 'sm';
        setIsMobile(true);
        setIsTablet(false);
        setIsDesktop(false);
      } else if (width < 1024) {
        newBreakpoint = 'md';
        setIsMobile(false);
        setIsTablet(true);
        setIsDesktop(false);
      } else if (width < 1280) {
        newBreakpoint = 'lg';
        setIsMobile(false);
        setIsTablet(false);
        setIsDesktop(true);
      } else {
        newBreakpoint = 'xl';
        setIsMobile(false);
        setIsTablet(false);
        setIsDesktop(true);
      }
      
      setBreakpoint(newBreakpoint);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { breakpoint, isMobile, isTablet, isDesktop };
};

export const Hide: React.FC<{ children: React.ReactNode; on: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | ('xs' | 'sm' | 'md' | 'lg' | 'xl')[] }> = ({ children, on }) => {
  const { breakpoint } = useBreakpoint();
  const hideOn = Array.isArray(on) ? on : [on];
  
  if (hideOn.includes(breakpoint)) {
    return null;
  }
  
  return <>{children}</>;
};

export const Show: React.FC<{ children: React.ReactNode; on: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | ('xs' | 'sm' | 'md' | 'lg' | 'xl')[] }> = ({ children, on }) => {
  const { breakpoint } = useBreakpoint();
  const showOn = Array.isArray(on) ? on : [on];
  
  if (!showOn.includes(breakpoint)) {
    return null;
  }
  
  return <>{children}</>;
};
