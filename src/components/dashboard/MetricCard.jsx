import Card from '../common/Card';
import { colors } from '../../styles/colors';

export default function MetricCard({ label, value, subtext, trend, accentColor }) {
  const trendColor = trend === 'up' ? colors.status.positive : trend === 'down' ? colors.status.negative : colors.text.muted;

  return (
    <Card style={{ minHeight: '100px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <p style={{
        fontSize: '11px',
        fontWeight: 500,
        color: colors.text.tertiary,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        marginBottom: '8px',
      }}>
        {label}
      </p>
      <p style={{
        fontSize: '28px',
        fontWeight: 600,
        color: accentColor || colors.text.primary,
        letterSpacing: '-0.03em',
        fontVariantNumeric: 'tabular-nums',
        lineHeight: 1.1,
      }}>
        {value}
      </p>
      {subtext && (
        <p style={{
          fontSize: '12px',
          color: trendColor,
          marginTop: '6px',
          letterSpacing: '-0.01em',
        }}>
          {subtext}
        </p>
      )}
    </Card>
  );
}
