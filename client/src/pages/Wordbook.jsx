import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const STATUS_OPTIONS = [
  { value: '', label: '全て' },
  { value: 'new', label: '🔵 新着' },
  { value: 'learning', label: '🟡 学習中' },
  { value: 'used', label: '🟢 使用済' },
  { value: 'mastered', label: '⭐ 習得' },
];

const STATUS_COLOR = {
  new: 'bg-blue-100 text-blue-700',
  learning: 'bg-yellow-100 text-yellow-700',
  used: 'bg-green-100 text-green-700',
  mastered: 'bg-yellow-200 text-yellow-800',
};

export default function Wordbook() {
  const [words, setWords] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    fetch(`/api/words?${params}`)
      .then(r => r.json())
      .then(setWords)
      .catch(() => {});
  }, [statusFilter]);

  const filtered = search
    ? words.filter(w =>
        w.word.includes(search) ||
        w.reading?.includes(search) ||
        w.meaning?.includes(search)
      )
    : words;

  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-24">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-gray-800">📚 単語帳</h2>
        <span className="text-sm text-gray-500">{filtered.length}語</span>
      </div>

      {/* フィルター */}
      <div className="mb-3">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="絞り込み検索..."
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-300 mb-2"
        />
        <div className="flex gap-2 overflow-x-auto pb-1">
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition
                ${statusFilter === opt.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 単語リスト */}
      {filtered.length === 0 ? (
        <p className="text-center text-gray-400 mt-16 text-sm">単語がありません</p>
      ) : (
        <div className="space-y-2">
          {filtered.map(w => (
            <button
              key={w.id}
              onClick={() => navigate(`/word/${w.id}`)}
              className="w-full text-left bg-white rounded-xl px-4 py-3 shadow-sm
                         border border-gray-100 hover:border-blue-300 transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-gray-800">{w.word}</span>
                  {w.reading && (
                    <span className="text-gray-500 text-sm ml-1">（{w.reading}）</span>
                  )}
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{w.meaning}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ml-2 shrink-0
                                  ${STATUS_COLOR[w.status] ?? STATUS_COLOR.new}`}>
                  {w.status === 'mastered' ? '⭐' : w.status === 'used' ? '🟢' :
                   w.status === 'learning' ? '🟡' : '🔵'}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
