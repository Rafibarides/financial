import 'dotenv/config';
import { google } from 'googleapis';
//this is it
const SPREADSHEET_ID = process.env.VITE_GOOGLE_SHEETS_ID;
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!SPREADSHEET_ID || !SERVICE_ACCOUNT_EMAIL || !PRIVATE_KEY) {
  console.error('Missing environment variables. Copy .env.example to .env and fill in values.');
  process.exit(1);
}

const auth = new google.auth.JWT(SERVICE_ACCOUNT_EMAIL, null, PRIVATE_KEY, [
  'https://www.googleapis.com/auth/spreadsheets',
]);

const sheets = google.sheets({ version: 'v4', auth });

// ---------------------------------------------------------------------------
// DATA
// ---------------------------------------------------------------------------

const USER_HEADERS = ['id', 'name', 'email', 'created_at'];
const USER_DATA = [
  ['user_1', 'Ralph Barides', 'ralph@example.com', '2025-01-01T00:00:00Z'],
];

const ACCOUNT_HEADERS = ['id', 'user_id', 'name', 'type', 'institution', 'balance', 'is_active', 'created_at'];
const ACCOUNT_DATA = [
  ['acct_chase_college', 'user_1', 'Chase College', 'checking', 'Chase', '2.20', 'true', '2025-01-01T00:00:00Z'],
  ['acct_chase_savings', 'user_1', 'Chase Savings', 'savings', 'Chase', '5.00', 'true', '2025-01-01T00:00:00Z'],
  ['acct_chase_biz', 'user_1', 'Chase Business Complete', 'checking', 'Chase', '7716.65', 'true', '2025-01-01T00:00:00Z'],
  ['acct_cash', 'user_1', 'Cash', 'cash', '-', '3500.00', 'true', '2025-01-01T00:00:00Z'],
  ['acct_venmo', 'user_1', 'Venmo', 'checking', 'Venmo', '105.57', 'true', '2025-01-01T00:00:00Z'],
  ['acct_schwab', 'user_1', 'Roth IRA Schwab', 'brokerage', 'Charles Schwab', '453.27', 'true', '2025-01-01T00:00:00Z'],
  ['acct_robinhood', 'user_1', 'Robinhood', 'brokerage', 'Robinhood', '270.61', 'true', '2025-01-01T00:00:00Z'],
  ['acct_amex', 'user_1', 'Amex Platinum', 'credit_card', 'American Express', '0.00', 'true', '2025-01-01T00:00:00Z'],
  ['acct_discover', 'user_1', 'Discover', 'credit_card', 'Discover', '0.00', 'true', '2025-01-01T00:00:00Z'],
];

