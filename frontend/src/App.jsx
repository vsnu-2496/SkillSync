import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AnalysisProvider } from './context/AnalysisContext';
import AppLayout from './components/layout/AppLayout';
import NotificationManager from './components/NotificationManager';

// Lazy loading for premium performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ResumeUpload = lazy(() => import('./pages/ResumeUpload'));
const CareerRecommendations = lazy(() => import('./pages/CareerRecommendations'));
const InterviewPrep = lazy(() => import('./pages/InterviewPrep'));
const CompanyExplorer = lazy(() => import('./pages/CompanyExplorer'));
const InterviewVault = lazy(() => import('./pages/InterviewVault'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const SettingsPage = lazy(() => import('./pages/Settings'));
const Billing = lazy(() => import('./pages/Billing'));
const MockInterview = lazy(() => import('./pages/MockInterview'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const CareerReport = lazy(() => import('./pages/CareerReport'));
const AnalysisHistory = lazy(() => import('./pages/AnalysisHistory'));

// Global Loading State
const LoadingFallback = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#020617' }}>
    <div style={{ width: '40px', height: '40px', border: '3px solid rgba(99,102,241,0.1)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    <style dangerouslySetInnerHTML={{ __html: '@keyframes spin { to { transform: rotate(360deg); } }' }} />
  </div>
);

// Single Persistent Protected Layout
// Mounts AnalysisProvider & AppLayout ONCE per session so state is shared across all pages
const ProtectedLayout = () => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingFallback />;
  if (!user) return <Navigate to="/login" replace />;
  return (
    <AnalysisProvider>
      <AppLayout>
        <Outlet />
      </AppLayout>
    </AnalysisProvider>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationManager />
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            
            {/* Protected Portal Routes (Single Source of Truth Architecture) */}
            <Route element={<ProtectedLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/resume" element={<ResumeUpload />} />
              <Route path="/careers" element={<CareerRecommendations />} />
              <Route path="/companies" element={<CompanyExplorer />} />
              <Route path="/interview-prep" element={<InterviewPrep />} />
              <Route path="/mock-interview" element={<MockInterview />} />
              <Route path="/interview-vault" element={<InterviewVault />} />
              <Route path="/billing" element={<Billing />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/career-report" element={<CareerReport />} />
              <Route path="/history" element={<AnalysisHistory />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>
            
            {/* Redirects */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
  );
}

export default App;
