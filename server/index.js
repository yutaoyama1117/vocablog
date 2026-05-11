import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';
import { initDb } from './db/init.js';
import { startScheduler } from './scheduler/cron.js';
import generateRouter from './routes/generate.js';
import wordsRouter from './routes/words.js';
import statsRouter from './routes/stats.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// APIルート
app.use('/api/generate', generateRouter);
app.use('/api/words', wordsRouter);
app.use('/api/stats', statsRouter);

// 本番ビルドの静的ファイルを配信
const clientBuild = join(__dirname, '..', 'client', 'dist');
if (existsSync(clientBuild)) {
  app.use(express.static(clientBuild));
  app.get('*', (req, res) => {
    res.sendFile(join(clientBuild, 'index.html'));
  });
}

initDb();
startScheduler();

app.listen(PORT, () => {
  console.log(`🚀 VocabLog サーバー起動: http://localhost:${PORT}`);
});
