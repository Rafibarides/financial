import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { colors } from '../../styles/colors';
import Card from '../common/Card';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: colors.bg.elevated,
      border: `1px solid ${colors.border.secondary}`,
      borderRadius: '8px',
      padding: '10px 14px',
      fontSize: '12px',
    }}>
      <p style={{ color: colors.text.tertiary, marginBottom: '6px' }}>{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.fill }}>
          {entry.name}: ${Number(entry.value).toLocaleString()}
        </p>
      ))}
    </div>
  );
}

function CustomLegend({ payload }) {
  return (
    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '8px' }}>
      {payload.map((entry, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: 8, height: 8, borderRadius: '2px', background: entry.color }} />
          <span style={{ fontSize: '11px', color: colors.text.tertiary }}>{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function BudgetComparisonChart({ data, title = 'Planned vs Actual' }) {
  return (
    <Card>
      <h3 style={{
        fontSize: '13px',
        fontWeight: 500,
        color: colors.text.secondary,
        marginBottom: '20px',
        letterSpacing: '-0.01em',
      }}>
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.border.primary} />
          <XAxis
            dataKey="category"
            tick={{ fill: colors.text.muted, fontSize: 10 }}
            axisLine={{ stroke: colors.border.primary }}
            tickLine={false}
            angle={-35}
            textAnchor="end"
            height={60}
          />
          <YAxis
            tick={{ fill: colors.text.muted, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${v}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
          <Bar dataKey="planned" name="Planned" fill={colors.transparent.white15} radius={[4, 4, 0, 0]} />
          <Bar dataKey="actual" name="Actual" fill={colors.accent.purple} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
