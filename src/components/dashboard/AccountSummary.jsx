import Card from '../common/Card';
import Badge from '../common/Badge';
import { colors } from '../../styles/colors';
import { formatCurrency, capitalize } from '../../utils/formatters';

const typeBadgeVariant = {
  checking: 'blue',
  savings: 'positive',
  brokerage: 'purple',
  cash: 'cyan',
  credit_card: 'warning',
};

export default function AccountSummary({ accounts }) {
  if (!accounts?.length) return null;

  return (
    <Card>
      <h3 style={{
        fontSize: '13px',
        fontWeight: 500,
        color: colors.text.secondary,
        marginBottom: '16px',
        letterSpacing: '-0.01em',
      }}>
        Accounts
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {accounts.map((acct) => (
          <div
            key={acct.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 0',
              borderBottom: `1px solid ${colors.border.primary}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div>
                <p style={{ fontSize: '13px', color: colors.text.primary }}>{acct.name}</p>
                <p style={{ fontSize: '11px', color: colors.text.muted }}>{acct.institution}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Badge variant={typeBadgeVariant[acct.type] || 'default'}>
                {capitalize(acct.type)}
              </Badge>
              <span style={{
                fontSize: '13px',
                fontWeight: 500,
                color: colors.text.primary,
                fontVariantNumeric: 'tabular-nums',
                minWidth: '80px',
                textAlign: 'right',
              }}>
                {formatCurrency(acct.balance || 0)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
