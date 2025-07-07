import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { studentAPI, enrollmentsAPI, videosAPI } from '../../../../services/api';
import DataTable from '../../../../pages/DataTable';
import { handleApiError, showSuccessAlert } from '../../../../utils/sweetAlert';
import { checkPaymentAccess } from '../../../../utils/paymentVerification';
import PaymentRequiredModal from '../../../../components/PaymentRequiredModal';

interface Video {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnail?: string;
  duration: number;
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

interface VideosResponse {
  success: boolean;
  data: Video[];
}

interface EnrollmentsResponse {
  success: boolean;
  data: Enrollment[];
}

const VideosPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState('');

  useEffect(() => {
    if (user?.id) {
      fetchCourseVideos();
    }
  }, [user?.id]);

  const fetchCourseVideos = async () => {
    try {
      setLoading(true);
      
      // First get student's enrollments to get course IDs
      const enrollmentsResponse = await enrollmentsAPI.getByStudent(user!.id);
      const enrollmentsData = enrollmentsResponse.data as EnrollmentsResponse;
      
      if (enrollmentsData.success && enrollmentsData.data.length > 0) {
        // Get course IDs from enrollments
        const courseIds = enrollmentsData.data.map(enrollment => enrollment.courseId);
        
        // Fetch videos for all enrolled courses
        const allVideos: Video[] = [];
        
        for (const courseId of courseIds) {
          try {
            const videosResponse = await videosAPI.getByCourse(courseId);
            const videosData = videosResponse.data as VideosResponse;
            if (videosData.success && videosData.data.length > 0) {
              allVideos.push(...videosData.data);
            }
          } catch (error) {
            console.error(`Failed to fetch videos for course ${courseId}:`, error);
          }
        }
        
        setVideos(allVideos);
      } else {
        setVideos([]);
      }
    } catch (error) {
      handleApiError(error, 'Failed to fetch course videos');
    } finally {
      setLoading(false);
    }
  };

  const handleWatch = async (video: Video) => {
    if (video.videoUrl) {
      try {
        const videoUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:4000'}${video.videoUrl}`;
        window.open(videoUrl, '_blank');
        await showSuccessAlert('Video Opened', `Opening "${video.title}" in a new tab...`);
      } catch (error) {
        handleApiError(error, 'Failed to open video');
      }
    }
  };

  const handleViewDetails = async (video: Video) => {
    if (!user?.id) return;
    
    try {
      const paymentResult = await checkPaymentAccess(user.id);
      if (paymentResult.hasAccess) {
        navigate(`/student/videos/${video.id}`);
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

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const columns = [
    {
      key: 'title',
      label: 'Video',
      render: (title: string, video: Video) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{title}</div>
          <div className="text-sm text-gray-500">{formatDuration(video.duration)}</div>
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
      key: 'course',
      label: 'Course',
      render: (_: any, video: Video) => (
        <div className="text-sm text-gray-900">
          {video.course ? `${video.course.code} - ${video.course.title}` : 'N/A'}
        </div>
      )
    },
    {
      key: 'author',
      label: 'Author',
      render: (_: any, video: Video) => (
        <div className="text-sm text-gray-900">
          {video.author ? `${video.author.firstName} ${video.author.lastName}` : 'N/A'}
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
      render: (_: any, video: Video) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleViewDetails(video)}
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
        <h1 className="text-3xl font-bold">Course Videos</h1>
        <p className="text-gray-600 mt-2">Watch educational videos for your enrolled courses</p>
      </div>

      <DataTable
        columns={columns}
        data={videos}
        title="Course Videos"
        subtitle="Watch educational videos for your enrolled courses"
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

export default VideosPage; 