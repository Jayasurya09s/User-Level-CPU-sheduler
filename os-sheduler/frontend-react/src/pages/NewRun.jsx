/**
 * NewRun Page  
 * Workload builder with form-based process input
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { startRun } from '../utils/api';
import WorkloadTable from '../components/WorkloadTable';
import RandomWorkloadModal from '../components/RandomWorkloadModal';

export default function NewRun() {
  const navigate = useNavigate();
  const [algorithm, setAlgorithm] = useState('FCFS');
  const [quantum, setQuantum] = useState(2);
  const [mlfqLevels, setMlfqLevels] = useState([2, 4]);
  const [processes, setProcesses] = useState([
    { pid: 0, arrival_time: 0, burst_time: 5, priority: 1 }
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const algorithmsNeedingQuantum = ['RR', 'Round Robin'];
  const algorithmsNeedingMLFQ = ['MLFQ'];

  const handleAddProcess = () => {
    const newPid = processes.length;
    setProcesses([...processes, { pid: newPid, arrival_time: 0, burst_time: 5, priority: 1 }]);
  };

  const handleRemoveProcess = (index) => {
    const updated = processes.filter((_, i) => i !== index);
    // Re-assign PIDs
    updated.forEach((p, i) => p.pid = i);
    setProcesses(updated);
  };

  const handleImport = () => {
    const json = prompt('Paste JSON workload:');
    if (json) {
      try {
        const imported = JSON.parse(json);
        if (Array.isArray(imported)) {
          setProcesses(imported.map((p, i) => ({ ...p, pid: i })));
        }
      } catch (error) {
        alert('Invalid JSON');
      }
    }
  };

  const handleExport = () => {
    const json = JSON.stringify(processes, null, 2);
    navigator.clipboard.writeText(json).then(() => {
      alert('Workload copied to clipboard!');
    }).catch(() => {
      prompt('Copy this workload:', json);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (processes.length === 0) {
      alert('Please add at least one process');
      return;
    }

    for (const p of processes) {
      if (!p.burst_time || p.burst_time < 1) {
        alert(`Process ${p.pid} must have burst time >= 1`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Map frontend algorithm names to backend names
      const algorithmMap = {
        'FCFS': 'fcfs',
        'SJF': 'sjf',
        'SRTF': 'srtf',
        'Priority': 'priority',
        'Priority_Preemptive': 'priority_p',
        'RR': 'rr',
        'Round Robin': 'rr',
        'MLFQ': 'mlfq'
      };
      
      const backendAlgorithm = algorithmMap[algorithm] || algorithm.toLowerCase();
      
      // Build args array based on algorithm
      // Format: [algorithm, ...params]
      const args = [backendAlgorithm];
      
      if (algorithmsNeedingQuantum.includes(algorithm)) {
        args.push(String(quantum));
      }
      if (algorithmsNeedingMLFQ.includes(algorithm)) {
        // For MLFQ, pass levels as comma-separated string
        args.push(mlfqLevels.join(','));
      }

      // Start run
      const result = await startRun({
        algorithm: backendAlgorithm,
        args,
        meta: {
          workload_json: JSON.stringify(processes)
        }
      });

      // Navigate to run viewer
      navigate(`/run/${result.run_id}`);
    } catch (error) {
      console.error('Failed to start run:', error);
      alert('Failed to start run: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Create New Run
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Algorithm Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Algorithm
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Algorithm
                </label>
                <select
                  value={algorithm}
                  onChange={(e) => setAlgorithm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                >
                  <option value="FCFS">FCFS (First Come First Served)</option>
                  <option value="SJF">SJF (Shortest Job First)</option>
                  <option value="SRTF">SRTF (Shortest Remaining Time First)</option>
                  <option value="Priority">Priority (Non-preemptive)</option>
                  <option value="Priority_Preemptive">Priority (Preemptive)</option>
                  <option value="RR">Round Robin</option>
                  <option value="MLFQ">MLFQ (Multi-Level Feedback Queue)</option>
                </select>
              </div>

              {algorithmsNeedingQuantum.includes(algorithm) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Time Quantum
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantum}
                    onChange={(e) => setQuantum(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>
              )}

              {algorithmsNeedingMLFQ.includes(algorithm) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    MLFQ Quantums (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={mlfqLevels.join(',')}
                    onChange={(e) => setMlfqLevels(e.target.value.split(',').map(Number))}
                    placeholder="2,4,8"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Workload */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Workload ({processes.length} processes)
              </h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Generate Random
                </button>
                <button
                  type="button"
                  onClick={handleImport}
                  className="px-3 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 text-sm font-medium rounded-lg transition-colors"
                >
                  Import JSON
                </button>
                <button
                  type="button"
                  onClick={handleExport}
                  className="px-3 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 text-sm font-medium rounded-lg transition-colors"
                >
                  Export JSON
                </button>
              </div>
            </div>

            <WorkloadTable
              processes={processes}
              onChange={setProcesses}
              onAddProcess={handleAddProcess}
              onRemoveProcess={handleRemoveProcess}
            />
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg shadow-md transition-colors"
            >
              {isSubmitting ? 'Starting Run...' : 'Start Simulation'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-semibold rounded-lg shadow-md transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>

        <RandomWorkloadModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onGenerate={(generated) => setProcesses(generated)}
        />
      </div>
    </div>
  );
}
