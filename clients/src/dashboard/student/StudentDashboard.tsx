import { Route } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  BookOpen, 
  GraduationCap, 
  FileText, 
  Video, 
  HelpCircle, 
  BarChart3,
  UserRound,
  CreditCard,
  User,
} from 'lucide-react';
import CoursesPage from './pages/course/CoursesPage';
import CourseDetailsPage from './pages/course/CourseDetailsPage';
import BatchPage from './pages/BatchPage';
import PaymentsPage from './pages/PaymentsPage';
import ProfilePage from './pages/ProfilePage';

const StudentDashboard = () => {
  const navigationItems = [
    { path: '/student/courses', label: 'My Courses', icon: <BookOpen className="w-5 h-5" /> },
    { path: '/student/batches', label: 'My Batches', icon: <GraduationCap className="w-5 h-5" /> },
    { path: '/student/payments', label: 'My Payments', icon: <CreditCard className="w-5 h-5" /> },
    { path: '/student/profile', label: 'My Profile', icon: <User className="w-5 h-5" /> }
  ];

  const routes = (
    <>
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
      icon={<UserRound className="w-6 h-6" />}
      navigationItems={navigationItems}
      routes={routes}
      defaultRoute="/student/courses"
      userRole="Student"
      roleColor="text-green-400"
    />
  );
};

export default StudentDashboard;
