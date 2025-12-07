/**
 * QueueInspector Component
 * Visualizes ready queue, running process, and pending processes
 */

import React from 'react';
import { getProcessColor } from '../lib/colors';

export default function QueueInspector({ events, currentTick }) {
  // Extract queue state at current tick with proper tracking
  const getQueueState = () => {
    const relevantEvents = events.filter(e => e.tick !== undefined && e.tick <= currentTick);
    
    // Track process states through events
    let runningPid = null;
    const readySet = new Set();
    const completedSet = new Set();
    const arrivedSet = new Set();
    
    // Process events in order to build current state
    relevantEvents.forEach(e => {
      const pid = e.pid;
      
      // Track arrivals
      if (e.type === 'job_resumed' && pid !== undefined && pid !== -1) {
        arrivedSet.add(pid);
      }
      
      // Track running process
      if ((e.type === 'job_started' || e.type === 'job_resumed') && pid !== undefined && pid !== -1) {
        runningPid = pid;
        readySet.delete(pid); // Remove from ready queue when it starts running
      }
      
      // Track when process is preempted (goes back to ready queue)
      if (e.type === 'job_preempted' && pid !== undefined && pid !== -1) {
        if (runningPid === pid) {
          runningPid = null;
        }
        readySet.add(pid); // Add back to ready queue
      }
      
      // Track completion
      if (e.type === 'job_finished' && pid !== undefined && pid !== -1) {
        if (runningPid === pid) {
          runningPid = null;
        }
        completedSet.add(pid);
        readySet.delete(pid); // Remove from ready queue when completed
      }
    });
    
    // Get all unique PIDs from all events
    const allPids = new Set();
    events.forEach(e => {
      if (e.pid !== undefined && e.pid !== -1) {
        allPids.add(e.pid);
      }
    });
    
    // Pending = not yet arrived
    const pendingProcesses = Array.from(allPids).filter(
      pid => !arrivedSet.has(pid)
    );
    
    // Ready queue = arrived but not running and not completed
    const readyQueue = Array.from(allPids).filter(
      pid => arrivedSet.has(pid) && 
             !completedSet.has(pid) && 
             pid !== runningPid
    );

    return { 
      readyQueue, 
      runningPid, 
      pendingProcesses,
      completedProcesses: Array.from(completedSet)
    };
  };

  const { readyQueue, runningPid, pendingProcesses, completedProcesses } = getQueueState();

  const ProcessBadge = ({ pid, isRunning = false }) => (
    <div
      className={`px-3 py-2 rounded-lg text-white font-medium text-sm ${
        isRunning ? 'ring-2 ring-yellow-400' : ''
      }`}
      style={{ backgroundColor: getProcessColor(pid) }}
    >
      P{pid}
      {isRunning && <span className="ml-1">⚡</span>}
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        🔍 Process State Monitor
      </h3>

      {/* Running Process */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Running Process
        </h4>
        <div className="flex gap-2">
          {runningPid !== undefined && runningPid !== null && runningPid !== -1 ? (
            <ProcessBadge pid={runningPid} isRunning={true} />
          ) : (
            <div className="px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400 text-sm">
              💤 IDLE
            </div>
          )}
        </div>
      </div>

      {/* Ready Queue */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
          Ready Queue ({readyQueue.length})
        </h4>
        <div className="flex flex-wrap gap-2 min-h-[2.5rem] p-2 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          {readyQueue.length > 0 ? (
            readyQueue.map((pid, index) => (
              <ProcessBadge key={index} pid={pid} />
            ))
          ) : (
            <div className="text-sm text-gray-500 dark:text-gray-400 self-center">
              Queue is empty
            </div>
          )}
        </div>
      </div>

      {/* Pending Processes */}
      {pendingProcesses.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
            Pending (Not Arrived) ({pendingProcesses.length})
          </h4>
          <div className="flex flex-wrap gap-2 min-h-[2.5rem] p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
            {pendingProcesses.map((pid, index) => (
              <div
                key={index}
                className="px-3 py-1 rounded-lg bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100 font-medium text-sm opacity-60"
              >
                P{pid} ⏳
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Processes */}
      {completedProcesses.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Completed ({completedProcesses.length})
          </h4>
          <div className="flex flex-wrap gap-2 min-h-[2.5rem] p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
            {completedProcesses.map((pid, index) => (
              <div
                key={index}
                className="px-3 py-1 rounded-lg bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 font-medium text-sm"
              >
                P{pid} ✓
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex flex-col gap-1">
          <div>⚡ Currently executing on CPU</div>
          <div>⏳ Waiting for arrival time</div>
          <div>✓ Execution completed</div>
        </div>
      </div>
    </div>
  );
}
