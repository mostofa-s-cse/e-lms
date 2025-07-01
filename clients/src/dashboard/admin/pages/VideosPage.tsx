import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { videosAPI, coursesAPI } from '../../../services/api';
import DataTable from '../../../pages/DataTable';
import Modal from '../../../components/Modal';
import { Form, FormField, FormActions } from '../../../components/Form';
import { 
  showSuccessAlert, 
  showDeleteConfirmDialog, 
  showFormErrorAlert,
  handleApiError 
} from '../../../utils/sweetAlert';

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
  teacher?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

interface Course {
  id: string;
  title: string;
  code: string;
}

interface VideosResponse {
  data: Video[];
}

interface CoursesResponse {
  data: Course[];
}

const VideosPage = () => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState<Video[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 0,
    courseId: '',
    videoUrl: videoFile,
    thumbnail: thumbnailFile
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchVideos();
    fetchCourses();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await videosAPI.getAll();
      setVideos((response.data as VideosResponse).data);
    } catch (error) {
      handleApiError(error, 'Failed to fetch videos');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await coursesAPI.getAll();
      setCourses((response.data as CoursesResponse).data);
    } catch (error) {
      handleApiError(error, 'Failed to fetch courses');
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
        fetchVideos();
      } catch (error) {
        handleApiError(error, 'Failed to delete video');
      }
    }
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const videoUrl = e.target.files?.[0] || null;
    console.log('Video file selected:', videoUrl);
    setFormData(prev => ({ ...prev, videoUrl }));
  };

  const handleThumbnailFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const thumbnail = e.target.files?.[0] || null;
    console.log('Thumbnail file selected:', thumbnail);
    setFormData(prev => ({ ...prev, thumbnail }));
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

  const handleCreate = () => {
    setShowModal(true);
    setFormData({
      title: '',
      description: '',
      duration: 0,
      courseId: '',
      videoUrl: null,
      thumbnail: null
    });
  };

  const handleEdit = (video: Video) => {
    setEditingVideo(video);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const submitData = formData;
      await videosAPI.create(submitData);
      setShowModal(false);
      fetchVideos();
      showSuccessAlert(
        'Video Created',
        `"${formData.title}" has been successfully created.`
      );
    } catch (error: any) {
      handleApiError(error, 'Failed to save video');
    }
  };
  

  const courseOptions = courses.map(course => ({
    value: course.id,
    label: `${course.code} - ${course.title}`
  }));

  const columns = [
    {
      key: 'title',
      label: 'Title',
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
      key: 'teacher',
      label: 'Teacher',
      render: (_: any, video: Video) => (
        <div className="text-sm text-gray-900">
          {video.teacher ? `${video.teacher.firstName} ${video.teacher.lastName}` : 'N/A'}
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
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/admin/videos/${video.id}`)}
            className="text-green-600 hover:text-green-900 text-sm font-medium"
          >
            View Details
          </button>
        </div>
      )
    }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Videos Management</h1>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Video
        </button>
      </div>

      <DataTable
        columns={columns}
        data={videos}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
        title="Videos"
        subtitle="Manage videos and their details"
      />

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingVideo ? 'Edit Video' : 'Create Video'}
        size="lg"
        key={editingVideo ? `edit-${editingVideo.id}` : 'create'}
      >
        <Form onSubmit={handleSubmit} >
          {formErrors.general && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {formErrors.general}
            </div>
          )}

          <FormField
            label="Title"
            name="title"
            value={formData.title}
            onChange={(value) => setFormData({ ...formData, title: value as string })}
            error={formErrors.title}
            required
          />

          <FormField
            label="Course"
            name="courseId"
            type="select"
            value={formData.courseId}
            onChange={(value) => setFormData({ ...formData, courseId: value as string })}
            options={courseOptions}
            error={formErrors.courseId}
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
              name="videoUrl"
              onChange={handleVideoFileChange}
              className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                formErrors.videoUrl ? 'border-red-500' : 'border-gray-300'
              }`}
              accept="video/*"
            />
            {formErrors.videoUrl && (
              <p className="mt-1 text-sm text-red-600">{formErrors.videoUrl}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Supported formats: MP4, WebM, OGG, AVI, MOV
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Thumbnail File
            </label>
            <input
              type="file"
              name="thumbnail"
              onChange={handleThumbnailFileChange}
              className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                formErrors.thumbnail ? 'border-red-500' : 'border-gray-300'
              }`}
              accept="image/*"
            />
            {formErrors.thumbnail && (
              <p className="mt-1 text-sm text-red-600">{formErrors.thumbnail}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Supported formats: JPG, PNG
            </p>
          </div>

          <FormActions
            onCancel={() => setShowModal(false)}
            submitText={editingVideo ? 'Update' : 'Create'}
          />
        </Form>
      </Modal>
    </div>
  );
};

export default VideosPage; 