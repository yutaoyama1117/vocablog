import { Router } from 'express';
import { saveWord, getWords, getWordById, markUsed, getRecentWords } from '../db/words.js';
import { addXp } from '../db/stats.js';
import { sendSaveNotification } from '../slack/notify.js';
import { getStats } from '../db/stats.js';

const router = Router();

// 最近調べた単語（ホーム用）
router.get('/recent', (req, res) => {
  const words = getRecentWords(20);
  res.json(words);
});

// 単語一覧
router.get('/', (req, res) => {
  const { tag, status, order } = req.query;
  const words = getWords({ tag, status, order });
  res.json(words);
});

// 単語詳細
router.get('/:id', (req, res) => {
  const word = getWordById(parseInt(req.params.id));
  if (!word) return res.status(404).json({ error: '単語が見つかりません' });
  res.json(word);
});

// 単語を保存
router.post('/', async (req, res) => {
  const { word, reading, meaning, example, usage_note, synonyms,
    source_url, source_memo, tags, type } = req.body;

  if (!word?.trim() || !meaning?.trim()) {
    return res.status(400).json({ error: 'word と meaning は必須です' });
  }

  try {
    const id = saveWord({ word, reading, meaning, example, usage_note,
      synonyms, source_url, source_memo, tags, type });

    // XP計算: 基本20 + 文脈ボーナス10
    const hasContext = source_url?.trim() || source_memo?.trim();
    const xpBase = 20;
    const xpBonus = hasContext ? 10 : 0;
    const { xpAdded, streakBonus, streakDays } = addXp(xpBase + xpBonus);

    // Slack通知（非同期・失敗しても無視）
    const stats = getStats();
    const totalWords = getWords().length;
    sendSaveNotification({ word, reading, meaning, example,
      source_url, totalWords, stats }).catch(e => console.error('Slack通知エラー:', e.message));

    res.json({
      id, xpAdded, xpBonus,
      streakBonus, streakDays,
      message: `✅ 保存しました！ +${xpAdded}XP`,
    });
  } catch (err) {
    console.error('保存エラー:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// 「使った！」を記録
router.post('/:id/used', (req, res) => {
  const wordId = parseInt(req.params.id);
  const word = getWordById(wordId);
  if (!word) return res.status(404).json({ error: '単語が見つかりません' });

  const usedCount = markUsed(wordId);
  const { xpAdded } = addXp(50);

  const newStatus = usedCount >= 3 ? 'mastered' : 'used';
  res.json({
    usedCount, xpAdded, status: newStatus,
    message: `✅ 使えた！ +${xpAdded}XP`,
  });
});

export default router;
