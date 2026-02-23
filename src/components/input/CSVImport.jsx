import { useState, useCallback } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { colors } from '../../styles/colors';
import { formatCurrency } from '../../utils/formatters';

const CATEGORY_KEYWORDS = {
  cat_food_daily: ['dunkin', 'starbucks', 'coffee', 'deli', 'bodega', 'bagel', 'donut', 'bakery', 'pastry', 'mcdonald', 'wendy', 'burger king', 'chick-fil', 'subway food', 'panera'],
  cat_food_restaurant: ['restaurant', 'grubhub', 'doordash', 'uber eats', 'seamless', 'caviar', 'postmates', 'aksaray', 'poke', 'chikurin', 'sushi', 'pizza', 'thai', 'chinese', 'mexican', 'indian', 'italian', 'diner'],
  cat_food_groceries: ['grocery', 'whole foods', 'trader joe', 'target', 'walmart', 'costco', 'aldi', 'shoprite', 'food bazaar', 'key food', 'stop & shop', 'c-town', 'fresh direct', 'instacart'],
  cat_transport_transit: ['mta', 'metro', 'subway', 'metrocard', 'omny', 'transit', 'bus', 'path', 'nj transit'],
  cat_transport_gas: ['gas', 'shell', 'bp ', 'exxon', 'mobil', 'chevron', 'sunoco', 'fuel', 'speedway', 'wawa gas'],
  cat_transport_parking: ['parking', 'park meter', 'spothero', 'icon parking'],
  cat_sub_digital: ['apple.com', 'icloud', 'spotify', 'netflix', 'hulu', 'disney+', 'hbo', 'paramount', 'peacock', 'snapchat', 'capcut'],
  cat_sub_business: ['github', 'cursor', 'adobe', 'dropbox', 'godaddy', 'wix', 'chatgpt', 'openai', 'notion', 'figma', 'vercel', 'aws', 'google cloud', 'heroku'],
  cat_sub_music: ['splice', 'distrokid', 'landr', 'studio one', 'izotope', 'waves', 'plugin'],
  cat_entertainment: ['youtube', 'twitch', 'gaming', 'playstation', 'xbox', 'steam', 'nintendo', 'amc', 'regal', 'cinema', 'movie', 'concert', 'ticketmaster'],
  cat_life_gym: ['gym', 'equinox', 'planet fitness', 'blink', 'crunch', 'ymca', 'fitness'],
  cat_personal_haircut: ['barber', 'haircut', 'salon', 'hair'],
  cat_personal_hygiene: ['cvs', 'walgreens', 'rite aid', 'pharmacy', 'duane reade'],
  cat_housing_utilities: ['verizon', 'att', 't-mobile', 'sprint', 'comcast', 'spectrum', 'con ed', 'coned', 'national grid', 'electric', 'water', 'utility'],
  cat_biz_advertising: ['facebook ad', 'meta ad', 'google ad', 'instagram ad', 'tiktok ad', 'submit hub'],
  cat_life_dating: ['grindr', 'hinge', 'bumble', 'tinder'],
  cat_custom: [],
};

function categorize(description) {
  const lower = (description || '').toLowerCase();
  for (const [catId, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) return catId;
    }
  }
  return 'cat_custom';
}

