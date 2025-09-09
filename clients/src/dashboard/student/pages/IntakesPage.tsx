import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { studentAPI, enrollmentsAPI } from '../../../services/api';
import DataTable from '../../../pages/DataTable';
import { handleApiError } from '../../../utils/sweetAlert';

interface Intake {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  maxStudents: number;
  isActive: boolean;
  createdAt: string;
}

interface Enrollment {
  id: string;
  status: string;
  enrolledAt: string;
  intake: Intake;
  course: {
    id: string;
    title: string;
    code: string;
  };
}

interface EnrollmentsResponse {
  success: boolean;
  data: Enrollment[];
}

const IntakesPage = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchEnrolledIntakes();
    }
  }, [user?.id]);

  const fetchEnrolledIntakes = async () => {
    try {
      setLoading(true);
      const response = await enrollmentsAPI.getByStudent(user!.id);
      const data = response.data as EnrollmentsResponse;
      if (data.success) {
        // Filter enrollments that have intakes
        const enrollmentsWithIntakes = data.data.filter(enrollment => enrollment.intake);
        setEnrollments(enrollmentsWithIntakes);
      }
    } catch (error) {
      handleApiError(error, 'Failed to fetch enrolled intakes');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: 'intake',
      label: 'Intake',
      render: (_: any, enrollment: Enrollment) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{enrollment.intake.name}</div>
          <div className="text-sm text-gray-500">{enrollment.intake.description}</div>
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
      key: 'startDate',
      label: 'Start Date',
      render: (_: any, enrollment: Enrollment) => (
        <span className="text-sm text-gray-900">
          {new Date(enrollment.intake.startDate).toLocaleDateString()}
        </span>
      )
    },
    {
      key: 'endDate',
      label: 'End Date',
      render: (_: any, enrollment: Enrollment) => (
        <span className="text-sm text-gray-900">
          {new Date(enrollment.intake.endDate).toLocaleDateString()}
        </span>
      )
    },
    {
      key: 'maxStudents',
      label: 'Max Students',
      render: (_: any, enrollment: Enrollment) => (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
          {enrollment.intake.maxStudents} students
        </span>
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
    }
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Intakes</h1>
        <p className="text-gray-600 mt-2">View all your enrolled intakes and their details</p>
      </div>

      <DataTable
        columns={columns}
        title="Enrolled Intakes"
        subtitle="View all your enrolled intakes and their details"
        data={enrollments}
        loading={loading}
      />
    </div>
  );
};

export default IntakesPage; 