import { colors } from '../../styles/colors';

const keyframes = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 1; }
  }
  @keyframes slideRight {
    from { width: 0%; }
  }
  @keyframes barPulse {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
  }
  @keyframes coinFloat {
    0% { transform: translateY(0) rotateY(0deg); }
    25% { transform: translateY(-6px) rotateY(90deg); }
    50% { transform: translateY(0) rotateY(180deg); }
    75% { transform: translateY(-3px) rotateY(270deg); }
    100% { transform: translateY(0) rotateY(360deg); }
  }
`;

export default function InitialLoader({ step, progress }) {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: colors.bg.primary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
    }}>
      <style>{keyframes}</style>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '32px',
        maxWidth: '320px',
        width: '100%',
        padding: '0 24px',
      }}>
        {/* Coin animation */}
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${colors.bg.surface} 0%, ${colors.bg.elevated} 100%)`,
          border: `2px solid ${colors.border.secondary}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'coinFloat 2s ease-in-out infinite',
          perspective: '200px',
        }}>
          <span style={{
            fontSize: '22px',
            fontWeight: 700,
            color: colors.accent.purple,
            letterSpacing: '-0.04em',
          }}>
            $
          </span>
        </div>

        {/* Title */}
        <div style={{ textAlign: 'center' }}>
          <h1 style={{
            fontSize: '18px',
            fontWeight: 600,
            color: colors.text.primary,
            letterSpacing: '-0.03em',
            marginBottom: '6px',
          }}>
            Budget Tracker
          </h1>
          <p style={{
            fontSize: '12px',
            color: colors.text.muted,
          }}>
            Preparing your financial data
          </p>
        </div>

        {/* Progress bar */}
        <div style={{ width: '100%' }}>
          <div style={{
            width: '100%',
            height: '3px',
            borderRadius: '2px',
            background: colors.border.primary,
            overflow: 'hidden',
            marginBottom: '12px',
          }}>
            <div style={{
              width: `${progress * 100}%`,
              height: '100%',
              borderRadius: '2px',
              background: colors.accent.purple,
              transition: 'width 0.4s ease',
              animation: 'barPulse 1.5s ease-in-out infinite',
            }} />
          </div>

          {/* Step label */}
          <p
            key={step}
            style={{
              fontSize: '12px',
              color: colors.text.tertiary,
              textAlign: 'center',
              animation: 'fadeInUp 0.3s ease',
              letterSpacing: '-0.01em',
            }}
          >
            {step}
          </p>
        </div>

        {/* Decorative dots */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                background: colors.text.muted,
                animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
