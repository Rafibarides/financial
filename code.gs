// =============================================================================
// BUDGET TRACKER — Google Apps Script
// =============================================================================
// Paste this into Extensions > Apps Script inside your "Tracker" spreadsheet.
//
// SETUP:
//   1. Paste this code, save.
//   2. Run `seedAll` from the function dropdown (play button) to create
//      all sheets and populate seed data.
//   3. Deploy > New deployment > Web app
//        - Execute as: Me
//        - Who has access: Anyone
//   4. Copy the Web app URL and set it as VITE_SHEETS_API_URL in your .env
//
// The React app hits doGet to read and doPost to write. No API keys needed.
// =============================================================================

// ---------------------------------------------------------------------------
// WEB APP ENDPOINTS
// ---------------------------------------------------------------------------

function doGet(e) {
  var params = e ? e.parameter : {};
  var action = params.action || 'read';
  var sheetName = params.sheet;

  try {
    if (action === 'append' && sheetName && params.row) {
      var row = JSON.parse(params.row);
      appendRow_(sheetName, row);
      return jsonResponse_({ status: 'ok', message: 'Row appended to ' + sheetName });
    }

    if (action === 'update' && sheetName && params.id && params.row) {
      var uRow = JSON.parse(params.row);
      updateRow_(sheetName, params.id, uRow);
      return jsonResponse_({ status: 'ok', message: 'Row updated in ' + sheetName });
    }

    if (action === 'appendMultiple' && sheetName && params.rows) {
      var rows = JSON.parse(params.rows);
      var sheet = getOrCreateSheet_(sheetName);
      for (var i = 0; i < rows.length; i++) {
        sheet.appendRow(rows[i]);
      }
      return jsonResponse_({ status: 'ok', message: rows.length + ' rows appended to ' + sheetName });
    }

    if (action === 'read' && sheetName) {
      var data = readSheet_(sheetName);
      return jsonResponse_({ status: 'ok', sheet: sheetName, data: data });
    }

    if (action === 'readAll') {
      var sheetNames = params.sheets ? params.sheets.split(',') : getAllSheetNames_();
      var result = {};
      for (var i = 0; i < sheetNames.length; i++) {
        result[sheetNames[i]] = readSheet_(sheetNames[i]);
      }
      return jsonResponse_({ status: 'ok', data: result });
    }

    if (action === 'metadata') {
      return jsonResponse_({ status: 'ok', sheets: getAllSheetNames_() });
    }

    return jsonResponse_({ status: 'error', message: 'Provide ?action=read&sheet=SheetName or ?action=readAll' });
  } catch (err) {
    return jsonResponse_({ status: 'error', message: err.message });
  }
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var action = body.action || 'append';
    var sheetName = body.sheet;

    if (action === 'append' && sheetName && body.row) {
      appendRow_(sheetName, body.row);
      return jsonResponse_({ status: 'ok', message: 'Row appended to ' + sheetName });
    }

    if (action === 'update' && sheetName && body.id && body.row) {
      updateRow_(sheetName, body.id, body.row);
      return jsonResponse_({ status: 'ok', message: 'Row updated in ' + sheetName });
    }

    if (action === 'appendMultiple' && sheetName && body.rows) {
      var sheet = getOrCreateSheet_(sheetName);
      for (var i = 0; i < body.rows.length; i++) {
        sheet.appendRow(body.rows[i]);
      }
      return jsonResponse_({ status: 'ok', message: body.rows.length + ' rows appended to ' + sheetName });
    }

    return jsonResponse_({ status: 'error', message: 'Provide action, sheet, and row/rows in POST body' });
  } catch (err) {
    return jsonResponse_({ status: 'error', message: err.message });
  }
}

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

function jsonResponse_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function readSheet_(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) return [];
  var rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return [];
  var headers = rows[0];
  var result = [];
  for (var r = 1; r < rows.length; r++) {
    var obj = {};
    for (var c = 0; c < headers.length; c++) {
      obj[headers[c]] = rows[r][c] !== undefined ? String(rows[r][c]) : '';
    }
    result.push(obj);
  }
  return result;
}

function getAllSheetNames_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheets().map(function(s) { return s.getName(); });
}

function getOrCreateSheet_(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  return sheet;
}

function appendRow_(sheetName, row) {
  var sheet = getOrCreateSheet_(sheetName);
  sheet.appendRow(row);
}

