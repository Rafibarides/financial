export const SHEET_NAMES = {
  USER: 'User',
  ACCOUNT: 'Account',
  CATEGORY: 'Category',
  INCOME_SOURCE: 'IncomeSource',
  RECURRING_RULE: 'RecurringRule',
  CREDIT_RULE: 'CreditRule',
  TRANSACTION: 'Transaction',
  PAYROLL_BREAKDOWN: 'PayrollBreakdown',
  TAG: 'Tag',
  TRANSACTION_TAG: 'TransactionTag',
  BUDGET_PLAN: 'BudgetPlan',
  BUDGET_ITEM: 'BudgetItem',
  CREDIT_SCORE: 'CreditScore',
  ENVELOPE: 'Envelope',
  ENVELOPE_CONTRIBUTION: 'EnvelopeContribution',
};

export const TIME_UNITS = [
  { key: 'year', label: 'Year', divisor: 1 },
  { key: 'month', label: 'Month', divisor: 12 },
  { key: 'day', label: 'Day', divisor: 365.25 },
  { key: 'hour', label: 'Hour', divisor: 365.25 * 24 },
  { key: 'minute', label: 'Minute', divisor: 365.25 * 24 * 60 },
  { key: 'second', label: 'Second', divisor: 365.25 * 24 * 3600 },
];

export const ACCOUNT_TYPES = ['checking', 'savings', 'brokerage', 'cash', 'credit_card'];

export const CATEGORY_TYPES = ['expense', 'income', 'transfer'];

export const FREQUENCIES = ['monthly', 'semimonthly', 'annual', 'weekly', 'biweekly', 'custom'];

export const DIRECTIONS = ['expense', 'income'];

export const SOURCE_TYPES = ['manual', 'import', 'rule'];

export const CURRENCY = {
  USD: 'USD',
  CAD: 'CAD',
};

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];
