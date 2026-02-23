import { colors } from '../../styles/colors';
import { formatCurrency } from '../../utils/formatters';
import Card from '../common/Card';

export default function BudgetTable({ items = [], categories = {} }) {
  const totalPlanned = items.reduce((s, i) => s + (parseFloat(i.planned_amount) || 0), 0);

  return (
    <Card>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
      }}>
        <h3 style={{
          fontSize: '13px',
          fontWeight: 500,
          color: colors.text.secondary,
          letterSpacing: '-0.01em',
        }}>
          Budget Items
        </h3>
        <span style={{
          fontSize: '14px',
          fontWeight: 600,
          color: colors.accent.purple,
          fontVariantNumeric: 'tabular-nums',
        }}>
          {formatCurrency(totalPlanned)}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {items.map((item, i) => {
          const cat = categories[item.category_id];
          const planned = parseFloat(item.planned_amount) || 0;
          const pct = totalPlanned > 0 ? (planned / totalPlanned) * 100 : 0;

          return (
            <div
              key={item.id || i}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: i < items.length - 1 ? `1px solid ${colors.border.primary}` : 'none',
              }}
            >
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '13px', color: colors.text.primary }}>
                  {cat?.name || item.category_id}
                </p>
                {item.notes && (
                  <p style={{ fontSize: '11px', color: colors.text.muted, marginTop: '2px' }}>
                    {item.notes}
                  </p>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '60px',
                  height: '4px',
                  borderRadius: '2px',
                  background: colors.border.primary,
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${pct}%`,
                    height: '100%',
                    borderRadius: '2px',
                    background: colors.accent.purple,
                  }} />
                </div>
                <span style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: colors.text.primary,
                  fontVariantNumeric: 'tabular-nums',
                  minWidth: '70px',
                  textAlign: 'right',
                }}>
                  {formatCurrency(planned)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
