-- runs table stores one simulator run (algorithm + metadata)
CREATE TABLE IF NOT EXISTS runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  algorithm TEXT NOT NULL,
  args TEXT,
  status TEXT NOT NULL, -- running | paused | finished | killed | error
  started_at INTEGER NOT NULL,
  finished_at INTEGER,
  summary_json TEXT, -- final JSON summary printed by scheduler (if any)
  meta_json TEXT
);

-- events stores each JSON event line emitted by scheduler
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id INTEGER NOT NULL,
  tick INTEGER,
  event_json TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY(run_id) REFERENCES runs(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_events_run_id ON events(run_id);
CREATE INDEX IF NOT EXISTS idx_runs_started_at ON runs(started_at);
