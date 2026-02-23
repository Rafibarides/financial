export function toYearly(amount, frequency) {
  const amt = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(amt)) return 0;
  switch (frequency) {
    case 'annual': return amt;
    case 'monthly': return amt * 12;
    case 'semimonthly': return amt * 24;
    case 'biweekly': return amt * 26;
    case 'weekly': return amt * 52;
    case 'daily': return amt * 365.25;
    default: return amt * 12;
  }
}

export function normalizeToUnit(amount, frequency, timeUnit) {
  const yearly = toYearly(amount, frequency);
  switch (timeUnit) {
    case 'year': return yearly;
    case 'month': return yearly / 12;
    case 'day': return yearly / 365.25;
    case 'hour': return yearly / (365.25 * 24);
    case 'minute': return yearly / (365.25 * 24 * 60);
    case 'second': return yearly / (365.25 * 24 * 3600);
    default: return yearly / 12;
  }
}

export function frequencyLabel(frequency) {
  switch (frequency) {
    case 'annual': return '/yr';
    case 'monthly': return '/mo';
    case 'semimonthly': return '/2x mo';
    case 'biweekly': return '/2wk';
    case 'weekly': return '/wk';
    case 'daily': return '/day';
    default: return '/mo';
  }
}

export function unitLabel(timeUnit) {
  switch (timeUnit) {
    case 'year': return '/yr';
    case 'month': return '/mo';
    case 'day': return '/day';
    case 'hour': return '/hr';
    case 'minute': return '/min';
    case 'second': return '/sec';
    default: return '/mo';
  }
}
