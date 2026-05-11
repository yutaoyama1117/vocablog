import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: '検索', icon: '🔍' },
  { to: '/wordbook', label: '単語帳', icon: '📚' },
  { to: '/dashboard', label: '記録', icon: '📊' },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200
                    flex justify-around z-50 py-2 shadow-lg">
      {links.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center text-xs px-4 py-1 rounded-lg transition-colors
             ${isActive ? 'text-blue-600 font-bold' : 'text-gray-500'}`
          }
        >
          <span className="text-xl">{icon}</span>
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
