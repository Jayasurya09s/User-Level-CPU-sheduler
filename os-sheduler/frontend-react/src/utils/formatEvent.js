/**
 * Format event data for human-readable display
 * Transforms raw scheduler events into user-friendly descriptions
 */

/**
 * Check if event is trivial (should be hidden by default)
 */
export function isTrivialEvent(event) {
  return event.type === 'tick' || event.type === 'gantt_slice';
}

/**
 * Check if event is significant (always shown)
 */
export function isSignificantEvent(event) {
  const significantTypes = [
    'context_switch',
    'job_started',
    'job_preempted',
    'job_resumed',
    'job_finished',
    'starvation_warning',
    'job_arrived'
  ];
  return significantTypes.includes(event.type);
}

/**
 * Format event into human-readable description
 */
export function formatEventDescription(event) {
  // Handle raw text events
  if (event.raw) {
    return event.raw;
  }

  // Scheduler outputs flat structure, not nested in 'data'
  const { type, data, pid, priority, remaining, burst, arrival } = event;

  // If no type, try to infer from event structure or show raw JSON
  if (!type) {
    // Check if it's a summary/final output
    if (event.algorithm) {
      return `Algorithm: ${event.algorithm} - ${event.processes?.length || 0} processes completed`;
    }
    // Show first few fields as summary
    const keys = Object.keys(event).filter(k => k !== 'tick' && k !== 'id' && k !== 'created_at');
    if (keys.length > 0) {
      return `Event data: ${keys.slice(0, 3).join(', ')}`;
    }
    return 'Unknown event';
  }

  switch (type) {
    case 'context_switch':
      return `Context switch → PID ${pid ?? (data?.pid) ?? 'IDLE'}`;
    
    case 'job_started':
      return `Process ${pid ?? (data?.pid)} started (Priority: ${priority ?? (data?.priority) ?? 'N/A'})`;
    
    case 'job_preempted':
      return `Process ${pid ?? (data?.pid)} preempted (Remaining: ${remaining ?? (data?.remaining) ?? 'N/A'})`;
    
    case 'job_resumed':
      return `Process ${pid ?? (data?.pid)} resumed (Remaining: ${remaining ?? (data?.remaining) ?? 'N/A'})`;
    
    case 'job_finished':
      return `Process ${pid ?? (data?.pid)} completed`;
    
    case 'starvation_warning':
      return `⚠️ Starvation warning: Process ${pid ?? (data?.pid)} waiting for ${data?.wait_time || 'N/A'} ticks`;
    
    case 'tick':
      return `Tick ${data?.tick || event.tick || '?'}`;
    
    case 'job_arrived':
      return `Process ${pid ?? (data?.pid)} arrived (Burst: ${burst ?? (data?.burst_time) ?? 'N/A'})`;
    
    case 'gantt_slice':
      return `Running: PID ${pid ?? (data?.pid) ?? 'IDLE'} (Remaining: ${remaining ?? (data?.remaining) ?? '?'})`;
    
    default:
      return `Event: ${type}`;
  }
}

/**
 * Get event icon based on type
 */
export function getEventIcon(event) {
  const { type } = event;

  const icons = {
    context_switch: '🔄',
    job_started: '▶️',
    job_preempted: '⏸️',
    job_resumed: '▶️',
    job_finished: '✅',
    starvation_warning: '⚠️',
    tick: '⏱️',
    job_arrived: '📥',
    gantt_slice: '📊',
  };

  return icons[type] || '•';
}

/**
 * Get event color class based on type
 */
export function getEventColorClass(event) {
  const { type } = event;

  const colors = {
    context_switch: 'text-blue-600',
    job_started: 'text-green-600',
    job_preempted: 'text-yellow-600',
    job_resumed: 'text-green-600',
    job_finished: 'text-emerald-600',
    starvation_warning: 'text-red-600',
    tick: 'text-gray-400',
    job_arrived: 'text-indigo-600',
    gantt_slice: 'text-purple-600',
  };

  return colors[type] || 'text-gray-600';
}

/**
 * Filter events based on filters
 * @param {Array} events - Array of events
 * @param {Object} filters - Filter settings
 * @param {string} searchQuery - Search query string
 */
export function filterEvents(events, filters, searchQuery = '') {
  return events.filter(event => {
    // Apply type filters
    if (filters.hideTrivia && isTrivialEvent(event)) {
      return false;
    }

    if (filters.types && filters.types.length > 0) {
      if (!filters.types.includes(event.type)) {
        return false;
      }
    }

    // Apply search query
    if (searchQuery) {
      const description = formatEventDescription(event).toLowerCase();
      const jsonStr = JSON.stringify(event).toLowerCase();
      const query = searchQuery.toLowerCase();
      
      if (!description.includes(query) && !jsonStr.includes(query)) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(timestamp) {
  if (!timestamp) return 'N/A';
  
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3
  });
}

/**
 * Format tick number
 */
export function formatTick(tick) {
  if (tick === null || tick === undefined) return 'T-';
  return `T${tick}`;
}

export default {
  isTrivialEvent,
  isSignificantEvent,
  formatEventDescription,
  getEventIcon,
  getEventColorClass,
  filterEvents,
  formatTimestamp,
  formatTick
};
