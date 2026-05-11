import cron from 'node-cron';
import { getReminderWords, advanceReminder } from '../db/words.js';
import { sendReminderNotification } from '../slack/notify.js';

const REMINDER_STAGES_DAYS = [3, 7, 21];

export function startScheduler() {
  const schedule = process.env.REMINDER_CRON || '0 8 * * *';

  cron.schedule(schedule, async () => {
    console.log(`[${new Date().toLocaleString('ja-JP')}] リマインドチェック開始`);

    const words = getReminderWords();
    if (words.length === 0) {
      console.log('今日のリマインド対象なし');
      return;
    }

    for (const word of words) {
      const daysSinceSaved = REMINDER_STAGES_DAYS[word.reminder_sent_count] ?? 21;
      try {
        await sendReminderNotification(word, daysSinceSaved);
        advanceReminder(word.id, word.reminder_sent_count);
        console.log(`✅ リマインド送信: ${word.word}`);
      } catch (err) {
        console.error(`❌ リマインド失敗 (${word.word}):`, err.message);
      }
    }
  }, { timezone: 'Asia/Tokyo' });

  console.log(`🕐 リマインドスケジューラー起動: "${schedule}"`);
}
