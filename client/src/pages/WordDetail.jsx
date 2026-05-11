import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import XPToast from '../components/XPToast';

const STATUS_INFO = {
  new:      { label: '🔵 新着',   color: 'bg-blue-100 text-blue-700' },
  learning: { label: '🟡 学習中', color: 'bg-yellow-100 text-yellow-700' },
  used:     { label: '🟢 使用済', color: 'bg-green-100 text-green-700' },
  mastered: { label: '⭐ 習得',   color: 'bg-yellow-200 text-yellow-800' },
};

export default function WordDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [word, setWord] = useState(null);
  const [toast, setToast] = useState(null);
  const [usedLoading, setUsedLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/words/${id}`)
      .then(r => r.json())
      .then(data => { if (data.error) navigate('/'); else setWord(data); })
      .catch(() => navigate('/'));
  }, [id]);

  const handleUsed = async () => {
    setUsedLoading(true);
    try {
      const res = await fetch(`/api/words/${id}/used`, { method: 'POST' });
      const data = await res.json();
      setToast(data.message);
      setWord(prev => ({ ...prev, used_count: data.usedCount, status: data.status }));
    } catch {
      alert('記録に失敗しました');
    } finally {
      setUsedLoading(false);
    }
  };

  if (!word) return <div className="text-center pt-20 text-gray-400">読み込み中...</div>;

  const statusInfo = STATUS_INFO[word.status] ?? STATUS_INFO.new;

  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-24">
      {toast && <XPToast message={toast} onDone={() => setToast(null)} />}

      <button onClick={() => navigate(-1)} className="text-blue-600 text-sm mb-4">← 戻る</button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
        <div className="flex items-start justify-between mb-3">
          <h1 className="text-2xl font-bold text-gray-800">
            {word.word}
            {word.reading && <span className="text-base font-normal text-gray-500 ml-2">（{word.reading}）</span>}
          </h1>
          <div className="flex flex-col items-end gap-1 ml-2 shrink-0">
            {word.type && word.type !== '単語' && (
              <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 font-medium">
                {word.type}
              </span>
            )}
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <Section icon="📖" title="意味" content={word.meaning} />
          {word.example && <Section icon="💬" title="例文" content={word.example} />}
          {word.usage_note && <Section icon="🎯" title="こんな場面で使える" content={word.usage_note} />}
          {word.synonyms && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 mb-1">🔗 類義語・関連語</h3>
              <div className="flex flex-wrap gap-1">
                {word.synonyms.split(',').map(s => (
                  <span key={s.trim()} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                    {s.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
          {(word.source_url || word.source_memo) && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 mb-1">🔗 出会った文脈</h3>
              {word.source_url && (
                <a href={word.source_url} target="_blank" rel="noreferrer"
                   className="text-blue-600 text-sm underline break-all">
                  {word.source_url}
                </a>
              )}
              {word.source_memo && <p className="text-sm text-gray-600 mt-1">{word.source_memo}</p>}
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400">
          保存日: {word.created_at?.slice(0, 10)} ／ 使った回数: {word.used_count}回
        </div>
      </div>

      {word.status !== 'mastered' && (
        <button
          onClick={handleUsed}
          disabled={usedLoading}
          className="w-full bg-green-500 text-white font-bold py-4 rounded-2xl
                     text-base shadow-md disabled:opacity-50 hover:bg-green-600 transition"
        >
          {usedLoading ? '記録中...' : '✅ 使った！ +50XP'}
        </button>
      )}
      {word.status === 'mastered' && (
        <div className="text-center text-yellow-600 font-bold py-4">
          ⭐ この単語はマスター済みです！
        </div>
      )}
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
