import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import XPToast from '../components/XPToast';
import { useStats } from '../context/StatsContext';

export default function SearchResult() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { refreshStats } = useStats();
  const [sourceUrl, setSourceUrl] = useState('');
  const [sourceMemo, setSourceMemo] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  if (!state) {
    navigate('/');
    return null;
  }

  const { word, reading, meaning, example, usage_note, synonyms, type } = state;

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/words', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word, reading, meaning, example, usage_note, synonyms, type,
          source_url: sourceUrl.trim() || null,
          source_memo: sourceMemo.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      refreshStats();
      setToast(data.message);
      setTimeout(() => navigate(`/word/${data.id}`), 2200);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-24">
      {toast && <XPToast message={toast} onDone={() => setToast(null)} />}

      <button onClick={() => navigate(-1)} className="text-blue-600 text-sm mb-4">← 戻る</button>

      {/* 単語ヘッダー */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
        <div className="flex items-start justify-between mb-1">
          <h1 className="text-2xl font-bold text-gray-800">
            {word}
            {reading && <span className="text-base font-normal text-gray-500 ml-2">（{reading}）</span>}
          </h1>
          {type && (
            <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 font-medium ml-2 shrink-0">
              {type}
            </span>
          )}
        </div>

        <div className="mt-4 space-y-4">
          <Section icon="📖" title="意味" content={meaning} />
          {example && <Section icon="💬" title="例文" content={example} />}
          {usage_note && <Section icon="🎯" title="こんな場面で使える" content={usage_note} />}
          {synonyms && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 mb-1">🔗 類義語・関連語</h3>
              <div className="flex flex-wrap gap-1">
                {synonyms.split(',').map(s => (
                  <span key={s.trim()} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                    {s.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 文脈入力 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
        <h3 className="text-sm font-semibold text-gray-600 mb-3">🔗 出会った文脈（任意・+10XP）</h3>
        <input
          type="url"
          value={sourceUrl}
          onChange={e => setSourceUrl(e.target.value)}
          placeholder="URLを貼る"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-2
                     focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        <textarea
          value={sourceMemo}
          onChange={e => setSourceMemo(e.target.value)}
          placeholder="メモを書く"
          rows={2}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
        />
      </div>

      {/* 保存ボタン */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl
                   text-base shadow-md disabled:opacity-50 hover:bg-blue-700 transition"
      >
        {saving ? '保存中...' : '💾 保存する (+20XP)'}
      </button>
    </div>
  );
}

function Section({ icon, title, content }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-500 mb-1">{icon} {title}</h3>
      <p className="text-gray-800 text-sm leading-relaxed">{content}</p>
    </div>
  );
}
