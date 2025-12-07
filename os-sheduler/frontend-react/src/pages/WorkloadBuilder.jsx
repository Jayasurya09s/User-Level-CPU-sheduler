import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
const API_BASE = (process.env.REACT_APP_API_HOST || 'http://localhost:3001');

export default function WorkloadBuilder() {
  const [payloadText, setPayloadText] = useState(`[
  {"arrival":0,"burst":8,"priority":1},
  {"arrival":1,"burst":4,"priority":2},
  {"arrival":2,"burst":9,"priority":1}
]`);
  const [file, setFile] = useState(null);
  const [algo, setAlgo] = useState('fcfs');
  const [args, setArgs] = useState('');
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  function loadBigSample() {
    setPayloadText(`[
  { "arrival": 0, "burst": 8, "priority": 1 },
  { "arrival": 1, "burst": 4, "priority": 2 },
  { "arrival": 2, "burst": 9, "priority": 1 },
  { "arrival": 3, "burst": 5, "priority": 3 },
  { "arrival": 4, "burst": 2, "priority": 2 },
  { "arrival": 6, "burst": 1, "priority": 3 },
  { "arrival": 8, "burst": 7, "priority": 1 },
  { "arrival": 10, "burst": 3, "priority": 2 },
  { "arrival": 12, "burst": 6, "priority": 3 },
  { "arrival": 14, "burst": 4, "priority": 1 }
]`);
  }

  function makeRandom(n = 8) {
    const arr = [];
    let t = 0;
    for (let i = 0; i < n; i++) {
      const burst = Math.floor(Math.random() * 8) + 1;
      arr.push({ arrival: t, burst, priority: Math.floor(Math.random() * 3) + 1 });
      t += Math.floor(Math.random() * 3);
    }
    setPayloadText(JSON.stringify(arr, null, 2));
  }

  async function startRun(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    try {
      if (file) {
        const form = new FormData();
        form.append('file', file);
        form.append('algorithm', algo);
        if (args) form.append('args', args);
        const res = await axios.post(`${API_BASE}/runs/start`, form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        navigate(`/run/${res.data.run_id}`);
      } else {
        // send algorithm and attach workload JSON in meta.workload_json
        const body = { algorithm: algo, args: args ? args.split(/\s+/) : [], meta: { workload_json: payloadText } };
        const res = await axios.post(`${API_BASE}/runs/start`, body, { headers: { 'Content-Type': 'application/json' } });
        navigate(`/run/${res.data.run_id}`);
      }
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.error || err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl mb-4">Workload Builder</h2>

      <div className="mb-4">
        <label className="block mb-1">Algorithm</label>
        <select value={algo} onChange={e => setAlgo(e.target.value)}>
          <option value="fcfs">FCFS</option>
          <option value="sjf">SJF</option>
          <option value="srtf">SRTF</option>
          <option value="priority">PRIORITY</option>
          <option value="priority_p">PRIORITY (preempt)</option>
          <option value="rr">RR</option>
          <option value="mlfq">MLFQ</option>
        </select>

        <div className="mt-2">
          <label>Algorithm args (space separated, e.g. "rr 2")</label>
          <input value={args} onChange={e=>setArgs(e.target.value)} className="ml-2"/>
        </div>
      </div>

      <form onSubmit={startRun}>
        <div className="mb-4">
          <label className="block mb-1">Paste workload JSON</label>
          <textarea value={payloadText} onChange={e=>setPayloadText(e.target.value)} rows={10} style={{ width: '100%' }} />
        </div>

        <div className="mb-4">
          <label className="block mb-1">Or upload JSON file</label>
          <input type="file" accept=".json" onChange={e=>setFile(e.target.files?.[0] || null)} />
          {file && <div className="mt-1">Picked: {file.name}</div>}
        </div>

        <div className="flex gap-2 mb-4">
          <button type="button" onClick={loadBigSample}>Load Big Sample</button>
          <button type="button" onClick={()=>makeRandom(6)}>Random Workload</button>
          <button type="submit" disabled={busy}>{busy ? 'Starting...' : 'Start Simulation'}</button>
        </div>

        {error && <div style={{ color:'red' }}>{error}</div>}
      </form>
    </div>
  );
}
