/**
 * CompareRuns Page
 * Side-by-side comparison of multiple runs
 */

import React, { useEffect, useState } from 'react';
import { getAllRuns } from '../utils/api';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function CompareRuns() {
  const [runs, setRuns] = useState([]);
  const [selectedRuns, setSelectedRuns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRuns();
  }, []);

  const loadRuns = async () => {
    try {
      const data = await getAllRuns();
      // Only completed/finished runs can be compared
      setRuns(data.filter(r => r.status === 'finished' || r.status === 'completed'));
    } catch (error) {
      console.error('Failed to load runs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRunSelection = (runId) => {
    setSelectedRuns(prev => {
      if (prev.includes(runId)) {
        return prev.filter(id => id !== runId);
      } else {
        return [...prev, runId];
      }
    });
  };

  const selectedRunData = runs.filter(r => selectedRuns.includes(r.id));

  // Calculate CPU utilization for each run
  const getMetrics = (run) => {
    const summary = run.summary_json;
    if (!summary) return { waiting: 0, turnaround: 0, response: 0, cpuUtil: 0, contextSwitches: 0 };
    
    // Calculate CPU utilization: (total burst time / total ticks) * 100
    let totalBurst = 0;
    if (summary.processes && Array.isArray(summary.processes)) {
      totalBurst = summary.processes.reduce((sum, p) => sum + (p.burst || 0), 0);
    }
    const cpuUtil = summary.ticks > 0 ? ((totalBurst / summary.ticks) * 100) : 0;

    return {
      waiting: summary.averages?.waiting_time || 0,
      turnaround: summary.averages?.turnaround_time || 0,
      response: summary.averages?.response_time || 0,
      cpuUtil: cpuUtil,
      contextSwitches: summary.context_switches || 0
    };
  };

  // Prepare chart data
  const chartData = {
    labels: selectedRunData.map(r => `${r.algorithm} (${r.id})`),
    datasets: [
      {
        label: 'Avg Waiting Time',
        data: selectedRunData.map(r => getMetrics(r).waiting),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
      {
        label: 'Avg Turnaround Time',
        data: selectedRunData.map(r => getMetrics(r).turnaround),
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
      },
      {
        label: 'Avg Response Time',
        data: selectedRunData.map(r => getMetrics(r).response),
        backgroundColor: 'rgba(245, 158, 11, 0.5)',
        borderColor: 'rgba(245, 158, 11, 1)',
        borderWidth: 1,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Time (ticks)',
          font: {
            size: 14,
            weight: 'bold',
          },
        },
        ticks: {
          font: {
            size: 12,
          },
        },
      },
      x: {
        ticks: {
          font: {
            size: 12,
          },
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Compare Runs
        </h1>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            Loading runs...
          </div>
        ) : (
          <>
            {/* Run Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Select Runs to Compare
              </h2>
              
              {runs.length === 0 ? (
                <div className="text-gray-500 dark:text-gray-400">
                  No completed runs available for comparison
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {runs.map(run => (
                    <label
                      key={run.id}
                      className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedRuns.includes(run.id)
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedRuns.includes(run.id)}
                        onChange={() => toggleRunSelection(run.id)}
                        className="rounded"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {run.algorithm}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          ID: {run.id}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Comparison Results */}
            {selectedRunData.length > 0 && (
              <>
                {/* Warning for runs without summary */}
                {selectedRunData.some(r => !r.summary_json) && (
                  <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-6">
                    <div className="text-yellow-800 dark:text-yellow-200 text-sm">
                      <p className="font-semibold mb-2">⚠️ Some selected runs don't have summary data</p>
                      <p className="mb-1">Possible reasons:</p>
                      <ul className="list-disc list-inside ml-2 space-y-1">
                        <li>The runs haven't finished completely yet</li>
                        <li>The backend server needs to be restarted to load summary data</li>
                        <li>The runs failed to generate summary output</li>
                      </ul>
                      <p className="mt-2 font-medium">Try: Restart the backend server and refresh this page</p>
                    </div>
                  </div>
                )}

                {/* Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6 border border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Performance Comparison ({selectedRunData.length} runs selected)
                  </h2>
                  
                  {/* Color Legend */}
                  <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Chart Color Legend:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded" style={{ backgroundColor: 'rgba(59, 130, 246, 0.7)', border: '2px solid rgb(59, 130, 246)' }}></div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Blue</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Average Waiting Time</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded" style={{ backgroundColor: 'rgba(16, 185, 129, 0.7)', border: '2px solid rgb(16, 185, 129)' }}></div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Green</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Average Turnaround Time</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded" style={{ backgroundColor: 'rgba(245, 158, 11, 0.7)', border: '2px solid rgb(245, 158, 11)' }}></div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Orange</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Average Response Time</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedRunData.length > 0 && chartData.labels.length > 0 ? (
                    <div className="h-96">
                      <Bar data={chartData} options={chartOptions} />
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                      No data available for comparison
                    </div>
                  )}
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Detailed Metrics
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Algorithm</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Avg Waiting</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Avg Turnaround</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Avg Response</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">CPU Util %</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Context Switches</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {selectedRunData.map(run => {
                          const metrics = getMetrics(run);
                          return (
                            <tr key={run.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                              <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                {run.algorithm} ({run.id})
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                {metrics.waiting.toFixed(2)}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                {metrics.turnaround.toFixed(2)}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                {metrics.response.toFixed(2)}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                {metrics.cpuUtil.toFixed(1)}%
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                {metrics.contextSwitches}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
