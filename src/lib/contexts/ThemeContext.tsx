"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

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

export function ThemeProvider({
  children,
  defaultTheme = "light",
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      // Check for saved theme preference
      const savedTheme = localStorage.getItem("theme") as Theme | null;

      if (savedTheme && (savedTheme === "light" || savedTheme === "dark")) {
        setThemeState(savedTheme);
      } else {
        // No saved preference, use default (light)
        setThemeState(defaultTheme);
      }
    } catch (error) {
      // localStorage not available, use default
      console.warn("Theme: localStorage not available, using default theme");
      setThemeState(defaultTheme);
    } finally {
      setIsLoading(false);
    }
  }, [defaultTheme]);

  const setTheme = (newTheme: Theme) => {
    try {
      setThemeState(newTheme);
      localStorage.setItem("theme", newTheme);

      // Apply theme class to document
      const root = document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(newTheme);

      // Update meta theme-color for mobile browsers
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute(
          "content",
          newTheme === "dark" ? "#0f172a" : "#ffffff"
        );
      }
    } catch (error) {
      console.warn("Theme: Failed to save theme preference", error);
      setThemeState(newTheme);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  // Apply theme class on mount and theme change
  useEffect(() => {
    if (!isLoading) {
      const root = document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(theme);

      // Add transition class for smooth theme switching
      root.style.transition = "background-color 0.3s ease, color 0.3s ease";

      // Update meta theme-color
      let metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (!metaThemeColor) {
        metaThemeColor = document.createElement("meta");
        metaThemeColor.setAttribute("name", "theme-color");
        document.head.appendChild(metaThemeColor);
      }
      metaThemeColor.setAttribute(
        "content",
        theme === "dark" ? "#0f172a" : "#ffffff"
      );
    }
  }, [theme, isLoading]);

  const value: ThemeContextType = {
    theme,
    setTheme,
    toggleTheme,
    isLoading,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}
