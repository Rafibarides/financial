import { useMemo } from 'react';
import { useMultipleSheets } from '../hooks/useSheetData';
import { SHEET_NAMES } from '../utils/constants';
import { colors } from '../styles/colors';
import { formatCurrency, toNumber, capitalize } from '../utils/formatters';
import { frequencyLabel } from '../utils/calculations';
import Loader from '../components/common/Loader';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import MetricCard from '../components/dashboard/MetricCard';
import useIsMobile from '../hooks/useIsMobile';

const sheets = [
  SHEET_NAMES.ACCOUNT,
  SHEET_NAMES.CREDIT_RULE,
];

const typeBadge = {
  checking: 'blue',
  savings: 'positive',
  brokerage: 'purple',
  cash: 'cyan',
  credit_card: 'warning',
};

function AccountIcon({ type }) {
  const isCreditCard = type === 'credit_card';
  return (
    <div style={{
      width: '36px',
      height: '36px',
      borderRadius: '10px',
      background: colors.transparent.white5,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={colors.accent[isCreditCard ? 'purple' : 'blue']} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {isCreditCard ? (
          <>
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
            <line x1="1" y1="10" x2="23" y2="10" />
          </>
        ) : (
          <>
            <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </>
        )}
      </svg>
    </div>
  );
}

export default function Accounts() {
  const { data, loading, error } = useMultipleSheets(sheets);
  const isMobile = useIsMobile();

  const accounts = data[SHEET_NAMES.ACCOUNT] || [];
  const creditRules = data[SHEET_NAMES.CREDIT_RULE] || [];

  const stats = useMemo(() => {
    const total = accounts.reduce((s, a) => s + toNumber(a.balance), 0);
    const liquid = accounts
      .filter((a) => ['checking', 'savings', 'cash'].includes(a.type))
      .reduce((s, a) => s + toNumber(a.balance), 0);
    const invested = accounts
      .filter((a) => a.type === 'brokerage')
      .reduce((s, a) => s + toNumber(a.balance), 0);
    const creditDebt = accounts
      .filter((a) => a.type === 'credit_card')
      .reduce((s, a) => s + toNumber(a.balance), 0);

    return { total, liquid, invested, creditDebt };
  }, [accounts]);

  const creditsByAccount = useMemo(() => {
    const map = {};
    creditRules.forEach((rule) => {
      if (rule.is_active === 'false') return;
      if (!map[rule.account_id]) map[rule.account_id] = [];
      map[rule.account_id].push(rule);
    });
    return map;
  }, [creditRules]);

  if (loading) return <Loader />;

  if (error) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center' }}>
        <p style={{ color: colors.text.tertiary, fontSize: '14px' }}>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: isMobile ? '20px' : '22px', fontWeight: 600, color: colors.text.primary, letterSpacing: '-0.03em' }}>
          Accounts
        </h2>
        <p style={{ fontSize: '13px', color: colors.text.tertiary, marginTop: '2px' }}>
          All accounts and balances
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: isMobile ? '8px' : '16px', marginBottom: '24px' }}>
        <MetricCard label="Total Assets" value={formatCurrency(stats.total)} />
        <MetricCard label="Liquid Cash" value={formatCurrency(stats.liquid)} accentColor={colors.accent.blue} />
        <MetricCard label="Invested" value={formatCurrency(stats.invested)} accentColor={colors.accent.purple} />
        <MetricCard
          label="Credit Balance"
          value={formatCurrency(stats.creditDebt)}
          accentColor={stats.creditDebt > 0 ? colors.status.negative : colors.status.positive}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
        {accounts.map((acct) => {
          const balance = toNumber(acct.balance);
          const subsidies = creditsByAccount[acct.id] || [];

          return (
            <Card key={acct.id}>
              <div style={{
                display: 'flex',
                alignItems: isMobile ? 'flex-start' : 'center',
                justifyContent: 'space-between',
                marginBottom: subsidies.length > 0 ? '16px' : '0',
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? '10px' : '0',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <AccountIcon type={acct.type} />
                  <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 500, color: colors.text.primary }}>
                      {acct.name}
                    </h3>
                    <Badge variant={typeBadge[acct.type] || 'default'}>
                      {capitalize(acct.type)}
                    </Badge>
                  </div>
                  <p style={{ fontSize: '11px', color: colors.text.muted, marginTop: '2px' }}>
                    {acct.institution}
                  </p>
                  </div>
                </div>
                <span style={{
                  fontSize: '20px',
                  fontWeight: 600,
                  color: colors.text.primary,
                  fontVariantNumeric: 'tabular-nums',
                  letterSpacing: '-0.02em',
                  marginLeft: isMobile ? '48px' : '0',
                }}>
                  {formatCurrency(balance)}
                </span>
              </div>

              {subsidies.length > 0 && (
                <div style={{
                  borderTop: `1px solid ${colors.border.primary}`,
                  paddingTop: '12px',
                }}>
                  <p style={{ fontSize: '11px', color: colors.text.muted, marginBottom: '8px' }}>
                    Subsidies / Credits
                  </p>
                  {subsidies.map((rule) => {
                    const amt = toNumber(rule.amount);
                    return (
                      <div
                        key={rule.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '6px 0',
                          fontSize: '12px',
                        }}
                      >
                        <span style={{ color: colors.text.secondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}>
                          {rule.name || rule.id}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, marginLeft: '8px' }}>
                          <span style={{
                            color: colors.status.positive,
                            fontVariantNumeric: 'tabular-nums',
                            fontWeight: 500,
                          }}>
                            +{formatCurrency(amt)}
                          </span>
                          <span style={{ fontSize: '10px', color: colors.text.muted }}>
                            {frequencyLabel(rule.frequency)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
