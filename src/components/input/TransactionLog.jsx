import Table from '../common/Table';
import Badge from '../common/Badge';
import { colors } from '../../styles/colors';
import { formatCurrency, formatDateShort } from '../../utils/formatters';

export default function TransactionLog({ transactions = [], categories = {}, onSort, sortKey, sortDir }) {
  const columns = [
    {
      key: 'transaction_date',
      label: 'Date',
      width: '100px',
      render: (val) => formatDateShort(val),
    },
    {
      key: 'description',
      label: 'Description',
    },
    {
      key: 'category_id',
      label: 'Category',
      render: (val) => {
        const cat = categories[val];
        return cat ? <Badge>{cat.name || cat}</Badge> : <span style={{ color: colors.text.muted }}>--</span>;
      },
    },
    {
      key: 'amount',
      label: 'Amount',
      align: 'right',
      render: (val) => {
        const num = parseFloat(val) || 0;
        return (
          <span style={{
            color: num > 0 ? colors.status.positive : colors.text.primary,
            fontWeight: 500,
            fontVariantNumeric: 'tabular-nums',
          }}>
            {num > 0 ? '+' : ''}{formatCurrency(num)}
          </span>
        );
      },
    },
    {
      key: 'source_type',
      label: 'Source',
      width: '80px',
      render: (val) => (
        <Badge variant={val === 'manual' ? 'purple' : val === 'rule' ? 'blue' : 'default'}>
          {val || 'manual'}
        </Badge>
      ),
    },
  ];

  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px',
      }}>
        <h3 style={{
          fontSize: '13px',
          fontWeight: 500,
          color: colors.text.secondary,
          letterSpacing: '-0.01em',
        }}>
          Transaction Log
        </h3>
        <span style={{ fontSize: '11px', color: colors.text.muted }}>
          {transactions.length} entries
        </span>
      </div>
      <div style={{
        background: colors.bg.elevated,
        border: `1px solid ${colors.border.primary}`,
        borderRadius: '12px',
        overflow: 'hidden',
      }}>
        <Table
          columns={columns}
          data={transactions}
          onSort={onSort}
          sortKey={sortKey}
          sortDir={sortDir}
        />
      </div>
    </div>
  );
}
