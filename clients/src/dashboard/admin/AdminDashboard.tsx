import { Route } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import UsersPage from './pages/UsersPage';
import CoursesPage from './pages/CoursesPage';
import IntakesPage from './pages/IntakesPage';
import NotesPage from './pages/NotesPage';
import VideosPage from './pages/VideosPage';
import QuizzesPage from './pages/QuizzesPage';
import QuestionsPage from './pages/QuestionsPage';
import EvaluationsPage from './pages/EvaluationsPage';

const AdminDashboard = () => {
  const navigationItems = [
    { path: '/admin/users', label: 'Users', icon: '👥' },
    { path: '/admin/courses', label: 'Courses', icon: '📚' },
    { path: '/admin/intakes', label: 'Intakes', icon: '🎓' },
    { path: '/admin/notes', label: 'Notes', icon: '📝' },
    { path: '/admin/videos', label: 'Videos', icon: '🎥' },
    { path: '/admin/quizzes', label: 'Quizzes', icon: '❓' },
    { path: '/admin/questions', label: 'Questions', icon: '❔' },
    { path: '/admin/evaluations', label: 'Evaluations', icon: '📊' }
  ];

  const routes = (
    <>
      <Route path="users" element={<UsersPage />} />
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
      defaultRoute="/admin/users"
      userRole="Administrator"
      roleColor="text-blue-400"
    />
  );
};

export default AdminDashboard;
