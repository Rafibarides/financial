import { useMemo } from 'react';
import { useMultipleSheets } from '../hooks/useSheetData';
import { SHEET_NAMES } from '../utils/constants';
import { colors } from '../styles/colors';
import Loader from '../components/common/Loader';
import RecurringPanel from '../components/dashboard/RecurringPanel';
import OutlierPanel from '../components/dashboard/OutlierPanel';
import IncomePanel from '../components/dashboard/IncomePanel';
import FinancialSnapshot from '../components/dashboard/FinancialSnapshot';
import SpendingAlerts from '../components/dashboard/SpendingAlerts';
import CancelSimulator from '../components/dashboard/CancelSimulator';
import CategoryPieChart from '../components/charts/CategoryPieChart';
import SpendingChart from '../components/charts/SpendingChart';
import { toNumber } from '../utils/formatters';
import { MONTHS_SHORT } from '../utils/constants';
import useIsMobile from '../hooks/useIsMobile';

const sheets = [
  SHEET_NAMES.ACCOUNT,
  SHEET_NAMES.TRANSACTION,
  SHEET_NAMES.CATEGORY,
  SHEET_NAMES.RECURRING_RULE,
  SHEET_NAMES.INCOME_SOURCE,
  SHEET_NAMES.TAG,
  SHEET_NAMES.CREDIT_SCORE,
];

function SectionDivider({ label }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      margin: '40px 0 24px',
    }}>
      <div style={{ height: '1px', flex: 1, background: colors.border.primary }} />
      {label && (
        <span style={{
          fontSize: '11px',
          fontWeight: 500,
          color: colors.text.muted,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}>
          {label}
        </span>
      )}
      <div style={{ height: '1px', flex: 1, background: colors.border.primary }} />
    </div>
  );
}

export default function Dashboard() {
  const { data, loading, error } = useMultipleSheets(sheets);
  const isMobile = useIsMobile();

  const accounts = data[SHEET_NAMES.ACCOUNT] || [];
  const transactions = data[SHEET_NAMES.TRANSACTION] || [];
  const categories = data[SHEET_NAMES.CATEGORY] || [];
  const recurringRules = data[SHEET_NAMES.RECURRING_RULE] || [];
  const incomeSources = data[SHEET_NAMES.INCOME_SOURCE] || [];
  const tags = data[SHEET_NAMES.TAG] || [];
  const creditScores = data[SHEET_NAMES.CREDIT_SCORE] || [];

  const catMap = useMemo(() => {
    const m = {};
    categories.forEach((c) => { m[c.id] = c; });
    return m;
  }, [categories]);

  const recurringCategorySpending = useMemo(() => {
    const map = {};
    recurringRules
      .filter((r) => r.direction === 'expense' && r.is_active !== 'false')
      .forEach((r) => {
        const cat = catMap[r.category_id]?.name || 'Other';
        const amt = toNumber(r.amount);
        let monthly = amt;
        if (r.frequency === 'annual') monthly = amt / 12;
        else if (r.frequency === 'semimonthly') monthly = amt * 2;
        else if (r.frequency === 'biweekly') monthly = (amt * 26) / 12;
        else if (r.frequency === 'weekly') monthly = (amt * 52) / 12;
        if (!map[cat]) map[cat] = 0;
        map[cat] += monthly;
      });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
      .sort((a, b) => b.value - a.value);
  }, [recurringRules, catMap]);

  const spendingByMonth = useMemo(() => {
    const map = {};
    transactions.forEach((tx) => {
      const amt = toNumber(tx.amount);
      if (amt >= 0) return;
      const d = new Date(tx.transaction_date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = `${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
      if (!map[key]) map[key] = { key, label, amount: 0 };
      map[key].amount += Math.abs(amt);
    });
    return Object.values(map).sort((a, b) => a.key.localeCompare(b.key));
  }, [transactions]);

  if (loading) return <Loader />;

  if (error) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center' }}>
        <p style={{ color: colors.text.tertiary, fontSize: '14px', marginBottom: '8px' }}>Unable to load data</p>
        <p style={{ color: colors.text.muted, fontSize: '12px' }}>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '8px' }}>
        <h2 style={{ fontSize: isMobile ? '20px' : '22px', fontWeight: 600, color: colors.text.primary, letterSpacing: '-0.03em' }}>
          Dashboard
        </h2>
      </div>

      <FinancialSnapshot accounts={accounts} creditScores={creditScores} tags={tags} />

      <SectionDivider label="Recurring Payments" />

      <RecurringPanel rules={recurringRules} categories={categories} tags={tags} />

      <SectionDivider label="What If" />

      <CancelSimulator rules={recurringRules} categories={categories} />

      <SectionDivider label="Variable Spending Patterns" />

      <SpendingAlerts transactions={transactions} />

      <div style={{ marginTop: '16px' }}>
        <OutlierPanel />
      </div>

      <SectionDivider label="Spending Breakdown" />

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <CategoryPieChart data={recurringCategorySpending} title="Recurring by Category (Monthly)" />
        <SpendingChart data={spendingByMonth} title="Total Spending Over Time" />
      </div>

      <SectionDivider label="Income" />

      <IncomePanel
        transactions={transactions}
        incomeSources={incomeSources}
        categories={categories}
        recurringRules={recurringRules}
      />
    </div>
  );
}
