import { useMemo } from 'react';
import { useAppData } from '../context/DataContext';

export function useSheet(sheetName) {
  const { data, loading, error, refresh } = useAppData();
  const sheetData = useMemo(() => data[sheetName] || [], [data, sheetName]);
  return { data: sheetData, loading, error, reload: refresh };
}

export function useMultipleSheets(sheetNames) {
  const { data, loading, error, refresh } = useAppData();

  const filtered = useMemo(() => {
    const result = {};
    sheetNames.forEach((name) => {
      result[name] = data[name] || [];
    });
    return result;
  }, [data, sheetNames.join(',')]);

  return { data: filtered, loading, error, reload: refresh };
}
