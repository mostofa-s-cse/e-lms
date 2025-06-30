import React, { useState, useEffect } from 'react';
import { videosAPI } from '../../../services/api';
import DataTable from '../../../components/DataTable';

interface Video {
  id: string;
  title: string;
  description: string;
  url: string;
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

interface VideosResponse {
  data: Video[];
}

const VideosPage = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await videosAPI.getAll();
      setVideos((response.data as VideosResponse).data);
    } catch (error) {
      console.error('Failed to fetch videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWatch = (video: Video) => {
    if (video.url) {
      window.open(video.url, '_blank');
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
        <div className="text-sm font-medium">
          {video.url && (
            <button
              onClick={() => handleWatch(video)}
              className="text-blue-600 hover:text-blue-900"
            >
              Watch
            </button>
          )}
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
        loading={loading}
      />
    </div>
  );
};

export default VideosPage; 