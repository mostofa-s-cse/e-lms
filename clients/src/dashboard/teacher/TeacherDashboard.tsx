import React from 'react';
import { Link, Outlet, Routes, Route, Navigate } from 'react-router-dom';
import CoursesPage from './pages/CoursesPage';
import IntakesPage from './pages/IntakesPage';
import NotesPage from './pages/NotesPage';
import VideosPage from './pages/VideosPage';
import QuizzesPage from './pages/QuizzesPage';
import QuestionsPage from './pages/QuestionsPage';
import EvaluationsPage from './pages/EvaluationsPage';

const TeacherDashboard = () => (
  <div className="min-h-screen flex">
    <aside className="w-64 bg-blue-900 text-white p-6 space-y-4">
      <h2 className="text-2xl font-bold mb-6">Teacher Dashboard</h2>
      <nav className="flex flex-col space-y-2">
        <Link to="/teacher/courses" className="hover:bg-blue-800 p-2 rounded">Courses</Link>
        <Link to="/teacher/intakes" className="hover:bg-blue-800 p-2 rounded">Intakes</Link>
        <Link to="/teacher/notes" className="hover:bg-blue-800 p-2 rounded">Notes</Link>
        <Link to="/teacher/videos" className="hover:bg-blue-800 p-2 rounded">Videos</Link>
        <Link to="/teacher/quizzes" className="hover:bg-blue-800 p-2 rounded">Quizzes</Link>
        <Link to="/teacher/questions" className="hover:bg-blue-800 p-2 rounded">Questions</Link>
        <Link to="/teacher/evaluations" className="hover:bg-blue-800 p-2 rounded">Evaluations</Link>
      </nav>
    </aside>
    <main className="flex-1 p-8 bg-gray-50">
      <Routes>
        <Route path="/" element={<Navigate to="/teacher/courses" />} />
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

export default TeacherDashboard; 