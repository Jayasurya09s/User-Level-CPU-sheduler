/**
 * Custom hook for theme management
 * Handles theme selection and persistence
 */

import { useState, useEffect, useCallback } from 'react';
import { themes, applyTheme } from '../utils/themes';

const THEME_STORAGE_KEY = 'cpu-scheduler-theme';

/**
 * Hook for managing application theme
 */
export function useTheme() {
  const [currentTheme, setCurrentTheme] = useState(() => {
    // Load theme from localStorage or default to 'aurora'
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return saved && themes[saved] ? saved : 'aurora';
  });

  // Apply theme on mount and when changed
  useEffect(() => {
    applyTheme(currentTheme);
    localStorage.setItem(THEME_STORAGE_KEY, currentTheme);
  }, [currentTheme]);

  // Change theme
  const setTheme = useCallback((themeId) => {
    if (themes[themeId]) {
      setCurrentTheme(themeId);
    }
  }, []);

  // Get theme object
  const theme = themes[currentTheme];

  // Get all available themes
  const availableThemes = Object.values(themes);

  return {
    currentTheme,
    theme,
    setTheme,
    availableThemes
  };
}

export default useTheme;
