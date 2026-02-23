import { useMemo } from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import { colors } from '../../styles/colors';
import { formatCurrency, toNumber, capitalize } from '../../utils/formatters';

const typeBadge = {
  checking: 'blue',
  savings: 'positive',
  brokerage: 'purple',
  cash: 'cyan',
  credit_card: 'warning',
};

export default function FinancialSnapshot({ accounts = [], creditScores = [], tags = [] }) {
  const stats = useMemo(() => {
    const assets = accounts
      .filter((a) => a.type !== 'credit_card')
      .reduce((s, a) => s + toNumber(a.balance), 0);
    const creditDebt = accounts
      .filter((a) => a.type === 'credit_card')
      .reduce((s, a) => s + toNumber(a.balance), 0);
    const total = assets - creditDebt;
    const liquid = accounts
      .filter((a) => ['checking', 'savings', 'cash'].includes(a.type))
      .reduce((s, a) => s + toNumber(a.balance), 0);
    const invested = accounts
      .filter((a) => a.type === 'brokerage')
      .reduce((s, a) => s + toNumber(a.balance), 0);
    return { total, liquid, invested, creditDebt };
  }, [accounts]);

  const latestScore = useMemo(() => {
    if (!creditScores.length) return null;
    return [...creditScores].sort((a, b) =>
      new Date(b.date_recorded) - new Date(a.date_recorded)
    )[0];
  }, [creditScores]);

  return (
    <div>
      <h3 style={{ fontSize: '16px', fontWeight: 600, color: colors.text.primary, letterSpacing: '-0.02em', marginBottom: '16px' }}>
        Financial Snapshot
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: latestScore ? '1fr 1fr 1fr 1fr' : '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
        <Card padding="14px">
          <p style={{ fontSize: '11px', color: colors.text.tertiary, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
            Net Worth
          </p>
          <p style={{ fontSize: '22px', fontWeight: 600, color: colors.text.primary, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>
            {formatCurrency(stats.total)}
          </p>
        </Card>
        <Card padding="14px">
          <p style={{ fontSize: '11px', color: colors.text.tertiary, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
            Liquid
          </p>
          <p style={{ fontSize: '22px', fontWeight: 600, color: colors.accent.blue, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>
            {formatCurrency(stats.liquid)}
          </p>
        </Card>
        <Card padding="14px">
          <p style={{ fontSize: '11px', color: colors.text.tertiary, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
            Invested
          </p>
          <p style={{ fontSize: '22px', fontWeight: 600, color: colors.accent.purple, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>
            {formatCurrency(stats.invested)}
          </p>
        </Card>
        {latestScore && (
          <Card padding="14px">
            <p style={{ fontSize: '11px', color: colors.text.tertiary, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
              Credit Score
            </p>
            <p style={{ fontSize: '22px', fontWeight: 600, color: colors.status.positive, letterSpacing: '-0.03em' }}>
              {latestScore.score}
            </p>
          </Card>
        )}
      </div>

      {/* Account list */}
      <Card>
        <h4 style={{ fontSize: '12px', fontWeight: 500, color: colors.text.tertiary, marginBottom: '12px' }}>
          Accounts
        </h4>
        {[...accounts]
          .filter((a) => a.type !== 'credit_card')
          .sort((a, b) => toNumber(b.balance) - toNumber(a.balance))
          .map((acct, i, arr) => (
          <div
            key={acct.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 0',
              borderBottom: i < arr.length - 1 ? `1px solid ${colors.border.primary}` : 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: colors.text.primary }}>{acct.name}</span>
              <Badge variant={typeBadge[acct.type] || 'default'}>{capitalize(acct.type)}</Badge>
            </div>
            <span style={{ fontSize: '13px', fontWeight: 500, color: colors.text.primary, fontVariantNumeric: 'tabular-nums' }}>
              {formatCurrency(toNumber(acct.balance))}
            </span>
          </div>
        ))}

        {/* Credit cards section */}
        {accounts.some((a) => a.type === 'credit_card') && (
          <>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              margin: '14px 0 10px',
            }}>
              <div style={{ height: '1px', flex: 1, background: colors.border.secondary }} />
              <span style={{ fontSize: '10px', color: colors.text.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Credit Cards
              </span>
              <div style={{ height: '1px', flex: 1, background: colors.border.secondary }} />
            </div>
            {[...accounts]
              .filter((a) => a.type === 'credit_card')
              .sort((a, b) => toNumber(b.balance) - toNumber(a.balance))
              .map((acct, i, arr) => {
                const bal = toNumber(acct.balance);
                return (
                  <div
                    key={acct.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 0',
                      borderBottom: i < arr.length - 1 ? `1px solid ${colors.border.primary}` : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '13px', color: colors.text.secondary }}>{acct.name}</span>
                      <Badge variant="warning">{capitalize(acct.type)}</Badge>
                    </div>
                    <span style={{
                      fontSize: '13px',
                      fontWeight: 500,
                      fontVariantNumeric: 'tabular-nums',
                      color: bal > 0 ? colors.status.negative : colors.status.positive,
                    }}>
                      {bal > 0 ? `-${formatCurrency(bal)}` : formatCurrency(bal)}
                    </span>
                  </div>
                );
              })}
          </>
        )}
      </Card>

      {/* Tags */}
      {tags.length > 0 && (
        <div style={{ marginTop: '16px' }}>
          <h4 style={{ fontSize: '12px', fontWeight: 500, color: colors.text.tertiary, marginBottom: '8px' }}>
            Tags
          </h4>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {tags.map((tag) => (
              <Badge key={tag.id} variant="default">{tag.name}</Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
