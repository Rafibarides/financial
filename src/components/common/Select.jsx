import { colors } from '../../styles/colors';

export default function Select({ value, onChange, options, placeholder, label, style }) {
  const selectStyle = {
    background: colors.bg.surface,
    border: `1px solid ${colors.border.primary}`,
    borderRadius: '8px',
    padding: '8px 12px',
    color: colors.text.primary,
    fontSize: '13px',
    outline: 'none',
    width: '100%',
    appearance: 'none',
    cursor: 'pointer',
    transition: 'border-color 0.2s ease',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B6B6B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    paddingRight: '32px',
    ...style,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && (
        <label style={{ fontSize: '12px', color: colors.text.tertiary, letterSpacing: '0.02em' }}>
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={selectStyle}
        onFocus={(e) => { e.target.style.borderColor = colors.border.focus; }}
        onBlur={(e) => { e.target.style.borderColor = colors.border.primary; }}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => {
          const val = typeof opt === 'object' ? opt.value : opt;
          const lbl = typeof opt === 'object' ? opt.label : opt;
          return <option key={val} value={val}>{lbl}</option>;
        })}
      </select>
    </div>
  );
}
