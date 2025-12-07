import React, { useEffect, useState } from "react";
import io from "socket.io-client";

import SchedulerSelector from "./components/SchedulerSelector";
import JobsEditor from "./components/JobsEditor";

const socket = io("http://localhost:3000");

export default function App() {
  const [events, setEvents] = useState([]);
  const [running, setRunning] = useState(false);

  // Scheduler settings
  const [scheduler, setScheduler] = useState({
    mode: "fcfs",
    quantum: 200,
    levels: 3,
    quanta: "50,100,200"
  });

  // Job list
  const [jobs, setJobs] = useState([
    { cmd: "../scheduler-c/bin/busy 2", burst: 2, arrival: 0, priority: 0 },
    { cmd: "../scheduler-c/bin/busy 1", burst: 1, arrival: 0, priority: 0 }
  ]);

  // --- Socket.IO listener ---
  useEffect(() => {
    socket.on("event", (ev) => {
      setEvents((prev) => [...prev, ev]);
    });

    socket.on("recentEvents", (data) => {
      setEvents(data);
    });

    return () => {
      socket.off("event");
      socket.off("recentEvents");
    };
  }, []);

  // --- Start run ---
  const startRun = async () => {
    const payload = {
      mode: scheduler.mode,
      quantum: scheduler.quantum,
      mlfq: {
        levels: scheduler.levels,
        quanta: scheduler.quanta.split(",").map((q) => Number(q))
      },
      jobs: jobs.map((j) => ({
        cmd: j.cmd,
        burst: j.burst,
        arrival: j.arrival,
        priority: j.priority
      }))
    };

    const res = await fetch("http://localhost:3000/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const out = await res.json();
    if (out.ok) {
      setRunning(true);
      setEvents([]);
    }
  };

  // --- Stop run ---
  const stopRun = async () => {
    await fetch("http://localhost:3000/stop", { method: "POST" });
    setRunning(false);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-center">CPU Scheduler Simulator</h1>

      {/* Scheduler selection */}
      <SchedulerSelector scheduler={scheduler} setScheduler={setScheduler} />

      {/* Jobs editor */}
      <JobsEditor jobs={jobs} setJobs={setJobs} />

      {/* Controls */}
      <div className="flex gap-4">
        <button
          onClick={startRun}
          className="px-4 py-2 bg-green-600 text-white rounded"
          disabled={running}
        >
          ▶ Start
        </button>

        <button
          onClick={stopRun}
          className="px-4 py-2 bg-red-600 text-white rounded"
          disabled={!running}
        >
          ■ Stop
        </button>
      </div>

      {/* Event log */}
      <div className="bg-white p-4 rounded shadow max-h-80 overflow-y-auto">
        <h2 className="font-semibold mb-2">Events</h2>

        {events.length === 0 && <p className="text-gray-500">No events yet.</p>}

        {events.map((ev, idx) => (
          <div
            key={idx}
            className="border-b py-1 text-sm font-mono text-gray-700"
          >
            {JSON.stringify(ev)}
          </div>
        ))}
      </div>
    </div>
  );
}
