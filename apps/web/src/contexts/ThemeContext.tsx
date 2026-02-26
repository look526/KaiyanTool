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
    return localStorage.getItem('kaiyan-accent-color') || '#007AFF';
  });
  
  const [fontSize, setFontSizeState] = useState<string>(() => {
    return localStorage.getItem('kaiyan-font-size') || '16px';
  });

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    
    let effectiveTheme: 'light' | 'dark';
    
    if (theme === 'system') {
      effectiveTheme = getSystemTheme();
    } else {
      effectiveTheme = theme;
    }
    
    root.setAttribute('data-theme', effectiveTheme);
    body.setAttribute('data-theme', effectiveTheme);
    root.classList.remove('light', 'dark');
    root.classList.add(effectiveTheme);
    
    localStorage.setItem('kaiyan-tool-theme', theme);
    setResolvedTheme(effectiveTheme);
  }, [theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'system') {
        const newTheme = getSystemTheme();
        document.documentElement.setAttribute('data-theme', newTheme);
        document.body.setAttribute('data-theme', newTheme);
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(newTheme);
        setResolvedTheme(newTheme);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty('--accent-color', accentColor);
    localStorage.setItem('kaiyan-accent-color', accentColor);
  }, [accentColor]);

  useEffect(() => {
    document.documentElement.style.setProperty('--base-font-size', fontSize);
    localStorage.setItem('kaiyan-font-size', fontSize);
  }, [fontSize]);

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
