import { colors } from '../../styles/colors';

export default function DatePicker({ value, onChange, label, style }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && (
        <label style={{ fontSize: '12px', color: colors.text.tertiary, letterSpacing: '0.02em' }}>
          {label}
        </label>
      )}
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          background: colors.bg.surface,
          border: `1px solid ${colors.border.primary}`,
          borderRadius: '8px',
          padding: '8px 12px',
          color: colors.text.primary,
          fontSize: '13px',
          outline: 'none',
          width: '100%',
          transition: 'border-color 0.2s ease',
          colorScheme: 'dark',
          ...style,
        }}
        onFocus={(e) => { e.target.style.borderColor = colors.border.focus; }}
        onBlur={(e) => { e.target.style.borderColor = colors.border.primary; }}
      />
    </div>
  );
}
