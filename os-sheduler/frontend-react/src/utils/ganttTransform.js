/**
 * Transform raw events into Gantt chart data
 * Handles aggregation and optimization of Gantt segments
 */

/**
 * Transform events into Gantt chart segments
 * @param {Array} events - Raw events from scheduler
 * @returns {Array} Gantt segments with { pid, start, end, priority, remaining }
 */
export function transformEventsToGantt(events) {
  const segments = [];
  let currentSegment = null;

  // If no events, return empty
  if (!events || events.length === 0) {
    return segments;
  }

  events.forEach(event => {
    // Skip invalid events
    if (!event) return;

    const { type, tick, pid, priority, remaining, data } = event;

    // If event has no type, skip it for Gantt purposes
    if (!type) {
      return;
    }

    switch (type) {
      case 'job_started':
      case 'job_resumed':
      case 'context_switch':
        // Start a new segment for this process
        // Close previous segment if exists
        if (currentSegment && currentSegment.pid !== undefined) {
          currentSegment.end = tick || currentSegment.start + 1;
          if (currentSegment.end > currentSegment.start) {
            segments.push({ ...currentSegment });
          }
        }

        // Start new segment
        const newPid = pid ?? (data?.pid);
        if (newPid !== undefined && newPid >= 0) {
          currentSegment = {
            pid: newPid,
            start: tick || 0,
            end: tick || 0,
            priority: priority ?? (data?.priority),
            remaining: remaining ?? (data?.remaining)
          };
        } else {
          currentSegment = null; // Idle
        }
        break;

      case 'job_preempted':
      case 'job_finished':
        // Close current segment
        if (currentSegment) {
          currentSegment.end = tick || currentSegment.start + 1;
          currentSegment.remaining = remaining ?? (data?.remaining);
          if (currentSegment.end > currentSegment.start) {
            segments.push({ ...currentSegment });
          }
          currentSegment = null;
        }
        break;

      case 'gantt_slice':
        // Update current segment end time (gantt_slice fires every tick while running)
        if (currentSegment && tick !== undefined) {
          currentSegment.end = tick + 1; // Include this tick
          currentSegment.remaining = remaining ?? (data?.remaining);
        }
        break;

      case 'tick':
        // Update current segment end time on tick
        if (currentSegment && tick !== undefined) {
          currentSegment.end = tick;
        }
        break;
    }
  });

  // Close any remaining segment
  if (currentSegment) {
    segments.push(currentSegment);
  }

  return mergeConsecutiveSegments(segments);
}

/**
 * Merge consecutive segments with the same PID
 * Reduces visual clutter in Gantt chart
 */
export function mergeConsecutiveSegments(segments) {
  if (segments.length === 0) return [];

  const merged = [];
  let current = { ...segments[0] };

  for (let i = 1; i < segments.length; i++) {
    const segment = segments[i];

    if (segment.pid === current.pid && segment.start === current.end) {
      // Extend current segment
      current.end = segment.end;
      current.remaining = segment.remaining; // Update to latest
    } else {
      // Push current and start new
      merged.push(current);
      current = { ...segment };
    }
  }

  merged.push(current);
  return merged;
}

/**
 * Calculate Gantt chart statistics
 */
export function calculateGanttStats(segments) {
  if (segments.length === 0) {
    return {
      totalTime: 0,
      cpuUtilization: 0,
      idleTime: 0,
      contextSwitches: 0
    };
  }

  const totalTime = Math.max(...segments.map(s => s.end));
  const idleTime = segments
    .filter(s => s.pid === -1 || s.pid === null)
    .reduce((sum, s) => sum + (s.end - s.start), 0);
  const cpuTime = totalTime - idleTime;
  const contextSwitches = segments.length - 1;

  return {
    totalTime,
    cpuUtilization: totalTime > 0 ? (cpuTime / totalTime) * 100 : 0,
    idleTime,
    contextSwitches
  };
}

/**
 * Get segment at specific tick
 */
export function getSegmentAtTick(segments, tick) {
  return segments.find(s => tick >= s.start && tick < s.end);
}

/**
 * Filter segments by time range
 */
export function filterSegmentsByRange(segments, startTick, endTick) {
  return segments.filter(s => {
    return s.end > startTick && s.start < endTick;
  });
}

/**
 * Group segments by PID for analysis
 */
export function groupSegmentsByPid(segments) {
  const groups = {};

  segments.forEach(segment => {
    const pid = segment.pid;
    if (!groups[pid]) {
      groups[pid] = [];
    }
    groups[pid].push(segment);
  });

  return groups;
}

export default {
  transformEventsToGantt,
  mergeConsecutiveSegments,
  calculateGanttStats,
  getSegmentAtTick,
  filterSegmentsByRange,
  groupSegmentsByPid
};
