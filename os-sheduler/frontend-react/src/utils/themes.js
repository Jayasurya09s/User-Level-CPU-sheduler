/**
 * Theme configurations for the CPU Scheduler application
 * Provides 5 distinct color themes with full support for all UI elements
 */

export const themes = {
  aurora: {
    name: 'Aurora',
    id: 'aurora',
    colors: {
      primary: '#10b981',      // emerald-500
      primaryDark: '#059669',  // emerald-600
      primaryLight: '#34d399', // emerald-400
      secondary: '#3b82f6',    // blue-500
      secondaryDark: '#2563eb',// blue-600
      secondaryLight: '#60a5fa',// blue-400
      background: '#ffffff',
      surface: '#f9fafb',      // gray-50
      surfaceHover: '#f3f4f6', // gray-100
      text: '#111827',         // gray-900
      textSecondary: '#6b7280',// gray-500
      border: '#e5e7eb',       // gray-200
      error: '#ef4444',        // red-500
      warning: '#f59e0b',      // amber-500
      success: '#10b981',      // emerald-500
      idle: '#9ca3af',         // gray-400
      gradient: 'from-emerald-500 to-blue-500',
    }
  },
  midnight: {
    name: 'Midnight',
    id: 'midnight',
    colors: {
      primary: '#8b5cf6',      // violet-500
      primaryDark: '#7c3aed',  // violet-600
      primaryLight: '#a78bfa', // violet-400
      secondary: '#6366f1',    // indigo-500
      secondaryDark: '#4f46e5',// indigo-600
      secondaryLight: '#818cf8',// indigo-400
      background: '#0f172a',   // slate-900
      surface: '#1e293b',      // slate-800
      surfaceHover: '#334155', // slate-700
      text: '#f1f5f9',         // slate-100
      textSecondary: '#94a3b8',// slate-400
      border: '#334155',       // slate-700
      error: '#f87171',        // red-400
      warning: '#fbbf24',      // amber-400
      success: '#34d399',      // emerald-400
      idle: '#64748b',         // slate-500
      gradient: 'from-violet-600 to-indigo-600',
    }
  },
  solarized: {
    name: 'Solarized',
    id: 'solarized',
    colors: {
      primary: '#268bd2',      // solarized blue
      primaryDark: '#2075c7',
      primaryLight: '#4CA3E8',
      secondary: '#2aa198',    // solarized cyan
      secondaryDark: '#258f88',
      secondaryLight: '#45b7ae',
      background: '#fdf6e3',   // solarized base3
      surface: '#eee8d5',      // solarized base2
      surfaceHover: '#e8e2cf',
      text: '#657b83',         // solarized base00
      textSecondary: '#93a1a1',// solarized base1
      border: '#d9d2c1',
      error: '#dc322f',        // solarized red
      warning: '#b58900',      // solarized yellow
      success: '#859900',      // solarized green
      idle: '#93a1a1',
      gradient: 'from-blue-500 to-cyan-500',
    }
  },
  monokai: {
    name: 'Monokai',
    id: 'monokai',
    colors: {
      primary: '#66d9ef',      // monokai cyan
      primaryDark: '#4dc4dd',
      primaryLight: '#7ee0f3',
      secondary: '#a6e22e',    // monokai green
      secondaryDark: '#90c926',
      secondaryLight: '#b8e856',
      background: '#272822',   // monokai background
      surface: '#3e3d32',      // monokai lighter
      surfaceHover: '#49483e',
      text: '#f8f8f2',         // monokai foreground
      textSecondary: '#75715e',// monokai comment
      border: '#49483e',
      error: '#f92672',        // monokai pink
      warning: '#e6db74',      // monokai yellow
      success: '#a6e22e',      // monokai green
      idle: '#75715e',
      gradient: 'from-cyan-400 to-green-400',
    }
  },
  colorblind: {
    name: 'Colorblind Safe',
    id: 'colorblind',
    colors: {
      primary: '#0173b2',      // safe blue
      primaryDark: '#015a8f',
      primaryLight: '#029dd8',
      secondary: '#de8f05',    // safe orange
      secondaryDark: '#b57304',
      secondaryLight: '#ffac33',
      background: '#ffffff',
      surface: '#f5f5f5',
      surfaceHover: '#eeeeee',
      text: '#000000',
      textSecondary: '#666666',
      border: '#cccccc',
      error: '#d55e00',        // safe vermillion
      warning: '#de8f05',      // safe orange
      success: '#029e73',      // safe bluish green
      idle: '#999999',
      gradient: 'from-blue-600 to-orange-500',
    }
  }
};

/**
 * Get process colors for Gantt chart visualization
 * Returns consistent colors for process IDs
 */
export function getProcessColor(pid, themeId = 'aurora') {
  const colorPalettes = {
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

  const palette = colorPalettes[themeId] || colorPalettes.aurora;
  return palette[pid % palette.length];
}

/**
 * Apply theme to document root
 */
export function applyTheme(themeId) {
  const theme = themes[themeId] || themes.aurora;
  const root = document.documentElement;
  
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });
  
  // Apply dark mode class for midnight and monokai
  if (themeId === 'midnight' || themeId === 'monokai') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export default themes;
