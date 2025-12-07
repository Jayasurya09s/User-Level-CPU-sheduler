/**
 * Custom hook for managing Gantt chart data
 * Handles real-time updates and transformations
 */

import { useState, useEffect, useCallback } from 'react';
import { transformEventsToGantt, calculateGanttStats } from '../utils/ganttTransform';

/**
 * Hook to manage Gantt chart data from events
 * @param {Array} events - Array of scheduler events
 * @returns {Object} Gantt segments and statistics
 */
export function useGanttData(events = []) {
  const [segments, setSegments] = useState([]);
  const [stats, setStats] = useState({
    totalTime: 0,
    cpuUtilization: 0,
    idleTime: 0,
    contextSwitches: 0
  });

  // Transform events to Gantt segments
  useEffect(() => {
    if (events.length > 0) {
      const newSegments = transformEventsToGantt(events);
      setSegments(newSegments);
      
      const newStats = calculateGanttStats(newSegments);
      setStats(newStats);
    }
  }, [events]);

  // Get segment at specific tick
  const getSegmentAt = useCallback((tick) => {
    return segments.find(s => tick >= s.start && tick < s.end);
  }, [segments]);

  // Get segments in range
  const getSegmentsInRange = useCallback((startTick, endTick) => {
    return segments.filter(s => s.end > startTick && s.start < endTick);
  }, [segments]);

  return {
    segments,
    stats,
    getSegmentAt,
    getSegmentsInRange
  };
}

export default useGanttData;
