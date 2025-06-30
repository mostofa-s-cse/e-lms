import React, { useState, useEffect } from 'react';
import { notesAPI } from '../../../services/api';
import DataTable from '../../../components/DataTable';
import { handleApiError, showSuccessAlert } from '../../../utils/sweetAlert';

interface Note {
  id: string;
  title: string;
  content: string;
  fileUrl?: string;
  fileName?: string;
  courseId: string;
  course?: {
    id: string;
    title: string;
    code: string;
  };
  teacher?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

interface NotesResponse {
  data: Note[];
}

const NotesPage = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await notesAPI.getAll();
      setNotes((response.data as NotesResponse).data);
    } catch (error) {
      handleApiError(error, 'Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (note: Note) => {
    if (note.fileUrl) {
      try {
        window.open(note.fileUrl, '_blank');
        await showSuccessAlert('Download Started', `Downloading ${note.fileName || 'file'}...`);
      } catch (error) {
        handleApiError(error, 'Failed to download file');
      }
    }
  };

  const columns = [
    {
      key: 'title',
      label: 'Note',
      render: (title: string, note: Note) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{title}</div>
          {note.fileName && (
            <div className="text-sm text-blue-600">📎 {note.fileName}</div>
          )}
        </div>
      )
    },
    {
      key: 'content',
      label: 'Content',
      render: (content: string) => (
        <div className="text-sm text-gray-900 max-w-xs truncate">
          {content}
        </div>
      )
    },
    {
      key: 'course',
      label: 'Course',
      render: (_: any, note: Note) => (
        <div className="text-sm text-gray-900">
          {note.course ? `${note.course.code} - ${note.course.title}` : 'N/A'}
        </div>
      )
    },
    {
      key: 'teacher',
      label: 'Teacher',
      render: (_: any, note: Note) => (
        <div className="text-sm text-gray-900">
          {note.teacher ? `${note.teacher.firstName} ${note.teacher.lastName}` : 'N/A'}
        </div>
      )
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (date: string) => new Date(date).toLocaleDateString()
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, note: Note) => (
        <div className="text-sm font-medium">
          {note.fileUrl && (
            <button
              onClick={() => handleDownload(note)}
              className="text-blue-600 hover:text-blue-900"
            >
              Download
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Course Notes</h1>
        <p className="text-gray-600 mt-2">Access all notes and materials for your enrolled courses</p>
      </div>

      <DataTable
        columns={columns}
        data={notes}
        loading={loading}
      />
    </div>
  );
};

export default NotesPage; 