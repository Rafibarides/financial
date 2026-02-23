import Card from '../common/Card';
import { colors } from '../../styles/colors';
import { formatCurrency } from '../../utils/formatters';

export default function PlanVsActual({ data = [] }) {
  return (
    <Card>
      <h3 style={{
        fontSize: '13px',
        fontWeight: 500,
        color: colors.text.secondary,
        marginBottom: '16px',
        letterSpacing: '-0.01em',
      }}>
        Plan vs Actual
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {data.map((item) => {
          const planned = parseFloat(item.planned) || 0;
          const actual = parseFloat(item.actual) || 0;
          const diff = planned - actual;
          const pct = planned > 0 ? (actual / planned) * 100 : 0;
          const isOver = actual > planned;

          return (
            <div key={item.category}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', color: colors.text.secondary }}>{item.category}</span>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <span style={{ fontSize: '12px', color: colors.text.muted, fontVariantNumeric: 'tabular-nums' }}>
                    {formatCurrency(actual)} / {formatCurrency(planned)}
                  </span>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 500,
                    color: isOver ? colors.status.negative : colors.status.positive,
                    fontVariantNumeric: 'tabular-nums',
                    minWidth: '60px',
                    textAlign: 'right',
                  }}>
                    {isOver ? '-' : '+'}{formatCurrency(Math.abs(diff))}
                  </span>
                </div>
              </div>
              <div style={{
                width: '100%',
                height: '6px',
                borderRadius: '3px',
                background: colors.border.primary,
                overflow: 'hidden',
              }}>
                <div style={{
                  width: `${Math.min(pct, 100)}%`,
                  height: '100%',
                  borderRadius: '3px',
                  background: isOver ? colors.status.negative : colors.accent.purple,
                  transition: 'width 0.5s ease',
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
