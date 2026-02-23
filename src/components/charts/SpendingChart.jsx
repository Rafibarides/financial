import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
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
      <p style={{ color: colors.text.tertiary, marginBottom: '4px' }}>{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }}>
          {entry.name}: ${Number(entry.value).toLocaleString()}
        </p>
      ))}
    </div>
  );
}

export default function SpendingChart({ data, title = 'Spending Over Time' }) {
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
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="spendingGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.accent.purple} stopOpacity={0.2} />
              <stop offset="95%" stopColor={colors.accent.purple} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.border.primary} />
          <XAxis
            dataKey="label"
            tick={{ fill: colors.text.muted, fontSize: 11 }}
            axisLine={{ stroke: colors.border.primary }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: colors.text.muted, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${v}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="amount"
            name="Spending"
            stroke={colors.accent.purple}
            strokeWidth={2}
            fill="url(#spendingGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
