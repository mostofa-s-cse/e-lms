import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { videosAPI, enrollmentsAPI } from '../../../services/api';
import { handleApiError } from '../../../utils/sweetAlert';
import { checkPaymentAccess } from '../../../utils/paymentVerification';
import PaymentRequired from '../../../components/PaymentRequired';
import { ArrowLeft, Clock, User, BookOpen, Play, Download } from 'lucide-react';
import VideoPlayer from '../../../components/VideoPlayer';


interface Video {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  duration: number;
  thumbnail?: string;
  courseId: string;
  course?: {
    id: string;
    title: string;
    code: string;
    description: string;
    credits: number;
  };
  author?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Enrollment {
  id: string;
  status: string;
  enrolledAt: string;
  intake?: {
    id: string;
    name: string;
    amount: number;
  };
}

const VideoDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [video, setVideo] = useState<Video | null>(null);
  const [courseVideos, setCourseVideos] = useState<Video[]>([]);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentVerified, setPaymentVerified] = useState(false);

  useEffect(() => {
    if (id && user?.id) {
      verifyPaymentAndFetchVideoDetails();
    }
  }, [id, user?.id]);

  const verifyPaymentAndFetchVideoDetails = async () => {
    try {
      setLoading(true);
      
      // First verify payment access
      const paymentResult = await checkPaymentAccess(user!.id);
      if (!paymentResult.hasAccess) {
        setPaymentVerified(false);
        setLoading(false);
        return;
      }
      
      setPaymentVerified(true);
      
      // Fetch video details
      const videoResponse = await videosAPI.getById(id!);
      const videoData = (videoResponse.data as any).data || videoResponse.data;
      setVideo(videoData as Video);

      // Fetch all videos for this course
      if (videoData.courseId) {
        try {
          console.log('Fetching videos for course:', videoData.courseId);
          const courseVideosResponse = await videosAPI.getByCourse(videoData.courseId);
          console.log('Course videos response:', courseVideosResponse);
          
          const courseVideosData = (courseVideosResponse.data as any).data || courseVideosResponse.data;
          console.log('Course videos data:', courseVideosData);
          
          if (Array.isArray(courseVideosData)) {
            setCourseVideos(courseVideosData as Video[]);
          } else {
            console.error('Course videos data is not an array:', courseVideosData);
            setCourseVideos([]);
          }
        } catch (error) {
          console.error('Failed to fetch course videos:', error);
          setCourseVideos([]);
        }

        // Fetch enrollment info for this course
        try {
          const enrollmentResponse = await enrollmentsAPI.getByStudentAndCourse(user!.id, videoData.courseId);
          const enrollmentData = (enrollmentResponse.data as any).data || enrollmentResponse.data;
          setEnrollment(enrollmentData as Enrollment);
        } catch (error) {
          console.log('No enrollment found for this course');
        }
      }
    } catch (error) {
      console.error('Error fetching video details:', error);
      handleApiError(error, 'Failed to fetch video details');
      navigate('/student/videos');
    } finally {
      setLoading(false);
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

  const handleDownload = () => {
    if (video?.videoUrl) {
      const url = `${process.env.REACT_APP_API_URL || 'http://localhost:4000'}${video.videoUrl}`;
      window.open(url, '_blank');
    }
  };

  const handleVideoClick = (videoId: string) => {
    navigate(`/student/videos/${videoId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show payment required if payment is not verified
  if (!paymentVerified) {
    return (
      <PaymentRequired 
        message="You need to complete your payment to access course content. Please contact our support team for assistance."
        showContactInfo={true}
      />
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
            onClick={() => navigate('/student/videos')}
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
          <VideoPlayer videoUrl={video.videoUrl} thumbnailUrl={video.thumbnail || undefined} />
          
          {/* Video Description */}
          <div className="bg-white rounded-lg shadow-md p-6 mt-8">
            <h3 className="text-lg font-semibold mb-3">Description</h3>
            <p className="text-gray-700 leading-relaxed">{video.description}</p>
          </div>

          {/* Course Information */}
          {video.course && (
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h3 className="text-lg font-semibold mb-4">Course Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Course Code</p>
                  <p className="font-medium">{video.course.code}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Credits</p>
                  <p className="font-medium">{video.course.credits} credits</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600">Course Description</p>
                  <p className="font-medium text-sm">{video.course.description}</p>
                </div>
              </div>
            </div>
          )}

          {/* Course Videos List */}
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h3 className="text-lg font-semibold mb-4">All Course Videos</h3>
            {courseVideos.length > 0 ? (
              <div className="space-y-3">
                {courseVideos.map((courseVideo) => (
                  <div
                    key={courseVideo.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      courseVideo.id === video.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                    onClick={() => handleVideoClick(courseVideo.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {courseVideo.title}
                          {courseVideo.id === video.id && (
                            <span className="ml-2 text-blue-600 text-sm">(Current)</span>
                          )}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {courseVideo.description.length > 100
                            ? `${courseVideo.description.substring(0, 100)}...`
                            : courseVideo.description}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatDuration(courseVideo.duration)}
                          </span>
                          <span>
                            {new Date(courseVideo.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <Play className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No other videos found for this course.</p>
                <p className="text-sm text-gray-400 mt-1">This might be the only video in the course.</p>
              </div>
            )}
          </div>
        </div>

        {/* Video Details Sidebar */}
        <div className="space-y-6">
          {/* Video Information */}
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

          {/* Enrollment Status */}
          {enrollment && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Enrollment Status</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    enrollment.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                    enrollment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {enrollment.status}
                  </span>
                </div>
                {enrollment.intake && (
                  <div>
                    <p className="text-sm text-gray-600">Intake</p>
                    <p className="font-medium">{enrollment.intake.name}</p>
                    <p className="text-xs text-gray-500">BDT {enrollment.intake.amount}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Enrolled</p>
                  <p className="font-medium">{new Date(enrollment.enrolledAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Actions</h3>
            <div className="space-y-3">
              {video.course && (
                <button
                  onClick={() => navigate(`/student/courses/${video.courseId}`)}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  View Course
                </button>
              )}
              
              <button
                onClick={handleDownload}
                className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Video
              </button>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Navigation</h3>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/student/videos')}
                className="w-full text-left text-blue-600 hover:text-blue-800 text-sm py-2"
              >
                ← Back to Videos
              </button>
              {video.course && (
                <button
                  onClick={() => navigate(`/student/courses/${video.courseId}`)}
                  className="w-full text-left text-blue-600 hover:text-blue-800 text-sm py-2"
                >
                  ← Back to Course
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