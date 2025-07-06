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
} from 'lucide-react';
import CoursesPage from './pages/CoursesPage';
import CourseDetailsPage from './pages/CourseDetailsPage';
import IntakesPage from './pages/IntakesPage';
import NotesPage from './pages/NotesPage';
import VideosPage from './pages/VideosPage';
import VideoDetailsPage from './pages/VideoDetailsPage';
import QuizzesPage from './pages/QuizzesPage';
import EvaluationsPage from './pages/EvaluationsPage';
import PaymentsPage from './pages/PaymentsPage';

const StudentDashboard = () => {
  const navigationItems = [
    { path: '/student/courses', label: 'My Courses', icon: <BookOpen className="w-5 h-5" /> },
    { path: '/student/intakes', label: 'My Intakes', icon: <GraduationCap className="w-5 h-5" /> },
    { path: '/student/notes', label: 'Course Notes', icon: <FileText className="w-5 h-5" /> },
    { path: '/student/videos', label: 'Course Videos', icon: <Video className="w-5 h-5" /> },
    { path: '/student/quizzes', label: 'My Quizzes', icon: <HelpCircle className="w-5 h-5" /> },
    { path: '/student/evaluations', label: 'My Evaluations', icon: <BarChart3 className="w-5 h-5" /> },
    { path: '/student/payments', label: 'My Payments', icon: <CreditCard className="w-5 h-5" /> }
  ];

  const routes = (
    <>
      <Route path="courses" element={<CoursesPage />} />
      <Route path="courses/:id" element={<CourseDetailsPage />} />
      <Route path="intakes" element={<IntakesPage />} />
      <Route path="notes" element={<NotesPage />} />
      <Route path="videos" element={<VideosPage />} />
      <Route path="videos/:id" element={<VideoDetailsPage />} />
      <Route path="quizzes" element={<QuizzesPage />} />
      <Route path="evaluations" element={<EvaluationsPage />} />
      <Route path="payments" element={<PaymentsPage />} />
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
