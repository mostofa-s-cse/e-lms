import { Route } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  FileText, 
  Video, 
  HelpCircle, 
  HelpCircleIcon, 
  BarChart3, 
  ShieldUser
} from 'lucide-react';
import UsersPage from './pages/UsersPage';
import UserDetailsPage from './pages/UserDetailsPage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailsPage from './pages/CourseDetailsPage';
import IntakesPage from './pages/IntakesPage';
import NotesPage from './pages/NotesPage';
import VideosPage from './pages/VideosPage';
import VideoDetailsPage from './pages/VideoDetailsPage';
import QuizzesPage from './pages/QuizzesPage';
import QuestionsPage from './pages/QuestionsPage';
import EvaluationsPage from './pages/EvaluationsPage';

const AdminDashboard = () => {
  const navigationItems = [
    { path: '/admin/users', label: 'Users', icon: <Users className="w-5 h-5" /> },
    { path: '/admin/courses', label: 'Courses', icon: <BookOpen className="w-5 h-5" /> },
    { path: '/admin/intakes', label: 'Intakes', icon: <GraduationCap className="w-5 h-5" /> },
    { path: '/admin/notes', label: 'Notes', icon: <FileText className="w-5 h-5" /> },
    { path: '/admin/videos', label: 'Videos', icon: <Video className="w-5 h-5" /> },
    { path: '/admin/quizzes', label: 'Quizzes', icon: <HelpCircle className="w-5 h-5" /> },
    { path: '/admin/questions', label: 'Questions', icon: <HelpCircleIcon className="w-5 h-5" /> },
    { path: '/admin/evaluations', label: 'Evaluations', icon: <BarChart3 className="w-5 h-5" /> }
  ];

  const routes = (
    <>
      <Route path="users" element={<UsersPage />} />
      <Route path="users/:id" element={<UserDetailsPage />} />
      <Route path="courses" element={<CoursesPage />} />
      <Route path="courses/:id" element={<CourseDetailsPage />} />
      <Route path="intakes" element={<IntakesPage />} />
      <Route path="notes" element={<NotesPage />} />
      <Route path="videos" element={<VideosPage />} />
      <Route path="videos/:id" element={<VideoDetailsPage />} />
      <Route path="quizzes" element={<QuizzesPage />} />
      <Route path="questions" element={<QuestionsPage />} />
      <Route path="evaluations" element={<EvaluationsPage />} />
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
