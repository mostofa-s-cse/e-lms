import React from 'react';
import { Link, Outlet, Routes, Route, Navigate } from 'react-router-dom';
import CoursesPage from './pages/CoursesPage';
import IntakesPage from './pages/IntakesPage';
import NotesPage from './pages/NotesPage';
import VideosPage from './pages/VideosPage';
import QuizzesPage from './pages/QuizzesPage';
import EvaluationsPage from './pages/EvaluationsPage';

const StudentDashboard = () => (
  <div className="min-h-screen flex">
    <aside className="w-64 bg-green-900 text-white p-6 space-y-4">
      <h2 className="text-2xl font-bold mb-6">Student Dashboard</h2>
      <nav className="flex flex-col space-y-2">
        <Link to="/student/courses" className="hover:bg-green-800 p-2 rounded">My Courses</Link>
        <Link to="/student/intakes" className="hover:bg-green-800 p-2 rounded">My Intakes</Link>
        <Link to="/student/notes" className="hover:bg-green-800 p-2 rounded">Course Notes</Link>
        <Link to="/student/videos" className="hover:bg-green-800 p-2 rounded">Course Videos</Link>
        <Link to="/student/quizzes" className="hover:bg-green-800 p-2 rounded">My Quizzes</Link>
        <Link to="/student/evaluations" className="hover:bg-green-800 p-2 rounded">My Evaluations</Link>
      </nav>
    </aside>
    <main className="flex-1 p-8 bg-gray-50">
      <Routes>
        <Route path="/" element={<Navigate to="/student/courses" />} />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="intakes" element={<IntakesPage />} />
        <Route path="notes" element={<NotesPage />} />
        <Route path="videos" element={<VideosPage />} />
        <Route path="quizzes" element={<QuizzesPage />} />
        <Route path="evaluations" element={<EvaluationsPage />} />
      </Routes>
    </main>
  </div>
);

export default StudentDashboard; 