const CATEGORY_HEADERS = ['id', 'user_id', 'name', 'parent_id', 'type', 'is_essential', 'is_active', 'created_at'];
const CATEGORY_DATA = [
  // Top-level expense categories
  ['cat_subs', 'user_1', 'Subscriptions', '', 'expense', 'false', 'true', '2025-01-01T00:00:00Z'],
  ['cat_lifestyle', 'user_1', 'Lifestyle', '', 'expense', 'false', 'true', '2025-01-01T00:00:00Z'],
  ['cat_food', 'user_1', 'Food & Dining', '', 'expense', 'true', 'true', '2025-01-01T00:00:00Z'],
  ['cat_transport', 'user_1', 'Transportation', '', 'expense', 'true', 'true', '2025-01-01T00:00:00Z'],
  ['cat_personal', 'user_1', 'Personal Care', '', 'expense', 'false', 'true', '2025-01-01T00:00:00Z'],
  ['cat_entertainment', 'user_1', 'Entertainment', '', 'expense', 'false', 'true', '2025-01-01T00:00:00Z'],
  ['cat_housing', 'user_1', 'Housing', '', 'expense', 'true', 'true', '2025-01-01T00:00:00Z'],
  ['cat_business', 'user_1', 'Business', '', 'expense', 'false', 'true', '2025-01-01T00:00:00Z'],
  ['cat_custom', 'user_1', 'Custom', '', 'expense', 'false', 'true', '2025-01-01T00:00:00Z'],
  // Sub-categories
  ['cat_sub_digital', 'user_1', 'Digital Services', 'cat_subs', 'expense', 'false', 'true', '2025-01-01T00:00:00Z'],
  ['cat_sub_business', 'user_1', 'Business Tools', 'cat_subs', 'expense', 'false', 'true', '2025-01-01T00:00:00Z'],
  ['cat_sub_music', 'user_1', 'Music Tools', 'cat_subs', 'expense', 'false', 'true', '2025-01-01T00:00:00Z'],
  ['cat_life_gym', 'user_1', 'Gym', 'cat_lifestyle', 'expense', 'false', 'true', '2025-01-01T00:00:00Z'],
  ['cat_life_dating', 'user_1', 'Dating', 'cat_lifestyle', 'expense', 'false', 'true', '2025-01-01T00:00:00Z'],
  ['cat_food_restaurant', 'user_1', 'Restaurants', 'cat_food', 'expense', 'false', 'true', '2025-01-01T00:00:00Z'],
  ['cat_food_daily', 'user_1', 'Daily Food', 'cat_food', 'expense', 'false', 'true', '2025-01-01T00:00:00Z'],
  ['cat_food_groceries', 'user_1', 'Groceries', 'cat_food', 'expense', 'true', 'true', '2025-01-01T00:00:00Z'],
  ['cat_transport_transit', 'user_1', 'Public Transit', 'cat_transport', 'expense', 'true', 'true', '2025-01-01T00:00:00Z'],
  ['cat_transport_gas', 'user_1', 'Gas', 'cat_transport', 'expense', 'false', 'true', '2025-01-01T00:00:00Z'],
  ['cat_transport_parking', 'user_1', 'Parking', 'cat_transport', 'expense', 'false', 'true', '2025-01-01T00:00:00Z'],
  ['cat_personal_haircut', 'user_1', 'Haircuts', 'cat_personal', 'expense', 'false', 'true', '2025-01-01T00:00:00Z'],
  ['cat_personal_hygiene', 'user_1', 'Hygiene Products', 'cat_personal', 'expense', 'false', 'true', '2025-01-01T00:00:00Z'],
  ['cat_housing_rent', 'user_1', 'Rent', 'cat_housing', 'expense', 'true', 'true', '2025-01-01T00:00:00Z'],
  ['cat_housing_utilities', 'user_1', 'Utilities', 'cat_housing', 'expense', 'true', 'true', '2025-01-01T00:00:00Z'],
  ['cat_biz_studio', 'user_1', 'Studio', 'cat_business', 'expense', 'false', 'true', '2025-01-01T00:00:00Z'],
  ['cat_biz_software', 'user_1', 'Software Development', 'cat_business', 'expense', 'false', 'true', '2025-01-01T00:00:00Z'],
  ['cat_biz_advertising', 'user_1', 'Advertising', 'cat_business', 'expense', 'false', 'true', '2025-01-01T00:00:00Z'],
  // Income categories
  ['cat_income_salary', 'user_1', 'Salary', '', 'income', 'true', 'true', '2025-01-01T00:00:00Z'],
  ['cat_income_music', 'user_1', 'Music Revenue', '', 'income', 'false', 'true', '2025-01-01T00:00:00Z'],
  ['cat_income_business', 'user_1', 'Business Revenue', '', 'income', 'false', 'true', '2025-01-01T00:00:00Z'],
  // Transfer categories
  ['cat_savings', 'user_1', 'Savings', '', 'transfer', 'true', 'true', '2025-01-01T00:00:00Z'],
  ['cat_investment', 'user_1', 'Investments', '', 'transfer', 'false', 'true', '2025-01-01T00:00:00Z'],
];

const INCOME_SOURCE_HEADERS = ['id', 'user_id', 'name', 'currency', 'is_business', 'is_active', 'created_at'];
const INCOME_SOURCE_DATA = [
  ['inc_wellbound', 'user_1', 'Wellbound', 'USD', 'false', 'true', '2025-01-01T00:00:00Z'],
  ['inc_landr', 'user_1', 'Landr', 'CAD', 'true', 'true', '2025-01-01T00:00:00Z'],
  ['inc_rbm_sounds', 'user_1', 'RBM Sounds', 'USD', 'true', 'true', '2025-01-01T00:00:00Z'],
  ['inc_studio', 'user_1', 'RBM Recording Studio', 'USD', 'true', 'true', '2025-01-01T00:00:00Z'],
];

