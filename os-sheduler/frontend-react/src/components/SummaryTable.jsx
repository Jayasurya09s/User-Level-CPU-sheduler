/**
 * SummaryTable Component
 * Displays process metrics with export options
 */

import React from 'react';
import {
  exportAsCSV,
  exportAsJSON,
  exportAsMarkdown,
  exportAsLatex,
  downloadFile
} from '../utils/summaryUtils';

export default function SummaryTable({ summary }) {
  if (!summary || !summary.processes) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Summary
        </h3>
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          No summary data available
        </div>
      </div>
    );
  }

  const handleExport = (format) => {
    let content, filename, mimeType;

    switch (format) {
      case 'csv':
        content = exportAsCSV(summary);
        filename = 'summary.csv';
        mimeType = 'text/csv';
        break;
      case 'json':
        content = exportAsJSON(summary);
        filename = 'summary.json';
        mimeType = 'application/json';
        break;
      case 'markdown':
        content = exportAsMarkdown(summary);
        filename = 'summary.md';
        mimeType = 'text/markdown';
        break;
      case 'latex':
        content = exportAsLatex(summary);
        filename = 'summary.tex';
        mimeType = 'text/plain';
        break;
      default:
        return;
    }

    downloadFile(content, filename, mimeType);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Summary {summary.algorithm && `- ${summary.algorithm.toUpperCase()}`}
          </h3>
          {(summary.ticks || summary.context_switches) && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {summary.ticks > 0 && `Total Ticks: ${summary.ticks}`}
              {summary.ticks > 0 && summary.context_switches > 0 && ' • '}
              {summary.context_switches > 0 && `Context Switches: ${summary.context_switches}`}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleExport('csv')}
            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
          >
            CSV
          </button>
          <button
            onClick={() => handleExport('json')}
            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
          >
            JSON
          </button>
          <button
            onClick={() => handleExport('markdown')}
            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
          >
            MD
          </button>
          <button
            onClick={() => handleExport('latex')}
            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
          >
            LaTeX
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">PID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Arrival</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Burst</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Completion</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Waiting</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Turnaround</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Response</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Priority</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {summary.processes.map((process) => (
              <tr key={process.pid} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{process.pid}</td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{process.arrival ?? 'N/A'}</td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{process.burst ?? 'N/A'}</td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{process.finish ?? 'N/A'}</td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{process.waiting_time ?? 'N/A'}</td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{process.turnaround_time ?? 'N/A'}</td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{process.response_time ?? 'N/A'}</td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{process.priority || 'N/A'}</td>
              </tr>
            ))}
            <tr className="bg-blue-50 dark:bg-blue-900 font-semibold">
              <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">AVERAGE</td>
              <td className="px-4 py-3 text-sm"></td>
              <td className="px-4 py-3 text-sm"></td>
              <td className="px-4 py-3 text-sm"></td>
              <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                {summary.averages.waiting_time.toFixed(2)}
              </td>
              <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                {summary.averages.turnaround_time.toFixed(2)}
              </td>
              <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                {summary.averages.response_time.toFixed(2)}
              </td>
              <td className="px-4 py-3 text-sm"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
