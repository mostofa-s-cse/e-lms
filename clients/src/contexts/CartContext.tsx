import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';

interface CartItem {
  id: string;
  courseId: string;
  title: string;
  price: number;
  isFree: boolean;
  thumbnail?: string;
  teacher: {
    firstName: string;
    lastName: string;
  };
  courseCode?: string;
  intakeId?: string;
  intakeName?: string;
  intakeAmount?: number;
}

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_ITEM'; payload: { id: string; intakeId?: string; intakeName?: string; intakeAmount?: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartState }
  | { type: 'SYNC_WITH_SERVER'; payload: CartState };

interface CartContextType {
  state: CartState;
  addToCart: (item: Omit<CartItem, 'id'>) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  updateCartItem: (id: string, intakeId?: string, intakeName?: string, intakeAmount?: number) => void;
  clearCart: () => Promise<void>;
  isInCart: (courseId: string) => boolean;
  getCartItem: (courseId: string) => CartItem | undefined;
  restoreCartFromStorage: () => boolean;
  shouldPreserveCart: () => boolean;
  syncCartOnLogin: (userId: string) => void;
  preserveCartOnLogout: () => void;
  ensureCartPersistence: () => void;
  syncWithServer: (userId?: string, sessionId?: string) => Promise<void>;
  mergeGuestCart: (userId: string) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  console.log('CartProvider: Reducer called with action:', action.type, action);
  
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.courseId === action.payload.courseId);
      if (existingItem) {
        console.log('CartProvider: Item already in cart, skipping add');
        return state; // Don't add duplicate courses
      }
      
      const newItems = [...state.items, action.payload];
      const total = newItems.reduce((sum, item) => sum + (item.intakeAmount || item.price), 0);
      
      const newState = {
        items: newItems,
        total,
        itemCount: newItems.length
      };
      
      console.log('CartProvider: New state after ADD_ITEM:', newState);
      return newState;
    }
    
    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.id !== action.payload);
      const total = newItems.reduce((sum, item) => sum + (item.intakeAmount || item.price), 0);
      
      const newState = {
        items: newItems,
        total,
        itemCount: newItems.length
      };
      
      console.log('CartProvider: New state after REMOVE_ITEM:', newState);
      return newState;
    }
    
    case 'UPDATE_ITEM': {
      const newItems = state.items.map(item => 
        item.id === action.payload.id 
          ? { 
              ...item, 
              intakeId: action.payload.intakeId,
              intakeName: action.payload.intakeName,
              intakeAmount: action.payload.intakeAmount
            }
          : item
      );
      const total = newItems.reduce((sum, item) => sum + (item.intakeAmount || item.price), 0);
      
      const newState = {
        items: newItems,
        total,
        itemCount: newItems.length
      };
      
      console.log('CartProvider: New state after UPDATE_ITEM:', newState);
      return newState;
    }
    
    case 'CLEAR_CART':
      console.log('CartProvider: Clearing cart');
      return {
        items: [],
        total: 0,
        itemCount: 0
      };
      
    case 'LOAD_CART':
      console.log('CartProvider: Loading cart state:', action.payload);
      return action.payload;
      
    case 'SYNC_WITH_SERVER':
      console.log('CartProvider: Syncing cart with server:', action.payload);
      return action.payload;
      
    default:
      return state;
  }
};

