import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { coursesAPI, videosAPI, notesAPI, quizzesAPI } from '../../../services/api';
import { handleApiError, showDeleteConfirmDialog, showSuccessAlert } from '../../../utils/sweetAlert';
import Modal from '../../../components/Modal';
import { Form, FormField, FormActions } from '../../../components/Form';
import { 
  OverviewTab,
  VideosTab,
  StudentsTab,
  NotesTab,
  QuizzesTab,
  Course,
  Video,
  Enrollment,
  Note,
  Quiz
} from '../../../components/admin';
import { ArrowLeft } from 'lucide-react';

const CourseDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'videos' | 'students' | 'notes' | 'quizzes'>('overview');
  const [showModal, setShowModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    duration: 0,
    courseId: '',
    file: null as File | null
  });
  const [noteFormData, setNoteFormData] = useState({
    title: '',
    content: '',
    courseId: ''
  });
  const [quizFormData, setQuizFormData] = useState({
    title: '',
    description: '',
    duration: 30,
    passingScore: 70,
    isActive: true,
    courseId: ''
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

  const handleNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    // Basic validation
    const errors: Record<string, string> = {};
    if (!noteFormData.title.trim()) errors.title = 'Title is required';
    if (!noteFormData.content.trim()) errors.content = 'Content is required';
    if (!noteFormData.courseId) errors.courseId = 'Course is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const submitData = new FormData();
      submitData.append('title', noteFormData.title);
      submitData.append('content', noteFormData.content);
      submitData.append('courseId', noteFormData.courseId);

      if (editingNote) {
        await notesAPI.update(editingNote.id, submitData);
      } else {
        await notesAPI.create(submitData);
      }
      
      setShowNoteModal(false);
      fetchCourseDetails(); // Refresh the data
    } catch (error: any) {
      console.error('Failed to save note:', error);
      if (error.response?.data?.message) {
        setFormErrors({ general: error.response.data.message });
      }
    }
  };

  const handleQuizSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    // Basic validation
    const errors: Record<string, string> = {};
    if (!quizFormData.title.trim()) errors.title = 'Title is required';
    if (!quizFormData.description.trim()) errors.description = 'Description is required';
    if (!quizFormData.courseId) errors.courseId = 'Course is required';
    if (quizFormData.duration < 0) errors.duration = 'Duration must be positive';
    if (quizFormData.passingScore < 0 || quizFormData.passingScore > 100) errors.passingScore = 'Passing score must be between 0 and 100';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const submitData = new FormData();
      submitData.append('title', quizFormData.title);
      submitData.append('description', quizFormData.description);
      submitData.append('duration', quizFormData.duration.toString());
      submitData.append('passingScore', quizFormData.passingScore.toString());
      submitData.append('isActive', quizFormData.isActive.toString());
      submitData.append('courseId', quizFormData.courseId);

      if (editingQuiz) {
        await quizzesAPI.update(editingQuiz.id, submitData);
      } else {
        await quizzesAPI.create(submitData);
      }
      
      setShowQuizModal(false);
      fetchCourseDetails(); // Refresh the data
    } catch (error: any) {
      console.error('Failed to save quiz:', error);
      if (error.response?.data?.message) {
        setFormErrors({ general: error.response.data.message });
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
      
      const [courseResponse, videosResponse, enrollmentsResponse, notesResponse, quizzesResponse] = await Promise.all([
        coursesAPI.getById(id!),
        videosAPI.getByCourse(id!),
        coursesAPI.getEnrollments(id!),
        notesAPI.getByCourse(id!),
        quizzesAPI.getByCourse(id!)
      ]);

      // Extract data from nested response structure
      const courseData = (courseResponse.data as any).data || courseResponse.data;
      const videosData = (videosResponse.data as any).data || videosResponse.data || [];
      const enrollmentsData = (enrollmentsResponse.data as any).data || enrollmentsResponse.data || [];
      const notesData = (notesResponse.data as any).data || notesResponse.data || [];
      const quizzesData = (quizzesResponse.data as any).data || quizzesResponse.data || [];

      setCourse(courseData as Course);
      setVideos(videosData as Video[]);
      setEnrollments(enrollmentsData as Enrollment[]);
      setNotes(notesData as Note[]);
      setQuizzes(quizzesData as Quiz[]);
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
    <div className="max-w-7xl mx-auto p-6">
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
        <OverviewTab 
          course={course}
          videos={videos}
          enrollments={enrollments}
          notes={notes}
          quizzes={quizzes}
        />
      )}

      {activeTab === 'videos' && (
        <VideosTab 
          videos={videos}
          loading={loading}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreate={handleCreate}
        />
      )}

      {activeTab === 'students' && (
        <StudentsTab 
          enrollments={enrollments}
        />
      )}

      {activeTab === 'notes' && (
        <NotesTab 
          notes={notes}
          loading={loading}
          onEdit={(note: Note) => {
            setEditingNote(note);
            setNoteFormData({
              title: note.title,
              content: note.content,
              courseId: course?.id || ''
            });
            setShowNoteModal(true);
          }}
          onDelete={async (note: Note) => {
            const result = await showDeleteConfirmDialog(`"${note.title}"`);
            if (result.isConfirmed) {
              try {
                await notesAPI.delete(note.id);
                showSuccessAlert('Note Deleted', `"${note.title}" has been successfully deleted.`);
                fetchCourseDetails();
              } catch (error) {
                handleApiError(error, 'Failed to delete note');
              }
            }
          }}
          onCreate={() => {
            setEditingNote(null);
            setNoteFormData({
              title: '',
              content: '',
              courseId: course?.id || ''
            });
            setShowNoteModal(true);
          }}
        />
      )}

      {activeTab === 'quizzes' && (
        <QuizzesTab 
          quizzes={quizzes}
          loading={loading}
          onEdit={(quiz: Quiz) => {
            setEditingQuiz(quiz);
            setQuizFormData({
              title: quiz.title,
              description: quiz.description,
              duration: quiz.duration,
              passingScore: quiz.passingScore,
              isActive: quiz.isActive,
              courseId: course?.id || ''
            });
            setShowQuizModal(true);
          }}
          onDelete={async (quiz: Quiz) => {
            const result = await showDeleteConfirmDialog(`"${quiz.title}"`);
            if (result.isConfirmed) {
              try {
                await quizzesAPI.delete(quiz.id);
                showSuccessAlert('Quiz Deleted', `"${quiz.title}" has been successfully deleted.`);
                fetchCourseDetails();
              } catch (error) {
                handleApiError(error, 'Failed to delete quiz');
              }
            }
          }}
          onCreate={() => {
            setEditingQuiz(null);
            setQuizFormData({
              title: '',
              description: '',
              duration: 30,
              passingScore: 70,
              isActive: true,
              courseId: course?.id || ''
            });
            setShowQuizModal(true);
          }}
        />
      )}

      {/* Video Modal */}
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

      {/* Note Modal */}
      <Modal
        isOpen={showNoteModal}
        onClose={() => setShowNoteModal(false)}
        title={editingNote ? 'Edit Note' : 'Create Note'}
        size="lg"
      >
        <Form onSubmit={handleNoteSubmit}>
          {formErrors.general && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {formErrors.general}
            </div>
          )}

          <FormField
            label="Title"
            name="title"
            type="text"
            value={noteFormData.title}
            onChange={(value) => setNoteFormData({ ...noteFormData, title: value as string })}
            error={formErrors.title}
            required
          />

          <FormField
            label="Content"
            name="content"
            type="textarea"
            value={noteFormData.content}
            onChange={(value) => setNoteFormData({ ...noteFormData, content: value as string })}
            error={formErrors.content}
            required
            rows={6}
          />

          <FormActions
            onCancel={() => setShowNoteModal(false)}
            submitText={editingNote ? 'Update Note' : 'Create Note'}
          />
        </Form>
      </Modal>

      {/* Quiz Modal */}
      <Modal
        isOpen={showQuizModal}
        onClose={() => setShowQuizModal(false)}
        title={editingQuiz ? 'Edit Quiz' : 'Create Quiz'}
        size="lg"
      >
        <Form onSubmit={handleQuizSubmit}>
          {formErrors.general && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {formErrors.general}
            </div>
          )}

          <FormField
            label="Title"
            name="title"
            type="text"
            value={quizFormData.title}
            onChange={(value) => setQuizFormData({ ...quizFormData, title: value as string })}
            error={formErrors.title}
            required
          />

          <FormField
            label="Description"
            name="description"
            type="textarea"
            value={quizFormData.description}
            onChange={(value) => setQuizFormData({ ...quizFormData, description: value as string })}
            error={formErrors.description}
            required
            rows={4}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Duration (minutes)"
              name="duration"
              type="number"
              value={quizFormData.duration}
              onChange={(value) => setQuizFormData({ ...quizFormData, duration: value as number })}
              error={formErrors.duration}
              required
            />

            <FormField
              label="Passing Score (%)"
              name="passingScore"
              type="number"
              value={quizFormData.passingScore}
              onChange={(value) => setQuizFormData({ ...quizFormData, passingScore: value as number })}
              error={formErrors.passingScore}
              required
            />
          </div>

          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={quizFormData.isActive}
                onChange={(e) => setQuizFormData({ ...quizFormData, isActive: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Active</span>
            </label>
          </div>

          <FormActions
            onCancel={() => setShowQuizModal(false)}
            submitText={editingQuiz ? 'Update Quiz' : 'Create Quiz'}
          />
        </Form>
      </Modal>
    </div>
  );
};

export default CourseDetailsPage;
