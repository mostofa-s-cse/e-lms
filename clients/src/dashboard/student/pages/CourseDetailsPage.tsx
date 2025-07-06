import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { coursesAPI, videosAPI, notesAPI, quizzesAPI, enrollmentsAPI } from '../../../services/api';
import { handleApiError } from '../../../utils/sweetAlert';
import { ArrowLeft, Play, Download, FileText, Clock, Award, User, Calendar } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  code: string;
  credits: number;
  price: number;
  duration: number;
  isActive: boolean;
  thumbnail: string | null;
  createdAt: string;
  teacher?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface Video {
  id: string;
  title: string;
  description: string;
  duration: number;
  videoUrl: string;
  thumbnail: string | null;
  isActive: boolean;
  createdAt: string;
}

interface Note {
  id: string;
  title: string;
  description: string;
  attachment: string | null;
  attachmentSize: number;
  attachmentType: string;
  isActive: boolean;
  createdAt: string;
  isImage: boolean;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  duration: number;
  passingScore: number;
  isActive: boolean;
  createdAt: string;
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

const CourseDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'videos' | 'notes' | 'quizzes'>('overview');

  useEffect(() => {
    if (id && user?.id) {
      fetchCourseDetails();
    }
  }, [id, user?.id]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch course details and enrollment info
      const [courseResponse, videosResponse, notesResponse, quizzesResponse, enrollmentResponse] = await Promise.all([
        coursesAPI.getById(id!),
        videosAPI.getByCourse(id!),
        notesAPI.getByCourse(id!),
        quizzesAPI.getByCourse(id!),
        enrollmentsAPI.getByStudentAndCourse(user!.id, id!)
      ]);

      // Extract data from responses
      const courseData = (courseResponse.data as any).data || courseResponse.data;
      const videosData = (videosResponse.data as any).data || videosResponse.data || [];
      const notesData = (notesResponse.data as any).data || notesResponse.data || [];
      const quizzesData = (quizzesResponse.data as any).data || quizzesResponse.data || [];
      const enrollmentData = (enrollmentResponse.data as any).data || enrollmentResponse.data;

      setCourse(courseData as Course);
      setVideos(videosData as Video[]);
      setNotes(notesData as Note[]);
      setQuizzes(quizzesData as Quiz[]);
      setEnrollment(enrollmentData as Enrollment);
    } catch (error) {
      console.error('Error fetching course details:', error);
      handleApiError(error, 'Failed to fetch course details');
      navigate('/student/courses');
    } finally {
      setLoading(false);
    }
  };

  const handleVideoClick = (video: Video) => {
    navigate(`/student/videos/${video.id}`);
  };

  const handleNoteDownload = (note: Note) => {
    if (note.attachment) {
      const url = `${process.env.REACT_APP_API_URL || 'http://localhost:4000'}${note.attachment}`;
      window.open(url, '_blank');
    }
  };

  const handleQuizClick = (quiz: Quiz) => {
    navigate(`/student/quizzes/${quiz.id}`);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
            onClick={() => navigate('/student/courses')}
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

      {/* Course Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <Award className="w-5 h-5 text-blue-600 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Credits</p>
              <p className="text-lg font-semibold">{course.credits}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <Clock className="w-5 h-5 text-green-600 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Duration</p>
              <p className="text-lg font-semibold">{course.duration} weeks</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <User className="w-5 h-5 text-purple-600 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Teacher</p>
              <p className="text-lg font-semibold">
                {course.teacher ? `${course.teacher.firstName} ${course.teacher.lastName}` : 'Not assigned'}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <Calendar className="w-5 h-5 text-orange-600 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Enrolled</p>
              <p className="text-lg font-semibold">
                {enrollment ? new Date(enrollment.enrolledAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Enrollment Status */}
      {enrollment && (
        <div className="mb-6">
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Enrollment Status</h3>
                <p className="text-gray-600">
                  {enrollment.intake ? `Intake: ${enrollment.intake.name} (BDT ${enrollment.intake.amount})` : 'No intake assigned'}
                </p>
              </div>
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                enrollment.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                enrollment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {enrollment.status}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Course Thumbnail and Description */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Description</h3>
            <p className="text-gray-700 leading-relaxed">{course.description}</p>
          </div>
        </div>
        <div>
          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Thumbnail</h3>
            {course.thumbnail ? (
              <img
                src={`${process.env.REACT_APP_IMG_URL || 'http://localhost:4000'}${course.thumbnail}`}
                alt="Course thumbnail"
                className="w-full h-auto rounded object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-48 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-gray-500">No thumbnail available</span>
              </div>
            )}
          </div>
        </div>
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
            onClick={() => setActiveTab('notes')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'notes'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Notes ({notes.length})
          </button>
          <button
            onClick={() => setActiveTab('quizzes')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'quizzes'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Quizzes ({quizzes.length})
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center mb-4">
              <Play className="w-6 h-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Videos</h3>
            </div>
            <p className="text-3xl font-bold text-blue-600 mb-2">{videos.length}</p>
            <p className="text-gray-600">Total video lessons</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center mb-4">
              <FileText className="w-6 h-6 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Notes</h3>
            </div>
            <p className="text-3xl font-bold text-green-600 mb-2">{notes.length}</p>
            <p className="text-gray-600">Study materials</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center mb-4">
              <Award className="w-6 h-6 text-purple-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Quizzes</h3>
            </div>
            <p className="text-3xl font-bold text-purple-600 mb-2">{quizzes.length}</p>
            <p className="text-gray-600">Assessment tests</p>
          </div>
        </div>
      )}

      {activeTab === 'videos' && (
        <div className="space-y-4">
          {videos.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No videos available for this course</p>
            </div>
          ) : (
            videos.map((video) => (
              <div key={video.id} className="bg-white p-4 rounded-lg shadow border hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-4">
                  {video.thumbnail ? (
                    <img
                      src={`${process.env.REACT_APP_IMG_URL || 'http://localhost:4000'}${video.thumbnail}`}
                      alt={video.title}
                      className="w-20 h-12 rounded object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-20 h-12 bg-gray-200 rounded flex items-center justify-center">
                      <Play className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900">{video.title}</h4>
                    <p className="text-gray-600 text-sm">{video.description}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-sm text-gray-500 flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatDuration(video.duration)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleVideoClick(video)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Watch
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'notes' && (
        <div className="space-y-4">
          {notes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No notes available for this course</p>
            </div>
          ) : (
            notes.map((note) => (
              <div key={note.id} className="bg-white p-4 rounded-lg shadow border hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded flex items-center justify-center">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{note.title}</h4>
                      <p className="text-gray-600 text-sm">{note.description}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-xs text-gray-500">
                          {formatFileSize(note.attachmentSize)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {note.attachmentType}
                        </span>
                      </div>
                    </div>
                  </div>
                  {note.attachment && (
                    <button
                      onClick={() => handleNoteDownload(note)}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'quizzes' && (
        <div className="space-y-4">
          {quizzes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No quizzes available for this course</p>
            </div>
          ) : (
            quizzes.map((quiz) => (
              <div key={quiz.id} className="bg-white p-4 rounded-lg shadow border hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-100 rounded flex items-center justify-center">
                      <Award className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{quiz.title}</h4>
                      <p className="text-gray-600 text-sm">{quiz.description}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-xs text-gray-500 flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {quiz.duration} minutes
                        </span>
                        <span className="text-xs text-gray-500">
                          Passing Score: {quiz.passingScore}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleQuizClick(quiz)}
                    className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
                  >
                    Take Quiz
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CourseDetailsPage; 