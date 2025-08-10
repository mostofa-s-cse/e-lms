import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navigation from '../components/Navigation';
import { Footer } from '../components';
import { 
  FaBookOpen, 
  FaVideo, 
  FaStickyNote, 
  FaChartBar, 
  FaUsers, 
  FaChartLine,
  FaArrowRight,
  FaPlay,
  FaGraduationCap,
  FaUserTie,
  FaLaptopCode,
  FaRocket
} from 'react-icons/fa';
import { IconType } from 'react-icons';

const HomePage = () => {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    document.title = 'E-LMS - Transform Your Learning Experience';
  }, []);

  const features = [
    {
      icon: FaBookOpen,
      title: "Comprehensive Course Management",
      description: "Create, organize, and manage courses with ease. Support for multiple subjects and academic levels."
    },
    {
      icon: FaVideo,
      title: "Interactive Video Learning",
      description: "High-quality video content with interactive elements, quizzes, and progress tracking."
    },
    {
      icon: FaStickyNote,
      title: "Rich Note-Taking",
      description: "Advanced note-taking features with multimedia support and collaborative editing capabilities."
    },
    {
      icon: FaChartBar,
      title: "Progress Analytics",
      description: "Detailed analytics and reporting to track student progress and identify areas for improvement."
    },
    {
      icon: FaUsers,
      title: "Collaborative Learning",
      description: "Group projects, discussion forums, and peer-to-peer learning opportunities."
    },
    {
      icon: FaChartLine,
      title: "Performance Tracking",
      description: "Comprehensive assessment tools with detailed performance metrics and feedback systems."
    }
  ];

  const stats = [
    { number: "1000+", label: "Active Students", icon: FaGraduationCap },
    { number: "500+", label: "Expert Instructors", icon: FaUserTie },
    { number: "200+", label: "Courses Available", icon: FaBookOpen },
    { number: "95%", label: "Success Rate", icon: FaChartLine }
  ];

  const renderIcon = (IconComponent: IconType, className: string) => {
    const Icon = IconComponent as React.ComponentType<{ className?: string }>;
    return <Icon className={className} />;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navigation currentPage="home" />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white opacity-5 rounded-full"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white opacity-5 rounded-full"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
                Transform Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">Learning</span> Experience
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 mb-10 leading-relaxed">
                E-LMS is the ultimate learning management system that empowers educators and students 
                to create, share, and engage with educational content like never before.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {!isAuthenticated ? (
                  <>
                    <Link 
                      to="/register" 
                      className="group bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 text-center flex items-center justify-center gap-2"
                    >
                      Start Learning Today
                      {renderIcon(FaArrowRight, "group-hover:translate-x-1 transition-transform duration-300")}
                    </Link>
                    <Link 
                      to="/courses" 
                      className="group border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 text-center flex items-center justify-center gap-2"
                    >
                      Explore Courses
                      {renderIcon(FaPlay, "group-hover:scale-110 transition-transform duration-300")}
                    </Link>
                  </>
                ) : (
                  <Link 
                    to="/dashboard" 
                    className="group bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 text-center flex items-center justify-center gap-2"
                  >
                    Go to Dashboard
                    {renderIcon(FaArrowRight, "group-hover:translate-x-1 transition-transform duration-300")}
                  </Link>
                )}
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-white/10 to-white/5 p-10 rounded-2xl backdrop-blur-sm border border-white/20">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-6">
                    {renderIcon(FaLaptopCode, "text-white text-6xl")}
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Modern Learning Platform</h3>
                  <p className="text-blue-100">Built with cutting-edge technology for the best learning experience</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Powerful Features for Modern Education
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover the tools and capabilities that make E-LMS the preferred choice for educators and learners worldwide.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
                  {renderIcon(feature.icon, "text-white text-2xl")}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white opacity-5 rounded-full"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Trusted by Thousands
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Our platform has helped countless students and educators achieve their learning goals.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white bg-opacity-20 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                  {renderIcon(stat.icon, "text-white text-3xl")}
                </div>
                <div className="text-4xl md:text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-blue-100 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Join thousands of educators and students who are already transforming education with E-LMS.
          </p>
          {!isAuthenticated ? (
            <Link 
              to="/register" 
              className="group inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              Create Your Account
              {renderIcon(FaRocket, "group-hover:scale-110 transition-transform duration-300")}
            </Link>
          ) : (
            <Link 
              to="/dashboard" 
              className="group inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              Access Dashboard
              {renderIcon(FaArrowRight, "group-hover:translate-x-1 transition-transform duration-300")}
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HomePage; 