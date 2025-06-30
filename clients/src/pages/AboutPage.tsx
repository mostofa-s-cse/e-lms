import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navigation from '../components/Navigation';
import { Footer } from '../components';

const AboutPage = () => {
  const { isAuthenticated } = useAuth();

  const team = [
    {
      name: "Dr. Sarah Johnson",
      role: "Chief Executive Officer",
      bio: "Former university professor with 15+ years in educational technology",
      image: "👩‍💼"
    },
    {
      name: "Michael Chen",
      role: "Chief Technology Officer",
      bio: "Expert in software development and educational platforms",
      image: "👨‍💻"
    },
    {
      name: "Dr. Emily Rodriguez",
      role: "Head of Education",
      bio: "Curriculum specialist with expertise in online learning methodologies",
      image: "👩‍🏫"
    },
    {
      name: "David Thompson",
      role: "Product Manager",
      bio: "Passionate about creating user-friendly educational experiences",
      image: "👨‍💼"
    }
  ];

  const values = [
    {
      icon: "🎯",
      title: "Excellence",
      description: "We strive for excellence in everything we do, from platform development to user support."
    },
    {
      icon: "🤝",
      title: "Collaboration",
      description: "We believe in the power of collaboration between students, teachers, and technology."
    },
    {
      icon: "💡",
      title: "Innovation",
      description: "We continuously innovate to provide cutting-edge educational solutions."
    },
    {
      icon: "🌍",
      title: "Accessibility",
      description: "We ensure our platform is accessible to learners from all backgrounds and abilities."
    }
  ];

  const milestones = [
    {
      year: "2020",
      title: "Platform Launch",
      description: "EduLMS was founded with a vision to transform digital education."
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

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navigation currentPage="about" />
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            About EduLMS
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
            We're on a mission to revolutionize education through innovative technology and personalized learning experiences.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                At EduLMS, we believe that education should be accessible, engaging, and effective for everyone. 
                Our platform combines cutting-edge technology with proven educational methodologies to create 
                an environment where learning thrives.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                We empower educators to create meaningful learning experiences and help students achieve their 
                full potential through personalized, interactive, and data-driven education.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {!isAuthenticated && (
                  <Link 
                    to="/register" 
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center"
                  >
                    Join Our Platform
                  </Link>
                )}
                <Link 
                  to="/contact" 
                  className="border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-colors text-center"
                >
                  Get in Touch
                </Link>
              </div>
            </div>
            <div className="bg-gray-100 p-8 rounded-lg">
              <div className="text-6xl mb-4">🎓</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Key Statistics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active Users</span>
                  <span className="font-bold text-blue-600">50,000+</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Institutions</span>
                  <span className="font-bold text-blue-600">500+</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Countries</span>
                  <span className="font-bold text-blue-600">25+</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Success Rate</span>
                  <span className="font-bold text-blue-600">95%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These core values guide everything we do and shape our commitment to educational excellence.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our dedicated team of education and technology experts is committed to transforming the learning experience.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="text-6xl mb-4">{member.image}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{member.name}</h3>
                <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                <p className="text-gray-600 text-sm">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Journey
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From humble beginnings to a global educational platform, here's our story of growth and innovation.
            </p>
          </div>
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-blue-600"></div>
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index} className={`relative flex items-center ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                  <div className={`w-5/12 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                      <div className="text-2xl font-bold text-blue-600 mb-2">{milestone.year}</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{milestone.title}</h3>
                      <p className="text-gray-600">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-600 rounded-full border-4 border-white"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Education?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of educators and students who are already experiencing the future of learning with EduLMS.
          </p>
          {!isAuthenticated ? (
            <Link 
              to="/register" 
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Start Your Journey
            </Link>
          ) : (
            <Link 
              to="/" 
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Access Dashboard
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