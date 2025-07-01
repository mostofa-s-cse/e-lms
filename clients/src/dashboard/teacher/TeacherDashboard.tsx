import { Route } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import CoursesPage from './pages/CoursesPage';
import IntakesPage from './pages/IntakesPage';
import NotesPage from './pages/NotesPage';
import VideosPage from './pages/VideosPage';
import QuizzesPage from './pages/QuizzesPage';
import QuestionsPage from './pages/QuestionsPage';
import EvaluationsPage from './pages/EvaluationsPage';

const TeacherDashboard = () => {
  const navigationItems = [
    { path: '/teacher/courses', label: 'Courses', icon: '📚' },
    { path: '/teacher/intakes', label: 'Intakes', icon: '🎓' },
    { path: '/teacher/notes', label: 'Notes', icon: '📝' },
    { path: '/teacher/videos', label: 'Videos', icon: '🎥' },
    { path: '/teacher/quizzes', label: 'Quizzes', icon: '❓' },
    { path: '/teacher/questions', label: 'Questions', icon: '❔' },
    { path: '/teacher/evaluations', label: 'Evaluations', icon: '📊' }
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
      navigationItems={navigationItems}
      routes={routes}
      defaultRoute="/teacher/courses"
      userRole="Teacher"
      roleColor="text-blue-400"
    />
  );
};

export default TeacherDashboard;
