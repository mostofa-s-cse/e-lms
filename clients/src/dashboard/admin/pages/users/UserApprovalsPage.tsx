import React, { useState, useEffect } from 'react';
import { usersAPI } from '../../../../services/api';
import { 
  showSuccessAlert, 
  showConfirmDialog,
  handleApiError 
} from '../../../../utils/sweetAlert';
import { DataTable } from '../../../../components';

interface PendingUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  isActive: boolean;
  approvalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedAt?: string;
  approvedBy?: string;
  createdAt: string;
  profile?: {
    phone: string;
    address?: string;
    city?: string;
    state?: string;
  };
}

interface PendingUsersResponse {
  data: PendingUser[];
}

const UserApprovalsPage = () => {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getPendingApprovals();
      console.log("response.data.data",response.data.data);
      setPendingUsers(response.data.data || []);
    } catch (error) {
      handleApiError(error, 'Failed to fetch pending approvals');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (user: PendingUser) => {
    const result = await showConfirmDialog(
      'Approve User',
      `Are you sure you want to approve ${user.firstName} ${user.lastName}?`,
      'Approve',
      'Cancel'
    );

    if (result.isConfirmed) {
      try {
        setProcessingId(user.id);
        await usersAPI.updateApproval(user.id, { approvalStatus: 'APPROVED' });
        showSuccessAlert(
          'User Approved', 
          `${user.firstName} ${user.lastName} has been successfully approved.`
        );
        fetchPendingApprovals();
      } catch (error) {
        handleApiError(error, 'Failed to approve user');
      } finally {
        setProcessingId(null);
      }
    }
  };

  const handleReject = async (user: PendingUser) => {
    const result = await showConfirmDialog(
      'Reject User',
      `Are you sure you want to reject ${user.firstName} ${user.lastName}? This action cannot be undone.`,
      'Reject',
      'Cancel'
    );

    if (result.isConfirmed) {
      try {
        setProcessingId(user.id);
        await usersAPI.updateApproval(user.id, { 
          approvalStatus: 'REJECTED',
          rejectionReason: 'Rejected by admin'
        });
        showSuccessAlert(
          'User Rejected', 
          `${user.firstName} ${user.lastName} has been rejected.`
        );
        fetchPendingApprovals();
      } catch (error) {
        handleApiError(error, 'Failed to reject user');
      } finally {
        setProcessingId(null);
      }
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (value: any, user: PendingUser) => (
        <div>
          <div className="font-medium text-gray-900">
            {user.firstName} {user.lastName}
          </div>
          <div className="text-sm text-gray-500">{user.email}</div>
        </div>
      )
    },
    {
      key: 'role',
      label: 'Role',
      render: (value: any, user: PendingUser) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
          user.role === 'TEACHER' ? 'bg-blue-100 text-blue-800' :
          'bg-green-100 text-green-800'
        }`}>
          {user.role}
        </span>
      )
    },
    {
      key: 'profile',
      label: 'Contact Info',
      render: (value: any, user: PendingUser) => (
        <div className="text-sm text-gray-600">
          {user.profile?.phone && <div>📞 {user.profile.phone}</div>}
          {user.profile?.city && <div>📍 {user.profile.city}</div>}
        </div>
      )
    },
    {
      key: 'createdAt',
      label: 'Registration Date',
      render: (value: any, user: PendingUser) => (
        <div className="text-sm text-gray-600">
          {new Date(user.createdAt).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value: any, user: PendingUser) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleApprove(user)}
            disabled={processingId === user.id}
            className="bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processingId === user.id ? 'Processing...' : 'Approve'}
          </button>
          <button
            onClick={() => handleReject(user)}
            disabled={processingId === user.id}
            className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processingId === user.id ? 'Processing...' : 'Reject'}
          </button>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {pendingUsers.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Pending Approvals</h3>
          <p className="text-gray-600">All user registration requests have been processed.</p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Pending Approvals ({pendingUsers.length})
            </h2>
          </div>
          <DataTable
            data={pendingUsers}
            title="Pending Approvals"
            subtitle="Review and approve or reject new user registration requests"
            columns={columns}
            loading={loading}
            emptyMessage="No pending approvals found"
          />
        </div>
      )}
    </div>
  );
};

export default UserApprovalsPage; 