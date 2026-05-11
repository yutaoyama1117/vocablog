import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats).catch(() => {});
  }, []);

  if (!stats) return <div className="text-center pt-20 text-gray-400">読み込み中...</div>;

  const {
    level, title, total_xp, nextLevelXp, progress, streak_days,
    total, usedCount, masteredCount, weeklyAdded, monthly,
  } = stats;

  const usedRate = total > 0 ? Math.round((usedCount / total) * 100) : 0;
  const maxMonthly = Math.max(...(monthly?.map(m => m.count) ?? [1]), 1);

  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-24">
      <h2 className="text-lg font-bold text-gray-800 mb-4">📊 語彙資産</h2>

      {/* レベルカード */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white
                      rounded-2xl p-5 mb-4 shadow-md">
        <div className="text-lg font-bold mb-1">Lv.{level}「{title}」</div>
        <div className="bg-blue-400 rounded-full h-3 mb-1">
          <div
            className="bg-white rounded-full h-3 transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-xs opacity-80">
          {total_xp.toLocaleString()} / {nextLevelXp.toLocaleString()} XP（次のLvまで {(nextLevelXp - total_xp).toLocaleString()} XP）
        </div>
      </div>

      {/* 統計グリッド */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <StatCard label="📚 総単語数" value={`${total}語`} />
        <StatCard label="✅ 使用済み" value={`${usedCount}語（${usedRate}%）`} />
        <StatCard label="⭐ 習得済み" value={`${masteredCount}語`} />
        <StatCard label="🔥 連続記録" value={`${streak_days}日`} />
        <StatCard label="📅 今週追加" value={`${weeklyAdded}語`} />
      </div>

      {/* 月別グラフ */}
      {monthly?.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-600 mb-4">月別 登録数</h3>
          <div className="flex items-end gap-2 h-24">
            {monthly.map(m => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-blue-400 rounded-t transition-all duration-500"
                  style={{ height: `${(m.count / maxMonthly) * 80}px` }}
                />
                <span className="text-xs text-gray-500">{m.month.slice(5)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="text-lg font-bold text-gray-800">{value}</div>
    </div>
  );
}
