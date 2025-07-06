# Cart Merging System Guide

## Overview

The cart merging system automatically transfers guest users' cart items to their account when they register and log in. This provides a seamless shopping experience where users don't lose their cart items when creating an account.

## How It Works

### 1. Guest User Flow
1. **Browse as Guest**: User visits the site without logging in
2. **Add to Cart**: Items are stored in localStorage with a session ID
3. **Register Account**: User creates a new account
4. **Login**: User logs in with their new account
5. **Automatic Merge**: Cart items are automatically transferred to their user account

### 2. Technical Implementation

#### Frontend (React/TypeScript)
- **Session Management**: Guest users get a unique session ID stored in localStorage
- **Cart Persistence**: Cart data is stored both locally and on the server
- **Automatic Merging**: Cart merging happens automatically on login/registration
- **State Management**: Uses React Context for cart state management

#### Backend (Node.js/Express/Prisma)
- **Cart Models**: Separate cart models for guest (sessionId) and user (userId) carts
- **Merge API**: Dedicated endpoint to merge guest cart with user cart
- **Database**: Cart data persisted in database with proper relationships

### 3. Key Components

#### CartContext (`src/contexts/CartContext.tsx`)
- Manages cart state and operations
- Handles automatic cart merging on login
- Provides cart persistence across sessions
- Syncs with server for both guest and logged-in users

#### AuthContext (`src/contexts/AuthContext.tsx`)
- Manages user authentication state
- Triggers cart merging callbacks on login/registration
- Handles user session management

#### Cart API (`src/services/api.ts`)
- Provides methods for cart operations
- Includes `mergeGuestCart` method for merging carts
- Handles server communication for cart persistence

### 4. Cart Merging Process

```typescript
// 1. User logs in/registers
const login = async (email: string, password: string) => {
  // ... authentication logic
  if (onLoginSuccess) {
    onLoginSuccess(userData.id); // Triggers cart merge
  }
};

// 2. Cart merge callback is triggered
setOnLoginSuccess(async (userId: string) => {
  const sessionId = localStorage.getItem('edulms_session_id');
  
  if (sessionId && state.items.length > 0) {
    // Call merge API
    const response = await cartAPI.mergeGuestCart({ userId, sessionId });
    
    if (response.success) {
      // Reload cart from server with merged data
      const cartResponse = await cartAPI.getCart({ userId });
      dispatch({ type: 'SYNC_WITH_SERVER', payload: cartResponse.data });
    }
  }
});
```

### 5. Database Schema

```prisma
model Cart {
  id        String     @id @default(cuid())
  userId    String?    // null for guest carts
  sessionId String?    // null for user carts
  items     CartItem[]
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
}

model CartItem {
  id           String @id @default(cuid())
  cartId       String
  cart         Cart   @relation(fields: [cartId], references: [id])
  courseId     String
  title        String
  price        Float
  // ... other fields
}
```

### 6. API Endpoints

#### Merge Guest Cart
```http
POST /api/cart/merge-guest
Content-Type: application/json

{
  "userId": "user_id_here",
  "sessionId": "session_id_here"
}
```

#### Get Cart
```http
GET /api/cart?userId=user_id&sessionId=session_id
```

#### Create/Update Cart
```http
POST /api/cart
Content-Type: application/json

{
  "userId": "user_id_here",
  "sessionId": "session_id_here",
  "items": [...]
}
```

### 7. Testing the System

#### Manual Testing
1. Visit `/cart-demo` page
2. Add items to cart as guest user
3. Register for a new account
4. Log in with the new account
5. Verify cart items are still present

#### Automated Testing
- Use the "Test Merge" button in the cart modal
- Check browser console for merge logs
- Verify localStorage and server data consistency

### 8. Error Handling

- **Network Errors**: Fallback to local cart if server sync fails
- **Merge Failures**: Log errors and continue with existing cart
- **Session Issues**: Generate new session ID if needed
- **Data Corruption**: Clear corrupted cart data and start fresh

### 9. Security Considerations

- Session IDs are randomly generated
- User authentication required for cart operations
- Server-side validation of cart data
- Proper error handling to prevent data leaks

### 10. Performance Optimizations

- Cart data cached locally for fast access
- Server sync happens asynchronously
- Minimal API calls during normal usage
- Efficient database queries with proper indexing

## Usage Examples

### Adding Items to Cart (Guest)
```typescript
const { addToCart } = useCart();

await addToCart({
  courseId: 'course_123',
  title: 'React Fundamentals',
  price: 99.99,
  teacher: { firstName: 'John', lastName: 'Doe' }
});
```

### Manual Cart Merge
```typescript
const { mergeGuestCart } = useCart();

if (user) {
  await mergeGuestCart(user.id);
}
```

### Checking Cart Status
```typescript
const { state, isInCart } = useCart();

console.log('Cart items:', state.items.length);
console.log('Is course in cart:', isInCart('course_123'));
```

## Troubleshooting

### Common Issues

1. **Cart items not merging**: Check if session ID exists and merge flag is set
2. **Cart data lost**: Verify localStorage persistence and server sync
3. **Merge API errors**: Check server logs and network connectivity
4. **State inconsistencies**: Use debug buttons to inspect cart state

### Debug Tools

- Browser console logs for detailed cart operations
- "Test Merge" button in cart modal
- Cart demo page for step-by-step testing
- localStorage inspection for cart data

## Future Enhancements

- Real-time cart synchronization
- Cart sharing between devices
- Advanced cart analytics
- Bulk cart operations
- Cart templates and saved carts 