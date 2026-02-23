import { colors } from '../../styles/colors';

export default function TextInput({
  value,
  onChange,
  placeholder,
  label,
  type = 'text',
  style,
  prefix,
  disabled = false,
}) {
  const inputStyle = {
    background: colors.bg.surface,
    border: `1px solid ${colors.border.primary}`,
    borderRadius: '8px',
    padding: '8px 12px',
    color: colors.text.primary,
    fontSize: '13px',
    outline: 'none',
    width: '100%',
    transition: 'border-color 0.2s ease',
    ...(prefix && { paddingLeft: '28px' }),
    ...(disabled && { opacity: 0.4, cursor: 'not-allowed' }),
    ...style,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && (
        <label style={{ fontSize: '12px', color: colors.text.tertiary, letterSpacing: '0.02em' }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {prefix && (
          <span style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: colors.text.tertiary,
            fontSize: '13px',
            pointerEvents: 'none',
          }}>
            {prefix}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          style={inputStyle}
          onFocus={(e) => { e.target.style.borderColor = colors.border.focus; }}
          onBlur={(e) => { e.target.style.borderColor = colors.border.primary; }}
        />
      </div>
    </div>
  );
}
