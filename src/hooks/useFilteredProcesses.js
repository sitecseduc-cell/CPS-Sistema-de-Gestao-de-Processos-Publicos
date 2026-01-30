import { useMemo } from 'react';

// Cole o hook useFilteredProcesses que estava no App.jsx
const useFilteredProcesses = (searchQuery, processes) => {
  return useMemo(() => {
    if (!searchQuery) return processes;
    const lowercasedQuery = searchQuery.toLowerCase();
    return processes.filter(p =>
      (p.id && p.id.toLowerCase().includes(lowercasedQuery)) ||
      (p.solicitante && p.solicitante.toLowerCase().includes(lowercasedQuery)) ||
      (p.status && p.status.toLowerCase().includes(lowercasedQuery))
    );
  }, [searchQuery, processes]);
};

export default useFilteredProcesses;