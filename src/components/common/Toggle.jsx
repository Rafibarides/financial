import { colors } from '../../styles/colors';

export default function Toggle({ value, onChange, label }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && (
        <label style={{ fontSize: '12px', color: colors.text.tertiary, letterSpacing: '0.02em' }}>
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => onChange(!value)}
        style={{
          width: '40px',
          height: '22px',
          borderRadius: '11px',
          border: 'none',
          background: value ? colors.accent.purple : colors.bg.hover,
          cursor: 'pointer',
          position: 'relative',
          transition: 'background 0.2s ease',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            background: colors.text.primary,
            position: 'absolute',
            top: '3px',
            left: value ? '21px' : '3px',
            transition: 'left 0.2s ease',
          }}
        />
      </button>
    </div>
  );
}
