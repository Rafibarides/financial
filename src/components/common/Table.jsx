import { colors } from '../../styles/colors';

export default function Table({ columns, data, onSort, sortKey, sortDir, onRowClick }) {
  const thStyle = {
    padding: '10px 14px',
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: 500,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    borderBottom: `1px solid ${colors.border.primary}`,
    whiteSpace: 'nowrap',
    cursor: onSort ? 'pointer' : 'default',
    userSelect: 'none',
  };

  const tdStyle = {
    padding: '10px 14px',
    fontSize: '13px',
    color: colors.text.primary,
    borderBottom: `1px solid ${colors.border.primary}`,
    whiteSpace: 'nowrap',
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ ...thStyle, ...(col.align && { textAlign: col.align }), ...(col.width && { width: col.width }) }}
                onClick={() => onSort && col.sortable !== false && onSort(col.key)}
              >
                {col.label}
                {sortKey === col.key && (
                  <span style={{ marginLeft: '4px', opacity: 0.5 }}>
                    {sortDir === 'asc' ? '\u2191' : '\u2193'}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ ...tdStyle, textAlign: 'center', color: colors.text.muted, padding: '40px 14px' }}>
                No data
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={row.id || i}
                onClick={() => onRowClick && onRowClick(row)}
                style={{
                  cursor: onRowClick ? 'pointer' : 'default',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = colors.bg.hover; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                {columns.map((col) => (
                  <td key={col.key} style={{ ...tdStyle, ...(col.align && { textAlign: col.align }) }}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
