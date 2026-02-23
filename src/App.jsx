import { Routes, Route } from 'react-router-dom';
import { DataProvider, useAppData } from './context/DataContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import PinGate from './components/common/PinGate';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Input from './pages/Input';
import Budget from './pages/Budget';
import Transactions from './pages/Transactions';
import Accounts from './pages/Accounts';
import Envelopes from './pages/Envelopes';
import InitialLoader from './components/common/InitialLoader';

function AppRoutes() {
  const { loading, loadStepLabel, loadProgress } = useAppData();
  const { theme } = useTheme();

  if (loading) {
    return <InitialLoader step={loadStepLabel} progress={loadProgress} />;
  }

  return (
    <div key={theme}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/input" element={<Input />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/envelopes" element={<Envelopes />} />
        </Route>
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <PinGate>
        <DataProvider>
          <AppRoutes />
        </DataProvider>
      </PinGate>
    </ThemeProvider>
  );
}
