import React from "react";

export default function JobsEditor({ jobs, setJobs }) {
  const updateJob = (i, field, value) => {
    const updated = [...jobs];
    updated[i][field] = value;
    setJobs(updated);
  };

  const addRow = () => {
    setJobs([
      ...jobs,
      {
        cmd: "../scheduler-c/bin/busy 1",
        burst: 1,
        arrival: 0,
        priority: 0,
      },
    ]);
  };

  const removeRow = (index) => {
    const updated = jobs.filter((_, i) => i !== index);
    setJobs(updated);
  };

  return (
    <div className="p-4 bg-white rounded shadow mb-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold">Processes</h2>
        <button
          onClick={addRow}
          className="px-3 py-1 bg-blue-500 text-white rounded"
        >
          + Add Process
        </button>
      </div>

      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Command</th>
            <th className="border p-2">Burst</th>
            <th className="border p-2">Arrival</th>
            <th className="border p-2">Priority</th>
            <th className="border p-2">Remove</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job, i) => (
            <tr key={i}>
              <td className="border p-2">
                <input
                  className="border p-2 rounded w-full"
                  value={job.cmd}
                  onChange={(e) => updateJob(i, "cmd", e.target.value)}
                />
              </td>

              <td className="border p-2">
                <input
                  type="number"
                  min="0"
                  className="border p-2 rounded w-full"
                  value={job.burst}
                  onChange={(e) => updateJob(i, "burst", Number(e.target.value))}
                />
              </td>

              <td className="border p-2">
                <input
                  type="number"
                  min="0"
                  className="border p-2 rounded w-full"
                  value={job.arrival}
                  onChange={(e) =>
                    updateJob(i, "arrival", Number(e.target.value))
                  }
                />
              </td>

              <td className="border p-2">
                <input
                  type="number"
                  className="border p-2 rounded w-full"
                  value={job.priority}
                  onChange={(e) =>
                    updateJob(i, "priority", Number(e.target.value))
                  }
                />
              </td>

              <td className="border p-2 text-center">
                <button
                  onClick={() => removeRow(i)}
                  className="px-2 py-1 bg-red-500 text-white rounded"
                >
                  X
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
