import { Route } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  Users, 
  BookOpen, 
  GraduationCap,  
  ShieldUser,
  CreditCard,
  User
} from 'lucide-react';
import UsersPage from './pages/users/UsersPage';
import UserDetailsPage from './pages/users/UserDetailsPage';
import UserApprovalsPage from './pages/users/UserApprovalsPage';
import CoursesPage from './pages/course/CoursesPage';
import CourseDetailsPage from './pages/course/CourseDetailsPage';
import BatchPage from './pages/BatchPage';
import PaymentsPage from './pages/PaymentsPage';
import ProfilePage from './pages/profile/ProfilePage';

const AdminDashboard = () => {
  const navigationItems = [
    { path: '/admin/users', label: 'Users', icon: <Users className="w-5 h-5" /> },
    { path: '/admin/approvals', label: 'Approvals', icon: <ShieldUser className="w-5 h-5" /> },
    { path: '/admin/courses', label: 'Courses', icon: <BookOpen className="w-5 h-5" /> },
    { path: '/admin/batches', label: 'Batches', icon: <GraduationCap className="w-5 h-5" /> },
    { path: '/admin/payments', label: 'Payments', icon: <CreditCard className="w-5 h-5" /> },
    { path: '/admin/profile', label: 'Profile', icon: <User className="w-5 h-5" /> }
  ];

  const routes = (
    <>
      <Route path="users" element={<UsersPage />} />
      <Route path="users/:id" element={<UserDetailsPage />} />
      <Route path="approvals" element={<UserApprovalsPage />} />
      <Route path="courses" element={<CoursesPage />} />
      <Route path="courses/:id" element={<CourseDetailsPage />} />
      <Route path="batches" element={<BatchPage />} />
      <Route path="payments" element={<PaymentsPage />} />
      <Route path="profile" element={<ProfilePage />} />
    </>
  );

  return (
    <DashboardLayout
      title="Dashboard"
      icon={<ShieldUser className="w-6 h-6" />}
      navigationItems={navigationItems}
      routes={routes}
      defaultRoute="/admin/users"
      userRole="Administrator"
      roleColor="text-blue-400"
    />
  );
};

export default AdminDashboard;
