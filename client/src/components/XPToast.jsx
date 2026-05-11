import { useEffect, useState } from 'react';

export default function XPToast({ message, onDone }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => { setVisible(false); onDone?.(); }, 2500);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50
                    bg-yellow-400 text-yellow-900 font-bold px-6 py-3 rounded-full
                    shadow-lg animate-bounce text-sm">
      {message}
    </div>
  );
}
