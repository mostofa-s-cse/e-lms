import React, { useState, useEffect } from 'react';
import { videosAPI, coursesAPI } from '../../../services/api';
import DataTable from '../../../pages/DataTable';
import Modal from '../../../components/Modal';
import { Form, FormField, FormActions } from '../../../components/Form';
import {
  showSuccessAlert,
  showErrorAlert,
  showDeleteConfirmDialog,
  showFormErrorAlert,
  handleApiError
} from '../../../utils/sweetAlert';

interface Video {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  courseId: string;
  course?: {
    title: string;
  };
  createdAt: string;
}

interface VideosResponse {
  data: Video[];
}

const VideosPage = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    video: null as File | null,
    thumbnail: null as File | null
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchVideos();
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

  const handleCreate = () => {
    setEditingVideo(null);
    setFormData({
      title: '',
      description: '',
      courseId: '',
      video: null,
      thumbnail: null
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleEdit = (video: Video) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      description: video.description,
      courseId: video.courseId,
      video: null,
      thumbnail: null
    });
    setFormErrors({});
    setShowModal(true);
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

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData({ ...formData, video: file });
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData({ ...formData, thumbnail: file });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    const errors: Record<string, string> = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.courseId) errors.courseId = 'Course is required';
    if (!editingVideo && !formData.video) errors.video = 'Video file is required';

    if (Object.keys(errors).length > 0) {
      showFormErrorAlert(errors);
      setFormErrors(errors);
      return;
    }

    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('courseId', formData.courseId);
      if (formData.video) {
        submitData.append('video', formData.video);
      }
      if (formData.thumbnail) {
        submitData.append('thumbnail', formData.thumbnail);
      }

      if (editingVideo) {
        await videosAPI.update(editingVideo.id, submitData);
        showSuccessAlert(
          'Video Updated', 
          `"${formData.title}" has been successfully updated.`
        );
      } else {
        await videosAPI.create(submitData);
        showSuccessAlert(
          'Video Created', 
          `"${formData.title}" has been successfully created.`
        );
      }
      setShowModal(false);
      fetchVideos();
    } catch (error: any) {
      if (error.response?.data?.errors) {
        // Handle field-specific errors from server
        const serverErrors: Record<string, string> = {};
        error.response.data.errors.forEach((err: any) => {
          if (err.field) {
            serverErrors[err.field] = err.message;
          }
        });
        showFormErrorAlert(serverErrors);
        setFormErrors(serverErrors);
      } else {
        handleApiError(error, 'Failed to save video');
      }
    }
  };

  const columns = [
    {
      key: 'title',
      label: 'Video',
      render: (title: string, video: Video) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <img
              src={video.thumbnailUrl || '/placeholder-thumbnail.jpg'}
              alt={title}
              className="w-16 h-12 object-cover rounded"
            />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{title}</div>
            <div className="text-sm text-gray-500">{video.course?.title}</div>
          </div>
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
      render: (date: string) => new Date(date).toLocaleDateString()
    }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Videos</h1>
          <p className="text-gray-600 mt-2">Manage course videos and lectures</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Upload Video
        </button>
      </div>

      <DataTable
        columns={columns}
        data={videos}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
      />

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingVideo ? 'Edit Video' : 'Upload Video'}
        size="lg"
      >
        <Form onSubmit={handleSubmit}>
          <FormField
            label="Title"
            name="title"
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
            rows={3}
          />

          <FormField
            label="Course"
            name="courseId"
            type="select"
            value={formData.courseId}
            onChange={(value) => setFormData({ ...formData, courseId: value as string })}
            error={formErrors.courseId}
            required
            options={[
              { value: '', label: 'Select a course' },
              { value: '1', label: 'Course 1' },
              { value: '2', label: 'Course 2' }
            ]}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Video File {!editingVideo && '*'}
            </label>
            <input
              type="file"
              onChange={handleVideoChange}
              accept="video/*"
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {formErrors.video && (
              <p className="mt-1 text-sm text-red-600">{formErrors.video}</p>
            )}
            {editingVideo && (
              <p className="mt-1 text-sm text-gray-500">
                Current video: {editingVideo.title}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thumbnail (Optional)
            </label>
            <input
              type="file"
              onChange={handleThumbnailChange}
              accept="image/*"
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {editingVideo && editingVideo.thumbnailUrl && (
              <p className="mt-1 text-sm text-gray-500">
                Current thumbnail available
              </p>
            )}
          </div>

          <FormActions
            onCancel={() => setShowModal(false)}
            submitText={editingVideo ? 'Update' : 'Upload'}
          />
        </Form>
      </Modal>
    </div>
  );
};

export default VideosPage; 