const RECURRING_RULE_HEADERS = [
  'id', 'user_id', 'account_id', 'category_id', 'income_source_id', 'name',
  'amount', 'currency', 'direction', 'frequency', 'start_date', 'end_date',
  'rrule', 'is_active', 'created_at',
];
const RECURRING_RULE_DATA = [
  ['rec_gym', 'user_1', 'acct_chase_biz', 'cat_life_gym', '', 'Gym Membership', '91.00', 'USD', 'expense', 'monthly', '2025-01-01', '', '', 'true', '2025-01-01T00:00:00Z'],
  ['rec_applecare', 'user_1', 'acct_chase_biz', 'cat_sub_digital', '', 'AppleCare Plus', '99.99', 'USD', 'expense', 'annual', '2025-01-01', '', '', 'true', '2025-01-01T00:00:00Z'],
  ['rec_applecare_iphone', 'user_1', 'acct_chase_biz', 'cat_sub_digital', '', 'AppleCare Plus iPhone 14', '7.99', 'USD', 'expense', 'monthly', '2025-01-01', '', '', 'true', '2025-01-01T00:00:00Z'],
  ['rec_applecare_mac', 'user_1', 'acct_chase_biz', 'cat_sub_digital', '', 'AppleCare Plus Mac Mini', '34.99', 'USD', 'expense', 'annual', '2025-01-01', '', '', 'true', '2025-01-01T00:00:00Z'],
  ['rec_apple_dev', 'user_1', 'acct_chase_biz', 'cat_sub_business', '', 'Apple Developer Program', '98.99', 'USD', 'expense', 'annual', '2025-01-01', '', '', 'true', '2025-01-01T00:00:00Z'],
  ['rec_grindr', 'user_1', 'acct_chase_biz', 'cat_life_dating', '', 'Grindr', '22.99', 'USD', 'expense', 'monthly', '2025-01-01', '', '', 'true', '2025-01-01T00:00:00Z'],
  ['rec_icloud', 'user_1', 'acct_chase_biz', 'cat_sub_digital', '', 'iCloud Plus 200GB', '2.99', 'USD', 'expense', 'monthly', '2025-01-01', '', '', 'true', '2025-01-01T00:00:00Z'],
  ['rec_dropbox', 'user_1', 'acct_chase_biz', 'cat_sub_business', '', 'Dropbox Essentials', '21.76', 'USD', 'expense', 'monthly', '2025-01-01', '', '', 'true', '2025-01-01T00:00:00Z'],
  ['rec_verizon', 'user_1', 'acct_chase_biz', 'cat_housing_utilities', '', 'Verizon FIOS', '99.99', 'USD', 'expense', 'monthly', '2025-01-01', '', '', 'true', '2025-01-01T00:00:00Z'],
  ['rec_snapchat', 'user_1', 'acct_chase_biz', 'cat_sub_digital', '', 'Snapchat Storage Plus', '1.99', 'USD', 'expense', 'monthly', '2025-01-01', '', '', 'true', '2025-01-01T00:00:00Z'],
  ['rec_cursor', 'user_1', 'acct_chase_biz', 'cat_sub_business', '', 'Cursor Base Plan', '20.00', 'USD', 'expense', 'monthly', '2025-01-01', '', '', 'true', '2025-01-01T00:00:00Z'],
  ['rec_capcut', 'user_1', 'acct_chase_biz', 'cat_sub_digital', '', 'CapCut Pro', '19.99', 'USD', 'expense', 'monthly', '2025-01-01', '', '', 'true', '2025-01-01T00:00:00Z'],
  ['rec_splice', 'user_1', 'acct_chase_biz', 'cat_sub_music', '', 'Splice', '21.76', 'USD', 'expense', 'monthly', '2025-01-01', '', '', 'true', '2025-01-01T00:00:00Z'],
  ['rec_studio1', 'user_1', 'acct_chase_biz', 'cat_sub_music', '', 'Studio One Plus', '16.28', 'USD', 'expense', 'monthly', '2025-01-01', '', '', 'true', '2025-01-01T00:00:00Z'],
  ['rec_godaddy', 'user_1', 'acct_chase_biz', 'cat_sub_business', '', 'GoDaddy', '22.19', 'USD', 'expense', 'annual', '2025-01-01', '', '', 'true', '2025-01-01T00:00:00Z'],
  ['rec_adobe', 'user_1', 'acct_chase_biz', 'cat_sub_business', '', 'Adobe Creative Cloud', '14.99', 'USD', 'expense', 'monthly', '2025-01-01', '', '', 'true', '2025-01-01T00:00:00Z'],
  ['rec_landr_sub', 'user_1', 'acct_chase_biz', 'cat_sub_music', '', 'Landr Subscription', '6.52', 'USD', 'expense', 'monthly', '2025-01-01', '', '', 'true', '2025-01-01T00:00:00Z'],
  ['rec_github', 'user_1', 'acct_chase_biz', 'cat_sub_business', '', 'GitHub', '10.89', 'USD', 'expense', 'monthly', '2025-01-01', '', '', 'true', '2025-01-01T00:00:00Z'],
  ['rec_wix', 'user_1', 'acct_chase_biz', 'cat_sub_business', '', 'Wix Premium (RBM Sounds)', '37.01', 'USD', 'expense', 'monthly', '2025-01-01', '', '', 'true', '2025-01-01T00:00:00Z'],
  ['rec_distrokid', 'user_1', 'acct_chase_biz', 'cat_sub_music', '', 'DistroKid', '7.50', 'USD', 'expense', 'monthly', '2025-01-01', '', '', 'true', '2025-01-01T00:00:00Z'],
  ['rec_youtube', 'user_1', 'acct_chase_biz', 'cat_entertainment', '', 'YouTube Premium', '3.84', 'USD', 'expense', 'monthly', '2025-01-01', '', '', 'true', '2025-01-01T00:00:00Z'],
  ['rec_studio_rent', 'user_1', 'acct_chase_biz', 'cat_biz_studio', '', 'Music Recording Facility Rent', '750.00', 'USD', 'expense', 'monthly', '2025-01-01', '', '', 'true', '2025-01-01T00:00:00Z'],
  ['rec_chatgpt', 'user_1', 'acct_chase_biz', 'cat_sub_business', '', 'ChatGPT Plus', '20.00', 'USD', 'expense', 'monthly', '2025-01-01', '', '', 'true', '2025-01-01T00:00:00Z'],
  ['rec_wellbound', 'user_1', 'acct_chase_biz', 'cat_income_salary', 'inc_wellbound', 'Wellbound Salary', '2118.84', 'USD', 'income', 'semimonthly', '2025-11-19', '', '', 'true', '2025-11-19T00:00:00Z'],
  ['rec_haircut', 'user_1', 'acct_chase_biz', 'cat_personal_haircut', '', 'Haircut', '40.00', 'USD', 'expense', 'biweekly', '2025-01-01', '', '', 'true', '2025-01-01T00:00:00Z'],
  ['rec_cvs', 'user_1', 'acct_chase_biz', 'cat_personal_hygiene', '', 'CVS Hygiene Products', '50.00', 'USD', 'expense', 'monthly', '2025-01-01', '', '', 'true', '2025-01-01T00:00:00Z'],
  ['rec_cursor_extra', 'user_1', 'acct_chase_biz', 'cat_sub_business', '', 'Cursor Extra Usage (avg)', '200.00', 'USD', 'expense', 'monthly', '2025-01-01', '', '', 'true', '2025-01-01T00:00:00Z'],
];

