import { useState, useMemo } from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Select from '../common/Select';
import TextInput from '../common/TextInput';
import Toggle from '../common/Toggle';
import ExportButton from './ExportButton';
import { colors } from '../../styles/colors';
import { formatCurrency, toNumber, capitalize } from '../../utils/formatters';
import { normalizeToUnit, frequencyLabel, unitLabel } from '../../utils/calculations';
import { TIME_UNITS } from '../../utils/constants';
import useIsMobile from '../../hooks/useIsMobile';

function TimeUnitToggle({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: '2px', background: colors.bg.tertiary, borderRadius: '8px', padding: '2px' }}>
      {TIME_UNITS.map((u) => (
        <button
          key={u.key}
          onClick={() => onChange(u.key)}
          style={{
            padding: '5px 10px',
            fontSize: '11px',
            fontWeight: value === u.key ? 500 : 400,
            color: value === u.key ? colors.text.primary : colors.text.muted,
            background: value === u.key ? colors.bg.surface : 'transparent',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          {u.label}
        </button>
      ))}
    </div>
  );
}

export default function RecurringPanel({ rules = [], categories = [], tags = [] }) {
  const [timeUnit, setTimeUnit] = useState('month');
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [freqFilter, setFreqFilter] = useState('');
  const [essentialFilter, setEssentialFilter] = useState('all');
  const [activeOnly, setActiveOnly] = useState(true);
  const isMobile = useIsMobile();

  const catMap = useMemo(() => {
    const m = {};
    categories.forEach((c) => { m[c.id] = c; });
    return m;
  }, [categories]);

  const expenseRules = useMemo(() => {
    return rules.filter((r) => r.direction === 'expense');
  }, [rules]);

  const filtered = useMemo(() => {
    let result = [...expenseRules];

    if (activeOnly) result = result.filter((r) => r.is_active !== 'false');
    if (catFilter) result = result.filter((r) => r.category_id === catFilter);
    if (freqFilter) result = result.filter((r) => r.frequency === freqFilter);

    if (essentialFilter === 'essential') {
      result = result.filter((r) => catMap[r.category_id]?.is_essential === 'true');
    } else if (essentialFilter === 'non-essential') {
      result = result.filter((r) => catMap[r.category_id]?.is_essential !== 'true');
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((r) =>
        (r.name || '').toLowerCase().includes(q) ||
        (catMap[r.category_id]?.name || '').toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => normalizeToUnit(b.amount, b.frequency, timeUnit) - normalizeToUnit(a.amount, a.frequency, timeUnit));
    return result;
  }, [expenseRules, activeOnly, catFilter, freqFilter, essentialFilter, search, catMap, timeUnit]);

  const totalNormalized = useMemo(() => {
    return filtered.reduce((sum, r) => sum + normalizeToUnit(r.amount, r.frequency, timeUnit), 0);
  }, [filtered, timeUnit]);

  const byCategorySorted = useMemo(() => {
    const map = {};
    filtered.forEach((r) => {
      const cat = catMap[r.category_id]?.name || 'Other';
      if (!map[cat]) map[cat] = { name: cat, total: 0, count: 0 };
      map[cat].total += normalizeToUnit(r.amount, r.frequency, timeUnit);
      map[cat].count++;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [filtered, catMap, timeUnit]);

  const uniqueCats = useMemo(() => {
    const ids = new Set(expenseRules.map((r) => r.category_id));
    return [...ids].map((id) => catMap[id]).filter(Boolean);
  }, [expenseRules, catMap]);

  const uniqueFreqs = useMemo(() => {
    return [...new Set(expenseRules.map((r) => r.frequency))];
  }, [expenseRules]);

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: isMobile ? 'flex-start' : 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '12px' : '0',
      }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: colors.text.primary, letterSpacing: '-0.02em' }}>
            Recurring Payments
          </h3>
          <p style={{ fontSize: '12px', color: colors.text.tertiary, marginTop: '2px' }}>
            Fixed spending through memberships and subscriptions
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ExportButton rules={rules} categories={categories} />
          <TimeUnitToggle value={timeUnit} onChange={setTimeUnit} />
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
        <Card padding="14px">
          <p style={{ fontSize: '11px', color: colors.text.tertiary, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
            Total {unitLabel(timeUnit)}
          </p>
          <p style={{ fontSize: '24px', fontWeight: 600, color: colors.text.primary, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>
            {formatCurrency(totalNormalized)}
          </p>
        </Card>
        <Card padding="14px">
          <p style={{ fontSize: '11px', color: colors.text.tertiary, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
            Active Subscriptions
          </p>
          <p style={{ fontSize: '24px', fontWeight: 600, color: colors.text.primary, letterSpacing: '-0.03em' }}>
            {filtered.length}
          </p>
        </Card>
        <Card padding="14px">
          <p style={{ fontSize: '11px', color: colors.text.tertiary, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
            Categories
          </p>
          <p style={{ fontSize: '24px', fontWeight: 600, color: colors.text.primary, letterSpacing: '-0.03em' }}>
            {byCategorySorted.length}
          </p>
        </Card>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: '20px' }} padding="14px">
        <div style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          flexDirection: isMobile ? 'column' : 'row',
        }}>
          <div style={{ flex: 1, minWidth: isMobile ? '100%' : '180px', width: isMobile ? '100%' : 'auto' }}>
            <TextInput placeholder="Search by name..." value={search} onChange={setSearch} />
          </div>
          <Select
            value={catFilter}
            onChange={setCatFilter}
            options={[{ value: '', label: 'All Categories' }, ...uniqueCats.map((c) => ({ value: c.id, label: c.name }))]}
            style={{ width: isMobile ? '100%' : '160px' }}
          />
          <Select
            value={freqFilter}
            onChange={setFreqFilter}
            options={[{ value: '', label: 'All Frequencies' }, ...uniqueFreqs.map((f) => ({ value: f, label: capitalize(f) }))]}
            style={{ width: isMobile ? '100%' : '150px' }}
          />
          <Select
            value={essentialFilter}
            onChange={setEssentialFilter}
            options={[
              { value: 'all', label: 'All Types' },
              { value: 'essential', label: 'Essential Only' },
              { value: 'non-essential', label: 'Non-Essential Only' },
            ]}
            style={{ width: isMobile ? '100%' : '160px' }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Toggle value={activeOnly} onChange={setActiveOnly} />
            <span style={{ fontSize: '12px', color: colors.text.tertiary }}>Active only</span>
          </div>
        </div>
      </Card>

      {/* Category breakdown */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {byCategorySorted.map((cat) => (
          <div
            key={cat.name}
            onClick={() => setCatFilter(catFilter === cat.name ? '' : '')}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              background: colors.bg.elevated,
              cursor: 'default',
              flex: isMobile ? '1 1 calc(50% - 4px)' : 'none',
              minWidth: isMobile ? 0 : 'auto',
            }}
          >
            <p style={{ fontSize: '11px', color: colors.text.tertiary, marginBottom: '2px' }}>{cat.name}</p>
            <p style={{ fontSize: '14px', fontWeight: 500, color: colors.text.primary, fontVariantNumeric: 'tabular-nums' }}>
              {formatCurrency(cat.total)}<span style={{ fontSize: '11px', color: colors.text.muted }}>{unitLabel(timeUnit)}</span>
            </p>
            <p style={{ fontSize: '10px', color: colors.text.muted }}>{cat.count} item{cat.count !== 1 ? 's' : ''}</p>
          </div>
        ))}
      </div>

      {/* Full item list */}
      <Card padding="0">
        <div style={{ padding: '14px 16px', borderBottom: `1px solid ${colors.border.primary}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '12px', fontWeight: 500, color: colors.text.secondary }}>All Recurring Items</span>
              <span style={{ fontSize: '11px', color: colors.text.muted, marginLeft: '8px' }}>{filtered.length} items</span>
            </div>
            <span style={{ fontSize: '11px', color: colors.text.muted }}>
              combined{unitLabel(timeUnit)}
            </span>
          </div>
        </div>
        {filtered.map((rule, i) => {
          const cat = catMap[rule.category_id];
          const normalized = normalizeToUnit(rule.amount, rule.frequency, timeUnit);
          const isEssential = cat?.is_essential === 'true';
          const originalAmt = toNumber(rule.amount);

          return (
            <div
              key={rule.id || i}
              style={{
                display: 'flex',
                alignItems: isMobile ? 'flex-start' : 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderBottom: i < filtered.length - 1 ? `1px solid ${colors.border.primary}` : 'none',
                transition: 'background 0.15s ease',
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? '4px' : '0',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = colors.bg.hover; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '13px', color: colors.text.primary, fontWeight: 500 }}>
                    {rule.name || rule.id}
                  </span>
                  {cat && <Badge>{cat.name}</Badge>}
                  {isEssential && <Badge variant="blue">Essential</Badge>}
                  {rule.frequency === 'annual' && <Badge variant="warning">Yearly</Badge>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
                  <span style={{ fontSize: '11px', color: colors.text.muted }}>
                    {formatCurrency(originalAmt)}{frequencyLabel(rule.frequency)}
                  </span>
                  <span style={{ fontSize: '11px', color: colors.text.muted }}>
                    {capitalize(rule.frequency)}
                  </span>
                </div>
              </div>
              <span style={{
                fontSize: '14px',
                fontWeight: 600,
                color: colors.text.primary,
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '-0.01em',
                flexShrink: 0,
              }}>
                {formatCurrency(normalized)}<span style={{ fontSize: '11px', fontWeight: 400, color: colors.text.muted }}>{unitLabel(timeUnit)}</span>
              </span>
            </div>
          );
        })}
      </Card>
    </div>
  );
}
