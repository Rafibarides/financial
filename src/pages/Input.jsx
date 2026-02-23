import { useState, useMemo, useCallback } from 'react';
import { useMultipleSheets } from '../hooks/useSheetData';
import { useFilters } from '../hooks/useFilters';
import { SHEET_NAMES } from '../utils/constants';
import { colors } from '../styles/colors';
import Loader from '../components/common/Loader';
import TextInput from '../components/common/TextInput';
import Select from '../components/common/Select';
import TransactionForm from '../components/input/TransactionForm';
import TransactionLog from '../components/input/TransactionLog';
import QuickAdd from '../components/input/QuickAdd';
import CSVImport from '../components/input/CSVImport';
import { appendRow } from '../services/sheets';

const sheets = [
  SHEET_NAMES.CATEGORY,
  SHEET_NAMES.ACCOUNT,
  SHEET_NAMES.TRANSACTION,
];

export default function Input() {
  const { data, loading, error, reload } = useMultipleSheets(sheets);
  const [submitting, setSubmitting] = useState(false);

  const categories = data[SHEET_NAMES.CATEGORY] || [];
  const accounts = data[SHEET_NAMES.ACCOUNT] || [];
  const transactions = data[SHEET_NAMES.TRANSACTION] || [];

  const catMap = useMemo(() => {
    const m = {};
    categories.forEach((c) => { m[c.id] = c; });
    return m;
  }, [categories]);

  const expenseCategories = useMemo(
    () => categories.filter((c) => c.type === 'expense' && c.is_active !== 'false'),
    [categories]
  );

  const sortedTx = useMemo(() => {
    return [...transactions]
      .filter((t) => t.source_type === 'manual' || t.source_type === 'import')
      .sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date));
  }, [transactions]);

  const {
    filtered,
    search,
    setSearch,
    filters,
    updateFilter,
    sortKey,
    sortDir,
    toggleSort,
  } = useFilters(sortedTx);

  const handleSubmit = useCallback(async (formData) => {
    setSubmitting(true);
    try {
      const id = `tx_${Date.now()}`;
      const row = [
        id, 'user_1', formData.account_id, formData.category_id, '', '', '',
        formData.amount, 'USD', formData.transaction_date, formData.description,
        'manual', formData.is_recurring ? 'true' : 'false', new Date().toISOString(),
      ];
      await appendRow(SHEET_NAMES.TRANSACTION, row);
      await reload();
    } catch (err) {
      console.error('Failed to submit:', err);
    } finally {
      setSubmitting(false);
    }
  }, [reload]);

  const handleCSVImport = useCallback(async (rows) => {
    const defaultAcct = accounts.find((a) => a.name?.includes('Business'))?.id || accounts[0]?.id || '';
    for (const row of rows) {
      const id = `tx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      await appendRow(SHEET_NAMES.TRANSACTION, [
        id, 'user_1', defaultAcct, row.category_id, '', '', '',
        row.amount, 'USD', row.date, row.description,
        'import', 'false', new Date().toISOString(),
      ]);
    }
    await reload();
  }, [accounts, reload]);

  if (loading) return <Loader />;

  if (error) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center' }}>
        <p style={{ color: colors.text.tertiary, fontSize: '14px' }}>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 600, color: colors.text.primary, letterSpacing: '-0.03em' }}>
          Input
        </h2>
        <p style={{ fontSize: '13px', color: colors.text.tertiary, marginTop: '2px' }}>
          Track spending as it happens
        </p>
      </div>

      {/* Quick Add */}
      <div style={{ marginBottom: '24px' }}>
        <QuickAdd onSubmit={handleSubmit} accounts={accounts} />
      </div>

      {/* Full form */}
      <div style={{ marginBottom: '24px' }}>
        <TransactionForm
          categories={expenseCategories}
          accounts={accounts}
          onSubmit={handleSubmit}
        />
      </div>

      {/* CSV Import */}
      <div style={{ marginBottom: '32px' }}>
        <CSVImport categories={catMap} onImport={handleCSVImport} />
      </div>

      {/* Filters + log */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'flex-end' }}>
        <div style={{ flex: 1, maxWidth: '300px' }}>
          <TextInput placeholder="Search transactions..." value={search} onChange={setSearch} />
        </div>
        <Select
          value={filters.category_id || ''}
          onChange={(v) => updateFilter('category_id', v)}
          options={[{ value: '', label: 'All Categories' }, ...expenseCategories.map((c) => ({ value: c.id, label: c.name }))]}
          style={{ width: '180px' }}
        />
      </div>

      <TransactionLog
        transactions={filtered}
        categories={catMap}
        onSort={toggleSort}
        sortKey={sortKey}
        sortDir={sortDir}
      />

      {submitting && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: colors.bg.elevated,
          borderRadius: '8px',
          padding: '10px 16px',
          fontSize: '12px',
          color: colors.text.secondary,
        }}>
          Saving...
        </div>
      )}
    </div>
  );
}
