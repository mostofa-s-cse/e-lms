import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { paymentsAPI } from '../../../services/api';
import { showErrorAlert } from '../../../utils/sweetAlert';

interface Payment {
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
    batch?: {
      id: string;
      name: string;
      amount: number;
    };
  };
}

interface PaymentsResponse {
  success: boolean;
  data: Payment[];
}

const PaymentsPage = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchPayments();
    }
  }, [user?.id]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await paymentsAPI.getByUser(user!.id);
      const data = response.data as PaymentsResponse;
      if (data.success) {
        setPayments(data.data);
      } else {
        setPayments([]);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      showErrorAlert('Error', 'Failed to fetch payments');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      COMPLETED: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
      REFUNDED: 'bg-blue-100 text-blue-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status as keyof typeof statusColors]}`}>
        {status}
      </span>
    );
  };

  const getMethodBadge = (method: string, amount: number) => {
    // Special case for free courses
    if (method === 'OTHER' && amount === 0) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Free Course
        </span>
      );
    }
    
    const methodColors = {
      CREDIT_CARD: 'bg-purple-100 text-purple-800',
      DEBIT_CARD: 'bg-indigo-100 text-indigo-800',
      PAYPAL: 'bg-blue-100 text-blue-800',
      BANK_TRANSFER: 'bg-green-100 text-green-800',
      CASH: 'bg-gray-100 text-gray-800',
      OTHER: 'bg-orange-100 text-orange-800',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${methodColors[method as keyof typeof methodColors]}`}>
        {method.replace('_', ' ')}
      </span>
    );
  };

  const getTotalAmount = () => {
    return payments.reduce((total, payment) => total + payment.amount, 0);
  };

  const getCompletedAmount = () => {
    return getCompletedPayments().reduce((total, payment) => {
      // Only count non-free payments in the total
      if (payment.amount > 0) {
        return total + payment.amount;
      }
      return total;
    }, 0);
  };

  const getCompletedPayments = () => {
    return payments.filter(payment => payment.status === 'COMPLETED');
  };

  const getPendingPayments = () => {
    return payments.filter(payment => payment.status === 'PENDING');
  };

  const getFailedPayments = () => {
    return payments.filter(payment => payment.status === 'FAILED');
  };

  const getPrimaryCurrency = () => {
    // Get the most common currency from payments, or default to BDT
    if (payments.length === 0) return 'BDT';
    
    const currencyCounts = payments.reduce((acc, payment) => {
      acc[payment.currency] = (acc[payment.currency] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostCommonCurrency = Object.entries(currencyCounts)
      .sort(([,a], [,b]) => b - a)[0][0];
    
    return mostCommonCurrency;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">My Payments</h1>
        <p className="text-gray-600">View your payment history and transaction details</p>
      </div>

      {/* Payment Summary Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Payments</p>
              <p className="text-2xl font-bold text-gray-900">{payments.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{getCompletedPayments().length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{getPendingPayments().length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Failed</p>
              <p className="text-2xl font-bold text-gray-900">{getFailedPayments().length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Total Amount Card */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm font-medium">Total Amount Paid</p>
            <p className="text-3xl font-bold text-white">
              {getCompletedAmount() > 0 ? `${getPrimaryCurrency()} ${getCompletedAmount().toFixed(2)}` : 'Free Courses Only'}
            </p>
          </div>
          <div className="p-3 bg-white bg-opacity-20 rounded-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Payments List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Payment History</h2>
        </div>

        {payments.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-6xl mb-4">💳</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No payments found</h3>
            <p className="text-gray-600">You haven't made any payments yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reference
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {payment.enrollment.course.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payment.enrollment.course.code}
                        </div>
                        {payment.enrollment.batch && (
                          <div className="text-xs text-gray-400">
                            {payment.enrollment.batch.name}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {payment.amount === 0 ? 'Free' : `${payment.currency} ${payment.amount.toFixed(2)}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getMethodBadge(payment.method, payment.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(payment.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.referenceId || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentsPage; 