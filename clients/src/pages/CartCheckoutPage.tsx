import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import Navigation from '../components/Navigation';
import { Footer } from '../components';
import { sslCommerzAPI } from '../services/api';
import { showSuccessAlert, showErrorAlert } from '../utils/sweetAlert';

interface CartItem {
  courseId: string;
  courseTitle: string;
  courseCode: string;
  amount: number;
  intakeId?: string;
  intakeName?: string;
}

interface CartCheckoutData {
  items: CartItem[];
  total: number;
  userId: string;
  userEmail: string;
  userName: string;
}

const CartCheckoutPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { state: cartState, clearCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [checkoutData, setCheckoutData] = useState<CartCheckoutData | null>(null);

  useEffect(() => {
    const cartDataParam = searchParams.get('cartData');

    if (!cartDataParam) {
      showErrorAlert('Error', 'Missing cart information');
      navigate('/courses');
      return;
    }

    if (!isAuthenticated) {
      showErrorAlert('Error', 'Please login to continue with payment');
      navigate('/login');
      return;
    }

    try {
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

      setCheckoutData(updatedCartData);
    } catch (error) {
      console.error('Error parsing cart data:', error);
      showErrorAlert('Error', 'Invalid cart data');
      navigate('/courses');
    } finally {
      setLoading(false);
    }
  }, [searchParams, isAuthenticated, navigate, user]);

  const handlePayment = async () => {
    if (!checkoutData || !user) {
      showErrorAlert('Error', 'Payment details not available');
      return;
    }

    try {
      setProcessing(true);
      
      // Create payment session for cart items
      const response = await sslCommerzAPI.createCartPaymentSession({
        items: checkoutData.items,
        total: checkoutData.total,
        userId: user.id,
        userEmail: user.email,
        userName: `${user.firstName} ${user.lastName}`
      });

      if ((response.data as any).success) {
        const { gatewayPageURL } = (response.data as any).data;
        showSuccessAlert('Success', 'Redirecting to payment gateway...');
        
        // Clear cart after successful payment initiation
        await clearCart();
        
        // Small delay to show the success message
        setTimeout(() => {
          window.location.href = gatewayPageURL;
        }, 1000);
      } else {
        showErrorAlert('Error', 'Failed to create payment session');
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

  if (!checkoutData) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation currentPage="courses" />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Checkout Error</h1>
            <p className="text-gray-600 mb-6">Unable to load checkout information.</p>
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
    <div className="min-h-screen bg-white">
      <Navigation currentPage="courses" />

      {/* Checkout Header */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Secure Checkout
          </h1>
          <p className="text-xl text-blue-100">
            Complete your purchase securely
          </p>
        </div>
      </section>

      {/* Checkout Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
                
                <div className="space-y-4">
                  {checkoutData.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
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

                <div className="border-t pt-4 mt-6">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total:</span>
                    <span className="text-2xl font-bold text-green-600">{formatCurrency(checkoutData.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Section */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Information</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                    <div className="flex items-center mb-2">
                      <span className="text-blue-600 mr-2">👤</span>
                      <span className="font-medium text-blue-900">Customer Details</span>
                    </div>
                    <p className="text-sm text-blue-800">{checkoutData.userName}</p>
                    <p className="text-sm text-blue-800">{checkoutData.userEmail}</p>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
                    <div className="flex items-center mb-2">
                      <span className="text-yellow-600 mr-2">🔒</span>
                      <span className="font-medium text-yellow-900">Secure Payment</span>
                    </div>
                    <p className="text-sm text-yellow-800">
                      Your payment will be processed securely through SSLCommerz payment gateway.
                    </p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-md border border-green-200">
                    <div className="flex items-center mb-2">
                      <span className="text-green-600 mr-2">✅</span>
                      <span className="font-medium text-green-900">What's Included</span>
                    </div>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• Full course access</li>
                      <li>• Lifetime access to course materials</li>
                      <li>• Certificate upon completion</li>
                      <li>• 24/7 support</li>
                    </ul>
                  </div>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={processing}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? 'Processing...' : `Pay ${formatCurrency(checkoutData.total)}`}
                </button>

                <div className="mt-4 text-center">
                  <Link 
                    to="/courses" 
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    ← Back to Courses
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CartCheckoutPage; 