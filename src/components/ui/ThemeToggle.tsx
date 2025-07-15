'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  if (!mounted) {
    return <div className="w-10 h-10 rounded-lg animate-pulse bg-gray-200 dark:bg-gray-700" />;
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative w-10 h-10 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none theme-transition group overflow-hidden hover:cursor-pointer"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {/* Background gradient that shifts based on theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-indigo-900 dark:to-purple-900 opacity-0 group-hover:opacity-100 theme-transition" />

      {/* Icon container */}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        <span className="text-xs">{theme === 'light' ? '☀️' : '🌙'}</span>
      </div>

      {/* Ripple effect on click */}
      <div className="absolute inset-0 bg-indigo-500 rounded-lg opacity-0 group-active:opacity-20 transition-opacity duration-150" />
    </button>
  );
}
