import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import Layout from './components/Layout';
import { LoginPage } from './components/auth/AuthPages';
import OnboardingPage from './components/auth/OnboardingPage';
import DashboardPage from './components/dashboard/DashboardPage';
import EntitiesPage from './components/entities/EntitiesPage';
import RecordsPage from './components/records/RecordsPage';
import WorkflowsPage from './components/workflows/WorkflowsPage';
import SettingsPage from './components/settings/SettingsPage';
import LegacyModules from './components/legacy/LegacyModules';
import './index.css';

function AppContent() {
  const { user, loading, organizations } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50" dir="rtl">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mx-auto mb-4 animate-pulse-soft">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <p className="text-slate-400 font-medium">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  if (organizations.length === 0) {
    return <OnboardingPage />;
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <DashboardPage setActivePage={setActivePage} />;
      case 'entities': return <EntitiesPage />;
      case 'records': return <RecordsPage />;
      case 'workflows': return <WorkflowsPage />;
      case 'settings': return <SettingsPage />;
      default: return <LegacyModules activePage={activePage} onBack={() => setActivePage('dashboard')} />;
    }
  };

  return (
    <Layout activePage={activePage} setActivePage={setActivePage}>
      {renderPage()}
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}