function updateRow_(sheetName, id, newRow) {
  var sheet = getOrCreateSheet_(sheetName);
  var data = sheet.getDataRange().getValues();
  var idCol = data[0].indexOf('id');
  if (idCol === -1) idCol = 0;
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][idCol]) === String(id)) {
      sheet.getRange(i + 1, 1, 1, newRow.length).setValues([newRow]);
      return;
    }
  }
  sheet.appendRow(newRow);
}

function clearAndPopulate_(title, headers, data) {
  var sheet = getOrCreateSheet_(title);
  sheet.clear();
  var all = [headers].concat(data);
  if (all.length > 0 && all[0].length > 0) {
    sheet.getRange(1, 1, all.length, all[0].length).setValues(all);
  }
  // Bold headers
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  // Freeze header row
  sheet.setFrozenRows(1);
  // Auto-resize columns (up to 14 to stay within quota)
  var cols = Math.min(headers.length, 14);
  for (var i = 1; i <= cols; i++) {
    sheet.autoResizeColumn(i);
  }
  Logger.log('  ' + title + ': ' + data.length + ' rows');
}

// ---------------------------------------------------------------------------
// PAD HELPERS
// ---------------------------------------------------------------------------

function pad2_(n) {
  return n < 10 ? '0' + n : '' + n;
}

function ts_(date) {
  return date + 'T00:00:00Z';
}

// ---------------------------------------------------------------------------
// SEED DATA
// ---------------------------------------------------------------------------

function getUserData_() {
  var headers = ['id', 'name', 'email', 'created_at'];
  var data = [
    ['user_1', 'Ralph Barides', 'ralph@example.com', '2025-01-01T00:00:00Z']
  ];
  return { headers: headers, data: data };
}

function getAccountData_() {
  var headers = ['id', 'user_id', 'name', 'type', 'institution', 'balance', 'is_active', 'created_at'];
  var data = [
    ['acct_chase_college', 'user_1', 'Chase College', 'checking', 'Chase', 2.20, 'true', '2025-01-01T00:00:00Z'],
    ['acct_chase_savings', 'user_1', 'Chase Savings', 'savings', 'Chase', 5.00, 'true', '2025-01-01T00:00:00Z'],
    ['acct_chase_biz', 'user_1', 'Chase Business Complete', 'checking', 'Chase', 7716.65, 'true', '2025-01-01T00:00:00Z'],
    ['acct_cash', 'user_1', 'Cash', 'cash', '-', 3500.00, 'true', '2025-01-01T00:00:00Z'],
    ['acct_venmo', 'user_1', 'Venmo', 'checking', 'Venmo', 105.57, 'true', '2025-01-01T00:00:00Z'],
    ['acct_schwab', 'user_1', 'Roth IRA Schwab', 'brokerage', 'Charles Schwab', 453.27, 'true', '2025-01-01T00:00:00Z'],
    ['acct_robinhood', 'user_1', 'Robinhood', 'brokerage', 'Robinhood', 270.61, 'true', '2025-01-01T00:00:00Z'],
    ['acct_amex', 'user_1', 'Amex Platinum', 'credit_card', 'American Express', 0.00, 'true', '2025-01-01T00:00:00Z'],
    ['acct_discover', 'user_1', 'Discover', 'credit_card', 'Discover', 0.00, 'true', '2025-01-01T00:00:00Z']
  ];
  return { headers: headers, data: data };
}

function getCategoryData_() {
  var headers = ['id', 'user_id', 'name', 'parent_id', 'type', 'is_essential', 'is_active', 'created_at'];
  var data = [
    // Top-level expense
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
    // Income
    ['cat_income_salary', 'user_1', 'Salary', '', 'income', 'true', 'true', '2025-01-01T00:00:00Z'],
    ['cat_income_music', 'user_1', 'Music Revenue', '', 'income', 'false', 'true', '2025-01-01T00:00:00Z'],
    ['cat_income_business', 'user_1', 'Business Revenue', '', 'income', 'false', 'true', '2025-01-01T00:00:00Z'],
    // Transfer
    ['cat_savings', 'user_1', 'Savings', '', 'transfer', 'true', 'true', '2025-01-01T00:00:00Z'],
    ['cat_investment', 'user_1', 'Investments', '', 'transfer', 'false', 'true', '2025-01-01T00:00:00Z']
  ];
  return { headers: headers, data: data };
}

