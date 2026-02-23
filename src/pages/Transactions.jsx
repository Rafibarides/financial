import { useMemo, useState } from 'react';
import { useMultipleSheets } from '../hooks/useSheetData';
import { useFilters } from '../hooks/useFilters';
import { SHEET_NAMES, MONTHS_SHORT } from '../utils/constants';
import { colors } from '../styles/colors';
import { formatCurrency, formatDateShort, toNumber } from '../utils/formatters';
import Loader from '../components/common/Loader';
import Card from '../components/common/Card';
import Table from '../components/common/Table';
import Badge from '../components/common/Badge';
import TextInput from '../components/common/TextInput';
import Select from '../components/common/Select';
import MetricCard from '../components/dashboard/MetricCard';

const sheets = [
  SHEET_NAMES.TRANSACTION,
  SHEET_NAMES.CATEGORY,
  SHEET_NAMES.ACCOUNT,
  SHEET_NAMES.INCOME_SOURCE,
  SHEET_NAMES.TAG,
  SHEET_NAMES.TRANSACTION_TAG,
];

export default function Transactions() {
  const { data, loading, error } = useMultipleSheets(sheets);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [amountRange, setAmountRange] = useState({ min: '', max: '' });

  const transactions = data[SHEET_NAMES.TRANSACTION] || [];
  const categories = data[SHEET_NAMES.CATEGORY] || [];
  const accounts = data[SHEET_NAMES.ACCOUNT] || [];

  const catMap = useMemo(() => {
    const m = {};
    categories.forEach((c) => { m[c.id] = c; });
    return m;
  }, [categories]);

  const acctMap = useMemo(() => {
    const m = {};
    accounts.forEach((a) => { m[a.id] = a; });
    return m;
  }, [accounts]);

  const sortedTx = useMemo(() => {
    let result = [...transactions].sort((a, b) =>
      new Date(b.transaction_date) - new Date(a.transaction_date)
    );

    if (dateRange.from) {
      result = result.filter((t) => t.transaction_date >= dateRange.from);
    }
    if (dateRange.to) {
      result = result.filter((t) => t.transaction_date <= dateRange.to);
    }
    if (amountRange.min) {
      result = result.filter((t) => Math.abs(toNumber(t.amount)) >= parseFloat(amountRange.min));
    }
    if (amountRange.max) {
      result = result.filter((t) => Math.abs(toNumber(t.amount)) <= parseFloat(amountRange.max));
    }

    return result;
  }, [transactions, dateRange, amountRange]);

  const {
    filtered,
    search,
    setSearch,
    filters,
    updateFilter,
    clearFilters,
    sortKey,
    sortDir,
    toggleSort,
  } = useFilters(sortedTx, { defaultSort: 'transaction_date', defaultDir: 'desc' });

  const stats = useMemo(() => {
    const income = filtered.filter((t) => toNumber(t.amount) > 0).reduce((s, t) => s + toNumber(t.amount), 0);
    const expenses = filtered.filter((t) => toNumber(t.amount) < 0).reduce((s, t) => s + Math.abs(toNumber(t.amount)), 0);
    return { income, expenses, net: income - expenses, count: filtered.length };
  }, [filtered]);

  const columns = [
    {
      key: 'transaction_date',
      label: 'Date',
      width: '100px',
      render: (val) => (
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>{formatDateShort(val)}</span>
      ),
    },
    { key: 'description', label: 'Description' },
    {
      key: 'category_id',
      label: 'Category',
      render: (val) => {
        const cat = catMap[val];
        return cat ? <Badge>{cat.name}</Badge> : <span style={{ color: colors.text.muted }}>--</span>;
      },
    },
    {
      key: 'account_id',
      label: 'Account',
      render: (val) => {
        const acct = acctMap[val];
        return <span style={{ color: colors.text.secondary, fontSize: '12px' }}>{acct?.name || '--'}</span>;
      },
    },
    {
      key: 'amount',
      label: 'Amount',
      align: 'right',
      render: (val) => {
        const num = toNumber(val);
        return (
          <span style={{
            fontWeight: 500,
            fontVariantNumeric: 'tabular-nums',
            color: num > 0 ? colors.status.positive : colors.text.primary,
          }}>
            {num > 0 ? '+' : ''}{formatCurrency(num)}
          </span>
        );
      },
    },
    {
      key: 'source_type',
      label: 'Source',
      width: '80px',
      render: (val) => (
        <Badge variant={val === 'manual' ? 'purple' : val === 'rule' ? 'blue' : 'default'}>
          {val || '--'}
        </Badge>
      ),
    },
  ];

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
          Transactions
        </h2>
        <p style={{ fontSize: '13px', color: colors.text.tertiary, marginTop: '2px' }}>
          Full financial ledger with granular filters
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <MetricCard label="Total Transactions" value={stats.count} />
        <MetricCard label="Income" value={formatCurrency(stats.income)} accentColor={colors.status.positive} />
        <MetricCard label="Expenses" value={formatCurrency(stats.expenses)} />
        <MetricCard
          label="Net"
          value={formatCurrency(stats.net)}
          accentColor={stats.net >= 0 ? colors.status.positive : colors.status.negative}
        />
      </div>

      <Card style={{ marginBottom: '16px', padding: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <TextInput
              placeholder="Search by description, amount..."
              value={search}
              onChange={setSearch}
            />
          </div>
          <Select
            value={filters.category_id || ''}
            onChange={(v) => updateFilter('category_id', v)}
            options={[
              { value: '', label: 'All Categories' },
              ...categories.filter((c) => c.is_active !== 'false').map((c) => ({ value: c.id, label: c.name })),
            ]}
            style={{ width: '160px' }}
          />
          <Select
            value={filters.account_id || ''}
            onChange={(v) => updateFilter('account_id', v)}
            options={[
              { value: '', label: 'All Accounts' },
              ...accounts.map((a) => ({ value: a.id, label: a.name })),
            ]}
            style={{ width: '160px' }}
          />
          <Select
            value={filters.source_type || ''}
            onChange={(v) => updateFilter('source_type', v)}
            options={[
              { value: '', label: 'All Sources' },
              { value: 'manual', label: 'Manual' },
              { value: 'rule', label: 'Rule' },
              { value: 'import', label: 'Import' },
            ]}
            style={{ width: '130px' }}
          />
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
            <TextInput
              label="From"
              type="date"
              value={dateRange.from}
              onChange={(v) => setDateRange((p) => ({ ...p, from: v }))}
              style={{ width: '140px', colorScheme: 'dark' }}
            />
            <TextInput
              label="To"
              type="date"
              value={dateRange.to}
              onChange={(v) => setDateRange((p) => ({ ...p, to: v }))}
              style={{ width: '140px', colorScheme: 'dark' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
            <TextInput
              label="Min $"
              type="number"
              value={amountRange.min}
              onChange={(v) => setAmountRange((p) => ({ ...p, min: v }))}
              style={{ width: '90px' }}
            />
            <TextInput
              label="Max $"
              type="number"
              value={amountRange.max}
              onChange={(v) => setAmountRange((p) => ({ ...p, max: v }))}
              style={{ width: '90px' }}
            />
          </div>
        </div>
      </Card>

      <Card padding="0">
        <Table
          columns={columns}
          data={filtered}
          onSort={toggleSort}
          sortKey={sortKey}
          sortDir={sortDir}
        />
      </Card>
    </div>
  );
}
