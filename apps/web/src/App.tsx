import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import LandingPage from './pages/LandingPage';
import DashboardLayout from './shared/ui/layout/DashboardLayout';
import { useAuthStore } from './shared/store/useAuthStore';
import DashboardPage from './pages/dashboard/DashboardPage';
import StudentListPage from './pages/dashboard/StudentListPage';
import StudentImportPage from './pages/dashboard/StudentImportPage';
import ParentDashboard from './pages/dashboard/ParentDashboard';
import TimetablePage from './pages/dashboard/TimetablePage';
import GradesPage from './pages/dashboard/GradesPage';
import AttendancePage from './pages/dashboard/AttendancePage';
import FinancePage from './pages/dashboard/FinancePage';
import HRPage from './pages/dashboard/HRPage';
import SettingsPage from './pages/dashboard/SettingsPage';
import TenantsPage from './pages/dashboard/TenantsPage';
import PlatformSettingsPage from './pages/dashboard/PlatformSettingsPage';
import DesignSystemPage from './pages/DesignSystemPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  return <DashboardLayout>{children}</DashboardLayout>;
};

const App: React.FC = () => {
  const { user } = useAuthStore();

  return (
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
  );
};

export default App;
