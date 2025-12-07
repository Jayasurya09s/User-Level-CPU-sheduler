// frontend-react/src/components/ReplayControls.jsx
import React from 'react';

export default function ReplayControls({
  playing,
  onPlayPause,
  onStop,
  speed,
  setSpeed,
  position,
  duration,
}) {
  const pct = duration > 0 ? Math.min(100, Math.max(0, (position / duration) * 100)) : 0;
  const pretty = (s) => {
    if (s == null) return '-';
    return `${s.toFixed(2)}s`;
  };

  return (
    <div className="bg-white p-3 rounded shadow flex items-center gap-4">
      <div className="flex items-center gap-2">
        <button className="px-3 py-1 rounded bg-blue-600 text-white" onClick={onPlayPause}>{playing ? 'Pause' : 'Play'}</button>
        <button className="px-3 py-1 rounded bg-gray-200" onClick={onStop}>Stop</button>
      </div>

      <div style={{ minWidth: 220 }}>
        <div className="w-full h-2 bg-slate-200 rounded overflow-hidden">
          <div style={{ width: `${pct}%` }} className="h-2 bg-blue-500" />
        </div>
        <div className="text-xs text-slate-500 flex justify-between mt-1">
          <div>{pretty(position)}</div>
          <div>{pretty(duration)}</div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs text-slate-500">Speed</label>
        <select value={speed} onChange={(e)=>setSpeed(Number(e.target.value))} className="p-1 text-xs border rounded">
          <option value={0.25}>0.25x</option>
          <option value={0.5}>0.5x</option>
          <option value={1}>1x</option>
          <option value={2}>2x</option>
          <option value={4}>4x</option>
        </select>
      </div>
    </div>
  );
}
