import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { checkPaymentAccess, checkCourseAccess, PaymentVerificationResult } from '../utils/paymentVerification';
import PaymentRequired from './PaymentRequired';

interface WithPaymentVerificationProps {
  courseId?: string; // Optional course ID for course-specific checks
}

interface WithPaymentVerificationOptions {
  requirePayment?: boolean;
  courseSpecific?: boolean;
}

/**
 * Higher-order component that checks payment status before rendering content
 * @param Component - The component to wrap
 * @param options - Configuration options
 * @returns Wrapped component with payment verification
 */
export const withPaymentVerification = <P extends object>(
  Component: React.ComponentType<P>,
  options: WithPaymentVerificationOptions = {}
) => {
  const { requirePayment = true, courseSpecific = false } = options;

  const WrappedComponent: React.FC<P & WithPaymentVerificationProps> = (props) => {
    const { user } = useAuth();
    const [paymentStatus, setPaymentStatus] = useState<PaymentVerificationResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [hasAccess, setHasAccess] = useState(false);

    useEffect(() => {
      const verifyPayment = async () => {
        if (!user?.id) {
          setLoading(false);
          return;
        }

        try {
          setLoading(true);
          let result: PaymentVerificationResult;

          if (courseSpecific && props.courseId) {
            // Check access for specific course
            result = await checkCourseAccess(user.id, props.courseId);
          } else {
            // Check general payment access
            result = await checkPaymentAccess(user.id);
          }

          setPaymentStatus(result);
          setHasAccess(result.hasAccess);
        } catch (error) {
          console.error('Payment verification error:', error);
          setPaymentStatus({
            hasAccess: false,
            message: 'Unable to verify payment status. Please contact our support team.',
            pendingPayments: [],
            completedPayments: []
          });
          setHasAccess(false);
        } finally {
          setLoading(false);
        }
      };

      verifyPayment();
    }, [user?.id, props.courseId]);

    // Show loading spinner
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    // If payment verification is not required, render the component
    if (!requirePayment) {
      return <Component {...props} />;
    }

    // If user doesn't have access, show payment required message
    if (!hasAccess && paymentStatus) {
      return (
        <PaymentRequired 
          message={paymentStatus.message}
          showContactInfo={true}
        />
      );
    }

    // User has access, render the component
    return <Component {...props} />;
  };

  // Set display name for debugging
  WrappedComponent.displayName = `withPaymentVerification(${Component.displayName || Component.name})`;

  return WrappedComponent;
};

/**
 * Hook for manual payment verification
 * @param courseId - Optional course ID for course-specific checks
 * @returns Payment verification state and functions
 */
export const usePaymentVerification = (courseId?: string) => {
  const { user } = useAuth();
  const [paymentStatus, setPaymentStatus] = useState<PaymentVerificationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const verifyPayment = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      let result: PaymentVerificationResult;

      if (courseId) {
        result = await checkCourseAccess(user.id, courseId);
      } else {
        result = await checkPaymentAccess(user.id);
      }

      setPaymentStatus(result);
      return result;
    } catch (error) {
      console.error('Payment verification error:', error);
      const errorResult = {
        hasAccess: false,
        message: 'Unable to verify payment status. Please contact our support team.',
        pendingPayments: [],
        completedPayments: []
      };
      setPaymentStatus(errorResult);
      return errorResult;
    } finally {
      setLoading(false);
    }
  };

  return {
    paymentStatus,
    loading,
    verifyPayment,
    hasAccess: paymentStatus?.hasAccess || false
  };
}; 