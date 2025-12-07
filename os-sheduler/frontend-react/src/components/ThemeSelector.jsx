/**
 * ThemeSelector Component
 * Dropdown for selecting application theme
 */

import React from 'react';
import { useTheme } from '../hooks/useTheme';

export default function ThemeSelector() {
  const { currentTheme, setTheme, availableThemes } = useTheme();

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Theme
      </label>
      <select
        value={currentTheme}
        onChange={(e) => setTheme(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-colors"
        aria-label="Select theme"
      >
        {availableThemes.map((theme) => (
          <option key={theme.id} value={theme.id}>
            {theme.name}
          </option>
        ))}
      </select>
      
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Current: {availableThemes.find(t => t.id === currentTheme)?.name}
      </div>
    </div>
  );
}
