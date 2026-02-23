import { colors } from '../../styles/colors';

const variants = {
  default: { background: colors.transparent.white10, color: colors.text.secondary },
  positive: { background: 'rgba(52, 211, 153, 0.12)', color: colors.status.positive },
  negative: { background: 'rgba(248, 113, 113, 0.12)', color: colors.status.negative },
  warning: { background: 'rgba(251, 191, 36, 0.12)', color: colors.status.warning },
  purple: { background: 'rgba(149, 127, 255, 0.12)', color: colors.accent.purple },
  blue: { background: 'rgba(71, 182, 255, 0.12)', color: colors.accent.blue },
  cyan: { background: 'rgba(86, 255, 255, 0.12)', color: colors.accent.cyan },
};

export default function Badge({ children, variant = 'default', style }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 8px',
        borderRadius: '6px',
        fontSize: '11px',
        fontWeight: 500,
        letterSpacing: '0.01em',
        ...variants[variant],
        ...style,
      }}
    >
      {children}
    </span>
  );
}
