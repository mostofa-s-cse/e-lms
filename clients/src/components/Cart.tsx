import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { showSuccessAlert, showErrorAlert } from '../utils/sweetAlert';
import { enrollmentsAPI } from '../services/api';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

const Cart: React.FC<CartProps> = ({ isOpen, onClose }) => {
  const { state, removeFromCart, updateCartItem, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [updatingItem, setUpdatingItem] = useState<string | null>(null);

  // Debug cart state
  console.log('Cart: Current cart state:', state);
  console.log('Cart: Cart items count:', state.items.length);

  // Track cart state changes
  useEffect(() => {
    console.log('Cart: Cart state changed - items:', state.items.length, 'total:', state.total);
  }, [state.items, state.total]);

  // Check if payment was completed and clear cart
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const paymentStatus = searchParams.get('paymentStatus');
    const clearedCart = searchParams.get('clearedCart');
    
    // If payment was successful and cart hasn't been cleared yet
    if (paymentStatus === 'success' && clearedCart !== 'true' && state.items.length > 0) {
      console.log('Cart: Payment completed, clearing cart');
      clearCart();
      
      // Update URL to prevent multiple clears
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('clearedCart', 'true');
      window.history.replaceState({}, '', newUrl.toString());
      
      showSuccessAlert('Payment Successful', 'Your cart has been cleared after successful payment!');
    }
  }, [location.search, state.items.length, clearCart]);

  const handleCheckout = async () => {
    if (!isAuthenticated || !user) {
      showErrorAlert('Authentication Required', 'Please login to proceed with checkout');
      onClose();
      navigate('/login');
      return;
    }

    if (state.items.length === 0) {
      showErrorAlert('Empty Cart', 'Please add items to your cart before checkout');
      return;
    }

    // Check enrollment status for each course
    const notEnrolledItems = [];
    for (const item of state.items) {
      try {
        const res = await enrollmentsAPI.getByStudentAndCourse(user.id, item.courseId);
        const apiRes = res.data as { success: boolean; data?: any };
        if (apiRes && apiRes.success && apiRes.data && apiRes.data.id) {
          // Already enrolled
          showErrorAlert('Already Enrolled', `You are already enrolled in ${item.title}`);
        } else {
          notEnrolledItems.push(item);
        }
      } catch (err: any) {
        // If 404, not enrolled; otherwise, treat as not enrolled
        if (err.response && err.response.status === 404) {
          notEnrolledItems.push(item);
        } else {
          notEnrolledItems.push(item);
        }
      }
    }

    if (notEnrolledItems.length === 0) {
      showErrorAlert('Already Enrolled', 'You are already enrolled in all courses in your cart.');
      return;
    }

    // Create checkout data from not enrolled cart items
    const checkoutData = {
      items: notEnrolledItems.map(item => ({
        courseId: item.courseId,
        courseTitle: item.title,
        courseCode: item.courseCode || item.courseId, // Use courseCode if available
        amount: item.intakeAmount || item.price,
        batchId: item.batchId,
        intakeName: item.intakeName
      })),
      total: notEnrolledItems.reduce((sum, item) => sum + (item.intakeAmount || item.price), 0),
      userId: user.id,
      userEmail: user.email,
      userName: `${user.firstName} ${user.lastName}`
    };

    // Navigate to payment checkout with cart data
    const checkoutUrl = `/payment/checkout?${new URLSearchParams({
      cartData: JSON.stringify(checkoutData)
    }).toString()}`;
    
    navigate(checkoutUrl);
    onClose();
  };

  const handleRemoveItem = async (id: string) => {
    console.log('Cart: handleRemoveItem called with ID:', id);
    console.log('Cart: Current cart items before removal:', state.items);
    try {
      await removeFromCart(id);
      showSuccessAlert('Success', 'Item removed from cart');
    } catch (error) {
      console.error('Cart: Error removing item:', error);
      showErrorAlert('Error', 'Failed to remove item from cart');
    }
  };

  const handleIntakeChange = (itemId: string, batchId: string, intakeName: string, intakeAmount: number) => {
    setUpdatingItem(itemId);
    updateCartItem(itemId, batchId, intakeName, intakeAmount);
    setTimeout(() => setUpdatingItem(null), 500);
  };

  const handleSingleItemCheckout = async (item: any) => {
    if (!isAuthenticated || !user) {
      showErrorAlert('Authentication Required', 'Please login to proceed with checkout');
      onClose();
      navigate('/login');
      return;
    }

    // Check enrollment status for this specific course
    try {
      const res = await enrollmentsAPI.getByStudentAndCourse(user.id, item.courseId);
      const apiRes = res.data as { success: boolean; data?: any };
      if (apiRes && apiRes.success && apiRes.data && apiRes.data.id) {
        // Already enrolled
        showErrorAlert('Already Enrolled', `You are already enrolled in ${item.title}`);
        return;
      }
    } catch (err: any) {
      // If 404, not enrolled; otherwise, treat as not enrolled
      if (err.response && err.response.status !== 404) {
        showErrorAlert('Error', 'Failed to check enrollment status');
        return;
      }
    }

    // Create checkout data for single item
    const checkoutData = {
      courseId: item.courseId,
      courseTitle: item.title,
      courseCode: item.courseCode || item.courseId,
      amount: item.intakeAmount || item.price,
      batchId: item.batchId,
      intakeName: item.intakeName,
      userId: user.id,
      userEmail: user.email,
      userName: `${user.firstName} ${user.lastName}`
    };

    // Navigate to payment checkout with single item data
    const checkoutUrl = `/payment/checkout?${new URLSearchParams({
      courseId: checkoutData.courseId,
      courseTitle: checkoutData.courseTitle,
      courseCode: checkoutData.courseCode,
      amount: checkoutData.amount.toString(),
      batchId: checkoutData.batchId || '',
      intakeName: checkoutData.intakeName || '',
      userId: checkoutData.userId,
      userEmail: checkoutData.userEmail
    }).toString()}`;
    
    navigate(checkoutUrl);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
                      <h2 className="text-lg font-semibold text-gray-900">Shopping Cart</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 min-h-0 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {state.items.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🛒</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-600 mb-4">Add some courses to get started!</p>
              <Link
                to="/courses"
                onClick={onClose}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Browse Courses
              </Link>
            </div>
          ) : (
            <div className="space-y-4 pb-2">
              {state.items.map((item) => (
                <div key={item.id} className="border rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        {item.thumbnail ? (
                          <img 
                            src={`http://localhost:4000${item.thumbnail}`} 
                            alt={item.title}
                            className="w-8 h-8 object-cover rounded"
                          />
                        ) : (
                          <span className="text-xl">📚</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {item.title}
                      </h3>
                      <p className="text-xs text-gray-500">
                        By {item.teacher.firstName} {item.teacher.lastName}
                      </p>
                      
                      {/* Batch Selection */}
                      {item.batchId && (
                        <div className="mt-2">
                          <select
                            value={item.batchId}
                            onChange={(e) => {
                              const selectedIntake = e.target.value;
                              if (selectedIntake) {
                                // You might need to get batch details from course data
                                // For now, we'll use placeholder values
                                handleIntakeChange(item.id, selectedIntake, 'Selected Batch', item.intakeAmount || item.price);
                              }
                            }}
                            className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                            disabled={updatingItem === item.id}
                          >
                            <option value={item.batchId}>{item.intakeName || 'Selected Batch'}</option>
                          </select>
                        </div>
                      )}
                      
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm font-semibold text-green-600">
                          BDT {item.intakeAmount || item.price}
                        </span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleSingleItemCheckout(item)}
                            className="text-blue-600 hover:text-blue-800 text-xs font-semibold px-2 py-1 rounded border border-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            Checkout
                          </button>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-500 hover:text-red-700 text-xs px-2 py-1 rounded border border-red-500 hover:bg-red-50 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {state.items.length > 0 && (
          <div className="border-t p-4 flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold text-gray-900">Total:</span>
              <span className="text-lg font-bold text-green-600">BDT {state.total}</span>
            </div>
            
            <div className="text-xs text-gray-500 mb-3 text-center">
              💡 You can checkout individual items or checkout all items together
            </div>
            
            <div className="space-y-2">
              <button
                onClick={handleCheckout}
                className="w-full bg-blue-600 text-white px-4 py-3 rounded-md hover:bg-blue-700 transition-colors font-semibold"
              >
                {isAuthenticated ? 'Checkout All Items' : 'Login to Checkout'}
              </button>
              
              {!isAuthenticated && (
                <Link
                  to="/register"
                  onClick={onClose}
                  className="block w-full text-center bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors text-sm"
                >
                  Create Account
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart; 