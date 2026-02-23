import { useState, useMemo } from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Select from '../common/Select';
import { colors } from '../../styles/colors';
import { formatCurrency, formatDateShort, toNumber } from '../../utils/formatters';
import { MONTHS_SHORT } from '../../utils/constants';

export default function IncomePanel({ transactions = [], incomeSources = [], categories = [], recurringRules = [] }) {
  const now = new Date();
  const [yearFilter, setYearFilter] = useState(String(now.getFullYear()));
  const [monthFilter, setMonthFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('');
  const [expandedSource, setExpandedSource] = useState(null);

  const sourceMap = useMemo(() => {
    const m = {};
    incomeSources.forEach((s) => { m[s.id] = s; });
    return m;
  }, [incomeSources]);

  const incomeTx = useMemo(() => {
    return transactions.filter((tx) => toNumber(tx.amount) > 0);
  }, [transactions]);

  const filtered = useMemo(() => {
    let result = [...incomeTx];
    if (yearFilter !== 'all') {
      result = result.filter((tx) => {
        const d = new Date(tx.transaction_date);
        return String(d.getFullYear()) === yearFilter;
      });
    }
    if (monthFilter !== 'all') {
      result = result.filter((tx) => {
        const d = new Date(tx.transaction_date);
        return String(d.getMonth()) === monthFilter;
      });
    }
    if (sourceFilter) {
      result = result.filter((tx) => tx.income_source_id === sourceFilter);
    }
    return result.sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date));
  }, [incomeTx, yearFilter, monthFilter, sourceFilter]);

  const totalFiltered = useMemo(() => {
    return filtered.reduce((s, tx) => s + toNumber(tx.amount), 0);
  }, [filtered]);

  const monthlyPerSource = useMemo(() => {
    const fixedRules = {};
    recurringRules
      .filter((r) => r.direction === 'income' && r.is_active !== 'false')
      .forEach((r) => {
        const amt = toNumber(r.amount);
        let monthly = amt;
        if (r.frequency === 'semimonthly') monthly = amt * 2;
        else if (r.frequency === 'biweekly') monthly = (amt * 26) / 12;
        else if (r.frequency === 'annual') monthly = amt / 12;
        else if (r.frequency === 'weekly') monthly = (amt * 52) / 12;
        if (r.income_source_id) fixedRules[r.income_source_id] = { monthly, isFixed: true };
      });

    const txBySource = {};
    incomeTx.forEach((tx) => {
      const srcId = tx.income_source_id || '_other';
      if (!txBySource[srcId]) txBySource[srcId] = { months: new Set(), total: 0 };
      const d = new Date(tx.transaction_date);
      txBySource[srcId].months.add(`${d.getFullYear()}-${d.getMonth()}`);
      txBySource[srcId].total += toNumber(tx.amount);
    });

    const result = {};
    incomeSources.forEach((src) => {
      if (fixedRules[src.id]) {
        result[src.id] = { monthly: fixedRules[src.id].monthly, isFixed: true };
      } else if (txBySource[src.id] && txBySource[src.id].months.size > 0) {
        result[src.id] = {
          monthly: txBySource[src.id].total / txBySource[src.id].months.size,
          isFixed: false,
        };
      }
    });
    return result;
  }, [recurringRules, incomeTx, incomeSources]);

  const bySource = useMemo(() => {
    const map = {};
    filtered.forEach((tx) => {
      const src = sourceMap[tx.income_source_id];
      const srcId = tx.income_source_id || '_other';
      const name = src?.name || 'Other';
      if (!map[srcId]) map[srcId] = { id: srcId, name, total: 0, count: 0, isBusiness: src?.is_business === 'true', transactions: [] };
      map[srcId].total += toNumber(tx.amount);
      map[srcId].count++;
      map[srcId].transactions.push(tx);
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [filtered, sourceMap]);

  const years = useMemo(() => {
    const set = new Set(incomeTx.map((tx) => String(new Date(tx.transaction_date).getFullYear())));
    return [...set].sort().reverse();
  }, [incomeTx]);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: colors.text.primary, letterSpacing: '-0.02em' }}>
          Income Streams
        </h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Select
            value={yearFilter}
            onChange={setYearFilter}
            options={[{ value: 'all', label: 'All Years' }, ...years.map((y) => ({ value: y, label: y }))]}
            style={{ width: '110px' }}
          />
          <Select
            value={monthFilter}
            onChange={setMonthFilter}
            options={[{ value: 'all', label: 'All Months' }, ...MONTHS_SHORT.map((m, i) => ({ value: String(i), label: m }))]}
            style={{ width: '120px' }}
          />
          <Select
            value={sourceFilter}
            onChange={setSourceFilter}
            options={[{ value: '', label: 'All Sources' }, ...incomeSources.map((s) => ({ value: s.id, label: s.name }))]}
            style={{ width: '160px' }}
          />
        </div>
      </div>

      {/* Total */}
      <Card padding="14px" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', color: colors.text.secondary }}>Total Income (filtered)</span>
          <span style={{ fontSize: '20px', fontWeight: 600, color: colors.status.positive, fontVariantNumeric: 'tabular-nums' }}>
            {formatCurrency(totalFiltered)}
          </span>
        </div>
      </Card>

      {/* Source cards — click to expand, sorted highest to lowest */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {bySource.map((src) => {
          const isExpanded = expandedSource === src.id;
          const perMonth = monthlyPerSource[src.id];

          return (
            <Card key={src.id} padding="0">
              <div
                onClick={() => setExpandedSource(isExpanded ? null : src.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = colors.bg.hover; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    fontSize: '11px',
                    color: colors.text.muted,
                    transition: 'transform 0.2s ease',
                    transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                    display: 'inline-block',
                  }}>
                    {'\u25B6'}
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: 500, color: colors.text.primary }}>{src.name}</span>
                  {src.isBusiness && <Badge variant="purple">Business</Badge>}
                  {perMonth && (
                    <span style={{ fontSize: '11px', color: colors.text.muted }}>
                      {perMonth.isFixed ? '' : '~'}{formatCurrency(perMonth.monthly)}/mo{perMonth.isFixed ? '' : ' avg'}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '11px', color: colors.text.muted }}>{src.count} payment{src.count !== 1 ? 's' : ''}</span>
                  <span style={{ fontSize: '16px', fontWeight: 600, color: colors.status.positive, fontVariantNumeric: 'tabular-nums' }}>
                    {formatCurrency(src.total)}
                  </span>
                </div>
              </div>

              {isExpanded && (
                <div style={{ borderTop: `1px solid ${colors.border.primary}` }}>
                  {src.transactions.map((tx, i) => {
                    const amt = toNumber(tx.amount);
                    return (
                      <div
                        key={tx.id || i}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '9px 16px 9px 38px',
                          borderBottom: i < src.transactions.length - 1 ? `1px solid ${colors.border.primary}` : 'none',
                          fontSize: '12px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ color: colors.text.muted, fontVariantNumeric: 'tabular-nums', minWidth: '70px' }}>
                            {formatDateShort(tx.transaction_date)}
                          </span>
                          <span style={{ color: colors.text.secondary }}>
                            {tx.description}
                          </span>
                        </div>
                        <span style={{ color: colors.status.positive, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
                          +{formatCurrency(amt)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
