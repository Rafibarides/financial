import { useState, useMemo, useCallback } from 'react';
import { useMultipleSheets } from '../hooks/useSheetData';
import { SHEET_NAMES } from '../utils/constants';
import { colors } from '../styles/colors';
import { formatCurrency, toNumber, formatDate } from '../utils/formatters';
import Loader from '../components/common/Loader';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import TextInput from '../components/common/TextInput';
import { appendRow } from '../services/sheets';
import useIsMobile from '../hooks/useIsMobile';

const sheets = [SHEET_NAMES.ENVELOPE, SHEET_NAMES.ENVELOPE_CONTRIBUTION];

const ENVELOPE_COLORS = ['#957FFF', '#47B6FF', '#56FFFF', '#34D399', '#FBBF24', '#F87171', '#A78BFA', '#67E8F9'];

const keyframes = `
  @keyframes envelopeOpen {
    0% { transform: rotateX(0deg); }
    100% { transform: rotateX(-180deg); }
  }
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-12px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes depositPulse {
    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(149, 127, 255, 0.4); }
    70% { transform: scale(1.02); box-shadow: 0 0 0 10px rgba(149, 127, 255, 0); }
    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(149, 127, 255, 0); }
  }
  @keyframes fillUp {
    from { height: 0%; }
  }
  @keyframes moneyDrop {
    0% { opacity: 0; transform: translateY(-20px) scale(0.8); }
    50% { opacity: 1; transform: translateY(4px) scale(1.05); }
    100% { opacity: 1; transform: translateY(0) scale(1); }
  }
`;

