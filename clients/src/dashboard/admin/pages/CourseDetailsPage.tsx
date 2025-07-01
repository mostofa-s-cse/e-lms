import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { coursesAPI, videosAPI } from '../../../services/api';
import { handleApiError, showDeleteConfirmDialog, showSuccessAlert } from '../../../utils/sweetAlert';
import DataTable from '../../../pages/DataTable';
import Modal from '../../../components/Modal';
import { Form, FormField, FormActions } from '../../../components/Form';
import { 
  ArrowLeft, 
  BookOpen, 
  Users, 
  Video, 
  Clock, 
  User, 
  Calendar,
  GraduationCap
} from 'lucide-react';
import VideoDetails from '../../../components/VideoDetails';

interface Course {
  id: string;
  title: string;
  description: string;
  code: string;
  credits: number;
  isActive: boolean;
  teacher?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  intakes?: Array<{
    id: string;
    name: string;
    startDate: string;
    endDate: string;
  }>;
  _count?: {
    enrollments: number;
    notes: number;
    videos: number;
    quizzes: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface Video {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
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
}

interface Enrollment {
  id: string;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  intake?: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
  };
  enrolledAt: string;
  status: string;
}

const CourseDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'videos' | 'students'>('overview');
  const [showModal, setShowModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    duration: 0,
    courseId: '',
    file: null as File | null
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, file });
    }
  };

  const handleCreate = () => {
    setEditingVideo(null);
    setFormData({
      title: '',
      description: '',
      url: '',
      duration: 0,
      courseId: course?.id || '',
      file: null
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleEdit = (video: Video) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      description: video.description,
      url: video.videoUrl,
      duration: video.duration,
      courseId: course?.id || '',
      file: null
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    // Basic validation
    const errors: Record<string, string> = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.courseId) errors.courseId = 'Course is required';
    if (!formData.url.trim() && !formData.file) errors.url = 'Either URL or file is required';
    if (formData.duration < 0) errors.duration = 'Duration must be positive';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('url', formData.url);
      submitData.append('duration', formData.duration.toString());
      submitData.append('courseId', formData.courseId);
      if (formData.file) {
        submitData.append('file', formData.file);
      }

      if (editingVideo) {
        await videosAPI.update(editingVideo.id, submitData);
      } else {
        await videosAPI.create(submitData);
      }
      
      setShowModal(false);
      fetchCourseDetails(); // Refresh the data
    } catch (error: any) {
      console.error('Failed to save video:', error);
      if (error.response?.data?.message) {
        setFormErrors({ general: error.response.data.message });
      }
    }
  };

  const handleDelete = async (video: Video) => {
    const result = await showDeleteConfirmDialog(`"${video.title}"`);
    
    if (result.isConfirmed) {
      try {
        await videosAPI.delete(video.id);
        showSuccessAlert(
          'Video Deleted', 
          `"${video.title}" has been successfully deleted.`
        );
        fetchCourseDetails(); // Refresh the data
      } catch (error) {
        handleApiError(error, 'Failed to delete video');
      }
    }
  };



  useEffect(() => {
    if (id) {
      fetchCourseDetails();
    }
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      console.log('Fetching course details for ID:', id);
      
      const [courseResponse, videosResponse, enrollmentsResponse] = await Promise.all([
        coursesAPI.getById(id!),
        videosAPI.getByCourse(id!),
        coursesAPI.getEnrollments(id!)
      ]);

      // Extract data from nested response structure
      const courseData = (courseResponse.data as any).data || courseResponse.data;
      const videosData = (videosResponse.data as any).data || videosResponse.data || [];
      const enrollmentsData = (enrollmentsResponse.data as any).data || enrollmentsResponse.data || [];

      setCourse(courseData as Course);
      setVideos(videosData as Video[]);
      setEnrollments(enrollmentsData as Enrollment[]);
    } catch (error) {
      console.error('Error fetching course details:', error);
      handleApiError(error, 'Failed to fetch course details');
      navigate('/admin/courses');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (video: Video) => {
      navigate(`/admin/videos/${video.id}`);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getTotalVideoDuration = () => {
    return videos.reduce((total, video) => total + video.duration, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Course not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/courses')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Courses</span>
          </button>
        </div>
        <div className="text-right">
          <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
          <p className="text-gray-600">{course.code}</p>
        </div>
      </div>

      {/* Course Status Badge */}
      <div className="mb-6">
        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
          course.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {course.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('videos')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'videos'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Videos ({videos.length})
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'students'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Students ({enrollments.length})
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course Information */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Course Information</h2>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <BookOpen className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Course Code</p>
                    <p className="font-medium">{course.code}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <GraduationCap className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Credits</p>
                    <p className="font-medium">{course.credits} credits</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Teacher</p>
                    <p className="font-medium">
                      {course.teacher ? `${course.teacher.firstName} ${course.teacher.lastName}` : 'N/A'}
                    </p>
                    {course.teacher && (
                      <p className="text-xs text-gray-500">{course.teacher.email}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Created</p>
                    <p className="font-medium">{new Date(course.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {course.intakes && course.intakes.length > 0 && (
                  <div className="flex items-start space-x-3">
                    <GraduationCap className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Associated Intakes</p>
                      <div className="space-y-1 mt-1">
                        {course.intakes.map((intake) => (
                          <div key={intake.id} className="text-sm">
                            <span className="font-medium">{intake.name}</span>
                            <span className="text-gray-500 ml-2">
                              ({new Date(intake.startDate).toLocaleDateString()} - {new Date(intake.endDate).toLocaleDateString()})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-3">Description</h3>
              <p className="text-gray-700 leading-relaxed">{course.description}</p>
            </div>
          </div>

          {/* Statistics */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Course Statistics</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Video className="w-5 h-5 text-blue-500" />
                    <span className="text-sm text-gray-600">Total Videos</span>
                  </div>
                  <span className="font-semibold">{course._count?.videos || videos.length}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-gray-600">Total Duration</span>
                  </div>
                  <span className="font-semibold">{formatDuration(getTotalVideoDuration())}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-purple-500" />
                    <span className="text-sm text-gray-600">Enrolled Students</span>
                  </div>
                  <span className="font-semibold">{course._count?.enrollments || enrollments.length}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <BookOpen className="w-5 h-5 text-orange-500" />
                    <span className="text-sm text-gray-600">Notes</span>
                  </div>
                  <span className="font-semibold">{course._count?.notes || 0}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <GraduationCap className="w-5 h-5 text-indigo-500" />
                    <span className="text-sm text-gray-600">Quizzes</span>
                  </div>
                  <span className="font-semibold">{course._count?.quizzes || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'videos' && (
        <div className="space-y-6">
            <div className="flex justify-end items-center">
            <button
            onClick={handleCreate}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add Video
          </button>
          </div>
          <DataTable
            columns={[
              {
                key: 'title',
                label: 'Video',
                render: (title: string, video: Video) => (
                  <div>
                    <div className="text-sm font-medium text-gray-900">{title}</div>
                    <div className="text-sm text-gray-500 mt-1">{video.description}</div>
                  </div>
                )
              },
              {
                key: 'duration',
                label: 'Duration',
                render: (duration: number) => (
                  <span className="text-sm text-gray-900">
                    {formatDuration(duration)}
                  </span>
                )
              },
              {
                key: 'createdAt',
                label: 'Created',
                render: (date: string) => (
                  <span className="text-sm text-gray-900">
                    {new Date(date).toLocaleDateString()}
                  </span>
                )
              }
            ]}
            data={videos}
            loading={loading}
            title="All Videos"
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      )}

      {activeTab === 'students' && (
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
      )}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingVideo ? 'Edit Video' : 'Create Video'}
        size="lg"
      >
        <Form onSubmit={handleSubmit}>
          {formErrors.general && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {formErrors.general}
            </div>
          )}

          <FormField
            label="Title"
            name="title"
            type="text"
            value={formData.title}
            onChange={(value) => setFormData({ ...formData, title: value as string })}
            error={formErrors.title}
            required
          />

          <FormField
            label="Description"
            name="description"
            type="textarea"
            value={formData.description}
            onChange={(value) => setFormData({ ...formData, description: value as string })}
            error={formErrors.description}
            required
            rows={4}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Video URL"
              name="url"
              type="text"
              value={formData.url}
              onChange={(value) => setFormData({ ...formData, url: value as string })}
              error={formErrors.url}
              placeholder="https://example.com/video.mp4"
            />

            <FormField
              label="Duration (seconds)"
              name="duration"
              type="number"
              value={formData.duration}
              onChange={(value) => setFormData({ ...formData, duration: value as number })}
              error={formErrors.duration}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Video File
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              accept="video/*"
            />
            <p className="mt-1 text-sm text-gray-500">
              Supported formats: MP4, WebM, OGG, AVI, MOV
            </p>
          </div>

          <FormActions
            onCancel={() => setShowModal(false)}
            submitText={editingVideo ? 'Update Video' : 'Create Video'}
          />
        </Form>
      </Modal>
    </div>
  );
};

export default CourseDetailsPage;
