import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AppLayout } from './components/layout/AppLayout';

// Pages
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login';
import { Unauthorized } from './pages/Unauthorized';
import { NotFound } from './pages/NotFound';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StreakJourney } from './pages/student/StreakJourney';
import { AiCompanionPage } from './pages/student/AiCompanionPage';
import { StudentSubjects } from './pages/student/StudentSubjects';
import { StudentAssessments } from './pages/student/StudentAssessments';
import { StudentAttendance } from './pages/student/StudentAttendance';
import { StudentFeedbackPlans } from './pages/student/StudentFeedbackPlans';
import { StudentProfile } from './pages/student/StudentProfile';
import { BoloClassPage } from './pages/student/BoloClassPage';
import { PlacementHubPage } from './pages/student/PlacementHubPage';
import { MockInterviewPage } from './pages/student/MockInterviewPage';
import { CodeArenaPage } from './pages/student/CodeArenaPage';
import { OpportunitiesHubPage } from './pages/student/OpportunitiesHubPage';

// Subject Teacher Pages
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';
import { TeacherStudentRegister } from './pages/teacher/TeacherStudentRegister';
import { StudentSubjectProfile } from './pages/teacher/StudentSubjectProfile';
import { TeacherAssessments } from './pages/teacher/TeacherAssessments';

// Class Teacher Pages
import { ClassDashboard } from './pages/class/ClassDashboard';
import { ClassStudentRegister } from './pages/class/ClassStudentRegister';
import { CrossSubjectAnalysis } from './pages/class/CrossSubjectAnalysis';
import { ClassStudentDetail } from './pages/class/ClassStudentDetail';
import { InterventionManagement } from './pages/class/InterventionManagement';

// Administrator Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { DatasetIngestionPage } from './pages/admin/DatasetIngestionPage';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { SystemConfigPage } from './pages/admin/SystemConfigPage';

import { Role } from './types';

interface ProtectedRouteProps {
  allowedRoles: Role[];
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Verifying credentials...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

const RootRedirect: React.FC = () => {
  const { user, loading, getDefaultRouteForRole } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Initializing workspace...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
        <Routes>
          {/* Public Landing & Auth Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login defaultTab="signin" />} />
          <Route path="/signup" element={<Login defaultTab="signup" />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Student Routes */}
          <Route
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/boloclass" element={<BoloClassPage />} />
            <Route path="/student/streak" element={<StreakJourney />} />
            <Route path="/student/companion" element={<AiCompanionPage />} />
            <Route path="/student/subjects" element={<StudentSubjects />} />
            <Route path="/student/assessments" element={<StudentAssessments />} />
            <Route path="/student/attendance" element={<StudentAttendance />} />
            <Route path="/student/plans" element={<StudentFeedbackPlans />} />
            <Route path="/student/placement" element={<PlacementHubPage />} />
            <Route path="/student/interview" element={<MockInterviewPage />} />
            <Route path="/student/code-arena" element={<CodeArenaPage />} />
            <Route path="/student/opportunities" element={<OpportunitiesHubPage />} />
            <Route path="/student/profile" element={<StudentProfile />} />
          </Route>

          {/* Subject Teacher Routes */}
          <Route
            element={
              <ProtectedRoute allowedRoles={['SUBJECT_TEACHER']}>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
            <Route path="/teacher/register" element={<TeacherStudentRegister />} />
            <Route
              path="/teacher/students/:studentId/subjects/:subjectId"
              element={<StudentSubjectProfile />}
            />
            <Route path="/teacher/assessments" element={<TeacherAssessments />} />
          </Route>

          {/* Class Teacher Routes */}
          <Route
            element={
              <ProtectedRoute allowedRoles={['CLASS_TEACHER']}>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/class/dashboard" element={<ClassDashboard />} />
            <Route path="/class/register" element={<ClassStudentRegister />} />
            <Route path="/class/cross-subject" element={<CrossSubjectAnalysis />} />
            <Route path="/class/students/:studentId" element={<ClassStudentDetail />} />
            <Route path="/class/interventions" element={<InterventionManagement />} />
          </Route>

          {/* Administrator Routes */}
          <Route
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/datasets" element={<DatasetIngestionPage />} />
            <Route path="/admin/users" element={<UserManagementPage />} />
            <Route path="/admin/config" element={<SystemConfigPage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </ThemeProvider>
  );
};

export default App;
