import { useState } from 'react';
import TextInput from '../common/TextInput';
import Select from '../common/Select';
import DatePicker from '../common/DatePicker';
import Toggle from '../common/Toggle';
import Button from '../common/Button';
import Card from '../common/Card';
import { colors } from '../../styles/colors';
import { FREQUENCIES } from '../../utils/constants';

const defaultForm = {
  description: '',
  amount: '',
  category_id: '',
  account_id: '',
  transaction_date: new Date().toISOString().split('T')[0],
  is_recurring: false,
  frequency: 'monthly',
  tags: '',
  notes: '',
};

export default function TransactionForm({ categories = [], accounts = [], onSubmit }) {
  const [form, setForm] = useState(defaultForm);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.description || !form.amount) return;
    onSubmit({
      ...form,
      amount: -Math.abs(parseFloat(form.amount)),
    });
    setForm(defaultForm);
  };

  const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }));
  const accountOptions = accounts.map((a) => ({ value: a.id, label: a.name }));

  return (
    <Card>
      <h3 style={{
        fontSize: '13px',
        fontWeight: 500,
        color: colors.text.secondary,
        marginBottom: '20px',
        letterSpacing: '-0.01em',
      }}>
        Log Transaction
      </h3>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <TextInput
              label="Description"
              value={form.description}
              onChange={(v) => update('description', v)}
              placeholder="What was the purchase?"
            />
          </div>

          <TextInput
            label="Amount"
            type="number"
            value={form.amount}
            onChange={(v) => update('amount', v)}
            placeholder="0.00"
            prefix="$"
          />

          <DatePicker
            label="Date"
            value={form.transaction_date}
            onChange={(v) => update('transaction_date', v)}
          />

          <Select
            label="Category"
            value={form.category_id}
            onChange={(v) => update('category_id', v)}
            options={categoryOptions}
            placeholder="Select category"
          />

          <Select
            label="Account"
            value={form.account_id}
            onChange={(v) => update('account_id', v)}
            options={accountOptions}
            placeholder="Select account"
          />

          <div style={{ gridColumn: '1 / -1' }}>
            <TextInput
              label="Tags (comma separated)"
              value={form.tags}
              onChange={(v) => update('tags', v)}
              placeholder="food, personal, one-time"
            />
          </div>

          <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Toggle
              label="Recurring"
              value={form.is_recurring}
              onChange={(v) => update('is_recurring', v)}
            />
            {form.is_recurring && (
              <div style={{ flex: 1 }}>
                <Select
                  label="Frequency"
                  value={form.frequency}
                  onChange={(v) => update('frequency', v)}
                  options={FREQUENCIES.map((f) => ({ value: f, label: f.charAt(0).toUpperCase() + f.slice(1) }))}
                />
              </div>
            )}
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <TextInput
              label="Notes (optional)"
              value={form.notes}
              onChange={(v) => update('notes', v)}
              placeholder="Any additional details"
            />
          </div>

          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
            <Button variant="secondary" onClick={() => setForm(defaultForm)}>
              Clear
            </Button>
            <Button type="submit" disabled={!form.description || !form.amount}>
              Add Transaction
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
}
