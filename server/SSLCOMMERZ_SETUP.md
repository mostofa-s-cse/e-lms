# SSLCommerz Payment Gateway Integration

This guide explains how to set up and use SSLCommerz payment gateway in the LMS application.

## Overview

SSLCommerz is a popular payment gateway in Bangladesh that supports various payment methods including:
- Credit/Debit Cards
- Mobile Banking (bKash, Nagad, Rocket, etc.)
- Internet Banking
- ATM Cards

## Setup Instructions

### 1. SSLCommerz Account Setup

1. Visit [SSLCommerz](https://developer.sslcommerz.com/) and create an account
2. Complete the merchant verification process
3. Get your Store ID and Store Password from the dashboard
4. Configure your store settings and IPN URLs

### 2. Environment Configuration

Add the following environment variables to your `.env` file:

```env
# SSLCommerz Configuration
SSLCOMMERZ_STORE_ID=your_store_id_here
SSLCOMMERZ_STORE_PASSWORD=your_store_password_here
CLIENT_URL=http://localhost:3000
SERVER_URL=http://localhost:5000
```

### 3. SSLCommerz Dashboard Configuration

In your SSLCommerz merchant dashboard, configure the following URLs:

#### Success URL
```
http://localhost:3000/payment/success
```

#### Fail URL
```
http://localhost:3000/payment/fail
```

#### Cancel URL
```
http://localhost:3000/payment/cancel
```

#### IPN URL (Instant Payment Notification)
```
http://localhost:5000/api/payments/sslcommerz/ipn
```

### 4. Production Configuration

For production deployment, update the URLs to your actual domain:

```env
CLIENT_URL=https://your-domain.com
SERVER_URL=https://your-api-domain.com
```

And update the SSLCommerz dashboard URLs accordingly.

## How It Works

### 1. Course Enrollment Flow

1. User clicks "Enroll Now" on a course
2. System checks if the course is free or paid
3. For paid courses:
   - Creates a payment session with SSLCommerz
   - Redirects user to SSLCommerz payment gateway
4. User completes payment on SSLCommerz
5. SSLCommerz redirects back to success/fail/cancel page
6. System processes the payment result and updates enrollment status

### 2. Payment Processing

- **Free Courses**: Direct enrollment without payment
- **Paid Courses**: SSLCommerz payment gateway integration
- **Batch Selection**: Optional batch selection with special pricing
- **Payment Validation**: Server-side validation of all payments

### 3. Payment Status Flow

```
PENDING → COMPLETED (on successful payment)
PENDING → FAILED (on payment failure)
PENDING → CANCELLED (on payment cancellation)
```

## API Endpoints

### Create Payment Session
```
POST /api/payments/sslcommerz/create-session
```

**Request Body:**
```json
{
  "courseId": "course_id",
  "batchId": "intake_id", // optional
  "amount": 1000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionkey": "session_key",
    "gatewayPageURL": "https://sandbox.sslcommerz.com/gwprocess/v4/api.php",
    "tran_id": "transaction_id",
    "paymentId": "payment_id",
    "enrollmentId": "enrollment_id"
  }
}
```

### Payment Callbacks
- `POST /api/payments/sslcommerz/success` - Payment success
- `POST /api/payments/sslcommerz/fail` - Payment failure
- `POST /api/payments/sslcommerz/cancel` - Payment cancellation
- `POST /api/payments/sslcommerz/ipn` - Instant Payment Notification

## Frontend Integration

### Payment Result Pages

The application includes dedicated pages for payment results:

- `/payment/success` - Payment successful
- `/payment/fail` - Payment failed
- `/payment/cancel` - Payment cancelled

### Course Enrollment

Both `CourseDetailsPage` and `CoursesPage` now support:
- Free course enrollment (direct)
- Paid course enrollment (via SSLCommerz)
- Batch selection with special pricing
- Payment gateway redirection

## Testing

### Sandbox Testing

1. Use SSLCommerz sandbox credentials for testing
2. Test with various payment methods
3. Verify payment callbacks work correctly
4. Check enrollment status updates

### Test Cards

SSLCommerz provides test cards for sandbox testing:
- Visa: 4111111111111111
- Mastercard: 5555555555554444
- Expiry: Any future date
- CVV: Any 3 digits

## Security Considerations

1. **Environment Variables**: Never commit SSLCommerz credentials to version control
2. **HTTPS**: Use HTTPS in production for secure payment processing
3. **Validation**: Always validate payment responses server-side
4. **IPN**: Use IPN for reliable payment status updates
5. **Hash Verification**: SSLCommerz uses MD5 hash for security

## Troubleshooting

### Common Issues

1. **Payment Session Creation Failed**
   - Check SSLCommerz credentials
   - Verify store is active
   - Check network connectivity

2. **Payment Not Processing**
   - Verify callback URLs are correct
   - Check IPN configuration
   - Review server logs for errors

3. **Enrollment Not Updated**
   - Check payment validation logic
   - Verify database connections
   - Review enrollment status updates

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
```

Check server logs for detailed error messages.

## Support

For SSLCommerz-specific issues:
- SSLCommerz Documentation: https://developer.sslcommerz.com/
- SSLCommerz Support: support@sslcommerz.com

For application-specific issues:
- Check the application logs
- Review the payment flow implementation
- Verify database schema and migrations 