function getIncomeSourceData_() {
  var headers = ['id', 'user_id', 'name', 'currency', 'is_business', 'is_active', 'created_at'];
  var data = [
    ['inc_wellbound', 'user_1', 'Wellbound', 'USD', 'false', 'true', '2025-01-01T00:00:00Z'],
    ['inc_landr', 'user_1', 'Landr', 'CAD', 'true', 'true', '2025-01-01T00:00:00Z'],
    ['inc_rbm_sounds', 'user_1', 'RBM Sounds', 'USD', 'true', 'true', '2025-01-01T00:00:00Z'],
    ['inc_studio', 'user_1', 'RBM Recording Studio', 'USD', 'true', 'true', '2025-01-01T00:00:00Z']
  ];
  return { headers: headers, data: data };
}

function getRecurringRuleData_() {
  var headers = ['id', 'user_id', 'account_id', 'category_id', 'income_source_id', 'name', 'amount', 'currency', 'direction', 'frequency', 'start_date', 'end_date', 'rrule', 'is_active', 'created_at'];
  var c = '2025-01-01T00:00:00Z';
  var s = '2025-01-01';
  var data = [
    ['rec_gym', 'user_1', 'acct_chase_biz', 'cat_life_gym', '', 'Gym Membership', 91.00, 'USD', 'expense', 'monthly', s, '', '', 'true', c],
    ['rec_applecare', 'user_1', 'acct_chase_biz', 'cat_sub_digital', '', 'AppleCare Plus', 99.99, 'USD', 'expense', 'annual', s, '', '', 'true', c],
    ['rec_applecare_iphone', 'user_1', 'acct_chase_biz', 'cat_sub_digital', '', 'AppleCare Plus iPhone 14', 7.99, 'USD', 'expense', 'monthly', s, '', '', 'true', c],
    ['rec_applecare_mac', 'user_1', 'acct_chase_biz', 'cat_sub_digital', '', 'AppleCare Plus Mac Mini', 34.99, 'USD', 'expense', 'annual', s, '', '', 'true', c],
    ['rec_apple_dev', 'user_1', 'acct_chase_biz', 'cat_sub_business', '', 'Apple Developer Program', 98.99, 'USD', 'expense', 'annual', s, '', '', 'true', c],
    ['rec_grindr', 'user_1', 'acct_chase_biz', 'cat_life_dating', '', 'Grindr', 22.99, 'USD', 'expense', 'monthly', s, '', '', 'true', c],
    ['rec_icloud', 'user_1', 'acct_chase_biz', 'cat_sub_digital', '', 'iCloud Plus 200GB', 2.99, 'USD', 'expense', 'monthly', s, '', '', 'true', c],
    ['rec_dropbox', 'user_1', 'acct_chase_biz', 'cat_sub_business', '', 'Dropbox Essentials', 21.76, 'USD', 'expense', 'monthly', s, '', '', 'true', c],
    ['rec_verizon', 'user_1', 'acct_chase_biz', 'cat_housing_utilities', '', 'Verizon FIOS', 99.99, 'USD', 'expense', 'monthly', s, '', '', 'true', c],
    ['rec_snapchat', 'user_1', 'acct_chase_biz', 'cat_sub_digital', '', 'Snapchat Storage Plus', 1.99, 'USD', 'expense', 'monthly', s, '', '', 'true', c],
    ['rec_cursor', 'user_1', 'acct_chase_biz', 'cat_sub_business', '', 'Cursor Base Plan', 20.00, 'USD', 'expense', 'monthly', s, '', '', 'true', c],
    ['rec_capcut', 'user_1', 'acct_chase_biz', 'cat_sub_digital', '', 'CapCut Pro', 19.99, 'USD', 'expense', 'monthly', s, '', '', 'true', c],
    ['rec_splice', 'user_1', 'acct_chase_biz', 'cat_sub_music', '', 'Splice', 21.76, 'USD', 'expense', 'monthly', s, '', '', 'true', c],
    ['rec_studio1', 'user_1', 'acct_chase_biz', 'cat_sub_music', '', 'Studio One Plus', 16.28, 'USD', 'expense', 'monthly', s, '', '', 'true', c],
    ['rec_godaddy', 'user_1', 'acct_chase_biz', 'cat_sub_business', '', 'GoDaddy', 22.19, 'USD', 'expense', 'annual', s, '', '', 'true', c],
    ['rec_adobe', 'user_1', 'acct_chase_biz', 'cat_sub_business', '', 'Adobe Creative Cloud', 14.99, 'USD', 'expense', 'monthly', s, '', '', 'true', c],
    ['rec_landr_sub', 'user_1', 'acct_chase_biz', 'cat_sub_music', '', 'Landr Subscription', 6.52, 'USD', 'expense', 'monthly', s, '', '', 'true', c],
    ['rec_github', 'user_1', 'acct_chase_biz', 'cat_sub_business', '', 'GitHub', 10.89, 'USD', 'expense', 'monthly', s, '', '', 'true', c],
    ['rec_wix', 'user_1', 'acct_chase_biz', 'cat_sub_business', '', 'Wix Premium (RBM Sounds)', 37.01, 'USD', 'expense', 'monthly', s, '', '', 'true', c],
    ['rec_distrokid', 'user_1', 'acct_chase_biz', 'cat_sub_music', '', 'DistroKid', 7.50, 'USD', 'expense', 'monthly', s, '', '', 'true', c],
    ['rec_youtube', 'user_1', 'acct_chase_biz', 'cat_entertainment', '', 'YouTube Premium', 3.84, 'USD', 'expense', 'monthly', s, '', '', 'true', c],
    ['rec_studio_rent', 'user_1', 'acct_chase_biz', 'cat_biz_studio', '', 'Music Recording Facility Rent', 750.00, 'USD', 'expense', 'monthly', s, '', '', 'true', c],
    ['rec_chatgpt', 'user_1', 'acct_chase_biz', 'cat_sub_business', '', 'ChatGPT Plus', 20.00, 'USD', 'expense', 'monthly', s, '', '', 'true', c],
    ['rec_wellbound', 'user_1', 'acct_chase_biz', 'cat_income_salary', 'inc_wellbound', 'Wellbound Salary', 2118.84, 'USD', 'income', 'semimonthly', '2025-11-19', '', '', 'true', '2025-11-19T00:00:00Z'],
    ['rec_haircut', 'user_1', 'acct_chase_biz', 'cat_personal_haircut', '', 'Haircut', 40.00, 'USD', 'expense', 'biweekly', s, '', '', 'true', c],
    ['rec_cvs', 'user_1', 'acct_chase_biz', 'cat_personal_hygiene', '', 'CVS Hygiene Products', 50.00, 'USD', 'expense', 'monthly', s, '', '', 'true', c],
    ['rec_cursor_extra', 'user_1', 'acct_chase_biz', 'cat_sub_business', '', 'Cursor Extra Usage (avg)', 200.00, 'USD', 'expense', 'monthly', s, '', '', 'true', c]
  ];
  return { headers: headers, data: data };
}

