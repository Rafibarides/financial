import { colors } from '../../styles/colors';
import Card from '../common/Card';

const TEMPLATES = [
  { label: 'Dunkin', amount: 9.12, category_id: 'cat_food_daily', icon: 'D' },
  { label: 'MTA', amount: 3.00, category_id: 'cat_transport_transit', icon: 'M' },
  { label: 'MTA Round Trip', amount: 6.00, category_id: 'cat_transport_transit', icon: 'M' },
  { label: 'Aksaray Gyro', amount: 22.00, category_id: 'cat_food_restaurant', icon: 'A' },
  { label: 'Poke Bowl', amount: 27.00, category_id: 'cat_food_restaurant', icon: 'P' },
  { label: 'Wake Up Pastries', amount: 8.00, category_id: 'cat_food_daily', icon: 'W' },
  { label: 'Chikurin Souffle', amount: 13.99, category_id: 'cat_food_restaurant', icon: 'C' },
  { label: 'Haircut', amount: 40.00, category_id: 'cat_personal_haircut', icon: 'H' },
  { label: 'Gas', amount: 25.00, category_id: 'cat_transport_gas', icon: 'G' },
  { label: 'NYC Parking', amount: 10.00, category_id: 'cat_transport_parking', icon: 'P' },
];

export default function QuickAdd({ onSubmit, accounts = [] }) {
  const defaultAccount = accounts.find((a) => a.name?.includes('Business'))?.id || accounts[0]?.id || '';

  const handleClick = (template) => {
    onSubmit({
      description: template.label,
      amount: -Math.abs(template.amount),
      category_id: template.category_id,
      account_id: defaultAccount,
      transaction_date: new Date().toISOString().split('T')[0],
      is_recurring: false,
    });
  };

  return (
    <div>
      <h3 style={{
        fontSize: '13px',
        fontWeight: 500,
        color: colors.text.secondary,
        marginBottom: '12px',
        letterSpacing: '-0.01em',
      }}>
        Quick Add
      </h3>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {TEMPLATES.map((t) => (
          <button
            key={t.label}
            onClick={() => handleClick(t)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
              borderRadius: '8px',
              background: colors.bg.elevated,
              border: 'none',
              cursor: 'pointer',
              transition: 'background 0.15s ease, transform 0.1s ease',
              color: colors.text.primary,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = colors.bg.hover; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = colors.bg.elevated; }}
            onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.97)'; }}
            onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <span style={{
              width: '24px',
              height: '24px',
              borderRadius: '6px',
              background: colors.transparent.white10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: 600,
              color: colors.accent.purple,
            }}>
              {t.icon}
            </span>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: '12px', fontWeight: 500, lineHeight: 1.2 }}>{t.label}</p>
              <p style={{ fontSize: '10px', color: colors.text.muted }}>${t.amount.toFixed(2)}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
