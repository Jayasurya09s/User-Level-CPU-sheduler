// src/server.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const readline = require("readline");
const WebSocket = require("ws");

const { init, runAsync, allAsync, getAsync } = require("./db");

// ------------------------------
// Global paths
// ------------------------------
const ROOT = path.resolve(__dirname, "..");
const SCHEDULER_BIN = path.join(process.cwd(), "..", "scheduler-c", "scheduler");
const UPLOAD_DIR = path.join(ROOT, "uploads");

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// ------------------------------
// DB Init
// ------------------------------
init();

// ------------------------------
// Express App Setup
// ------------------------------
const app = express();
app.use(bodyParser.json({ limit: "5mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan("dev"));

// ------------------------------
// File Upload Setup
// ------------------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// ------------------------------
// WebSocket Setup
// ------------------------------
const wss = new WebSocket.Server({ noServer: true });
const wsClients = new Set();

function broadcastWS(msg) {
  const data = typeof msg === "string" ? msg : JSON.stringify(msg);
  for (const c of wsClients) {
    if (c.readyState === WebSocket.OPEN) c.send(data);
  }
}

// ------------------------------
// Algorithm Validation
// ------------------------------
const VALID_ALGOS = [
  "fcfs",
  "sjf",
  "srtf",
  "priority",
  "priority_p",
  "rr",
  "mlfq"
];

function validateAlgorithm(algo) {
  return VALID_ALGOS.includes(algo);
}

// ------------------------------
// In-memory Process Tracker
// ------------------------------
const runs = new Map();

// ------------------------------
// POST /runs/start
// ------------------------------
app.post("/runs/start", upload.single("file"), async (req, res) => {
  try {
    const { algorithm, args = [], meta = {} } = req.body;

    const passedArgs = Array.isArray(args) ? args : JSON.parse(args || "[]");
    const algo = algorithm || passedArgs[0];

    // Validate algorithm
    if (!validateAlgorithm(algo)) {
      return res.status(400).json({ error: "Invalid scheduling algorithm" });
    }

    // If uploading workload file
    if (req.file) {
      meta.uploaded_file = path.resolve(req.file.path);
    }

    const startedAt = Date.now();

    const row = await runAsync(
      `INSERT INTO runs (algorithm, args, status, started_at, meta_json)
       VALUES (?, ?, ?, ?, ?)`,
      [
        algo,
        JSON.stringify(passedArgs),
        "running",
        startedAt,
        JSON.stringify(meta)
      ]
    );

    const run_id = row.lastID;

    // Build scheduler spawn args
    const spawnArgs = passedArgs.length ? passedArgs : [algo];
    if (meta.uploaded_file) spawnArgs.push(meta.uploaded_file);

    const proc = spawn(SCHEDULER_BIN, spawnArgs, {
      cwd: path.dirname(SCHEDULER_BIN),
      env: process.env
    });

    runs.set(run_id, { proc, status: "running" });

    // Read scheduler stdout
    const rl = readline.createInterface({ input: proc.stdout });

    rl.on("line", async line => {
      line = line.trim();
      if (!line) return;

      let parsed;
      try {
        parsed = JSON.parse(line);
      } catch {
        parsed = { raw: line };
      }

      const tick = parsed.tick ?? null;
      await runAsync(
        `INSERT INTO events (run_id, tick, event_json, created_at)
         VALUES (?, ?, ?, ?)`,
        [run_id, tick, JSON.stringify(parsed), Date.now()]
      );

      broadcastWS({ type: "event", run_id, event: parsed });
    });

    proc.stderr.on("data", buf => {
      const msg = buf.toString();
      console.error(`[scheduler ${run_id} stderr]`, msg);
      broadcastWS({ type: "stderr", run_id, message: msg });
    });

    proc.on("close", async code => {
      const finishedAt = Date.now();
      const status =
        code === 0 ? "finished" : "error";

      // Extract summary from last stored JSON events
      let summary = null;
      const rows = await allAsync(
        `SELECT event_json FROM events WHERE run_id = ? ORDER BY id DESC LIMIT 25`,
        [run_id]
      );

      for (const r of rows) {
        try {
          const ej = JSON.parse(r.event_json);
          if (ej && ej.algorithm) {
            summary = ej;
            break;
          }
        } catch {}
      }

      await runAsync(
        `UPDATE runs SET status = ?, finished_at = ?, summary_json = ?
         WHERE id = ?`,
        [status, finishedAt, summary ? JSON.stringify(summary) : null, run_id]
      );

      runs.set(run_id, { proc: null, status });

      broadcastWS({
        type: "run_finished",
        run_id,
        status,
        exitCode: code
      });
    });

    res.status(201).json({
      run_id,
      args: spawnArgs,
      started_at: startedAt
    });
  } catch (err) {
    console.error("start run error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ------------------------------
// POST /runs/:id/stop
// ------------------------------
app.post("/runs/:id/stop", async (req, res) => {
  const run_id = Number(req.params.id);
  const info = runs.get(run_id);

  if (!info || !info.proc)
    return res.status(404).json({ error: "run not active" });

  try {
    info.proc.kill("SIGTERM");
    await runAsync(`UPDATE runs SET status = ? WHERE id = ?`, [
      "killed",
      run_id
    ]);
    res.json({ ok: true });
    broadcastWS({ type: "run_killed", run_id });
  } catch (err) {
    res.status(500).json({ error: "failed to kill process" });
  }
});

// ------------------------------
// GET /runs
// ------------------------------
app.get("/runs", async (req, res) => {
  try {
    const rows = await allAsync(
      `SELECT id, algorithm, args, status, started_at, finished_at
       FROM runs ORDER BY id DESC LIMIT 200`
    );
    res.json(
      rows.map(r => {
        try {
          r.args = JSON.parse(r.args);
        } catch {}
        return r;
      })
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------------------
// GET /runs/:id
// ------------------------------
app.get("/runs/:id", async (req, res) => {
  try {
    const row = await getAsync(
      `SELECT * FROM runs WHERE id = ?`,
      [Number(req.params.id)]
    );
    if (!row) return res.status(404).json({ error: "not found" });

    try {
      row.args = JSON.parse(row.args);
    } catch {}
    try {
      row.meta_json = JSON.parse(row.meta_json);
    } catch {}
    try {
      row.summary_json = JSON.parse(row.summary_json);
    } catch {}

    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------------------
// GET /runs/:id/events
// ------------------------------
app.get("/runs/:id/events", async (req, res) => {
  const run_id = Number(req.params.id);
  try {
    const rows = await allAsync(
      `SELECT id, tick, event_json, created_at
       FROM events WHERE run_id = ?
       ORDER BY id ASC`,
      [run_id]
    );

    res.json(
      rows.map(r => ({
        id: r.id,
        tick: r.tick,
        event: JSON.parse(r.event_json),
        created_at: r.created_at
      }))
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------------------
// DELETE /runs/:id  (New)
// ------------------------------
app.delete("/runs/:id", async (req, res) => {
  const id = Number(req.params.id);

  await runAsync(`DELETE FROM events WHERE run_id = ?`, [id]);
  await runAsync(`DELETE FROM runs WHERE id = ?`, [id]);

  res.json({ deleted: true });
});

// ------------------------------
// GET /runs/:id/summary (New)
// ------------------------------
app.get("/runs/:id/summary", async (req, res) => {
  const run_id = Number(req.params.id);

  const row = await getAsync(
    `SELECT summary_json FROM runs WHERE id = ?`,
    [run_id]
  );

  if (!row || !row.summary_json)
    return res.status(404).json({ error: "summary not found" });

  res.json(JSON.parse(row.summary_json));
});

// ------------------------------
app.use("/uploads", express.static(UPLOAD_DIR));

// ------------------------------
// HTTP → WebSocket Upgrade
// ------------------------------
const server = app.listen(process.env.PORT || 3001, () =>
  console.log("Backend listening on port", server.address().port)
);

server.on("upgrade", (req, socket, head) => {
  wss.handleUpgrade(req, socket, head, ws =>
    wss.emit("connection", ws, req)
  );
});

wss.on("connection", ws => {
  wsClients.add(ws);
  ws.on("close", () => wsClients.delete(ws));
});
