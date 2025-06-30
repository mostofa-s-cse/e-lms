import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navigation from '../components/Navigation';
import { Footer } from '../components';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  level: string;
  category: string;
  rating: number;
  students: number;
  price: number;
  image: string;
}

const CoursesPage = () => {
  const { isAuthenticated } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Sample course data
  const sampleCourses: Course[] = [
    {
      id: '1',
      title: 'Introduction to Web Development',
      description: 'Learn the fundamentals of web development including HTML, CSS, and JavaScript.',
      instructor: 'Dr. Sarah Johnson',
      duration: '8 weeks',
      level: 'Beginner',
      category: 'Programming',
      rating: 4.8,
      students: 1250,
      price: 99,
      image: '💻'
    },
    {
      id: '2',
      title: 'Advanced Data Science',
      description: 'Master data analysis, machine learning, and statistical modeling techniques.',
      instructor: 'Prof. Michael Chen',
      duration: '12 weeks',
      level: 'Advanced',
      category: 'Data Science',
      rating: 4.9,
      students: 890,
      price: 149,
      image: '📊'
    },
    {
      id: '3',
      title: 'Digital Marketing Fundamentals',
      description: 'Learn modern digital marketing strategies and tools for business growth.',
      instructor: 'Emily Rodriguez',
      duration: '6 weeks',
      level: 'Intermediate',
      category: 'Marketing',
      rating: 4.7,
      students: 2100,
      price: 79,
      image: '📱'
    },
    {
      id: '4',
      title: 'Business Management Essentials',
      description: 'Develop essential business management skills for leadership roles.',
      instructor: 'David Thompson',
      duration: '10 weeks',
      level: 'Intermediate',
      category: 'Business',
      rating: 4.6,
      students: 1650,
      price: 119,
      image: '💼'
    },
    {
      id: '5',
      title: 'Creative Writing Workshop',
      description: 'Unlock your creative potential and develop your writing skills.',
      instructor: 'Lisa Anderson',
      duration: '8 weeks',
      level: 'Beginner',
      category: 'Arts',
      rating: 4.5,
      students: 980,
      price: 89,
      image: '✍️'
    },
    {
      id: '6',
      title: 'Mobile App Development',
      description: 'Build native and cross-platform mobile applications.',
      instructor: 'Alex Kumar',
      duration: '14 weeks',
      level: 'Advanced',
      category: 'Programming',
      rating: 4.8,
      students: 750,
      price: 169,
      image: '📱'
    },
    {
      id: '7',
      title: 'Financial Planning & Investment',
      description: 'Learn personal finance, investment strategies, and wealth management.',
      instructor: 'Robert Wilson',
      duration: '8 weeks',
      level: 'Intermediate',
      category: 'Finance',
      rating: 4.7,
      students: 1200,
      price: 109,
      image: '💰'
    },
    {
      id: '8',
      title: 'Graphic Design Masterclass',
      description: 'Master the principles of graphic design and visual communication.',
      instructor: 'Maria Garcia',
      duration: '10 weeks',
      level: 'Intermediate',
      category: 'Arts',
      rating: 4.6,
      students: 1100,
      price: 129,
      image: '🎨'
    }
  ];

  const categories = ['all', 'Programming', 'Data Science', 'Marketing', 'Business', 'Arts', 'Finance'];
  const levels = ['all', 'Beginner', 'Intermediate', 'Advanced'];

  useEffect(() => {
    setCourses(sampleCourses);
    setFilteredCourses(sampleCourses);
  }, []);

  useEffect(() => {
    let filtered = courses;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(course => course.category === selectedCategory);
    }

    // Filter by level
    if (selectedLevel !== 'all') {
      filtered = filtered.filter(course => course.level === selectedLevel);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredCourses(filtered);
  }, [courses, selectedCategory, selectedLevel, searchTerm]);

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="text-yellow-400">★</span>);
    }
    if (hasHalfStar) {
      stars.push(<span key="half" className="text-yellow-400">☆</span>);
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="text-gray-300">☆</span>);
    }

    return stars;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navigation currentPage="courses" />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Explore Our Courses
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
            Discover a wide range of courses designed to help you advance your skills and achieve your goals.
          </p>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-6">
            {/* Search */}
            <div className="md:col-span-2">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Courses
              </label>
              <input
                type="text"
                id="search"
                placeholder="Search by title, description, or instructor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>

            {/* Level Filter */}
            <div>
              <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">
                Level
              </label>
              <select
                id="level"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {levels.map(level => (
                  <option key={level} value={level}>
                    {level === 'all' ? 'All Levels' : level}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Available Courses ({filteredCourses.length})
            </h2>
            <p className="text-gray-600">
              Find the perfect course to advance your skills and knowledge
            </p>
          </div>

          {filteredCourses.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses found</h3>
              <p className="text-gray-600">Try adjusting your search criteria or filters</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCourses.map((course) => (
                <div key={course.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="text-4xl mb-4 text-center">{course.image}</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {course.description}
                    </p>
                    
                    <div className="flex items-center mb-3">
                      <div className="flex items-center mr-4">
                        {renderStars(course.rating)}
                        <span className="ml-1 text-sm text-gray-600">({course.rating})</span>
                      </div>
                      <span className="text-sm text-gray-500">{course.students} students</span>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-600">By {course.instructor}</span>
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {course.level}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-600">{course.duration}</span>
                      <span className="text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded">
                        {course.category}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-blue-600">${course.price}</span>
                      {isAuthenticated ? (
                        <Link 
                          to="/" 
                          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Enroll Now
                        </Link>
                      ) : (
                        <Link 
                          to="/register" 
                          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Get Started
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Learning?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of students who are already advancing their careers with our courses.
          </p>
          {!isAuthenticated ? (
            <Link 
              to="/register" 
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Create Your Account
            </Link>
          ) : (
            <Link 
              to="/" 
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
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

export default CoursesPage; 