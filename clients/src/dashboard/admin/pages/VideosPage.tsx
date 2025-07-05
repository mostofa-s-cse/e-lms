import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { videosAPI, coursesAPI } from '../../../services/api';
import Modal from '../../../components/Modal';
import { Form, FormField, FormActions } from '../../../components/Form';
import SearchableDropdown from '../../../components/SearchableDropdown';
import { 
  showSuccessAlert, 
  showDeleteConfirmDialog, 
  handleApiError 
} from '../../../utils/sweetAlert';
import { DataTable } from '../../../components';

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
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 0,
    courseId: '',
    videoUrl: null as File | null,
    thumbnail: null as File | null
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
    const file = e.target.files?.[0] || null;
    console.log('Video file selected:', file);
    setFormData(prev => ({ ...prev, videoUrl: file }));
    // Clear error when file is selected
    if (file) {
      setFormErrors(prev => ({ ...prev, videoUrl: '' }));
    }
  };

  const handleThumbnailFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    console.log('Thumbnail file selected:', file);
    setFormData(prev => ({ ...prev, thumbnail: file }));
    // Clear error when file is selected
    if (file) {
      setFormErrors(prev => ({ ...prev, thumbnail: '' }));
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
    setFormData({
      title: video.title,
      description: video.description,
      duration: video.duration,
      courseId: video.courseId,
      videoUrl: null, // Keep existing video file
      thumbnail: null  // Keep existing thumbnail
    });
    setFormErrors({});
    setShowModal(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    // Required field validations
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }

    if (!formData.courseId) {
      errors.courseId = 'Course is required';
    }

    if (!formData.duration || formData.duration <= 0) {
      errors.duration = 'Duration must be greater than 0';
    }

    // File validations - only required for new videos, optional for editing
    if (!editingVideo) {
      // Creating new video - files are required
      if (!formData.videoUrl) {
        errors.videoUrl = 'Video file is required';
      } else if (formData.videoUrl instanceof File) {
        const maxSize = 500 * 1024 * 1024; // 500MB
        if (formData.videoUrl.size > maxSize) {
          errors.videoUrl = 'Video file size must be less than 500MB';
        }
        
        const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov', 'video/quicktime'];
        if (!allowedTypes.includes(formData.videoUrl.type)) {
          errors.videoUrl = 'Please select a valid video file (MP4, WebM, OGG, AVI, MOV)';
        }
      }

      if (!formData.thumbnail) {
        errors.thumbnail = 'Thumbnail image is required';
      } else if (formData.thumbnail instanceof File) {
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (formData.thumbnail.size > maxSize) {
          errors.thumbnail = 'Thumbnail file size must be less than 10MB';
        }
        
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(formData.thumbnail.type)) {
          errors.thumbnail = 'Please select a valid image file (JPG, PNG, WebP)';
        }
      }
    } else {
      // Editing existing video - validate files only if new ones are selected
      if (formData.videoUrl instanceof File) {
        const maxSize = 500 * 1024 * 1024; // 500MB
        if (formData.videoUrl.size > maxSize) {
          errors.videoUrl = 'Video file size must be less than 500MB';
        }
        
        const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov', 'video/quicktime'];
        if (!allowedTypes.includes(formData.videoUrl.type)) {
          errors.videoUrl = 'Please select a valid video file (MP4, WebM, OGG, AVI, MOV)';
        }
      }

      if (formData.thumbnail instanceof File) {
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (formData.thumbnail.size > maxSize) {
          errors.thumbnail = 'Thumbnail file size must be less than 10MB';
        }
        
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(formData.thumbnail.type)) {
          errors.thumbnail = 'Please select a valid image file (JPG, PNG, WebP)';
        }
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setFormErrors({});

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      const submitData = formData;
      
      if (editingVideo) {
        // Update existing video
        await videosAPI.update(editingVideo.id, submitData);
        showSuccessAlert(
          'Video Updated',
          `"${formData.title}" has been successfully updated.`
        );
      } else {
        // Create new video
        await videosAPI.create(submitData);
        showSuccessAlert(
          'Video Created',
          `"${formData.title}" has been successfully created.`
        );
      }
      
      setShowModal(false);
      setEditingVideo(null);
      setFormData({
        title: '',
        description: '',
        duration: 0,
        courseId: '',
        videoUrl: null,
        thumbnail: null
      });
      fetchVideos();
    } catch (error: any) {
      if (error.response?.data?.errors) {
        // Handle server-side validation errors
        const serverErrors: Record<string, string> = {};
        Object.keys(error.response.data.errors).forEach(key => {
          serverErrors[key] = error.response.data.errors[key][0];
        });
        setFormErrors(serverErrors);
      } else {
        handleApiError(error, editingVideo ? 'Failed to update video' : 'Failed to create video');
      }
    }
  };

  const handleView = (video: Video) => {
    navigate(`/admin/videos/${video.id}`);
  };



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
        onView={handleView}
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
            label="Title *"
            name="title"
            value={formData.title}
            onChange={(value) => setFormData({ ...formData, title: value as string })}
            error={formErrors.title}
            required
          />

          <SearchableDropdown
            label="Course *"
            value={formData.courseId}
            onChange={(value) => setFormData({ ...formData, courseId: value })}
            options={courses.map(course => ({
              value: course.id,
              label: `${course.code} - ${course.title}`
            }))}
            placeholder="Select a course..."
            error={formErrors.courseId}
            required
          />

          <FormField
            label="Description *"
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
              label="Duration (seconds) *"
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
              Upload Video File {!editingVideo && <span className="text-red-500">*</span>}
            </label>
            <input
              type="file"
              name="videoUrl"
              onChange={handleVideoFileChange}
              className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                formErrors.videoUrl ? 'border-red-500' : 'border-gray-300'
              }`}
              accept="video/*"
              required={!editingVideo}
            />
            {formData.videoUrl && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800">
                  <strong>Selected:</strong> {formData.videoUrl.name}
                </p>
                <p className="text-xs text-green-600">
                  Size: {(formData.videoUrl.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            )}
            {formErrors.videoUrl && (
              <p className="mt-1 text-sm text-red-600">{formErrors.videoUrl}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Supported formats: MP4, WebM, OGG, AVI, MOV (Max size: 500MB)
              {editingVideo && ' - Leave empty to keep existing video'}
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Thumbnail File {!editingVideo && <span className="text-red-500">*</span>}
            </label>
            <input
              type="file"
              name="thumbnail"
              onChange={handleThumbnailFileChange}
              className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                formErrors.thumbnail ? 'border-red-500' : 'border-gray-300'
              }`}
              accept="image/*"
              required={!editingVideo}
            />
            {formData.thumbnail && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800">
                  <strong>Selected:</strong> {formData.thumbnail.name}
                </p>
                <p className="text-xs text-green-600">
                  Size: {(formData.thumbnail.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            )}
            {formErrors.thumbnail && (
              <p className="mt-1 text-sm text-red-600">{formErrors.thumbnail}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Supported formats: JPG, PNG, WebP (Max size: 10MB)
              {editingVideo && ' - Leave empty to keep existing thumbnail'}
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