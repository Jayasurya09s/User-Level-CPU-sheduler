// src/pages/RunViewer.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const API = process.env.REACT_APP_API_HOST || "http://localhost:3001";

function humanizeEvent(ev) {
  if (!ev || typeof ev !== "object") return String(ev);

  const type = ev.event || ev.raw || "unknown";
  // Choose important keys to display per event type
  switch (type) {
    case "gantt_slice":
      return `tick ${ev.tick}: PID ${ev.pid} running — remaining=${ev.remaining}${ev.quantum_left !== undefined ? `, quantum_left=${ev.quantum_left}` : ""}${ev.mlfq_level !== undefined ? `, level=${ev.mlfq_level}` : ""}`;
    case "context_switch":
      return `tick ${ev.tick}: context switch -> PID ${ev.pid} (burst=${ev.burst}, remaining=${ev.remaining}, priority=${ev.priority})`;
    case "job_started":
      return `tick ${ev.tick}: job started PID ${ev.pid} (arrival=${ev.arrival}, burst=${ev.burst})`;
    case "job_resumed":
      return `tick ${ev.tick}: job arrived/resumed PID ${ev.pid} (arrival=${ev.arrival})`;
    case "job_finished":
      return `tick ${ev.tick}: job finished PID ${ev.pid} (turnaround finished, remaining=${ev.remaining})`;
    case "job_preempted":
      return `tick ${ev.tick}: job preempted PID ${ev.pid} (reason=${ev.reason || ev.preempted_by || "unknown"})`;
    case "tick":
      return `tick ${ev.tick}`;
    default:
      // fallback — pick a few keys
      const keys = Object.keys(ev).filter(k => k !== "event" && k !== "tick");
      const kv = keys.map(k => `${k}=${JSON.stringify(ev[k])}`).join(", ");
      return `tick ${ev.tick || "?"}: ${type} ${kv}`;
  }
}

function buildGanttFromEvents(events) {
  // We'll derive each process' slices from gantt_slice and job_started/job_finished
  // gather per-pid list of ticks when it ran
  const slicesByPid = new Map();
  events.forEach(e => {
    const ev = e.event || e;
    if (!ev) return;
    if (ev.event === "gantt_slice" && typeof ev.pid !== "undefined") {
      if (!slicesByPid.has(ev.pid)) slicesByPid.set(ev.pid, []);
      // each gantt_slice is a single tick; collect tick
      slicesByPid.get(ev.pid).push(ev.tick);
    } else if (ev.event === "job_started") {
      // ensure pid exists even if no slices recorded
      if (!slicesByPid.has(ev.pid)) slicesByPid.set(ev.pid, []);
    } else if (ev.event === "job_resumed") {
      if (!slicesByPid.has(ev.pid)) slicesByPid.set(ev.pid, []);
    }
  });

  // Convert each pid tick list into contiguous spans [start, end]
  const spansByPid = [];
  let minTick = Infinity, maxTick = 0;
  for (const [pid, ticks] of slicesByPid.entries()) {
    if (!ticks || ticks.length === 0) {
      spansByPid.push({ pid, spans: [] });
      continue;
    }
    const sorted = Array.from(new Set(ticks)).sort((a,b)=>a-b);
    let curStart = sorted[0], curEnd = sorted[0];
    minTick = Math.min(minTick, curStart);
    maxTick = Math.max(maxTick, sorted[sorted.length - 1]);
    for (let i = 1; i < sorted.length; ++i) {
      const t = sorted[i];
      if (t === curEnd + 1) {
        curEnd = t;
      } else {
        spansByPid.push({ pid, span: [curStart, curEnd] });
        curStart = curEnd = t;
      }
      minTick = Math.min(minTick, t);
      maxTick = Math.max(maxTick, t);
    }
    // push final
    spansByPid.push({ pid, span: [curStart, curEnd] });
  }

  // join spans per pid
  const map = new Map();
  spansByPid.forEach(item => {
    const pid = item.pid;
    const span = item.span;
    if (!map.has(pid)) map.set(pid, []);
    map.get(pid).push(span);
  });

  // produce array sorted by pid ascending
  const out = Array.from(map.entries()).sort((a,b)=>a[0]-b[0]).map(([pid, spans]) => ({ pid, spans }));
  // handle case no events: minTick/maxTick fallback
  if (minTick === Infinity) { minTick = 0; maxTick = 0; }

  return { rows: out, minTick, maxTick };
}

