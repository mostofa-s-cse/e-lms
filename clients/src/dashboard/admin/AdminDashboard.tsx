import React from 'react';
import { Link, Outlet, Routes, Route, Navigate } from 'react-router-dom';
import UsersPage from './pages/UsersPage';
import CoursesPage from './pages/CoursesPage';
import IntakesPage from './pages/IntakesPage';
import NotesPage from './pages/NotesPage';
import VideosPage from './pages/VideosPage';
import QuizzesPage from './pages/QuizzesPage';
import QuestionsPage from './pages/QuestionsPage';
import EvaluationsPage from './pages/EvaluationsPage';

const AdminDashboard = () => (
  <div className="min-h-screen flex">
    <aside className="w-64 bg-gray-900 text-white p-6 space-y-4">
      <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>
      <nav className="flex flex-col space-y-2">
        <Link to="/admin/users" className="hover:bg-gray-800 p-2 rounded">Users</Link>
        <Link to="/admin/courses" className="hover:bg-gray-800 p-2 rounded">Courses</Link>
        <Link to="/admin/intakes" className="hover:bg-gray-800 p-2 rounded">Intakes</Link>
        <Link to="/admin/notes" className="hover:bg-gray-800 p-2 rounded">Notes</Link>
        <Link to="/admin/videos" className="hover:bg-gray-800 p-2 rounded">Videos</Link>
        <Link to="/admin/quizzes" className="hover:bg-gray-800 p-2 rounded">Quizzes</Link>
        <Link to="/admin/questions" className="hover:bg-gray-800 p-2 rounded">Questions</Link>
        <Link to="/admin/evaluations" className="hover:bg-gray-800 p-2 rounded">Evaluations</Link>
      </nav>
    </aside>
    <main className="flex-1 p-8 bg-gray-50">
      <Routes>
        <Route path="/" element={<Navigate to="/admin/users" />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="intakes" element={<IntakesPage />} />
        <Route path="notes" element={<NotesPage />} />
        <Route path="videos" element={<VideosPage />} />
        <Route path="quizzes" element={<QuizzesPage />} />
        <Route path="questions" element={<QuestionsPage />} />
        <Route path="evaluations" element={<EvaluationsPage />} />
      </Routes>
    </main>
  </div>
);

export default AdminDashboard; 