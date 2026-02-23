import Card from '../common/Card';
import Badge from '../common/Badge';
import { colors } from '../../styles/colors';
import { formatCurrency, formatDateShort } from '../../utils/formatters';

export default function RecentTransactions({ transactions, categories = {} }) {
  if (!transactions?.length) return null;

  const recent = transactions.slice(0, 10);

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
          Recent Transactions
        </h3>
        <span style={{ fontSize: '11px', color: colors.text.muted }}>
          Last {recent.length}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {recent.map((tx, i) => {
          const amount = parseFloat(tx.amount) || 0;
          const isIncome = amount > 0;
          const cat = categories[tx.category_id];

          return (
            <div
              key={tx.id || i}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 0',
                borderBottom: i < recent.length - 1 ? `1px solid ${colors.border.primary}` : 'none',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: '13px',
                  color: colors.text.primary,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {tx.description}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                  <span style={{ fontSize: '11px', color: colors.text.muted }}>
                    {formatDateShort(tx.transaction_date)}
                  </span>
                  {cat && (
                    <Badge variant="default">{cat.name || cat}</Badge>
                  )}
                </div>
              </div>
              <span style={{
                fontSize: '13px',
                fontWeight: 500,
                color: isIncome ? colors.status.positive : colors.text.primary,
                fontVariantNumeric: 'tabular-nums',
                marginLeft: '12px',
              }}>
                {isIncome ? '+' : ''}{formatCurrency(amount)}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
