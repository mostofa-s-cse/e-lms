import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import Cart from './Cart';
import { ShoppingCart } from 'lucide-react';

interface NavigationProps {
  currentPage?: string;
}

const Navigation: React.FC<NavigationProps> = ({ currentPage = 'home' }) => {
  const { isAuthenticated } = useAuth();
  const { state: cartState, restoreCartFromStorage, shouldPreserveCart, ensureCartPersistence } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Debug cart state
  console.log('Navigation: Cart state:', cartState);
  console.log('Navigation: Cart item count:', cartState.itemCount);
  console.log('Navigation: Cart items:', cartState.items);
  console.log('Navigation: Should preserve cart:', shouldPreserveCart());

  // Ensure cart persistence on navigation
  useEffect(() => {
    ensureCartPersistence();
  }, [ensureCartPersistence]);

  // Check if cart is empty but localStorage has data
  useEffect(() => {
    if (cartState.itemCount === 0) {
      const savedCart = localStorage.getItem('edulms_cart');
      if (savedCart) {
        try {
          const cartData = JSON.parse(savedCart);
          if (cartData && Array.isArray(cartData.items) && cartData.items.length > 0) {
            console.log('Navigation: Cart state is empty but localStorage has data, restoring...');
            restoreCartFromStorage();
          }
        } catch (error) {
          console.error('Navigation: Error checking localStorage cart:', error);
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
          console.log('Navigation: Initial cart restoration from localStorage');
          restoreCartFromStorage();
        }
      } catch (error) {
        console.error('Navigation: Error in initial cart restoration:', error);
      }
    }
  }, [restoreCartFromStorage]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  const closeCart = () => {
    setIsCartOpen(false);
  };

  const navItems = [
    { path: '/', label: 'Home', key: 'home' },
    { path: '/about', label: 'About', key: 'about' },
    { path: '/courses', label: 'Courses', key: 'courses' },
    { path: '/contact', label: 'Contact', key: 'contact' }
  ];

  const authItems = [
    { path: '/login', label: 'Sign In', key: 'login' },
    { path: '/register', label: 'Sign Up', key: 'register' }
  ];

  return (
    <>
      <nav className="bg-white shadow-sm border-b relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-blue-600">
                E-LMS
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.key}
                  to={item.path}
                  className={`${
                    currentPage === item.key
                      ? 'text-blue-600 font-semibold'
                      : 'text-gray-700 hover:text-blue-600'
                  } transition-colors duration-200`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Desktop Auth Buttons and Cart */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Cart Icon */}
              <button
                onClick={toggleCart}
                className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors"
                aria-label="Shopping cart"
              >
                <ShoppingCart />
                {cartState.itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartState.itemCount}
                  </span>
                )}
              </button>

              {isAuthenticated ? (
                <Link 
                  to="/dashboard" 
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className={`${
                      currentPage === 'login'
                        ? 'text-blue-600 font-semibold'
                        : 'text-gray-700 hover:text-blue-600'
                    } transition-colors duration-200`}
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/register" 
                    className={`${
                      currentPage === 'register'
                        ? 'bg-blue-700 text-white'
                        : 'bg-blue-600 text-white'
                    } px-4 py-2 rounded-md hover:bg-blue-700 transition-colors`}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-2">
              {/* Mobile Cart Icon */}
              <button
                onClick={toggleCart}
                className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors"
                aria-label="Shopping cart"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                </svg>
                {cartState.itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartState.itemCount}
                  </span>
                )}
              </button>

              <button
                onClick={toggleMobileMenu}
                className="text-gray-700 hover:text-blue-600 focus:outline-none focus:text-blue-600"
                aria-label="Toggle mobile menu"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isMobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
                {/* Mobile Navigation Links */}
                {navItems.map((item) => (
                  <Link
                    key={item.key}
                    to={item.path}
                    onClick={closeMobileMenu}
                    className={`${
                      currentPage === item.key
                        ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                    } block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200`}
                  >
                    {item.label}
                  </Link>
                ))}
                
                {/* Mobile Auth Buttons */}
                <div className="pt-4 pb-3 border-t border-gray-200">
                  {isAuthenticated ? (
                    <Link
                      to="/dashboard"
                      onClick={closeMobileMenu}
                      className="block w-full text-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Dashboard
                    </Link>
                  ) : (
                    <div className="space-y-2">
                      <Link
                        to="/login"
                        onClick={closeMobileMenu}
                        className={`${
                          currentPage === 'login'
                            ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                        } block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200`}
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/register"
                        onClick={closeMobileMenu}
                        className={`${
                          currentPage === 'register'
                            ? 'bg-blue-700 text-white'
                            : 'bg-blue-600 text-white'
                        } block w-full text-center px-4 py-2 rounded-md hover:bg-blue-700 transition-colors`}
                      >
                        Get Started
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Cart Modal */}
      <Cart isOpen={isCartOpen} onClose={closeCart} />
    </>
  );
};

export default Navigation; 