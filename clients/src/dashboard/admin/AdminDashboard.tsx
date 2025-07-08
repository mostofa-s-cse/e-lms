import { Route } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  FileText, 
  Video, 
  HelpCircle,
  BarChart3, 
  ShieldUser,
  CreditCard,
  User
} from 'lucide-react';
import UsersPage from './pages/users/UsersPage';
import UserDetailsPage from './pages/users/UserDetailsPage';
import UserApprovalsPage from './pages/users/UserApprovalsPage';
import CoursesPage from './pages/course/CoursesPage';
import CourseDetailsPage from './pages/course/CourseDetailsPage';
import IntakesPage from './pages/IntakesPage';
import NotesPage from './pages/notes/NotesPage';
import NoteViewPage from './pages/notes/NoteViewPage';
import VideosPage from './pages/video/VideosPage';
import VideoDetailsPage from './pages/video/VideoDetailsPage';
import QuizzesPage from './pages/quiz/QuizzesPage';
import QuizDetailsPage from './pages/quiz/QuizDetailsPage';
import QuizEditPage from './pages/quiz/QuizEditPage';
import EvaluationsPage from './pages/evaluation/EvaluationsPage';
import EvaluationDetailsPage from './pages/evaluation/EvaluationDetailsPage';
import PaymentsPage from './pages/PaymentsPage';
import ProfilePage from './pages/profile/ProfilePage';

const AdminDashboard = () => {
  const navigationItems = [
    { path: '/admin/users', label: 'Users', icon: <Users className="w-5 h-5" /> },
    { path: '/admin/approvals', label: 'Approvals', icon: <ShieldUser className="w-5 h-5" /> },
    { path: '/admin/courses', label: 'Courses', icon: <BookOpen className="w-5 h-5" /> },
    { path: '/admin/intakes', label: 'Intakes', icon: <GraduationCap className="w-5 h-5" /> },
    { path: '/admin/notes', label: 'Notes', icon: <FileText className="w-5 h-5" /> },
    { path: '/admin/videos', label: 'Videos', icon: <Video className="w-5 h-5" /> },
    { path: '/admin/quizzes', label: 'Quizzes', icon: <HelpCircle className="w-5 h-5" /> },
    { path: '/admin/evaluations', label: 'Evaluations', icon: <BarChart3 className="w-5 h-5" /> },
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
      <Route path="intakes" element={<IntakesPage />} />
      <Route path="notes" element={<NotesPage />} />
      <Route path="notes/:id" element={<NoteViewPage />} />
      <Route path="videos" element={<VideosPage />} />
      <Route path="videos/:id" element={<VideoDetailsPage />} />
      <Route path="quizzes" element={<QuizzesPage />} />
      <Route path="quizzes/:id" element={<QuizDetailsPage />} />
      <Route path="quizzes/:id/edit" element={<QuizEditPage />} />
      <Route path="evaluations" element={<EvaluationsPage />} />
      <Route path="evaluations/:id" element={<EvaluationDetailsPage />} />
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
