import React from "react";

export default function SchedulerSelector({ scheduler, setScheduler }) {
  return (
    <div className="p-4 bg-white rounded shadow mb-4">
      <h2 className="text-lg font-semibold mb-3">Scheduler</h2>

      <select
        className="border p-2 rounded w-full"
        value={scheduler.mode}
        onChange={(e) =>
          setScheduler({ ...scheduler, mode: e.target.value })
        }
      >
        <option value="fcfs">FCFS</option>
        <option value="sjf">SJF (Non-preemptive)</option>
        <option value="srtf">SRTF (Preemptive SJF)</option>
        <option value="priority">Priority (Non-preemptive)</option>
        <option value="priority_preempt">Priority (Preemptive)</option>
        <option value="rr">Round Robin</option>
        <option value="mlfq">MLFQ</option>
      </select>

      {/* Additional fields depending on scheduler */}
      {scheduler.mode === "rr" && (
        <div className="mt-3">
          <label className="block font-medium mb-1">Quantum (ms)</label>
          <input
            type="number"
            min="10"
            value={scheduler.quantum}
            onChange={(e) =>
              setScheduler({ ...scheduler, quantum: Number(e.target.value) })
            }
            className="border p-2 rounded w-full"
          />
        </div>
      )}

      {scheduler.mode === "mlfq" && (
        <div className="mt-3">
          <label className="block font-medium mb-1">MLFQ levels</label>
          <input
            type="number"
            min="1"
            value={scheduler.levels}
            onChange={(e) =>
              setScheduler({ ...scheduler, levels: Number(e.target.value) })
            }
            className="border p-2 rounded w-full"
          />

          <label className="block font-medium mb-1 mt-2">
            Quanta (comma separated, ms)
          </label>
          <input
            type="text"
            value={scheduler.quanta}
            onChange={(e) =>
              setScheduler({ ...scheduler, quanta: e.target.value })
            }
            className="border p-2 rounded w-full"
            placeholder="50,100,200"
          />
        </div>
      )}
    </div>
  );
}
