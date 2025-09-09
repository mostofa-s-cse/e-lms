import { paymentsAPI } from '../services/api';

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'CANCELLED';
  method: 'CREDIT_CARD' | 'DEBIT_CARD' | 'PAYPAL' | 'BANK_TRANSFER' | 'CASH' | 'OTHER';
  referenceId?: string;
  paidAt?: string;
  createdAt: string;
  enrollment: {
    id: string;
    course: {
      id: string;
      title: string;
      code: string;
    };
    intake?: {
      id: string;
      name: string;
      amount: number;
    };
  };
}

export interface PaymentVerificationResult {
  hasAccess: boolean;
  message: string;
  pendingPayments: Payment[];
  completedPayments: Payment[];
}

/**
 * Check if a student has completed payments for course access
 * @param userId - The student's user ID
 * @returns Promise<PaymentVerificationResult>
 */
export const checkPaymentAccess = async (userId: string): Promise<PaymentVerificationResult> => {
  try {
    const response = await paymentsAPI.getByUser(userId);
    const payments = (response.data as any).data || [];
    
    const completedPayments = payments.filter((payment: Payment) => payment.status === 'COMPLETED');
    
    if (completedPayments.length === 0) {
      return {
        hasAccess: false,
        message: 'You need to complete your payment to access course content. Please contact our support team for assistance.',
        pendingPayments: [],
        completedPayments: []
      };
    }
    
    return {
      hasAccess: true,
      message: 'Payment verified. You have access to course content.',
      pendingPayments: [],
      completedPayments
    };
    
  } catch (error) {
    console.error('Error checking payment access:', error);
    return {
      hasAccess: false,
      message: 'Unable to verify payment status. Please contact our support team.',
      pendingPayments: [],
      completedPayments: []
    };
  }
};

/**
 * Check if a student has access to a specific course
 * @param userId - The student's user ID
 * @param courseId - The course ID to check access for
 * @returns Promise<PaymentVerificationResult>
 */
export const checkCourseAccess = async (userId: string, courseId: string): Promise<PaymentVerificationResult> => {
  try {
    const response = await paymentsAPI.getByUser(userId);
    const payments = (response.data as any).data || [];
    
    // Filter payments for the specific course
    const coursePayments = payments.filter((payment: Payment) => 
      payment.enrollment.course.id === courseId
    );
    
    const completedCoursePayments = coursePayments.filter((payment: Payment) => payment.status === 'COMPLETED');
    
    if (completedCoursePayments.length === 0) {
      return {
        hasAccess: false,
        message: `You need to complete payment for this course to access its content. Please contact our support team for assistance.`,
        pendingPayments: [],
        completedPayments: []
      };
    }
    
    return {
      hasAccess: true,
      message: 'Payment verified for this course.',
      pendingPayments: [],
      completedPayments: completedCoursePayments
    };
    
  } catch (error) {
    console.error('Error checking course access:', error);
    return {
      hasAccess: false,
      message: 'Unable to verify payment status for this course. Please contact our support team.',
      pendingPayments: [],
      completedPayments: []
    };
  }
}; 