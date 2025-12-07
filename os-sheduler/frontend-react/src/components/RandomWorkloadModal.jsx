/**
 * RandomWorkloadModal Component
 * Modal for generating random workload data
 */

import React, { useState } from 'react';

export default function RandomWorkloadModal({ isOpen, onClose, onGenerate }) {
  const [numProcesses, setNumProcesses] = useState(5);
  const [maxArrival, setMaxArrival] = useState(10);
  const [maxBurst, setMaxBurst] = useState(20);
  const [maxPriority, setMaxPriority] = useState(10);

  const handleGenerate = () => {
    const processes = [];
    for (let i = 0; i < numProcesses; i++) {
      processes.push({
        pid: i,
        arrival_time: Math.floor(Math.random() * (maxArrival + 1)),
        burst_time: Math.floor(Math.random() * maxBurst) + 1, // At least 1
        priority: Math.floor(Math.random() * (maxPriority + 1))
      });
    }
    onGenerate(processes);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          Generate Random Workload
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Number of Processes
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={numProcesses}
              onChange={(e) => setNumProcesses(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Max Arrival Time
            </label>
            <input
              type="number"
              min="0"
              value={maxArrival}
              onChange={(e) => setMaxArrival(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Max Burst Time
            </label>
            <input
              type="number"
              min="1"
              value={maxBurst}
              onChange={(e) => setMaxBurst(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Max Priority
            </label>
            <input
              type="number"
              min="0"
              value={maxPriority}
              onChange={(e) => setMaxPriority(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleGenerate}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Generate
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-medium rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
