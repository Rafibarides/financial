import { useState, useMemo, useCallback } from 'react';

export function useFilters(data, filterConfig = {}) {
  const [filters, setFilters] = useState({});
  const [sortKey, setSortKey] = useState(filterConfig.defaultSort || null);
  const [sortDir, setSortDir] = useState(filterConfig.defaultDir || 'desc');
  const [search, setSearch] = useState('');

  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => {
      if (value === '' || value === null || value === undefined) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: value };
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setSearch('');
  }, []);

  const toggleSort = useCallback((key) => {
    setSortKey((prev) => {
      if (prev === key) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        return key;
      }
      setSortDir('desc');
      return key;
    });
  }, []);

  const filtered = useMemo(() => {
    let result = [...data];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((row) =>
        Object.values(row).some((v) => String(v).toLowerCase().includes(q))
      );
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (typeof value === 'function') {
        result = result.filter(value);
      } else if (Array.isArray(value)) {
        result = result.filter((row) => value.includes(row[key]));
      } else {
        result = result.filter((row) => row[key] === value);
      }
    });

    if (sortKey) {
      result.sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        const numA = parseFloat(aVal);
        const numB = parseFloat(bVal);
        if (!isNaN(numA) && !isNaN(numB)) {
          return sortDir === 'asc' ? numA - numB : numB - numA;
        }
        const strA = String(aVal || '');
        const strB = String(bVal || '');
        return sortDir === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
      });
    }

    return result;
  }, [data, filters, sortKey, sortDir, search]);

  return {
    filtered,
    filters,
    updateFilter,
    clearFilters,
    sortKey,
    sortDir,
    toggleSort,
    search,
    setSearch,
  };
}
