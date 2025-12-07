import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
const API = (process.env.REACT_APP_API_HOST || 'http://localhost:3001');

export default function RunHistory() {
  const [runs, setRuns] = useState([]);
  useEffect(() => { axios.get(`${API}/runs`).then(r => setRuns(r.data)).catch(err => console.error(err)); }, []);
  return (
    <div className="p-6">
      <h2 className="text-2xl mb-4">Run History</h2>
      <table className="table-auto w-full">
        <thead><tr><th>ID</th><th>Algorithm</th><th>Status</th><th>Started</th><th>Finished</th><th></th></tr></thead>
        <tbody>
          {runs.map(r => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.algorithm}</td>
              <td>{r.status}</td>
              <td>{r.started_at ? new Date(r.started_at).toLocaleString() : '-'}</td>
              <td>{r.finished_at ? new Date(r.finished_at).toLocaleString() : '-'}</td>
              <td><Link to={`/run/${r.id}`}>View</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
