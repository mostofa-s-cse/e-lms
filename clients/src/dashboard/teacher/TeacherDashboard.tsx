import { Route } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  BookOpen, 
  GraduationCap, 
  FileText, 
  Video, 
  HelpCircle,
  BarChart3, 
  UserRoundPlus,
  User
} from 'lucide-react';
import CoursesPage from './pages/course/CoursesPage';
import CourseDetailsPage from './pages/course/CourseDetailsPage';
import BatchPage from './pages/BatchPage';
import ProfilePage from './pages/profile/ProfilePage';

const TeacherDashboard = () => {
  const navigationItems = [
    { path: '/teacher/courses', label: 'Courses', icon: <BookOpen className="w-5 h-5" /> },
    { path: '/teacher/batches', label: 'Batches', icon: <GraduationCap className="w-5 h-5" /> },
    { path: '/teacher/profile', label: 'Profile', icon: <User className="w-5 h-5" /> }
  ];

  const routes = (
    <>
      <Route path="courses" element={<CoursesPage />} />
      <Route path="courses/:id" element={<CourseDetailsPage />} />
      <Route path="batches" element={<BatchPage />} />
      <Route path="profile" element={<ProfilePage />} />
    </>
  );

  return (
    <DashboardLayout
      title="Dashboard"
      icon={<UserRoundPlus className="w-6 h-6" />}
      navigationItems={navigationItems}
      routes={routes}
      defaultRoute="/teacher/courses"
      userRole="Teacher"
      roleColor="text-blue-400"
    />
  );
};

export default TeacherDashboard;
