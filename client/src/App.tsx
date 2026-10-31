import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { ReportIssuePage } from './pages/ReportIssuePage';
import { PublicTrackingPage } from './pages/PublicTrackingPage';
import { CitizenDashboard } from './pages/CitizenDashboard';
import { OfficerDashboard } from './pages/OfficerDashboard';
import { SupervisorDashboard } from './pages/SupervisorDashboard';
import { WorkerDashboard } from './pages/WorkerDashboard';
import { AdminMasterDashboard } from './pages/AdminMasterDashboard';
import { AdminAnalyticsPage } from './pages/AdminAnalyticsPage';
import { AdminAuditPage } from './pages/AdminAuditPage';
import { Role } from './types';

// Protected Route Guard
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: Role[];
}> = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xs text-slate-500">
        Authenticating municipal session...
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role) && user.role !== 'MUNICIPAL_ADMIN') {
    // If not authorized for this specific desk, send to their own workspace
    if (user.role === 'CITIZEN') return <Navigate to="/citizen" replace />;
    if (user.role === 'DEPARTMENT_OFFICER') return <Navigate to="/officer" replace />;
    if (user.role === 'SUPERVISOR') return <Navigate to="/supervisor" replace />;
    if (user.role === 'WORKER') return <Navigate to="/worker" replace />;
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Workspace Layout with Dynamic Role Sidebar
const WorkspaceLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-1 min-h-[calc(100vh-4rem)]">
      <Sidebar />
      <main className="flex-1 bg-slate-100/60 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
};

// Main App Router Container
const AppRoutes: React.FC = () => {
  const location = useLocation();
  const isPlainPage = ['/', '/login', '/report'].includes(location.pathname) || location.pathname.startsWith('/track');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-['Inter',sans-serif]">
      <Navbar />

      {isPlainPage ? (
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/report"
            element={
              <ProtectedRoute allowedRoles={['CITIZEN']}>
                <ReportIssuePage />
              </ProtectedRoute>
            }
          />
          <Route path="/track" element={<PublicTrackingPage />} />
          <Route path="/track/:id" element={<PublicTrackingPage />} />
        </Routes>
      ) : (
        <WorkspaceLayout>
          <Routes>
            {/* Citizen Portal */}
            <Route
              path="/citizen"
              element={
                <ProtectedRoute allowedRoles={['CITIZEN']}>
                  <CitizenDashboard />
                </ProtectedRoute>
              }
            />

            {/* Department Officer Portal */}
            <Route
              path="/officer"
              element={
                <ProtectedRoute allowedRoles={['DEPARTMENT_OFFICER']}>
                  <OfficerDashboard />
                </ProtectedRoute>
              }
            />

            {/* Supervisor Quality Audit Portal */}
            <Route
              path="/supervisor"
              element={
                <ProtectedRoute allowedRoles={['SUPERVISOR']}>
                  <SupervisorDashboard />
                </ProtectedRoute>
              }
            />

            {/* Field Technician Portal */}
            <Route
              path="/worker"
              element={
                <ProtectedRoute allowedRoles={['WORKER']}>
                  <WorkerDashboard />
                </ProtectedRoute>
              }
            />

            {/* Municipal Admin Portal */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['MUNICIPAL_ADMIN']}>
                  <AdminMasterDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <ProtectedRoute allowedRoles={['MUNICIPAL_ADMIN']}>
                  <AdminAnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/audit"
              element={
                <ProtectedRoute allowedRoles={['MUNICIPAL_ADMIN']}>
                  <AdminAuditPage />
                </ProtectedRoute>
              }
            />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </WorkspaceLayout>
      )}
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

