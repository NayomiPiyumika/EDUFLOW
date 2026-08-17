import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute.jsx';
import { useAuth } from '../context/AuthContext.jsx';

import Login from '../pages/auth/Login.jsx';
import NotFound from '../pages/NotFound.jsx';

import AdminLayout from '../layouts/AdminLayout.jsx';
import TeacherLayout from '../layouts/TeacherLayout.jsx';
import StudentLayout from '../layouts/StudentLayout.jsx';

import AdminDashboard from '../pages/admin/Dashboard.jsx';
import AdminStudents from '../pages/admin/Students.jsx';
import AdminTeachers from '../pages/admin/Teachers.jsx';
import AdminClasses from '../pages/admin/Classes.jsx';
import AdminFees from '../pages/admin/Fees.jsx';

import TeacherDashboard from '../pages/teacher/Dashboard.jsx';
import TeacherMyClasses from '../pages/teacher/MyClasses.jsx';
import TeacherAttendance from '../pages/teacher/Attendance.jsx';
import TeacherExams from '../pages/teacher/Exams.jsx';
import TeacherResults from '../pages/teacher/Results.jsx';

import StudentDashboard from '../pages/student/Dashboard.jsx';
import StudentAttendance from '../pages/student/Attendance.jsx';
import StudentResults from '../pages/student/Results.jsx';
import StudentFees from '../pages/student/Fees.jsx';

import Notifications from '../pages/shared/Notifications.jsx';

function RoleRedirect() {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={`/${role}/dashboard`} replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<RoleRedirect />} />

      {/* Admin routes */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/students" element={<AdminStudents />} />
          <Route path="/admin/teachers" element={<AdminTeachers />} />
          <Route path="/admin/classes" element={<AdminClasses />} />
          <Route path="/admin/fees" element={<AdminFees />} />
          <Route path="/admin/notifications" element={<Notifications />} />
        </Route>
      </Route>

      {/* Teacher routes */}
      <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
        <Route element={<TeacherLayout />}>
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="/teacher/classes" element={<TeacherMyClasses />} />
          <Route path="/teacher/attendance" element={<TeacherAttendance />} />
          <Route path="/teacher/exams" element={<TeacherExams />} />
          <Route path="/teacher/results" element={<TeacherResults />} />
        </Route>
      </Route>

      {/* Student routes */}
      <Route element={<ProtectedRoute allowedRoles={['student']} />}>
        <Route element={<StudentLayout />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/attendance" element={<StudentAttendance />} />
          <Route path="/student/results" element={<StudentResults />} />
          <Route path="/student/fees" element={<StudentFees />} />
          <Route path="/student/notifications" element={<Notifications />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
