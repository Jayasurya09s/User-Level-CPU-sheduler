/**
 * Docs Page
 * Documentation for scheduling algorithms and metrics
 */

import React from 'react';

export default function Docs() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Documentation
        </h1>

        {/* Algorithms */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Scheduling Algorithms
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                FCFS (First Come First Served)
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                The simplest scheduling algorithm. Processes are executed in the order they arrive in the ready queue.
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
                <li>Non-preemptive</li>
                <li>Easy to implement</li>
                <li>May cause convoy effect (long processes hold up shorter ones)</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                SJF (Shortest Job First)
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Selects the process with the smallest burst time from the ready queue.
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
                <li>Non-preemptive</li>
                <li>Minimizes average waiting time</li>
                <li>May cause starvation of long processes</li>
                <li>Requires knowledge of burst times</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                SRTF (Shortest Remaining Time First)
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Preemptive version of SJF. Selects the process with the smallest remaining burst time.
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
                <li>Preemptive</li>
                <li>Optimal for minimizing average waiting time</li>
                <li>Higher overhead due to context switching</li>
                <li>May cause starvation</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Priority Scheduling
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Assigns priority to each process. Higher priority processes are executed first.
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
                <li>Can be preemptive or non-preemptive</li>
                <li>Priority can be internal (time limits, memory requirements) or external (importance)</li>
                <li>May cause starvation of low-priority processes</li>
                <li>Solution: Aging (gradually increase priority of waiting processes)</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Round Robin (RR)
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Each process gets a small time quantum. After the quantum expires, the process is preempted and added to the end of the ready queue.
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
                <li>Preemptive</li>
                <li>Fair allocation of CPU time</li>
                <li>Performance depends on quantum size</li>
                <li>Good for time-sharing systems</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                MLFQ (Multi-Level Feedback Queue)
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Multiple queues with different priorities and time quantums. Processes move between queues based on their behavior.
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
                <li>Preemptive</li>
                <li>Favors short processes without knowing burst time</li>
                <li>Allows processes to move between queues</li>
                <li>Most complex but most flexible</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Performance Metrics
          </h2>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Arrival Time
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                The time at which a process enters the ready queue.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Burst Time
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                The total CPU time required by a process to complete execution.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Completion Time
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                The time at which a process completes its execution.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Waiting Time
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-1">
                The total time a process spends waiting in the ready queue.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 font-mono">
                Waiting Time = Turnaround Time - Burst Time
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Turnaround Time
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-1">
                The total time from process arrival to completion.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 font-mono">
                Turnaround Time = Completion Time - Arrival Time
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Response Time
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-1">
                The time from process arrival until it first gets the CPU.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 font-mono">
                Response Time = First CPU Time - Arrival Time
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                CPU Utilization
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-1">
                The percentage of time the CPU is busy executing processes.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 font-mono">
                CPU Utilization = (Total CPU Time / Total Time) × 100%
              </p>
            </div>
          </div>
        </div>

        {/* Examples */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Example Workload
          </h2>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">PID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Arrival</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Burst</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">0</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">0</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">5</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">2</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">1</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">1</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">3</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">1</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">2</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">2</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">8</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">3</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Try this workload with different algorithms to compare their performance!
          </p>
        </div>
      </div>
    </div>
  );
}
