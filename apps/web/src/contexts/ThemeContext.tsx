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

// --- Color derivation utilities (no hardcoded accent colors) ---

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return { r: 139, g: 92, b: 246 };
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}

function rgba(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function lighten(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  const cl = (v: number) => Math.min(255, v + amount).toString(16).padStart(2, '0');
  return `#${cl(r)}${cl(g)}${cl(b)}`;
}

function darken(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  const cl = (v: number) => Math.max(0, v - amount).toString(16).padStart(2, '0');
  return `#${cl(r)}${cl(g)}${cl(b)}`;
}

// Accent-derived token sets — everything computed from one user-chosen color

function setAccentTokens(root: HTMLElement, accent: string) {
  const light = lighten(accent, 50);
  const dark = darken(accent, 40);

  root.style.setProperty('--accent', accent);
  root.style.setProperty('--accent-light', light);
  root.style.setProperty('--accent-dark', dark);
  root.style.setProperty('--accent-glow', light);
  root.style.setProperty('--accent-shadow', rgba(accent, 0.25));
  root.style.setProperty('--accent-bg', rgba(accent, 0.1));
  root.style.setProperty('--accent-text', accent);
  root.style.setProperty('--accent-border', rgba(accent, 0.3));

  root.style.setProperty('--gradient-primary', `linear-gradient(135deg, ${accent} 0%, ${light} 100%)`);
  root.style.setProperty('--gradient-accent', `linear-gradient(135deg, ${accent} 0%, ${dark} 100%)`);

  root.style.setProperty('--border-hover', rgba(accent, 0.25));
  root.style.setProperty('--input-focus-border', rgba(accent, 0.5));
  root.style.setProperty('--input-focus-shadow', `0 0 0 3px ${rgba(accent, 0.1)}`);

  root.style.setProperty('--shadow-accent', `0 8px 24px ${rgba(accent, 0.25)}`);
  root.style.setProperty('--shadow-glow', `0 0 80px ${rgba(accent, 0.06)}, 20px 0 60px rgba(0, 0, 0, 0.3)`);
  root.style.setProperty('--nav-active-bg', rgba(accent, 0.15));
}

// --- Theme constants (non-accent) ---

const STATIC_TOKENS: Record<string, string> = {
  '--secondary': '#34b5fa',
  '--tertiary': '#ec63ff',
  '--gradient-secondary': 'linear-gradient(135deg, #34b5fa 0%, #06b6d4 100%)',
  '--gradient-success': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  '--gradient-warning': 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
  '--gradient-danger': 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  '--gradient-pink': 'linear-gradient(135deg, #ec63ff 0%, #f43f5e 100%)',
  '--gradient-teal': 'linear-gradient(135deg, #14b8a6 0%, #34b5fa 100%)',
  '--gradient-gray': 'linear-gradient(135deg, #a5aac2 0%, #6b7280 100%)',
  '--success-shadow': 'rgba(16, 185, 129, 0.3)',
  '--warning-shadow': 'rgba(245, 158, 11, 0.3)',
  '--error-shadow': 'rgba(239, 68, 68, 0.3)',
  '--btn-danger-bg': 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  '--btn-danger-shadow': 'rgba(239, 68, 68, 0.3)',
  '--glass-blur': 'blur(40px)',
  '--glass-blur-sm': 'blur(20px)',
};

const LAYOUT_TOKENS: Record<string, string> = {
  '--radius-sm': '8px', '--radius-md': '10px', '--radius-lg': '14px',
  '--radius-xl': '20px', '--radius-2xl': '24px', '--radius-full': '9999px',
  '--spacing-1': '4px', '--spacing-2': '8px', '--spacing-3': '12px',
  '--spacing-4': '16px', '--spacing-5': '20px', '--spacing-6': '24px',
  '--spacing-8': '32px', '--spacing-10': '40px', '--spacing-12': '48px',
  '--font-size-xs': '12px', '--font-size-sm': '14px', '--font-size-base': '16px',
  '--font-size-lg': '18px', '--font-size-xl': '20px', '--font-size-2xl': '24px',
  '--font-size-3xl': '30px', '--font-size-4xl': '36px',
  '--font-weight-normal': '400', '--font-weight-medium': '500',
  '--font-weight-semibold': '600', '--font-weight-bold': '700',
  '--line-height-tight': '1.2', '--line-height-normal': '1.5', '--line-height-relaxed': '1.75',
  '--letter-spacing-tight': '-0.025em', '--letter-spacing-normal': '0', '--letter-spacing-wide': '0.025em',
  '--transition-fast': '0.15s cubic-bezier(0.4, 0, 0.2, 1)',
  '--transition-base': '0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  '--transition-slow': '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '--transition-bounce': '0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  '--z-dropdown': '1000', '--z-sticky': '1020', '--z-fixed': '1030',
  '--z-modal-backdrop': '1040', '--z-modal': '1050', '--z-popover': '1060', '--z-tooltip': '1070',
};

function setStaticTokens(root: HTMLElement) {
  for (const [k, v] of Object.entries(STATIC_TOKENS)) root.style.setProperty(k, v);
  for (const [k, v] of Object.entries(LAYOUT_TOKENS)) root.style.setProperty(k, v);
}

// Dark mode specific tokens (refined glass morphism)
function setDarkTokens(root: HTMLElement, accent: string) {
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
  root.style.setProperty('--bg-glass-hover', 'rgba(28, 37, 62, 0.55)');
  root.style.setProperty('--bg-card', '#0c1326');
  root.style.setProperty('--bg-header', 'rgba(7, 13, 31, 0.7)');
  root.style.setProperty('--text-primary', '#dfe4fe');
  root.style.setProperty('--text-secondary', 'rgba(223, 228, 254, 0.6)');
  root.style.setProperty('--text-tertiary', 'rgba(165, 170, 194, 0.7)');
  root.style.setProperty('--text-muted', '#a5aac2');
  root.style.setProperty('--text-placeholder', 'rgba(165, 170, 194, 0.5)');
  root.style.setProperty('--border-primary', 'rgba(255, 255, 255, 0.08)');
  root.style.setProperty('--border-secondary', 'rgba(255, 255, 255, 0.05)');
  root.style.setProperty('--input-border', 'rgba(255, 255, 255, 0.1)');
  root.style.setProperty('--overlay-heavy', 'rgba(0, 0, 0, 0.7)');
  root.style.setProperty('--nav-hover-bg', 'rgba(255, 255, 255, 0.06)');
  root.style.setProperty('--scrollbar-track', 'rgba(255, 255, 255, 0.05)');
  root.style.setProperty('--scrollbar-thumb', 'rgba(255, 255, 255, 0.15)');
  root.style.setProperty('--scrollbar-thumb-hover', 'rgba(255, 255, 255, 0.25)');
  root.style.setProperty('--info', '#34b5fa');
  root.style.setProperty('--info-bg', rgba('#34b5fa', 0.1));
  root.style.setProperty('--info-border', rgba('#34b5fa', 0.2));
  root.style.setProperty('--info-text', '#34b5fa');
  root.style.setProperty('--info-shadow', rgba('#34b5fa', 0.3));
  root.style.setProperty('--font-family-sans', "'Manrope', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif");
  root.style.setProperty('--font-family-mono', "'JetBrains Mono', 'Fira Code', Consolas, Monaco, monospace");
  root.style.setProperty('--shadow-sm', '0 2px 8px rgba(0, 0, 0, 0.15)');
  root.style.setProperty('--shadow-md', '0 4px 16px rgba(0, 0, 0, 0.15)');
  root.style.setProperty('--shadow-lg', '0 8px 24px rgba(0, 0, 0, 0.2)');
  root.style.setProperty('--shadow-xl', '0 20px 40px rgba(0, 0, 0, 0.25)');
  root.style.setProperty('--shadow-card', `0 4px 20px rgba(0, 0, 0, 0.12), 0 0 1px ${rgba(accent, 0.05)}`);
  root.style.setProperty('--shadow-card-hover', `0 8px 32px rgba(0, 0, 0, 0.15), 0 0 40px ${rgba(accent, 0.1)}`);
}

// Light mode specific tokens
function setLightTokens(root: HTMLElement, accent: string) {
  root.style.setProperty('--bg-base', '#ffffff');
  root.style.setProperty('--bg-surface', '#f9fafb');
  root.style.setProperty('--bg-elevated', '#ffffff');
  root.style.setProperty('--bg-page', '#f5f5f5');
  root.style.setProperty('--bg-sidebar', 'rgba(255, 255, 255, 0.95)');
  root.style.setProperty('--bg-hover', 'rgba(0, 0, 0, 0.04)');
  root.style.setProperty('--bg-input', 'rgba(0, 0, 0, 0.04)');
  root.style.setProperty('--bg-secondary', 'rgba(0, 0, 0, 0.02)');
  root.style.setProperty('--bg-tertiary', 'rgba(0, 0, 0, 0.015)');
  root.style.setProperty('--bg-glass', 'rgba(255, 255, 255, 0.6)');
  root.style.setProperty('--bg-glass-hover', 'rgba(255, 255, 255, 0.75)');
  root.style.setProperty('--bg-card', '#ffffff');
  root.style.setProperty('--bg-header', 'rgba(255, 255, 255, 0.8)');
  root.style.setProperty('--text-primary', '#18181b');
  root.style.setProperty('--text-secondary', 'rgba(24, 24, 27, 0.6)');
  root.style.setProperty('--text-tertiary', 'rgba(24, 24, 27, 0.4)');
  root.style.setProperty('--text-muted', 'rgba(24, 24, 27, 0.5)');
  root.style.setProperty('--text-placeholder', 'rgba(24, 24, 27, 0.35)');
  root.style.setProperty('--border-primary', 'rgba(0, 0, 0, 0.06)');
  root.style.setProperty('--border-secondary', 'rgba(0, 0, 0, 0.04)');
  root.style.setProperty('--input-border', 'rgba(0, 0, 0, 0.1)');
  root.style.setProperty('--overlay-heavy', 'rgba(0, 0, 0, 0.5)');
  root.style.setProperty('--nav-hover-bg', 'rgba(0, 0, 0, 0.04)');
  root.style.setProperty('--scrollbar-track', 'rgba(0, 0, 0, 0.05)');
  root.style.setProperty('--scrollbar-thumb', 'rgba(0, 0, 0, 0.15)');
  root.style.setProperty('--scrollbar-thumb-hover', 'rgba(0, 0, 0, 0.25)');
  root.style.setProperty('--info', '#2563eb');
  root.style.setProperty('--info-bg', 'rgba(37, 99, 235, 0.08)');
  root.style.setProperty('--info-border', 'rgba(37, 99, 235, 0.15)');
  root.style.setProperty('--info-text', '#2563eb');
  root.style.setProperty('--info-shadow', 'rgba(37, 99, 235, 0.3)');
  root.style.setProperty('--font-family-sans', "'Manrope', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif");
  root.style.setProperty('--font-family-mono', "'JetBrains Mono', 'Fira Code', Consolas, Monaco, monospace");
  root.style.setProperty('--shadow-sm', '0 2px 8px rgba(0, 0, 0, 0.06)');
  root.style.setProperty('--shadow-md', '0 4px 16px rgba(0, 0, 0, 0.06)');
  root.style.setProperty('--shadow-lg', '0 8px 24px rgba(0, 0, 0, 0.08)');
  root.style.setProperty('--shadow-xl', '0 20px 40px rgba(0, 0, 0, 0.1)');
  root.style.setProperty('--shadow-card', `0 4px 20px rgba(0, 0, 0, 0.04), 0 0 1px ${rgba(accent, 0.03)}`);
  root.style.setProperty('--shadow-card-hover', `0 8px 32px rgba(0, 0, 0, 0.08), 0 0 30px ${rgba(accent, 0.06)}`);
}

// --- Provider ---

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('kaiyan-tool-theme');
    return (saved as Theme) || 'dark';
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('kaiyan-tool-theme');
    if (saved === 'system' || !saved) return getSystemTheme();
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

    // Static tokens (same for both themes)
    setStaticTokens(root);

    // Theme-specific base tokens
    if (effectiveTheme === 'dark') {
      setDarkTokens(root, accentColor);
    } else {
      setLightTokens(root, accentColor);
    }

    // Accent-derived tokens (always from user choice)
    setAccentTokens(root, accentColor);

    root.setAttribute('data-theme', effectiveTheme);
    body.setAttribute('data-theme', effectiveTheme);
    root.classList.remove('light', 'dark');
    root.classList.add(effectiveTheme);
  };

  useEffect(() => {
    const effectiveTheme = theme === 'system' ? getSystemTheme() : theme;
    applyTheme(effectiveTheme);
    setResolvedTheme(effectiveTheme);
    localStorage.setItem('kaiyan-tool-theme', theme);
  }, [theme]);

  useEffect(() => {
    applyTheme(resolvedTheme);
    localStorage.setItem('kaiyan-accent-color', accentColor);
  }, [accentColor, resolvedTheme]);

  useEffect(() => {
    document.documentElement.style.setProperty('--base-font-size', fontSize);
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
    setThemeState(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{
      theme, resolvedTheme, toggleTheme,
      setTheme: (t: Theme) => setThemeState(t),
      accentColor, setAccentColor: (c: string) => setAccentColorState(c),
      fontSize, setFontSize: (s: string) => setFontSizeState(s),
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