const CREDIT_RULE_HEADERS = [
  'id', 'user_id', 'account_id', 'category_id', 'linked_recurring_rule_id', 'name',
  'amount', 'currency', 'frequency', 'start_date', 'end_date', 'rrule',
  'is_active', 'created_at',
];
const CREDIT_RULE_DATA = [
  ['cr_amex_wifi', 'user_1', 'acct_amex', 'cat_housing_utilities', 'rec_verizon', 'Amex Wireless Credit', '10.00', 'USD', 'monthly', '2025-01-01', '', '', 'true', '2025-01-01T00:00:00Z'],
  ['cr_hilton', 'user_1', 'acct_amex', 'cat_custom', '', 'Hilton Statement Credit', '45.00', 'USD', 'monthly', '2025-01-01', '', '', 'true', '2025-01-01T00:00:00Z'],
];

const TRANSACTION_HEADERS = [
  'id', 'user_id', 'account_id', 'category_id', 'income_source_id',
  'recurring_rule_id', 'credit_rule_id', 'amount', 'currency',
  'transaction_date', 'description', 'source_type', 'is_recurring_generated',
  'created_at',
];

function generateTransactions() {
  const txs = [];
  let txId = 1;
  const t = (date) => `${date}T00:00:00Z`;

  // Wellbound salary — started Nov 19 2025, semi-monthly (1st and 15th)
  const salaryDates = ['2025-12-01', '2025-12-15', '2026-01-01', '2026-01-15', '2026-02-01', '2026-02-15'];
  salaryDates.forEach((d) => {
    txs.push([`tx_${txId++}`, 'user_1', 'acct_chase_biz', 'cat_income_salary', 'inc_wellbound', 'rec_wellbound', '', '2118.84', 'USD', d, 'Wellbound Salary', 'rule', 'true', t(d)]);
  });

  // Landr royalties — exact USD amounts
  const landrData = [
    ['2025-01-15', 68.80], ['2025-02-15', 126.25], ['2025-03-15', 210.15],
    ['2025-04-15', 114.60], ['2025-05-15', 146.92], ['2025-06-15', 297.17],
    ['2025-07-15', 123.94], ['2025-08-15', 89.23], ['2025-09-15', 30.93],
    ['2025-10-15', 64.87], ['2025-11-15', 217.72], ['2025-12-15', 107.38],
    ['2026-01-15', 58.64],
  ];
  landrData.forEach(([date, amt]) => {
    txs.push([`tx_${txId++}`, 'user_1', 'acct_chase_biz', 'cat_income_music', 'inc_landr', '', '', String(amt), 'USD', date, 'Landr Royalties', 'import', 'false', t(date)]);
  });

  // RBM Sounds — exact amounts, only months with payments
  const rbmData = [
    ['2024-12-20', 43.99], ['2025-01-20', 19.99], ['2025-02-20', 19.99],
    ['2025-07-20', 714.70], ['2025-08-20', 319.87], ['2025-09-20', 119.94],
    ['2025-10-20', 19.99],
  ];
  rbmData.forEach(([date, amt]) => {
    txs.push([`tx_${txId++}`, 'user_1', 'acct_chase_biz', 'cat_income_music', 'inc_rbm_sounds', '', '', String(amt), 'USD', date, 'RBM Sounds Revenue', 'import', 'false', t(date)]);
  });

  // RBM Recording Studio — $25,000 annual average (single reference entry)
  txs.push([`tx_${txId++}`, 'user_1', 'acct_chase_biz', 'cat_income_business', 'inc_studio', '', '', '25000', 'USD', '2025-12-31', 'RBM Recording Studio Revenue (2025 annual)', 'import', 'false', t('2025-12-31')]);

  // Monthly recurring expenses — 2025 + Jan/Feb 2026
  const monthlyExpenses = [
    ['rec_gym', 'cat_life_gym', 91.00, 'Gym Membership'],
    ['rec_grindr', 'cat_life_dating', 22.99, 'Grindr'],
    ['rec_icloud', 'cat_sub_digital', 2.99, 'iCloud Plus 200GB'],
    ['rec_dropbox', 'cat_sub_business', 21.76, 'Dropbox Essentials'],
    ['rec_verizon', 'cat_housing_utilities', 99.99, 'Verizon FIOS'],
    ['rec_snapchat', 'cat_sub_digital', 1.99, 'Snapchat Storage Plus'],
    ['rec_cursor', 'cat_sub_business', 20.00, 'Cursor Base Plan'],
    ['rec_capcut', 'cat_sub_digital', 19.99, 'CapCut Pro'],
    ['rec_splice', 'cat_sub_music', 21.76, 'Splice'],
    ['rec_studio1', 'cat_sub_music', 16.28, 'Studio One Plus'],
    ['rec_adobe', 'cat_sub_business', 14.99, 'Adobe Creative Cloud'],
    ['rec_landr_sub', 'cat_sub_music', 6.52, 'Landr Subscription'],
    ['rec_github', 'cat_sub_business', 10.89, 'GitHub'],
    ['rec_wix', 'cat_sub_business', 37.01, 'Wix Premium - RBM Sounds'],
    ['rec_distrokid', 'cat_sub_music', 7.50, 'DistroKid'],
    ['rec_youtube', 'cat_entertainment', 3.84, 'YouTube Premium'],
    ['rec_studio_rent', 'cat_biz_studio', 750.00, 'Music Recording Facility Rent'],
    ['rec_chatgpt', 'cat_sub_business', 20.00, 'ChatGPT Plus'],
    ['rec_cvs', 'cat_personal_hygiene', 50.00, 'CVS Hygiene Products'],
    ['rec_cursor_extra', 'cat_sub_business', 200.00, 'Cursor Extra Usage'],
  ];
  const expMonths = [];
  for (let m = 1; m <= 12; m++) expMonths.push(`2025-${String(m).padStart(2, '0')}`);
  expMonths.push('2026-01', '2026-02');
  expMonths.forEach((mo) => {
    monthlyExpenses.forEach(([ruleId, catId, amt, desc]) => {
      txs.push([`tx_${txId++}`, 'user_1', 'acct_chase_biz', catId, '', ruleId, '', String(-amt), 'USD', `${mo}-01`, desc, 'rule', 'true', t(`${mo}-01`)]);
    });
  });

  // Biweekly haircuts — 2025 + Jan/Feb 2026
  for (let m = 1; m <= 14; m++) {
    const month = m <= 12 ? m : m - 12;
    const year = m <= 12 ? 2025 : 2026;
    const mo = `${year}-${String(month).padStart(2, '0')}`;
    txs.push([`tx_${txId++}`, 'user_1', 'acct_chase_biz', 'cat_personal_haircut', '', 'rec_haircut', '', '-40.00', 'USD', `${mo}-01`, 'Haircut', 'rule', 'true', t(`${mo}-01`)]);
    txs.push([`tx_${txId++}`, 'user_1', 'acct_chase_biz', 'cat_personal_haircut', '', 'rec_haircut', '', '-40.00', 'USD', `${mo}-15`, 'Haircut', 'rule', 'true', t(`${mo}-15`)]);
  }

  // Annual charges
  txs.push([`tx_${txId++}`, 'user_1', 'acct_chase_biz', 'cat_sub_digital', '', 'rec_applecare', '', '-99.99', 'USD', '2025-03-15', 'AppleCare Plus (annual)', 'rule', 'true', t('2025-03-15')]);
  txs.push([`tx_${txId++}`, 'user_1', 'acct_chase_biz', 'cat_sub_digital', '', 'rec_applecare_mac', '', '-34.99', 'USD', '2025-06-10', 'AppleCare Plus Mac Mini (annual)', 'rule', 'true', t('2025-06-10')]);
  txs.push([`tx_${txId++}`, 'user_1', 'acct_chase_biz', 'cat_sub_business', '', 'rec_apple_dev', '', '-98.99', 'USD', '2025-09-01', 'Apple Developer Program (annual)', 'rule', 'true', t('2025-09-01')]);
  txs.push([`tx_${txId++}`, 'user_1', 'acct_chase_biz', 'cat_sub_business', '', 'rec_godaddy', '', '-22.19', 'USD', '2025-04-20', 'GoDaddy (annual)', 'rule', 'true', t('2025-04-20')]);

  // Credit rule transactions — Amex subsidies
  const creditMonths = [];
  for (let m = 1; m <= 12; m++) creditMonths.push(`2025-${String(m).padStart(2, '0')}`);
  creditMonths.push('2026-01', '2026-02');
  creditMonths.forEach((mo) => {
    txs.push([`tx_${txId++}`, 'user_1', 'acct_amex', 'cat_housing_utilities', '', '', 'cr_amex_wifi', '10.00', 'USD', `${mo}-01`, 'Amex Wireless Credit', 'rule', 'true', t(`${mo}-01`)]);
    txs.push([`tx_${txId++}`, 'user_1', 'acct_amex', 'cat_custom', '', '', 'cr_hilton', '45.00', 'USD', `${mo}-01`, 'Hilton Statement Credit', 'rule', 'true', t(`${mo}-01`)]);
  });

  return txs;
}

