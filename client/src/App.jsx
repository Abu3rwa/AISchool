import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { store } from './store/store';
import { selectIsAuthenticated } from './store/slices/authSlice';
import { selectSchoolIsAuthenticated } from './store/slices/schoolAuthSlice';

// Layouts
import { MainLayout } from './components/layout';
import SchoolLayout from './components/layout/SchoolLayout';

// Pages - Provider
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import TenantsListPage from './pages/tenants/TenantsListPage';
import TenantDetailsPage from './pages/tenants/TenantDetailsPage';
import SubscriptionsPage from './pages/subscriptions/SubscriptionsPage';
import AnalyticsPage from './pages/analytics/AnalyticsPage';
import AuditLogsPage from './pages/audit/AuditLogsPage';
import SettingsPage from './pages/settings/SettingsPage';
import SchoolUsersPage from './pages/tenants/school/SchoolUsersPage';
import SchoolRolesPage from './pages/tenants/school/SchoolRolesPage';
import SchoolMetricsPage from './pages/tenants/school/SchoolMetricsPage';

// Pages - School
import SchoolLoginPage from './pages/school/auth/SchoolLoginPage';
import SchoolDashboardPage from './pages/school/dashboard/SchoolDashboardPage';
import StudentsPage from './pages/school/students/StudentsPage';
import TeachersPage from './pages/school/teachers/TeachersPage';
import ClassesPage from './pages/school/classes/ClassesPage';
import SubjectsPage from './pages/school/subjects/SubjectsPage';
import AssignmentsPage from './pages/school/assignments/AssignmentsPage';
import GradesPage from './pages/school/grades/GradesPage';
import BulkGradeEntryPage from './pages/school/grades/BulkGradeEntryPage';
import GradeTypesPage from './pages/school/grade-types/GradeTypesPage';
import TermsPage from './pages/school/terms/TermsPage';

// Placeholder pages for later
const PlaceholderResults = ({ title }) => <div className="p-4"><h2>{title}</h2><p>Coming soon...</p></div>;

// Protected Route wrapper - Provider
const ProtectedRoute = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
};

// Public Route wrapper - Provider
const PublicRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
};

// Protected Route wrapper - School
const SchoolProtectedRoute = () => {
  const isAuthenticated = useSelector(selectSchoolIsAuthenticated);
  if (!isAuthenticated) return <Navigate to="/portal/login" replace />;
  return <Outlet />;
};

// Public Route wrapper - School
const SchoolPublicRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectSchoolIsAuthenticated);
  if (isAuthenticated) return <Navigate to="/portal" replace />;
  return children;
};

const AppContent = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* ============ PROVIDER ROUTES ============ */}
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/tenants" element={<TenantsListPage />} />
            <Route path="/tenants/:id" element={<TenantDetailsPage />} />
            <Route path="/tenants/:id/users" element={<SchoolUsersPage />} />
            <Route path="/tenants/:id/roles" element={<SchoolRolesPage />} />
            <Route path="/tenants/:id/metrics" element={<SchoolMetricsPage />} />
            <Route path="/subscriptions" element={<SubscriptionsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/audit-logs" element={<AuditLogsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        {/* ============ SCHOOL ROUTES ============ */}
        <Route path="/portal/login" element={<SchoolPublicRoute><SchoolLoginPage /></SchoolPublicRoute>} />

        <Route path="/portal" element={<SchoolProtectedRoute />}>
          <Route element={<SchoolLayout />}>
            <Route index element={<SchoolDashboardPage />} />
            <Route path="students" element={<StudentsPage />} />
            <Route path="teachers" element={<TeachersPage />} />
            <Route path="classes" element={<ClassesPage />} />
            <Route path="subjects" element={<SubjectsPage />} />
            <Route path="assignments" element={<AssignmentsPage />} />
            <Route path="grades" element={<GradesPage />} />
            <Route path="grades/add" element={<BulkGradeEntryPage />} />
            <Route path="grade-types" element={<GradeTypesPage />} />
            <Route path="terms" element={<TermsPage />} />
            <Route path="schedule" element={<PlaceholderResults title="Schedule" />} />
            <Route path="reports" element={<PlaceholderResults title="Reports" />} />
            <Route path="users" element={<PlaceholderResults title="School Staff & Users" />} />
            <Route path="settings" element={<PlaceholderResults title="School Settings" />} />
          </Route>
        </Route>

        {/* Catch all - redirect to provider dashboard by default, maybe 404 page better later */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

export default App;
