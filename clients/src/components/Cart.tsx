import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { showSuccessAlert, showErrorAlert } from '../utils/sweetAlert';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

const Cart: React.FC<CartProps> = ({ isOpen, onClose }) => {
  const { state, removeFromCart, updateCartItem } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [updatingItem, setUpdatingItem] = useState<string | null>(null);

  // Debug cart state
  console.log('Cart: Current cart state:', state);
  console.log('Cart: Cart items count:', state.items.length);

  // Track cart state changes
  useEffect(() => {
    console.log('Cart: Cart state changed - items:', state.items.length, 'total:', state.total);
  }, [state.items, state.total]);

  const handleCheckout = () => {
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

    // Create checkout data from cart items
    const checkoutData = {
      items: state.items.map(item => ({
        courseId: item.courseId,
        courseTitle: item.title,
        courseCode: item.courseCode || item.courseId, // Use courseCode if available
        amount: item.intakeAmount || item.price,
        intakeId: item.intakeId,
        intakeName: item.intakeName
      })),
      total: state.total,
      userId: user.id,
      userEmail: user.email,
      userName: `${user.firstName} ${user.lastName}`
    };

    // Navigate to cart checkout with cart data
    const checkoutUrl = `/cart/checkout?${new URLSearchParams({
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

  const handleTestRemove = () => {
    if (state.items.length > 0) {
      const firstItem = state.items[0];
      console.log('Cart: Testing remove with first item:', firstItem);
      handleRemoveItem(firstItem.id);
    } else {
      console.log('Cart: No items to test remove');
    }
  };

  const handleIntakeChange = (itemId: string, intakeId: string, intakeName: string, intakeAmount: number) => {
    setUpdatingItem(itemId);
    updateCartItem(itemId, intakeId, intakeName, intakeAmount);
    setTimeout(() => setUpdatingItem(null), 500);
  };

  // Debug function to check cart status
  const debugCartStatus = () => {
    console.log('🛒 Cart Debug Info:');
    console.log('- Items:', state.items.length);
    console.log('- Total:', state.total);
    console.log('- Session ID:', localStorage.getItem('edulms_session_id'));
    console.log('- Cart Data:', localStorage.getItem('edulms_cart'));
    console.log('- Merge Flag:', localStorage.getItem('edulms_merge_cart_on_login'));
    console.log('- User:', user);
    console.log('- Authenticated:', isAuthenticated);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
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
        <div className="flex-1 overflow-y-auto p-4">
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
            <div className="space-y-4">
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
                      
                      {/* Intake Selection */}
                      {item.intakeId && (
                        <div className="mt-2">
                          <select
                            value={item.intakeId}
                            onChange={(e) => {
                              const selectedIntake = e.target.value;
                              if (selectedIntake) {
                                // You might need to get intake details from course data
                                // For now, we'll use placeholder values
                                handleIntakeChange(item.id, selectedIntake, 'Selected Intake', item.intakeAmount || item.price);
                              }
                            }}
                            className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                            disabled={updatingItem === item.id}
                          >
                            <option value={item.intakeId}>{item.intakeName || 'Selected Intake'}</option>
                          </select>
                        </div>
                      )}
                      
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm font-semibold text-green-600">
                          ${item.intakeAmount || item.price}
                        </span>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          Remove
                        </button>
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
          <div className="border-t p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold text-gray-900">Total:</span>
              <span className="text-lg font-bold text-green-600">${state.total}</span>
            </div>
            
            <div className="space-y-2">
              <button
                onClick={handleCheckout}
                className="w-full bg-blue-600 text-white px-4 py-3 rounded-md hover:bg-blue-700 transition-colors font-semibold"
              >
                {isAuthenticated ? 'Proceed to Checkout' : 'Login to Checkout'}
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