const TRANSACTION_DATA = generateTransactions();

// Payroll breakdown for a sample salary transaction
const PAYROLL_HEADERS = [
  'id', 'transaction_id', 'gross_amount', 'federal_income_tax', 'social_security',
  'medicare', 'nys_income_tax', 'ny_paid_leave', 'ny_disability', 'nyc_income_tax',
  'other_deductions', 'total_taxes',
];
const PAYROLL_DATA = [
  ['pb_1', 'tx_1', '2884.60', '295.00', '178.84', '41.83', '134.07', '12.47', '1.20', '102.35', '0', '765.76'],
  ['pb_2', 'tx_2', '2884.60', '295.00', '178.84', '41.83', '134.07', '12.47', '1.20', '102.35', '0', '765.76'],
];

const TAG_HEADERS = ['id', 'user_id', 'name', 'created_at'];
const TAG_DATA = [
  ['tag_essential', 'user_1', 'essential', '2025-01-01T00:00:00Z'],
  ['tag_nonessential', 'user_1', 'non-essential', '2025-01-01T00:00:00Z'],
  ['tag_recurring', 'user_1', 'recurring', '2025-01-01T00:00:00Z'],
  ['tag_business', 'user_1', 'business', '2025-01-01T00:00:00Z'],
  ['tag_personal', 'user_1', 'personal', '2025-01-01T00:00:00Z'],
  ['tag_music', 'user_1', 'music', '2025-01-01T00:00:00Z'],
  ['tag_software', 'user_1', 'software-dev', '2025-01-01T00:00:00Z'],
  ['tag_revenue', 'user_1', 'revenue-stream', '2025-01-01T00:00:00Z'],
  ['tag_food', 'user_1', 'food', '2025-01-01T00:00:00Z'],
  ['tag_digital', 'user_1', 'digital', '2025-01-01T00:00:00Z'],
  ['tag_custom', 'user_1', 'custom', '2025-01-01T00:00:00Z'],
];

