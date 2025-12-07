/**
 * App Component
 * Main application with routing and theme management
 */

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useTheme } from './hooks/useTheme';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import Home from './pages/Home';
import NewRun from './pages/NewRun';
import RunViewer from './pages/RunViewer';
import RunHistory from './pages/RunHistory';
import CompareRuns from './pages/CompareRuns';
import Settings from './pages/Settings';
import Docs from './pages/Docs';
import registerChartsOnce from './charts/registerCharts';

registerChartsOnce();

function AppContent() {
  const { theme } = useTheme();

  // Apply theme colors to CSS variables
  useEffect(() => {
    if (theme && theme.colors) {
      const root = document.documentElement;
      Object.entries(theme.colors).forEach(([key, value]) => {
        root.style.setProperty(`--color-${key}`, value);
      });
    }
  }, [theme]);

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/new" element={<NewRun />} />
          <Route path="/workload" element={<NewRun />} />
          <Route path="/run/:id" element={<RunViewer />} />
          <Route path="/runs" element={<RunHistory />} />
          <Route path="/history" element={<RunHistory />} />
          <Route path="/compare" element={<CompareRuns />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/docs" element={<Docs />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
