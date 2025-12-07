// frontend-react/src/components/RunsList.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export default function RunsList({ onSelectRun }) {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRuns = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BACKEND}/runs`);
      setRuns(res.data || []);
    } catch (err) {
      console.error('fetch runs error', err);
      setRuns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRuns();
    // refresh every 10s so list updates after new runs
    const id = setInterval(fetchRuns, 10000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="bg-white p-3 rounded shadow">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium">Runs</h3>
        <button className="text-xs underline" onClick={fetchRuns} disabled={loading}>{loading ? '...' : 'Refresh'}</button>
      </div>

      {runs.length === 0 ? (
        <div className="text-slate-500 text-sm">No runs found</div>
      ) : (
        <ol className="space-y-2 text-sm">
          {runs.map(r => (
            <li key={r.id} className="flex items-center justify-between p-2 border rounded">
              <div>
                <div className="font-medium">Run #{r.id} — {r.mode.toUpperCase()}</div>
                <div className="text-xs text-slate-500">{r.jobs.length} jobs • PID {r.pid ?? '-'}</div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className="text-xs text-slate-500">{r.started_at ? new Date(Math.round(r.started_at * 1000)).toLocaleString() : ''}</div>
                <div className="flex gap-2">
                  <button className="px-2 py-1 text-xs bg-blue-600 text-white rounded" onClick={() => onSelectRun(r.id)}>Replay</button>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
