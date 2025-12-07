/**
 * Custom hook for WebSocket connection and event handling
 * Manages real-time event streaming from scheduler
 */

import { useEffect, useRef, useCallback } from 'react';
import wsClient from '../utils/ws';

/**
 * Hook to manage WebSocket connection and subscribe to events
 * @param {string} runId - Optional run ID to filter events
 * @param {function} onEvent - Callback for 'event' type messages
 * @param {function} onStderr - Callback for 'stderr' type messages
 * @param {function} onRunFinished - Callback for 'run_finished' type messages
 * @param {function} onRunKilled - Callback for 'run_killed' type messages
 * @param {function} onConnection - Callback for connection status changes
 */
export function useWebSocket({
  runId = null,
  onEvent = null,
  onStderr = null,
  onRunFinished = null,
  onRunKilled = null,
  onConnection = null
} = {}) {
  const unsubscribersRef = useRef([]);

  // Memoize callbacks to prevent unnecessary re-subscriptions
  const stableOnEvent = useCallback(onEvent || (() => {}), []);
  const stableOnStderr = useCallback(onStderr || (() => {}), []);
  const stableOnRunFinished = useCallback(onRunFinished || (() => {}), []);
  const stableOnRunKilled = useCallback(onRunKilled || (() => {}), []);
  const stableOnConnection = useCallback(onConnection || (() => {}), []);

  useEffect(() => {
    // Connect to WebSocket
    wsClient.connect();

    // Subscribe to events
    const unsubscribers = [];

    if (runId) {
      // Subscribe to run-specific events
      unsubscribers.push(
        wsClient.subscribe(`run:${runId}`, (message) => {
          switch (message.type) {
            case 'event':
              stableOnEvent(message.event);
              break;
            case 'stderr':
              stableOnStderr(message.message);
              break;
            case 'run_finished':
              stableOnRunFinished(message);
              break;
            case 'run_killed':
              stableOnRunKilled(message);
              break;
            default:
              break;
          }
        })
      );
    } else {
      // Subscribe to all events
      if (stableOnEvent) {
        unsubscribers.push(
          wsClient.subscribe('event', (message) => stableOnEvent(message.event))
        );
      }
      if (stableOnStderr) {
        unsubscribers.push(
          wsClient.subscribe('stderr', (message) => stableOnStderr(message.message))
        );
      }
      if (stableOnRunFinished) {
        unsubscribers.push(
          wsClient.subscribe('run_finished', stableOnRunFinished)
        );
      }
      if (stableOnRunKilled) {
        unsubscribers.push(
          wsClient.subscribe('run_killed', stableOnRunKilled)
        );
      }
    }

    // Subscribe to connection status
    if (stableOnConnection) {
      unsubscribers.push(
        wsClient.subscribe('connection', stableOnConnection)
      );
    }

    unsubscribersRef.current = unsubscribers;

    // Cleanup on unmount
    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [runId, stableOnEvent, stableOnStderr, stableOnRunFinished, stableOnRunKilled, stableOnConnection]);

  return {
    isConnected: wsClient.isConnected(),
    disconnect: () => wsClient.disconnect(),
    send: (message) => wsClient.send(message)
  };
}

export default useWebSocket;
