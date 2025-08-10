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
        <button
          onClick={() => handleViewDetails(enrollment)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          View Details
        </button>
      )
    }
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Courses</h1>
        <p className="text-gray-600 mt-2">View all your enrolled courses and their details</p>
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