import React, { useState, useEffect } from 'react';
import { intakesAPI } from '../../../services/api';
import DataTable from '../../../components/DataTable';
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

interface IntakesResponse {
  data: Intake[];
}

const IntakesPage = () => {
  const [intakes, setIntakes] = useState<Intake[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIntakes();
  }, []);

  const fetchIntakes = async () => {
    try {
      setLoading(true);
      const response = await intakesAPI.getAll();
      setIntakes((response.data as IntakesResponse).data);
    } catch (error) {
      handleApiError(error, 'Failed to fetch intakes');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Intake',
      render: (name: string, intake: Intake) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{name}</div>
          <div className="text-sm text-gray-500">{intake.description}</div>
        </div>
      )
    },
    {
      key: 'startDate',
      label: 'Start Date',
      render: (date: string) => (
        <span className="text-sm text-gray-900">
          {new Date(date).toLocaleDateString()}
        </span>
      )
    },
    {
      key: 'endDate',
      label: 'End Date',
      render: (date: string) => (
        <span className="text-sm text-gray-900">
          {new Date(date).toLocaleDateString()}
        </span>
      )
    },
    {
      key: 'maxStudents',
      label: 'Max Students',
      render: (maxStudents: number) => (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
          {maxStudents} students
        </span>
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
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (date: string) => new Date(date).toLocaleDateString()
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
        data={intakes}
        loading={loading}
      />
    </div>
  );
};

export default IntakesPage; 