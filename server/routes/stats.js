import { Router } from 'express';
import { getStats, getLevelInfo, getWordStats } from '../db/stats.js';

const router = Router();

router.get('/', (req, res) => {
  const stats = getStats();
  const levelInfo = getLevelInfo(stats.total_xp);
  const wordStats = getWordStats();

  res.json({
    ...stats,
    ...levelInfo,
    ...wordStats,
  });
});

export default router;
