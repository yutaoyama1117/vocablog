import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const STATUS_COLOR = {
  new: 'bg-blue-100 text-blue-700',
  learning: 'bg-yellow-100 text-yellow-700',
  used: 'bg-green-100 text-green-700',
  mastered: 'bg-yellow-200 text-yellow-800',
};
const STATUS_LABEL = { new: '新着', learning: '学習中', used: '使用済', mastered: '習得' };

export default function Home() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recent, setRecent] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/words/recent')
      .then(r => r.json())
      .then(setRecent)
      .catch(() => {});
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    const word = query.trim();
    if (!word) return;

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      navigate('/result', { state: data });
    } catch (err) {
      setError(err.message || '生成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-24">
      {/* 検索バー */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2 shadow-sm">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="単語を入力..."
            className="flex-1 border border-gray-300 rounded-xl px-4 py-3
                       text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="bg-blue-600 text-white px-5 py-3 rounded-xl font-bold
                       disabled:opacity-50 transition hover:bg-blue-700"
          >
            {loading ? '⏳' : '🔍'}
          </button>
        </div>
        {error && <p className="text-red-500 text-sm mt-2 px-1">{error}</p>}
      </form>

      {/* 最近調べた単語 */}
      {recent.length > 0 && (
        <>
          <h2 className="text-sm font-semibold text-gray-500 mb-3">── 最近調べた単語 ──</h2>
          <div className="space-y-2">
            {recent.map(w => (
              <button
                key={w.id}
                onClick={() => navigate(`/word/${w.id}`)}
                className="w-full text-left bg-white rounded-xl px-4 py-3 shadow-sm
                           border border-gray-100 hover:border-blue-300 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-800">
                    {w.word}
                    {w.reading && <span className="font-normal text-gray-500 text-sm ml-1">（{w.reading}）</span>}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLOR[w.status] ?? STATUS_COLOR.new}`}>
                    {STATUS_LABEL[w.status] ?? '新着'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {recent.length === 0 && !loading && (
        <p className="text-center text-gray-400 mt-16 text-sm">
          単語を入力して、語彙を積み上げよう📚
        </p>
      )}
    </div>
  );
}
