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
import NotesPage from './pages/notes/NotesPage';
import NoteViewPage from './pages/notes/NoteViewPage';
import VideosPage from './pages/video/VideosPage';
import VideoDetailsPage from './pages/video/VideoDetailsPage';
import QuizzesPage from './pages/quiz/QuizzesPage';
import QuizDetailsPage from './pages/quiz/QuizDetailsPage';
import QuizTakingPage from './pages/quiz/QuizTakingPage';
import QuizResultPage from './pages/quiz/QuizResultPage';
import EvaluationsPage from './pages/EvaluationsPage';
import PaymentsPage from './pages/PaymentsPage';
import ProfilePage from './pages/ProfilePage';
import BatchPage from './pages/BatchPage';

const StudentDashboard = () => {
  const navigationItems = [
    { path: '/student/courses', label: 'My Courses', icon: <BookOpen className="w-5 h-5" /> },
    { path: '/student/batches', label: 'My Batches', icon: <GraduationCap className="w-5 h-5" /> },
    { path: '/student/notes', label: 'Course Notes', icon: <FileText className="w-5 h-5" /> },
    { path: '/student/videos', label: 'Course Videos', icon: <Video className="w-5 h-5" /> },
    { path: '/student/quizzes', label: 'My Quizzes', icon: <HelpCircle className="w-5 h-5" /> },
    { path: '/student/evaluations', label: 'My Evaluations', icon: <BarChart3 className="w-5 h-5" /> },
    { path: '/student/payments', label: 'My Payments', icon: <CreditCard className="w-5 h-5" /> },
    { path: '/student/profile', label: 'My Profile', icon: <User className="w-5 h-5" /> }
  ];

  const routes = (
    <>
      <Route path="courses" element={<CoursesPage />} />
      <Route path="courses/:id" element={<CourseDetailsPage />} />
      <Route path="batches" element={<BatchPage />} />
      <Route path="notes" element={<NotesPage />} />
      <Route path="notes/:id" element={<NoteViewPage />} />
      <Route path="videos" element={<VideosPage />} />
      <Route path="videos/:id" element={<VideoDetailsPage />} />
      <Route path="quizzes" element={<QuizzesPage />} />
      <Route path="quizzes/:id" element={<QuizDetailsPage />} />
      <Route path="quizzes/:id/take" element={<QuizTakingPage />} />
      <Route path="quizzes/:id/result" element={<QuizResultPage />} />
      <Route path="evaluations" element={<EvaluationsPage />} />
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
