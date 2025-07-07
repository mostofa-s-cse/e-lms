import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { studentAPI, enrollmentsAPI, notesAPI } from '../../../services/api';
import DataTable from '../../../pages/DataTable';
import { handleApiError, showSuccessAlert } from '../../../utils/sweetAlert';
import { checkPaymentAccess } from '../../../utils/paymentVerification';
import PaymentRequiredModal from '../../../components/PaymentRequiredModal';

interface Note {
  id: string;
  title: string;
  description?: string;
  attachment?: string;
  isImage?: boolean;
  attachmentSize?: number;
  attachmentType?: string;
  isActive: boolean;
  courseId: string;
  course?: {
    id: string;
    title: string;
    code: string;
  };
  author?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Enrollment {
  id: string;
  courseId: string;
  course: {
    id: string;
    title: string;
    code: string;
  };
}

interface NotesResponse {
  success: boolean;
  data: Note[];
}

interface EnrollmentsResponse {
  success: boolean;
  data: Enrollment[];
}

const NotesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState('');

  useEffect(() => {
    if (user?.id) {
      fetchCourseNotes();
    }
  }, [user?.id]);

  const fetchCourseNotes = async () => {
    try {
      setLoading(true);
      
      // First get student's enrollments to get course IDs
      const enrollmentsResponse = await enrollmentsAPI.getByStudent(user!.id);
      const enrollmentsData = enrollmentsResponse.data as EnrollmentsResponse;
      
      if (enrollmentsData.success && enrollmentsData.data.length > 0) {
        // Get course IDs from enrollments
        const courseIds = enrollmentsData.data.map(enrollment => enrollment.courseId);
        
        // Fetch notes for all enrolled courses
        const allNotes: Note[] = [];
        
        for (const courseId of courseIds) {
          try {
            const notesResponse = await notesAPI.getByCourse(courseId);
            const notesData = notesResponse.data as NotesResponse;
            if (notesData.success && notesData.data.length > 0) {
              allNotes.push(...notesData.data);
            }
          } catch (error) {
            console.error(`Failed to fetch notes for course ${courseId}:`, error);
          }
        }
        
        setNotes(allNotes);
      } else {
        setNotes([]);
      }
    } catch (error) {
      handleApiError(error, 'Failed to fetch course notes');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (note: Note) => {
    if (note.attachment) {
      try {
        const fileUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:4000'}${note.attachment}`;
        window.open(fileUrl, '_blank');
        const fileName = note.attachment.split('/').pop() || 'file';
        await showSuccessAlert('Download Started', `Downloading ${fileName}...`);
      } catch (error) {
        handleApiError(error, 'Failed to download file');
      }
    }
  };

  const handleViewDetails = async (note: Note) => {
    if (!user?.id) return;
    
    try {
      const paymentResult = await checkPaymentAccess(user.id);
      if (paymentResult.hasAccess) {
        navigate(`/student/notes/${note.id}`);
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
      key: 'title',
      label: 'Note',
      render: (title: string, note: Note) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{title}</div>
          {note.attachment && (
            <div className="text-sm text-blue-600">📎 {note.attachment.split('/').pop()}</div>
          )}
        </div>
      )
    },
    {
      key: 'description',
      label: 'Description',
      render: (description: string) => (
        <div className="text-sm text-gray-900 max-w-xs truncate">
          {description || 'No description'}
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
      key: 'author',
      label: 'Author',
      render: (_: any, note: Note) => (
        <div className="text-sm text-gray-900">
          {note.author ? `${note.author.firstName} ${note.author.lastName}` : 'N/A'}
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
        <div className="flex space-x-2">
          <button
            onClick={() => handleViewDetails(note)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View Details
          </button>
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
        title="Course Notes"
        subtitle="Access all notes and materials for your enrolled courses"
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

export default NotesPage; 