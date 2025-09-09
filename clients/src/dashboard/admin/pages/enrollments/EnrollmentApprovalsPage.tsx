import React, { useState, useEffect } from 'react';
import { enrollmentsAPI } from '../../../../services/api';
import DataTable from '../../../../pages/DataTable';
import { handleApiError, showSuccessAlert } from '../../../../utils/sweetAlert';
import Modal from '../../../../components/Modal';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Course {
  id: string;
  title: string;
  code: string;
  description: string;
  credits: number;
  price: number;
  isFree: boolean;
  teacher: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface Intake {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  amount: number;
}

interface Enrollment {
  id: string;
  status: string;
  enrolledAt: string;
  createdAt: string;
  student: Student;
  course: Course;
  intake?: Intake;
}

interface EnrollmentsResponse {
  success: boolean;
  data: Enrollment[];
}

const EnrollmentApprovalsPage = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPendingEnrollments();
  }, []);

  useEffect(() => {
    document.title = 'Enrollment Approvals - Admin Dashboard | E-LMS';
  }, []);

  const fetchPendingEnrollments = async () => {
    try {
      setLoading(true);
      const response = await enrollmentsAPI.getPending();
      const data = response.data as EnrollmentsResponse;
      if (data.success) {
        setEnrollments(data.data);
      }
    } catch (error) {
      handleApiError(error, 'Failed to fetch pending enrollments');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (enrollment: Enrollment) => {
    try {
      setProcessing(true);
      const response = await enrollmentsAPI.approve(enrollment.id);
      const data = response.data as { success: boolean; message?: string };
      
      if (data.success) {
        await showSuccessAlert('Enrollment approved successfully!');
        // Remove the approved enrollment from the list
        setEnrollments(prev => prev.filter(e => e.id !== enrollment.id));
      }
    } catch (error) {
      handleApiError(error, 'Failed to approve enrollment');
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectClick = (enrollment: Enrollment) => {
    setSelectedEnrollment(enrollment);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!selectedEnrollment) return;

    try {
      setProcessing(true);
      const response = await enrollmentsAPI.reject(selectedEnrollment.id, rejectionReason);
      const data = response.data as { success: boolean; message?: string };
      
      if (data.success) {
        await showSuccessAlert('Enrollment rejected successfully!');
        // Remove the rejected enrollment from the list
        setEnrollments(prev => prev.filter(e => e.id !== selectedEnrollment.id));
        setShowRejectModal(false);
        setSelectedEnrollment(null);
        setRejectionReason('');
      }
    } catch (error) {
      handleApiError(error, 'Failed to reject enrollment');
    } finally {
      setProcessing(false);
    }
  };

  const columns = [
    {
      key: 'student',
      label: 'Student',
      render: (_: any, enrollment: Enrollment) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {enrollment.student.firstName} {enrollment.student.lastName}
          </div>
          <div className="text-sm text-gray-500">{enrollment.student.email}</div>
        </div>
      )
    },
    {
      key: 'course',
      label: 'Course',
      render: (_: any, enrollment: Enrollment) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{enrollment.course.title}</div>
          <div className="text-sm text-gray-500">{enrollment.course.code}</div>
        </div>
      )
    },
    {
      key: 'teacher',
      label: 'Teacher',
      render: (_: any, enrollment: Enrollment) => (
        <div className="text-sm text-gray-900">
          {enrollment.course.teacher.firstName} {enrollment.course.teacher.lastName}
        </div>
      )
    },
    {
      key: 'intake',
      label: 'Intake',
      render: (_: any, enrollment: Enrollment) => (
        <div className="text-sm text-gray-900">
          {enrollment.intake ? (
            <div>
              <div className="font-medium">{enrollment.intake.name}</div>
              <div className="text-xs text-gray-500">BDT {enrollment.intake.amount}</div>
            </div>
          ) : (
            <span className="text-gray-500">No intake</span>
          )}
        </div>
      )
    },
    {
      key: 'courseDetails',
      label: 'Course Details',
      render: (_: any, enrollment: Enrollment) => (
        <div className="text-sm">
          <div className="text-gray-900">
            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
              {enrollment.course.credits} credits
            </span>
          </div>
          <div className="text-gray-500 mt-1">
            {enrollment.course.isFree ? 'Free' : `BDT ${enrollment.course.price}`}
          </div>
        </div>
      )
    },
    {
      key: 'requestDate',
      label: 'Request Date',
      render: (_: any, enrollment: Enrollment) => (
        <span className="text-sm text-gray-900">
          {new Date(enrollment.enrolledAt).toLocaleDateString()}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, enrollment: Enrollment) => (
        <div className="space-x-2">
          <button
            onClick={() => handleApprove(enrollment)}
            disabled={processing}
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-3 py-1 rounded text-sm font-medium"
          >
            Approve
          </button>
          <button
            onClick={() => handleRejectClick(enrollment)}
            disabled={processing}
            className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-3 py-1 rounded text-sm font-medium"
          >
            Reject
          </button>
        </div>
      )
    }
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Enrollment Approvals</h1>
        <p className="text-gray-600 mt-2">Review and approve student course enrollments</p>
        
        {enrollments.length === 0 && !loading && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  All caught up!
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>There are no pending enrollment requests at this time.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <DataTable
        columns={columns}
        title="Pending Enrollments"
        subtitle="Review and approve student course enrollment requests"
        data={enrollments}
        loading={loading}
      />

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setSelectedEnrollment(null);
          setRejectionReason('');
        }}
        title="Reject Enrollment"
        size="md"
      >
        <div className="space-y-4">
          {selectedEnrollment && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Enrollment Details</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Student:</strong> {selectedEnrollment.student.firstName} {selectedEnrollment.student.lastName}</p>
                <p><strong>Course:</strong> {selectedEnrollment.course.title} ({selectedEnrollment.course.code})</p>
                <p><strong>Teacher:</strong> {selectedEnrollment.course.teacher.firstName} {selectedEnrollment.course.teacher.lastName}</p>
              </div>
            </div>
          )}
          
          <div>
            <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700 mb-2">
              Rejection Reason (Optional)
            </label>
            <textarea
              id="rejectionReason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              rows={4}
              placeholder="Provide a reason for rejecting this enrollment request..."
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setShowRejectModal(false);
                setSelectedEnrollment(null);
                setRejectionReason('');
              }}
              disabled={processing}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              disabled={processing}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {processing ? 'Rejecting...' : 'Reject Enrollment'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EnrollmentApprovalsPage;
