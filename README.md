#  CPU Scheduler Simulator

A comprehensive **User-Level CPU Scheduler** with real-time visualization. Built with C, Node.js, and React, this educational tool simulates 7 scheduling algorithms with live Gantt charts, event logs, and performance metrics.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-Linux%20%7C%20macOS%20%7C%20Windows-lightgrey)

## 📋 Table of Contents
- [Features](#-features)
- [Architecture](#-architecture)
- [Supported Algorithms](#-supported-algorithms)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
  - [macOS Setup](#-macos)
  - [Ubuntu/Linux Setup](#-ubuntulinux)
  - [Windows Setup](#-windows)
- [Usage](#-usage)
- [Project Structure](#-project-structure)
- [Technologies](#-technologies)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

- **7 Scheduling Algorithms**: FCFS, SJF, SRTF, Priority (Preemptive/Non-Preemptive), Round Robin, MLFQ
- **Real-Time Visualization**: Live Gantt charts updating second-by-second
- **Interactive Dashboard**: 
  - Process State Monitor (Running/Ready/Pending/Completed)
  - Terminal-style Event Log with color-coded symbols
  - Live Console Output
  - Playback Controls (Play/Pause/Step/Speed adjustment)
- **Performance Metrics**: CPU utilization, turnaround time, waiting time, response time
- **WebSocket Streaming**: Real-time event communication
- **Run History & Comparison**: Compare multiple algorithm performances
- **Responsive Design**: Works on desktop, tablet, and mobile

---

## 🏗️ Architecture

```
┌─────────────────┐      JSON Events      ┌──────────────────┐      WebSocket      ┌─────────────────┐
│  C Scheduler    │ ──────────────────────> │  Node.js Backend │ ─────────────────> │  React Frontend │
│  (scheduler-c)  │      (via stdout)       │  (Express + WS)  │   (Real-time)       │   (Dashboard)   │
└─────────────────┘                         └──────────────────┘                     └─────────────────┘
```

1. **C Scheduler** (`scheduler-c/`): Core scheduling logic, emits JSON events
2. **Node.js Backend** (`backend-node/`): REST API, WebSocket server, SQLite database
3. **React Frontend** (`frontend-react/`): Interactive dashboard with live visualization

---

## 📊 Supported Algorithms

| Algorithm | Code | Preemptive | Description |
|-----------|------|------------|-------------|
| First Come First Serve | `fcfs` | ❌ | Processes served in arrival order |
| Shortest Job First | `sjf` | ❌ | Shortest burst time first |
| Shortest Remaining Time First | `srtf` | ✅ | Preemptive SJF |
| Priority (Non-Preemptive) | `priority` | ❌ | Highest priority first |
| Priority (Preemptive) | `priority_p` | ✅ | Preemptive priority |
| Round Robin | `rr` | ✅ | Time quantum-based rotation |
| Multi-Level Feedback Queue | `mlfq` | ✅ | Multiple priority queues |

---

## 🔧 Prerequisites

### All Platforms
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **C Compiler** (GCC/Clang for Linux/macOS, MinGW for Windows)
- **Git** - [Download](https://git-scm.com/)

### Platform-Specific
- **macOS**: Xcode Command Line Tools
- **Linux**: `build-essential` package
- **Windows**: MinGW-w64 or MSYS2

---

## 📦 Installation

### 🍎 macOS

#### 1. Install Prerequisites
```bash
# Install Homebrew (if not already installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js and GCC
brew install node gcc

# Verify installations
node --version    # Should show v16+
npm --version
gcc --version
```

#### 2. Clone Repository
```bash
git clone https://github.com/Jayasurya09s/User-Level-CPU-sheduler.git
cd User-Level-CPU-sheduler
```

#### 3. Build C Scheduler
```bash
cd scheduler-c
make clean
make
# Verify binary created
ls -lh bin/scheduler
cd ..
```

#### 4. Setup Backend
```bash
cd os-sheduler/backend-node
npm install
# Test backend
node src/server.js &
# Should show: "Server running on port 3001"
# Stop with: kill %1
cd ../..
```

#### 5. Setup Frontend
```bash
cd os-sheduler/frontend-react
npm install
cd ../..
```

---

### 🐧 Ubuntu/Linux

#### 1. Install Prerequisites
```bash
# Update package list
sudo apt update

# Install Node.js (using NodeSource)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install build tools
sudo apt install -y build-essential

# Verify installations
node --version    # Should show v16+
npm --version
gcc --version
```

#### 2. Clone Repository
```bash
git clone https://github.com/Jayasurya09s/User-Level-CPU-sheduler.git
cd User-Level-CPU-sheduler
```

#### 3. Build C Scheduler
```bash
cd scheduler-c
make clean
make
# Verify binary created
ls -lh bin/scheduler
cd ..
```

#### 4. Setup Backend
```bash
cd os-sheduler/backend-node
npm install
# Test backend
node src/server.js &
# Should show: "Server running on port 3001"
# Stop with: kill %1
cd ../..
```

#### 5. Setup Frontend
```bash
cd os-sheduler/frontend-react
npm install
cd ../..
```

---

### 🪟 Windows

#### 1. Install Prerequisites

**Option A: Using Chocolatey (Recommended)**
```powershell
# Install Chocolatey (Run PowerShell as Administrator)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install tools
choco install nodejs git mingw -y

# Restart terminal and verify
node --version
gcc --version
```

**Option B: Manual Installation**
1. Download and install [Node.js](https://nodejs.org/) (v18 LTS)
2. Download and install [Git](https://git-scm.com/download/win)
3. Download and install [MinGW-w64](https://www.mingw-w64.org/)
   - Or install [MSYS2](https://www.msys2.org/) and run: `pacman -S mingw-w64-x86_64-gcc`
4. Add MinGW `bin` folder to PATH (e.g., `C:\mingw64\bin`)

#### 2. Clone Repository
```powershell
git clone https://github.com/Jayasurya09s/User-Level-CPU-sheduler.git
cd User-Level-CPU-sheduler
```

#### 3. Build C Scheduler
```powershell
cd scheduler-c
# Clean previous builds
Remove-Item -Recurse -Force bin,build -ErrorAction SilentlyContinue
mkdir bin,build -Force

# Compile
gcc -Iinclude -o bin/scheduler.exe src/main.c -lm

# Verify
Get-Item bin/scheduler.exe
cd ..
```

#### 4. Setup Backend
```powershell
cd os-sheduler\backend-node
npm install
# Test backend (in separate terminal)
node src/server.js
# Should show: "Server running on port 3001"
# Press Ctrl+C to stop
cd ..\..
```

#### 5. Setup Frontend
```powershell
cd os-sheduler\frontend-react
npm install
cd ..\..
```

---

## 🎮 Usage

### Starting the Application

You need **3 separate terminals**:

#### Terminal 1: Backend Server
```bash
cd os-sheduler/backend-node
node src/server.js
```
**Expected Output:**
```
Server running on http://localhost:3001
WebSocket server listening on ws://localhost:3001
Database initialized at ./scheduler.db
```

#### Terminal 2: Frontend Dev Server
```bash
cd os-sheduler/frontend-react
npm run dev
```
**Expected Output:**
```
  VITE v5.x.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

#### Terminal 3: Optional - Direct Scheduler Testing
```bash
cd scheduler-c
./bin/scheduler fcfs workload.json
# Or on Windows: bin\scheduler.exe fcfs workload.json
```

### Using the Dashboard

1. **Open Browser**: Navigate to `http://localhost:5173`

2. **Create a Workload**:
   - Click "New Simulation" or navigate to `/new`
   - Select algorithm (e.g., `Priority_Preemptive`)
   - Add processes manually or use JSON:
     ```json
     [
       {"pid": 1, "arrival": 0, "burst": 5, "priority": 2},
       {"pid": 2, "arrival": 1, "burst": 3, "priority": 1},
       {"pid": 3, "arrival": 2, "burst": 8, "priority": 3}
     ]
     ```
   - Click "Start Simulation"

3. **Watch Live Simulation**:
   - **Gantt Chart**: Visual timeline of process execution
   - **Playback Controls**: Play, pause, step through simulation
   - **Process State Monitor**: See running/ready/pending/completed processes
   - **Terminal Log**: Color-coded event stream with timestamps
   - **Live Console**: Real-time output from scheduler
   - **Event List**: All events with filtering
   - **Summary Table**: Final metrics (turnaround, waiting times)

4. **View Run History**:
   - Click "Run History" to see all simulations
   - Compare multiple runs with different algorithms

### Example Workload Files

Create `scheduler-c/workload.json`:
```json
[
  {"pid": 1, "arrival": 0, "burst": 8, "priority": 2},
  {"pid": 2, "arrival": 1, "burst": 4, "priority": 1},
  {"pid": 3, "arrival": 2, "burst": 9, "priority": 3},
  {"pid": 4, "arrival": 3, "burst": 5, "priority": 2}
]
```

Test all algorithms:
```bash
cd scheduler-c
for algo in fcfs sjf srtf priority priority_p rr mlfq; do
  echo "Testing $algo..."
  ./bin/scheduler $algo workload.json | head -20
done
```

---

## 📁 Project Structure

```
User-Level-CPU-sheduler/
├── README.md                    # This file
├── LICENSE                      # MIT License
│
├── scheduler-c/                 # C Scheduler Core
│   ├── Makefile                 # Build configuration
│   ├── src/
│   │   ├── main.c              # Entry point, event emission
│   │   ├── scheduler.h         # Algorithm implementations
│   │   └── busy.c              # CPU load simulator
│   ├── include/                # Header files
│   └── bin/
│       └── scheduler           # Compiled binary
│
└── os-sheduler/
    ├── backend-node/           # Node.js Backend
    │   ├── package.json
    │   └── src/
    │       ├── server.js       # Express API + WebSocket
    │       └── db.js           # SQLite database layer
    │
    └── frontend-react/         # React Frontend
        ├── package.json
        ├── vite.config.js      # Vite bundler config
        ├── tailwind.config.js  # TailwindCSS config
        ├── index.html
        └── src/
            ├── main.jsx        # Entry point
            ├── App.jsx         # Router setup
            ├── pages/
            │   ├── Home.jsx
            │   ├── NewRun.jsx          # Workload creator
            │   ├── RunViewer.jsx       # Live simulation dashboard
            │   ├── RunHistory.jsx      # Past runs
            │   └── Compare.jsx         # Algorithm comparison
            └── components/
                ├── NavBar.jsx          # Sticky navigation
                ├── Footer.jsx          # Site footer
                ├── Gantt.jsx           # Gantt chart
                ├── QueueInspector.jsx  # Process state monitor
                ├── TerminalLog.jsx     # Event log viewer
                ├── EventList.jsx       # Event list
                ├── PlaybackControls.jsx
                ├── SummaryTable.jsx
                └── LiveConsole.jsx
```

---

## 🛠️ Technologies

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **SQLite3** - Embedded database
- **ws** - WebSocket library

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **TailwindCSS** - Utility-first CSS
- **React Router** - Client-side routing
- **Chart.js** - Gantt chart rendering

### Scheduler
- **C (C99)** - Core scheduling algorithms
- **JSON-C** - JSON parsing (or cJSON)

---

## 🧪 Testing

### Run Unit Tests (Backend)
```bash
cd os-sheduler/backend-node
npm test
```

### Test Individual Algorithms
```bash
cd scheduler-c
# Test FCFS
echo '[{"pid":1,"arrival":0,"burst":5}]' | ./bin/scheduler fcfs -

# Test with file
./bin/scheduler priority_p workload.json > output.json
cat output.json | jq '.[] | select(.event == "job_finished")'
```

### Debug Mode
```bash
# Backend with logging
DEBUG=* node src/server.js

# Frontend with verbose output
npm run dev -- --debug
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find process using port 3001
lsof -i :3001         # macOS/Linux
netstat -ano | findstr :3001  # Windows

# Kill process
kill -9 <PID>         # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

### C Compilation Errors
```bash
# Ensure GCC is installed
gcc --version

# Clean and rebuild
cd scheduler-c
make clean
make CFLAGS="-Wall -Wextra -g"
```

### WebSocket Connection Failed
1. Check backend is running on port 3001
2. Verify firewall allows WebSocket connections
3. Check browser console for CORS errors

### "Invalid scheduling algorithm" Error
- Ensure algorithm name matches exactly: `priority_p` (not `Priority_Preemptive`)
- Check `NewRun.jsx` algorithm mapping

---

## 📖 Documentation

For detailed documentation, visit:
- **Algorithm Guide**: Detailed explanations of each scheduling algorithm
- **API Reference**: Backend API endpoints and WebSocket events
- **Frontend Components**: React component documentation

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m 'Add my feature'`
4. Push to branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file.

---

## 👤 Author

**Jayanth Midde**

- LinkedIn: [https://www.linkedin.com/in/jayanth-midde-968150321/](https://www.linkedin.com/in/jayanth-midde-968150321/)
- GitHub: [@Jayasurya09s](https://github.com/Jayasurya09s)

---

## 🙏 Acknowledgments

Built for educational purposes to demonstrate CPU scheduling concepts in Operating Systems courses.

---

## 📊 Screenshots

### Live Simulation Dashboard
<img width="1231" height="1022" alt="image" src="https://github.com/user-attachments/assets/313b45b3-f24c-4446-b158-6954c9fe6d88" />
<img width="1231" height="1022" alt="image" src="https://github.com/user-attachments/assets/ce96d6da-231e-4e21-a8d0-e243f402e098" />
<img width="1231" height="1022" alt="image" src="https://github.com/user-attachments/assets/777e8e7f-77d2-43d9-b2cb-d2bb9b733398" />
<img width="1231" height="1022" alt="image" src="https://github.com/user-attachments/assets/d47d56c8-19b5-4833-a194-37ac63b8ea75" />


### Run History & Comparison
<img width="1231" height="1022" alt="image" src="https://github.com/user-attachments/assets/9240e94f-20c6-4c17-9cfd-bbc8c4eda6f1" />

**⭐ Star this repository if you find it helpful!**
