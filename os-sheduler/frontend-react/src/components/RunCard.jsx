/**
 * RunCard Component
 * Display card for individual run in history
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function RunCard({ run, onDelete }) {
  const navigate = useNavigate();

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusBadge = (status) => {
    const badges = {
      running: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      killed: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status] || badges.running}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
            {run.algorithm || 'Unknown Algorithm'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Run ID: {run.id}
          </p>
        </div>
        {getStatusBadge(run.status)}
      </div>

      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
        <div>
          <span className="font-medium">Started:</span> {formatDate(run.started_at)}
        </div>
        {run.ended_at && (
          <div>
            <span className="font-medium">Ended:</span> {formatDate(run.ended_at)}
          </div>
        )}
        {run.args && run.args.quantum && (
          <div>
            <span className="font-medium">Quantum:</span> {run.args.quantum}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => navigate(`/run/${run.id}`)}
          className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          View Run
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm('Are you sure you want to delete this run?')) {
              onDelete(run.id);
            }
          }}
          className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
