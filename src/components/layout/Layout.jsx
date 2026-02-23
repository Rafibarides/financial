import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { colors } from '../../styles/colors';
import { useAppData } from '../../context/DataContext';
import useIsMobile from '../../hooks/useIsMobile';

export default function Layout() {
  const { refreshing } = useAppData();
  const [collapsed, setCollapsed] = useState(false);
  const isMobile = useIsMobile();
  const sidebarWidth = isMobile ? '0px' : (collapsed ? '60px' : '220px');

  return (
    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', minHeight: '100vh', background: colors.bg.primary }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} isMobile={isMobile} />
      <main style={{
        flex: 1,
        marginLeft: isMobile ? 0 : sidebarWidth,
        padding: isMobile ? '16px 16px 80px' : '32px',
        minHeight: '100vh',
        maxWidth: isMobile ? '100vw' : `calc(100vw - ${sidebarWidth})`,
        overflowX: 'hidden',
        transition: isMobile ? 'none' : 'margin-left 0.2s ease, max-width 0.2s ease',
      }}>
        {refreshing && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: isMobile ? 0 : sidebarWidth,
            right: 0,
            height: '2px',
            zIndex: 50,
            overflow: 'hidden',
            transition: isMobile ? 'none' : 'left 0.2s ease',
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
