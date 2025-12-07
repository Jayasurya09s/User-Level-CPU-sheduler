/**
 * RunViewer Page
 * Real-time dashboard for viewing running/completed simulations
 */

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getRun, getRunEvents, getRunSummary } from '../utils/api';
import { useWebSocket } from '../hooks/useWebSocket';
import { useGanttData } from '../hooks/useGanttData';
import { usePlayback } from '../hooks/usePlayback';
import { formatSummary } from '../utils/summaryUtils';
import Gantt from '../components/Gantt';
import EventList from '../components/EventList';
import PlaybackControls from '../components/PlaybackControls';
import QueueInspector from '../components/QueueInspector';
import SummaryTable from '../components/SummaryTable';
import LiveConsole from '../components/LiveConsole';
import RunControls from '../components/RunControls';
import TerminalLog from '../components/TerminalLog';

export default function RunViewer() {
  const { id } = useParams();
  const [run, setRun] = useState(null);
  const [events, setEvents] = useState([]);
  const [stderrMessages, setStderrMessages] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [liveStats, setLiveStats] = useState({
    currentTick: 0,
    runningProcess: null,
    readyQueue: [],
    pendingProcesses: [],
    completedProcesses: []
  });

  // WebSocket connection
  useWebSocket({
    runId: id,
    onEvent: (event) => {
      // Normalize: scheduler uses "event" field, frontend expects "type"
      if (event.event && !event.type) {
        event.type = event.event;
      }
      
      // Update live stats based on event type
      if (event.tick !== undefined) {
        setLiveStats(prev => {
          const updated = { ...prev, currentTick: event.tick };
          
          // Update running process
          if (event.type === 'job_started' || event.type === 'job_resumed') {
            updated.runningProcess = event.pid;
          } else if (event.type === 'job_finished' || event.type === 'job_preempted') {
            updated.runningProcess = null;
          }
          
          // Track completed processes
          if (event.type === 'job_finished' && event.pid !== undefined) {
            if (!updated.completedProcesses.includes(event.pid)) {
              updated.completedProcesses = [...updated.completedProcesses, event.pid];
            }
          }
          
          // Update ready queue if available
          if (event.ready_queue) {
            updated.readyQueue = event.ready_queue;
          }
          
          return updated;
        });
      }
      
      setEvents(prev => {
        // Add all events for live display
        return [...prev, event];
      });
    },
    onStderr: (message) => {
      setStderrMessages(prev => [...prev, message]);
    },
    onRunFinished: async (message) => {
      console.log('Run finished:', message);
      await loadRunData();
    },
    onRunKilled: () => {
      console.log('Run killed');
      loadRunData();
    }
  });

  // Load initial data
  useEffect(() => {
    loadRunData();
  }, [id]);

  const loadRunData = async () => {
    try {
      setIsLoading(true);

      // Load run details
      const runData = await getRun(id);
      setRun(runData);

      // Load events and transform to expected format
      const eventsData = await getRunEvents(id);
      const transformedEvents = (eventsData || []).map(item => {
        const event = item.event || {};
        // Normalize: scheduler uses "event" field, frontend expects "type"
        if (event.event && !event.type) {
          event.type = event.event;
        }
        return {
          ...event,
          tick: item.tick,
          id: item.id,
          created_at: item.created_at
        };
      });
      setEvents(transformedEvents);
      
      // Calculate initial live stats from loaded events
      if (transformedEvents.length > 0) {
        const lastTick = Math.max(...transformedEvents.map(e => e.tick || 0));
        const completed = transformedEvents
          .filter(e => e.type === 'job_finished')
          .map(e => e.pid)
          .filter((v, i, a) => a.indexOf(v) === i);
        
        setLiveStats(prev => ({
          ...prev,
          currentTick: lastTick,
          completedProcesses: completed
        }));
      }

      // Load summary if available
      if (runData.status === 'finished' || runData.status === 'completed') {
        try {
          const summaryData = await getRunSummary(id);
          setSummary(formatSummary(summaryData));
        } catch (error) {
          console.log('Summary not available yet');
        }
      }
    } catch (error) {
      console.error('Failed to load run data:', error);
      alert('Failed to load run data');
    } finally {
      setIsLoading(false);
    }
  };

  // Gantt data
  const { segments, stats } = useGanttData(events);

  // Playback controls
  const playback = usePlayback(events, stats.totalTime);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 flex items-center justify-center">
        <div className="text-xl text-gray-600 dark:text-gray-400">Loading run...</div>
      </div>
    );
  }

  if (!run) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 flex items-center justify-center">
        <div className="text-xl text-gray-600 dark:text-gray-400">Run not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {run.algorithm} Simulation
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span>Run ID: {run.id}</span>
            <span>•</span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              run.status === 'running' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
              run.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
              'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              {run.status}
            </span>
            {run.args?.quantum && (
              <>
                <span>•</span>
                <span>Quantum: {run.args.quantum}</span>
              </>
            )}
          </div>
        </div>

        {/* Live Stats Banner - Shows during active simulation */}
        {run.status === 'running' && (
          <div className="mb-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-6 border-2 border-blue-400">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <h2 className="text-xl font-bold">🚀 Live Simulation in Progress</h2>
              </div>
              <div className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                Tick: {liveStats.currentTick}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <div className="text-xs text-blue-100 mb-1">Running</div>
                <div className="text-lg font-bold">
                  {liveStats.runningProcess !== null ? `P${liveStats.runningProcess}` : 'IDLE'}
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <div className="text-xs text-blue-100 mb-1">Ready Queue</div>
                <div className="text-lg font-bold">{liveStats.readyQueue.length} processes</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <div className="text-xs text-blue-100 mb-1">Completed</div>
                <div className="text-lg font-bold">{liveStats.completedProcesses.length} processes</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <div className="text-xs text-blue-100 mb-1">Total Events</div>
                <div className="text-lg font-bold">{events.length}</div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Time</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalTime}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">CPU Utilization</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.cpuUtilization.toFixed(1)}%</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Context Switches</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.contextSwitches}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Events</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{events.length}</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="space-y-6">
          {/* Gantt Chart - Full Width */}
          <Gantt
            segments={segments}
            currentTick={playback.currentTick}
          />

          {/* Playback Controls - Full Width */}
          <PlaybackControls
            isPlaying={playback.isPlaying}
            currentTick={playback.currentTick}
            maxTick={playback.maxTick}
            speed={playback.speed}
            loop={playback.loop}
            progress={playback.progress}
            onTogglePlay={playback.togglePlay}
            onStop={playback.stop}
            onStepForward={playback.stepForward}
            onStepBackward={playback.stepBackward}
            onJumpToTick={playback.jumpToTick}
            onSetSpeed={playback.setSpeed}
            onToggleLoop={playback.toggleLoop}
          />

          {/* Process State Monitor + Run Controls & Console - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <QueueInspector
              events={events}
              currentTick={run.status === 'running' ? liveStats.currentTick : playback.currentTick}
            />
            <div className="space-y-6">
              <RunControls
                runId={id}
                runStatus={run.status}
                onUpdate={loadRunData}
              />
              <LiveConsole messages={stderrMessages} />
            </div>
          </div>

          {/* Event List + Terminal Log - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EventList events={playback.currentEvents} />
            <TerminalLog events={events} />
          </div>

          {/* Summary Table - Full Width */}
          {summary && <SummaryTable summary={summary} />}
        </div>
      </div>
    </div>
  );
}
