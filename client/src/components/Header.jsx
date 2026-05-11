import { useEffect, useState } from 'react';

export default function Header() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats).catch(() => {});
  }, []);

  if (!stats) return <div className="h-14 bg-blue-600" />;

  const { level, title, total_xp, nextLevelXp, progress, streak_days } = stats;

  return (
    <header className="bg-blue-600 text-white px-4 py-3 sticky top-0 z-50 shadow-md">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-1">
          <div className="font-bold text-sm">
            Lv.{level} <span className="font-normal opacity-80">{title}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span>📚 {stats.total ?? 0}語</span>
            {streak_days > 0 && <span>🔥 {streak_days}日</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-blue-400 rounded-full h-2">
            <div
              className="bg-white rounded-full h-2 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs opacity-80 whitespace-nowrap">
            {total_xp.toLocaleString()} / {nextLevelXp.toLocaleString()} XP
          </span>
        </div>
      </div>
    </header>
  );
}