function getCreditRuleData_() {
  var headers = ['id', 'user_id', 'account_id', 'category_id', 'linked_recurring_rule_id', 'name', 'amount', 'currency', 'frequency', 'start_date', 'end_date', 'rrule', 'is_active', 'created_at'];
  var c = '2025-01-01T00:00:00Z';
  var data = [
    ['cr_amex_wifi', 'user_1', 'acct_amex', 'cat_housing_utilities', 'rec_verizon', 'Amex Wireless Credit', 10.00, 'USD', 'monthly', '2025-01-01', '', '', 'true', c],
    ['cr_hilton', 'user_1', 'acct_amex', 'cat_custom', '', 'Hilton Statement Credit', 45.00, 'USD', 'monthly', '2025-01-01', '', '', 'true', c]
  ];
  return { headers: headers, data: data };
}

function getTransactionData_() {
  var headers = ['id', 'user_id', 'account_id', 'category_id', 'income_source_id', 'recurring_rule_id', 'credit_rule_id', 'amount', 'currency', 'transaction_date', 'description', 'source_type', 'is_recurring_generated', 'created_at'];
  var txs = [];
  var txId = 1;

  // =========================================================================
  // INCOME — only verified, exact data from summary
  // =========================================================================

  // Wellbound salary — started Nov 19 2025, semi-monthly (1st and 15th)
  var salaryDates = [
    '2025-12-01', '2025-12-15',
    '2026-01-01', '2026-01-15',
    '2026-02-01', '2026-02-15'
  ];
  for (var sd = 0; sd < salaryDates.length; sd++) {
    txs.push(['tx_' + txId++, 'user_1', 'acct_chase_biz', 'cat_income_salary', 'inc_wellbound', 'rec_wellbound', '', 2118.84, 'USD', salaryDates[sd], 'Wellbound Salary', 'rule', 'true', ts_(salaryDates[sd])]);
  }

  // Landr royalties — exact USD amounts per month
  var landr = [
    ['2025-01-15', 68.80], ['2025-02-15', 126.25], ['2025-03-15', 210.15],
    ['2025-04-15', 114.60], ['2025-05-15', 146.92], ['2025-06-15', 297.17],
    ['2025-07-15', 123.94], ['2025-08-15', 89.23], ['2025-09-15', 30.93],
    ['2025-10-15', 64.87], ['2025-11-15', 217.72], ['2025-12-15', 107.38],
    ['2026-01-15', 58.64]
  ];
  for (var l = 0; l < landr.length; l++) {
    txs.push(['tx_' + txId++, 'user_1', 'acct_chase_biz', 'cat_income_music', 'inc_landr', '', '', landr[l][1], 'USD', landr[l][0], 'Landr Royalties', 'import', 'false', ts_(landr[l][0])]);
  }

  // RBM Sounds revenue — exact amounts, only months with actual payments
  var rbm = [
    ['2024-12-20', 43.99], ['2025-01-20', 19.99], ['2025-02-20', 19.99],
    ['2025-07-20', 714.70], ['2025-08-20', 319.87], ['2025-09-20', 119.94],
    ['2025-10-20', 19.99]
  ];
  for (var r = 0; r < rbm.length; r++) {
    txs.push(['tx_' + txId++, 'user_1', 'acct_chase_biz', 'cat_income_music', 'inc_rbm_sounds', '', '', rbm[r][1], 'USD', rbm[r][0], 'RBM Sounds Revenue', 'import', 'false', ts_(rbm[r][0])]);
  }

  // RBM Recording Studio — $25,000 annual average
  // Not fabricating monthly deposits; studio income arrives irregularly.
  // Recorded as a single annual reference entry.
  txs.push(['tx_' + txId++, 'user_1', 'acct_chase_biz', 'cat_income_business', 'inc_studio', '', '', 25000, 'USD', '2025-12-31', 'RBM Recording Studio Revenue (2025 annual)', 'import', 'false', ts_('2025-12-31')]);

  // =========================================================================
  // RECURRING EXPENSES — generated from rules, only real charges
  // =========================================================================

  var monthlyExp = [
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
    ['rec_cursor_extra', 'cat_sub_business', 200.00, 'Cursor Extra Usage']
  ];

  // 2025 full year + Jan/Feb 2026
  var expMonths = [];
  for (var em = 1; em <= 12; em++) expMonths.push('2025-' + pad2_(em));
  expMonths.push('2026-01', '2026-02');

  for (var emi = 0; emi < expMonths.length; emi++) {
    for (var mei = 0; mei < monthlyExp.length; mei++) {
      txs.push(['tx_' + txId++, 'user_1', 'acct_chase_biz', monthlyExp[mei][1], '', monthlyExp[mei][0], '', -monthlyExp[mei][2], 'USD', expMonths[emi] + '-01', monthlyExp[mei][3], 'rule', 'true', ts_(expMonths[emi] + '-01')]);
    }
  }

  // Biweekly haircuts — 2025 + Jan/Feb 2026
  for (var hm = 1; hm <= 14; hm++) {
    var hMonth = hm <= 12 ? hm : hm - 12;
    var hYear = hm <= 12 ? 2025 : 2026;
    var hMo = hYear + '-' + pad2_(hMonth);
    txs.push(['tx_' + txId++, 'user_1', 'acct_chase_biz', 'cat_personal_haircut', '', 'rec_haircut', '', -40.00, 'USD', hMo + '-01', 'Haircut', 'rule', 'true', ts_(hMo + '-01')]);
    txs.push(['tx_' + txId++, 'user_1', 'acct_chase_biz', 'cat_personal_haircut', '', 'rec_haircut', '', -40.00, 'USD', hMo + '-15', 'Haircut', 'rule', 'true', ts_(hMo + '-15')]);
  }

  // Annual charges — exact amounts on approximate charge dates
  txs.push(['tx_' + txId++, 'user_1', 'acct_chase_biz', 'cat_sub_digital', '', 'rec_applecare', '', -99.99, 'USD', '2025-03-15', 'AppleCare Plus (annual)', 'rule', 'true', ts_('2025-03-15')]);
  txs.push(['tx_' + txId++, 'user_1', 'acct_chase_biz', 'cat_sub_digital', '', 'rec_applecare_mac', '', -34.99, 'USD', '2025-06-10', 'AppleCare Plus Mac Mini (annual)', 'rule', 'true', ts_('2025-06-10')]);
  txs.push(['tx_' + txId++, 'user_1', 'acct_chase_biz', 'cat_sub_business', '', 'rec_apple_dev', '', -98.99, 'USD', '2025-09-01', 'Apple Developer Program (annual)', 'rule', 'true', ts_('2025-09-01')]);
  txs.push(['tx_' + txId++, 'user_1', 'acct_chase_biz', 'cat_sub_business', '', 'rec_godaddy', '', -22.19, 'USD', '2025-04-20', 'GoDaddy (annual)', 'rule', 'true', ts_('2025-04-20')]);

  // =========================================================================
  // CREDITS — Amex subsidies
  // =========================================================================

  var creditMonths = [];
  for (var cm = 1; cm <= 12; cm++) creditMonths.push('2025-' + pad2_(cm));
  creditMonths.push('2026-01', '2026-02');

  for (var ci = 0; ci < creditMonths.length; ci++) {
    txs.push(['tx_' + txId++, 'user_1', 'acct_amex', 'cat_housing_utilities', '', '', 'cr_amex_wifi', 10.00, 'USD', creditMonths[ci] + '-01', 'Amex Wireless Credit', 'rule', 'true', ts_(creditMonths[ci] + '-01')]);
    txs.push(['tx_' + txId++, 'user_1', 'acct_amex', 'cat_custom', '', '', 'cr_hilton', 45.00, 'USD', creditMonths[ci] + '-01', 'Hilton Statement Credit', 'rule', 'true', ts_(creditMonths[ci] + '-01')]);
  }

  // No fabricated daily/variable transactions. Those come from /input going forward.

  Logger.log('Generated ' + txs.length + ' transactions');
  return { headers: headers, data: txs };
}

