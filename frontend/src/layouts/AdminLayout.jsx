import { LayoutDashboard, Users, UserCog, BookOpen, Wallet, Bell as BellIcon } from 'lucide-react';
import DashboardLayout from './DashboardLayout.jsx';

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/students', label: 'Students', icon: Users },
  { to: '/admin/teachers', label: 'Teachers', icon: UserCog },
  { to: '/admin/classes', label: 'Classes', icon: BookOpen },
  { to: '/admin/fees', label: 'Fees', icon: Wallet },
  { to: '/admin/notifications', label: 'Notifications', icon: BellIcon },
];

export default function AdminLayout() {
  return <DashboardLayout navItems={navItems} roleLabel="Administrator" />;
}
