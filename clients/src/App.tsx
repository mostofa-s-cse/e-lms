import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import CoursesPage from './pages/CoursesPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './dashboard/admin/AdminDashboard';
import TeacherDashboard from './dashboard/teacher/TeacherDashboard';
import StudentDashboard from './dashboard/student/StudentDashboard';
import NotFoundPage from './pages/NotFoundPage';

// Protected Route Component - for dashboard access
const ProtectedRoute: React.FC<{ 
  children: React.ReactNode; 
  allowedRoles?: ('ADMIN' | 'TEACHER' | 'STUDENT')[];
}> = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

// Public Route Component - for login/register pages
const PublicRoute: React.FC<{ 
  children: React.ReactNode; 
}> = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (isAuthenticated && user) {
    // Redirect logged-in users to their appropriate dashboard
    switch (user.role) {
      case 'ADMIN': return <Navigate to="/admin" />;
      case 'TEACHER': return <Navigate to="/teacher" />;
      case 'STUDENT': return <Navigate to="/student" />;
      default: return <Navigate to="/admin" />;
    }
  }

  return <>{children}</>;
};

// Role-based redirect component for dashboard access
const DashboardRedirect: React.FC = () => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }

  switch (user.role) {
    case 'ADMIN': return <Navigate to="/admin" />;
    case 'TEACHER': return <Navigate to="/teacher" />;
    case 'STUDENT': return <Navigate to="/student" />;
    default: return <Navigate to="/login" />;
  }
};

const AppRoutes: React.FC = () => (
  <Routes>
    {/* Public Landing Pages */}
    <Route path="/" element={<HomePage />} />
    <Route path="/about" element={<AboutPage />} />
    <Route path="/courses" element={<CoursesPage />} />
    <Route path="/contact" element={<ContactPage />} />
    
    {/* Auth Pages */}
    <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
    <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
    
    {/* Dashboard Routes */}
    <Route path="/dashboard" element={<DashboardRedirect />} />
    <Route path="/admin/*" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
    <Route path="/teacher/*" element={<ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']}><TeacherDashboard /></ProtectedRoute>} />
    <Route path="/student/*" element={<ProtectedRoute allowedRoles={['STUDENT', 'TEACHER', 'ADMIN']}><StudentDashboard /></ProtectedRoute>} />
    
    {/* 404 Page */}
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
