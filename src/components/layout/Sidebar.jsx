import { NavLink, useLocation } from 'react-router-dom';
import { colors } from '../../styles/colors';
import { useAppData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';

const navItems = [
  { path: '/', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4' },
  { path: '/input', label: 'Input', icon: 'M12 4v16m8-8H4' },
  { path: '/transactions', label: 'Txns', shortLabel: true, fullLabel: 'Transactions', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { path: '/budget', label: 'Budget', icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
  { path: '/accounts', label: 'Accounts', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
  { path: '/envelopes', label: 'Envelopes', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
];

function NavIcon({ d, active, size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={active ? colors.text.primary : colors.text.tertiary}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  );
}

function MobileBottomBar() {
  const location = useLocation();

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '64px',
      background: colors.bg.secondary,
      borderTop: `1px solid ${colors.border.primary}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      zIndex: 100,
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
    }}>
      {navItems.map((item) => {
        const active = location.pathname === item.path;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '3px',
              padding: '6px 0',
              textDecoration: 'none',
              flex: 1,
              minWidth: 0,
            }}
          >
            <NavIcon d={item.icon} active={active} size={20} />
            <span style={{
              fontSize: '10px',
              fontWeight: active ? 600 : 400,
              color: active ? colors.text.primary : colors.text.tertiary,
              lineHeight: 1,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%',
              textAlign: 'center',
            }}>
              {item.shortLabel ? item.label : item.label}
            </span>
          </NavLink>
        );
      })}
    </nav>
  );
}

export default function Sidebar({ collapsed, onToggle, isMobile }) {
  const location = useLocation();
  const { refresh, refreshing } = useAppData();
  const { theme, toggleTheme } = useTheme();

  if (isMobile) {
    return <MobileBottomBar />;
  }

  const width = collapsed ? '60px' : '220px';

  return (
    <aside
      style={{
        width,
        height: '100vh',
        background: colors.bg.secondary,
        borderRight: `1px solid ${colors.border.primary}`,
        display: 'flex',
        flexDirection: 'column',
        padding: collapsed ? '24px 8px' : '24px 12px',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 10,
        transition: 'width 0.2s ease, padding 0.2s ease',
        overflow: 'hidden',
      }}
    >
      {/* Header + collapse toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', padding: collapsed ? '0' : '0 12px', marginBottom: '32px' }}>
        {!collapsed && (
          <div>
            <h1 style={{ fontSize: '16px', fontWeight: 600, color: colors.text.primary, letterSpacing: '-0.02em' }}>
              Budget Tracker
            </h1>
          </div>
        )}
        <button
          onClick={onToggle}
          style={{
            background: 'transparent',
            border: 'none',
            color: colors.text.muted,
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 0.15s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = colors.text.secondary; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = colors.text.muted; }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            {collapsed
              ? <path d="M13 17l5-5-5-5M6 17l5-5-5-5" />
              : <path d="M11 17l-5-5 5-5M18 17l-5-5 5-5" />
            }
          </svg>
        </button>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          const displayLabel = item.fullLabel || item.label;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              title={collapsed ? displayLabel : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: collapsed ? '9px 0' : '9px 12px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: active ? 500 : 400,
                color: active ? colors.text.primary : colors.text.tertiary,
                background: active ? colors.transparent.white5 : 'transparent',
                transition: 'all 0.15s ease',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.background = colors.transparent.white5;
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.background = 'transparent';
              }}
            >
              <NavIcon d={item.icon} active={active} />
              {!collapsed && displayLabel}
            </NavLink>
          );
        })}
      </nav>

      <div style={{ marginTop: 'auto', padding: collapsed ? '0 4px' : '0 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={collapsed ? (theme === 'dark' ? 'Light mode' : 'Dark mode') : undefined}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            width: '100%',
            padding: '9px 12px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            borderRadius: '8px',
            border: 'none',
            background: 'transparent',
            color: colors.text.tertiary,
            fontSize: '12px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = colors.transparent.white5; e.currentTarget.style.color = colors.text.secondary; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = colors.text.tertiary; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            {theme === 'dark'
              ? <><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></>
              : <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
            }
          </svg>
          {!collapsed && (theme === 'dark' ? 'Light Mode' : 'Dark Mode')}
        </button>

        {/* Refresh */}
        <button
          onClick={refresh}
          disabled={refreshing}
          title={collapsed ? (refreshing ? 'Refreshing...' : 'Refresh Data') : undefined}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            width: '100%',
            padding: '9px 12px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            borderRadius: '8px',
            border: 'none',
            background: 'transparent',
            color: refreshing ? colors.text.muted : colors.text.tertiary,
            fontSize: '12px',
            cursor: refreshing ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => {
            if (!refreshing) {
              e.currentTarget.style.background = colors.transparent.white5;
              e.currentTarget.style.color = colors.text.secondary;
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = colors.text.tertiary;
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ flexShrink: 0, animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }}
          >
            <path d="M1 4v6h6M23 20v-6h-6" />
            <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" />
          </svg>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          {!collapsed && (refreshing ? 'Refreshing...' : 'Refresh Data')}
        </button>
      </div>
    </aside>
  );
}
