import { Route } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  BookOpen, 
  GraduationCap, 
  FileText, 
  Video, 
  HelpCircle, 
  HelpCircleIcon, 
  BarChart3, 
  ShieldUser,
  UserRoundPlus
} from 'lucide-react';
import CoursesPage from './pages/CoursesPage';
import IntakesPage from './pages/IntakesPage';
import NotesPage from './pages/NotesPage';
import VideosPage from './pages/VideosPage';
import QuizzesPage from './pages/QuizzesPage';
import QuestionsPage from './pages/QuestionsPage';
import EvaluationsPage from './pages/EvaluationsPage';

const TeacherDashboard = () => {
  const navigationItems = [
    { path: '/teacher/courses', label: 'Courses', icon: <BookOpen className="w-5 h-5" /> },
    { path: '/teacher/intakes', label: 'Intakes', icon: <GraduationCap className="w-5 h-5" /> },
    { path: '/teacher/notes', label: 'Notes', icon: <FileText className="w-5 h-5" /> },
    { path: '/teacher/videos', label: 'Videos', icon: <Video className="w-5 h-5" /> },
    { path: '/teacher/quizzes', label: 'Quizzes', icon: <HelpCircle className="w-5 h-5" /> },
    { path: '/teacher/questions', label: 'Questions', icon: <HelpCircleIcon className="w-5 h-5" /> },
    { path: '/teacher/evaluations', label: 'Evaluations', icon: <BarChart3 className="w-5 h-5" /> }
  ];

  const routes = (
    <>
      <Route path="courses" element={<CoursesPage />} />
      <Route path="intakes" element={<IntakesPage />} />
      <Route path="notes" element={<NotesPage />} />
      <Route path="videos" element={<VideosPage />} />
      <Route path="quizzes" element={<QuizzesPage />} />
      <Route path="questions" element={<QuestionsPage />} />
      <Route path="evaluations" element={<EvaluationsPage />} />
    </>
  );

  return (
    <DashboardLayout
      title="Dashboard"
      icon={<UserRoundPlus className="w-5 h-5" />}
      navigationItems={navigationItems}
      routes={routes}
      defaultRoute="/teacher/courses"
      userRole="Teacher"
      roleColor="text-blue-400"
    />
  );
};

export default TeacherDashboard;