function getPayrollData_() {
  var headers = ['id', 'transaction_id', 'gross_amount', 'federal_income_tax', 'social_security', 'medicare', 'nys_income_tax', 'ny_paid_leave', 'ny_disability', 'nyc_income_tax', 'other_deductions', 'total_taxes'];
  var data = [
    ['pb_1', 'tx_1', 2884.60, 295.00, 178.84, 41.83, 134.07, 12.47, 1.20, 102.35, 0, 765.76],
    ['pb_2', 'tx_2', 2884.60, 295.00, 178.84, 41.83, 134.07, 12.47, 1.20, 102.35, 0, 765.76]
  ];
  return { headers: headers, data: data };
}

function getTagData_() {
  var headers = ['id', 'user_id', 'name', 'created_at'];
  var c = '2025-01-01T00:00:00Z';
  var data = [
    ['tag_essential', 'user_1', 'essential', c],
    ['tag_nonessential', 'user_1', 'non-essential', c],
    ['tag_recurring', 'user_1', 'recurring', c],
    ['tag_business', 'user_1', 'business', c],
    ['tag_personal', 'user_1', 'personal', c],
    ['tag_music', 'user_1', 'music', c],
    ['tag_software', 'user_1', 'software-dev', c],
    ['tag_revenue', 'user_1', 'revenue-stream', c],
    ['tag_food', 'user_1', 'food', c],
    ['tag_digital', 'user_1', 'digital', c],
    ['tag_custom', 'user_1', 'custom', c]
  ];
  return { headers: headers, data: data };
}

