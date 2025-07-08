import React, { useState, useEffect } from 'react';
import { paymentsAPI } from '../../../services/api';
import { showSuccessAlert, showErrorAlert } from '../../../utils/sweetAlert';
import DataTable from '../../../components/DataTable';
import Modal from '../../../components/Modal';
import { Form, FormField, FormActions } from '../../../components/Form';

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'CANCELLED';
  method: 'CREDIT_CARD' | 'DEBIT_CARD' | 'PAYPAL' | 'BANK_TRANSFER' | 'CASH' | 'SSLCOMMERZ' | 'OTHER';
  referenceId?: string;
  paidAt?: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  enrollment: {
    id: string;
    course: {
      id: string;
      title: string;
      code: string;
    };
    batch: {
      id: string;
      name: string;
      amount: number;
    };
  };
}

const PaymentsPage = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [createFormData, setCreateFormData] = useState({
    userId: '',
    enrollmentId: '',
    amount: 0,
    currency: 'USD',
    method: 'CREDIT_CARD',
    status: 'PENDING',
    referenceId: '',
  });
  const [editFormData, setEditFormData] = useState({
    amount: 0,
    currency: 'USD',
    method: 'CREDIT_CARD',
    status: 'PENDING',
    referenceId: '',
  });
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await paymentsAPI.getAll();
      const data = response.data as { success: boolean; data: Payment[] };
      if (data.success) {
        setPayments(data.data);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      showErrorAlert('Error', 'Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await paymentsAPI.create(createFormData);
      const data = response.data as { success: boolean; data: Payment };
      if (data.success) {
        showSuccessAlert('Success', 'Payment created successfully');
        setShowCreateModal(false);
        setCreateFormData({
          userId: '',
          enrollmentId: '',
          amount: 0,
          currency: 'USD',
          method: 'CREDIT_CARD',
          status: 'PENDING',
          referenceId: '',
        });
        fetchPayments();
      }
    } catch (error: any) {
      console.error('Error creating payment:', error);
      showErrorAlert('Error', error.response?.data?.message || 'Failed to create payment');
    }
  };

  const handleUpdateFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPayment) return;

    try {
      const response = await paymentsAPI.update(editingPayment.id, editFormData);
      const data = response.data as { success: boolean; data: Payment };
      if (data.success) {
        showSuccessAlert('Success', 'Payment updated successfully');
        setShowModal(false);
        setEditingPayment(null);
        setEditFormData({
          amount: 0,
          currency: 'USD',
          method: 'CREDIT_CARD',
          status: 'PENDING',
          referenceId: '',
        });
        fetchPayments();
      }
    } catch (error: any) {
      console.error('Error updating payment:', error);
      showErrorAlert('Error', error.response?.data?.message || 'Failed to update payment');
    }
  };

  const handleDeletePayment = async (id: string) => {
    try {
      const response = await paymentsAPI.delete(id);
      const data = response.data as { success: boolean; message: string };
      if (data.success) {
        showSuccessAlert('Success', 'Payment deleted successfully');
        fetchPayments();
      }
    } catch (error: any) {
      console.error('Error deleting payment:', error);
      showErrorAlert('Error', error.response?.data?.message || 'Failed to delete payment');
    }
  };

  const handleMarkCompleted = async (id: string) => {
    try {
      const response = await paymentsAPI.markCompleted(id);
      const data = response.data as { success: boolean; data: Payment };
      if (data.success) {
        showSuccessAlert('Success', 'Payment marked as completed');
        fetchPayments();
      }
    } catch (error: any) {
      console.error('Error marking payment as completed:', error);
      showErrorAlert('Error', error.response?.data?.message || 'Failed to mark payment as completed');
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

  const getMethodBadge = (method: string) => {
    const methodColors = {
      CREDIT_CARD: 'bg-purple-100 text-purple-800',
      DEBIT_CARD: 'bg-indigo-100 text-indigo-800',
      PAYPAL: 'bg-blue-100 text-blue-800',
      BANK_TRANSFER: 'bg-green-100 text-green-800',
      SSLCOMMERZ: 'bg-yellow-100 text-yellow-800',
      CASH: 'bg-gray-100 text-gray-800',
      OTHER: 'bg-orange-100 text-orange-800',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${methodColors[method as keyof typeof methodColors]}`}>
        {method.replace('_', ' ')}
      </span>
    );
  };

  const columns = [
    {
      key: 'user',
      label: 'Student',
      render: (value: any, payment: Payment) => (
        <div>
          <div className="font-medium">{payment.user.firstName} {payment.user.lastName}</div>
          <div className="text-sm text-gray-500">{payment.user.email}</div>
        </div>
      ),
    },
    {
      key: 'course',
      label: 'Course',
      render: (value: any, payment: Payment) => (
        <div>
          <div className="font-medium">{payment.enrollment.course.title}</div>
          <div className="text-sm text-gray-500">{payment.enrollment.course.code}</div>
        </div>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (value: any, payment: Payment) => (
        <div className="font-medium">
          {payment.currency} {payment.amount.toFixed(2)}
        </div>
      ),
    },
    {
      key: 'method',
      label: 'Method',
      render: (value: any, payment: Payment) => getMethodBadge(payment.method),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: any, payment: Payment) => getStatusBadge(payment.status),
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (value: any, payment: Payment) => (
        <div>
          <div className="text-sm">{new Date(payment.createdAt).toLocaleDateString()}</div>
          <div className="text-xs text-gray-500">{new Date(payment.createdAt).toLocaleTimeString()}</div>
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value: any, payment: Payment) => (
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setEditingPayment(payment);
              setEditFormData({
                amount: payment.amount,
                currency: payment.currency,
                method: payment.method,
                status: payment.status,
                referenceId: payment.referenceId || '',
              });
              setShowModal(true);
            }}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Edit
          </button>
          {payment.status === 'PENDING' && (
            <button
              onClick={() => handleMarkCompleted(payment.id)}
              className="text-green-600 hover:text-green-800 text-sm font-medium"
            >
              Mark Complete
            </button>
          )}
          <button
            onClick={() => handleDeletePayment(payment.id)}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];



  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Payments Management</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Create Payment
        </button>
      </div>

      <DataTable
        data={payments}
        columns={columns}
        loading={loading}
        searchable
        pagination
      />

      {/* Create Payment Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Payment"
      >
        <Form onSubmit={handleCreateFormSubmit}>
          <FormField
            label="User ID"
            name="userId"
            type="text"
            value={createFormData.userId}
            onChange={(value) => setCreateFormData({ ...createFormData, userId: value as string })}
            required
          />
          <FormField
            label="Enrollment ID"
            name="enrollmentId"
            type="text"
            value={createFormData.enrollmentId}
            onChange={(value) => setCreateFormData({ ...createFormData, enrollmentId: value as string })}
            required
          />
          <FormField
            label="Amount"
            name="amount"
            type="number"
            value={createFormData.amount}
            onChange={(value) => setCreateFormData({ ...createFormData, amount: value as number })}
            required
          />
          <FormField
            label="Currency"
            name="currency"
            type="select"
            value={createFormData.currency}
            onChange={(value) => setCreateFormData({ ...createFormData, currency: value as string })}
            options={[
              { value: 'USD', label: 'USD' },
              { value: 'EUR', label: 'EUR' },
              { value: 'GBP', label: 'GBP' },
              { value: 'BDT', label: 'BDT' },
            ]}
            required
          />
          <FormField
            label="Payment Method"
            name="method"
            type="select"
            value={createFormData.method}
            onChange={(value) => setCreateFormData({ ...createFormData, method: value as string })}
            options={[
              { value: 'CREDIT_CARD', label: 'Credit Card' },
              { value: 'DEBIT_CARD', label: 'Debit Card' },
              { value: 'PAYPAL', label: 'PayPal' },
              { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
              { value: 'SSLCOMMERZ', label: 'SSLCOMMERZ' },
              { value: 'CASH', label: 'Cash' },
              { value: 'OTHER', label: 'Other' },
            ]}
            required
          />
          <FormField
            label="Status"
            name="status"
            type="select"
            value={createFormData.status}
            onChange={(value) => setCreateFormData({ ...createFormData, status: value as string })}
            options={[
              { value: 'PENDING', label: 'Pending' },
              { value: 'COMPLETED', label: 'Completed' },
              { value: 'FAILED', label: 'Failed' },
              { value: 'REFUNDED', label: 'Refunded' },
              { value: 'CANCELLED', label: 'Cancelled' },
            ]}
            required
          />
          <FormField
            label="Reference ID"
            name="referenceId"
            type="text"
            value={createFormData.referenceId}
            onChange={(value) => setCreateFormData({ ...createFormData, referenceId: value as string })}
          />
          <FormActions
            onCancel={() => setShowCreateModal(false)}
            submitText="Create Payment"
          />
        </Form>
      </Modal>

      {/* Edit Payment Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingPayment(null);
        }}
        title="Edit Payment"
      >
        {editingPayment && (
          <Form onSubmit={handleUpdateFormSubmit}>
            <FormField
              label="Amount"
              name="amount"
              type="number"
              value={editFormData.amount}
              onChange={(value) => setEditFormData({ ...editFormData, amount: value as number })}
              required
            />
            <FormField
              label="Currency"
              name="currency"
              type="select"
              value={editFormData.currency}
              onChange={(value) => setEditFormData({ ...editFormData, currency: value as string })}
              options={[
                { value: 'USD', label: 'USD' },
                { value: 'EUR', label: 'EUR' },
                { value: 'GBP', label: 'GBP' },
                { value: 'BDT', label: 'BDT' },
              ]}
              required
            />
            <FormField
              label="Payment Method"
              name="method"
              type="select"
              value={editFormData.method}
              onChange={(value) => setEditFormData({ ...editFormData, method: value as string })}
              options={[
                { value: 'CREDIT_CARD', label: 'Credit Card' },
                { value: 'DEBIT_CARD', label: 'Debit Card' },
                { value: 'PAYPAL', label: 'PayPal' },
                { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
                { value: 'SSLCOMMERZ', label: 'SSLCOMMERZ' },
                { value: 'CASH', label: 'Cash' },
                { value: 'OTHER', label: 'Other' },
              ]}
              required
            />
            <FormField
              label="Status"
              name="status"
              type="select"
              value={editFormData.status}
              onChange={(value) => setEditFormData({ ...editFormData, status: value as string })}
              options={[
                { value: 'PENDING', label: 'Pending' },
                { value: 'COMPLETED', label: 'Completed' },
                { value: 'FAILED', label: 'Failed' },
                { value: 'REFUNDED', label: 'Refunded' },
                { value: 'CANCELLED', label: 'Cancelled' },
              ]}
              required
            />
            <FormField
              label="Reference ID"
              name="referenceId"
              type="text"
              value={editFormData.referenceId}
              onChange={(value) => setEditFormData({ ...editFormData, referenceId: value as string })}
            />
            <FormActions
              onCancel={() => {
                setShowModal(false);
                setEditingPayment(null);
              }}
              submitText="Update Payment"
            />
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default PaymentsPage; 