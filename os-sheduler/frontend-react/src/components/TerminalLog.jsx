/**
 * TerminalLog Component
 * Terminal-style event log display with auto-scroll and timestamps
 */

import React, { useEffect, useRef, useState } from 'react';
import { formatEventDescription } from '../utils/formatEvent';

export default function TerminalLog({ events }) {
  const terminalRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const prevEventsLengthRef = useRef(events.length);

  // Auto-scroll to bottom when new events arrive
  useEffect(() => {
    if (autoScroll && terminalRef.current && events.length > prevEventsLengthRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
    prevEventsLengthRef.current = events.length;
  }, [events, autoScroll]);

  const getEventSymbol = (event) => {
    switch (event.type) {
      case 'job_started':
        return '▶';
      case 'job_finished':
        return '✓';
      case 'job_preempted':
        return '⏸';
      case 'job_resumed':
        return '▶';
      case 'context_switch':
        return '⇄';
      case 'gantt_slice':
        return '•';
      case 'tick':
        return '⋯';
      default:
        return '→';
    }
  };

  const getEventColor = (event) => {
    switch (event.type) {
      case 'job_started':
      case 'job_resumed':
        return 'text-green-400';
      case 'job_finished':
        return 'text-blue-400';
      case 'job_preempted':
        return 'text-yellow-400';
      case 'context_switch':
        return 'text-purple-400';
      case 'gantt_slice':
        return 'text-gray-500';
      default:
        return 'text-gray-400';
    }
  };

  const formatTimestamp = (tick) => {
    return `[T${String(tick).padStart(4, '0')}]`;
  };

  const shouldShowEvent = (event) => {
    // Filter out too verbose events for terminal view
    return event.type !== 'tick' && event.type !== 'gantt_slice';
  };

  const filteredEvents = events.filter(shouldShowEvent);

  return (
    <div className="bg-gray-900 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
      {/* Terminal Header */}
      <div className="bg-gray-800 px-4 py-2 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-gray-300 text-sm font-mono ml-2">scheduler.log</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-xs font-mono">
            {filteredEvents.length} events
          </span>
          <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="rounded"
            />
            <span className="font-mono">Auto-scroll</span>
          </label>
        </div>
      </div>

      {/* Terminal Content */}
      <div
        ref={terminalRef}
        className="bg-gray-900 p-4 font-mono text-sm h-96 overflow-y-auto scroll-smooth"
        style={{ 
          scrollbarWidth: 'thin',
          scrollbarColor: '#4B5563 #1F2937'
        }}
      >
        {filteredEvents.length === 0 ? (
          <div className="text-gray-500 flex items-center gap-2">
            <span className="animate-pulse">▌</span>
            <span>Waiting for scheduler events...</span>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredEvents.map((event, index) => (
              <div
                key={index}
                className="flex items-start gap-2 hover:bg-gray-800/50 px-2 py-1 rounded transition-colors"
              >
                <span className="text-gray-500 select-none">
                  {formatTimestamp(event.tick || 0)}
                </span>
                <span className={`${getEventColor(event)} flex-shrink-0 w-4`}>
                  {getEventSymbol(event)}
                </span>
                <span className="text-gray-300 flex-1">
                  {formatEventDescription(event)}
                </span>
                {event.pid !== undefined && event.pid !== -1 && (
                  <span className="text-blue-400 text-xs bg-blue-900/30 px-2 py-0.5 rounded">
                    P{event.pid}
                  </span>
                )}
              </div>
            ))}
            {autoScroll && (
              <div className="text-gray-600 flex items-center gap-2 pt-2">
                <span className="animate-pulse">▌</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Terminal Footer */}
      <div className="bg-gray-800 px-4 py-2 border-t border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs font-mono text-gray-400">
          <span className="flex items-center gap-1">
            <span className="text-green-400">▶</span> Start/Resume
          </span>
          <span className="flex items-center gap-1">
            <span className="text-yellow-400">⏸</span> Preempt
          </span>
          <span className="flex items-center gap-1">
            <span className="text-blue-400">✓</span> Finish
          </span>
          <span className="flex items-center gap-1">
            <span className="text-purple-400">⇄</span> Context Switch
          </span>
        </div>
      </div>
    </div>
  );
}
