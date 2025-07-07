import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { videosAPI } from '../../../../services/api';
import { handleApiError } from '../../../../utils/sweetAlert';
import { ArrowLeft, Clock, User, BookOpen, Play } from 'lucide-react';
import VideoPlayer from '../../../../components/VideoPlayer';

interface Video {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  duration: number;
  thumbnail: string;
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

const VideoDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [video, setVideo] = useState<Video | null>(null);
  const [courseVideos, setCourseVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (id) {
      // Test server connectivity first
      const testServer = async () => {
        try {
          const serverUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';
          console.log('Testing server connectivity to:', serverUrl);
          const response = await fetch(`${serverUrl}/health`);
          console.log('Server health check:', response.status, response.statusText);
        } catch (error) {
          console.error('Server not accessible:', error);
        }
      };
      
      testServer();
      fetchVideo();
    }
  }, [id]);

  useEffect(() => {
    if (video?.courseId) {
      fetchCourseVideos();
    }
  }, [video?.courseId]);

  // Debug video data when it changes
  useEffect(() => {
    if (video) {
      console.log('Video data for VideoPlayer:', {
        videoUrl: video.videoUrl,
        thumbnailUrl: video.thumbnail,
        hasThumbnail: !!video.thumbnail,
        thumbnailLength: video.thumbnail?.length
      });
    }
  }, [video]);

  const fetchVideo = async () => {
    try {
      setLoading(true);
      const response = await videosAPI.getById(id!);
      console.log('Video API response:', response);
      const videoData = (response.data as any).data || response.data;
      setVideo(videoData as Video);
      
      // Debug video URL
      const videoUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:4000'}${videoData.videoUrl}`;
      console.log('Video URL:', videoUrl);
      console.log('Video data:', videoData);
      console.log('Environment API URL:', process.env.REACT_APP_API_URL);
      console.log('Video URL from database:', videoData.videoUrl);
      console.log('Thumbnail from database:', videoData.thumbnail);
      
      // Test if the video URL is accessible
      if (videoData.videoUrl) {
        console.log('Testing video file accessibility...');
        fetch(videoUrl, { method: 'HEAD' })
          .then(response => {
            console.log('Video file accessibility check:', {
              url: videoUrl,
              status: response.status,
              statusText: response.statusText,
              headers: Object.fromEntries(response.headers.entries())
            });
          })
          .catch(error => {
            console.error('Video file not accessible:', error);
            console.error('Error details:', {
              message: error.message,
              type: error.type,
              url: videoUrl
            });
          });
      } else {
        console.log('No video URL found in database');
      }
    } catch (error) {
      console.error('Error fetching video:', error);
      handleApiError(error, 'Failed to fetch video details');
      navigate('/teacher/videos');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseVideos = async () => {
    try {
      if (!video?.courseId) return;
      
      const response = await videosAPI.getByCourse(video.courseId);
      const videosData = (response.data as any).data || response.data;
      setCourseVideos(videosData as Video[]);
    } catch (error) {
      console.error('Error fetching course videos:', error);
      handleApiError(error, 'Failed to fetch course videos');
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Video not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/teacher/videos')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Videos</span>
          </button>
        </div>
       
      </div>

<div>
<h1 className="text-3xl font-bold text-gray-900 mb-6">{video.title}</h1>
</div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Video Player */}
        <div className="lg:col-span-2">
          <VideoPlayer videoUrl={video.videoUrl} thumbnailUrl={video.thumbnail} />
          <div className="bg-white rounded-lg shadow-md p-6 mt-8">
            <h3 className="text-lg font-semibold mb-3">Description</h3>
            <p className="text-gray-700 leading-relaxed">{video.description}</p>
          </div>
          
          {/* Course Videos List */}
          {courseVideos.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 mt-8">
              <h3 className="text-lg font-semibold mb-4">Course Videos</h3>
              <div className="space-y-4">
                {courseVideos.map((courseVideo) => (
                  <div
                    key={courseVideo.id}
                    className={`flex items-center space-x-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                      courseVideo.id === video.id
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                    onClick={() => navigate(`/teacher/videos/${courseVideo.id}`)}
                  >
                    <div className="flex-shrink-0">
                      {courseVideo.thumbnail ? (
                        <img
                          src={`${process.env.REACT_APP_API_URL || 'http://localhost:4000'}${courseVideo.thumbnail}`}
                          alt={courseVideo.title}
                          className="w-20 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-20 h-12 bg-gray-300 rounded flex items-center justify-center">
                          <Play className="w-6 h-6 text-gray-500" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {courseVideo.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        Duration: {formatDuration(courseVideo.duration)}
                      </p>
                    </div>
                    
                    {courseVideo.id === video.id && (
                      <div className="flex-shrink-0">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Playing
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Video Details */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Video Information</h2>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-medium">{formatDuration(video.duration)}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <BookOpen className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Course</p>
                  <p className="font-medium">
                    {video.course ? `${video.course.code} - ${video.course.title}` : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Author</p>
                  <p className="font-medium">
                    {video.author ? `${video.author.firstName} ${video.author.lastName}` : 'N/A'}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Created</p>
                <p className="font-medium">{new Date(video.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Navigation</h3>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/teacher/videos')}
                className="w-full text-left text-blue-600 hover:text-blue-800 text-sm py-2"
              >
                ← Back to Videos
              </button>
              {video.course && (
                <button
                  onClick={() => navigate(`/teacher/courses/${video.courseId}`)}
                  className="w-full text-left text-blue-600 hover:text-blue-800 text-sm py-2"
                >
                  ← Back to Course
                </button>
              )}
              {courseVideos.length > 0 && (
                <button
                  onClick={() => navigate(`/teacher/courses/${video.courseId}`)}
                  className="w-full text-left text-blue-600 hover:text-blue-800 text-sm py-2"
                >
                  📹 View All Course Videos ({courseVideos.length})
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoDetailsPage; 