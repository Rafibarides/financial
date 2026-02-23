import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
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
        <p key={i} style={{ color: entry.fill || entry.color }}>
          {entry.name}: ${Number(entry.value).toLocaleString()}
        </p>
      ))}
    </div>
  );
}

export default function IncomeChart({ data, title = 'Income Breakdown' }) {
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
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
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
          <Bar dataKey="salary" name="Salary" fill={colors.accent.blue} radius={[4, 4, 0, 0]} />
          <Bar dataKey="music" name="Music" fill={colors.accent.purple} radius={[4, 4, 0, 0]} />
          <Bar dataKey="business" name="Business" fill={colors.accent.cyan} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
