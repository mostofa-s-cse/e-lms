import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navigation from '../components/Navigation';
import { Footer } from '../components';
import { 
  FaGraduationCap, 
  FaChartLine,
  FaLightbulb,
  FaHandshake,
  FaUniversalAccess,
  FaUserTie,
  FaLaptopCode,
  FaChalkboardTeacher,
  FaUserCog,
  FaArrowRight
} from 'react-icons/fa';
import { IconType } from 'react-icons';

const AboutPage = () => {
  const { isAuthenticated } = useAuth();

  const team = [
    {
      name: "Dr. Sarah Johnson",
      role: "Chief Executive Officer",
      bio: "Former university professor with 15+ years in educational technology",
      icon: FaUserTie
    },
    {
      name: "Michael Chen",
      role: "Chief Technology Officer",
      bio: "Expert in software development and educational platforms",
      icon: FaLaptopCode
    },
    {
      name: "Dr. Emily Rodriguez",
      role: "Head of Education",
      bio: "Curriculum specialist with expertise in online learning methodologies",
      icon: FaChalkboardTeacher
    },
    {
      name: "David Thompson",
      role: "Product Manager",
      bio: "Passionate about creating user-friendly educational experiences",
      icon: FaUserCog
    }
  ];

  const values = [
    {
      icon: FaChartLine,
      title: "Excellence",
      description: "We strive for excellence in everything we do, from platform development to user support."
    },
    {
      icon: FaHandshake,
      title: "Collaboration",
      description: "We believe in the power of collaboration between students, teachers, and technology."
    },
    {
      icon: FaLightbulb,
      title: "Innovation",
      description: "We continuously innovate to provide cutting-edge educational solutions."
    },
    {
      icon: FaUniversalAccess,
      title: "Accessibility",
      description: "We ensure our platform is accessible to learners from all backgrounds and abilities."
    }
  ];

  const milestones = [
    {
      year: "2020",
      title: "Platform Launch",
      description: "E-LMS was founded with a vision to transform digital education."
    },
    {
      year: "2021",
      title: "First 1000 Users",
      description: "Reached our first milestone of 1000 active users across multiple institutions."
    },
    {
      year: "2022",
      title: "Mobile App Release",
      description: "Launched our mobile application for iOS and Android platforms."
    },
    {
      year: "2023",
      title: "AI Integration",
      description: "Integrated artificial intelligence for personalized learning experiences."
    },
    {
      year: "2024",
      title: "Global Expansion",
      description: "Expanded to serve educational institutions worldwide."
    }
  ];

  const renderIcon = (IconComponent: IconType, className: string) => {
    const Icon = IconComponent as React.ComponentType<{ className?: string }>;
    return <Icon className={className} />;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navigation currentPage="about" />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white opacity-5 rounded-full"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white opacity-5 rounded-full"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">E-LMS</span>
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed">
            We're on a mission to revolutionize education through innovative technology and personalized learning experiences.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                At E-LMS, we believe that education should be accessible, engaging, and effective for everyone. 
                Our platform combines cutting-edge technology with proven educational methodologies to create 
                an environment where learning thrives.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                We empower educators to create meaningful learning experiences and help students achieve their 
                full potential through personalized, interactive, and data-driven education.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {!isAuthenticated && (
                  <Link 
                    to="/register" 
                    className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 text-center flex items-center justify-center gap-2"
                  >
                    Join Our Platform
                    {renderIcon(FaArrowRight, "group-hover:translate-x-1 transition-transform duration-300")}
                  </Link>
                )}
                <Link 
                  to="/contact" 
                  className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-600 hover:text-white transition-all duration-300 text-center"
                >
                  Get in Touch
                </Link>
              </div>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-10 rounded-2xl shadow-xl">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-6">
                  {renderIcon(FaGraduationCap, "text-white text-3xl")}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Key Statistics</h3>
              </div>
              <div className="space-y-6">
                <div className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm">
                  <span className="text-gray-600 font-medium">Active Users</span>
                  <span className="font-bold text-blue-600 text-lg">50,000+</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm">
                  <span className="text-gray-600 font-medium">Institutions</span>
                  <span className="font-bold text-blue-600 text-lg">500+</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm">
                  <span className="text-gray-600 font-medium">Countries</span>
                  <span className="font-bold text-blue-600 text-lg">25+</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm">
                  <span className="text-gray-600 font-medium">Success Rate</span>
                  <span className="font-bold text-blue-600 text-lg">95%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Our Values
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              These core values guide everything we do and shape our commitment to educational excellence.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 text-center border border-gray-100">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
                  {renderIcon(value.icon, "text-white text-2xl")}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Our dedicated team of education and technology experts is committed to transforming the learning experience.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
                  {renderIcon(member.icon, "text-white text-3xl")}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{member.name}</h3>
                <p className="text-blue-600 font-medium mb-4">{member.role}</p>
                <p className="text-gray-600 text-sm leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Our Journey
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              From humble beginnings to a global educational platform, here's our story of growth and innovation.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {milestones.map((milestone, index) => (
              <div key={index} className="group relative">
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105">
                  {/* Year Badge */}
                  <div className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full font-bold text-xl mb-6 shadow-lg">
                    {milestone.year}
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                    {milestone.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-lg">{milestone.description}</p>
                  
                  {/* Decorative Corner */}
                  <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white opacity-5 rounded-full"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            Ready to Transform Education?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto leading-relaxed">
            Join thousands of educators and students who are already experiencing the future of learning with E-LMS.
          </p>
          {!isAuthenticated ? (
            <Link 
              to="/register" 
              className="group inline-flex items-center gap-3 bg-white text-blue-600 px-10 py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              Start Your Journey
              {renderIcon(FaArrowRight, "group-hover:translate-x-1 transition-transform duration-300")}
            </Link>
          ) : (
            <Link 
              to="/" 
              className="group inline-flex items-center gap-3 bg-white text-blue-600 px-10 py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
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

export default AboutPage; 