export default function RunViewer() {
  const { id } = useParams();
  const [run, setRun] = useState(null);
  const [events, setEvents] = useState([]);
  const wsRef = useRef(null);

  // load run + events once
  useEffect(() => {
    let mounted = true;
    axios.get(`${API}/runs/${id}`).then(r => { if (mounted) setRun(r.data); }).catch(()=>{});
    axios.get(`${API}/runs/${id}/events`).then(r => { if (mounted) setEvents(r.data || []); }).catch(()=>{});

    // set up WS to receive live events
    const wsproto = (API.startsWith("https") ? "wss" : "ws");
    const host = API.replace(/^https?:\/\//, '');
    try {
      const ws = new WebSocket(`${wsproto}://${host}`);
      ws.onmessage = (msg) => {
        try {
          const m = JSON.parse(msg.data);
          if (m.type === "event" && m.run_id === Number(id)) {
            // attach id and tick similar to rest API
            setEvents(prev => [...prev, { id: Date.now(), tick: m.event.tick || null, event: m.event }]);
          }
          if (m.type === "run_finished" && m.run_id === Number(id)) {
            axios.get(`${API}/runs/${id}`).then(r => setRun(r.data));
          }
        } catch (e) {}
      };
      wsRef.current = ws;
    } catch (e) {
      console.warn("ws error", e);
    }

    return () => {
      mounted = false;
      if (wsRef.current) wsRef.current.close();
    };
  }, [id]);

  // produce human events for UI
  const humanEvents = events.map((ev, idx) => {
    const eventObj = ev.event || ev;
    // event tick may be top-level too
    const tick = ev.tick ?? eventObj?.tick ?? null;
    return {
      id: ev.id ?? idx,
      tick,
      type: (eventObj && (eventObj.event || eventObj.raw)) || "raw",
      human: humanizeEvent(eventObj)
    };
  });

  // Gantt data
  const { rows, minTick, maxTick } = buildGanttFromEvents(events);

  // render scale labels
  const ticks = [];
  for (let t = minTick; t <= maxTick; ++t) ticks.push(t);

  return (
    <div className="p-6">
      <h2 className="text-2xl mb-3">Run {id}</h2>

      {run && (
        <div className="mb-4">
          <div className="mb-1">Algorithm: <strong>{run.algorithm}</strong> &nbsp;|&nbsp; Status: <strong>{run.status}</strong></div>
          {run.summary_json && <pre style={{ maxWidth: 900, overflowX: "auto", background: "#f1f5f9", padding: 8 }}>{JSON.stringify(run.summary_json, null, 2)}</pre>}
        </div>
      )}

      {/* GANTT */}
      <div style={{ maxWidth: 1100, marginTop: 8 }}>
        <h3 className="text-lg mb-2">Gantt chart</h3>

        <div className="gantt-frame" style={{ border: "1px solid #e2e8f0", padding: 8, background: "#ffffff" }}>
          {/* Timeline labels (top) */}
          <div className="gantt-timeline" style={{ position: "relative", height: 28, marginBottom: 6 }}>
            <div style={{ position: "absolute", left: 0, top: 0, right: 0, bottom: 0 }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{ width: 120, textAlign: "left", fontSize: 12, color: "#374151" }}>PID / Process</div>
                <div style={{ flex: 1, position: "relative", height: 28 }}>
                  {ticks.map(t => {
                    const pct = ((t - minTick) / Math.max(1, maxTick - minTick)) * 100;
                    return <div key={t} style={{ position: "absolute", left: `calc(${pct}% - 8px)`, top: 0, fontSize: 11, color: "#6b7280" }}>{t}</div>;
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Rows */}
          <div>
            {rows.length === 0 && <div style={{ padding: 12, color: "#6b7280" }}>No Gantt data available (waiting for events)</div>}
            {rows.map((r, idx) => (
              <div key={r.pid} className="gantt-row" style={{ display: "flex", alignItems: "center", minHeight: 34, marginBottom: 6 }}>
                <div style={{ width: 120, fontWeight: 600, color: "#111827" }}>PID {r.pid}</div>
                <div style={{ flex: 1, position: "relative", minHeight: 28 }}>
                  {/* empty background */}
                  <div style={{ position: "absolute", left: 0, right: 0, top: 8, height: 12, background: "#f3f4f6" }} />
                  {/* spans */}
                  {r.spans.map((sp, i) => {
                    const [s,e] = sp;
                    const total = Math.max(1, maxTick - minTick + 1);
                    const leftPct = ((s - minTick) / total) * 100;
                    const widthPct = ((e - s + 1) / total) * 100;
                    return (
                      <div key={i}
                           title={`PID ${r.pid}: ${s} → ${e}`}
                           style={{
                             position: "absolute",
                             left: `${leftPct}%`,
                             width: `${widthPct}%`,
                             top: 0,
                             height: 28,
                             borderRadius: 6,
                             display: "flex",
                             alignItems: "center",
                             justifyContent: "center",
                             padding: "0 6px",
                             boxSizing: "border-box",
                             color: "#fff",
                             fontSize: 12,
                             fontWeight: 600,
                             // colorized per pid for clarity
                             background: `hsl(${(r.pid * 57) % 360} 70% 45%)`,
                             boxShadow: "0 1px 0 rgba(0,0,0,0.15)"
                           }}>
                        {r.pid}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* EVENTS HISTORY */}
      <div style={{ marginTop: 20 }}>
        <h3 className="text-lg mb-2">Events (history)</h3>
        <div style={{ maxHeight: 420, overflow: "auto", padding: 8, background: "#f8fafc", borderRadius: 6, border: "1px solid #e6eef8" }}>
          {humanEvents.length === 0 && <div style={{ color: "#6b7280", padding: 8 }}>No events yet.</div>}
          {humanEvents.slice(-500).reverse().map(ev => (
            <div key={ev.id} style={{ padding: "8px 10px", marginBottom: 6, borderRadius: 6, background: "#fff", boxShadow: "inset 0 0 0 1px rgba(15,23,42,0.03)", display: "flex", gap: 12 }}>
              <div style={{ minWidth: 72, textAlign: "right", color: "#6b7280", fontSize: 12 }}>
                {ev.tick !== null ? `tick ${ev.tick}` : ""}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: "#0f172a", fontWeight: 600 }}>{ev.type}</div>
                <div style={{ color: "#334155", marginTop: 4 }}>{ev.human}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