function getTransactionTagData_() {
  var headers = ['transaction_id', 'tag_id'];
  var data = [
    ['tx_1', 'tag_essential'],
    ['tx_1', 'tag_recurring']
  ];
  return { headers: headers, data: data };
}

function getBudgetPlanData_() {
  var headers = ['id', 'user_id', 'name', 'year', 'month', 'currency', 'created_at'];
  var data = [
    ['bp_2026_01', 'user_1', 'Monthly Budget', 2026, 1, 'USD', '2026-01-01T00:00:00Z'],
    ['bp_2026_02', 'user_1', 'Monthly Budget', 2026, 2, 'USD', '2026-02-01T00:00:00Z']
  ];
  return { headers: headers, data: data };
}

function getBudgetItemData_() {
  var headers = ['id', 'budget_plan_id', 'category_id', 'planned_amount', 'notes'];
  var items = [
    ['cat_housing_rent', 2000.00, 'Facility and living combined'],
    ['cat_housing_utilities', 99.99, 'Wifi (Verizon FIOS)'],
    ['cat_transport', 150.00, 'MTA, gas, parking'],
    ['cat_personal', 150.00, 'Haircuts and hygiene'],
    ['cat_food_groceries', 500.00, 'Groceries and basics'],
    ['cat_housing_utilities_general', 200.00, 'Utilities (electric, water, etc.)'],
    ['cat_savings', 400.00, 'Savings target'],
    ['cat_food_restaurant', 300.00, 'Restaurants and eating out']
  ];
  var data = [];
  var biId = 1;
  var plans = ['bp_2026_01', 'bp_2026_02'];
  for (var p = 0; p < plans.length; p++) {
    for (var it = 0; it < items.length; it++) {
      data.push(['bi_' + biId++, plans[p], items[it][0], items[it][1], items[it][2]]);
    }
  }
  return { headers: headers, data: data };
}

