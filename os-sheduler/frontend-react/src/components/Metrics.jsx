// frontend-react/src/components/Metrics.jsx
import React, { useMemo } from 'react';

/*
Metrics computed per job from scheduler events:
- arrival: first event timestamp known for that job (running/stopped/finished/log)
- start_time: timestamp of first "running" event (response measured from arrival to this)
- finish_time: timestamp of "finished" event (turnaround uses this)
- burst: total accumulated time in running segments (sum of running->stopped/finished durations)
- waiting_time: turnaround - burst
- turnaround: finish_time - arrival (or now-arrival if not finished)
- response_time: start_time - arrival (or null if not started yet)
*/

function now() {
  return Date.now() / 1000;
}

export default function Metrics({ events = [] }) {
  const { jobs, aggregates } = useMemo(() => {
    // Sort events ascending time
    const evs = [...events].sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

    const info = {}; // job_id -> { arrival, start_time, finish_time, burstSegments: [{s,e}], curStart }
    for (const ev of evs) {
      if (typeof ev.job_id === 'undefined') continue;
      const jid = ev.job_id;
      if (!info[jid]) info[jid] = { job_id: jid, arrival: ev.timestamp || now(), start_time: null, finish_time: null, burstSegments: [], curStart: null, lastSeen: ev.timestamp || now(), pid: ev.pid || null };
      const obj = info[jid];
      obj.lastSeen = ev.timestamp || obj.lastSeen;

      if (ev.type === 'running') {
        // mark start of a running segment
        if (obj.curStart == null) {
          obj.curStart = ev.timestamp || now();
        }
        if (obj.start_time == null) obj.start_time = ev.timestamp || now();
      } else if (ev.type === 'stopped') {
        // close current running segment (if present)
        if (obj.curStart != null) {
          const s = obj.curStart;
          const e = ev.timestamp || now();
          obj.burstSegments.push({ start: s, end: e });
          obj.curStart = null;
        }
        // keep arrival if not set (keep earliest)
        if (!obj.arrival) obj.arrival = ev.timestamp || obj.arrival;
      } else if (ev.type === 'finished') {
        // close running segment and mark finish_time
        if (obj.curStart != null) {
          const s = obj.curStart;
          const e = ev.timestamp || now();
          obj.burstSegments.push({ start: s, end: e });
          obj.curStart = null;
        }
        obj.finish_time = ev.timestamp || now();
      } else {
        // other events: treat earliest timestamp as arrival
        if (!obj.arrival) obj.arrival = ev.timestamp || obj.arrival;
      }
    }

    // finalize: for any job still running (curStart not null), add segment up to now
    const tnow = now();
    for (const jidStr of Object.keys(info)) {
      const o = info[jidStr];
      if (o.curStart != null) {
        o.burstSegments.push({ start: o.curStart, end: tnow });
        // do NOT clear curStart (not needed)
      }
      // Ensure arrival defined
      if (!o.arrival) o.arrival = o.burstSegments.length ? o.burstSegments[0].start : (o.lastSeen || tnow);
    }

    // compute numeric metrics
    const jobsList = Object.values(info).map(o => {
      const burst = o.burstSegments.reduce((acc, s) => acc + Math.max(0, (s.end - s.start)), 0);
      const arrival = o.arrival || tnow;
      const start_time = o.start_time || null;
      const finish_time = o.finish_time || null;
      const turnaround = (finish_time ? (finish_time - arrival) : (tnow - arrival));
      const response = start_time ? (start_time - arrival) : null;
      const waiting = turnaround - burst;
      return {
        job_id: o.job_id,
        pid: o.pid,
        arrival,
        start_time,
        finish_time,
        burst,
        turnaround,
        waiting,
        response,
      };
    });

    // aggregates: average waiting, turnaround, response (for finished jobs or include running? we'll compute both)
    const finished = jobsList.filter(j => j.finish_time != null);
    const avg = (arr) => (arr.length ? arr.reduce((a,b) => a + b, 0) / arr.length : 0);
    const aggregates = {
      avg_waiting_all: avg(jobsList.map(j => j.waiting)),
      avg_turnaround_all: avg(jobsList.map(j => j.turnaround)),
      avg_response_all: avg(jobsList.filter(j => j.response != null).map(j => j.response)),
      avg_waiting_finished: avg(finished.map(j => j.waiting)),
      avg_turnaround_finished: avg(finished.map(j => j.turnaround)),
      count_total: jobsList.length,
      count_finished: finished.length,
    };

    // sort jobs by job_id asc
    jobsList.sort((a,b) => a.job_id - b.job_id);

    return { jobs: jobsList, aggregates };
  }, [events]);

  return (
    <div className="bg-white p-3 rounded shadow">
      <h3 className="font-medium mb-2">Per-Job Metrics</h3>

      {jobs.length === 0 ? (
        <div className="text-sm text-slate-500">No job data yet</div>
      ) : (
        <>
          <div className="overflow-auto max-h-64">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-500">
                  <th className="text-left py-1">Job</th>
                  <th className="text-right py-1">PID</th>
                  <th className="text-right py-1">Arrival</th>
                  <th className="text-right py-1">Start</th>
                  <th className="text-right py-1">Finish</th>
                  <th className="text-right py-1">Burst(s)</th>
                  <th className="text-right py-1">Waiting(s)</th>
                  <th className="text-right py-1">Turnaround(s)</th>
                  <th className="text-right py-1">Response(s)</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map(j => (
                  <tr key={j.job_id} className="border-t">
                    <td className="py-1">{j.job_id}</td>
                    <td className="py-1 text-right">{j.pid ?? '-'}</td>
                    <td className="py-1 text-right">{j.arrival ? new Date(Math.round(j.arrival * 1000)).toLocaleTimeString() : '-'}</td>
                    <td className="py-1 text-right">{j.start_time ? new Date(Math.round(j.start_time * 1000)).toLocaleTimeString() : '-'}</td>
                    <td className="py-1 text-right">{j.finish_time ? new Date(Math.round(j.finish_time * 1000)).toLocaleTimeString() : (j.start_time ? 'running' : '-')}</td>
                    <td className="py-1 text-right">{j.burst.toFixed(3)}</td>
                    <td className="py-1 text-right">{j.waiting.toFixed(3)}</td>
                    <td className="py-1 text-right">{j.turnaround.toFixed(3)}</td>
                    <td className="py-1 text-right">{j.response != null ? j.response.toFixed(3) : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 text-sm text-slate-600">
            <div>Jobs total: <strong>{aggregates.count_total}</strong> — Finished: <strong>{aggregates.count_finished}</strong></div>
            <div>Avg waiting (all): <strong>{aggregates.avg_waiting_all.toFixed(3)}s</strong>, Avg turnaround (all): <strong>{aggregates.avg_turnaround_all.toFixed(3)}s</strong></div>
            <div>Avg response (started): <strong>{aggregates.avg_response_all.toFixed(3)}s</strong></div>
            <div>Avg waiting (finished): <strong>{aggregates.avg_waiting_finished.toFixed(3)}s</strong>, Avg turnaround (finished): <strong>{aggregates.avg_turnaround_finished.toFixed(3)}s</strong></div>
          </div>
        </>
      )}
    </div>
  );
}
