# Cart Merging System - How It Works

## Overview
When a guest user adds items to their cart and then logs in, those items are automatically transferred to their user account. This provides a seamless shopping experience.

## How It Works

### 1. Guest User Flow
1. **Browse as Guest**: User visits the site without logging in
2. **Add to Cart**: Items are stored in localStorage with a unique session ID
3. **Register/Login**: User creates account or logs in
4. **Automatic Merge**: Cart items are automatically transferred to their user account

### 2. Technical Implementation

#### Session Management
- Guest users get a unique session ID: `session_${timestamp}_${random}`
- Session ID is stored in localStorage: `edulms_session_id`
- Cart data is stored both locally and on the server

#### Cart Merging Process
1. **Login Trigger**: When user logs in, `onLoginSuccess` callback is triggered
2. **Merge API Call**: System calls `cartAPI.mergeGuestCart({ userId, sessionId })`
3. **Server Processing**: Backend moves guest cart items to user cart
4. **State Update**: Frontend reloads cart from server with merged data
5. **Cleanup**: Merge flags are cleared

#### Registration Flow
1. **Register**: User creates account (cart items preserved)
2. **Merge Flag**: `edulms_merge_cart_on_login` flag is set
3. **First Login**: When user logs in for the first time, cart is merged
4. **Flag Clear**: Merge flag is cleared after successful merge

## Testing the System

### Manual Testing Steps

#### Step 1: Add Items as Guest
1. Open the website without logging in
2. Go to `/courses` page
3. Add 2-3 courses to cart
4. Verify items appear in cart (check cart icon in navigation)

#### Step 2: Register Account
1. Click "Get Started" or go to `/register`
2. Create a new account
3. **Important**: Don't log in yet - stay on the registration success page

#### Step 3: Login and Verify
1. Go to `/login` page
2. Log in with your new account
3. Check that your cart items are still there
4. The items should now be associated with your user account

### Debug Information

#### Check Cart Status (Development Mode)
1. Open the cart modal
2. Click the "Debug" button (only visible in development)
3. Check browser console for detailed cart information

#### Console Logs to Watch For
```
CartProvider: User logged in, merging guest cart with user cart for user: [userId]
CartProvider: Attempting to merge guest cart with user cart...
CartProvider: Guest cart merged successfully with user cart
CartProvider: Updated cart with merged data: [cartData]
```

#### localStorage Keys to Monitor
- `edulms_session_id`: Guest session identifier
- `edulms_cart`: Cart data in localStorage
- `edulms_cart_preserve`: Flag to preserve cart on logout
- `edulms_merge_cart_on_login`: Flag for registration merge

### Troubleshooting

#### Cart Items Not Merging
1. Check if session ID exists in localStorage
2. Verify merge flag is set after registration
3. Check browser console for error messages
4. Ensure backend merge API is working

#### Cart Data Lost
1. Check localStorage for cart data
2. Verify cart persistence flags
3. Check server API responses
4. Look for network errors in console

#### Items Not Showing After Login
1. Check if merge API call succeeded
2. Verify cart reload from server
3. Check if user has existing cart items
4. Look for state update errors

## Key Components

### Frontend Files
- `src/contexts/CartContext.tsx`: Main cart logic and merging
- `src/contexts/AuthContext.tsx`: Login callbacks and registration
- `src/components/Cart.tsx`: Cart UI with debug tools
- `src/pages/RegisterPage.tsx`: Registration with merge flag
- `src/pages/LoginPage.tsx`: Login with automatic merging

### Backend Requirements
- Cart API endpoints for guest and user carts
- Merge API endpoint: `POST /api/cart/merge-guest`
- Cart models with sessionId and userId support
- Proper error handling and validation

## Expected Behavior

### Guest User
- Can add items to cart without account
- Cart persists across page refreshes
- Session ID is generated automatically
- Cart data stored locally and on server

### Registration
- Cart items preserved during registration
- Merge flag set for first login
- No data loss during account creation

### Login
- Cart items automatically transferred to user account
- Seamless experience - no manual steps required
- Existing user cart items preserved
- Merge flags cleared after successful merge

### Logout
- Cart data preserved for guest users
- User cart data remains on server
- Session maintained for future visits

## Success Indicators

✅ Cart items visible before login
✅ Cart items still visible after login
✅ No duplicate items in cart
✅ Console shows successful merge logs
✅ localStorage flags properly managed
✅ Server cart data updated correctly

## Common Issues and Solutions

### Issue: Cart items disappear after login
**Solution**: Check merge API response and ensure cart reload from server

### Issue: Duplicate items in cart
**Solution**: Verify merge logic doesn't add existing items

### Issue: Cart not persisting for guests
**Solution**: Check localStorage permissions and session ID generation

### Issue: Merge not happening on login
**Solution**: Verify login success callback is properly set up 