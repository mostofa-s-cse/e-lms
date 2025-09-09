// Payment method types
export type PaymentMethod = 'CREDIT_CARD' | 'DEBIT_CARD' | 'MOBILE_BANKING' | 'INTERNET_BANKING' | 'CASH' | 'OTHER' | 'SSLCOMMERZ' | 'CUSTOM' | 'BANK_TRANSFER';

// Payment status types
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED';

// Payment details interfaces
export interface PaymentDetails {
  courseId: string;
  courseTitle: string;
  courseCode: string;
  amount: number;
  intakeId?: string;
  intakeName?: string;
  userId: string;
  userEmail: string;
  userName: string;
  originalPrice?: number;
  discount?: number;
}

export interface CartPaymentDetails {
  items: Array<{
    courseId: string;
    courseTitle: string;
    courseCode: string;
    amount: number;
    intakeId?: string;
    intakeName?: string;
  }>;
  total: number;
  userId: string;
  userEmail: string;
  userName: string;
}

// Payment method specific details
export interface CreditCardDetails {
  cardNumber: string;
  cardHolderName: string;
  expiryDate: string;
  cvv: string;
}

export interface MobileBankingDetails {
  mobileNumber: string;
}

export interface InternetBankingDetails {
  bankName: string;
}

export interface CashDetails {
  method: string;
}

export interface OtherDetails {
  transactionId: string;
}

export type PaymentMethodDetails = 
  | CreditCardDetails 
  | MobileBankingDetails 
  | InternetBankingDetails 
  | CashDetails 
  | OtherDetails;

// API request interfaces
export interface CreatePaymentRequest {
  courseId: string;
  intakeId?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDetails: PaymentMethodDetails;
  testStatus?: 'SUCCESS' | 'FAILED' | 'CANCELLED';
}

export interface CreateCartPaymentRequest {
  items: Array<{
    courseId: string;
    courseTitle: string;
    courseCode: string;
    amount: number;
    intakeId?: string;
    intakeName?: string;
  }>;
  total: number;
  userId: string;
  userEmail: string;
  userName: string;
  paymentMethod: PaymentMethod;
  paymentDetails: PaymentMethodDetails;
  testStatus?: 'SUCCESS' | 'FAILED' | 'CANCELLED';
}

export interface CreateFreeEnrollmentRequest {
  courseId: string;
  intakeId?: string;
}