const CART_STORAGE_KEY = 'edulms_cart';
const CART_PRESERVE_FLAG = 'edulms_cart_preserve';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    itemCount: 0
  });

  const { setOnLoginSuccess, user, isAuthenticated } = useAuth();

  // Generate session ID for guest users if not exists
  useEffect(() => {
    const sessionId = localStorage.getItem('edulms_session_id');
    if (!sessionId) {
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('edulms_session_id', newSessionId);
      console.log('CartProvider: Generated new session ID:', newSessionId);
    }
  }, []);

  // Debug state changes
  console.log('CartProvider: State changed:', state);

  // Track cart state changes
  useEffect(() => {
    console.log('CartProvider: Cart state updated - items:', state.items.length, 'total:', state.total);
  }, [state.items, state.total]);

  // Set up login success callback
  useEffect(() => {
    setOnLoginSuccess(async (userId: string) => {
      console.log('CartProvider: User logged in, merging guest cart with user cart for user:', userId);
      
      // Get the current session ID for guest cart
      const sessionId = localStorage.getItem('edulms_session_id');
      
      // Check if this is a first-time login after registration
      const shouldMergeOnLogin = localStorage.getItem('edulms_merge_cart_on_login');
      
      // Always attempt to merge if we have a session ID, regardless of current state
      if (sessionId) {
        try {
          console.log('CartProvider: Attempting to merge guest cart with user cart...');
          
          // Call the merge API to move guest cart items to user cart
          const response = await cartAPI.mergeGuestCart({ userId, sessionId });
          const responseData = response.data as any;
          
          if (responseData.success) {
            console.log('CartProvider: Guest cart merged successfully with user cart');
            
            // Clear the merge flag since we've successfully merged
            localStorage.removeItem('edulms_merge_cart_on_login');
            
            // Reload cart from server to get the merged data
            const cartResponse = await cartAPI.getCart({ userId });
            const cartData = cartResponse.data as any;
            
            if (cartData.success) {
              console.log('CartProvider: Updated cart with merged data:', cartData.data);
              dispatch({ type: 'SYNC_WITH_SERVER', payload: cartData.data });
            }
          } else {
            console.warn('CartProvider: Failed to merge guest cart:', responseData.message);
            // Fallback: try to sync with server to get user's existing cart
            await syncWithServer(userId, sessionId);
          }
        } catch (error) {
          console.error('CartProvider: Error merging guest cart:', error);
          // Fallback: try to sync with server to get user's existing cart
          await syncWithServer(userId, sessionId);
        }
      } else {
        console.log('CartProvider: No session ID found, syncing with server for user cart');
        // Just sync with server to get user's existing cart
        await syncWithServer(userId, undefined);
      }
    });
  }, [setOnLoginSuccess]);

  // Load cart from localStorage and server on mount
  useEffect(() => {
    const loadCart = async () => {
      console.log('CartProvider: Loading cart from localStorage and server...');
      
      // First try to load from server
      try {
        const sessionId = localStorage.getItem('edulms_session_id');
        const userId = isAuthenticated && user ? user.id : undefined;
        
        if (userId || sessionId) {
          console.log('CartProvider: Attempting to load cart from server...');
          const response = await cartAPI.getCart({ 
            userId, 
            sessionId: sessionId || undefined 
          });
          const responseData = response.data as any;
          
          if (responseData.success) {
            console.log('CartProvider: Cart loaded from server with', responseData.data.items.length, 'items');
            dispatch({ type: 'LOAD_CART', payload: responseData.data });
            localStorage.setItem(CART_PRESERVE_FLAG, 'true');
            return;
          }
        }
      } catch (error) {
        console.error('CartProvider: Error loading cart from server:', error);
      }
      
      // Fallback to localStorage only if user is not authenticated
      if (!isAuthenticated) {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (savedCart) {
          try {
            const cartData = JSON.parse(savedCart);
            console.log('CartProvider: Loaded cart data from localStorage:', cartData);
            
            // Validate cart data structure
            if (cartData && Array.isArray(cartData.items) && cartData.items.length > 0) {
              dispatch({ type: 'LOAD_CART', payload: cartData });
              // Set preserve flag to prevent accidental clearing
              localStorage.setItem(CART_PRESERVE_FLAG, 'true');
              console.log('CartProvider: Cart loaded from localStorage with', cartData.items.length, 'items');
            } else {
              console.warn('CartProvider: Invalid cart data structure or empty cart, clearing');
              localStorage.removeItem(CART_STORAGE_KEY);
              localStorage.removeItem(CART_PRESERVE_FLAG);
            }
          } catch (error) {
            console.error('Error loading cart from localStorage:', error);
            // Clear corrupted cart data
            localStorage.removeItem(CART_STORAGE_KEY);
            localStorage.removeItem(CART_PRESERVE_FLAG);
          }
        } else {
          console.log('CartProvider: No saved cart found in localStorage');
        }
      } else {
        console.log('CartProvider: User is authenticated, relying on server cart data');
      }
    };
    
    loadCart();
  }, [isAuthenticated, user]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    console.log('CartProvider: Saving cart to localStorage:', state);
    try {
      // Always save the current state to localStorage
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
      
      if (state.items.length > 0) {
        localStorage.setItem(CART_PRESERVE_FLAG, 'true');
        console.log('CartProvider: Cart saved with', state.items.length, 'items');
      } else {
        // Keep the preserve flag even when cart is empty to maintain session
        console.log('CartProvider: Cart is empty, maintaining preserve flag');
      }
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [state]);

  // Add beforeunload event listener to ensure cart is saved on page refresh/close
  useEffect(() => {
    const handleBeforeUnload = () => {
      console.log('CartProvider: Page unloading, ensuring cart is saved');
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
        localStorage.setItem(CART_PRESERVE_FLAG, 'true');
      } catch (error) {
        console.error('CartProvider: Error saving cart on page unload:', error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [state]);

  const addToCart = async (item: Omit<CartItem, 'id'>) => {
    console.log('CartProvider: Adding item to cart:', item);
    
    try {
      // Get session ID for guest users or user ID for logged-in users
      const sessionId = localStorage.getItem('edulms_session_id');
      const userId = isAuthenticated && user ? user.id : undefined;
      
      console.log('CartProvider: Adding to cart with userId:', userId, 'sessionId:', sessionId);
      
      // Call server API to add item to cart
      const response = await cartAPI.addToCart({
        userId,
        sessionId: sessionId || undefined,
        item: {
          courseId: item.courseId,
          title: item.title,
          price: item.price,
          isFree: item.isFree,
          thumbnail: item.thumbnail,
          teacher: item.teacher,
          courseCode: item.courseCode,
          intakeId: item.intakeId,
          intakeName: item.intakeName,
          intakeAmount: item.intakeAmount
        }
      });
      
      const responseData = response.data as any;
      if (responseData.success) {
        console.log('CartProvider: Item added to server cart successfully');
        // Update local state with the server response
        const cartItem: CartItem = {
          ...item,
          id: responseData.data.id
        };
        dispatch({ type: 'ADD_ITEM', payload: cartItem });
      } else {
        console.error('CartProvider: Failed to add item to server cart:', responseData.message);
        // Fallback to local state only
        const cartItem: CartItem = {
          ...item,
          id: `${item.courseId}_${Date.now()}`
        };
        dispatch({ type: 'ADD_ITEM', payload: cartItem });
      }
    } catch (error) {
      console.error('CartProvider: Error adding item to server cart:', error);
      // Fallback to local state only if server call fails
      const cartItem: CartItem = {
        ...item,
        id: `${item.courseId}_${Date.now()}`
      };
      dispatch({ type: 'ADD_ITEM', payload: cartItem });
    }
  };

  const removeFromCart = async (id: string) => {
    console.log('CartProvider: removeFromCart called with ID:', id);
    console.log('CartProvider: Current cart items before removal:', state.items);
    
    try {
      // Get session ID for guest users or user ID for logged-in users
      const sessionId = localStorage.getItem('edulms_session_id');
      const userId = isAuthenticated && user ? user.id : undefined;
      
      console.log('CartProvider: Removing from cart with userId:', userId, 'sessionId:', sessionId);
      
      // Call server API to remove item from cart
      const response = await cartAPI.removeFromCart(id, { 
        userId, 
        sessionId: sessionId || undefined 
      });
      
      const responseData = response.data as any;
      if (responseData.success) {
        console.log('CartProvider: Item removed from server cart successfully');
        // Update local state
        dispatch({ type: 'REMOVE_ITEM', payload: id });
        
        // Check if this is the last item being removed
        const isLastItem = state.items.length === 1;
        if (isLastItem) {
          console.log('CartProvider: Last item removed, maintaining preserve flag');
          localStorage.setItem(CART_PRESERVE_FLAG, 'true');
        }
      } else {
        console.error('CartProvider: Failed to remove item from server cart:', responseData.message);
        // Fallback to local state only
        dispatch({ type: 'REMOVE_ITEM', payload: id });
      }
    } catch (error) {
      console.error('CartProvider: Error removing item from server cart:', error);
      // Fallback to local state only if server call fails
      dispatch({ type: 'REMOVE_ITEM', payload: id });
    }
  };

  const updateCartItem = (id: string, intakeId?: string, intakeName?: string, intakeAmount?: number) => {
    dispatch({ 
      type: 'UPDATE_ITEM', 
      payload: { id, intakeId, intakeName, intakeAmount } 
    });
  };

  const clearCart = async () => {
    console.log('CartProvider: clearCart called - this will clear the cart');
    
    try {
      // Get session ID for guest users or user ID for logged-in users
      const sessionId = localStorage.getItem('edulms_session_id');
      const userId = isAuthenticated && user ? user.id : undefined;
      
      console.log('CartProvider: Clearing cart with userId:', userId, 'sessionId:', sessionId);
      
      // Call server API to clear cart
      const response = await cartAPI.clearCart({ 
        userId, 
        sessionId: sessionId || undefined 
      });
      
      const responseData = response.data as any;
      if (responseData.success) {
        console.log('CartProvider: Cart cleared from server successfully');
        // Remove preserve flag when explicitly clearing the cart
        localStorage.removeItem(CART_PRESERVE_FLAG);
        localStorage.removeItem(CART_STORAGE_KEY);
        dispatch({ type: 'CLEAR_CART' });
      } else {
        console.error('CartProvider: Failed to clear cart from server:', responseData.message);
        // Fallback to local clearing
        localStorage.removeItem(CART_PRESERVE_FLAG);
        localStorage.removeItem(CART_STORAGE_KEY);
        dispatch({ type: 'CLEAR_CART' });
      }
    } catch (error) {
      console.error('CartProvider: Error clearing cart from server:', error);
      // Fallback to local clearing if server call fails
      localStorage.removeItem(CART_PRESERVE_FLAG);
      localStorage.removeItem(CART_STORAGE_KEY);
      dispatch({ type: 'CLEAR_CART' });
    }
  };

  const restoreCartFromStorage = () => {
    console.log('CartProvider: restoreCartFromStorage called');
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart);
        if (cartData && Array.isArray(cartData.items) && cartData.items.length > 0) {
          console.log('CartProvider: Restoring cart from storage:', cartData);
          dispatch({ type: 'LOAD_CART', payload: cartData });
          localStorage.setItem(CART_PRESERVE_FLAG, 'true');
          return true;
        } else {
          console.log('CartProvider: No valid cart data found in storage');
        }
      } catch (error) {
        console.error('Error restoring cart from storage:', error);
        // Clear corrupted data
        localStorage.removeItem(CART_STORAGE_KEY);
        localStorage.removeItem(CART_PRESERVE_FLAG);
      }
    } else {
      console.log('CartProvider: No saved cart found in storage');
    }
    return false;
  };

  const isInCart = (courseId: string) => {
    return state.items.some(item => item.courseId === courseId);
  };

  const getCartItem = (courseId: string) => {
    return state.items.find(item => item.courseId === courseId);
  };

  const shouldPreserveCart = () => {
    const preserveFlag = localStorage.getItem(CART_PRESERVE_FLAG);
    return preserveFlag === 'true';
  };

  const syncCartOnLogin = (userId: string) => {
    console.log('CartProvider: Syncing cart on login for user:', userId);
    // In a real application, you would fetch the user's cart from the backend
    // For now, we'll just ensure it's saved locally.
    // If the backend provides a way to get the user's cart, you'd call that here.
    // For example:
    // fetch(`/api/users/${userId}/cart`)
    //   .then(response => response.json())
    //   .then(cartData => {
    //     if (cartData && Array.isArray(cartData.items)) {
    //       dispatch({ type: 'LOAD_CART', payload: cartData });
    //       localStorage.setItem(CART_PRESERVE_FLAG, 'true');
    //       console.log('CartProvider: Cart synced successfully');
    //     } else {
    //       console.warn('CartProvider: No cart data found for user, clearing local cart');
    //       localStorage.removeItem(CART_STORAGE_KEY);
    //       localStorage.removeItem(CART_PRESERVE_FLAG);
    //     }
    //   })
    //   .catch(error => {
    //     console.error('Error syncing cart on login:', error);
    //     localStorage.removeItem(CART_STORAGE_KEY);
    //     localStorage.removeItem(CART_PRESERVE_FLAG);
    //   });

    // For now, we'll just ensure it's saved locally if no backend sync is implemented
    // This is a placeholder and would need actual backend integration.
    localStorage.setItem(CART_PRESERVE_FLAG, 'true');
    console.log('CartProvider: Cart synced locally on login');
  };

  const preserveCartOnLogout = () => {
    console.log('CartProvider: Preserving cart on logout');
    // Ensure cart data is saved before logout
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
    localStorage.setItem(CART_PRESERVE_FLAG, 'true');
  };

  const ensureCartPersistence = () => {
    console.log('CartProvider: Ensuring cart persistence');
    // This function can be called to ensure cart is properly saved
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
      localStorage.setItem(CART_PRESERVE_FLAG, 'true');
      console.log('CartProvider: Cart persistence ensured');
    } catch (error) {
      console.error('CartProvider: Error ensuring cart persistence:', error);
    }
  };

  const syncWithServer = async (userId?: string, sessionId?: string) => {
    console.log('CartProvider: Syncing cart with server...');
    try {
      if (state.items.length > 0) {
        // Sync current cart to server
        const response = await cartAPI.createOrUpdateCart({
          userId,
          sessionId: sessionId || undefined,
          items: state.items
        });
        
        const responseData = response.data as any;
        if (responseData.success) {
          console.log('CartProvider: Cart synced successfully with server.');
          // Update local state with server response
          dispatch({ type: 'SYNC_WITH_SERVER', payload: responseData.data });
        } else {
          console.warn('CartProvider: Failed to sync cart with server:', responseData.message);
        }
      } else {
        // Try to get cart from server
        const response = await cartAPI.getCart({ userId, sessionId: sessionId || undefined });
        const responseData = response.data as any;
        if (responseData.success && responseData.data.items.length > 0) {
          console.log('CartProvider: Cart loaded from server.');
          dispatch({ type: 'SYNC_WITH_SERVER', payload: responseData.data });
        }
      }
    } catch (error) {
      console.error('CartProvider: Error syncing cart with server:', error);
      // Keep local cart if server sync fails
    }
  };

  const mergeGuestCart = async (userId: string) => {
    console.log('CartProvider: Manually merging guest cart with user cart for user:', userId);
    
    const sessionId = localStorage.getItem('edulms_session_id');
    if (!sessionId) {
      console.warn('CartProvider: No session ID found for guest cart');
      return;
    }

    try {
      const response = await cartAPI.mergeGuestCart({ userId, sessionId });
      const responseData = response.data as any;
      
      if (responseData.success) {
        console.log('CartProvider: Guest cart merged successfully with user cart');
        
        // Clear the merge flag since we've successfully merged
        localStorage.removeItem('edulms_merge_cart_on_login');
        
        // Reload cart from server to get the merged data
        const cartResponse = await cartAPI.getCart({ userId });
        const cartData = cartResponse.data as any;
        
        if (cartData.success && cartData.data.items.length > 0) {
          console.log('CartProvider: Updated cart with merged data:', cartData.data);
          dispatch({ type: 'SYNC_WITH_SERVER', payload: cartData.data });
        }
      } else {
        console.warn('CartProvider: Failed to merge guest cart:', responseData.message);
      }
    } catch (error) {
      console.error('CartProvider: Error merging guest cart:', error);
    }
  };

  const value: CartContextType = {
    state,
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    isInCart,
    getCartItem,
    restoreCartFromStorage,
    shouldPreserveCart,
    syncCartOnLogin,
    preserveCartOnLogout,
    ensureCartPersistence,
    syncWithServer,
    mergeGuestCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 