function getCreditScoreData_() {
  var headers = ['id', 'user_id', 'score', 'date_recorded', 'created_at'];
  var data = [
    ['cs_1', 'user_1', 766, '2025-12-01', '2025-12-01T00:00:00Z'],
    ['cs_2', 'user_1', 766, '2026-01-01', '2026-01-01T00:00:00Z'],
    ['cs_3', 'user_1', 766, '2026-02-01', '2026-02-01T00:00:00Z']
  ];
  return { headers: headers, data: data };
}

function getEnvelopeData_() {
  var headers = ['id', 'user_id', 'name', 'goal', 'color', 'is_active', 'created_at'];
  var data = [
    ['env_savings', 'user_1', 'Savings', '', '#957FFF', 'true', '2025-01-01T00:00:00Z'],
    ['env_crisis', 'user_1', 'Crisis Fund', '10000', '#F87171', 'true', '2025-01-01T00:00:00Z']
  ];
  return { headers: headers, data: data };
}

function getEnvelopeContributionData_() {
  var headers = ['id', 'envelope_id', 'user_id', 'amount', 'type', 'note', 'date', 'created_at'];
  var data = [
    ['ec_1', 'env_savings', 'user_1', 200, 'deposit', 'Initial deposit', '2025-12-01', '2025-12-01T00:00:00Z'],
    ['ec_2', 'env_crisis', 'user_1', 500, 'deposit', 'Starting crisis fund', '2025-12-01', '2025-12-01T00:00:00Z']
  ];
  return { headers: headers, data: data };
}

// ---------------------------------------------------------------------------
// MAIN SEED FUNCTION — run this from the Apps Script editor
// ---------------------------------------------------------------------------

function seedAll() {
  Logger.log('=== SEED START ===');

  var allSheets = [
    { title: 'User', fn: getUserData_ },
    { title: 'Account', fn: getAccountData_ },
    { title: 'Category', fn: getCategoryData_ },
    { title: 'IncomeSource', fn: getIncomeSourceData_ },
    { title: 'RecurringRule', fn: getRecurringRuleData_ },
    { title: 'CreditRule', fn: getCreditRuleData_ },
    { title: 'Transaction', fn: getTransactionData_ },
    { title: 'PayrollBreakdown', fn: getPayrollData_ },
    { title: 'Tag', fn: getTagData_ },
    { title: 'TransactionTag', fn: getTransactionTagData_ },
    { title: 'BudgetPlan', fn: getBudgetPlanData_ },
    { title: 'BudgetItem', fn: getBudgetItemData_ },
    { title: 'CreditScore', fn: getCreditScoreData_ },
    { title: 'Envelope', fn: getEnvelopeData_ },
    { title: 'EnvelopeContribution', fn: getEnvelopeContributionData_ }
  ];

  for (var i = 0; i < allSheets.length; i++) {
    var info = allSheets[i].fn();
    clearAndPopulate_(allSheets[i].title, info.headers, info.data);
  }

  // Remove default Sheet1 if it exists and we have other sheets
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = ss.getSheets();
  if (sheets.length > 1) {
    for (var s = 0; s < sheets.length; s++) {
      if (sheets[s].getName() === 'Sheet1') {
        ss.deleteSheet(sheets[s]);
        Logger.log('Removed default Sheet1');
        break;
      }
    }
  }

  Logger.log('=== SEED COMPLETE ===');
  SpreadsheetApp.getUi().alert('Seed complete! All 12 tables created and populated.');
}
