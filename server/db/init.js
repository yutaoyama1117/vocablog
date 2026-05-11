import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const PROJECT_ROOT = join(__dirname, '..', '..');

const require = createRequire(import.meta.url);
const { Database } = require('node-sqlite3-wasm');

export function getDbPath() {
  const raw = process.env.DB_PATH || './data/vocablog.db';
  return raw.startsWith('/') ? raw : join(PROJECT_ROOT, raw.replace('./', ''));
}

export function openDb() {
  const dbPath = getDbPath();
  const dbDir = dirname(dbPath);
  if (!existsSync(dbDir)) mkdirSync(dbDir, { recursive: true });
  return new Database(dbPath);
}

export function initDb() {
  const db = openDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS words (
      id                  INTEGER PRIMARY KEY AUTOINCREMENT,
      word                TEXT NOT NULL,
      reading             TEXT,
      meaning             TEXT NOT NULL,
      example             TEXT,
      usage_note          TEXT,
      synonyms            TEXT,
      source_url          TEXT,
      source_memo         TEXT,
      tags                TEXT,
      status              TEXT DEFAULT 'new',
      used_count          INTEGER DEFAULT 0,
      xp_earned           INTEGER DEFAULT 0,
      reminder_sent_count INTEGER DEFAULT 0,
      created_at          DATETIME DEFAULT (datetime('now')),
      next_reminder_at    DATE DEFAULT (date('now', '+3 days'))
    );

    CREATE TABLE IF NOT EXISTS user_stats (
      id                 INTEGER PRIMARY KEY DEFAULT 1,
      total_xp           INTEGER DEFAULT 0,
      level              INTEGER DEFAULT 1,
      streak_days        INTEGER DEFAULT 0,
      last_activity_date DATE
    );

    CREATE TABLE IF NOT EXISTS usage_logs (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      word_id   INTEGER NOT NULL,
      logged_at DATETIME DEFAULT (datetime('now')),
      FOREIGN KEY (word_id) REFERENCES words(id)
    );
  `);

  // 既存DBへのマイグレーション: type カラムがなければ追加
  const cols = db.all(`PRAGMA table_info(words)`);
  if (!cols.some(c => c.name === 'type')) {
    db.exec(`ALTER TABLE words ADD COLUMN type TEXT DEFAULT '単語'`);
  }

  // user_stats の初期レコードを1件だけ作る
  const existing = db.get('SELECT id FROM user_stats WHERE id = 1');
  if (!existing) {
    db.run('INSERT INTO user_stats (id) VALUES (1)');
  }

  db.close();
}