const TRANSACTION_TAG_HEADERS = ['transaction_id', 'tag_id'];
const TRANSACTION_TAG_DATA = [
  ['tx_1', 'tag_essential'],
  ['tx_1', 'tag_recurring'],
];

const CREDIT_SCORE_HEADERS = ['id', 'user_id', 'score', 'date_recorded', 'created_at'];
const CREDIT_SCORE_DATA = [
  ['cs_1', 'user_1', '766', '2025-12-01', '2025-12-01T00:00:00Z'],
  ['cs_2', 'user_1', '766', '2026-01-01', '2026-01-01T00:00:00Z'],
  ['cs_3', 'user_1', '766', '2026-02-01', '2026-02-01T00:00:00Z'],
];

const BUDGET_PLAN_HEADERS = ['id', 'user_id', 'name', 'year', 'month', 'currency', 'created_at'];
const BUDGET_PLAN_DATA = [
  ['bp_2026_01', 'user_1', 'Monthly Budget', '2026', '1', 'USD', '2026-01-01T00:00:00Z'],
  ['bp_2026_02', 'user_1', 'Monthly Budget', '2026', '2', 'USD', '2026-02-01T00:00:00Z'],
];

const BUDGET_ITEM_HEADERS = ['id', 'budget_plan_id', 'category_id', 'planned_amount', 'notes'];
const planItems = [
  ['cat_housing_rent', '2000.00', 'Facility and living combined'],
  ['cat_housing_utilities', '99.99', 'Wifi (Verizon FIOS)'],
  ['cat_transport', '150.00', 'MTA, gas, parking'],
  ['cat_personal', '150.00', 'Haircuts and hygiene'],
  ['cat_food_groceries', '500.00', 'Groceries and basics'],
  ['cat_housing_utilities_general', '200.00', 'Utilities (electric, water, etc.)'],
  ['cat_savings', '400.00', 'Savings target'],
  ['cat_food_restaurant', '300.00', 'Restaurants and eating out'],
];
const BUDGET_ITEM_DATA = [];
let biId = 1;
['bp_2026_01', 'bp_2026_02'].forEach((planId) => {
  planItems.forEach(([catId, amount, notes]) => {
    BUDGET_ITEM_DATA.push([`bi_${biId++}`, planId, catId, amount, notes]);
  });
});

