/**
 * Home Page
 * Landing page with navigation to main features
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllRuns, deleteRun } from '../utils/api';
import RunCard from '../components/RunCard';

export default function Home() {
  const navigate = useNavigate();
  const [runs, setRuns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRuns();
  }, []);

  const loadRuns = async () => {
    try {
      const data = await getAllRuns();
      setRuns(data);
    } catch (error) {
      console.error('Failed to load runs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (runId) => {
    try {
      await deleteRun(runId);
      setRuns(runs.filter(r => r.id !== runId));
    } catch (error) {
      console.error('Failed to delete run:', error);
      alert('Failed to delete run');
    }
  };

  const recentRuns = runs.slice(0, 6);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            CPU Scheduler Simulator
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Visualize and analyze CPU scheduling algorithms in real-time
          </p>
          
          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate('/workload')}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-md transition-all"
            >
              Create New Run
            </button>
            <button
              onClick={() => navigate('/runs')}
              className="px-8 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 text-gray-900 dark:text-gray-100 font-semibold rounded-lg shadow-md border border-gray-300 dark:border-gray-700 transition-all"
            >
              View History
            </button>
            <button
              onClick={() => navigate('/docs')}
              className="px-8 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 text-gray-900 dark:text-gray-100 font-semibold rounded-lg shadow-md border border-gray-300 dark:border-gray-700 transition-all"
            >
              Documentation
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Real-time Visualization
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Watch your scheduling algorithms execute in real-time with interactive Gantt charts
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Multiple Algorithms
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Support for FCFS, SJF, SRTF, Priority, Round Robin, and MLFQ scheduling
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-3xl mb-3">📈</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Performance Metrics
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Analyze waiting time, turnaround time, and response time for each process
            </p>
          </div>
        </div>

        {/* Recent Runs */}
        {recentRuns.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Recent Runs
              </h2>
              <button
                onClick={() => navigate('/runs')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                View All →
              </button>
            </div>

            {isLoading ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                Loading runs...
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentRuns.map(run => (
                  <RunCard key={run.id} run={run} onDelete={handleDelete} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
