import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
  fontSize: string;
  setFontSize: (size: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'dark';
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('kaiyan-tool-theme');
    return (saved as Theme) || 'dark';
  });
  
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('kaiyan-tool-theme');
    if (saved === 'system' || !saved) {
      return getSystemTheme();
    }
    return saved === 'light' ? 'light' : 'dark';
  });
  
  const [accentColor, setAccentColorState] = useState<string>(() => {
    return localStorage.getItem('kaiyan-accent-color') || '#ba9eff';
  });
  
  const [fontSize, setFontSizeState] = useState<string>(() => {
    return localStorage.getItem('kaiyan-font-size') || '16px';
  });

  const applyTheme = (effectiveTheme: 'light' | 'dark') => {
    const root = document.documentElement;
    const body = document.body;

    if (effectiveTheme === 'dark') {
      // Aligned with HomePage design system: deep blue-black + purple/sky-blue/pink palette
      root.style.setProperty('--bg-base', '#070d1f');
      root.style.setProperty('--bg-surface', '#0c1326');
      root.style.setProperty('--bg-elevated', '#171f36');
      root.style.setProperty('--bg-page', '#070d1f');
      root.style.setProperty('--bg-sidebar', 'rgba(7, 13, 31, 0.95)');
      root.style.setProperty('--bg-hover', 'rgba(255, 255, 255, 0.06)');
      root.style.setProperty('--bg-input', 'rgba(255, 255, 255, 0.04)');
      root.style.setProperty('--bg-secondary', 'rgba(255, 255, 255, 0.03)');
      root.style.setProperty('--bg-tertiary', 'rgba(255, 255, 255, 0.02)');
      root.style.setProperty('--bg-glass', 'rgba(28, 37, 62, 0.4)');
      root.style.setProperty('--bg-glass-hover', 'rgba(28, 37, 62, 0.6)');
      root.style.setProperty('--bg-card', '#171f36');
      root.style.setProperty('--bg-header', 'rgba(7, 13, 31, 0.6)');
      root.style.setProperty('--text-primary', '#dfe4fe');
      root.style.setProperty('--text-secondary', 'rgba(223, 228, 254, 0.6)');
      root.style.setProperty('--text-tertiary', 'rgba(165, 170, 194, 0.7)');
      root.style.setProperty('--text-muted', '#a5aac2');
      root.style.setProperty('--text-placeholder', 'rgba(165, 170, 194, 0.5)');
      root.style.setProperty('--border-primary', 'rgba(255, 255, 255, 0.08)');
      root.style.setProperty('--border-secondary', 'rgba(255, 255, 255, 0.05)');
      root.style.setProperty('--border-hover', 'rgba(186, 158, 255, 0.25)');
      // Primary accent: #ba9eff (purple), Secondary: #34b5fa (sky-blue), Tertiary: #ec63ff (pink)
      root.style.setProperty('--accent', '#ba9eff');
      root.style.setProperty('--accent-light', '#d4bfff');
      root.style.setProperty('--accent-glow', '#ba9eff');
      root.style.setProperty('--accent-shadow', 'rgba(186, 158, 255, 0.25)');
      root.style.setProperty('--accent-bg', 'rgba(186, 158, 255, 0.1)');
      root.style.setProperty('--accent-text', '#ba9eff');
      root.style.setProperty('--secondary', '#34b5fa');
      root.style.setProperty('--tertiary', '#ec63ff');
      root.style.setProperty('--gradient-primary', 'linear-gradient(135deg, #ba9eff 0%, #ec63ff 100%)');
      root.style.setProperty('--gradient-secondary', 'linear-gradient(135deg, #34b5fa 0%, #06b6d4 100%)');
      root.style.setProperty('--gradient-success', 'linear-gradient(135deg, #10b981 0%, #059669 100%)');
      root.style.setProperty('--gradient-warning', 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)');
      root.style.setProperty('--gradient-danger', 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)');
      root.style.setProperty('--gradient-accent', 'linear-gradient(135deg, #ba9eff 0%, #8455ef 100%)');
      root.style.setProperty('--gradient-pink', 'linear-gradient(135deg, #ec63ff 0%, #f43f5e 100%)');
      root.style.setProperty('--gradient-teal', 'linear-gradient(135deg, #14b8a6 0%, #34b5fa 100%)');
      root.style.setProperty('--gradient-gray', 'linear-gradient(135deg, #a5aac2 0%, #6b7280 100%)');
      root.style.setProperty('--success-shadow', 'rgba(16, 185, 129, 0.3)');
      root.style.setProperty('--warning-shadow', 'rgba(245, 158, 11, 0.3)');
      root.style.setProperty('--error-shadow', 'rgba(239, 68, 68, 0.3)');
      root.style.setProperty('--info', '#3b82f6');
      root.style.setProperty('--info-bg', 'rgba(59, 130, 246, 0.1)');
      root.style.setProperty('--info-border', 'rgba(59, 130, 246, 0.2)');
      root.style.setProperty('--info-text', '#60a5fa');
      root.style.setProperty('--info-shadow', 'rgba(59, 130, 246, 0.3)');
      root.style.setProperty('--accent-border', 'rgba(186, 158, 255, 0.3)');
      root.style.setProperty('--input-border', 'rgba(255, 255, 255, 0.1)');
      root.style.setProperty('--input-focus-border', 'rgba(186, 158, 255, 0.5)');
      root.style.setProperty('--input-focus-shadow', '0 0 0 3px rgba(186, 158, 255, 0.1)');
      root.style.setProperty('--overlay-heavy', 'rgba(0, 0, 0, 0.8)');
      root.style.setProperty('--btn-danger-bg', 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)');
      root.style.setProperty('--btn-danger-shadow', 'rgba(239, 68, 68, 0.3)');
      root.style.setProperty('--nav-active-bg', 'rgba(186, 158, 255, 0.15)');
      root.style.setProperty('--nav-hover-bg', 'rgba(255, 255, 255, 0.06)');
      root.style.setProperty('--glass-blur', 'blur(40px)');
      root.style.setProperty('--glass-blur-sm', 'blur(20px)');
      root.style.setProperty('--scrollbar-track', 'rgba(255, 255, 255, 0.05)');
      root.style.setProperty('--scrollbar-thumb', 'rgba(255, 255, 255, 0.15)');
      root.style.setProperty('--scrollbar-thumb-hover', 'rgba(255, 255, 255, 0.25)');
      root.style.setProperty('--shadow-sm', '0 2px 8px rgba(0, 0, 0, 0.15)');
      root.style.setProperty('--shadow-md', '0 4px 16px rgba(0, 0, 0, 0.15)');
      root.style.setProperty('--shadow-lg', '0 8px 24px rgba(0, 0, 0, 0.2)');
      root.style.setProperty('--shadow-xl', '0 20px 40px rgba(0, 0, 0, 0.25)');
      root.style.setProperty('--shadow-accent', '0 8px 24px rgba(186, 158, 255, 0.2)');
      root.style.setProperty('--shadow-card', '0 4px 20px rgba(0, 0, 0, 0.12)');
      root.style.setProperty('--shadow-card-hover', '0 8px 32px rgba(0, 0, 0, 0.15), 0 0 40px rgba(186, 158, 255, 0.15)');
      root.style.setProperty('--shadow-glow', '0 0 80px rgba(186, 158, 255, 0.08), 20px 0 60px rgba(0, 0, 0, 0.3)');
      root.style.setProperty('--radius-sm', '8px');
      root.style.setProperty('--radius-md', '10px');
      root.style.setProperty('--radius-lg', '14px');
      root.style.setProperty('--radius-xl', '20px');
      root.style.setProperty('--radius-2xl', '24px');
      root.style.setProperty('--radius-full', '9999px');
      root.style.setProperty('--spacing-1', '4px');
      root.style.setProperty('--spacing-2', '8px');
      root.style.setProperty('--spacing-3', '12px');
      root.style.setProperty('--spacing-4', '16px');
      root.style.setProperty('--spacing-5', '20px');
      root.style.setProperty('--spacing-6', '24px');
      root.style.setProperty('--spacing-8', '32px');
      root.style.setProperty('--spacing-10', '40px');
      root.style.setProperty('--spacing-12', '48px');
      root.style.setProperty('--font-family-sans', 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif');
      root.style.setProperty('--font-family-mono', 'JetBrains Mono, "Fira Code", Consolas, Monaco, monospace');
      root.style.setProperty('--font-size-xs', '12px');
      root.style.setProperty('--font-size-sm', '14px');
      root.style.setProperty('--font-size-base', '16px');
      root.style.setProperty('--font-size-lg', '18px');
      root.style.setProperty('--font-size-xl', '20px');
      root.style.setProperty('--font-size-2xl', '24px');
      root.style.setProperty('--font-size-3xl', '30px');
      root.style.setProperty('--font-size-4xl', '36px');
      root.style.setProperty('--font-weight-normal', '400');
      root.style.setProperty('--font-weight-medium', '500');
      root.style.setProperty('--font-weight-semibold', '600');
      root.style.setProperty('--font-weight-bold', '700');
      root.style.setProperty('--line-height-tight', '1.2');
      root.style.setProperty('--line-height-normal', '1.5');
      root.style.setProperty('--line-height-relaxed', '1.75');
      root.style.setProperty('--letter-spacing-tight', '-0.025em');
      root.style.setProperty('--letter-spacing-normal', '0');
      root.style.setProperty('--letter-spacing-wide', '0.025em');
      root.style.setProperty('--transition-fast', '0.15s cubic-bezier(0.4, 0, 0.2, 1)');
      root.style.setProperty('--transition-base', '0.2s cubic-bezier(0.4, 0, 0.2, 1)');
      root.style.setProperty('--transition-slow', '0.3s cubic-bezier(0.4, 0, 0.2, 1)');
      root.style.setProperty('--transition-bounce', '0.4s cubic-bezier(0.4, 0, 0.2, 1)');
      root.style.setProperty('--easing-linear', 'linear');
      root.style.setProperty('--easing-in', 'cubic-bezier(0.4, 0, 1, 1)');
      root.style.setProperty('--easing-out', 'cubic-bezier(0, 0, 0.2, 1)');
      root.style.setProperty('--easing-in-out', 'cubic-bezier(0.4, 0, 0.2, 1)');
      root.style.setProperty('--z-dropdown', '1000');
      root.style.setProperty('--z-sticky', '1020');
      root.style.setProperty('--z-fixed', '1030');
      root.style.setProperty('--z-modal-backdrop', '1040');
      root.style.setProperty('--z-modal', '1050');
      root.style.setProperty('--z-popover', '1060');
      root.style.setProperty('--z-tooltip', '1070');
    } else {
      root.style.setProperty('--bg-base', '#ffffff');
      root.style.setProperty('--bg-surface', '#f9fafb');
      root.style.setProperty('--bg-elevated', '#ffffff');
      root.style.setProperty('--bg-page', '#f5f5f5');
      root.style.setProperty('--bg-sidebar', 'rgba(255, 255, 255, 0.95)');
      root.style.setProperty('--bg-hover', 'rgba(0, 0, 0, 0.04)');
      root.style.setProperty('--bg-input', 'rgba(0, 0, 0, 0.04)');
      root.style.setProperty('--bg-secondary', 'rgba(0, 0, 0, 0.02)');
      root.style.setProperty('--bg-tertiary', 'rgba(0, 0, 0, 0.015)');
      root.style.setProperty('--bg-glass', 'rgba(0, 0, 0, 0.02)');
      root.style.setProperty('--bg-glass-hover', 'rgba(0, 0, 0, 0.04)');
      root.style.setProperty('--bg-card', '#ffffff');
      root.style.setProperty('--bg-header', 'rgba(255, 255, 255, 0.95)');
      root.style.setProperty('--text-primary', '#18181b');
      root.style.setProperty('--text-secondary', 'rgba(24, 24, 27, 0.6)');
      root.style.setProperty('--text-tertiary', 'rgba(24, 24, 27, 0.4)');
      root.style.setProperty('--text-muted', 'rgba(24, 24, 27, 0.4)');
      root.style.setProperty('--text-placeholder', 'rgba(24, 24, 27, 0.35)');
      root.style.setProperty('--border-primary', 'rgba(0, 0, 0, 0.06)');
      root.style.setProperty('--border-secondary', 'rgba(0, 0, 0, 0.04)');
      root.style.setProperty('--border-hover', 'rgba(139, 92, 246, 0.25)');
      root.style.setProperty('--accent', accentColor);
      root.style.setProperty('--accent-light', '#a78bfa');
      root.style.setProperty('--accent-glow', '#c4b5fd');
      root.style.setProperty('--accent-shadow', `${accentColor}40`);
      root.style.setProperty('--accent-bg', 'rgba(139, 92, 246, 0.1)');
      root.style.setProperty('--accent-text', '#8b5cf6');
      root.style.setProperty('--gradient-primary', `linear-gradient(135deg, ${accentColor} 0%, #8b5cf6 100%)`);
      root.style.setProperty('--gradient-secondary', `linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)`);
      root.style.setProperty('--gradient-success', `linear-gradient(135deg, #10b981 0%, #059669 100%)`);
      root.style.setProperty('--gradient-warning', `linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)`);
      root.style.setProperty('--gradient-danger', `linear-gradient(135deg, #ef4444 0%, #dc2626 100%)`);
      root.style.setProperty('--gradient-accent', 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)');
      root.style.setProperty('--gradient-pink', 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)');
      root.style.setProperty('--gradient-teal', 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)');
      root.style.setProperty('--gradient-gray', 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)');
      root.style.setProperty('--success-shadow', 'rgba(16, 185, 129, 0.3)');
      root.style.setProperty('--warning-shadow', 'rgba(245, 158, 11, 0.3)');
      root.style.setProperty('--error-shadow', 'rgba(239, 68, 68, 0.3)');
      root.style.setProperty('--info', '#2563eb');
      root.style.setProperty('--info-bg', 'rgba(59, 130, 246, 0.08)');
      root.style.setProperty('--info-border', 'rgba(59, 130, 246, 0.15)');
      root.style.setProperty('--info-text', '#1d4ed8');
      root.style.setProperty('--info-shadow', 'rgba(59, 130, 246, 0.3)');
      root.style.setProperty('--accent-border', 'rgba(139, 92, 246, 0.3)');
      root.style.setProperty('--input-border', 'rgba(0, 0, 0, 0.1)');
      root.style.setProperty('--input-focus-border', 'rgba(139, 92, 246, 0.5)');
      root.style.setProperty('--input-focus-shadow', '0 0 0 3px rgba(139, 92, 246, 0.1)');
      root.style.setProperty('--overlay-heavy', 'rgba(0, 0, 0, 0.5)');
      root.style.setProperty('--btn-danger-bg', 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)');
      root.style.setProperty('--btn-danger-shadow', 'rgba(239, 68, 68, 0.3)');
      root.style.setProperty('--nav-active-bg', 'rgba(139, 92, 246, 0.1)');
      root.style.setProperty('--nav-hover-bg', 'rgba(0, 0, 0, 0.04)');
      root.style.setProperty('--glass-blur', 'blur(40px)');
      root.style.setProperty('--glass-blur-sm', 'blur(20px)');
      root.style.setProperty('--scrollbar-track', 'rgba(0, 0, 0, 0.05)');
      root.style.setProperty('--scrollbar-thumb', 'rgba(0, 0, 0, 0.15)');
      root.style.setProperty('--scrollbar-thumb-hover', 'rgba(0, 0, 0, 0.25)');
      root.style.setProperty('--shadow-sm', '0 2px 8px rgba(0, 0, 0, 0.08)');
      root.style.setProperty('--shadow-md', '0 4px 16px rgba(0, 0, 0, 0.08)');
      root.style.setProperty('--shadow-lg', '0 8px 24px rgba(0, 0, 0, 0.12)');
      root.style.setProperty('--shadow-xl', '0 20px 40px rgba(0, 0, 0, 0.15)');
      root.style.setProperty('--shadow-accent', `0 8px 24px ${accentColor}40`);
      root.style.setProperty('--shadow-card', '0 4px 20px rgba(0, 0, 0, 0.06)');
      root.style.setProperty('--shadow-card-hover', '0 8px 32px rgba(0, 0, 0, 0.1), 0 0 30px rgba(139, 92, 246, 0.08)');
      root.style.setProperty('--shadow-glow', '0 0 80px rgba(139, 92, 246, 0.03), 20px 0 60px rgba(0, 0, 0, 0.15)');
      root.style.setProperty('--radius-sm', '8px');
      root.style.setProperty('--radius-md', '10px');
      root.style.setProperty('--radius-lg', '14px');
      root.style.setProperty('--radius-xl', '20px');
      root.style.setProperty('--radius-2xl', '24px');
      root.style.setProperty('--radius-full', '9999px');
      root.style.setProperty('--spacing-1', '4px');
      root.style.setProperty('--spacing-2', '8px');
      root.style.setProperty('--spacing-3', '12px');
      root.style.setProperty('--spacing-4', '16px');
      root.style.setProperty('--spacing-5', '20px');
      root.style.setProperty('--spacing-6', '24px');
      root.style.setProperty('--spacing-8', '32px');
      root.style.setProperty('--spacing-10', '40px');
      root.style.setProperty('--spacing-12', '48px');
      root.style.setProperty('--font-family-sans', 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif');
      root.style.setProperty('--font-family-mono', 'JetBrains Mono, "Fira Code", Consolas, Monaco, monospace');
      root.style.setProperty('--font-size-xs', '12px');
      root.style.setProperty('--font-size-sm', '14px');
      root.style.setProperty('--font-size-base', '16px');
      root.style.setProperty('--font-size-lg', '18px');
      root.style.setProperty('--font-size-xl', '20px');
      root.style.setProperty('--font-size-2xl', '24px');
      root.style.setProperty('--font-size-3xl', '30px');
      root.style.setProperty('--font-size-4xl', '36px');
      root.style.setProperty('--font-weight-normal', '400');
      root.style.setProperty('--font-weight-medium', '500');
      root.style.setProperty('--font-weight-semibold', '600');
      root.style.setProperty('--font-weight-bold', '700');
      root.style.setProperty('--line-height-tight', '1.2');
      root.style.setProperty('--line-height-normal', '1.5');
      root.style.setProperty('--line-height-relaxed', '1.75');
      root.style.setProperty('--letter-spacing-tight', '-0.025em');
      root.style.setProperty('--letter-spacing-normal', '0');
      root.style.setProperty('--letter-spacing-wide', '0.025em');
      root.style.setProperty('--transition-fast', '0.15s cubic-bezier(0.4, 0, 0.2, 1)');
      root.style.setProperty('--transition-base', '0.2s cubic-bezier(0.4, 0, 0.2, 1)');
      root.style.setProperty('--transition-slow', '0.3s cubic-bezier(0.4, 0, 0.2, 1)');
      root.style.setProperty('--transition-bounce', '0.4s cubic-bezier(0.4, 0, 0.2, 1)');
      root.style.setProperty('--easing-linear', 'linear');
      root.style.setProperty('--easing-in', 'cubic-bezier(0.4, 0, 1, 1)');
      root.style.setProperty('--easing-out', 'cubic-bezier(0, 0, 0.2, 1)');
      root.style.setProperty('--easing-in-out', 'cubic-bezier(0.4, 0, 0.2, 1)');
      root.style.setProperty('--z-dropdown', '1000');
      root.style.setProperty('--z-sticky', '1020');
      root.style.setProperty('--z-fixed', '1030');
      root.style.setProperty('--z-modal-backdrop', '1040');
      root.style.setProperty('--z-modal', '1050');
      root.style.setProperty('--z-popover', '1060');
      root.style.setProperty('--z-tooltip', '1070');
    }

    root.setAttribute('data-theme', effectiveTheme);
    body.setAttribute('data-theme', effectiveTheme);
    root.classList.remove('light', 'dark');
    root.classList.add(effectiveTheme);
  };

  useEffect(() => {
    let effectiveTheme: 'light' | 'dark';
    
    if (theme === 'system') {
      effectiveTheme = getSystemTheme();
    } else {
      effectiveTheme = theme;
    }
    
    applyTheme(effectiveTheme);
    setResolvedTheme(effectiveTheme);
    localStorage.setItem('kaiyan-tool-theme', theme);
  }, [theme]);

  useEffect(() => {
    applyTheme(resolvedTheme);
    localStorage.setItem('kaiyan-accent-color', accentColor);
  }, [accentColor, resolvedTheme]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--base-font-size', fontSize);
    localStorage.setItem('kaiyan-font-size', fontSize);
  }, [fontSize]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'system') {
        const newTheme = getSystemTheme();
        applyTheme(newTheme);
        setResolvedTheme(newTheme);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState(prev => {
      if (prev === 'dark') return 'light';
      if (prev === 'light') return 'dark';
      return 'dark';
    });
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };
  
  const setAccentColor = (color: string) => {
    setAccentColorState(color);
  };
  
  const setFontSize = (size: string) => {
    setFontSizeState(size);
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      resolvedTheme,
      toggleTheme, 
      setTheme, 
      accentColor, 
      setAccentColor, 
      fontSize, 
      setFontSize 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
