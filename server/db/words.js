import { openDb } from './init.js';

// 単語のステータスを動的に計算する
function computeStatus(word) {
  if (word.used_count >= 3) return 'mastered';
  if (word.used_count >= 1) return 'used';
  const daysSince = (Date.now() - new Date(word.created_at).getTime()) / 86400000;
  return daysSince <= 7 ? 'new' : 'learning';
}

export function saveWord(data) {
  const db = openDb();
  const info = db.run(
    `INSERT INTO words
       (word, reading, meaning, example, usage_note, synonyms,
        source_url, source_memo, tags)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.word, data.reading || null, data.meaning,
      data.example || null, data.usage_note || null,
      data.synonyms || null, data.source_url || null,
      data.source_memo || null, data.tags || null,
    ]
  );
  db.close();
  return info.lastInsertRowid;
}

export function getWords({ tag, status, order = 'created_at DESC' } = {}) {
  const db = openDb();
  const conditions = ['1=1'];
  const params = [];

  if (tag) { conditions.push('tags LIKE ?'); params.push(`%${tag}%`); }

  const rows = db.all(
    `SELECT * FROM words WHERE ${conditions.join(' AND ')} ORDER BY ${order}`,
    params
  );
  db.close();

  const withStatus = rows.map(w => ({ ...w, status: computeStatus(w) }));
  if (status) return withStatus.filter(w => w.status === status);
  return withStatus;
}

export function getWordById(id) {
  const db = openDb();
  const row = db.get('SELECT * FROM words WHERE id = ?', [id]);
  db.close();
  if (!row) return null;
  return { ...row, status: computeStatus(row) };
}

export function markUsed(wordId) {
  const db = openDb();
  db.run(
    'UPDATE words SET used_count = used_count + 1 WHERE id = ?',
    [wordId]
  );
  db.run(
    'INSERT INTO usage_logs (word_id) VALUES (?)',
    [wordId]
  );
  const word = db.get('SELECT used_count FROM words WHERE id = ?', [wordId]);
  db.close();
  return word?.used_count ?? 1;
}

export function getRecentWords(limit = 10) {
  const db = openDb();
  const rows = db.all(
    'SELECT id, word, reading, used_count, created_at FROM words ORDER BY created_at DESC LIMIT ?',
    [limit]
  );
  db.close();
  return rows.map(w => ({ ...w, status: computeStatus(w) }));
}

export function getReminderWords() {
  const db = openDb();
  const rows = db.all(
    `SELECT * FROM words
     WHERE next_reminder_at IS NOT NULL
       AND date(next_reminder_at) <= date('now', 'localtime')
       AND reminder_sent_count < 3`,
  );
  db.close();
  return rows.map(w => ({ ...w, status: computeStatus(w) }));
}

// リマインド送信後に次の日程を設定する
export function advanceReminder(wordId, currentCount) {
  const db = openDb();
  const word = db.get('SELECT created_at FROM words WHERE id = ?', [wordId]);
  if (!word) { db.close(); return; }

  const stages = [3, 7, 21]; // 保存からN日後
  const nextStage = currentCount + 1;
  const nextDate = nextStage < stages.length
    ? `date('${word.created_at.slice(0, 10)}', '+${stages[nextStage]} days')`
    : 'NULL';

  db.run(
    `UPDATE words SET reminder_sent_count = ?, next_reminder_at = (${nextDate}) WHERE id = ?`,
    [nextStage, wordId]
  );
  db.close();
}
