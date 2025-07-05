import React from 'react';
import DataTable from '../DataTable';
import { Video } from './types';

interface VideosTabProps {
  videos: Video[];
  loading: boolean;
  onView: (video: Video) => void;
  onEdit: (video: Video) => void;
  onDelete: (video: Video) => void;
  onCreate: () => void;
}

const VideosTab: React.FC<VideosTabProps> = ({ 
  videos, 
  loading, 
  onView, 
  onEdit, 
  onDelete, 
  onCreate 
}) => {
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end items-center">
        <button
          onClick={onCreate}
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
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
};

export default VideosTab; 