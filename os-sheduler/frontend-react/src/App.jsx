import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/NavBar';
import WorkloadBuilder from './pages/WorkloadBuilder';
import RunViewer from './pages/RunViewer';
import RunHistory from './pages/RunHistory';
import registerChartsOnce from './charts/registerCharts';
registerChartsOnce();

export default function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<Navigate to="/workload" replace />} />
        <Route path="/workload" element={<WorkloadBuilder />} />
        <Route path="/run/:id" element={<RunViewer />} />
        <Route path="/runs" element={<RunHistory />} />
      </Routes>
    </BrowserRouter>
  );
}
