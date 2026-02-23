import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { colors } from '../../styles/colors';
import Card from '../common/Card';

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { name, value, percent } = payload[0].payload;
  return (
    <div style={{
      background: colors.bg.elevated,
      border: `1px solid ${colors.border.secondary}`,
      borderRadius: '8px',
      padding: '10px 14px',
      fontSize: '12px',
    }}>
      <p style={{ color: colors.text.primary, marginBottom: '2px' }}>{name}</p>
      <p style={{ color: colors.text.secondary }}>
        ${Number(value).toLocaleString()} ({(percent * 100).toFixed(1)}%)
      </p>
    </div>
  );
}

export default function CategoryPieChart({ data, title = 'Spending by Category' }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const enriched = data.map((d) => ({ ...d, percent: total > 0 ? d.value / total : 0 }));

  return (
    <Card>
      <h3 style={{
        fontSize: '13px',
        fontWeight: 500,
        color: colors.text.secondary,
        marginBottom: '16px',
        letterSpacing: '-0.01em',
      }}>
        {title}
      </h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <ResponsiveContainer width={160} height={160}>
          <PieChart>
            <Pie
              data={enriched}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={72}
              dataKey="value"
              stroke="none"
            >
              {enriched.map((_, i) => (
                <Cell key={i} fill={colors.chart.series[i % colors.chart.series.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1, maxHeight: '200px', overflowY: 'auto' }}>
          {enriched.map((item, i) => (
            <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                <div style={{
                  width: 8,
                  height: 8,
                  borderRadius: '2px',
                  background: colors.chart.series[i % colors.chart.series.length],
                  flexShrink: 0,
                }} />
                <span style={{ fontSize: '11px', color: colors.text.secondary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</span>
              </div>
              <span style={{ fontSize: '11px', color: colors.text.tertiary, fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
                ${item.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
