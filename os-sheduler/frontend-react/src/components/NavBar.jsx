import React from 'react';
import { Link } from 'react-router-dom';

export default function NavBar() {
  return (
    <nav className="bg-gray-800 text-gray-100 px-6 py-3 flex justify-between items-center shadow-lg border-b border-gray-700">
  <h1 className="text-xl font-bold">CPU Scheduler UI</h1>

  <div className="space-x-4">
    <Link className="hover:text-blue-400" to="/">Home</Link>
    <Link className="hover:text-blue-400" to="/run">Run</Link>
    <Link className="hover:text-blue-400" to="/history">History</Link>
  </div>
</nav>

  );
}

