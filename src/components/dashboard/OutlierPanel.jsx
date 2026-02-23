import Card from '../common/Card';
import Badge from '../common/Badge';
import { colors } from '../../styles/colors';
import { formatCurrency } from '../../utils/formatters';

const POPULAR_PURCHASES = [
  { name: 'Aksaray Chicken Gyro', cost: 22.00, frequency: '~3x/month', category: 'Food' },
  { name: 'Poke Bowl', cost: 27.00, frequency: '~3x/month', category: 'Food' },
  { name: 'Wake Up Pastries', cost: 8.00, frequency: '~3x/month', category: 'Food' },
  { name: 'Chikurin Souffle', cost: 13.99, frequency: '~3x/month', category: 'Food' },
];

const OUTLYING_CHARGES = [
  { name: 'Submit Hub', cost: 30.00, frequency: 'Infrequent', category: 'Business', note: 'avg payment' },
  { name: 'Facebook Advertising', cost: 50.00, frequency: 'Infrequent', category: 'Advertising', note: 'avg payment' },
  { name: 'NYC Parking', cost: 10.00, frequency: 'Weekly', category: 'Transportation' },
  { name: 'Gas', cost: 25.00, frequency: 'Once monthly', category: 'Transportation' },
];

function estimateMonthly(items) {
  return items.reduce((sum, item) => {
    if (item.frequency.includes('3x')) return sum + item.cost * 3;
    if (item.frequency === 'Weekly') return sum + item.cost * 4.33;
    if (item.frequency.includes('monthly') || item.frequency === 'Once monthly') return sum + item.cost;
    return sum + item.cost;
  }, 0);
}

export default function OutlierPanel() {
  const popularMonthly = estimateMonthly(POPULAR_PURCHASES);
  const outlyingMonthly = estimateMonthly(OUTLYING_CHARGES);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
      {/* Popular purchases */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 500, color: colors.text.secondary, letterSpacing: '-0.01em' }}>
            Popular Purchases
          </h3>
          <span style={{ fontSize: '11px', color: colors.text.muted }}>
            ~{formatCurrency(popularMonthly)}/mo
          </span>
        </div>
        <p style={{ fontSize: '11px', color: colors.text.muted, marginBottom: '12px' }}>
          Repeated at least 3 times per month. Not recurring subscriptions.
        </p>
        {POPULAR_PURCHASES.map((item) => (
          <div
            key={item.name}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 0',
              borderBottom: `1px solid ${colors.border.primary}`,
            }}
          >
            <div>
              <p style={{ fontSize: '13px', color: colors.text.primary }}>{item.name}</p>
              <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
                <Badge>{item.category}</Badge>
                <span style={{ fontSize: '10px', color: colors.text.muted }}>{item.frequency}</span>
              </div>
            </div>
            <span style={{ fontSize: '13px', fontWeight: 500, color: colors.text.primary, fontVariantNumeric: 'tabular-nums' }}>
              {formatCurrency(item.cost)}
            </span>
          </div>
        ))}
      </Card>

      {/* Outlying charges */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 500, color: colors.text.secondary, letterSpacing: '-0.01em' }}>
            Outlying Charges
          </h3>
          <span style={{ fontSize: '11px', color: colors.text.muted }}>
            ~{formatCurrency(outlyingMonthly)}/mo
          </span>
        </div>
        <p style={{ fontSize: '11px', color: colors.text.muted, marginBottom: '12px' }}>
          Infrequent but repeated. Not recurring subscriptions.
        </p>
        {OUTLYING_CHARGES.map((item) => (
          <div
            key={item.name}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 0',
              borderBottom: `1px solid ${colors.border.primary}`,
            }}
          >
            <div>
              <p style={{ fontSize: '13px', color: colors.text.primary }}>{item.name}</p>
              <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
                <Badge>{item.category}</Badge>
                <span style={{ fontSize: '10px', color: colors.text.muted }}>{item.frequency}</span>
                {item.note && <span style={{ fontSize: '10px', color: colors.text.muted }}>({item.note})</span>}
              </div>
            </div>
            <span style={{ fontSize: '13px', fontWeight: 500, color: colors.text.primary, fontVariantNumeric: 'tabular-nums' }}>
              {formatCurrency(item.cost)}
            </span>
          </div>
        ))}
      </Card>
    </div>
  );
}
