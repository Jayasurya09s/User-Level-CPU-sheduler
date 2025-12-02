import React, { useMemo, useState } from 'react';

/*
  Props:
    - events: array of event objects (from backend), each should have .type, .job_id, .timestamp, optional reason
    - heightPerRow: number (px)
    - maxWidth: number (px) optional
*/
export default function Gantt({ events = [], heightPerRow = 28, maxWidth = 900 }) {
  // Build segments from events
  const { segments, jobIds, tmin, tmax } = useMemo(() => {
    const curStart = {};
    const out = [];
    let tmin = Infinity, tmax = -Infinity;
    const seenJobs = new Set();

    // sort by timestamp ascending (stable)
    const evs = [...events].sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

    for (const ev of evs) {
      if (typeof ev.job_id === 'undefined') continue;
      seenJobs.add(ev.job_id);
      const ts = Number(ev.timestamp || Date.now() / 1000);

      if (ev.type === 'running') {
        // start segment
        curStart[ev.job_id] = ts;
        if (ts < tmin) tmin = ts;
        if (ts > tmax) tmax = ts;
      } else if (ev.type === 'stopped' || ev.type === 'finished') {
        const s = curStart[ev.job_id];
        if (typeof s === 'number') {
          const seg = { job_id: ev.job_id, start: s, end: ts, type: ev.type, reason: ev.reason || null };
          out.push(seg);
          delete curStart[ev.job_id];
          if (s < tmin) tmin = s;
          if (ts > tmax) tmax = ts;
        } else {
          // If no prior running event, we can optionally create a zero-length or ignore
        }
      }
    }

    // Also, any still-running segments: end = now
    const now = Date.now() / 1000;
    for (const jidStr of Object.keys(curStart)) {
      const jid = Number(jidStr);
      const s = curStart[jid];
      const seg = { job_id: jid, start: s, end: now, type: 'running' };
      out.push(seg);
      if (s < tmin) tmin = s;
      if (now > tmax) tmax = now;
    }

    const jobIds = Array.from(seenJobs).sort((a,b) => a - b);
    if (!isFinite(tmin)) tmin = Date.now() / 1000 - 5;
    if (!isFinite(tmax)) tmax = Date.now() / 1000;

    // ensure small padding
    if (tmax - tmin < 0.001) tmax = tmin + 1;

    return { segments: out, jobIds, tmin, tmax };
  }, [events]);

  // layout
  const rows = jobIds.length || 1;
  const height = rows * heightPerRow + 40;
  const paddingLeft = 100;
  const chartWidth = Math.min(maxWidth, Math.max(400, window.innerWidth - 200));
  const innerWidth = chartWidth - paddingLeft - 20;

  const scale = (t) => {
    return paddingLeft + ((t - tmin) / (tmax - tmin)) * innerWidth;
  };

  // deterministic color by job id
  const colorFor = (job_id) => {
    const hue = (job_id * 47) % 360;
    return `hsl(${hue} 70% 55%)`;
  };

  const [hover, setHover] = useState(null);

  return (
    <div className="gantt-card" style={{ background: 'white', padding: 12, borderRadius: 8, boxShadow: '0 4px 14px rgba(2,6,23,0.06)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <strong>Gantt (timeline)</strong>
        <div style={{ fontSize: 12, color: '#666' }}>
          {new Date(Math.round(tmin * 1000)).toLocaleTimeString()} — {new Date(Math.round(tmax * 1000)).toLocaleTimeString()}
        </div>
      </div>

      <svg width={chartWidth} height={height} style={{ display: 'block' }}>
        {/* job labels */}
        {jobIds.map((jid, i) => {
          const y = 20 + i * heightPerRow;
          return (
            <g key={'label-' + jid}>
              <text x={8} y={y + 12} fontSize={12} fill="#333">Job {jid}</text>
            </g>
          );
        })}

        {/* time axis */}
        <line x1={paddingLeft} x2={paddingLeft + innerWidth} y1={10 + rows * heightPerRow + 6} y2={10 + rows * heightPerRow + 6} stroke="#e6e6e6" strokeWidth="1" />

        {/* segments */}
        {segments.map((s, i) => {
          const rowIndex = jobIds.indexOf(s.job_id);
          const y = 20 + rowIndex * heightPerRow;
          const x1 = scale(s.start);
          const x2 = scale(s.end);
          const w = Math.max(2, x2 - x1);
          const color = colorFor(s.job_id);
          return (
            <g key={i}>
              <rect
                x={x1}
                y={y}
                width={w}
                height={heightPerRow - 8}
                rx={4}
                ry={4}
                fill={color}
                opacity={s.type === 'running' ? 0.95 : 0.85}
                onMouseEnter={() => setHover({ seg: s, x: x1, y })}
                onMouseLeave={() => setHover(null)}
              />
              {/* thin border */}
              <rect x={x1} y={y} width={w} height={heightPerRow - 8} rx={4} ry={4} fill="none" stroke="rgba(0,0,0,0.06)" />
            </g>
          );
        })}

        {/* hover tooltip */}
        {hover && (
          <foreignObject x={Math.min(hover.x, chartWidth - 200)} y={hover.y - 8} width={200} height={80}>
            <div style={{ background: 'white', border: '1px solid #e6e6e6', padding: 6, borderRadius: 6, fontSize: 12 }}>
              <div><strong>Job {hover.seg.job_id}</strong> ({hover.seg.type})</div>
              <div>Start: {new Date(Math.round(hover.seg.start * 1000)).toLocaleTimeString()}</div>
              <div>End: {new Date(Math.round(hover.seg.end * 1000)).toLocaleTimeString()}</div>
            </div>
          </foreignObject>
        )}
      </svg>
    </div>
  );
}
