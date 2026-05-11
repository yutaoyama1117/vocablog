import { createContext, useContext, useState, useCallback } from 'react';

const StatsContext = createContext(null);

export function StatsProvider({ children }) {
  const [stats, setStats] = useState(null);

  const refreshStats = useCallback(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats).catch(() => {});
  }, []);

  return (
    <StatsContext.Provider value={{ stats, refreshStats }}>
      {children}
    </StatsContext.Provider>
  );
}

export function useStats() {
  return useContext(StatsContext);
}
