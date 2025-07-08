import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navigation from '../components/Navigation';
import { Footer } from '../components';
import { paymentsAPI } from '../services/api';
import { showSuccessAlert, showErrorAlert } from '../utils/sweetAlert';
import { useCart } from '../contexts/CartContext';

interface PaymentDetails {
  courseId: string;
  courseTitle: string;
  courseCode: string;
  amount: number;
  batchId?: string;
  intakeName?: string;
  userId: string;
  userEmail: string;
  userName: string;
}

interface CartPaymentDetails {
  items: Array<{
    courseId: string;
    courseTitle: string;
    courseCode: string;
    amount: number;
    batchId?: string;
    intakeName?: string;
  }>;
  total: number;
  userId: string;
  userEmail: string;
  userName: string;
}

type PaymentMethod = 'CREDIT_CARD' | 'DEBIT_CARD' | 'MOBILE_BANKING' | 'INTERNET_BANKING' | 'CASH' | 'OTHER';

const CustomPaymentGateway = () => {
  const [searchParams] = useSearchParams();
  const { removeFromCart, clearCart, state: cartState } = useCart();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | CartPaymentDetails | null>(null);
  const [isCartPayment, setIsCartPayment] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('CREDIT_CARD');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [transactionId, setTransactionId] = useState('');

  useEffect(() => {
    const cartDataParam = searchParams.get('cartData');
    const courseId = searchParams.get('courseId');
    const amount = searchParams.get('amount');
    const userId = searchParams.get('userId');
    const userEmail = searchParams.get('userEmail');

    if (!isAuthenticated) {
      showErrorAlert('Error', 'Please login to continue with payment');
      navigate('/login');
      return;
    }

    try {
      if (cartDataParam) {
        // Cart payment
        const parsedCartData: CartPaymentDetails = JSON.parse(cartDataParam);
        
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

        // Update cart data with current user info
        const updatedCartData: CartPaymentDetails = {
          ...parsedCartData,
          userId: user?.id || '',
          userEmail: user?.email || '',
          userName: user ? `${user.firstName} ${user.lastName}` : ''
        };

        setPaymentDetails(updatedCartData);
        setIsCartPayment(true);
      } else if (courseId && amount) {
        // Single course payment
        const courseTitle = searchParams.get('courseTitle') || '';
        const courseCode = searchParams.get('courseCode') || '';
        const batchId = searchParams.get('batchId') || undefined;
        const intakeName = searchParams.get('intakeName') || undefined;

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

        const details: PaymentDetails = {
          courseId,
          courseTitle,
          courseCode,
          amount: parseFloat(amount),
          batchId,
          intakeName,
          userId: user?.id || '',
          userEmail: user?.email || '',
          userName: user ? `${user.firstName} ${user.lastName}` : ''
        };

        setPaymentDetails(details);
        setIsCartPayment(false);
      } else {
        showErrorAlert('Error', 'Missing payment information');
        navigate('/courses');
        return;
      }
    } catch (error) {
      console.error('Error parsing payment data:', error);
      showErrorAlert('Error', 'Invalid payment data');
      navigate('/courses');
    } finally {
      setLoading(false);
    }
  }, [searchParams, isAuthenticated, navigate, user]);

  const handlePayment = async () => {
    if (!paymentDetails || !user) {
      showErrorAlert('Error', 'Payment details not available');
      return;
    }

    // Validate payment method specific fields
    if (!validatePaymentFields()) {
      return;
    }

    try {
      setProcessing(true);

      if (isCartPayment) {
        // Handle cart payment
        const cartDetails = paymentDetails as CartPaymentDetails;
        const response = await paymentsAPI.createCartPayment({
          items: cartDetails.items,
          total: cartDetails.total,
          userId: user.id,
          userEmail: user.email,
          userName: `${user.firstName} ${user.lastName}`,
          paymentMethod: selectedPaymentMethod,
          paymentDetails: getPaymentDetails()
        });

        if ((response.data as any).success) {
          showSuccessAlert('Success', 'Payment processed successfully!');
          setTimeout(() => {
            // Remove paid items from cart by finding them in the current cart state
            cartDetails.items.forEach((paidItem: any) => {
              // Find the cart item by courseId and batchId (if available)
              const cartItem = cartState.items.find(item => 
                item.courseId === paidItem.courseId && 
                (!paidItem.batchId || item.batchId === paidItem.batchId)
              );
              if (cartItem) {
                removeFromCart(cartItem.id);
              }
            });

            navigate('/courses');
          }, 1500);
        } else {
          showErrorAlert('Error', 'Failed to process payment');
        }
      } else {
        // Handle single course payment
        const courseDetails = paymentDetails as PaymentDetails;
        
        // Check if this is a free course
        if (courseDetails.amount === 0) {
          const response = await paymentsAPI.createFreeEnrollment({
            courseId: courseDetails.courseId,
            batchId: courseDetails.batchId || ''
          });

          if ((response.data as any).success) {
            showSuccessAlert('Success', 'Free course enrolled successfully!');
            setTimeout(() => {
              // Remove this course from cart if it exists
              const cartItem = cartState.items.find(item => 
                item.courseId === courseDetails.courseId && 
                (!courseDetails.batchId || item.batchId === courseDetails.batchId)
              );
              if (cartItem) {
                removeFromCart(cartItem.id);
              }
              navigate('/courses/');
            }, 1500);
          } else {
            showErrorAlert('Error', 'Failed to enroll in free course');
          }
        } else {
          // Handle paid course
          const response = await paymentsAPI.createPayment({
            courseId: courseDetails.courseId,
            batchId: courseDetails.batchId,
            amount: courseDetails.amount,
            paymentMethod: selectedPaymentMethod,
            paymentDetails: getPaymentDetails()
          });

          if ((response.data as any).success) {
            showSuccessAlert('Success', 'Payment processed successfully!');
            setTimeout(() => {
              // Remove this course from cart if it exists
              const cartItem = cartState.items.find(item => 
                item.courseId === courseDetails.courseId && 
                (!courseDetails.batchId || item.batchId === courseDetails.batchId)
              );
              if (cartItem) {
                removeFromCart(cartItem.id);
              }
              navigate('/courses');
            }, 1500);
          } else {
            showErrorAlert('Error', 'Failed to process payment');
          }
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

  const handleTestPayment = async (status: 'SUCCESS' | 'FAILED' | 'CANCELLED') => {
    if (!paymentDetails || !user) {
      showErrorAlert('Error', 'Payment details not available');
      return;
    }

    try {
      setProcessing(true);

      if (isCartPayment) {
        // Handle cart payment with test status
        const cartDetails = paymentDetails as CartPaymentDetails;
        const response = await paymentsAPI.createCartPayment({
          items: cartDetails.items,
          total: cartDetails.total,
          userId: user.id,
          userEmail: user.email,
          userName: `${user.firstName} ${user.lastName}`,
          paymentMethod: selectedPaymentMethod,
          paymentDetails: getPaymentDetails(),
          testStatus: status // Add test status for backend to handle
        });

        if ((response.data as any).success) {
          if (status === 'SUCCESS') {
            showSuccessAlert('Success', 'Payment processed successfully!');
            setTimeout(() => {
              // Remove paid items from cart by finding them in the current cart state
              cartDetails.items.forEach((paidItem: any) => {
                // Find the cart item by courseId and batchId (if available)
                const cartItem = cartState.items.find(item => 
                  item.courseId === paidItem.courseId && 
                  (!paidItem.batchId || item.batchId === paidItem.batchId)
                );
                if (cartItem) {
                  removeFromCart(cartItem.id);
                }
              });
              navigate('/courses');
            }, 1500);
          } else if (status === 'FAILED') {
            showErrorAlert('Payment Failed', 'Payment processing failed. Please try again.');
            setTimeout(() => {
              navigate('/payment/fail');
            }, 1500);
          } else if (status === 'CANCELLED') {
            showErrorAlert('Payment Cancelled', 'Payment was cancelled by user.');
            setTimeout(() => {
              navigate('/payment/cancel');
            }, 1500);
          }
        } else {
          showErrorAlert('Error', 'Failed to process payment');
        }
      } else {
        // Handle single course payment with test status
        const courseDetails = paymentDetails as PaymentDetails;
        
        if (courseDetails.amount === 0) {
          // Free course - always succeeds
          const response = await paymentsAPI.createFreeEnrollment({
            courseId: courseDetails.courseId,
            batchId: courseDetails.batchId
          });

          if ((response.data as any).success) {
            showSuccessAlert('Success', 'Free course enrolled successfully!');
            setTimeout(() => {
              // Remove this course from cart if it exists
              const cartItem = cartState.items.find(item => 
                item.courseId === courseDetails.courseId && 
                (!courseDetails.batchId || item.batchId === courseDetails.batchId)
              );
              if (cartItem) {
                removeFromCart(cartItem.id);
              }
              navigate('/courses');
            }, 1500);
          } else {
            showErrorAlert('Error', 'Failed to enroll in free course');
          }
        } else {
          // Handle paid course with test status
          const response = await paymentsAPI.createPayment({
            courseId: courseDetails.courseId,
            batchId: courseDetails.batchId,
            amount: courseDetails.amount,
            paymentMethod: selectedPaymentMethod,
            paymentDetails: getPaymentDetails(),
            testStatus: status // Add test status for backend to handle
          });

          if ((response.data as any).success) {
            if (status === 'SUCCESS') {
              showSuccessAlert('Success', 'Payment processed successfully!');
              setTimeout(() => {
                // Remove this course from cart if it exists
                const cartItem = cartState.items.find(item => 
                  item.courseId === courseDetails.courseId && 
                  (!courseDetails.batchId || item.batchId === courseDetails.batchId)
                );
                if (cartItem) {
                  removeFromCart(cartItem.id);
                }
                navigate('/courses');
              }, 1500);
            } else if (status === 'FAILED') {
              showErrorAlert('Payment Failed', 'Payment processing failed. Please try again.');
              setTimeout(() => {
                navigate('/payment/fail');
              }, 1500);
            } else if (status === 'CANCELLED') {
              showErrorAlert('Payment Cancelled', 'Payment was cancelled by user.');
              setTimeout(() => {
                navigate('/payment/cancel');
              }, 1500);
            }
          } else {
            showErrorAlert('Error', 'Failed to process payment');
          }
        }
      }
    } catch (error: any) {
      console.error('Test payment error:', error);
      const message = error.response?.data?.message || 'Failed to process payment';
      showErrorAlert('Error', message);
    } finally {
      setProcessing(false);
    }
  };

  const validatePaymentFields = (): boolean => {
    switch (selectedPaymentMethod) {
      case 'CREDIT_CARD':
      case 'DEBIT_CARD':
        if (!cardNumber || !cardHolderName || !expiryDate || !cvv) {
          showErrorAlert('Error', 'Please fill in all card details');
          return false;
        }
        if (cardNumber.length < 13 || cardNumber.length > 19) {
          showErrorAlert('Error', 'Please enter a valid card number');
          return false;
        }
        if (cvv.length < 3 || cvv.length > 4) {
          showErrorAlert('Error', 'Please enter a valid CVV');
          return false;
        }
        break;
      case 'MOBILE_BANKING':
        if (!mobileNumber) {
          showErrorAlert('Error', 'Please enter your mobile number');
          return false;
        }
        break;
      case 'INTERNET_BANKING':
        if (!bankName) {
          showErrorAlert('Error', 'Please select your bank');
          return false;
        }
        break;
      case 'CASH':
        // No validation needed for cash
        break;
      case 'OTHER':
        if (!transactionId) {
          showErrorAlert('Error', 'Please enter transaction ID');
          return false;
        }
        break;
    }
    return true;
  };

  const getPaymentDetails = () => {
    switch (selectedPaymentMethod) {
      case 'CREDIT_CARD':
      case 'DEBIT_CARD':
        return {
          cardNumber: cardNumber.replace(/\s/g, ''),
          cardHolderName,
          expiryDate,
          cvv
        };
      case 'MOBILE_BANKING':
        return { mobileNumber };
      case 'INTERNET_BANKING':
        return { bankName };
      case 'CASH':
        return { method: 'CASH' };
      case 'OTHER':
        return { transactionId };
      default:
        return {};
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getTotalAmount = () => {
    if (isCartPayment) {
      return (paymentDetails as CartPaymentDetails).total;
    } else {
      return (paymentDetails as PaymentDetails).amount;
    }
  };

  const renderPaymentMethodFields = () => {
    switch (selectedPaymentMethod) {
      case 'CREDIT_CARD':
      case 'DEBIT_CARD':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Card Number
              </label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                placeholder="1234 5678 9012 3456"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={19}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Card Holder Name
              </label>
              <input
                type="text"
                value={cardHolderName}
                onChange={(e) => setCardHolderName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date
                </label>
                <input
                  type="text"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  placeholder="MM/YY"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={5}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CVV
                </label>
                <input
                  type="password"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  placeholder="123"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={4}
                />
              </div>
            </div>
          </div>
        );

      case 'MOBILE_BANKING':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mobile Number
            </label>
            <input
              type="tel"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              placeholder="01XXXXXXXXX"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        );

      case 'INTERNET_BANKING':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Bank
            </label>
            <select
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select your bank</option>
              <option value="Sonali Bank">Sonali Bank</option>
              <option value="Rupali Bank">Rupali Bank</option>
              <option value="Agrani Bank">Agrani Bank</option>
              <option value="Janata Bank">Janata Bank</option>
              <option value="BRAC Bank">BRAC Bank</option>
              <option value="City Bank">City Bank</option>
              <option value="Dutch Bangla Bank">Dutch Bangla Bank</option>
              <option value="Eastern Bank">Eastern Bank</option>
              <option value="Prime Bank">Prime Bank</option>
              <option value="UCB Bank">UCB Bank</option>
            </select>
          </div>
        );

      case 'CASH':
        return (
          <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
            <p className="text-sm text-yellow-800">
              Please contact our office to complete cash payment. You will receive a receipt upon payment.
            </p>
          </div>
        );

      case 'OTHER':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transaction ID
            </label>
            <input
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="Enter transaction ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        );

      default:
        return null;
    }
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

  if (!paymentDetails) {
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
            to="/courses"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Courses
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <h1 className="text-2xl font-bold mb-2">Payment Gateway</h1>
            <p className="text-blue-100">Complete your payment securely</p>
          </div>

          <div className="p-6">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Payment Summary */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Summary</h2>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  {isCartPayment ? (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Cart Items</h3>
                      <div className="space-y-2">
                        {(paymentDetails as CartPaymentDetails).items.map((item, index) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-white rounded border">
                            <div>
                              <div className="font-medium text-gray-900">{item.courseTitle}</div>
                              <div className="text-sm text-gray-600">{item.courseCode}</div>
                              {item.intakeName && (
                                <div className="text-xs text-blue-600">{item.intakeName}</div>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-gray-900">{formatCurrency(item.amount)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="border-t pt-3 mt-3">
                        <div className="flex justify-between">
                          <span className="text-lg font-semibold text-gray-900">Total:</span>
                          <span className="text-2xl font-bold text-blue-600">{formatCurrency(getTotalAmount())}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Course Details</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Course:</span>
                          <span className="font-medium">{(paymentDetails as PaymentDetails).courseTitle}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Code:</span>
                          <span className="font-medium">{(paymentDetails as PaymentDetails).courseCode}</span>
                        </div>
                        {(paymentDetails as PaymentDetails).intakeName && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Batch:</span>
                            <span className="font-medium">{(paymentDetails as PaymentDetails).intakeName}</span>
                          </div>
                        )}
                        <div className="border-t pt-2 mt-2">
                          <div className="flex justify-between">
                            <span className="text-lg font-semibold text-gray-900">Amount:</span>
                            <span className="text-2xl font-bold text-blue-600">{formatCurrency(getTotalAmount())}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Customer Information */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-2">Customer Information</h3>
                  <div className="text-sm text-blue-800">
                    <p><strong>Name:</strong> {paymentDetails.userName}</p>
                    <p><strong>Email:</strong> {paymentDetails.userEmail}</p>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Payment Method</h2>
                  <button
                    onClick={() => navigate(-1)}
                    className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                  >
                    Cancel Payment
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Payment Method
                    </label>
                    <select
                      value={selectedPaymentMethod}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value as PaymentMethod)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="CREDIT_CARD">Credit Card</option>
                      <option value="DEBIT_CARD">Debit Card</option>
                      <option value="MOBILE_BANKING">Mobile Banking</option>
                      <option value="INTERNET_BANKING">Internet Banking</option>
                      <option value="CASH">Cash</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  {renderPaymentMethodFields()}

                  {/* Payment Button */}
                  <button
                    onClick={handlePayment}
                    disabled={processing}
                    className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                  >
                    {processing ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      `Pay ${formatCurrency(getTotalAmount())}`
                    )}
                  </button>

                  <p className="text-xs text-gray-500 text-center mb-4">
                    By clicking "Pay", you agree to our terms and conditions
                  </p>

                  {/* Test Buttons - Only show in development */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="border-t pt-4">
                      <p className="text-xs text-gray-500 text-center mb-3">Test Payment Results:</p>
                      <div className="grid grid-cols-4 gap-2">
                        <button
                          onClick={() => handleTestPayment('SUCCESS')}
                          disabled={processing}
                          className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition-colors text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processing ? 'Processing...' : 'Success'}
                        </button>
                        <button
                          onClick={() => handleTestPayment('FAILED')}
                          disabled={processing}
                          className="bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 transition-colors text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processing ? 'Processing...' : 'Fail'}
                        </button>
                        <button
                          onClick={() => handleTestPayment('CANCELLED')}
                          disabled={processing}
                          className="bg-yellow-600 text-white px-3 py-2 rounded-md hover:bg-yellow-700 transition-colors text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processing ? 'Processing...' : 'Cancel'}
                        </button>
                        <button
                          onClick={() => navigate(-1)}
                          disabled={processing}
                          className="bg-gray-600 text-white px-3 py-2 rounded-md hover:bg-gray-700 transition-colors text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Back
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Information */}
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

export default CustomPaymentGateway; 