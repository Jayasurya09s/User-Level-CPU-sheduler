/**
 * Custom hook for playback controls
 * Manages play/pause, speed, stepping through events
 */

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook for managing playback of scheduler events
 * @param {Array} events - Array of all events
 * @param {number} maxTick - Maximum tick value
 */
export function usePlayback(events = [], maxTick = 0) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTick, setCurrentTick] = useState(0);
  const [speed, setSpeed] = useState(1); // 0.5x, 1x, 2x
  const [loop, setLoop] = useState(false);
  
  const intervalRef = useRef(null);
  const lastTickRef = useRef(0);

  // Calculate effective max tick
  const effectiveMaxTick = maxTick || Math.max(...events.map(e => e.tick || 0), 0);

  // Play/Pause toggle
  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  // Stop playback
  const stop = useCallback(() => {
    setIsPlaying(false);
    setCurrentTick(0);
  }, []);

  // Step forward
  const stepForward = useCallback(() => {
    setCurrentTick(prev => {
      const next = prev + 1;
      if (next > effectiveMaxTick) {
        return loop ? 0 : effectiveMaxTick;
      }
      return next;
    });
  }, [effectiveMaxTick, loop]);

  // Step backward
  const stepBackward = useCallback(() => {
    setCurrentTick(prev => Math.max(0, prev - 1));
  }, []);

  // Jump to tick
  const jumpToTick = useCallback((tick) => {
    const clampedTick = Math.max(0, Math.min(tick, effectiveMaxTick));
    setCurrentTick(clampedTick);
  }, [effectiveMaxTick]);

  // Set playback speed
  const setPlaybackSpeed = useCallback((newSpeed) => {
    setSpeed(newSpeed);
  }, []);

  // Toggle loop
  const toggleLoop = useCallback(() => {
    setLoop(prev => !prev);
  }, []);

  // Playback effect
  useEffect(() => {
    if (isPlaying) {
      const interval = 1000 / speed; // Milliseconds per tick
      
      intervalRef.current = setInterval(() => {
        setCurrentTick(prev => {
          const next = prev + 1;
          
          if (next > effectiveMaxTick) {
            if (loop) {
              return 0;
            } else {
              setIsPlaying(false);
              return effectiveMaxTick;
            }
          }
          
          return next;
        });
      }, interval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, speed, loop, effectiveMaxTick]);

  // Get events up to current tick
  const getEventsUpToTick = useCallback((tick) => {
    return events.filter(e => (e.tick || 0) <= tick);
  }, [events]);

  // Get current events
  const currentEvents = getEventsUpToTick(currentTick);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is typing in input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowRight':
          e.preventDefault();
          stepForward();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          stepBackward();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, stepForward, stepBackward]);

  return {
    isPlaying,
    currentTick,
    speed,
    loop,
    maxTick: effectiveMaxTick,
    currentEvents,
    togglePlay,
    stop,
    stepForward,
    stepBackward,
    jumpToTick,
    setSpeed: setPlaybackSpeed,
    toggleLoop,
    progress: effectiveMaxTick > 0 ? (currentTick / effectiveMaxTick) * 100 : 0
  };
}

export default usePlayback;
