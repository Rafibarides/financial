import { colors } from '../../styles/colors';

export default function Card({ children, style, padding = '20px', onClick, hoverable = false }) {
  const baseStyle = {
    background: colors.bg.elevated,
    borderRadius: '12px',
    padding,
    transition: 'background 0.2s ease',
    ...(hoverable && { cursor: 'pointer' }),
    ...style,
  };

  return (
    <div
      style={baseStyle}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (hoverable) e.currentTarget.style.background = colors.bg.surface;
      }}
      onMouseLeave={(e) => {
        if (hoverable) e.currentTarget.style.background = colors.bg.elevated;
      }}
    >
      {children}
    </div>
  );
}