// ---------------------------------------------------------------------------
// SEED LOGIC
// ---------------------------------------------------------------------------

const ALL_SHEETS = [
  { title: 'User', headers: USER_HEADERS, data: USER_DATA },
  { title: 'Account', headers: ACCOUNT_HEADERS, data: ACCOUNT_DATA },
  { title: 'Category', headers: CATEGORY_HEADERS, data: CATEGORY_DATA },
  { title: 'IncomeSource', headers: INCOME_SOURCE_HEADERS, data: INCOME_SOURCE_DATA },
  { title: 'RecurringRule', headers: RECURRING_RULE_HEADERS, data: RECURRING_RULE_DATA },
  { title: 'CreditRule', headers: CREDIT_RULE_HEADERS, data: CREDIT_RULE_DATA },
  { title: 'Transaction', headers: TRANSACTION_HEADERS, data: TRANSACTION_DATA },
  { title: 'PayrollBreakdown', headers: PAYROLL_HEADERS, data: PAYROLL_DATA },
  { title: 'Tag', headers: TAG_HEADERS, data: TAG_DATA },
  { title: 'TransactionTag', headers: TRANSACTION_TAG_HEADERS, data: TRANSACTION_TAG_DATA },
  { title: 'BudgetPlan', headers: BUDGET_PLAN_HEADERS, data: BUDGET_PLAN_DATA },
  { title: 'BudgetItem', headers: BUDGET_ITEM_HEADERS, data: BUDGET_ITEM_DATA },
  { title: 'CreditScore', headers: CREDIT_SCORE_HEADERS, data: CREDIT_SCORE_DATA },
];

