import React from 'react';
import DataTable from '../DataTable';
import { Enrollment } from './types';

interface StudentsTabProps {
  enrollments: Enrollment[];
}

const StudentsTab: React.FC<StudentsTabProps> = ({ enrollments }) => {
  return (
    <div className="space-y-6">
      <DataTable
        columns={[
          {
            key: 'student',
            label: 'Student',
            render: (_: any, enrollment: Enrollment) => (
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {enrollment.student.firstName} {enrollment.student.lastName}
                </div>
              </div>
            )
          },
          {
            key: 'email',
            label: 'Email',
            render: (_: any, enrollment: Enrollment) => (
              <div className="text-sm text-gray-900">{enrollment.student.email}</div>
            )
          },
          {
            key: 'intake',
            label: 'Intake',
            render: (_: any, enrollment: Enrollment) => (
              <div className="text-sm text-gray-900">
                {enrollment.intake ? enrollment.intake.name : 'N/A'}
              </div>
            )
          },
          {
            key: 'status',
            label: 'Status',
            render: (_: any, enrollment: Enrollment) => (
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                enrollment.status === 'ACTIVE' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {enrollment.status}
              </span>
            )
          },
          {
            key: 'enrolledAt',
            label: 'Enrolled Date',
            render: (_: any, enrollment: Enrollment) => (
              <span className="text-sm text-gray-900">
                {new Date(enrollment.enrolledAt).toLocaleDateString()}
              </span>
            )
          }
        ]}
        data={enrollments}
        loading={false}
        title="Enrolled Students"
      />
    </div>
  );
};

export default StudentsTab; 