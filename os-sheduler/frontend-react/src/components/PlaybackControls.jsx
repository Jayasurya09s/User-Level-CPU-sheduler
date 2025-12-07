/**
 * PlaybackControls Component
 * Controls for playing, pausing, stepping through simulation
 */

import React from 'react';

export default function PlaybackControls({
  isPlaying,
  currentTick,
  maxTick,
  speed,
  loop,
  progress,
  onTogglePlay,
  onStop,
  onStepForward,
  onStepBackward,
  onJumpToTick,
  onSetSpeed,
  onToggleLoop
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Playback Controls
      </h3>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>Tick: {currentTick}</span>
          <span>Max: {maxTick}</span>
        </div>
        <input
          type="range"
          min="0"
          max={maxTick}
          value={currentTick}
          onChange={(e) => onJumpToTick(Number(e.target.value))}
          className="w-full"
          aria-label="Timeline scrubber"
        />
        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Progress: {progress.toFixed(1)}%
        </div>
      </div>

      {/* Main Controls */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <button
          onClick={onStepBackward}
          disabled={currentTick === 0}
          className="px-3 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
          aria-label="Step backward"
        >
          ⏮
        </button>

        <button
          onClick={onTogglePlay}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? '⏸' : '▶️'}
        </button>

        <button
          onClick={onStepForward}
          disabled={currentTick >= maxTick}
          className="px-3 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
          aria-label="Step forward"
        >
          ⏭
        </button>

        <button
          onClick={onStop}
          className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          aria-label="Stop"
        >
          ⏹
        </button>
      </div>

      {/* Speed and Loop */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-400 mr-2">Speed:</label>
          {[0.5, 1, 2].map(s => (
            <button
              key={s}
              onClick={() => onSetSpeed(s)}
              className={`px-2 py-1 text-sm rounded mr-1 ${
                speed === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={loop}
            onChange={onToggleLoop}
            className="rounded"
          />
          <span className="text-gray-700 dark:text-gray-300">Loop</span>
        </label>
      </div>

      {/* Keyboard Hints */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
        <div className="font-medium mb-1">Keyboard Shortcuts:</div>
        <div>Space: Play/Pause • ← →: Step • Scroll: Zoom Gantt</div>
      </div>
    </div>
  );
}
