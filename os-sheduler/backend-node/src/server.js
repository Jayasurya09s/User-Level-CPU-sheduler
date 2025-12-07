/*
  backend-node/src/server.js
  Scheduler Backend v2
  - Receives scheduler mode + job objects
  - Creates /tmp/run-<id>.json
  - Spawns C scheduler with:  scheduler --config /tmp/run-<id>.json
  - Saves run + events in SQLite
*/

const express = require("express");
const http = require("http");
const cors = require("cors");
const { spawn } = require("child_process");
const readline = require("readline");
const path = require("path");
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
const { Server } = require("socket.io");

// Path to scheduler binary
const SCHEDULER_PATH = path.join(
  __dirname,
  "..",
  "..",
  "scheduler-c",
  "bin",
  "scheduler"
);

// --- DB Setup ---
const DB_DIR = path.join(__dirname, "../data");
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR);

const DB_PATH = path.join(DB_DIR, "runs.db");
const db = new sqlite3.Database(DB_PATH);

// Create schema
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mode TEXT,
      quantum INTEGER,
      config_json TEXT,
      started_at REAL,
      ended_at REAL,
      exit_code INTEGER,
      pid INTEGER
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      run_id INTEGER,
      event_json TEXT,
      ts REAL
    )
  `);
});

// --- Express + HTTP + Socket.IO ---
const app = express();
app.use(express.json());
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Global state
let schedulerProc = null;
let currentRunId = null;

// Broadcast events to frontend
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
});

// Store event in DB + broadcast
function handleEvent(runId, ev) {
  const ts = Date.now() / 1000;

  db.run(
    `INSERT INTO events (run_id, event_json, ts) VALUES (?,?,?)`,
    [runId, JSON.stringify(ev), ts]
  );

  io.emit("event", ev);
}

// --- API: START RUN ---
app.post("/start", async (req, res) => {
  if (schedulerProc) {
    return res.json({ ok: false, message: "Already running" });
  }

  const { mode, quantum, mlfq, jobs } = req.body;

  // 1. Create config JSON
  const runConfig = {
    mode,
    quantum,
    mlfq,
    jobs
  };

  // 2. Save config file
  const runConfigJson = JSON.stringify(runConfig, null, 2);
  const configPath = `/tmp/run-${Date.now()}.json`;
  fs.writeFileSync(configPath, runConfigJson);

  // 3. Insert run into DB
  const startedAt = Date.now() / 1000;

  await new Promise((resolve) => {
    db.run(
      `INSERT INTO runs (mode, quantum, config_json, started_at) VALUES (?,?,?,?)`,
      [mode, quantum || null, runConfigJson, startedAt],
      function () {
        currentRunId = this.lastID;
        resolve();
      }
    );
  });

  // 4. Spawn scheduler
  schedulerProc = spawn(SCHEDULER_PATH, ["--config", configPath]);

  console.log("Scheduler PID:", schedulerProc.pid);

  // 5. Read JSON events line-by-line
  const rl = readline.createInterface({
    input: schedulerProc.stdout
  });

  rl.on("line", (line) => {
    try {
      const ev = JSON.parse(line);
      handleEvent(currentRunId, ev);
    } catch (err) {
      console.log("Invalid JSON event:", line);
    }
  });

  schedulerProc.stderr.on("data", (d) => {
    console.log("stderr:", d.toString());
  });

  schedulerProc.on("exit", (code) => {
    console.log("Scheduler exited:", code);
    const endedAt = Date.now() / 1000;

    db.run(
      `UPDATE runs SET ended_at=?, exit_code=?, pid=? WHERE id=?`,
      [endedAt, code, schedulerProc.pid, currentRunId]
    );

    schedulerProc = null;
    currentRunId = null;
  });

  res.json({ ok: true, run_id: currentRunId, pid: schedulerProc.pid });
});

// --- API: STOP RUN ---
app.post("/stop", (req, res) => {
  if (!schedulerProc) return res.json({ ok: false, message: "Not running" });

  schedulerProc.kill("SIGKILL");
  schedulerProc = null;
  currentRunId = null;

  res.json({ ok: true });
});

// --- API: LIST RUNS ---
app.get("/runs", (req, res) => {
  db.all(`SELECT * FROM runs ORDER BY id DESC`, (err, rows) => {
    res.json(rows || []);
  });
});

// --- API: RUN EVENTS ---
app.get("/runs/:id/events", (req, res) => {
  db.all(
    `SELECT event_json FROM events WHERE run_id=? ORDER BY id`,
    [req.params.id],
    (err, rows) => {
      const ev = rows.map((r) => JSON.parse(r.event_json));
      res.json(ev);
    }
  );
});

// --- API: STATUS ---
app.get("/status", (req, res) => {
  res.json({
    running: !!schedulerProc,
    pid: schedulerProc ? schedulerProc.pid : null
  });
});

// Start server
const PORT = 3000;
server.listen(PORT, () => console.log("Backend listening on port", PORT));
