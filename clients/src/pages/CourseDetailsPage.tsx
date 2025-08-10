import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navigation from '../components/Navigation';
import { Footer } from '../components';
import { coursesAPI, enrollmentsAPI } from '../services/api';
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

const CourseDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const [selectedIntake, setSelectedIntake] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [userEnrollment, setUserEnrollment] = useState<Enrollment | null>(null);
  const [checkingEnrollment, setCheckingEnrollment] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Course Details - E-LMS';
  }, []);

  // Fetch course details (public data - loads for everyone)
  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const courseResponse = await coursesAPI.getById(id);

        if ((courseResponse.data as any).success) {
          setCourse((courseResponse.data as any).data);
        } else {
          throw new Error((courseResponse.data as any).message || 'Failed to load course');
        }
      } catch (error: any) {
        console.error('Error fetching course details:', error);
        setError(error.message || 'Failed to load course details');
        showErrorAlert('Error', 'Failed to load course details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [id]); // Only depend on course ID

  // Check if user is enrolled in this course
  useEffect(() => {
    const checkUserEnrollment = async () => {
      if (!user?.id || !id) return;
      
      try {
        setCheckingEnrollment(true);
        const response = await enrollmentsAPI.getByStudentAndCourse(user.id, id);
        
        if ((response.data as any).success) {
          setUserEnrollment((response.data as any).data);
        }
      } catch (error: any) {
        // If 404, user is not enrolled (this is expected)
        if (error.response?.status !== 404) {
          console.error('Error checking enrollment:', error);
        }
      } finally {
        setCheckingEnrollment(false);
      }
    };

    checkUserEnrollment();
  }, [user?.id, id]);

  const handleEnrollClick = () => {
    if (!course) return;
    
    // Check if user is authenticated
    if (!user) {
      // Redirect to register page for non-authenticated users
      navigate('/register');
      return;
    }
    
    // Check if already enrolled
    if (isEnrolled(course.id)) {
      // Redirect to dashboard if already enrolled
      navigate('/student/courses');
      return;
    }
    
    setSelectedIntake('');
    setShowEnrollmentModal(true);
  };

  const handleEnrollment = async () => {
    if (!course) {
      showErrorAlert('Error', 'No course selected');
      return;
    }

    try {
      setEnrolling(true);

      // Determine the amount to charge
      let amount = 0;
      if (course.intakes?.length > 0) {
        // For courses with intakes, intake selection is required
        if (!selectedIntake) {
          showErrorAlert('Error', 'Please select an intake to continue');
          return;
        }
        const intake = course.intakes.find(i => i.id === selectedIntake);
        if (!intake) {
          showErrorAlert('Error', 'Selected intake not found');
          return;
        }
        amount = intake.amount;
      } else if (!course.isFree) {
        amount = course.price || 0;
      }

      // If course is free, enroll directly
      if (amount === 0) {
        const enrollmentPayload = { courseId: course.id };
        const response = await enrollmentsAPI.create(enrollmentPayload);

        if ((response.data as any).success) {
          showSuccessAlert('Success', 'Successfully enrolled in course!');
          setShowEnrollmentModal(false);
          // Redirect to dashboard after successful enrollment
          navigate('/student/courses');
        } else {
          throw new Error((response.data as any).message || 'Enrollment failed');
        }
      } else {
        // For paid courses, redirect to custom payment gateway
        const paymentData = {
          courseId: course.id,
          courseTitle: course.title,
          courseCode: course.code,
          amount: amount,
          intakeId: selectedIntake || undefined,
          intakeName: selectedIntake ? course.intakes.find(i => i.id === selectedIntake)?.name : undefined,
          userId: user?.id || '',
          userEmail: user?.email || '',
          userName: user ? `${user.firstName} ${user.lastName}` : ''
        };

        // Debug log
        const paymentUrl = `/payment/gateway?${new URLSearchParams(paymentData as any).toString()}`;
        console.log('Redirecting to payment gateway:', paymentUrl);
        console.log('Payment data:', paymentData);
        navigate(paymentUrl);
      }
    } catch (error: any) {
      console.error('Enrollment error:', error);
      const message = error.response?.data?.message || error.message || 'Failed to enroll in course';
      showErrorAlert('Error', message);
    } finally {
      setEnrolling(false);
    }
  };

  const isEnrolled = (courseId: string) => {
    return userEnrollment !== null;
  };

  const getEnrollmentStatus = (courseId: string) => {
    return userEnrollment?.status;
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

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation currentPage="courses" />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Error: {error}</h3>
            <p className="text-gray-600 mb-6">Please try again later or contact support.</p>
            <Link 
              to="/courses" 
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Back to Courses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation currentPage="courses" />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h1>
            <p className="text-gray-600 mb-6">The course you're looking for doesn't exist or has been removed.</p>
            <Link 
              to="/courses" 
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Back to Courses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const enrolled = isEnrolled(course.id);
  const enrollmentStatus = getEnrollmentStatus(course.id);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navigation currentPage="courses" />

      {/* Course Header */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-4">
            <Link 
              to="/courses" 
              className="text-blue-100 hover:text-white transition-colors"
            >
              ← Back to Courses
            </Link>
            </div>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {course.title}
              </h1>
              <p className="text-xl text-blue-100 mb-6">
                {course.description}
              </p>
              <div className="flex items-center mb-4">
                <div className="flex items-center mr-4">
                  {renderStars(4.5)}
                  <span className="ml-1 text-sm text-blue-100">(4.5)</span>
                </div>
                <span className="text-sm text-blue-100">{course._count?.enrollments || 0} students enrolled</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
                  {course.code}
                </span>
                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
                  {course.credits} credits
                </span>
                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
                  {course.credits <= 3 ? 'Beginner' : course.credits <= 6 ? 'Intermediate' : 'Advanced'}
                </span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-8xl mb-4">
                {course.thumbnail ? (
                  <img
                    src={`http://localhost:4000${course.thumbnail}`} 
                    alt={course.title}
                    className="w-32 h-32 mx-auto object-cover rounded-lg shadow-lg"
                  />
                ) : (
                  '📚'
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Details */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">About This Course</h2>
                <p className="text-gray-700 leading-relaxed mb-6">
                  {course.description}
                </p>
                
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Course Code</h3>
                    <p className="text-gray-600">{course.code}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Credits</h3>
                    <p className="text-gray-600">{course.credits} credits</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Level</h3>
                    <p className="text-gray-600">
                      {course.credits <= 3 ? 'Beginner' : course.credits <= 6 ? 'Intermediate' : 'Advanced'}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Status</h3>
            <p className="text-gray-600">
                      {course.isActive ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Course Content</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <span className="text-blue-600 mr-3">📹</span>
                      <span className="text-gray-700">{course._count?.videos || 0} Videos</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-blue-600 mr-3">📝</span>
                      <span className="text-gray-700">{course._count?.notes || 0} Notes</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-blue-600 mr-3">❓</span>
                      <span className="text-gray-700">{course._count?.quizzes || 0} Quizzes</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-blue-600 mr-3">👥</span>
                      <span className="text-gray-700">{course._count?.enrollments || 0} Students</span>
                    </div>
                  </div>
                </div>
          </div>

              {/* Instructor Info */}
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Instructor</h2>
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl text-blue-600 mr-4">
                    {course.teacher?.firstName?.charAt(0) || 'I'}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {course.teacher?.firstName || 'Unknown'} {course.teacher?.lastName || 'Instructor'}
                    </h3>
                    <p className="text-gray-600">{course.teacher?.email || 'No email available'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
                <div className="text-center mb-6">
                  <div className="text-4xl mb-4">
                        {course.thumbnail ? (
                          <img 
                            src={`http://localhost:4000${course.thumbnail}`} 
                            alt={course.title}
                        className="w-20 h-20 mx-auto object-cover rounded"
                          />
                        ) : (
                          '📚'
                        )}
                      </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
                  <div className="text-3xl font-bold text-blue-600 mb-4">
                    {course.intakes?.length > 0 ? (
                      <div className="flex flex-col items-center">
                        <span className="text-green-600">From ${Math.min(...course.intakes.map(i => i.amount))}</span>
                        <span className="text-sm text-gray-500 line-through">${course.price}</span>
                      </div>
                    ) : (
                      course.isFree ? 'Free' : `$${course.price}`
                    )}
                      </div>
                      </div>

                {user ? (
                  checkingEnrollment ? (
                    <div className="w-full bg-gray-100 text-gray-600 px-4 py-3 rounded-md mb-4 text-center">
                      Checking enrollment...
                    </div>
                  ) : enrolled ? (
                    <div className="space-y-3">
                      <div className="bg-green-50 border border-green-200 rounded-md p-3 text-center">
                        <div className="text-green-600 font-semibold mb-1">✅ Enrolled</div>
                        <div className="text-sm text-green-700">
                          Status: {enrollmentStatus || 'Active'}
                        </div>
                        {userEnrollment?.intake && (
                          <div className="text-xs text-green-600 mt-1">
                            Intake: {userEnrollment.intake.name}
                          </div>
                        )}
                      </div>
                      <Link 
                        to="/student/courses" 
                        className="w-full bg-green-600 text-white px-4 py-3 rounded-md hover:bg-green-700 transition-colors inline-block text-center"
                      >
                        Go to Course
                      </Link>
                    </div>
                  ) : (
                    <button
                      onClick={handleEnrollClick}
                      className="w-full bg-blue-600 text-white px-4 py-3 rounded-md hover:bg-blue-700 transition-colors mb-4"
                    >
                      Enroll Now
                    </button>
                  )
                ) : (
                  <Link 
                    to="/register" 
                    className="w-full bg-blue-600 text-white px-4 py-3 rounded-md hover:bg-blue-700 transition-colors mb-4 inline-block text-center"
                  >
                    Get Started
                  </Link>
                )}

                {course.intakes?.length > 0 && (
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-semibold text-gray-900 mb-3">Available Intakes</h4>
                    <div className="space-y-2">
                      {course.intakes.map((intake) => (
                        <div key={intake.id} className="bg-gray-50 p-3 rounded-md">
                          <div className="font-medium text-gray-900">{intake.name}</div>
                          <div className="text-sm text-gray-600">
                            {new Date(intake.startDate).toLocaleDateString()} - {new Date(intake.endDate).toLocaleDateString()}
                          </div>
                          <div className="text-sm font-semibold text-blue-600">${intake.amount}</div>
                      </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enrollment Modal */}
      {showEnrollmentModal && course && !enrolled && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Enroll in {course.title}</h3>
            
            <div className="mb-4">
              {course.intakes?.length ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-2">Available Offers</h4>
                    <div className="space-y-2">
                      {course.intakes.map((intake) => (
                        <div key={intake.id} className="flex justify-between items-center p-2 bg-white rounded border">
                          <div>
                            <div className="font-medium text-gray-900">{intake.name}</div>
                            <div className="text-sm text-gray-600">
                              {new Date(intake.startDate).toLocaleDateString()} - {new Date(intake.endDate).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-green-600">${intake.amount}</div>
                            <div className="text-xs text-gray-500">Special Offer</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 p-2 bg-green-50 rounded border border-green-200">
                      <div className="text-sm text-green-800 mb-3">
                        💡 Select your preferred intake (required):
                      </div>
                  <select
                    value={selectedIntake}
                    onChange={(e) => setSelectedIntake(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        required
                  >
                    <option value="">Choose an intake...</option>
                        {course.intakes.map((intake) => (
                      <option key={intake.id} value={intake.id}>
                            {intake.name} - ${intake.amount} ({new Date(intake.startDate).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                    </div>
                  </div>
                  
                  {/* Payment Checkout Info */}
                  <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                    <div className="flex items-center mb-2">
                      <span className="text-blue-600 mr-2">💳</span>
                      <span className="text-sm font-medium text-blue-800">Payment Checkout</span>
                    </div>
                    <div className="text-xs text-blue-700">
                      You'll be taken to a secure checkout page to complete your payment.
                    </div>
                  </div>
                </div>
              ) : course.isFree ? (
                <div className="text-green-700 font-semibold p-3 bg-green-50 rounded-md border border-green-200">
                  ✅ This course is free and ready for enrollment.
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-blue-700 font-semibold p-3 bg-blue-50 rounded-md border border-blue-200">
                    💳 Course Price: ${course.price}
                  </div>
                  
                  {/* SSLCommerz Payment Info */}
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
                  enrolling || 
                  (course.intakes?.length > 0 && !selectedIntake)
                }
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {enrolling ? 'Enrolling...' : 'Enroll Now'}
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
          <div className="space-y-4">
            <p className="text-gray-300 mb-4">Ready to start learning? Create an account to enroll in courses.</p>
            <Link 
              to="/register" 
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-block"
            >
              Create Your Account
            </Link>
            <div className="text-gray-300">
              <span>Already have an account? </span>
              <Link to="/login" className="text-blue-400 hover:text-blue-300 underline">
                Sign In
            </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default CourseDetailsPage; 