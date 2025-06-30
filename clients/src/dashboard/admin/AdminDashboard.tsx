import React, { useState } from 'react';
import { Link, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { showConfirmDialog } from '../../utils/sweetAlert';
import UsersPage from './pages/UsersPage';
import CoursesPage from './pages/CoursesPage';
import IntakesPage from './pages/IntakesPage';
import NotesPage from './pages/NotesPage';
import VideosPage from './pages/VideosPage';
import QuizzesPage from './pages/QuizzesPage';
import QuestionsPage from './pages/QuestionsPage';
import EvaluationsPage from './pages/EvaluationsPage';
import { MenuIcon } from 'lucide-react';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    const result = await showConfirmDialog('Logout', 'Are you sure you want to logout?', 'Logout', 'Cancel');
    if (result.isConfirmed) {
      logout();
      navigate('/login');
    }
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setIsProfileOpen(false);
  };

  // Get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/admin/users')) return 'Users Management';
    if (path.includes('/admin/courses')) return 'Courses Management';
    if (path.includes('/admin/intakes')) return 'Intakes Management';
    if (path.includes('/admin/notes')) return 'Notes Management';
    if (path.includes('/admin/videos')) return 'Videos Management';
    if (path.includes('/admin/quizzes')) return 'Quizzes Management';
    if (path.includes('/admin/questions')) return 'Questions Management';
    if (path.includes('/admin/evaluations')) return 'Evaluations Management';
    return 'Admin Dashboard';
  };

  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Fixed Sidebar - Hidden on mobile, visible on tablet and desktop */}
      <aside className={`
        fixed top-0 left-0 h-full bg-gray-900 text-white z-50 transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:relative lg:z-auto
        w-64 flex flex-col
      `}>
        {/* Sidebar Header - Fixed */}
        <div className="flex-shrink-0 p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl lg:text-2xl font-bold">Admin Dashboard</h2>
            <button
              onClick={closeMobileMenu}
              className="lg:hidden p-2 text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
        
        {/* Sidebar Navigation - Scrollable */}
        <nav className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col space-y-2">
            <Link 
              to="/admin/users" 
              onClick={closeMobileMenu}
              className={`hover:bg-gray-800 p-3 rounded transition-colors duration-200 ${
                location.pathname.includes('/admin/users') ? 'bg-gray-800 text-blue-400' : ''
              }`}
            >
              👥 Users
            </Link>
            <Link 
              to="/admin/courses" 
              onClick={closeMobileMenu}
              className={`hover:bg-gray-800 p-3 rounded transition-colors duration-200 ${
                location.pathname.includes('/admin/courses') ? 'bg-gray-800 text-blue-400' : ''
              }`}
            >
              📚 Courses
            </Link>
            <Link 
              to="/admin/intakes" 
              onClick={closeMobileMenu}
              className={`hover:bg-gray-800 p-3 rounded transition-colors duration-200 ${
                location.pathname.includes('/admin/intakes') ? 'bg-gray-800 text-blue-400' : ''
              }`}
            >
              🎓 Intakes
            </Link>
            <Link 
              to="/admin/notes" 
              onClick={closeMobileMenu}
              className={`hover:bg-gray-800 p-3 rounded transition-colors duration-200 ${
                location.pathname.includes('/admin/notes') ? 'bg-gray-800 text-blue-400' : ''
              }`}
            >
              📝 Notes
            </Link>
            <Link 
              to="/admin/videos" 
              onClick={closeMobileMenu}
              className={`hover:bg-gray-800 p-3 rounded transition-colors duration-200 ${
                location.pathname.includes('/admin/videos') ? 'bg-gray-800 text-blue-400' : ''
              }`}
            >
              🎥 Videos
            </Link>
            <Link 
              to="/admin/quizzes" 
              onClick={closeMobileMenu}
              className={`hover:bg-gray-800 p-3 rounded transition-colors duration-200 ${
                location.pathname.includes('/admin/quizzes') ? 'bg-gray-800 text-blue-400' : ''
              }`}
            >
              ❓ Quizzes
            </Link>
            <Link 
              to="/admin/questions" 
              onClick={closeMobileMenu}
              className={`hover:bg-gray-800 p-3 rounded transition-colors duration-200 ${
                location.pathname.includes('/admin/questions') ? 'bg-gray-800 text-blue-400' : ''
              }`}
            >
              ❔ Questions
            </Link>
            <Link 
              to="/admin/evaluations" 
              onClick={closeMobileMenu}
              className={`hover:bg-gray-800 p-3 rounded transition-colors duration-200 ${
                location.pathname.includes('/admin/evaluations') ? 'bg-gray-800 text-blue-400' : ''
              }`}
            >
              📊 Evaluations
            </Link>
          </div>
        </nav>

        {/* User Profile Section - Fixed at Bottom */}
        <div className="flex-shrink-0 p-4 bg-gray-800 border-t border-gray-700 mt-auto">
          <div className="flex items-center space-x-3">
            {/* User Avatar */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold hover:bg-blue-700 transition-colors duration-200"
              >
                {user?.firstName?.charAt(0)?.toUpperCase() || 'A'}
              </button>
              
              {/* Profile Dropdown */}
              {isProfileOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-3 border-b border-gray-200">
                    <div className="font-semibold text-gray-900">{user?.firstName} {user?.lastName}</div>
                    <div className="text-sm text-gray-600">{user?.email}</div>
                    <div className="text-xs text-blue-600 font-medium mt-1">Administrator</div>
                  </div>
                  <div className="p-1">
                    <button
                      onClick={() => setIsProfileOpen(false)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                    >
                      👤 View Profile
                    </button>
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
                    >
                      🚪 Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">
                {user?.firstName} {user?.lastName}
              </div>
              <div className="text-xs text-gray-400 truncate">
                {user?.email}
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors duration-200"
              title="Logout"
            >
              🚪
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Fixed Topbar */}
        <header className="flex-shrink-0 bg-white shadow-sm border-b border-gray-200 z-30">
          {/* Mobile Header */}
          <div className="lg:hidden px-4 py-3">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 text-gray-600 hover:text-gray-900"
              >
                <MenuIcon className="w-6 h-6" />
              </button>
              <h1 className="text-lg font-semibold text-gray-900">{getPageTitle()}</h1>
              <div className="w-8"></div>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:flex items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{getPageTitle()}</h1>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="p-4">
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
          </div>
        </main>

        {/* Fixed Footer */}
        <footer className="flex-shrink-0 w-full bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              © 2024 LMS Admin Dashboard. All rights reserved.
            </div>
            <div className="text-sm text-gray-600">
              Version 1.0.0
            </div>
          </div>
        </footer>
      </div>

      {/* Click outside to close dropdowns */}
      {isProfileOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsProfileOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
