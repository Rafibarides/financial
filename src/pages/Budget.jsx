import { useMemo, useState, useCallback } from 'react';
import { useMultipleSheets } from '../hooks/useSheetData';
import { SHEET_NAMES, MONTHS, MONTHS_SHORT } from '../utils/constants';
import { colors } from '../styles/colors';
import { formatCurrency, toNumber } from '../utils/formatters';
import Loader from '../components/common/Loader';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Select from '../components/common/Select';
import Toggle from '../components/common/Toggle';
import { updateRow } from '../services/sheets';

const sheets = [
  SHEET_NAMES.BUDGET_PLAN,
  SHEET_NAMES.BUDGET_ITEM,
  SHEET_NAMES.CATEGORY,
  SHEET_NAMES.TRANSACTION,
  SHEET_NAMES.RECURRING_RULE,
];

export default function Budget() {
  const { data, loading, error, reload } = useMultipleSheets(sheets);
  const [editing, setEditing] = useState(false);
  const [editValues, setEditValues] = useState({});
  const [saving, setSaving] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [compMonth, setCompMonth] = useState('');

  const plans = data[SHEET_NAMES.BUDGET_PLAN] || [];
  const items = data[SHEET_NAMES.BUDGET_ITEM] || [];
  const categories = data[SHEET_NAMES.CATEGORY] || [];
  const transactions = data[SHEET_NAMES.TRANSACTION] || [];
  const recurringRules = data[SHEET_NAMES.RECURRING_RULE] || [];

  const catMap = useMemo(() => {
    const m = {};
    categories.forEach((c) => { m[c.id] = c; });
    return m;
  }, [categories]);

  const childToParent = useMemo(() => {
    const m = {};
    categories.forEach((c) => {
      if (c.parent_id) m[c.id] = c.parent_id;
    });
    return m;
  }, [categories]);

  const activePlan = plans[0];

  const planItems = useMemo(() => {
    if (!activePlan) return [];
    return items.filter((i) => i.budget_plan_id === activePlan.id);
  }, [items, activePlan]);

  const fixedMonthlyIncome = useMemo(() => {
    return recurringRules
      .filter((r) => r.direction === 'income' && r.is_active !== 'false')
      .reduce((sum, r) => {
        const amt = toNumber(r.amount);
        switch (r.frequency) {
          case 'semimonthly': return sum + amt * 2;
          case 'biweekly': return sum + (amt * 26) / 12;
          case 'weekly': return sum + (amt * 52) / 12;
          case 'annual': return sum + amt / 12;
          case 'monthly': return sum + amt;
          default: return sum + amt;
        }
      }, 0);
  }, [recurringRules]);

  const getAmount = useCallback((item) => {
    if (editing && editValues[item.id] !== undefined) return editValues[item.id];
    return toNumber(item.planned_amount);
  }, [editing, editValues]);

  const totalAllocated = useMemo(() => {
    return planItems.reduce((s, item) => s + getAmount(item), 0);
  }, [planItems, getAmount]);

  const remaining = fixedMonthlyIncome - totalAllocated;

  const startEdit = useCallback(() => {
    const vals = {};
    planItems.forEach((item) => { vals[item.id] = toNumber(item.planned_amount); });
    setEditValues(vals);
    setEditing(true);
  }, [planItems]);

  const resetAll = useCallback(() => {
    const vals = {};
    planItems.forEach((item) => { vals[item.id] = 0; });
    setEditValues(vals);
  }, [planItems]);

  const cancelEdit = useCallback(() => {
    setEditing(false);
    setEditValues({});
  }, []);

  const updateItem = useCallback((itemId, newValue) => {
    setEditValues((prev) => {
      const next = { ...prev };
      const oldValue = next[itemId] || 0;
      const parsedNew = Math.max(0, newValue);
      const delta = parsedNew - oldValue;

      if (delta <= 0) {
        next[itemId] = parsedNew;
        return next;
      }

      const currentTotal = Object.values(next).reduce((s, v) => s + v, 0);
      const newTotal = currentTotal + delta;

      if (newTotal <= fixedMonthlyIncome) {
        next[itemId] = parsedNew;
        return next;
      }

      const overflow = newTotal - fixedMonthlyIncome;
      const otherIds = Object.keys(next).filter((id) => id !== itemId && next[id] > 0);

      if (otherIds.length === 0) {
        next[itemId] = Math.min(parsedNew, fixedMonthlyIncome);
        return next;
      }

      const perItem = overflow / otherIds.length;
      let distributed = 0;
      otherIds.forEach((id) => {
        const reduction = Math.min(next[id], perItem);
        next[id] = Math.round((next[id] - reduction) * 100) / 100;
        distributed += reduction;
      });

      next[itemId] = Math.round(Math.min(parsedNew, oldValue + delta - (overflow - distributed)) * 100) / 100;

      const finalTotal = Object.values(next).reduce((s, v) => s + v, 0);
      if (finalTotal > fixedMonthlyIncome) {
        next[itemId] = Math.round((next[itemId] - (finalTotal - fixedMonthlyIncome)) * 100) / 100;
      }

      return next;
    });
  }, [fixedMonthlyIncome]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      for (const item of planItems) {
        const newAmt = editValues[item.id];
        if (newAmt !== undefined && newAmt !== toNumber(item.planned_amount)) {
          await updateRow(SHEET_NAMES.BUDGET_ITEM, item.id, [
            item.id, item.budget_plan_id, item.category_id, String(newAmt), item.notes || '',
          ]);
        }
      }
      await reload();
      setEditing(false);
      setEditValues({});
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  }, [planItems, editValues, reload]);

  const actualByCategory = useMemo(() => {
    if (!showComparison || !compMonth) return {};
    const map = {};
    const budgetCatIds = new Set(planItems.map((i) => i.category_id));
    const resolveCategory = (catId) => {
      if (budgetCatIds.has(catId)) return catId;
      const parentId = childToParent[catId];
      if (parentId && budgetCatIds.has(parentId)) return parentId;
      return catId;
    };

    const [compYear, compMo] = compMonth.split('-').map(Number);

    transactions.forEach((tx) => {
      const amt = toNumber(tx.amount);
      if (amt >= 0) return;
      const d = new Date(tx.transaction_date);
      if (d.getFullYear() !== compYear || (d.getMonth() + 1) !== compMo) return;
      const resolved = resolveCategory(tx.category_id);
      if (!map[resolved]) map[resolved] = 0;
      map[resolved] += Math.abs(amt);
    });

    return map;
  }, [showComparison, compMonth, transactions, planItems, childToParent]);

  const availableMonths = useMemo(() => {
    const set = new Set();
    transactions.forEach((tx) => {
      if (toNumber(tx.amount) >= 0) return;
      const d = new Date(tx.transaction_date);
      set.add(`${d.getFullYear()}-${d.getMonth() + 1}`);
    });
    return [...set].sort().reverse().map((key) => {
      const [y, m] = key.split('-');
      return { value: key, label: `${MONTHS_SHORT[parseInt(m) - 1]} ${y}` };
    });
  }, [transactions]);

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
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 600, color: colors.text.primary, letterSpacing: '-0.03em' }}>
            Monthly Budget Plan
          </h2>
          <p style={{ fontSize: '13px', color: colors.text.tertiary, marginTop: '2px' }}>
            Allocate within your fixed monthly income
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {editing ? (
            <>
              <Button variant="ghost" onClick={resetAll}>Reset to Zero</Button>
              <Button variant="secondary" onClick={cancelEdit}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </>
          ) : (
            <Button variant="secondary" onClick={startEdit}>Edit Budget</Button>
          )}
        </div>
      </div>

      {activePlan ? (
        <>
          {/* Income ceiling + allocation total */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <Card padding="16px">
              <p style={{ fontSize: '11px', color: colors.text.tertiary, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                Fixed Monthly Income
              </p>
              <p style={{ fontSize: '26px', fontWeight: 600, color: colors.status.positive, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>
                {formatCurrency(fixedMonthlyIncome)}
              </p>
              <p style={{ fontSize: '11px', color: colors.text.muted, marginTop: '4px' }}>
                Hard ceiling for allocations
              </p>
            </Card>
            <Card padding="16px">
              <p style={{ fontSize: '11px', color: colors.text.tertiary, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                Total Allocated
              </p>
              <p style={{ fontSize: '26px', fontWeight: 600, color: colors.accent.purple, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>
                {formatCurrency(totalAllocated)}
              </p>
              <p style={{ fontSize: '11px', color: colors.text.muted, marginTop: '4px' }}>
                {Math.round((totalAllocated / fixedMonthlyIncome) * 100)}% of income
              </p>
            </Card>
            <Card padding="16px">
              <p style={{ fontSize: '11px', color: colors.text.tertiary, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                Remaining
              </p>
              <p style={{
                fontSize: '26px',
                fontWeight: 600,
                color: remaining >= 0 ? colors.text.primary : colors.status.negative,
                letterSpacing: '-0.03em',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {formatCurrency(remaining)}
              </p>
              <p style={{ fontSize: '11px', color: colors.text.muted, marginTop: '4px' }}>
                Unallocated funds
              </p>
            </Card>
          </div>

          {/* Allocation bar */}
          <div style={{
            width: '100%',
            height: '8px',
            borderRadius: '4px',
            background: colors.border.primary,
            marginBottom: '24px',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${Math.min((totalAllocated / fixedMonthlyIncome) * 100, 100)}%`,
              height: '100%',
              borderRadius: '4px',
              background: totalAllocated > fixedMonthlyIncome ? colors.status.negative : colors.accent.purple,
              transition: 'width 0.3s ease',
            }} />
          </div>

          {/* Budget items */}
          <Card style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 500, color: colors.text.secondary }}>
                Budget Allocations
              </h3>
              <span style={{ fontSize: '13px', color: colors.text.muted }}>
                {formatCurrency(totalAllocated)} of {formatCurrency(fixedMonthlyIncome)}
              </span>
            </div>
            {planItems.map((item, i) => {
              const amount = getAmount(item);
              const label = item.notes || catMap[item.category_id]?.name || item.category_id;
              const pct = fixedMonthlyIncome > 0 ? (amount / fixedMonthlyIncome) * 100 : 0;
              const actual = showComparison && compMonth ? (actualByCategory[item.category_id] || 0) : null;

              return (
                <div
                  key={item.id || i}
                  style={{
                    padding: '14px 0',
                    borderBottom: i < planItems.length - 1 ? `1px solid ${colors.border.primary}` : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', color: colors.text.primary, fontWeight: 500 }}>
                      {label}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {showComparison && actual !== null && (
                        <span style={{
                          fontSize: '12px',
                          color: actual > amount ? colors.status.negative : colors.status.positive,
                          fontVariantNumeric: 'tabular-nums',
                        }}>
                          {actual > amount ? '-' : '+'}{formatCurrency(Math.abs(amount - actual))}
                        </span>
                      )}
                      {editing ? (
                        <input
                          type="number"
                          value={editValues[item.id] ?? ''}
                          onChange={(e) => updateItem(item.id, parseFloat(e.target.value) || 0)}
                          style={{
                            width: '100px',
                            background: colors.bg.surface,
                            border: `1px solid ${colors.border.secondary}`,
                            borderRadius: '6px',
                            padding: '6px 10px',
                            color: colors.text.primary,
                            fontSize: '14px',
                            fontWeight: 600,
                            textAlign: 'right',
                            outline: 'none',
                            fontVariantNumeric: 'tabular-nums',
                          }}
                          onFocus={(e) => { e.target.style.borderColor = colors.accent.purple; }}
                          onBlur={(e) => { e.target.style.borderColor = colors.border.secondary; }}
                        />
                      ) : (
                        <span style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          color: colors.text.primary,
                          fontVariantNumeric: 'tabular-nums',
                          minWidth: '80px',
                          textAlign: 'right',
                        }}>
                          {formatCurrency(amount)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Slider in edit mode */}
                  {editing && (
                    <input
                      type="range"
                      min="0"
                      max={fixedMonthlyIncome}
                      step="1"
                      value={editValues[item.id] ?? 0}
                      onChange={(e) => updateItem(item.id, parseFloat(e.target.value))}
                      style={{
                        width: '100%',
                        height: '4px',
                        appearance: 'none',
                        background: `linear-gradient(to right, ${colors.accent.purple} ${pct}%, ${colors.border.primary} ${pct}%)`,
                        borderRadius: '2px',
                        outline: 'none',
                        cursor: 'pointer',
                        accentColor: colors.accent.purple,
                      }}
                    />
                  )}

                  {!editing && (
                    <div style={{
                      width: '100%',
                      height: '4px',
                      borderRadius: '2px',
                      background: colors.border.primary,
                      overflow: 'hidden',
                      position: 'relative',
                    }}>
                      <div style={{
                        width: `${pct}%`,
                        height: '100%',
                        borderRadius: '2px',
                        background: colors.accent.purple,
                        transition: 'width 0.3s ease',
                      }} />
                      {showComparison && actual !== null && (
                        <div style={{
                          width: `${fixedMonthlyIncome > 0 ? Math.min((actual / fixedMonthlyIncome) * 100, 100) : 0}%`,
                          height: '100%',
                          borderRadius: '2px',
                          background: actual > amount ? colors.status.negative : colors.status.positive,
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          opacity: 0.5,
                        }} />
                      )}
                    </div>
                  )}

                  {showComparison && actual !== null && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                      <span style={{ fontSize: '11px', color: colors.text.muted }}>
                        Actual: {formatCurrency(actual)}
                      </span>
                      <span style={{ fontSize: '11px', color: colors.text.muted }}>
                        Planned: {formatCurrency(amount)}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </Card>

          {/* Compare section */}
          <Card padding="14px">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div>
                  <p style={{ fontSize: '13px', color: colors.text.secondary, fontWeight: 500 }}>
                    Compare with actual spending
                  </p>
                  <p style={{ fontSize: '11px', color: colors.text.muted, marginTop: '2px' }}>
                    Select a month to compare against your plan
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {showComparison && (
                  <Select
                    value={compMonth}
                    onChange={setCompMonth}
                    options={[{ value: '', label: 'Pick a month' }, ...availableMonths]}
                    style={{ width: '140px' }}
                  />
                )}
                <Toggle value={showComparison} onChange={(v) => { setShowComparison(v); if (!v) setCompMonth(''); }} />
              </div>
            </div>
          </Card>
        </>
      ) : (
        <div style={{ padding: '60px 0', textAlign: 'center' }}>
          <p style={{ color: colors.text.muted, fontSize: '14px' }}>No budget plan found</p>
          <p style={{ color: colors.text.muted, fontSize: '12px', marginTop: '4px' }}>
            Run the seed script to populate budget data
          </p>
        </div>
      )}
    </div>
  );
}
