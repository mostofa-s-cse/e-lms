import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navigation from '../components/Navigation';
import { Footer } from '../components';
import { coursesAPI, paymentsAPI, enrollmentsAPI } from '../services/api';
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
  batches: Batch[];
}

interface Batch {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  amount: number;
  isActive: boolean;
}

interface PaymentDetails {
  courseId: string;
  courseCode: string;
  batchId?: string;
  amount: number;
  courseTitle: string;
  intakeName?: string;
  originalPrice?: number;
  discount?: number;
}

interface CartItem {
  courseId: string;
  courseTitle: string;
  courseCode: string;
  amount: number;
  batchId?: string;
  intakeName?: string;
}

interface CartCheckoutData {
  items: CartItem[];
  total: number;
  userId: string;
  userEmail: string;
  userName: string;
}

const PaymentCheckoutPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [course, setCourse] = useState<Course | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [cartData, setCartData] = useState<CartCheckoutData | null>(null);
  const [isCartPayment, setIsCartPayment] = useState(false);

  useEffect(() => {
    const courseId = searchParams.get('courseId');
    const batchId = searchParams.get('batchId');
    const amount = searchParams.get('amount');
    const userId = searchParams.get('userId');
    const userEmail = searchParams.get('userEmail');
    const cartDataParam = searchParams.get('cartData');

    if (!isAuthenticated) {
      showErrorAlert('Error', 'Please login to continue with payment');
      navigate('/login');
      return;
    }

    try {
      if (cartDataParam) {
        // Cart payment
        const parsedCartData: CartCheckoutData = JSON.parse(cartDataParam);
        
        // SECURITY: Verify that the logged-in user matches the user in cart data
        if (parsedCartData.userId && user?.id !== parsedCartData.userId) {
          console.warn('User ID mismatch detected');
          showErrorAlert('Error', 'Invalid payment session');
          navigate('/courses');
          return;
        }

        if (parsedCartData.userEmail && user?.email !== parsedCartData.userEmail) {
          console.warn('User email mismatch detected');
          showErrorAlert('Error', 'Invalid payment session');
          navigate('/courses');
          return;
        }

        // Validate cart data
        if (!parsedCartData.items || parsedCartData.items.length === 0) {
          showErrorAlert('Error', 'Cart is empty');
          navigate('/courses');
          return;
        }

        // Update cart data with current user info
        const updatedCartData: CartCheckoutData = {
          ...parsedCartData,
          userId: user?.id || '',
          userEmail: user?.email || '',
          userName: user ? `${user.firstName} ${user.lastName}` : ''
        };

        setCartData(updatedCartData);
        setIsCartPayment(true);
        setLoading(false);
      } else if (courseId && amount) {
        // Single course payment
        // SECURITY: Verify that the logged-in user matches the user in URL params
        if (userId && user?.id !== userId) {
          console.warn('User ID mismatch detected');
          showErrorAlert('Error', 'Invalid payment session');
          navigate('/courses');
          return;
        }

        if (userEmail && user?.email !== userEmail) {
          console.warn('User email mismatch detected');
          showErrorAlert('Error', 'Invalid payment session');
          navigate('/courses');
          return;
        }

        fetchCourseDetails(courseId, batchId, parseFloat(amount));
      } else {
        showErrorAlert('Error', 'Missing payment information');
        navigate('/courses');
        return;
      }
    } catch (error) {
      console.error('Error parsing payment data:', error);
      showErrorAlert('Error', 'Invalid payment data');
      navigate('/courses');
    }
  }, [searchParams, isAuthenticated, navigate, user]);

  const fetchCourseDetails = async (courseId: string, batchId: string | null, amount: number) => {
    try {
      setLoading(true);
      const response = await coursesAPI.getById(courseId);

      if ((response.data as any).success) {
        const courseData = (response.data as any).data;
        setCourse(courseData);

        // Find selected batch if provided
        let selectedIntake: Batch | undefined;
        if (batchId) {
          selectedIntake = courseData.batches?.find((i: Batch) => i.id === batchId);
        }

        // SECURITY: Validate amount on client side as well
        let expectedAmount = 0;
        if (courseData.batches && courseData.batches.length > 0) {
          if (batchId && selectedIntake) {
            expectedAmount = selectedIntake.amount;
          } else {
            expectedAmount = Math.min(...courseData.batches.map((i: Batch) => i.amount));
          }
        } else if (!courseData.isFree) {
          expectedAmount = courseData.price;
        }

        // Check if provided amount matches expected amount
        if (Math.abs(amount - expectedAmount) > 0.01) {
          console.warn(`Amount mismatch detected: Expected ${expectedAmount}, Received ${amount}`);
          showErrorAlert('Error', 'Invalid payment amount');
          navigate('/courses');
          return;
        }

        const details: PaymentDetails = {
          courseId,
          courseCode: courseData.code,
          batchId: batchId || undefined,
          amount: expectedAmount, // Use validated amount
          courseTitle: courseData.title,
          intakeName: selectedIntake?.name,
          originalPrice: courseData.price,
          discount: selectedIntake ? courseData.price - selectedIntake.amount : 0
        };

        setPaymentDetails(details);
      } else {
        showErrorAlert('Error', 'Failed to load course details');
        navigate('/courses');
      }
    } catch (error) {
      console.error('Error fetching course details:', error);
      showErrorAlert('Error', 'Failed to load course details');
      navigate('/courses');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!user) {
      showErrorAlert('Error', 'User session expired');
      navigate('/login');
      return;
    }

    try {
      setProcessing(true);

      if (isCartPayment) {
        // Handle cart payment
        if (!cartData) {
          showErrorAlert('Error', 'Cart data not available');
          return;
        }

        // Redirect to custom payment gateway for cart items
        const paymentData = {
          items: cartData.items,
          total: cartData.total,
          userId: user.id,
          userEmail: user.email,
          userName: `${user.firstName} ${user.lastName}`
        };

        const paymentUrl = `/payment/gateway?cartData=${encodeURIComponent(JSON.stringify(paymentData))}`;
        navigate(paymentUrl);
      } else {
        // Handle single course payment
        if (!paymentDetails || !course) {
          showErrorAlert('Error', 'Payment details not available');
          return;
        }

        // Check if already enrolled
        try {
          const res = await enrollmentsAPI.getByStudentAndCourse(user.id, paymentDetails.courseId);
          const apiRes = res.data as { success: boolean; data?: any };
          if (apiRes && apiRes.success && apiRes.data && apiRes.data.id) {
            showErrorAlert('Already Enrolled', 'You are already enrolled in this course.');
            setProcessing(false);
            return;
          }
        } catch (err: any) {
          if (!(err.response && err.response.status === 404)) {
            // If not 404, treat as not enrolled and proceed
          }
        }

        // Check if this is a free course (amount is 0)
        if (paymentDetails.amount === 0) {
          // For free courses, create enrollment directly
          const response = await paymentsAPI.createFreeEnrollment({
            courseId: paymentDetails.courseId,
            batchId: paymentDetails.batchId
          });

          if ((response.data as any).success) {
            showSuccessAlert('Success', 'Free course enrolled successfully!');
            // Redirect to course details or dashboard after a short delay
            setTimeout(() => {
              navigate(`/courses/${paymentDetails.courseId}`);
            }, 1500);
          } else {
            showErrorAlert('Error', 'Failed to enroll in free course');
          }
        } else {
          // For paid courses, redirect to custom payment gateway
          const paymentData = {
            courseId: paymentDetails.courseId,
            courseTitle: paymentDetails.courseTitle,
            courseCode: paymentDetails.courseCode,
            amount: paymentDetails.amount,
            batchId: paymentDetails.batchId,
            intakeName: paymentDetails.intakeName,
            userId: user.id,
            userEmail: user.email,
            userName: `${user.firstName} ${user.lastName}`
          };

          const paymentUrl = `/payment/gateway?${new URLSearchParams(paymentData as any).toString()}`;
          navigate(paymentUrl);
        }
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      const message = error.response?.data?.message || 'Failed to process payment';
      showErrorAlert('Error', message);
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2
    }).format(amount);
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

  if ((!isCartPayment && (!paymentDetails || !course)) || (isCartPayment && !cartData)) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation currentPage="courses" />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Payment Information Not Found</h1>
            <p className="text-gray-600 mb-6">Unable to load payment details.</p>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage="courses" />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link 
            to={isCartPayment ? "/courses" : `/courses/${paymentDetails?.courseId}`}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to {isCartPayment ? "Courses" : "Course"}
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <h1 className="text-2xl font-bold mb-2">
              {isCartPayment ? 'Cart Checkout' : 'Payment Checkout'}
            </h1>
            <p className="text-blue-100">
              {isCartPayment ? 'Complete your cart purchase' : 'Complete your course enrollment'}
            </p>
          </div>

          <div className="p-6">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Course/Cart Details */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {isCartPayment ? 'Cart Information' : 'Course Information'}
                </h2>
                
                {isCartPayment ? (
                  // Cart items display
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="space-y-4">
                      {cartData?.items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-white">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{item.courseTitle}</h3>
                            <p className="text-sm text-gray-600">{item.courseCode}</p>
                            {item.intakeName && (
                              <p className="text-xs text-blue-600">{item.intakeName}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">{formatCurrency(item.amount)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  // Single course display
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center mb-3">
                      <div className="text-3xl mr-3">
                        {course?.thumbnail ? (
                          <img 
                            src={`http://localhost:4000${course.thumbnail}`} 
                            alt={course.title}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          '📚'
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{course?.title}</h3>
                        <p className="text-sm text-gray-600">{course?.code}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Credits:</span>
                        <span className="font-medium">{course?.credits} credits</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Instructor:</span>
                        <span className="font-medium">{course?.teacher.firstName} {course?.teacher.lastName}</span>
                      </div>
                      {paymentDetails?.intakeName && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Batch:</span>
                          <span className="font-medium">{paymentDetails.intakeName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Payment Information */}
                {isCartPayment ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <span className="text-yellow-600 mr-2">🔒</span>
                      <span className="font-semibold text-yellow-800">Secure Payment</span>
                    </div>
                    <p className="text-sm text-yellow-700 mb-3">
                      Your payment will be processed securely through our custom payment gateway.
                    </p>
                    <div className="text-xs text-yellow-600 space-y-1">
                      <div>• Multiple payment methods available</div>
                      <div>• Secure SSL encryption</div>
                      <div>• Instant payment confirmation</div>
                    </div>
                  </div>
                ) : (
                  <>
                    {paymentDetails?.amount === 0 ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <span className="text-green-600 mr-2">🎉</span>
                          <span className="font-semibold text-green-800">Free Course</span>
                        </div>
                        <p className="text-sm text-green-700 mb-3">
                          This course is completely free! No payment required.
                        </p>
                        <div className="text-xs text-green-600 space-y-1">
                          <div>• Instant enrollment</div>
                          <div>• Full course access</div>
                          <div>• No payment processing</div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <span className="text-yellow-600 mr-2">🔒</span>
                          <span className="font-semibold text-yellow-800">Secure Payment</span>
                        </div>
                        <p className="text-sm text-yellow-700 mb-3">
                          Your payment will be processed securely through our custom payment gateway.
                        </p>
                        <div className="text-xs text-yellow-600 space-y-1">
                          <div>• Multiple payment methods available</div>
                          <div>• Secure SSL encryption</div>
                          <div>• Instant payment confirmation</div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Payment Summary */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Summary</h2>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="space-y-3">
                    {isCartPayment ? (
                      // Cart payment summary
                      <>
                        <div className="space-y-2">
                          {cartData?.items.map((item, index) => (
                            <div key={index} className="flex justify-between">
                              <span className="text-gray-600">{item.courseTitle}:</span>
                              <span className="font-medium">{formatCurrency(item.amount)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="border-t pt-3">
                          <div className="flex justify-between">
                            <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                            <span className="text-2xl font-bold text-blue-600">{formatCurrency(cartData?.total || 0)}</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      // Single course payment summary
                      <>
                        {paymentDetails?.amount === 0 ? (
                          // Free course summary
                          <div className="text-center">
                            <div className="text-4xl mb-2">🎉</div>
                            <div className="text-2xl font-bold text-green-600 mb-2">Free Course!</div>
                            <p className="text-gray-600">No payment required for this course</p>
                          </div>
                        ) : (
                          // Paid course summary
                          <>
                            {paymentDetails?.originalPrice && paymentDetails.originalPrice > (paymentDetails?.amount || 0) && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Original Price:</span>
                                <span className="line-through text-gray-500">{formatCurrency(paymentDetails.originalPrice)}</span>
                              </div>
                            )}
                            
                            {paymentDetails?.discount && paymentDetails.discount > 0 && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Discount:</span>
                                <span className="text-green-600 font-medium">-{formatCurrency(paymentDetails.discount)}</span>
                              </div>
                            )}
                            
                            <div className="border-t pt-3">
                              <div className="flex justify-between">
                                <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                                <span className="text-2xl font-bold text-blue-600">{formatCurrency(paymentDetails?.amount || 0)}</span>
                              </div>
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Payment Button */}
                <button
                  onClick={handlePayment}
                  disabled={processing}
                  className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4 ${
                    isCartPayment 
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : (paymentDetails?.amount === 0 
                        ? 'bg-green-600 text-white hover:bg-green-700' 
                        : 'bg-blue-600 text-white hover:bg-blue-700')
                  }`}
                >
                  {processing ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : isCartPayment ? (
                    `Pay ${formatCurrency(cartData?.total || 0)}`
                  ) : paymentDetails?.amount === 0 ? (
                    'Enroll for Free'
                  ) : (
                    `Pay ${formatCurrency(paymentDetails?.amount || 0)}`
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  By clicking "Pay", you agree to our terms and conditions
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">🔒</div>
            <h3 className="font-semibold text-gray-900 mb-1">Secure Payment</h3>
            <p className="text-sm text-gray-600">Your payment information is encrypted and secure</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">⚡</div>
            <h3 className="font-semibold text-gray-900 mb-1">Instant Access</h3>
            <p className="text-sm text-gray-600">Get immediate access to your course after payment</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">💳</div>
            <h3 className="font-semibold text-gray-900 mb-1">Multiple Methods</h3>
            <p className="text-sm text-gray-600">Credit cards, mobile banking, and more</p>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PaymentCheckoutPage; 