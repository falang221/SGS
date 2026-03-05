import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './shared/store/useAuthStore';

const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const DashboardLayout = lazy(() => import('./shared/ui/layout/DashboardLayout'));
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));
const StudentListPage = lazy(() => import('./pages/dashboard/StudentListPage'));
const StudentImportPage = lazy(() => import('./pages/dashboard/StudentImportPage'));
const ParentDashboard = lazy(() => import('./pages/dashboard/ParentDashboard'));
const TimetablePage = lazy(() => import('./pages/dashboard/TimetablePage'));
const GradesPage = lazy(() => import('./pages/dashboard/GradesPage'));
const AttendancePage = lazy(() => import('./pages/dashboard/AttendancePage'));
const FinancePage = lazy(() => import('./pages/dashboard/FinancePage'));
const HRPage = lazy(() => import('./pages/dashboard/HRPage'));
const SettingsPage = lazy(() => import('./pages/dashboard/SettingsPage'));
const TenantsPage = lazy(() => import('./pages/dashboard/TenantsPage'));
const PlatformSettingsPage = lazy(() => import('./pages/dashboard/PlatformSettingsPage'));
const DesignSystemPage = lazy(() => import('./pages/DesignSystemPage'));

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  return <DashboardLayout>{children}</DashboardLayout>;
};

const App: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />

        <Route path="/parent" element={
          <ProtectedRoute>
            <ParentDashboard />
          </ProtectedRoute>
        } />

        <Route path="/dashboard/students" element={
          <ProtectedRoute>
            <StudentListPage />
          </ProtectedRoute>
        } />

        <Route path="/dashboard/students/import" element={
          <ProtectedRoute>
            <StudentImportPage />
          </ProtectedRoute>
        } />

        <Route path="/dashboard/timetable" element={
          <ProtectedRoute>
            <TimetablePage />
          </ProtectedRoute>
        } />

        <Route path="/dashboard/grades" element={
          <ProtectedRoute>
            <GradesPage />
          </ProtectedRoute>
        } />

        <Route path="/dashboard/attendance" element={
          <ProtectedRoute>
            <AttendancePage />
          </ProtectedRoute>
        } />

        <Route path="/dashboard/finance" element={
          <ProtectedRoute>
            <FinancePage />
          </ProtectedRoute>
        } />

        <Route path="/dashboard/hr" element={
          <ProtectedRoute>
            <HRPage />
          </ProtectedRoute>
        } />

        <Route path="/dashboard/settings" element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        } />

        <Route path="/dashboard/tenants" element={
          <ProtectedRoute>
            <TenantsPage />
          </ProtectedRoute>
        } />

        <Route path="/dashboard/platform-settings" element={
          <ProtectedRoute>
            <PlatformSettingsPage />
          </ProtectedRoute>
        } />

        <Route path="/dashboard/design-system" element={
          <ProtectedRoute>
            <DesignSystemPage />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

const RouteLoadingFallback: React.FC = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center">
    <div className="h-10 w-10 rounded-full border-4 border-slate-200 border-t-brand-600 animate-spin" />
  </div>
);

export default App;
