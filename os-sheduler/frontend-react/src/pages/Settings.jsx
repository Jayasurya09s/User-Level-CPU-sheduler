/**
 * Settings Page
 * Application settings including theme selection
 */

import React from 'react';
import ThemeSelector from '../components/ThemeSelector';

export default function Settings() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Settings
        </h1>

        <div className="space-y-6">
          {/* Theme Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Appearance
            </h2>
            <ThemeSelector />
          </div>

          {/* API Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Connection
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                API URL
              </label>
              <input
                type="text"
                readOnly
                value={process.env.REACT_APP_API_URL || 'http://localhost:3001'}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              />
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Set via REACT_APP_API_URL environment variable
              </p>
            </div>
          </div>

          {/* About */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              About
            </h2>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div>
                <span className="font-medium">Version:</span> 1.0.0
              </div>
              <div>
                <span className="font-medium">Build:</span> Production
              </div>
              <div className="mt-4">
                <p>
                  CPU Scheduler Simulator is a comprehensive tool for visualizing
                  and analyzing various CPU scheduling algorithms.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
