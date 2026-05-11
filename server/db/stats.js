import { openDb } from './init.js';

// レベルのXP閾値テーブル（Lv1〜30を補間）
const LEVEL_THRESHOLDS = (() => {
  const anchors = [[1,0],[5,1000],[10,5000],[20,20000],[30,60000]];
  const thresholds = [0]; // Lv1 = 0XP

  for (let i = 0; i < anchors.length - 1; i++) {
    const [lv1, xp1] = anchors[i];
    const [lv2, xp2] = anchors[i + 1];
    const steps = lv2 - lv1;
    const xpPerLevel = (xp2 - xp1) / steps;
    for (let l = lv1 + 1; l <= lv2; l++) {
      thresholds[l] = Math.round(xp1 + xpPerLevel * (l - lv1));
    }
  }
  return thresholds; // index = level
})();

const LEVEL_TITLES = {
  1: '語彙の卵', 5: '言葉の収集家', 10: '語彙の探求者',
  20: '言語の錬金術師', 30: '語彙の賢人',
};

export function getLevelInfo(totalXp) {
  let level = 1;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 1; i--) {
    if (totalXp >= LEVEL_THRESHOLDS[i]) { level = i; break; }
  }
  const currentLevelXp = LEVEL_THRESHOLDS[level] ?? 0;
  const nextLevelXp = LEVEL_THRESHOLDS[level + 1] ?? LEVEL_THRESHOLDS[level] + 5000;
  const progress = nextLevelXp > currentLevelXp
    ? Math.round(((totalXp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100)
    : 100;

  // 最も近い称号を取得
  const titleLevels = Object.keys(LEVEL_TITLES).map(Number).sort((a, b) => b - a);
  const titleLevel = titleLevels.find(l => level >= l) ?? 1;
  const title = LEVEL_TITLES[titleLevel];

  return { level, title, currentXp: totalXp, nextLevelXp, progress };
}

export function getStats() {
  const db = openDb();
  const stats = db.get('SELECT * FROM user_stats WHERE id = 1');
  db.close();
  return stats ?? { total_xp: 0, level: 1, streak_days: 0, last_activity_date: null };
}

export function addXp(xp) {
  const db = openDb();
  const today = new Date().toISOString().slice(0, 10);
  const stats = db.get('SELECT * FROM user_stats WHERE id = 1');

  let streakDays = stats?.streak_days ?? 0;
  const lastDate = stats?.last_activity_date;

  if (lastDate) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (lastDate === today) {
      // 今日すでに活動済み → ストリーク変動なし
    } else if (lastDate === yesterday) {
      // 昨日活動済み → 連続継続
      streakDays += 1;
    } else {
      // 途切れた
      streakDays = 1;
    }
  } else {
    streakDays = 1;
  }

  // 7日連続ボーナス
  const streakBonus = streakDays > 0 && streakDays % 7 === 0 ? 100 : 0;
  const totalAdded = xp + streakBonus;

  db.run(
    `UPDATE user_stats
     SET total_xp = total_xp + ?,
         streak_days = ?,
         last_activity_date = ?
     WHERE id = 1`,
    [totalAdded, streakDays, today]
  );

  const updated = db.get('SELECT total_xp FROM user_stats WHERE id = 1');
  const newTotal = updated?.total_xp ?? totalAdded;
  const { level } = getLevelInfo(newTotal);

  db.run('UPDATE user_stats SET level = ? WHERE id = 1', [level]);
  db.close();

  return { xpAdded: totalAdded, streakBonus, streakDays };
}

export function getWordStats() {
  const db = openDb();
  const total = db.get('SELECT COUNT(*) AS count FROM words').count;
  const usedCount = db.get(`SELECT COUNT(*) AS count FROM words WHERE used_count >= 1`).count;
  const masteredCount = db.get(`SELECT COUNT(*) AS count FROM words WHERE used_count >= 3`).count;

  const todayStr = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  const weeklyAdded = db.get(
    `SELECT COUNT(*) AS count FROM words WHERE date(created_at) >= ?`, [weekAgo]
  ).count;

  // 月別登録数（直近6ヶ月）
  const monthly = db.all(
    `SELECT strftime('%Y-%m', created_at) AS month, COUNT(*) AS count
     FROM words
     WHERE created_at >= date('now', '-6 months')
     GROUP BY month ORDER BY month`
  );

  db.close();
  return { total, usedCount, masteredCount, weeklyAdded, monthly };
}
