import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { studentAPI, enrollmentsAPI } from '../../../../services/api';
import DataTable from '../../../../pages/DataTable';
import { handleApiError } from '../../../../utils/sweetAlert';
import { checkPaymentAccess } from '../../../../utils/paymentVerification';
import PaymentRequiredModal from '../../../../components/PaymentRequiredModal';

interface Course {
  id: string;
  title: string;
  description: string;
  code: string;
  credits: number;
  price: number;
  duration: number;
  isActive: boolean;
  createdAt: string;
  teacher?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface Enrollment {
  id: string;
  status: string;
  enrolledAt: string;
  course: Course;
  intake?: {
    id: string;
    name: string;
    amount: number;
  };
}

interface EnrollmentsResponse {
  success: boolean;
  data: Enrollment[];
}

const CoursesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState('');

  useEffect(() => {
    if (user?.id) {
      fetchEnrolledCourses();
    }
  }, [user?.id]);

  useEffect(() => {
    document.title = 'My Courses - Student Dashboard | E-LMS';
  }, []);

  const fetchEnrolledCourses = async () => {
    try {
      setLoading(true);
      const response = await enrollmentsAPI.getByStudent(user!.id);
      const data = response.data as EnrollmentsResponse;
      if (data.success) {
        setEnrollments(data.data);
      }
    } catch (error) {
      handleApiError(error, 'Failed to fetch enrolled courses');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (enrollment: Enrollment) => {
    if (!user?.id) return;
    
    // First check enrollment status
    if (enrollment.status !== 'ACTIVE') {
      if (enrollment.status === 'PENDING') {
        setPaymentMessage('Your enrollment is pending admin approval. You will be able to access the course content once approved.');
      } else if (enrollment.status === 'DROPPED') {
        setPaymentMessage('Your enrollment was rejected. Please contact support for more information.');
      } else {
        setPaymentMessage('Your enrollment is not active. Please contact support for assistance.');
      }
      setShowPaymentModal(true);
      return;
    }
    
    try {
      const paymentResult = await checkPaymentAccess(user.id);
      if (paymentResult.hasAccess) {
        navigate(`/student/courses/${enrollment.course.id}`);
      } else {
        setPaymentMessage(paymentResult.message);
        setShowPaymentModal(true);
      }
    } catch (error) {
      console.error('Error checking payment:', error);
      setPaymentMessage('Unable to verify payment status. Please contact our support team.');
      setShowPaymentModal(true);
    }
  };

  const columns = [
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
      key: 'description',
      label: 'Description',
      render: (_: any, enrollment: Enrollment) => (
        <div className="text-sm text-gray-900 max-w-xs truncate">
          {enrollment.course.description}
        </div>
      )
    },
    {
      key: 'teacher',
      label: 'Teacher',
      render: (_: any, enrollment: Enrollment) => (
        <div className="text-sm text-gray-900">
          {enrollment.course.teacher ? `${enrollment.course.teacher.firstName} ${enrollment.course.teacher.lastName}` : 'N/A'}
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
      key: 'credits',
      label: 'Credits',
      render: (_: any, enrollment: Enrollment) => (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
          {enrollment.course.credits} credits
        </span>
      )
    },
    {
      key: 'duration',
      label: 'Duration',
      render: (_: any, enrollment: Enrollment) => (
        <span className="text-sm text-gray-900">{enrollment.course.duration} weeks</span>
      )
    },
    {
      key: 'status',
      label: 'Enrollment Status',
      render: (_: any, enrollment: Enrollment) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          enrollment.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
          enrollment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {enrollment.status}
        </span>
      )
    },
    {
      key: 'enrolledAt',
      label: 'Enrolled',
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
          {enrollment.status === 'ACTIVE' ? (
            <button
              onClick={() => handleViewDetails(enrollment)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View Details
            </button>
          ) : enrollment.status === 'PENDING' ? (
            <span className="text-gray-500 text-sm">
              Waiting for approval
            </span>
          ) : enrollment.status === 'DROPPED' ? (
            <span className="text-red-500 text-sm">
              Enrollment rejected
            </span>
          ) : (
            <span className="text-gray-500 text-sm">
              {enrollment.status}
            </span>
          )}
        </div>
      )
    }
  ];

  const pendingEnrollments = enrollments.filter(e => e.status === 'PENDING');
  const rejectedEnrollments = enrollments.filter(e => e.status === 'DROPPED');

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Courses</h1>
        <p className="text-gray-600 mt-2">View all your enrolled courses and their details</p>
        
        {/* Pending enrollments alert */}
        {pendingEnrollments.length > 0 && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Pending Course Enrollments
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    You have {pendingEnrollments.length} course enrollment{pendingEnrollments.length > 1 ? 's' : ''} waiting for admin approval. 
                    You'll be able to access the course content once your enrollment is approved.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rejected enrollments alert */}
        {rejectedEnrollments.length > 0 && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Rejected Course Enrollments
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>
                    You have {rejectedEnrollments.length} course enrollment{rejectedEnrollments.length > 1 ? 's' : ''} that were rejected. 
                    Please contact support for more information.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <DataTable
        columns={columns}
        title="Enrolled Courses"
        subtitle="View all your enrolled courses and their details"
        data={enrollments}
        loading={loading}
      />
      
      <PaymentRequiredModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        message={paymentMessage}
      />
    </div>
  );
};

export default CoursesPage; 