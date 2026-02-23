import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { fetchAllSheets } from '../services/sheets';
import { SHEET_NAMES } from '../utils/constants';

const ALL_SHEETS = Object.values(SHEET_NAMES);

const LOAD_STEPS = [
  'Connecting to data source',
  'Loading accounts',
  'Loading categories',
  'Loading recurring rules',
  'Loading transactions',
  'Loading income sources',
  'Loading budget plans',
  'Preparing dashboard',
];

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [data, setData] = useState({});
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadStep, setLoadStep] = useState(0);
  const stepInterval = useRef(null);

  const load = useCallback(async (isInitial = false) => {
    setLoading(true);
    setError(null);

    if (isInitial) {
      setLoadStep(0);
      let step = 0;
      stepInterval.current = setInterval(() => {
        step++;
        if (step < LOAD_STEPS.length) setLoadStep(step);
      }, 400);
    }

    try {
      const result = await fetchAllSheets(ALL_SHEETS);
      setData(result);
      if (isInitial) {
        setLoadStep(LOAD_STEPS.length - 1);
        await new Promise((r) => setTimeout(r, 600));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      if (stepInterval.current) clearInterval(stepInterval.current);
      setLoading(false);
      setInitialized(true);
    }
  }, []);

  useEffect(() => {
    load(true);
    return () => {
      if (stepInterval.current) clearInterval(stepInterval.current);
    };
  }, []);

  const refresh = useCallback(() => load(false), [load]);

  const value = {
    data,
    loading: loading && !initialized,
    refreshing: loading && initialized,
    error,
    refresh,
    initialized,
    loadStep,
    loadStepLabel: LOAD_STEPS[loadStep] || '',
    loadProgress: LOAD_STEPS.length > 0 ? (loadStep + 1) / LOAD_STEPS.length : 0,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useAppData must be used within DataProvider');
  return ctx;
}
