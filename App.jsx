import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { DashboardLayout } from './layouts/DashboardLayout';

import { Login } from './pages/Login';
import { Register } from './pages/Register';

import { Dashboard } from './pages/Dashboard';
import { Patients } from './pages/Patients';
import { Doctors } from './pages/Doctors';
import { Appointments } from './pages/Appointments';
import { MedicalRecords } from './pages/MedicalRecords';
import { Prescriptions } from './pages/Prescriptions';
import { Pharmacy } from './pages/Pharmacy';
import { Laboratory } from './pages/Laboratory';
import { Billing } from './pages/Billing';
import { Emergency } from './pages/Emergency';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-500 to-teal-400 flex items-center justify-center animate-pulse shadow-xl shadow-brand-500/30">
            <span className="text-2xl font-black">CB</span>
          </div>
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-brand-500 to-teal-400 blur opacity-40 animate-spin"></div>
        </div>
        <h1 className="mt-5 text-xl font-extrabold tracking-tight">CAREBRIDGE</h1>
        <p className="text-xs text-slate-400 mt-1 font-medium">Smart Healthcare Management System</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (authMode === 'register') {
      return <Register onSwitchToLogin={() => setAuthMode('login')} />;
    }
    return <Login onSwitchToRegister={() => setAuthMode('register')} />;
  }

  // Render appropriate view based on active sidebar tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} />;
      case 'patients':
        return <Patients />;
      case 'doctors':
        return <Doctors />;
      case 'appointments':
        return <Appointments />;
      case 'medical-records':
        return <MedicalRecords />;
      case 'prescriptions':
        return <Prescriptions />;
      case 'pharmacy':
        return <Pharmacy />;
      case 'laboratory':
        return <Laboratory />;
      case 'billing':
        return <Billing />;
      case 'emergency':
        return <Emergency />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderTabContent()}
    </DashboardLayout>
  );
};

export function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;

