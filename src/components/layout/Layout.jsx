import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { colors } from '../../styles/colors';
import { useAppData } from '../../context/DataContext';

export default function Layout() {
  const { refreshing } = useAppData();
  const [collapsed, setCollapsed] = useState(false);
  const sidebarWidth = collapsed ? '60px' : '220px';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: colors.bg.primary }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <main style={{
        flex: 1,
        marginLeft: sidebarWidth,
        padding: '32px',
        minHeight: '100vh',
        maxWidth: `calc(100vw - ${sidebarWidth})`,
        overflowX: 'hidden',
        transition: 'margin-left 0.2s ease, max-width 0.2s ease',
      }}>
        {refreshing && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: sidebarWidth,
            right: 0,
            height: '2px',
            zIndex: 50,
            overflow: 'hidden',
            transition: 'left 0.2s ease',
          }}>
            <div style={{
              width: '30%',
              height: '100%',
              background: colors.accent.purple,
              animation: 'refreshBar 1s ease-in-out infinite',
            }} />
            <style>{`
              @keyframes refreshBar {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(400%); }
              }
            `}</style>
          </div>
        )}
        <Outlet />
      </main>
    </div>
  );
}
