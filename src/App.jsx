import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import Layout from './components/Layout';
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
  const [activePage, setActivePage] = useState('dashboard');

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
