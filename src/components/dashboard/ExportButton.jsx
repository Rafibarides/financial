import { useCallback } from 'react';
import Button from '../common/Button';
import { formatCurrency, toNumber } from '../../utils/formatters';
import { normalizeToUnit, frequencyLabel } from '../../utils/calculations';

function buildCSV(rules, catMap) {
  const headers = ['Name', 'Category', 'Amount', 'Frequency', 'Monthly Cost', 'Annual Cost'];
  const rows = rules
    .filter((r) => r.direction === 'expense' && r.is_active !== 'false')
    .sort((a, b) => normalizeToUnit(b.amount, b.frequency, 'month') - normalizeToUnit(a.amount, a.frequency, 'month'))
    .map((r) => {
      const cat = catMap[r.category_id]?.name || '';
      const monthly = normalizeToUnit(r.amount, r.frequency, 'month');
      const annual = normalizeToUnit(r.amount, r.frequency, 'year');
      return [
        `"${r.name || r.id}"`,
        `"${cat}"`,
        toNumber(r.amount).toFixed(2),
        r.frequency,
        monthly.toFixed(2),
        annual.toFixed(2),
      ].join(',');
    });

  const totalMonthly = rules
    .filter((r) => r.direction === 'expense' && r.is_active !== 'false')
    .reduce((s, r) => s + normalizeToUnit(r.amount, r.frequency, 'month'), 0);
  const totalAnnual = totalMonthly * 12;

  rows.push('');
  rows.push(`"TOTAL","","","",${totalMonthly.toFixed(2)},${totalAnnual.toFixed(2)}`);

  return [headers.join(','), ...rows].join('\n');
}

export default function ExportButton({ rules = [], categories = [] }) {
  const catMap = {};
  categories.forEach((c) => { catMap[c.id] = c; });

  const exportCSV = useCallback(() => {
    const csv = buildCSV(rules, catMap);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recurring-payments-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [rules, catMap]);

  return (
    <Button variant="secondary" size="sm" onClick={exportCSV}>
      Export CSV
    </Button>
  );
}
