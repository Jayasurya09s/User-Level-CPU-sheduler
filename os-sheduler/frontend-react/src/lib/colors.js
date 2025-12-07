/**
 * Process color utilities
 * Provides consistent colors for process IDs across themes
 */

// Default color palette
const defaultPalette = [
  "#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444",
  "#14b8a6", "#6366f1", "#ec4899", "#84cc16", "#f97316",
  "#06b6d4", "#8b5cf6", "#f43f5e", "#22c55e", "#f59e0b"
];

// Theme-specific palettes
const themePalettes = {
  aurora: [
    '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444',
    '#14b8a6', '#6366f1', '#ec4899', '#84cc16', '#f97316'
  ],
  midnight: [
    '#8b5cf6', '#6366f1', '#ec4899', '#f59e0b', '#10b981',
    '#a78bfa', '#818cf8', '#f472b6', '#fbbf24', '#34d399'
  ],
  solarized: [
    '#268bd2', '#2aa198', '#859900', '#b58900', '#cb4b16',
    '#dc322f', '#d33682', '#6c71c4', '#268bd2', '#2aa198'
  ],
  monokai: [
    '#66d9ef', '#a6e22e', '#f92672', '#e6db74', '#fd971f',
    '#ae81ff', '#66d9ef', '#a6e22e', '#f92672', '#e6db74'
  ],
  colorblind: [
    '#0173b2', '#de8f05', '#029e73', '#d55e00', '#cc78bc',
    '#ca9161', '#fbafe4', '#949494', '#ece133', '#56b4e9'
  ]
};

/**
 * Get color for a process ID
 * @param {number} pid - Process ID
 * @param {string} themeId - Theme ID (optional)
 * @returns {string} Hex color code
 */
export function getProcessColor(pid, themeId = 'aurora') {
  const palette = themePalettes[themeId] || defaultPalette;
  return palette[pid % palette.length];
}

/**
 * Legacy function for backwards compatibility
 */
export function colorForPID(pid) {
  return getProcessColor(pid);
}
