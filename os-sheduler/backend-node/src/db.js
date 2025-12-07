// src/db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_DIR = path.resolve(__dirname, '..', 'data');
const DB_FILE = path.join(DB_DIR, 'runs.db');

if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

const db = new sqlite3.Database(DB_FILE);

function init() {
  const sql = fs.readFileSync(path.join(__dirname, '..', 'migrations', 'init_db.sql'), 'utf8');
  db.exec(sql, (err) => {
    if (err) console.error('Failed to initialize DB:', err);
  });
}

function runAsync(sql, params = []) {
  return new Promise((res, rej) => {
    db.run(sql, params, function (err) {
      if (err) return rej(err);
      res(this);
    });
  });
}

function allAsync(sql, params = []) {
  return new Promise((res, rej) => {
    db.all(sql, params, (err, rows) => {
      if (err) return rej(err);
      res(rows);
    });
  });
}

function getAsync(sql, params = []) {
  return new Promise((res, rej) => {
    db.get(sql, params, (err, row) => {
      if (err) return rej(err);
      res(row);
    });
  });
}

module.exports = {
  db,
  init,
  runAsync,
  allAsync,
  getAsync,
  DB_FILE
};
