import React, { useMemo } from 'react';

/*
  Props:
    - events: array of events
*/
export default function ReadyQueue({ events = [] }) {
  const { readyList } = useMemo(() => {
    const state = {}; // job_id -> state { state, lastTs, pid }
    const evs = [...events].sort((a,b) => (a.timestamp || 0) - (b.timestamp || 0));
    for (const ev of evs) {
      if (typeof ev.job_id === 'undefined') continue;
      const jid = ev.job_id;
      state[jid] = state[jid] || { state: 'NEW', lastTs: 0, pid: ev.pid || null };
      state[jid].pid = ev.pid || state[jid].pid;
      state[jid].lastTs = ev.timestamp || state[jid].lastTs;
      if (ev.type === 'running') state[jid].state = 'RUNNING';
      else if (ev.type === 'stopped') state[jid].state = 'READY';
      else if (ev.type === 'finished') state[jid].state = 'FINISHED';
    }
    // build ready list, sorted by lastTs (older first)
    const readyList = Object.entries(state)
      .filter(([jid, s]) => s.state === 'READY')
      .map(([jid,s]) => ({ job_id: Number(jid), ...s }))
      .sort((a,b) => (a.lastTs || 0) - (b.lastTs || 0));
    return { readyList };
  }, [events]);

  return (
    <div className="bg-white p-3 rounded shadow">
      <h3 className="font-medium mb-2">Ready Queue</h3>
      {readyList.length === 0 ? (
        <div className="text-slate-500 text-sm">No jobs in ready queue</div>
      ) : (
        <ol className="text-sm space-y-1">
          {readyList.map(r => (
            <li key={r.job_id} className="flex items-center justify-between py-1 px-2 border rounded">
              <div>Job {r.job_id} {r.pid ? <span className="text-xs text-slate-400">pid {r.pid}</span> : null}</div>
              <div className="text-xs text-slate-500">{new Date(Math.round((r.lastTs||0) * 1000)).toLocaleTimeString()}</div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
