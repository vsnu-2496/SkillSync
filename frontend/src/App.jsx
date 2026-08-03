import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingFallback />;
  return user
    ? <AnalysisProvider><AppLayout>{children}</AppLayout></AnalysisProvider>
    : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationManager />
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            
            {/* Protected Portal Routes (SkillSync Career Intelligence Platform) */}
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/resume" element={<PrivateRoute><ResumeUpload /></PrivateRoute>} />
            <Route path="/careers" element={<PrivateRoute><CareerRecommendations /></PrivateRoute>} />
            
            {/* Execution Modules */}
            <Route path="/companies" element={<PrivateRoute><CompanyExplorer /></PrivateRoute>} />
            <Route path="/interview-prep" element={<PrivateRoute><InterviewPrep /></PrivateRoute>} />
            <Route path="/mock-interview" element={<PrivateRoute><MockInterview /></PrivateRoute>} />
            <Route path="/interview-vault" element={<PrivateRoute><InterviewVault /></PrivateRoute>} />
            <Route path="/billing" element={<PrivateRoute><Billing /></PrivateRoute>} />
            <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
            
            {/* Career Readiness Report */}
            <Route path="/career-report" element={<PrivateRoute><CareerReport /></PrivateRoute>} />

            {/* Analysis History */}
            <Route path="/history" element={<PrivateRoute><AnalysisHistory /></PrivateRoute>} />
            
            {/* Admin Dashboard */}
            <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
            
            {/* Redirects */}
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
  );
}

export default App;
