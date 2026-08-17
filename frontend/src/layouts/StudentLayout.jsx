import { LayoutDashboard, ClipboardCheck, Award, Wallet, Bell as BellIcon } from 'lucide-react';
import DashboardLayout from './DashboardLayout.jsx';

const navItems = [
  { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/student/attendance', label: 'Attendance', icon: ClipboardCheck },
  { to: '/student/results', label: 'Results', icon: Award },
  { to: '/student/fees', label: 'Fees', icon: Wallet },
  { to: '/student/notifications', label: 'Notifications', icon: BellIcon },
];

export default function StudentLayout() {
  return <DashboardLayout navItems={navItems} roleLabel="Student" />;
}
