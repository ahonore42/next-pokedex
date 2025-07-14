'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
}

export function ThemeProvider({ children, defaultTheme = 'light' }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    const applyTheme = (currentTheme: Theme) => {
      root.classList.remove('light', 'dark');
      root.classList.add(currentTheme);

      // Remove inline style transition since we're using Tailwind classes for transitions
      root.style.removeProperty('transition');

      let metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (!metaThemeColor) {
        metaThemeColor = document.createElement('meta');
        metaThemeColor.setAttribute('name', 'theme-color');
        document.head.appendChild(metaThemeColor);
      }
      metaThemeColor.setAttribute('content', currentTheme === 'dark' ? '#0f172a' : '#ffffff');
    };

    try {
      const savedTheme = localStorage.getItem('theme') as Theme | null;
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
        setThemeState(savedTheme);
        applyTheme(savedTheme);
      } else {
        setThemeState(defaultTheme);
        applyTheme(defaultTheme);
      }
    } catch (error) {
      console.warn('Theme: localStorage not available, using default theme', error);
      setThemeState(defaultTheme);
      applyTheme(defaultTheme);
    } finally {
      setIsLoading(false);
    }
  }, [defaultTheme]);

  const setTheme = (newTheme: Theme) => {
    try {
      setThemeState(newTheme);
      localStorage.setItem('theme', newTheme);
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(newTheme);

      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', newTheme === 'dark' ? '#0f172a' : '#ffffff');
      }
    } catch (error) {
      console.warn('Theme: Failed to save theme preference', error);
      setThemeState(newTheme);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const value: ThemeContextType = {
    theme,
    setTheme,
    toggleTheme,
    isLoading,
  };

  return (
    <div className="min-h-screen bg-background text-primary transition-all duration-300">
      <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
    </div>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}
