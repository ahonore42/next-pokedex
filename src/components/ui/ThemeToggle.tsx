'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { useBreakpointWidth } from '~/hooks';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const breakpointWidth = useBreakpointWidth();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  if (!mounted) {
    return <div className="w-10 h-10 rounded-lg animate-pulse bg-gray-200 dark:bg-gray-700" />;
  }

  const themeDisplay = theme === 'light' ? '☀️' : '🌙';
  return breakpointWidth >= 768 ? (
    <button
      onClick={toggleTheme}
      className="relative w-10 h-10 rounded-lg border border-border dark:border-gray-600 
      bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none 
      transition-theme group overflow-hidden cursor-pointer"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {/* Background gradient that shifts based on theme */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-indigo-900 dark:to-purple-900 
        opacity-0 group-hover:opacity-100 transition-theme"
      />

      {/* Icon container */}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        <span className="text-xs">{themeDisplay}</span>
      </div>

      {/* Ripple effect on click */}
      <div className="absolute inset-0 bg-indigo-500 rounded-lg opacity-0 group-active:opacity-20 transition-opacity duration-150" />
    </button>
  ) : (
    <div
      className={`flex justify-between items center text-sm cursor-pointer font-medium
      hover:bg-brand/10 dark:hover:bg-brand/40 active:bg-brand/20 dark:active:bg-brand/50 
       px-4 py-3 md:px-6 md:py-4
      `}
      onClick={toggleTheme}
    >
      <span>Theme</span>
      <span>{themeDisplay}</span>
    </div>
  );
}
