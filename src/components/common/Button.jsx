import { colors } from '../../styles/colors';

const variants = {
  primary: {
    background: colors.text.primary,
    color: colors.text.inverse,
    border: 'none',
  },
  secondary: {
    background: 'transparent',
    color: colors.text.primary,
    border: `1px solid ${colors.border.secondary}`,
  },
  ghost: {
    background: 'transparent',
    color: colors.text.secondary,
    border: 'none',
  },
  accent: {
    background: colors.accent.purple,
    color: colors.text.primary,
    border: 'none',
  },
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  style,
  disabled = false,
  onClick,
  type = 'button',
  fullWidth = false,
}) {
  const sizes = {
    sm: { padding: '6px 12px', fontSize: '12px' },
    md: { padding: '8px 16px', fontSize: '13px' },
    lg: { padding: '12px 24px', fontSize: '14px' },
  };

  const baseStyle = {
    ...variants[variant],
    ...sizes[size],
    borderRadius: '8px',
    fontWeight: 500,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.4 : 1,
    transition: 'opacity 0.15s ease, transform 0.1s ease',
    outline: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    width: fullWidth ? '100%' : 'auto',
    letterSpacing: '-0.01em',
    ...style,
  };

  return (
    <button
      type={type}
      style={baseStyle}
      disabled={disabled}
      onClick={onClick}
      onMouseDown={(e) => {
        if (!disabled) e.currentTarget.style.transform = 'scale(0.97)';
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      {children}
    </button>
  );
}
