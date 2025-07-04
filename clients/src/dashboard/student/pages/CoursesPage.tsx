import React, { useState, useEffect } from 'react';
import { coursesAPI } from '../../../services/api';
import DataTable from '../../../pages/DataTable';
import { handleApiError } from '../../../utils/sweetAlert';

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

interface CoursesResponse {
  data: Course[];
}

const CoursesPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await coursesAPI.getAll();
      setCourses((response.data as CoursesResponse).data);
    } catch (error) {
      handleApiError(error, 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: 'title',
      label: 'Course',
      render: (title: string, course: Course) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{title}</div>
          <div className="text-sm text-gray-500">{course.code}</div>
        </div>
      )
    },
    {
      key: 'description',
      label: 'Description',
      render: (description: string) => (
        <div className="text-sm text-gray-900 max-w-xs truncate">
          {description}
        </div>
      )
    },
    {
      key: 'teacher',
      label: 'Teacher',
      render: (_: any, course: Course) => (
        <div className="text-sm text-gray-900">
          {course.teacher ? `${course.teacher.firstName} ${course.teacher.lastName}` : 'N/A'}
        </div>
      )
    },
    {
      key: 'credits',
      label: 'Credits',
      render: (credits: number) => (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
          {credits} credits
        </span>
      )
    },
    {
      key: 'price',
      label: 'Price',
      render: (price: number) => (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          ${price.toFixed(2)}
        </span>
      )
    },
    {
      key: 'duration',
      label: 'Duration',
      render: (duration: number) => (
        <span className="text-sm text-gray-900">{duration} weeks</span>
      )
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (isActive: boolean) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {isActive ? 'Active' : 'Inactive'}
        </span>
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
        title="Courses"
        subtitle="View all your enrolled courses and their details"
        data={courses}
        loading={loading}
      />
    </div>
  );
};

export default CoursesPage; 