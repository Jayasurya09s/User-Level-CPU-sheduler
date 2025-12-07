/**
 * EventList Component
 * Filterable, searchable list of scheduler events with auto-scroll for live updates
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  formatEventDescription,
  getEventIcon,
  getEventColorClass,
  filterEvents,
  formatTimestamp,
  formatTick
} from '../utils/formatEvent';

export default function EventList({ events }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    hideTrivia: true,
    types: []
  });
  const [expandedEvents, setExpandedEvents] = useState(new Set());
  const [autoScroll, setAutoScroll] = useState(true);
  const eventListRef = useRef(null);
  const prevEventsLengthRef = useRef(events.length);

  const eventTypes = [
    'context_switch',
    'job_started',
    'job_finished',
    'job_preempted',
    'job_resumed',
    'starvation_warning',
    'job_arrived'
  ];

  const filteredEvents = useMemo(() => {
    const filtered = filterEvents(events, filters, searchQuery);
    // Show most recent events first for live monitoring
    return filtered.reverse();
  }, [events, filters, searchQuery]);
  
  // Auto-scroll to bottom when new events arrive
  useEffect(() => {
    if (autoScroll && eventListRef.current && events.length > prevEventsLengthRef.current) {
      const container = eventListRef.current;
      container.scrollTop = 0; // Scroll to top since we reversed the list
    }
    prevEventsLengthRef.current = events.length;
  }, [events, autoScroll]);

  const toggleEventExpansion = (index) => {
    const newExpanded = new Set(expandedEvents);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedEvents(newExpanded);
  };

  const toggleTypeFilter = (type) => {
    setFilters(prev => {
      const types = prev.types.includes(type)
        ? prev.types.filter(t => t !== type)
        : [...prev.types, type];
      return { ...prev, types };
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          📋 Live Events ({filteredEvents.length})
        </h3>
        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            checked={autoScroll}
            onChange={(e) => setAutoScroll(e.target.checked)}
            className="rounded"
          />
          Auto-scroll
        </label>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search events..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
          aria-label="Search events"
        />
      </div>

      {/* Filters */}
      <div className="mb-4 space-y-2">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={filters.hideTrivia}
            onChange={(e) => setFilters(prev => ({ ...prev, hideTrivia: e.target.checked }))}
            className="rounded"
          />
          <span className="text-gray-700 dark:text-gray-300">Hide trivial events (tick, gantt_slice)</span>
        </label>

        <div className="flex flex-wrap gap-2 mt-2">
          {eventTypes.map(type => (
            <button
              key={type}
              onClick={() => toggleTypeFilter(type)}
              className={`px-2 py-1 text-xs rounded ${
                filters.types.includes(type)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Event List */}
      <div ref={eventListRef} className="space-y-2 max-h-96 overflow-y-auto scroll-smooth">
        {filteredEvents.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            {events.length === 0 ? 'Waiting for events...' : 'No events match the current filters'}
          </div>
        ) : (
          filteredEvents.map((event, index) => (
            <div
              key={index}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors animate-fadeIn"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{getEventIcon(event)}</span>
                    <span className={`text-sm font-medium ${getEventColorClass(event)}`}>
                      {formatEventDescription(event)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {formatTick(event.tick)} • {formatTimestamp(event.timestamp)}
                  </div>
                </div>
                <button
                  onClick={() => toggleEventExpansion(index)}
                  className="text-blue-600 dark:text-blue-400 text-xs hover:underline"
                >
                  {expandedEvents.has(index) ? 'Hide' : 'Show'} JSON
                </button>
              </div>

              {expandedEvents.has(index) && (
                <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-900 rounded text-xs overflow-x-auto">
                  {JSON.stringify(event, null, 2)}
                </pre>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
