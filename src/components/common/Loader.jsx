import { colors } from '../../styles/colors';

export default function Loader({ size = 24 }) {
  const keyframes = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
      <style>{keyframes}</style>
      <div
        style={{
          width: size,
          height: size,
          border: `2px solid ${colors.border.primary}`,
          borderTopColor: colors.accent.purple,
          borderRadius: '50%',
          animation: 'spin 0.6s linear infinite',
        }}
      />
    </div>
  );
}
