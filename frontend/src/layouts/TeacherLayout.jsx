import { LayoutDashboard, BookOpen, ClipboardCheck, FileSpreadsheet, Award } from 'lucide-react';
import DashboardLayout from './DashboardLayout.jsx';

const navItems = [
  { to: '/teacher/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/teacher/classes', label: 'My Classes', icon: BookOpen },
  { to: '/teacher/attendance', label: 'Attendance', icon: ClipboardCheck },
  { to: '/teacher/exams', label: 'Exams', icon: FileSpreadsheet },
  { to: '/teacher/results', label: 'Results', icon: Award },
];

export default function TeacherLayout() {
  return <DashboardLayout navItems={navItems} roleLabel="Teacher" />;
}
