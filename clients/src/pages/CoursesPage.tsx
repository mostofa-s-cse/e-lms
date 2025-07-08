import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import Navigation from '../components/Navigation';
import { Footer } from '../components';
import { coursesAPI, enrollmentsAPI, sslCommerzAPI } from '../services/api';
import { showSuccessAlert, showErrorAlert } from '../utils/sweetAlert';

interface Course {
  id: string;
  title: string;
  description: string;
  code: string;
  credits: number;
  price: number;
  isFree: boolean;
  thumbnail?: string;
  isActive: boolean;
  teacher: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  intakes: Intake[];
  _count: {
    enrollments: number;
    notes: number;
    videos: number;
    quizzes: number;
  };
}

interface Intake {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  amount: number;
  isActive: boolean;
}

interface Enrollment {
  id: string;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'DROPPED' | 'SUSPENDED';
  enrolledAt: string;
  course: Course;
  intake: Intake;
}

const CoursesPage = () => {
  const { isAuthenticated, user } = useAuth();
  const { addToCart, isInCart, getCartItem, state: cartState, restoreCartFromStorage, ensureCartPersistence } = useCart();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedIntake, setSelectedIntake] = useState<string>('');
  const [userEnrollments, setUserEnrollments] = useState<Enrollment[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [showFreeOnly, setShowFreeOnly] = useState<boolean>(false);
  const [showAddToCartModal, setShowAddToCartModal] = useState(false);
  const [cartIntake, setCartIntake] = useState<string>('');
  const navigate = useNavigate();

  // Ensure cart persistence
  useEffect(() => {
    ensureCartPersistence();
  }, [ensureCartPersistence]);

  // Check if cart needs to be restored from localStorage
  useEffect(() => {
    if (cartState.itemCount === 0) {
      const savedCart = localStorage.getItem('edulms_cart');
      if (savedCart) {
        try {
          const cartData = JSON.parse(savedCart);
          if (cartData && Array.isArray(cartData.items) && cartData.items.length > 0) {
            console.log('CoursesPage: Cart state is empty but localStorage has data, restoring...');
            restoreCartFromStorage();
          }
        } catch (error) {
          console.error('CoursesPage: Error checking localStorage cart:', error);
        }
      }
    }
  }, [cartState.itemCount, restoreCartFromStorage]);

  // Additional check on component mount to ensure cart is loaded
  useEffect(() => {
    const savedCart = localStorage.getItem('edulms_cart');
    if (savedCart && cartState.itemCount === 0) {
      try {
        const cartData = JSON.parse(savedCart);
        if (cartData && Array.isArray(cartData.items) && cartData.items.length > 0) {
          console.log('CoursesPage: Initial cart restoration from localStorage');
          restoreCartFromStorage();
        }
      } catch (error) {
        console.error('CoursesPage: Error in initial cart restoration:', error);
      }
    }
  }, [restoreCartFromStorage]);

  // Fetch courses and user enrollments
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [coursesResponse, enrollmentsResponse] = await Promise.all([
          coursesAPI.getAll(),
          isAuthenticated ? enrollmentsAPI.getByStudent(user?.id || '') : Promise.resolve({ data: { data: [] } })
        ]);

        if ((coursesResponse.data as any).success) {
          const coursesData = (coursesResponse.data as any).data || [];
          setCourses(coursesData);
          setFilteredCourses(coursesData);
        }

        if (isAuthenticated && (enrollmentsResponse.data as any).success) {
          setUserEnrollments((enrollmentsResponse.data as any).data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        showErrorAlert('Error', 'Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    let filtered = courses;

    // Filter by category (using course code prefix for now)
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(course => course.code.startsWith(selectedCategory));
    }

    // Filter by level (using credits as a proxy for level)
    if (selectedLevel !== 'all') {
      if (selectedLevel === 'Beginner') {
        filtered = filtered.filter(course => course.credits <= 3);
      } else if (selectedLevel === 'Intermediate') {
        filtered = filtered.filter(course => course.credits > 3 && course.credits <= 6);
      } else if (selectedLevel === 'Advanced') {
        filtered = filtered.filter(course => course.credits > 6);
      }
    }

    // Filter by price range
    filtered = filtered.filter(course => {
      const coursePrice = course.isFree ? 0 : course.price;
      return coursePrice >= priceRange[0] && coursePrice <= priceRange[1];
    });

    // Filter by free courses only
    if (showFreeOnly) {
      filtered = filtered.filter(course => course.isFree);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.teacher.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.teacher.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredCourses(filtered);
  }, [courses, selectedCategory, selectedLevel, searchTerm, priceRange, showFreeOnly]);

  const handleEnrollClick = (course: Course) => {
    setSelectedCourse(course);
    setSelectedIntake('');
    setShowEnrollmentModal(true);
  };

  const handleAddToCartClick = (course: Course) => {
    setSelectedCourse(course);
    setCartIntake('');
    setShowAddToCartModal(true);
  };

  const handleAddToCart = async () => {
    if (!selectedCourse) {
      showErrorAlert('Error', 'No course selected');
      return;
    }

    try {
      console.log('CoursesPage: handleAddToCart called for course:', selectedCourse.title);
      
      // Determine the amount and intake details
      let amount = selectedCourse.price;
      let intakeId: string | undefined;
      let intakeName: string | undefined;

      if (selectedCourse.intakes?.length > 0) {
        if (cartIntake) {
          const intake = selectedCourse.intakes.find(i => i.id === cartIntake);
          if (intake) {
            amount = intake.amount;
            intakeId = intake.id;
            intakeName = intake.name;
          }
        } else {
          // Use the minimum intake amount if no specific intake selected
          const minIntake = selectedCourse.intakes.reduce((min, current) => 
            current.amount < min.amount ? current : min
          );
          amount = minIntake.amount;
          intakeId = minIntake.id;
          intakeName = minIntake.name;
        }
      }

      const cartItem = {
        courseId: selectedCourse.id,
        title: selectedCourse.title,
        price: amount,
        isFree: selectedCourse.isFree,
        thumbnail: selectedCourse.thumbnail,
        teacher: {
          firstName: selectedCourse.teacher.firstName,
          lastName: selectedCourse.teacher.lastName
        },
        courseCode: selectedCourse.code,
        intakeId,
        intakeName,
        intakeAmount: amount
      };

      console.log('CoursesPage: Adding item to cart:', cartItem);

      // Add to cart
      await addToCart(cartItem);

      showSuccessAlert('Success', 'Course added to cart!');
      setShowAddToCartModal(false);
    } catch (error) {
      console.error('Error adding to cart:', error);
      showErrorAlert('Error', 'Failed to add course to cart');
    }
  };

  const handleEnrollment = async () => {
    if (!selectedCourse) {
      showErrorAlert('Error', 'No course selected');
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      showErrorAlert('Error', 'Please login to enroll in courses');
      return;
    }

    try {
      setEnrolling(selectedCourse.id);

      // Determine the amount to charge
      let amount = 0;
      if (selectedCourse.intakes?.length > 0) {
        if (selectedIntake) {
          const intake = selectedCourse.intakes.find(i => i.id === selectedIntake);
          amount = intake?.amount || 0;
        } else {
          // Use the minimum intake amount if no specific intake selected
          amount = Math.min(...selectedCourse.intakes.map(i => i.amount));
        }
      } else if (!selectedCourse.isFree) {
        amount = selectedCourse.price || 0;
      }


        // Redirect to custom payment gateway for all courses (including free ones)
        const paymentData = {
          courseId: selectedCourse.id,
          courseTitle: selectedCourse.title,
          courseCode: selectedCourse.code,
          amount: amount,
          intakeId: selectedIntake && selectedIntake !== 'No Intake' && selectedIntake !== 'undefined' ? selectedIntake : null,
          intakeName: selectedIntake ? selectedCourse.intakes.find(i => i.id === selectedIntake)?.name : null,
          userId: user.id,
          userEmail: user.email,
          userName: `${user.firstName} ${user.lastName}`
        };
        

        // Debug log
        const paymentUrl = `/payment/gateway?${new URLSearchParams(paymentData as any).toString()}`;
        console.log('Redirecting to payment gateway:', paymentUrl);
        console.log('Payment data:', paymentData);
        navigate(paymentUrl);
    } catch (error: any) {
      console.error('Enrollment error:', error);
      const message = error.response?.data?.message || 'Failed to enroll in course';
      showErrorAlert('Error', message);
    } finally {
      setEnrolling(null);
    }
  };

  const isEnrolled = (courseId: string) => {
    return userEnrollments.some(enrollment => 
      enrollment.course.id === courseId && (enrollment.status === 'ACTIVE' || enrollment.status === 'PENDING')
    );
  };

  const getEnrollmentStatus = (courseId: string) => {
    const enrollment = userEnrollments.find(e => e.course.id === courseId);
    return enrollment?.status;
  };

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

  const categories = ['all', 'CS', 'MATH', 'BUS', 'ENG', 'PHY', 'CHEM', 'EE', 'HRM', 'MKT'];
  const levels = ['all', 'Beginner', 'Intermediate', 'Advanced'];

  // Calculate max price for price range
  const maxPrice = Math.max(...courses.map(course => course.price || 0), 1000);
  
  // Update price range when courses load
  useEffect(() => {
    if (courses.length > 0) {
      const maxCoursePrice = Math.max(...courses.map(course => course.price || 0));
      if (maxCoursePrice > priceRange[1]) {
        setPriceRange([0, Math.ceil(maxCoursePrice * 1.1)]); // Add 10% buffer
      }
    }
  }, [courses]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation currentPage="courses" />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

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
          <div className="grid md:grid-cols-5 gap-6">
            {/* Search */}
            <div className="md:col-span-2">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Courses
              </label>
              <input
                type="text"
                id="search"
                placeholder="Search by title, description, instructor, or code..."
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

            {/* Price Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range
              </label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                    className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 1000])}
                    className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="text-xs text-gray-500">
                  BDT {priceRange[0]} - BDT {priceRange[1]}
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="freeOnly"
                    checked={showFreeOnly}
                    onChange={(e) => setShowFreeOnly(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="freeOnly" className="ml-2 text-sm text-gray-700">
                    Free courses only
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          {/* Reset Filters Button */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedLevel('all');
                setSearchTerm('');
                setPriceRange([0, maxPrice]);
                setShowFreeOnly(false);
              }}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Reset All Filters
            </button>
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
              {(filteredCourses || []).map((course) => {
                if (!course || !course.id) {
                  console.warn('Invalid course data:', course);
                  return null;
                }
                const enrolled = isEnrolled(course.id);
                const enrollmentStatus = getEnrollmentStatus(course.id);
                
                return (
                  <div key={course.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="p-6">
                      <div className="text-4xl mb-4 text-center">
                        {course.thumbnail ? (
                          <img 
                            src={`http://localhost:4000${course.thumbnail}`} 
                            alt={course.title}
                            className="w-16 h-16 mx-auto object-cover rounded"
                          />
                        ) : (
                          '📚'
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {course.description}
                      </p>
                      
                      <div className="flex items-center mb-3">
                        <div className="flex items-center mr-4">
                          {renderStars(4.5)}
                          <span className="ml-1 text-sm text-gray-600">(4.5)</span>
                        </div>
                        <span className="text-sm text-gray-500">{course._count?.enrollments || 0} students</span>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-gray-600">
                          By {course.teacher?.firstName || 'Unknown'} {course.teacher?.lastName || 'Instructor'}
                        </span>
                        <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {course.credits <= 3 ? 'Beginner' : course.credits <= 6 ? 'Intermediate' : 'Advanced'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-gray-600">{course.credits} credits</span>
                        <span className="text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded">
                          {course.code}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <div className="flex flex-col">
                          {course.intakes?.length > 0 ? (
                            <>
                              <span className="text-lg font-bold text-green-600">
                                From BDT {Math.min(...course.intakes.map(i => i.amount))}
                              </span>
                              <span className="text-sm text-gray-500 line-through">
                                BDT {course.price}
                              </span>
                            </>
                          ) : (
                            <span className="text-2xl font-bold text-blue-600">
                              {course.isFree ? 'Free' : `BDT ${course.price}`}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col space-y-2">
                          {isInCart(course.id) ? (
                            <span className="bg-green-100 text-green-800 px-4 py-2 rounded-md text-sm text-center">
                              In Cart
                            </span>
                          ) : isAuthenticated ? (
                            enrolled ? (
                              <span className="bg-green-100 text-green-800 px-4 py-2 rounded-md text-sm">
                                {enrollmentStatus === 'COMPLETED' ? 'Completed' : 
                                 enrollmentStatus === 'PENDING' ? 'Payment Pending' : 'Enrolled'}
                              </span>
                            ) : (
                              <div className="flex flex-col space-y-1">
                                <button
                                  onClick={() => handleEnrollClick(course)}
                                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
                                >
                                  Enroll Now
                                </button>
                                <button
                                  onClick={() => handleAddToCartClick(course)}
                                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors text-sm"
                                >
                                  Add to Cart
                                </button>
                              </div>
                            )
                          ) : (
                            <div className="flex flex-col space-y-1">
                              <Link 
                                to="/register" 
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-center text-sm"
                              >
                                Get Started
                              </Link>
                              <button
                                onClick={() => handleAddToCartClick(course)}
                                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors text-sm"
                              >
                                Add to Cart
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Link 
                          to={`/courses/${course.id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                        >
                          View Details →
                        </Link>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">{course._count?.videos || 0} videos</span>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-500">{course._count?.quizzes || 0} quizzes</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Enrollment Modal */}
      {showEnrollmentModal && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Enroll in {selectedCourse.title}</h3>
            
            <div className="mb-4">
              {selectedCourse.intakes?.length ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-2">Available Offers</h4>
                    <div className="space-y-2">
                      {selectedCourse.intakes.map((intake) => (
                        <div key={intake.id} className="flex justify-between items-center p-2 bg-white rounded border">
                          <div>
                            <div className="font-medium text-gray-900">{intake.name}</div>
                            <div className="text-sm text-gray-600">
                              {new Date(intake.startDate).toLocaleDateString()} - {new Date(intake.endDate).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-green-600">BDT {intake.amount}</div>
                            <div className="text-xs text-gray-500">Special Offer</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 p-2 bg-green-50 rounded border border-green-200">
                      <div className="text-sm text-green-800 mb-3">
                        💡 Select your preferred intake (optional):
                      </div>
                      <select
                        value={selectedIntake}
                        onChange={(e) => setSelectedIntake(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      >
                        <option value="">Choose an intake (optional)...</option>
                        {selectedCourse.intakes.map((intake) => (
                          <option key={intake.id} value={intake.id}>
                            {intake.name} - BDT {intake.amount} ({new Date(intake.startDate).toLocaleDateString()})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  {/* Payment Checkout Info */}
                  <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
                    <div className="flex items-center mb-2">
                      <span className="text-yellow-600 mr-2">🔒</span>
                      <span className="text-sm font-medium text-yellow-800">Secure Payment Checkout</span>
                    </div>
                    <div className="text-xs text-yellow-700">
                      You'll be redirected to Checkout page for secure payment processing.
                    </div>
                  </div>
                </div>
              ) : selectedCourse.isFree ? (
                <div className="text-green-700 font-semibold p-3 bg-green-50 rounded-md border border-green-200">
                  ✅ This course is free and ready for enrollment.
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-blue-700 font-semibold p-3 bg-blue-50 rounded-md border border-blue-200">
                    💳 Course Price: BDT {selectedCourse.price}
                  </div>
                  
                  {/* Payment Checkout Info */}
                  <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
                    <div className="flex items-center mb-2">
                      <span className="text-yellow-600 mr-2">🔒</span>
                      <span className="text-sm font-medium text-yellow-800">Secure Payment Checkout</span>
                    </div>
                    <div className="text-xs text-yellow-700">
                      You'll be redirected to Checkout page for secure payment processing.
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowEnrollmentModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEnrollment}
                disabled={
                  enrolling === selectedCourse.id
                }
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {enrolling === selectedCourse.id ? 'Enrolling...' : 'Enroll Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add to Cart Modal */}
      {showAddToCartModal && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Add to Cart: {selectedCourse.title}</h3>
            
            <div className="mb-4">
              {selectedCourse.intakes?.length ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-2">Available Offers</h4>
                    <div className="space-y-2">
                      {selectedCourse.intakes.map((intake) => (
                        <div key={intake.id} className="flex justify-between items-center p-2 bg-white rounded border">
                          <div>
                            <div className="font-medium text-gray-900">{intake.name}</div>
                            <div className="text-sm text-gray-600">
                              {new Date(intake.startDate).toLocaleDateString()} - {new Date(intake.endDate).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-green-600">BDT {intake.amount}</div>
                            <div className="text-xs text-gray-500">Special Offer</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 p-2 bg-green-50 rounded border border-green-200">
                      <div className="text-sm text-green-800 mb-3">
                        💡 Select your preferred intake (optional):
                      </div>
                      <select
                        value={cartIntake}
                        onChange={(e) => setCartIntake(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      >
                        <option value="">Choose an intake (optional)...</option>
                        {selectedCourse.intakes.map((intake) => (
                          <option key={intake.id} value={intake.id}>
                            {intake.name} - BDT {intake.amount} ({new Date(intake.startDate).toLocaleDateString()})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ) : selectedCourse.isFree ? (
                <div className="text-green-700 font-semibold p-3 bg-green-50 rounded-md border border-green-200">
                  ✅ This course is free and ready to add to cart.
                </div>
              ) : (
                <div className="text-blue-700 font-semibold p-3 bg-blue-50 rounded-md border border-blue-200">
                  💳 Course Price: BDT {selectedCourse.price}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowAddToCartModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddToCart}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}

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