function parseCSV(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];

  const headerLine = lines[0].toLowerCase();
  const headers = headerLine.split(',').map((h) => h.trim().replace(/"/g, ''));

  const dateIdx = headers.findIndex((h) => h.includes('date') || h.includes('posted') || h.includes('transaction'));
  const descIdx = headers.findIndex((h) => h.includes('description') || h.includes('merchant') || h.includes('memo') || h.includes('name'));
  const amountIdx = headers.findIndex((h) => h === 'amount' || h.includes('amount'));
  const debitIdx = headers.findIndex((h) => h.includes('debit'));
  const creditIdx = headers.findIndex((h) => h.includes('credit'));

  return lines.slice(1).map((line) => {
    const cols = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',');
    const clean = cols.map((c) => c.replace(/^"|"$/g, '').trim());

    const date = clean[dateIdx] || '';
    const desc = clean[descIdx] || '';
    let amount = 0;
    if (amountIdx >= 0) {
      amount = parseFloat(clean[amountIdx]?.replace(/[,$]/g, '')) || 0;
    } else if (debitIdx >= 0) {
      amount = -(parseFloat(clean[debitIdx]?.replace(/[,$]/g, '')) || 0);
      if (creditIdx >= 0 && clean[creditIdx]) {
        amount = parseFloat(clean[creditIdx]?.replace(/[,$]/g, '')) || 0;
      }
    }

    return {
      date: date ? new Date(date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      description: desc,
      amount,
      category_id: categorize(desc),
    };
  }).filter((r) => r.description && r.amount !== 0);
}

export default function CSVImport({ categories = {}, onImport }) {
  const [rows, setRows] = useState([]);
  const [importing, setImporting] = useState(false);
  const [fileName, setFileName] = useState('');

  const handleFile = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const parsed = parseCSV(ev.target.result);
      setRows(parsed);
    };
    reader.readAsText(file);
  }, []);

  const updateCategory = useCallback((idx, catId) => {
    setRows((prev) => prev.map((r, i) => i === idx ? { ...r, category_id: catId } : r));
  }, []);

  const handleImport = useCallback(async () => {
    if (!rows.length || !onImport) return;
    setImporting(true);
    try {
      await onImport(rows);
      setRows([]);
      setFileName('');
    } finally {
      setImporting(false);
    }
  }, [rows, onImport]);

  const catOptions = Object.entries(categories)
    .filter(([_, c]) => c.type === 'expense')
    .map(([id, c]) => ({ value: id, label: c.name }));

  const total = rows.reduce((s, r) => s + Math.abs(r.amount), 0);

  return (
    <Card>
      <h3 style={{ fontSize: '13px', fontWeight: 500, color: colors.text.secondary, marginBottom: '12px' }}>
        Import Bank Statement
      </h3>

      {rows.length === 0 ? (
        <label style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px',
          borderRadius: '8px',
          border: `1px dashed ${colors.border.secondary}`,
          cursor: 'pointer',
          transition: 'border-color 0.2s ease',
        }}>
          <input type="file" accept=".csv" onChange={handleFile} style={{ display: 'none' }} />
          <p style={{ fontSize: '13px', color: colors.text.secondary, marginBottom: '4px' }}>
            Drop a CSV or click to upload
          </p>
          <p style={{ fontSize: '11px', color: colors.text.muted }}>
            Supports Chase, Amex, and standard CSV formats
          </p>
        </label>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <span style={{ fontSize: '12px', color: colors.text.secondary }}>{fileName}</span>
              <span style={{ fontSize: '11px', color: colors.text.muted, marginLeft: '8px' }}>
                {rows.length} transactions / {formatCurrency(total)}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button variant="ghost" size="sm" onClick={() => { setRows([]); setFileName(''); }}>Clear</Button>
              <Button size="sm" onClick={handleImport} disabled={importing}>
                {importing ? 'Importing...' : 'Import All'}
              </Button>
            </div>
          </div>

          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {rows.map((row, i) => {
              const cat = categories[row.category_id];
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: `1px solid ${colors.border.primary}`,
                    fontSize: '12px',
                    gap: '8px',
                  }}
                >
                  <span style={{ color: colors.text.muted, minWidth: '70px', fontVariantNumeric: 'tabular-nums' }}>{row.date}</span>
                  <span style={{ flex: 1, color: colors.text.primary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {row.description}
                  </span>
                  <select
                    value={row.category_id}
                    onChange={(e) => updateCategory(i, e.target.value)}
                    style={{
                      background: colors.bg.surface,
                      border: `1px solid ${colors.border.primary}`,
                      borderRadius: '4px',
                      color: colors.text.secondary,
                      fontSize: '11px',
                      padding: '3px 6px',
                      minWidth: '120px',
                    }}
                  >
                    {catOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <span style={{
                    fontWeight: 500,
                    fontVariantNumeric: 'tabular-nums',
                    color: row.amount > 0 ? colors.status.positive : colors.text.primary,
                    minWidth: '70px',
                    textAlign: 'right',
                  }}>
                    {row.amount > 0 ? '+' : ''}{formatCurrency(row.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}
