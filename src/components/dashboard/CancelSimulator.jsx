import { useState, useMemo } from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import { colors } from '../../styles/colors';
import { formatCurrency, toNumber, capitalize } from '../../utils/formatters';
import { normalizeToUnit, frequencyLabel } from '../../utils/calculations';

export default function CancelSimulator({ rules = [], categories = [] }) {
  const [cancelled, setCancelled] = useState(new Set());

  const catMap = useMemo(() => {
    const m = {};
    categories.forEach((c) => { m[c.id] = c; });
    return m;
  }, [categories]);

  const expenseRules = useMemo(() => {
    return rules
      .filter((r) => r.direction === 'expense' && r.is_active !== 'false')
      .map((r) => ({
        ...r,
        monthly: normalizeToUnit(r.amount, r.frequency, 'month'),
      }))
      .sort((a, b) => b.monthly - a.monthly);
  }, [rules]);

  const savings = useMemo(() => {
    return expenseRules
      .filter((r) => cancelled.has(r.id))
      .reduce((s, r) => s + r.monthly, 0);
  }, [expenseRules, cancelled]);

  const toggle = (id) => {
    setCancelled((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const reset = () => setCancelled(new Set());

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div>
          <h3 style={{ fontSize: '13px', fontWeight: 500, color: colors.text.secondary, letterSpacing: '-0.01em' }}>
            Cancel Simulator
          </h3>
          <p style={{ fontSize: '11px', color: colors.text.muted, marginTop: '2px' }}>
            Check items to see potential savings
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {cancelled.size > 0 && (
            <button
              onClick={reset}
              style={{
                background: 'transparent',
                border: 'none',
                color: colors.text.muted,
                fontSize: '11px',
                cursor: 'pointer',
              }}
            >
              Reset
            </button>
          )}
          <div style={{
            padding: '6px 14px',
            borderRadius: '8px',
            background: savings > 0 ? 'rgba(52, 211, 153, 0.1)' : colors.bg.surface,
          }}>
            <span style={{
              fontSize: '16px',
              fontWeight: 600,
              color: savings > 0 ? colors.status.positive : colors.text.muted,
              fontVariantNumeric: 'tabular-nums',
            }}>
              {savings > 0 ? `+${formatCurrency(savings)}` : '$0.00'}
            </span>
            <span style={{ fontSize: '11px', color: colors.text.muted, marginLeft: '4px' }}>/mo saved</span>
          </div>
        </div>
      </div>

      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {expenseRules.map((rule, i) => {
          const isCancelled = cancelled.has(rule.id);
          const cat = catMap[rule.category_id];

          return (
            <div
              key={rule.id}
              onClick={() => toggle(rule.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 0',
                borderBottom: i < expenseRules.length - 1 ? `1px solid ${colors.border.primary}` : 'none',
                cursor: 'pointer',
                opacity: isCancelled ? 0.5 : 1,
                transition: 'opacity 0.15s ease',
              }}
            >
              <div style={{
                width: '18px',
                height: '18px',
                borderRadius: '4px',
                border: `1.5px solid ${isCancelled ? colors.status.positive : colors.border.secondary}`,
                background: isCancelled ? colors.status.positive : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 0.15s ease',
              }}>
                {isCancelled && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={colors.text.inverse} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{
                    fontSize: '13px',
                    color: colors.text.primary,
                    textDecoration: isCancelled ? 'line-through' : 'none',
                  }}>
                    {rule.name || rule.id}
                  </span>
                  {cat && <Badge>{cat.name}</Badge>}
                </div>
              </div>
              <span style={{
                fontSize: '13px',
                fontWeight: 500,
                color: isCancelled ? colors.status.positive : colors.text.primary,
                fontVariantNumeric: 'tabular-nums',
              }}>
                {formatCurrency(rule.monthly)}/mo
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
