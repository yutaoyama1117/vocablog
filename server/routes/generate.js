import { Router } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();

// Gemini APIで単語情報を生成する
router.post('/', async (req, res) => {
  const { word } = req.body;
  if (!word?.trim()) {
    return res.status(400).json({ error: '単語を入力してください' });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    const prompt = `あなたは日本語・英語の語彙専門家です。
「${word.trim()}」について、以下のJSON形式のみで回答してください。
余分なテキスト・マークダウン・コードブロックは含めないでください。

まず入力が何かを判定してください:
- 単語: 一般的な単語（名詞・動詞・形容詞など）や英単語
- 慣用句: 複数の語が組み合わさった決まった表現（例: 猫の手も借りたい）
- ことわざ: 教訓や真理を表す短い言葉（例: 七転び八起き）
- 四字熟語: 漢字4文字の熟語（例: 一石二鳥）

{
  "type": "単語 または 慣用句 または ことわざ または 四字熟語",
  "reading": "読み方（日本語ならひらがな、英語ならカタカナ発音）",
  "meaning": "わかりやすい意味（2〜3文、具体的に）",
  "example": "自然な例文（1文、日本語で）",
  "usage_note": "こんな場面で使えるという説明（1〜2文）",
  "synonyms": "類義語・関連語（カンマ区切りで3語程度）"
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // JSONのみを抽出（```json ... ``` 形式でも対応）
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('JSONの解析に失敗しました');

    const data = JSON.parse(jsonMatch[0]);
    res.json({ word: word.trim(), ...data });
  } catch (err) {
    console.error('Gemini API エラー:', err.message);
    res.status(500).json({ error: `生成に失敗しました: ${err.message}` });
  }
});

export default router;
