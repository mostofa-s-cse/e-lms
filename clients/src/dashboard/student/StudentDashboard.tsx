import { Route } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import CoursesPage from './pages/CoursesPage';
import IntakesPage from './pages/IntakesPage';
import NotesPage from './pages/NotesPage';
import VideosPage from './pages/VideosPage';
import QuizzesPage from './pages/QuizzesPage';
import EvaluationsPage from './pages/EvaluationsPage';

const StudentDashboard = () => {
  const navigationItems = [
    { path: '/student/courses', label: 'My Courses', icon: '📚' },
    { path: '/student/intakes', label: 'My Intakes', icon: '🎓' },
    { path: '/student/notes', label: 'Course Notes', icon: '📝' },
    { path: '/student/videos', label: 'Course Videos', icon: '🎥' },
    { path: '/student/quizzes', label: 'My Quizzes', icon: '❓' },
    { path: '/student/evaluations', label: 'My Evaluations', icon: '📊' }
  ];

  const routes = (
    <>
      <Route path="courses" element={<CoursesPage />} />
      <Route path="intakes" element={<IntakesPage />} />
      <Route path="notes" element={<NotesPage />} />
      <Route path="videos" element={<VideosPage />} />
      <Route path="quizzes" element={<QuizzesPage />} />
      <Route path="evaluations" element={<EvaluationsPage />} />
    </>
  );

  return (
    <DashboardLayout
      title="Dashboard"
      navigationItems={navigationItems}
      routes={routes}
      defaultRoute="/student/courses"
      userRole="Student"
      roleColor="text-green-400"
    />
  );
};

export default StudentDashboard;
