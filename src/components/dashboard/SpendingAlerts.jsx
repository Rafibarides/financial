import { useMemo } from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import { colors } from '../../styles/colors';

function detectStreaks(transactions) {
  const alerts = [];
  const byDesc = {};

  transactions.forEach((tx) => {
    const key = (tx.description || '').toLowerCase().trim();
    if (!key) return;
    if (!byDesc[key]) byDesc[key] = { name: tx.description, dates: [] };
    byDesc[key].dates.push(new Date(tx.transaction_date));
  });

  Object.values(byDesc).forEach((item) => {
    if (item.dates.length < 3) return;
    item.dates.sort((a, b) => b - a);

    let streak = 1;
    for (let i = 1; i < item.dates.length; i++) {
      const diff = Math.abs(item.dates[i - 1] - item.dates[i]) / (1000 * 60 * 60 * 24);
      if (diff <= 1.5) streak++;
      else break;
    }
    if (streak >= 3) {
      alerts.push({
        type: 'streak',
        name: item.name,
        value: streak,
        message: `${streak} days in a row`,
      });
    }

    const now = new Date();
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const thisWeek = item.dates.filter((d) => d >= weekAgo).length;
    if (thisWeek >= 3) {
      alerts.push({
        type: 'frequency',
        name: item.name,
        value: thisWeek,
        message: `${thisWeek}x this week`,
      });
    }

    const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const thisMonth = item.dates.filter((d) => d >= monthAgo).length;
    if (thisMonth >= 8 && !alerts.find((a) => a.name === item.name && a.type === 'streak')) {
      alerts.push({
        type: 'frequent',
        name: item.name,
        value: thisMonth,
        message: `${thisMonth}x this month`,
      });
    }
  });

  alerts.sort((a, b) => b.value - a.value);
  return alerts.slice(0, 8);
}

const badgeVariant = {
  streak: 'negative',
  frequency: 'warning',
  frequent: 'purple',
};

const badgeLabel = {
  streak: 'Streak',
  frequency: 'This week',
  frequent: 'Frequent',
};

export default function SpendingAlerts({ transactions = [] }) {
  const alerts = useMemo(() => detectStreaks(transactions), [transactions]);

  if (alerts.length === 0) return null;

  return (
    <Card>
      <h3 style={{ fontSize: '13px', fontWeight: 500, color: colors.text.secondary, marginBottom: '12px', letterSpacing: '-0.01em' }}>
        Spending Patterns
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {alerts.map((alert, i) => (
          <div
            key={`${alert.name}-${alert.type}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '9px 0',
              borderBottom: i < alerts.length - 1 ? `1px solid ${colors.border.primary}` : 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: colors.text.primary }}>{alert.name}</span>
              <Badge variant={badgeVariant[alert.type]}>{badgeLabel[alert.type]}</Badge>
            </div>
            <span style={{ fontSize: '12px', color: colors.text.secondary, fontWeight: 500 }}>
              {alert.message}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
