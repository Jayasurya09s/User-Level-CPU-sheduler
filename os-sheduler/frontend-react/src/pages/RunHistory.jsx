/**
 * RunHistory Page
 * Display all simulation runs with filtering and search
 */

import React, { useEffect, useState } from 'react';
import { getAllRuns, deleteRun } from '../utils/api';
import RunCard from '../components/RunCard';

export default function RunHistory() {
  const [runs, setRuns] = useState([]);
  const [filteredRuns, setFilteredRuns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadRuns();
  }, []);

  useEffect(() => {
    filterRuns();
  }, [runs, searchQuery, statusFilter]);

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

  const filterRuns = () => {
    let filtered = runs;

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r => 
        r.algorithm.toLowerCase().includes(query) ||
        r.id.toString().includes(query)
      );
    }

    setFilteredRuns(filtered);
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Run History
        </h1>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by algorithm or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="all">All Status</option>
                <option value="running">Running</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="killed">Killed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            Loading runs...
          </div>
        ) : filteredRuns.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400 mb-4">
              {runs.length === 0 ? 'No runs yet' : 'No runs match your filters'}
            </div>
            {runs.length === 0 && (
              <button
                onClick={() => window.location.href = '/workload'}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
              >
                Create First Run
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Showing {filteredRuns.length} of {runs.length} runs
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRuns.map(run => (
                <RunCard key={run.id} run={run} onDelete={handleDelete} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