async function getExistingSheets() {
  const res = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  return res.data.sheets.map((s) => s.properties);
}

async function createMissingSheets(existing) {
  const existingTitles = new Set(existing.map((s) => s.title));
  const requests = [];

  ALL_SHEETS.forEach((s) => {
    if (!existingTitles.has(s.title)) {
      requests.push({ addSheet: { properties: { title: s.title } } });
    }
  });

  if (requests.length > 0) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: { requests },
    });
    console.log(`Created ${requests.length} new sheets`);
  } else {
    console.log('All sheets already exist');
  }
}

async function clearAndPopulate(sheetTitle, headers, data) {
  const range = `${sheetTitle}!A:ZZ`;
  await sheets.spreadsheets.values.clear({
    spreadsheetId: SPREADSHEET_ID,
    range,
  });

  const values = [headers, ...data];
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetTitle}!A1`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values },
  });

  console.log(`  ${sheetTitle}: ${data.length} rows`);
}

async function deleteDefaultSheet(existing) {
  const sheet1 = existing.find((s) => s.title === 'Sheet1');
  if (sheet1 && existing.length > 1) {
    try {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [{ deleteSheet: { sheetId: sheet1.sheetId } }],
        },
      });
      console.log('Removed default Sheet1');
    } catch {
      // ignore if can't delete
    }
  }
}

async function seed() {
  console.log('Starting seed...\n');

  const existing = await getExistingSheets();
  await createMissingSheets(existing);

  console.log('\nPopulating sheets:');
  for (const s of ALL_SHEETS) {
    await clearAndPopulate(s.title, s.headers, s.data);
  }

  const updated = await getExistingSheets();
  await deleteDefaultSheet(updated);

  console.log('\nSeed complete.');
  console.log(`Total transactions: ${TRANSACTION_DATA.length}`);
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
