// frontend-react/src/App.jsx
import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

import Gantt from './components/Gantt';
import ReadyQueue from './components/ReadyQueue';
import './index.css';
import Metrics from './components/Metrics';


const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

function fmtTs(ts) {
  if (!ts) return '-';
  const d = new Date(Math.round(ts * 1000));
  return d.toLocaleTimeString();
}

export default function App() {
  const [connected, setConnected] = useState(false);
  const [events, setEvents] = useState([]);
  const [running, setRunning] = useState(null);
  const [logs, setLogs] = useState([]);
  const [statusInfo, setStatusInfo] = useState(null);

  // form state
  const [mode, setMode] = useState('fcfs');
  const [quantum, setQuantum] = useState(200);
  const [jobsText, setJobsText] = useState('../../scheduler-c/bin/busy 2\n../../scheduler-c/bin/busy 1');

  const socketRef = useRef(null);

  useEffect(() => {
    // load initial status + recent events
    axios.get(`${BACKEND}/status`).then(res => {
      const evs = res.data.recentEvents || [];
      setEvents(evs.slice(-200));
      const lastRunning = [...evs].reverse().find(e => e.type === 'running');
      setRunning(lastRunning || null);
      setLogs(evs.filter(e => e.type === 'log').map(l => l.text));
      setStatusInfo({ running: res.data.running, pid: res.data.pid });
    }).catch(() => {
      // ignore if backend not available yet
    });

    // connect socket
    const socket = io(BACKEND, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('scheduler:event', ev => {
      setEvents(prev => {
        const next = [...prev, ev].slice(-1000);
        return next;
      });

      if (ev.type === 'running') {
        setRunning(ev);
        setStatusInfo(s => ({ ...(s||{}), running: true }));
      }
      if (ev.type === 'finished' && running && ev.job_id === running.job_id) {
        setRunning(null);
        setStatusInfo(s => ({ ...(s||{}), running: false }));
      }
      if (ev.type === 'log') {
        setLogs(prev => {
          const next = [...prev, ev.text].slice(-1000);
          return next;
        });
      }
    });

    socket.on('recentEvents', (list) => {
      setEvents(list || []);
    });

    return () => {
      socket.disconnect();
    };
  }, [running]);

  // Start run via backend /start
  const startRun = async () => {
    const jobs = jobsText.split('\n').map(s => s.trim()).filter(Boolean);
    if (jobs.length === 0) {
      alert('Add at least one job command (one per line).');
      return;
    }
    try {
      const body = mode === 'rr' ? { mode, quantum: Number(quantum), jobs } : { mode, jobs };
      const res = await axios.post(`${BACKEND}/start`, body);
      setStatusInfo({ running: true, pid: res.data.pid });
    } catch (err) {
      console.error(err);
      alert('Start failed: ' + (err?.response?.data?.error || err.message));
    }
  };

  // Stop run via backend /stop
  const stopRun = async () => {
    try {
      const res = await axios.post(`${BACKEND}/stop`);
      setStatusInfo({ running: false, pid: null });
      console.log('stop response', res.data);
    } catch (err) {
      console.error(err);
      alert('Stop failed: ' + (err?.response?.data?.error || err.message));
    }
  };

  return (
    <div className="min-h-screen p-6 bg-slate-100 text-slate-900">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">OS Scheduler Visualizer</h1>
        <div className="text-sm">
          Backend:
          <span className={`px-2 py-1 ml-2 rounded ${connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {connected ? 'connected' : 'disconnected'}
          </span>
          <div className="mt-1 text-xs">Status: {statusInfo?.running ? `running (pid ${statusInfo.pid})` : 'idle'}</div>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-6">
        {/* Controls + Now Running + ReadyQueue */}
        <div className="col-span-1 space-y-4">
          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-medium mb-2">Start / Stop</h2>

            <label className="block text-xs text-slate-500">Scheduler Mode</label>
            <select className="w-full p-2 border rounded mb-2" value={mode} onChange={e => setMode(e.target.value)}>
              <option value="fcfs">FCFS</option>
              <option value="rr">RR (Round Robin)</option>
            </select>

            {mode === 'rr' && (
              <>
                <label className="block text-xs text-slate-500">Quantum (ms)</label>
                <input type="number" className="w-full p-2 border rounded mb-2" value={quantum} onChange={e => setQuantum(e.target.value)} />
              </>
            )}

            <label className="block text-xs text-slate-500">Jobs (one per line)</label>
            <textarea rows={4} className="w-full p-2 border rounded mb-2 font-mono text-sm" value={jobsText} onChange={e => setJobsText(e.target.value)} />

            <div className="flex gap-2">
              <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={startRun}>Start</button>
              <button className="px-3 py-2 bg-red-600 text-white rounded" onClick={stopRun}>Stop</button>
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-medium mb-2">Now Running</h2>
            {running ? (
              <div>
                <div className="text-sm text-slate-500">Job ID</div>
                <div className="text-xl font-bold">{running.job_id}</div>
                <div className="mt-2 text-sm text-slate-500">PID</div>
                <div className="text-lg">{running.pid}</div>
                <div className="mt-2 text-sm text-slate-500">Started</div>
                <div className="text-sm">{fmtTs(running.timestamp)}</div>
              </div>
            ) : (
              <div className="text-slate-500">No job running</div>
            )}
          </div>

          <ReadyQueue events={events} />
        </div>

        {/* Gantt + Events */}
        <div className="col-span-2 space-y-4">
          <div className="bg-white p-4 rounded shadow">
            <Gantt events={events} />
          </div>
            {/* insert metrics here */}
          <div className="bg-white p-4 rounded shadow">
            <Metrics events={events} />
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-medium mb-3">Recent Events</h2>
            <div className="max-h-64 overflow-auto text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-500 text-xs">
                    <th className="w-1/6">Time</th>
                    <th className="w-1/6">Type</th>
                    <th className="w-4/6">Payload</th>
                  </tr>
                </thead>
                <tbody>
                  {events.slice().reverse().map((e, i) => (
                    <tr key={i} className="border-t">
                      <td className="align-top py-1 text-xs">{fmtTs(e.timestamp)}</td>
                      <td className="align-top py-1 text-xs">{e.type}</td>
                      <td className="align-top py-1 text-xs">
                        <pre className="whitespace-pre-wrap">{JSON.stringify(e, null, 0)}</pre>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-black text-white p-4 rounded shadow">
            <h2 className="font-medium mb-3">Logs</h2>
            <div className="max-h-48 overflow-auto text-xs font-mono">
              {logs.map((l, i) => <div key={i} className="py-0.5 border-b border-white/5">{l}</div>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
