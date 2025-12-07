# Quick Start Guide - CPU Scheduler Frontend

## 🚀 Get Running in 3 Steps

### Step 1: Ensure Backend is Running
```bash
# In backend-node directory
cd ../backend-node
npm start
# Should be running on http://localhost:4000
```

### Step 2: Start Frontend
```bash
# In frontend-react directory
npm start
# Opens browser at http://localhost:3000
```

### Step 3: Create Your First Run
1. Click "Create New Run"
2. Select "FCFS" algorithm
3. Click "Generate Random" → Generate
4. Click "Start Simulation"
5. Watch the Gantt chart update in real-time!

## 📋 File Summary

**Created/Updated Files:**

### Utils (6 files)
- `src/utils/themes.js` - 5 theme definitions with colors
- `src/utils/api.js` - REST API client with axios
- `src/utils/ws.js` - WebSocket singleton client
- `src/utils/formatEvent.js` - Event humanization utilities
- `src/utils/ganttTransform.js` - Event → Gantt transformation
- `src/utils/summaryUtils.js` - Export utilities (CSV, JSON, MD, LaTeX)

### Hooks (4 files)
- `src/hooks/useWebSocket.js` - WebSocket connection management
- `src/hooks/useGanttData.js` - Gantt data processing
- `src/hooks/usePlayback.js` - Playback controls with keyboard support
- `src/hooks/useTheme.js` - Theme persistence

### Components (13 files)
- `src/components/WorkloadTable.jsx` - Editable process table
- `src/components/RandomWorkloadModal.jsx` - Random generation modal
- `src/components/RunCard.jsx` - Run summary card
- `src/components/ThemeSelector.jsx` - Theme dropdown
- `src/components/Gantt.jsx` - Interactive Gantt chart
- `src/components/EventList.jsx` - Filtered event display
- `src/components/PlaybackControls.jsx` - Play/pause/speed controls
- `src/components/QueueInspector.jsx` - Queue visualization
- `src/components/SummaryTable.jsx` - Metrics with export buttons
- `src/components/LiveConsole.jsx` - Stderr console
- `src/components/RunControls.jsx` - Stop/delete/share buttons
- `src/components/NavBar.jsx` - Updated navigation bar

### Pages (7 files)
- `src/pages/Home.jsx` - Landing page
- `src/pages/NewRun.jsx` - Workload builder
- `src/pages/RunViewer.jsx` - Main dashboard (replaced old version)
- `src/pages/RunHistory.jsx` - Updated run history
- `src/pages/CompareRuns.jsx` - Multi-run comparison
- `src/pages/Settings.jsx` - App settings
- `src/pages/Docs.jsx` - Documentation

### Config & Styles
- `src/App.jsx` - Updated with all routes
- `src/index.css` - Updated with theme variables
- `tailwind.config.js` - Extended with animations
- `src/lib/colors.js` - Updated color utilities
- `README_FRONTEND.md` - Complete documentation

## 🎯 Key Features to Try

### 1. Random Workload
- Go to "Create New Run"
- Click "Generate Random"
- Adjust parameters (processes, arrival, burst, priority)
- Click Generate

### 2. Real-Time Visualization
- Start a run
- Watch Gantt chart update live
- Use playback controls (Space = play/pause)
- Zoom with mouse wheel, pan by dragging

### 3. Event Filtering
- In Run Viewer, scroll to Events section
- Toggle "Hide trivial events"
- Click event type buttons to filter
- Use search bar

### 4. Export Summary
- Wait for run to complete
- Scroll to Summary section
- Click CSV, JSON, MD, or LaTeX buttons
- Data copied to clipboard or downloaded

### 5. Compare Runs
- Create multiple runs with different algorithms
- Go to "Compare" page
- Select 2+ completed runs
- View chart comparison

### 6. Change Theme
- Go to Settings
- Select from dropdown:
  - Aurora (default - green/blue)
  - Midnight (dark purple)
  - Solarized (light)
  - Monokai (dark)
  - Colorblind Safe

## 🔥 Keyboard Shortcuts

- **Space**: Play/Pause simulation
- **→**: Step forward one tick
- **←**: Step backward one tick
- **Scroll**: Zoom Gantt chart

## 📊 Understanding the Dashboard

### Top Stats Cards
- **Total Time**: Maximum tick reached
- **CPU Utilization**: Percentage CPU was busy
- **Context Switches**: Number of process changes
- **Events**: Total events received

### Gantt Chart
- Each colored bar = process running
- Gray = CPU idle
- Hover for tooltip
- Zoom/pan for detail

### Queue Inspector
- **Running Process**: Currently executing (⚡ icon)
- **Ready Queue**: Waiting processes

### Console
- Shows stderr messages from scheduler
- Red background for warnings/errors
- Auto-scrolls to latest

## 🐛 Common Issues

**Issue**: "Loading run..." never finishes
- **Fix**: Check backend is running on correct port

**Issue**: Events not appearing
- **Fix**: Check WebSocket connection in browser console

**Issue**: Theme not changing
- **Fix**: Hard refresh (Ctrl+Shift+R)

**Issue**: Can't start run
- **Fix**: Ensure at least 1 process with burst_time ≥ 1

## 💡 Tips

1. **Use Random Generator**: Quickly create test workloads
2. **Export for Reports**: Use LaTeX export for academic papers
3. **Compare Algorithms**: Run same workload with different algorithms
4. **Share Runs**: Use "Share Link" to send to others
5. **Duplicate Runs**: Quickly test variations

## 📞 Support

Check `README_FRONTEND.md` for:
- Complete feature list
- API documentation
- Troubleshooting guide
- Architecture details

## ✅ Verification Checklist

Before reporting issues, verify:
- [ ] Backend running on port 4000
- [ ] No console errors in browser
- [ ] WebSocket connected (check Network tab)
- [ ] Dependencies installed (`npm install`)
- [ ] Browser supports ES6 (Chrome 90+, Firefox 88+)

---

**You're all set!** 🎉 Start creating beautiful scheduling visualizations.
