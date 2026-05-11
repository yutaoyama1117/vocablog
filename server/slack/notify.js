import { IncomingWebhook } from '@slack/webhook';
import { getLevelInfo } from '../db/stats.js';

function getWebhook() {
  const url = process.env.SLACK_WEBHOOK_URL;
  if (!url) throw new Error('SLACK_WEBHOOK_URL が設定されていません');
  return new IncomingWebhook(url);
}

// 単語保存時の即時通知
export async function sendSaveNotification({ word, reading, meaning, example, source_url, totalWords, stats }) {
  const webhook = getWebhook();
  const { level } = getLevelInfo(stats.total_xp);
  const reading_ = reading ? `（${reading}）` : '';

  const lines = [
    `📖 *新しい単語を記録しました*`,
    `*${word}${reading_}*`,
    `意味: ${meaning}`,
  ];
  if (example) lines.push(`用例: _${example}_`);
  if (source_url) lines.push(`🔗 出典: ${source_url}`);
  lines.push(`📚 累計 ${totalWords}語  Lv.${level}`);

  await webhook.send({
    blocks: [
      {
        type: 'section',
        text: { type: 'mrkdwn', text: lines.join('\n') },
      },
    ],
  });
}

// 復習リマインド通知
export async function sendReminderNotification(word, daysSinceSaved) {
  const webhook = getWebhook();
  const reading_ = word.reading ? `（${word.reading}）` : '';

  await webhook.send({
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: [
            `🔔 *復習リマインド*`,
            `「*${word.word}${reading_}*」を保存してから${daysSinceSaved}日が経ちました。`,
            `意味: ${word.meaning}`,
            `→ アプリで確認: https://vocablog-production.up.railway.app/word/${word.id}`,
          ].join('\n'),
        },
      },
    ],
  });
}