function EnvelopeCard({ envelope, total, onOpen, recentDeposit }) {
  const goal = toNumber(envelope.goal);
  const hasGoal = goal > 0;
  const progress = hasGoal ? Math.min((total / goal) * 100, 100) : 0;
  const envColor = envelope.color || '#957FFF';

  return (
    <div
      onClick={onOpen}
      style={{
        background: colors.bg.elevated,
        borderRadius: '16px',
        padding: '0',
        cursor: 'pointer',
        transition: 'transform 0.2s ease',
        overflow: 'hidden',
        animation: recentDeposit ? 'depositPulse 0.6s ease' : 'none',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {/* Envelope flap */}
      <div style={{
        height: '40px',
        background: `linear-gradient(135deg, ${envColor}22, ${envColor}11)`,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          left: '50%',
          bottom: 0,
          transform: 'translateX(-50%)',
          width: 0,
          height: 0,
          borderLeft: '80px solid transparent',
          borderRight: '80px solid transparent',
          borderBottom: `24px solid ${colors.bg.elevated}`,
        }} />
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '14px',
          fontSize: '10px',
          color: envColor,
          fontWeight: 600,
          letterSpacing: '0.04em',
          opacity: 0.7,
        }}>
          {hasGoal ? `${Math.round(progress)}%` : ''}
        </div>
      </div>

      {/* Envelope body */}
      <div style={{ padding: '16px 20px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: envColor }} />
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: colors.text.primary, letterSpacing: '-0.01em' }}>
            {envelope.name}
          </h3>
        </div>

        <p style={{
          fontSize: '28px',
          fontWeight: 700,
          color: colors.text.primary,
          letterSpacing: '-0.03em',
          fontVariantNumeric: 'tabular-nums',
          lineHeight: 1,
          marginBottom: hasGoal ? '12px' : '0',
        }}>
          {formatCurrency(total)}
        </p>

        {hasGoal && (
          <div>
            <div style={{
              width: '100%',
              height: '6px',
              borderRadius: '3px',
              background: colors.border.primary,
              overflow: 'hidden',
              marginBottom: '6px',
            }}>
              <div style={{
                width: `${progress}%`,
                height: '100%',
                borderRadius: '3px',
                background: envColor,
                transition: 'width 0.5s ease',
                animation: 'fillUp 1s ease',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', color: colors.text.muted }}>
                Goal: {formatCurrency(goal)}
              </span>
              <span style={{ fontSize: '11px', color: progress >= 100 ? colors.status.positive : colors.text.muted }}>
                {progress >= 100 ? 'Complete' : `${formatCurrency(goal - total)} to go`}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function EnvelopeDetail({ envelope, contributions, total, onClose, onDeposit, onWithdraw, isMobile }) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [action, setAction] = useState('deposit');

  const goal = toNumber(envelope.goal);
  const hasGoal = goal > 0;
  const progress = hasGoal ? Math.min((total / goal) * 100, 100) : 0;
  const envColor = envelope.color || '#957FFF';

  const sorted = useMemo(() =>
    [...contributions].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [contributions]
  );

  const handleSubmit = () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;
    if (action === 'deposit') onDeposit(amt, note);
    else onWithdraw(amt, note);
    setAmount('');
    setNote('');
  };

  return (
    <div style={{ animation: 'slideDown 0.3s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: colors.text.muted, cursor: 'pointer', fontSize: '18px', padding: '4px' }}
          >
            {'\u2190'}
          </button>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: envColor }} />
          <h2 style={{ fontSize: isMobile ? '18px' : '22px', fontWeight: 600, color: colors.text.primary, letterSpacing: '-0.03em' }}>
            {envelope.name}
          </h2>
        </div>
      </div>

      {/* Balance + goal */}
      <div style={{ display: 'grid', gridTemplateColumns: hasGoal ? '1fr 1fr' : '1fr', gap: '16px', marginBottom: '24px' }}>
        <Card padding="20px">
          <p style={{ fontSize: '11px', color: colors.text.tertiary, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
            Balance
          </p>
          <p style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: 700, color: colors.text.primary, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>
            {formatCurrency(total)}
          </p>
        </Card>
        {hasGoal && (
          <Card padding="20px">
            <p style={{ fontSize: '11px', color: colors.text.tertiary, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
              Goal
            </p>
            <p style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: 700, color: envColor, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>
              {formatCurrency(goal)}
            </p>
            <div style={{ width: '100%', height: '6px', borderRadius: '3px', background: colors.border.primary, marginTop: '12px', overflow: 'hidden' }}>
              <div style={{ width: `${progress}%`, height: '100%', borderRadius: '3px', background: envColor, transition: 'width 0.5s ease' }} />
            </div>
            <p style={{ fontSize: '11px', color: colors.text.muted, marginTop: '6px' }}>
              {progress >= 100 ? 'Goal reached' : `${Math.round(progress)}% -- ${formatCurrency(goal - total)} remaining`}
            </p>
          </Card>
        )}
      </div>

      {/* Add/Remove money */}
      <Card style={{ marginBottom: '24px' }} padding="20px">
        <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
          <button
            onClick={() => setAction('deposit')}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '8px',
              border: 'none',
              background: action === 'deposit' ? `${envColor}22` : 'transparent',
              color: action === 'deposit' ? envColor : colors.text.muted,
              fontWeight: 500,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Add Money
          </button>
          <button
            onClick={() => setAction('withdraw')}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '8px',
              border: 'none',
              background: action === 'withdraw' ? 'rgba(248,113,113,0.12)' : 'transparent',
              color: action === 'withdraw' ? colors.status.negative : colors.text.muted,
              fontWeight: 500,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Withdraw
          </button>
        </div>
        <div style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'flex-end',
          flexDirection: isMobile ? 'column' : 'row',
        }}>
          <div style={{ flex: 1, width: isMobile ? '100%' : 'auto' }}>
            <TextInput label="Amount" type="number" value={amount} onChange={setAmount} placeholder="0.00" prefix="$" />
          </div>
          <div style={{ flex: 2, width: isMobile ? '100%' : 'auto' }}>
            <TextInput label="Note (optional)" value={note} onChange={setNote} placeholder="What is this for?" />
          </div>
          <Button onClick={handleSubmit} disabled={!amount || parseFloat(amount) <= 0} style={isMobile ? { width: '100%' } : {}}>
            {action === 'deposit' ? 'Deposit' : 'Withdraw'}
          </Button>
        </div>
      </Card>

      {/* Contribution history */}
      <Card padding="0">
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${colors.border.primary}` }}>
          <span style={{ fontSize: '12px', fontWeight: 500, color: colors.text.secondary }}>Contribution History</span>
          <span style={{ fontSize: '11px', color: colors.text.muted, marginLeft: '8px' }}>{sorted.length} entries</span>
        </div>
        {sorted.length === 0 ? (
          <div style={{ padding: '32px 20px', textAlign: 'center' }}>
            <p style={{ color: colors.text.muted, fontSize: '13px' }}>No contributions yet</p>
          </div>
        ) : sorted.map((c, i) => {
          const amt = toNumber(c.amount);
          const isDeposit = c.type === 'deposit';
          return (
            <div
              key={c.id || i}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 20px',
                borderBottom: i < sorted.length - 1 ? `1px solid ${colors.border.primary}` : 'none',
                animation: i === 0 ? 'moneyDrop 0.4s ease' : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  background: isDeposit ? `${envColor}15` : 'rgba(248,113,113,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  flexShrink: 0,
                }}>
                  {isDeposit ? '+' : '-'}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: '13px', color: colors.text.primary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.note || (isDeposit ? 'Deposit' : 'Withdrawal')}
                  </p>
                  <p style={{ fontSize: '11px', color: colors.text.muted }}>{formatDate(c.date)}</p>
                </div>
              </div>
              <span style={{
                fontSize: '14px',
                fontWeight: 600,
                color: isDeposit ? colors.status.positive : colors.status.negative,
                fontVariantNumeric: 'tabular-nums',
                flexShrink: 0,
                marginLeft: '8px',
              }}>
                {isDeposit ? '+' : '-'}{formatCurrency(amt)}
              </span>
            </div>
          );
        })}
      </Card>
    </div>
  );
}

function NewEnvelopeForm({ onSubmit, onCancel }) {
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [color, setColor] = useState(ENVELOPE_COLORS[0]);

  return (
    <Card style={{ animation: 'slideDown 0.3s ease' }}>
      <h3 style={{ fontSize: '14px', fontWeight: 500, color: colors.text.secondary, marginBottom: '16px' }}>
        New Envelope
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <TextInput label="Name" value={name} onChange={setName} placeholder="e.g. Summer Trip, New Equipment" />
        <TextInput label="Goal amount (optional)" type="number" value={goal} onChange={setGoal} placeholder="0.00" prefix="$" />
        <div>
          <label style={{ fontSize: '12px', color: colors.text.tertiary, display: 'block', marginBottom: '6px' }}>Color</label>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {ENVELOPE_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  background: c,
                  border: color === c ? '2px solid white' : '2px solid transparent',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s ease',
                }}
              />
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button onClick={() => name && onSubmit({ name, goal, color })} disabled={!name}>
            Create Envelope
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default function Envelopes() {
  const { data, loading, error, reload } = useMultipleSheets(sheets);
  const [selectedId, setSelectedId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [recentDeposit, setRecentDeposit] = useState(null);
  const isMobile = useIsMobile();

  const envelopes = data[SHEET_NAMES.ENVELOPE] || [];
  const contributions = data[SHEET_NAMES.ENVELOPE_CONTRIBUTION] || [];

  const contribByEnvelope = useMemo(() => {
    const map = {};
    contributions.forEach((c) => {
      if (!map[c.envelope_id]) map[c.envelope_id] = [];
      map[c.envelope_id].push(c);
    });
    return map;
  }, [contributions]);

  const totals = useMemo(() => {
    const map = {};
    envelopes.forEach((env) => {
      const contribs = contribByEnvelope[env.id] || [];
      map[env.id] = contribs.reduce((s, c) => {
        const amt = toNumber(c.amount);
        return c.type === 'deposit' ? s + amt : s - amt;
      }, 0);
    });
    return map;
  }, [envelopes, contribByEnvelope]);

  const totalSaved = useMemo(() => Object.values(totals).reduce((s, v) => s + Math.max(0, v), 0), [totals]);

  const handleDeposit = useCallback(async (envId, amount, note) => {
    const id = `ec_${Date.now()}`;
    await appendRow(SHEET_NAMES.ENVELOPE_CONTRIBUTION, [
      id, envId, 'user_1', amount, 'deposit', note || '', new Date().toISOString().split('T')[0], new Date().toISOString(),
    ]);
    setRecentDeposit(envId);
    setTimeout(() => setRecentDeposit(null), 1000);
    await reload();
  }, [reload]);

  const handleWithdraw = useCallback(async (envId, amount, note) => {
    const id = `ec_${Date.now()}`;
    await appendRow(SHEET_NAMES.ENVELOPE_CONTRIBUTION, [
      id, envId, 'user_1', amount, 'withdrawal', note || '', new Date().toISOString().split('T')[0], new Date().toISOString(),
    ]);
    await reload();
  }, [reload]);

  const handleCreateEnvelope = useCallback(async ({ name, goal, color }) => {
    const id = `env_${Date.now()}`;
    await appendRow(SHEET_NAMES.ENVELOPE, [
      id, 'user_1', name, goal || '', color, 'true', new Date().toISOString(),
    ]);
    setCreating(false);
    await reload();
  }, [reload]);

  if (loading) return <Loader />;

  if (error) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center' }}>
        <p style={{ color: colors.text.tertiary, fontSize: '14px' }}>{error}</p>
      </div>
    );
  }

  const selectedEnvelope = envelopes.find((e) => e.id === selectedId);

  if (selectedEnvelope) {
    return (
      <div>
        <style>{keyframes}</style>
        <EnvelopeDetail
          envelope={selectedEnvelope}
          contributions={contribByEnvelope[selectedId] || []}
          total={totals[selectedId] || 0}
          onClose={() => setSelectedId(null)}
          onDeposit={(amt, note) => handleDeposit(selectedId, amt, note)}
          onWithdraw={(amt, note) => handleWithdraw(selectedId, amt, note)}
          isMobile={isMobile}
        />
      </div>
    );
  }

  return (
    <div>
      <style>{keyframes}</style>

      <div style={{
        display: 'flex',
        alignItems: isMobile ? 'flex-start' : 'center',
        justifyContent: 'space-between',
        marginBottom: '28px',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '12px' : '0',
      }}>
        <div>
          <h2 style={{ fontSize: isMobile ? '20px' : '22px', fontWeight: 600, color: colors.text.primary, letterSpacing: '-0.03em' }}>
            Envelopes
          </h2>
          <p style={{ fontSize: '13px', color: colors.text.tertiary, marginTop: '2px' }}>
            Goal-based savings tracking
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '11px', color: colors.text.muted }}>Total Saved</p>
            <p style={{ fontSize: '18px', fontWeight: 600, color: colors.status.positive, fontVariantNumeric: 'tabular-nums' }}>
              {formatCurrency(totalSaved)}
            </p>
          </div>
          {!creating && (
            <Button onClick={() => setCreating(true)}>
              New Envelope
            </Button>
          )}
        </div>
      </div>

      {creating && (
        <div style={{ marginBottom: '24px' }}>
          <NewEnvelopeForm
            onSubmit={handleCreateEnvelope}
            onCancel={() => setCreating(false)}
          />
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '16px',
      }}>
        {envelopes
          .filter((e) => e.is_active !== 'false')
          .map((env) => (
            <EnvelopeCard
              key={env.id}
              envelope={env}
              total={totals[env.id] || 0}
              onOpen={() => setSelectedId(env.id)}
              recentDeposit={recentDeposit === env.id}
            />
          ))}
      </div>

      {envelopes.length === 0 && !creating && (
        <div style={{ padding: '60px 0', textAlign: 'center' }}>
          <p style={{ color: colors.text.muted, fontSize: '14px', marginBottom: '8px' }}>No envelopes yet</p>
          <Button onClick={() => setCreating(true)}>Create your first envelope</Button>
        </div>
      )}
    </div>
  );
}
