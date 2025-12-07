/**
 * WorkloadTable Component
 * Editable table for process workload data
 */

import React from 'react';

export default function WorkloadTable({ processes, onChange, onAddProcess, onRemoveProcess }) {
  const handleCellChange = (index, field, value) => {
    const updatedProcesses = [...processes];
    updatedProcesses[index] = {
      ...updatedProcesses[index],
      [field]: value === '' ? '' : Number(value)
    };
    onChange(updatedProcesses);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              PID
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Arrival Time
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Burst Time
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Priority
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {processes.map((process, index) => (
            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                {process.pid}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <input
                  type="number"
                  min="0"
                  value={process.arrival_time}
                  onChange={(e) => handleCellChange(index, 'arrival_time', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
                  aria-label={`Arrival time for process ${process.pid}`}
                />
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <input
                  type="number"
                  min="1"
                  value={process.burst_time}
                  onChange={(e) => handleCellChange(index, 'burst_time', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
                  aria-label={`Burst time for process ${process.pid}`}
                />
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <input
                  type="number"
                  min="0"
                  value={process.priority}
                  onChange={(e) => handleCellChange(index, 'priority', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
                  aria-label={`Priority for process ${process.pid}`}
                />
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <button
                  onClick={() => onRemoveProcess(index)}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
                  aria-label={`Remove process ${process.pid}`}
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4">
        <button
          onClick={onAddProcess}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Add Process
        </button>
      </div>
    </div>
  );
}
