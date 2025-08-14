import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { notesAPI } from '../../../../services/api';
import { handleApiError } from '../../../../utils/sweetAlert';

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

interface ApiResponse {
  success: boolean;
  message: string;
  data: Note;
}

const NoteViewPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchNote();
    }
  }, [id]);

  // Keyboard shortcuts for zoom and fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!note?.attachment) return;
      
      switch (e.key) {
        case '+':
        case '=':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleZoomIn();
          }
          break;
        case '-':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleZoomOut();
          }
          break;
        case '0':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleResetZoom();
          }
          break;
        case 'f':
        case 'F':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleFullscreen();
          }
          break;
        case 'Escape':
          if (isFullscreen) {
            handleExitFullscreen();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [note?.attachment, isFullscreen]);

  const fetchNote = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await notesAPI.getById(id!);
      const apiResponse = response.data as ApiResponse;
      setNote(apiResponse.data);
    } catch (error) {
      handleApiError(error, 'Failed to fetch note');
      setError('Failed to load note');
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (fileType: string, isImage: boolean) => {
    if (isImage) return '🖼️';
    
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '📈';
    if (fileType.includes('text')) return '📄';
    if (fileType.includes('csv')) return '📋';
    
    return '📎';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toUpperCase() || '';
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.25));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleExitFullscreen = () => {
    setIsFullscreen(false);
  };

  const renderFilePreview = () => {
    if (!note?.attachment) return null;

    const fileUrl = `${process.env.REACT_APP_IMG_URL || 'http://localhost:4000'}${note.attachment}`;
    const fileName = note.attachment.split('/').pop() || '';
    const fileExtension = getFileExtension(fileName);

    // Image preview
    if (note.isImage) {
      return (
        <div className="mb-6">
          {/* <h3 className="text-lg font-semibold text-gray-900 mb-3">File Preview</h3> */}
          
          {/* Controls */}
          <div className="flex items-center justify-between mb-3 p-3 bg-gray-50 rounded-lg">
            <button
              onClick={handleFullscreen}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? '⛌' : '⛶'}
            </button>
          </div>

          {/* Image Container */}
          <div className={`border border-gray-200 rounded-lg overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : ''}`}>
            {isFullscreen && (
              <div className="absolute top-4 right-4 z-10">
                <button
                  onClick={handleExitFullscreen}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  Exit Fullscreen
                </button>
              </div>
            )}
            <div className={`${isFullscreen ? 'h-full flex items-center justify-center' : ''}`}>
              <img
                src={fileUrl}
                alt={note.title}
                className={`${isFullscreen ? 'max-h-full max-w-full object-contain' : 'w-full h-auto max-h-96 object-contain'}`}
                style={{ transform: `scale(${zoomLevel})` }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
            </div>
            <div className="hidden p-4 bg-gray-50 text-center">
              <p className="text-gray-500">Image failed to load</p>
            </div>
          </div>
        </div>
      );
    }

    // PDF preview
    if (note.attachmentType?.includes('pdf')) {
      return (
        <div className="mb-6">
          
          {/* Controls */}
          <div className="flex items-center justify-between mb-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">PDF Viewer</span>
            </div>
            <button
              onClick={handleFullscreen}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? '⛌' : '⛶'}
            </button>
          </div>

          {/* PDF Container */}
          <div className={`border border-gray-200 rounded-lg overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
            {isFullscreen && (
              <div className="absolute top-4 right-4 z-10">
                <button
                  onClick={handleExitFullscreen}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  Exit Fullscreen
                </button>
              </div>
            )}
            <iframe
              src={`${fileUrl}#toolbar=1&navpanes=1&scrollbar=1`}
              className={`${isFullscreen ? 'w-full h-full' : 'w-full h-96'}`}
              title={note.title}
            />
          </div>
        </div>
      );
    }

    // Text file preview
    if (note.attachmentType?.includes('text')) {
      return (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Text Preview</h3>
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <p className="text-sm text-gray-600">Text files cannot be previewed directly.</p>
            <p className="text-sm text-gray-600">Please download the file to view its contents.</p>
          </div>
        </div>
      );
    }

    // Other file types
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">File Information</h3>
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <p className="text-sm text-gray-600">
            This file type ({fileExtension}) cannot be previewed directly.
          </p>
          <p className="text-sm text-gray-600">Please download the file to view its contents.</p>
        </div>
      </div>
    );
  };

  const handleDownload = async () => {
    if (!note?.attachment) return;
  
    const fileUrl = `${process.env.REACT_APP_IMG_URL || 'http://localhost:4000'}${note.attachment}`;
    const fileName = note.attachment.split('/').pop() || 'download';
  
    try {
      const response = await fetch(fileUrl, {
        method: 'GET',
        mode: 'cors',
      });
  
      if (!response.ok) {
        throw new Error('Failed to download file');
      }
  
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
  
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
  
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  
      // Clean up memory
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download file');
    }
  };
  

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Note Not Found</h2>
        <p className="text-gray-600 mb-6">The note you're looking for doesn't exist or has been removed.</p>
        <button
          onClick={() => navigate('/admin/notes')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Back to Notes
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{note.title}</h1>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>Created: {new Date(note.createdAt).toLocaleDateString()}</span>
            <span>Updated: {new Date(note.updatedAt).toLocaleDateString()}</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              note.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {note.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => navigate('/admin/notes')}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Back to Notes
          </button>
          <button
            onClick={() => navigate(`/admin/courses/${note.courseId}`)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            View Course
          </button>
        </div>
      </div>

      {/* Note Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">
                {note.description || 'No description provided.'}
              </p>
            </div>
          </div>
           {/* File Preview */}
      {note.attachment && renderFilePreview()}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Course Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Course Information</h3>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-600">Course:</span>
                <p className="text-sm text-gray-900">
                  {note.course ? `${note.course.code} - ${note.course.title}` : 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Author:</span>
                <p className="text-sm text-gray-900">
                  {note.author ? `${note.author.firstName} ${note.author.lastName}` : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* File Information */}
          {note.attachment && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">File Information</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">
                    {getFileIcon(note.attachmentType || '', note.isImage || false)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {note.attachment.split('/').pop()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {getFileExtension(note.attachment.split('/').pop() || '')} File
                    </p>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Size:</span>
                    <span className="text-gray-900">
                      {note.attachmentSize ? formatFileSize(note.attachmentSize) : 'Unknown'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Type:</span>
                    <span className="text-gray-900">{note.attachmentType || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Category:</span>
                    <span className="text-gray-900">
                      {note.isImage ? 'Image' : 'Document'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleDownload}
                  className="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
                >
                  Download File
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoteViewPage; 