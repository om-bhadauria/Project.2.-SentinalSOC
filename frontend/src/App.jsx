import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import useStore from './store/useStore';
import { authApi } from './lib/authApi';

const Dashboard = lazy(() => import('./components/Dashboard'));
const AlertsPage = lazy(() => import('./pages/AlertsPage'));
const IncidentsPage = lazy(() => import('./pages/IncidentsPage'));
const RiskPage = lazy(() => import('./pages/RiskPage'));
const ScannerPage = lazy(() => import('./pages/ScannerPage'));
const AdaptiveAuth = lazy(() => import('./components/AdaptiveAuth'));
const BehaviorMonitor = lazy(() => import('./components/BehaviorMonitor'));
const ContinuousAuth = lazy(() => import('./components/ContinuousAuth'));
const TirrenoPages = lazy(() => import('./pages/TirrenoPages'));

function App() {
  const hydrateDemoWorkspace = useStore(state => state.hydrateDemoWorkspace);
  const alertsCount = useStore(state => state.alerts.length);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('sentinel_current_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      localStorage.removeItem('sentinel_current_user');
      return null;
    }
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('sentinel_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('sentinel_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser?.id === 'demo-admin' && alertsCount === 0) {
      hydrateDemoWorkspace();
    }
  }, [alertsCount, currentUser, hydrateDemoWorkspace]);

  if (!currentUser) {
    return <LoginPage onLogin={setCurrentUser} />;
  }

  return (
    <Router>
      <Layout currentUser={currentUser} onLogout={() => { authApi.logout(); setCurrentUser(null); }}>
        <Suspense fallback={<div className="glass-panel p-6 text-textMuted">Loading workspace...</div>}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/incidents" element={<IncidentsPage />} />
            <Route path="/risk" element={<RiskPage />} />
            <Route path="/scanner" element={<ScannerPage />} />
            <Route path="/adaptive-auth" element={<AdaptiveAuth />} />
            <Route path="/behavior" element={<BehaviorMonitor />} />
            <Route path="/continuous-auth" element={<ContinuousAuth />} />
            <Route path="/manual-review" element={<TirrenoPages page="manual-review" />} />
            <Route path="/blacklist" element={<TirrenoPages page="blacklist" />} />
            <Route path="/activity" element={<TirrenoPages page="activity" />} />
            <Route path="/users" element={<TirrenoPages page="users" />} />
            <Route path="/single-user" element={<TirrenoPages page="single-user" />} />
            <Route path="/ip-addresses" element={<TirrenoPages page="ip-addresses" />} />
            <Route path="/countries" element={<TirrenoPages page="countries" />} />
            <Route path="/networks" element={<TirrenoPages page="networks" />} />
            <Route path="/resources" element={<TirrenoPages page="resources" />} />
            <Route path="/field-history" element={<TirrenoPages page="field-history" />} />
            <Route path="/rules" element={<TirrenoPages page="rules" />} />
            <Route path="/preset-rules" element={<TirrenoPages page="preset-rules" />} />
            <Route path="/api" element={<TirrenoPages page="api" />} />
            <Route path="/built-for" element={<TirrenoPages page="built-for" />} />
            <Route path="/deployment" element={<TirrenoPages page="deployment" />} />
            <Route path="/settings" element={<TirrenoPages page="settings" />} />
            <Route path="/logbook" element={<TirrenoPages page="logbook" />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </Suspense>
      </Layout>
    </Router>
  );
}

export default App;
