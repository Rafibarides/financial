import { useState, useRef, useEffect, useCallback } from 'react';
import { colors } from '../../styles/colors';

const PIN = '3295';
const STORAGE_KEY = 'budget_unlocked';

export default function PinGate({ children }) {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(STORAGE_KEY) === '1');
  const [digits, setDigits] = useState(['', '', '', '']);
  const [error, setError] = useState(false);
  const refs = [useRef(), useRef(), useRef(), useRef()];

  useEffect(() => {
    if (!unlocked && refs[0].current) refs[0].current.focus();
  }, [unlocked]);

  const handleChange = useCallback((index, value) => {
    if (!/^\d?$/.test(value)) return;
    setError(false);
    const next = [...digits];
    next[index] = value;
    setDigits(next);

    if (value && index < 3) {
      refs[index + 1].current?.focus();
    }

    if (value && index === 3) {
      const code = next.join('');
      if (code === PIN) {
        sessionStorage.setItem(STORAGE_KEY, '1');
        setUnlocked(true);
      } else {
        setError(true);
        setTimeout(() => {
          setDigits(['', '', '', '']);
          refs[0].current?.focus();
        }, 500);
      }
    }
  }, [digits, refs]);

  const handleKeyDown = useCallback((index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      refs[index - 1].current?.focus();
    }
  }, [digits, refs]);

  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim().slice(0, 4);
    if (!/^\d+$/.test(pasted)) return;
    const next = ['', '', '', ''];
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setDigits(next);
    if (pasted.length === 4) {
      if (pasted === PIN) {
        sessionStorage.setItem(STORAGE_KEY, '1');
        setUnlocked(true);
      } else {
        setError(true);
        setTimeout(() => {
          setDigits(['', '', '', '']);
          refs[0].current?.focus();
        }, 500);
      }
    } else {
      refs[Math.min(pasted.length, 3)].current?.focus();
    }
  }, [refs]);

  if (unlocked) return children;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: colors.bg.primary,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: '32px',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '50%',
          background: colors.bg.surface,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={colors.text.tertiary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h1 style={{
          fontSize: '18px', fontWeight: 600,
          color: colors.text.primary, letterSpacing: '-0.03em',
        }}>
          Enter PIN
        </h1>
        <p style={{ fontSize: '13px', color: colors.text.muted, marginTop: '6px' }}>
          4-digit access code required
        </p>
      </div>

      <div style={{ display: 'flex', gap: '12px' }} onPaste={handlePaste}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={refs[i]}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            style={{
              width: '56px', height: '64px',
              background: colors.bg.surface,
              border: `2px solid ${error ? colors.status.negative : d ? colors.accent.purple : colors.border.primary}`,
              borderRadius: '12px',
              color: colors.text.primary,
              fontSize: '24px', fontWeight: 600,
              textAlign: 'center',
              outline: 'none',
              caretColor: colors.accent.purple,
              transition: 'border-color 0.2s, transform 0.15s',
              transform: error ? 'translateX(0)' : undefined,
              animation: error ? 'pinShake 0.4s ease' : undefined,
            }}
            onFocus={(e) => {
              if (!error) e.target.style.borderColor = colors.accent.purple;
            }}
            onBlur={(e) => {
              if (!error) e.target.style.borderColor = d ? colors.accent.purple : colors.border.primary;
            }}
          />
        ))}
      </div>

      {error && (
        <p style={{ fontSize: '13px', color: colors.status.negative, marginTop: '-16px' }}>
          Incorrect PIN
        </p>
      )}

      <style>{`
        @keyframes pinShake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-8px); }
          40%, 80% { transform: translateX(8px); }
        }
      `}</style>
    </div>
  );
}
