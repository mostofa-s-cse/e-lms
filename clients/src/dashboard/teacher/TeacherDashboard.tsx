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
import IntakesPage from './pages/BatchPage';
import NotesPage from './pages/notes/NotesPage';
import NoteViewPage from './pages/notes/NoteViewPage';
import VideosPage from './pages/video/VideosPage';
import VideoDetailsPage from './pages/video/VideoDetailsPage';
import QuizzesPage from './pages/quiz/QuizzesPage';
import QuizDetailsPage from './pages/quiz/QuizDetailsPage';
import QuizEditPage from './pages/quiz/QuizEditPage';
import EvaluationsPage from './pages/evaluation/EvaluationsPage';
import EvaluationDetailsPage from './pages/evaluation/EvaluationDetailsPage';
import ProfilePage from './pages/profile/ProfilePage';

const TeacherDashboard = () => {
  const navigationItems = [
    { path: '/teacher/courses', label: 'Courses', icon: <BookOpen className="w-5 h-5" /> },
    { path: '/teacher/batches', label: 'Batches', icon: <GraduationCap className="w-5 h-5" /> },
    { path: '/teacher/notes', label: 'Notes', icon: <FileText className="w-5 h-5" /> },
    { path: '/teacher/videos', label: 'Videos', icon: <Video className="w-5 h-5" /> },
    { path: '/teacher/quizzes', label: 'Quizzes', icon: <HelpCircle className="w-5 h-5" /> },
    { path: '/teacher/evaluations', label: 'Evaluations', icon: <BarChart3 className="w-5 h-5" /> },
    { path: '/teacher/profile', label: 'Profile', icon: <User className="w-5 h-5" /> }
  ];

  const routes = (
    <>
      <Route path="courses" element={<CoursesPage />} />
      <Route path="courses/:id" element={<CourseDetailsPage />} />
      <Route path="batches" element={<IntakesPage />} />
      <Route path="notes" element={<NotesPage />} />
      <Route path="notes/:id" element={<NoteViewPage />} />
      <Route path="videos" element={<VideosPage />} />
      <Route path="videos/:id" element={<VideoDetailsPage />} />
      <Route path="quizzes" element={<QuizzesPage />} />
      <Route path="quizzes/:id" element={<QuizDetailsPage />} />
      <Route path="quizzes/:id/edit" element={<QuizEditPage />} />
      <Route path="evaluations" element={<EvaluationsPage />} />
      <Route path="evaluations/:id" element={<EvaluationDetailsPage />} />
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
