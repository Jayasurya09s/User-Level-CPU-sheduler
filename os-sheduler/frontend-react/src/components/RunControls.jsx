/**
 * RunControls Component
 * Control buttons for managing a run
 */

import React from 'react';
import { stopRun, deleteRun, duplicateRun } from '../utils/api';
import { useNavigate } from 'react-router-dom';

export default function RunControls({ runId, runStatus, onUpdate }) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleStop = async () => {
    if (!window.confirm('Are you sure you want to stop this run?')) return;
    
    setIsLoading(true);
    try {
      await stopRun(runId);
      onUpdate?.();
    } catch (error) {
      console.error('Failed to stop run:', error);
      alert('Failed to stop run');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this run? This cannot be undone.')) return;
    
    setIsLoading(true);
    try {
      await deleteRun(runId);
      navigate('/runs');
    } catch (error) {
      console.error('Failed to delete run:', error);
      alert('Failed to delete run');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDuplicate = async () => {
    setIsLoading(true);
    try {
      const newRun = await duplicateRun(runId);
      navigate(`/run/${newRun.id}`);
    } catch (error) {
      console.error('Failed to duplicate run:', error);
      alert('Failed to duplicate run');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/run/${runId}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert('Shareable link copied to clipboard!');
    }).catch(() => {
      prompt('Copy this link:', shareUrl);
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Run Controls
      </h3>

      <div className="space-y-2">
        {runStatus === 'running' && (
          <button
            onClick={handleStop}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
          >
            {isLoading ? 'Stopping...' : 'Stop Run'}
          </button>
        )}

        <button
          onClick={handleDuplicate}
          disabled={isLoading}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
        >
          {isLoading ? 'Duplicating...' : 'Duplicate Run'}
        </button>

        <button
          onClick={handleShare}
          className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
        >
          Share Link
        </button>

        <button
          onClick={handleDelete}
          disabled={isLoading}
          className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
        >
          {isLoading ? 'Deleting...' : 'Delete Run'}
        </button>
      </div>
    </div>
  );
}
