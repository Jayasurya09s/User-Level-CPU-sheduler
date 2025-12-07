/**
 * NavBar Component
 * Sticky navigation bar with links to all pages
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function NavBar() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const navLinks = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/workload', label: 'New Run', icon: '▶️' },
    { path: '/runs', label: 'History', icon: '📋' },
    { path: '/compare', label: 'Compare', icon: '📊' },
    { path: '/docs', label: 'Docs', icon: '📖' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <span className="text-2xl transition-transform group-hover:scale-110">⚙️</span>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                CPU Scheduler
              </span>
            </Link>
          </div>

          <div className="flex space-x-2">
            {navLinks.map(({ path, label, icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive(path)
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 shadow-sm'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span className="text-lg">{icon}</span>
                <span className="hidden md:inline">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

