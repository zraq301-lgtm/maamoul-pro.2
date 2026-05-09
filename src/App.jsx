import React, { useState, useEffect } from 'react';
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

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px 20px', textAlign: 'center', direction: 'rtl', fontFamily: 'Tajawal, sans-serif' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>!</div>
          <h2 style={{ fontSize: '20px', color: '#334155', marginBottom: '8px' }}>حدث خطأ غير متوقع</h2>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>
            {this.state.error?.message || 'يرجى إعادة تشغيل التطبيق'}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            style={{
              padding: '12px 32px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            إعادة المحاولة
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

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
    <ErrorBoundary>
      <AuthProvider>
        <DataProvider>
          <AppContent />
        </DataProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
