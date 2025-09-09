// Cart Test Utility - For debugging cart persistence
// Run this in browser console to test cart functionality

export const cartTest = {
  // Check current cart state
  checkState: () => {
    console.log('=== Cart State Check ===');
    console.log('localStorage cart:', localStorage.getItem('edulms_cart'));
    console.log('localStorage session:', localStorage.getItem('edulms_session_id'));
    console.log('localStorage preserve flag:', localStorage.getItem('edulms_cart_preserve'));
    
    try {
      const cartData = JSON.parse(localStorage.getItem('edulms_cart') || '{}');
      console.log('Parsed cart data:', cartData);
      console.log('Cart items count:', cartData.items?.length || 0);
    } catch (error) {
      console.error('Error parsing cart data:', error);
    }
  },

  // Clear all cart data
  clearAll: () => {
    console.log('=== Clearing All Cart Data ===');
    localStorage.removeItem('edulms_cart');
    localStorage.removeItem('edulms_session_id');
    localStorage.removeItem('edulms_cart_preserve');
    console.log('All cart data cleared');
  },

  // Add test item to cart
  addTestItem: () => {
    console.log('=== Adding Test Item ===');
    const testItem = {
      id: `test_${Date.now()}`,
      courseId: 'test-course-123',
      title: 'Test Course',
      price: 99.99,
      isFree: false,
      teacher: {
        firstName: 'Test',
        lastName: 'Teacher'
      },
      courseCode: 'TEST101'
    };

    const currentCart = JSON.parse(localStorage.getItem('edulms_cart') || '{"items":[],"total":0,"itemCount":0}');
    currentCart.items.push(testItem);
    currentCart.total = currentCart.items.reduce((sum, item) => sum + item.price, 0);
    currentCart.itemCount = currentCart.items.length;

    localStorage.setItem('edulms_cart', JSON.stringify(currentCart));
    localStorage.setItem('edulms_cart_preserve', 'true');
    
    console.log('Test item added:', testItem);
    console.log('Updated cart:', currentCart);
  },

  // Simulate page refresh
  simulateRefresh: () => {
    console.log('=== Simulating Page Refresh ===');
    console.log('Before refresh - Cart state:');
    cartTest.checkState();
    
    // Simulate refresh by clearing React state but keeping localStorage
    console.log('After refresh - localStorage should persist');
    console.log('localStorage cart:', localStorage.getItem('edulms_cart'));
  },

  // Run full test
  runFullTest: () => {
    console.log('=== Running Full Cart Test ===');
    
    // Step 1: Clear everything
    cartTest.clearAll();
    
    // Step 2: Add test item
    cartTest.addTestItem();
    
    // Step 3: Check state
    cartTest.checkState();
    
    // Step 4: Simulate refresh
    cartTest.simulateRefresh();
    
    console.log('=== Test Complete ===');
    console.log('If cart persists after page refresh, the test is successful!');
  }
};

// Make it available globally for easy access
if (typeof window !== 'undefined') {
  window.cartTest = cartTest;
} 