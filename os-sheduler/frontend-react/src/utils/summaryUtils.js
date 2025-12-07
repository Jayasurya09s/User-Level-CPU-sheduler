/**
 * Summary utilities for processing scheduler metrics
 * Handles calculation and formatting of performance metrics
 */

/**
 * Calculate average from array of numbers
 */
function average(arr) {
  if (arr.length === 0) return 0;
  return arr.reduce((sum, val) => sum + val, 0) / arr.length;
}

/**
 * Format summary data from backend response
 */
export function formatSummary(summaryData) {
  if (!summaryData || !summaryData.processes) {
    return {
      processes: [],
      averages: {
        waiting_time: 0,
        turnaround_time: 0,
        response_time: 0
      },
      algorithm: 'unknown',
      ticks: 0,
      context_switches: 0
    };
  }

  // Handle array format from scheduler (direct output)
  if (Array.isArray(summaryData.processes)) {
    const processes = summaryData.processes.map(proc => ({
      pid: proc.pid,
      arrival: proc.arrival,
      burst: proc.burst,
      start: proc.start,
      finish: proc.finish,
      waiting_time: proc.waiting,
      turnaround_time: proc.turnaround,
      response_time: proc.response,
      priority: proc.priority
    }));

    return {
      processes,
      averages: summaryData.averages || {
        waiting_time: 0,
        turnaround_time: 0,
        response_time: 0
      },
      algorithm: summaryData.algorithm || 'unknown',
      ticks: summaryData.ticks || 0,
      context_switches: summaryData.context_switches || 0
    };
  }

  // Handle object format (legacy)
  const processes = Object.entries(summaryData.processes).map(([pid, metrics]) => ({
    pid: parseInt(pid),
    waiting_time: metrics.waiting_time || 0,
    turnaround_time: metrics.turnaround_time || 0,
    response_time: metrics.response_time || 0,
    arrival: metrics.arrival_time || 0,
    burst: metrics.burst_time || 0,
    finish: metrics.completion_time || 0,
    priority: metrics.priority
  }));

  const averages = {
    waiting_time: average(processes.map(p => p.waiting_time)),
    turnaround_time: average(processes.map(p => p.turnaround_time)),
    response_time: average(processes.map(p => p.response_time))
  };

  return {
    processes,
    averages,
    algorithm: summaryData.algorithm || 'unknown',
    ticks: summaryData.ticks || 0,
    context_switches: summaryData.context_switches || 0
  };
}

/**
 * Export summary as CSV
 */
export function exportAsCSV(summary) {
  const headers = [
    'PID',
    'Arrival Time',
    'Burst Time',
    'Completion Time',
    'Waiting Time',
    'Turnaround Time',
    'Response Time',
    'Priority'
  ];

  const rows = summary.processes.map(p => [
    p.pid,
    p.arrival_time,
    p.burst_time,
    p.completion_time,
    p.waiting_time,
    p.turnaround_time,
    p.response_time,
    p.priority || 'N/A'
  ]);

  // Add averages row
  rows.push([
    'AVERAGE',
    '',
    '',
    '',
    summary.averages.waiting_time.toFixed(2),
    summary.averages.turnaround_time.toFixed(2),
    summary.averages.response_time.toFixed(2),
    ''
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  return csvContent;
}

/**
 * Export summary as JSON
 */
export function exportAsJSON(summary) {
  return JSON.stringify(summary, null, 2);
}

/**
 * Export summary as Markdown table
 */
export function exportAsMarkdown(summary) {
  const headers = [
    'PID',
    'Arrival',
    'Burst',
    'Completion',
    'Waiting',
    'Turnaround',
    'Response',
    'Priority'
  ];

  let markdown = '| ' + headers.join(' | ') + ' |\n';
  markdown += '|' + headers.map(() => '---').join('|') + '|\n';

  summary.processes.forEach(p => {
    markdown += `| ${p.pid} | ${p.arrival_time} | ${p.burst_time} | ${p.completion_time} | `;
    markdown += `${p.waiting_time} | ${p.turnaround_time} | ${p.response_time} | ${p.priority || 'N/A'} |\n`;
  });

  // Add averages
  markdown += `| **AVERAGE** | - | - | - | `;
  markdown += `**${summary.averages.waiting_time.toFixed(2)}** | `;
  markdown += `**${summary.averages.turnaround_time.toFixed(2)}** | `;
  markdown += `**${summary.averages.response_time.toFixed(2)}** | - |\n`;

  return markdown;
}

/**
 * Export summary as LaTeX table
 */
export function exportAsLatex(summary) {
  let latex = '\\begin{table}[h]\n';
  latex += '\\centering\n';
  latex += '\\begin{tabular}{|c|c|c|c|c|c|c|c|}\n';
  latex += '\\hline\n';
  latex += 'PID & Arrival & Burst & Completion & Waiting & Turnaround & Response & Priority \\\\\n';
  latex += '\\hline\n';

  summary.processes.forEach(p => {
    latex += `${p.pid} & ${p.arrival_time} & ${p.burst_time} & ${p.completion_time} & `;
    latex += `${p.waiting_time} & ${p.turnaround_time} & ${p.response_time} & ${p.priority || 'N/A'} \\\\\n`;
  });

  latex += '\\hline\n';
  latex += `\\textbf{AVERAGE} & - & - & - & `;
  latex += `\\textbf{${summary.averages.waiting_time.toFixed(2)}} & `;
  latex += `\\textbf{${summary.averages.turnaround_time.toFixed(2)}} & `;
  latex += `\\textbf{${summary.averages.response_time.toFixed(2)}} & - \\\\\n`;
  latex += '\\hline\n';
  latex += '\\end{tabular}\n';
  latex += '\\caption{CPU Scheduling Results}\n';
  latex += '\\end{table}\n';

  return latex;
}

/**
 * Download file helper
 */
export function downloadFile(content, filename, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Compare two summaries
 */
export function compareSummaries(summaries) {
  return {
    processes: summaries.map(s => s.processes),
    averages: summaries.map(s => s.averages),
    algorithms: summaries.map(s => s.algorithm || 'Unknown')
  };
}

export default {
  formatSummary,
  exportAsCSV,
  exportAsJSON,
  exportAsMarkdown,
  exportAsLatex,
  downloadFile,
  compareSummaries
};
