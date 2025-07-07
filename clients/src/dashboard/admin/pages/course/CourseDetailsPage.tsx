import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { coursesAPI, videosAPI, notesAPI, quizzesAPI, usersAPI } from '../../../../services/api';
import { handleApiError, showDeleteConfirmDialog, showSuccessAlert } from '../../../../utils/sweetAlert';
import Modal from '../../../../components/Modal';
import { Form, FormField, FormActions } from '../../../../components/Form';
import SearchableDropdown from '../../../../components/SearchableDropdown';
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
} from '../../../../components/admin';
import { ArrowLeft } from 'lucide-react';

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface TeachersResponse {
  data: Teacher[];
}

const CourseDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [teachersLoading, setTeachersLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'videos' | 'students' | 'notes' | 'quizzes'>('overview');
  const [showModal, setShowModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courseFormData, setCourseFormData] = useState({
    title: '',
    description: '',
    code: '',
    credits: 0,
    price: 0,
    isFree: false,
    thumbnail: null as File | null,
    teacherId: ''
  });
  const [currentThumbnailUrl, setCurrentThumbnailUrl] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 0,
    courseId: '',
    videoUrl: null as File | null,
    thumbnail: null as File | null
  });

  const [noteFormData, setNoteFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    attachmentSize: 0,
    attachmentType: '',
    isActive: true,
    attachment: null as File | null
  });
  const [currentFileUrl, setCurrentFileUrl] = useState<string | null>(null);
  const [quizFormData, setQuizFormData] = useState({
    title: '',
    description: '',
    duration: 30,
    passingScore: 70,
    isActive: true,
    courseId: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const handleDelete = async (video: Video) => {
    const result = await showDeleteConfirmDialog(`"${video.title}"`);
    
    if (result.isConfirmed) {
      try {
        await videosAPI.delete(video.id);
        showSuccessAlert(
          'Video Deleted', 
          `"${video.title}" has been successfully deleted.`
        );
        fetchCourseDetails();
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setNoteFormData({ 
      ...noteFormData, 
      attachment: selectedFile,
      attachmentSize: selectedFile?.size || 0,
      attachmentType: selectedFile?.type || ''
    });
  };

  const handleCreate = () => {
    setShowModal(true);
    setFormData({
      title: '',
      description: '',
      duration: 0,
      courseId: course?.id!,
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
      courseId: course?.id!,
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
        courseId: course?.id!,
        videoUrl: null,
        thumbnail: null
      });
      fetchCourseDetails();
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


  const handleNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    // Basic validation
    const errors: Record<string, string> = {};
    if (!noteFormData.title.trim()) errors.title = 'Title is required';
    if (!noteFormData.description?.trim()) errors.description = 'Description is required';
    if (!noteFormData.courseId) errors.courseId = 'Course is required';
    
    // File validation
    if (!editingNote && !noteFormData.attachment) {
      errors.attachment = 'File is required for new notes';
    } else if (noteFormData.attachment) {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (noteFormData.attachment.size > maxSize) {
        errors.attachment = 'File size must be less than 10MB';
      }
      
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/csv'
      ];
      
      if (!allowedTypes.includes(noteFormData.attachment.type)) {
        errors.attachment = 'Please select a valid file type';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const submitData = new FormData();
      submitData.append('title', noteFormData.title);
      submitData.append('description', noteFormData.description);
      submitData.append('courseId', course?.id!);
      submitData.append('isActive', noteFormData.isActive ? 'true' : 'false');
      
      if (noteFormData.attachment) {
        submitData.append('attachment', noteFormData.attachment);
        submitData.append('attachmentSize', noteFormData.attachment.size.toString());
        submitData.append('attachmentType', noteFormData.attachment.type);
      }

      if (editingNote) {
        await notesAPI.update(editingNote.id, submitData);
        showSuccessAlert(
          'Note Updated', 
          `"${noteFormData.title}" has been successfully updated.`
        );
      } else {
        await notesAPI.create(submitData);
        showSuccessAlert(
          'Note Created', 
          `"${noteFormData.title}" has been successfully created.`
        );
      }
      setShowNoteModal(false);
      fetchCourseDetails(); // Refresh the data
    } catch (error: any) {
      if (error.response?.data?.errors) {
        // Handle field-specific errors from server
        const serverErrors: Record<string, string> = {};
        error.response.data.errors.forEach((err: any) => {
          if (err.field) {
            serverErrors[err.field] = err.message;
          }
        });
        setFormErrors(serverErrors);
      } else {
        handleApiError(error, 'Failed to save note');
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
      submitData.append('courseId', course?.id!);

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

  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    // Basic validation
    const errors: Record<string, string> = {};
    if (!courseFormData.title.trim()) errors.title = 'Title is required';
    if (!courseFormData.description.trim()) errors.description = 'Description is required';
    if (!courseFormData.code.trim()) errors.code = 'Course code is required';
    if (courseFormData.credits <= 0) errors.credits = 'Credits must be greater than 0';
    if (!courseFormData.isFree && courseFormData.price < 0) errors.price = 'Price cannot be negative';
    if (courseFormData.thumbnail instanceof File) {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (courseFormData.thumbnail.size > maxSize) {
        errors.thumbnail = 'Thumbnail file size must be less than 10MB';
      }
      
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(courseFormData.thumbnail.type)) {
        errors.thumbnail = 'Please select a valid image file (JPG, PNG, WebP)';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const submitData = new FormData();
      submitData.append('title', courseFormData.title);
      submitData.append('description', courseFormData.description);
      submitData.append('code', courseFormData.code);
      submitData.append('credits', courseFormData.credits.toString());
      submitData.append('price', courseFormData.price.toString());
      submitData.append('isFree', courseFormData.isFree.toString());
      
      if (courseFormData.teacherId) {
        submitData.append('teacherId', courseFormData.teacherId);
      }
      
      if (courseFormData.thumbnail) {
        submitData.append('thumbnail', courseFormData.thumbnail);
      }

      await coursesAPI.update(course!.id, submitData);
      showSuccessAlert(
        'Course Updated',
        `"${courseFormData.title}" has been successfully updated.`
      );
      setShowCourseModal(false);
      fetchCourseDetails(); // Refresh the data
    } catch (error: any) {
      if (error.response?.data?.errors) {
        // Handle server-side validation errors
        const serverErrors: Record<string, string> = {};
        Object.keys(error.response.data.errors).forEach(key => {
          serverErrors[key] = error.response.data.errors[key][0];
        });
        setFormErrors(serverErrors);
      } else {
        handleApiError(error, 'Failed to update course');
      }
    }
  };

  const handleCourseThumbnailFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setCourseFormData(prev => ({ ...prev, thumbnail: file }));
    if (file) {
      setFormErrors(prev => ({ ...prev, thumbnail: '' }));
    }
  };

  useEffect(() => {
    if (id) {
      fetchCourseDetails();
      fetchTeachers();
    }
  }, [id]);

  const fetchTeachers = async () => {
    try {
      setTeachersLoading(true);
      const response = await usersAPI.getTeachers();
      setTeachers((response.data as TeachersResponse).data);
    } catch (error) {
      handleApiError(error, 'Failed to fetch teachers');
    } finally {
      setTeachersLoading(false);
    }
  };

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
    <div className="max-w-7xl mx-auto">
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
        <div className="flex items-center space-x-6">
        
          {/* Course Info */}
          <div className="text-right">
            <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
            <p className="text-gray-600">{course.code}</p>
                      <button
            onClick={() => {
              setCourseFormData({
                title: course.title,
                description: course.description,
                code: course.code,
                credits: course.credits,
                price: course.price,
                isFree: course.isFree || false,
                thumbnail: null,
                teacherId: course.teacher?.id || ''
              });
              setCurrentThumbnailUrl(course.thumbnail);
              setFormErrors({});
              setShowCourseModal(true);
            }}
              className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
            >
              Edit Course
            </button>
          </div>
        </div>
      </div>

      {/* Course Status and Price Badges */}
      <div className="mb-6 flex items-center space-x-4">
        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
          course.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {course.isActive ? 'Active' : 'Inactive'}
        </span>
        <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
          {course.isFree ? 'Free' : `$${course.price.toFixed(2)}`}
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
              description: note.description || '',
              courseId: course?.id || '',
              attachmentSize: note.attachmentSize || 0,
              attachmentType: note.attachmentType || '',
              isActive: note.isActive,
              attachment: null
            });
            setCurrentFileUrl(note.attachment || null);
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
              description: '',
              courseId: course?.id || '',
              attachmentSize: 0,
              attachmentType: '',
              isActive: true,
              attachment: null
            });
            setCurrentFileUrl(null);
            setShowNoteModal(true);
          }}
          onView={(note: Note) => {
            navigate(`/admin/notes/${note.id}`);
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

      {/*Create and Edit Video Modal */}
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

      {/* Note Modal */}
      <Modal
        isOpen={showNoteModal}
        onClose={() => {
          setShowNoteModal(false);
          setCurrentFileUrl(null);
        }}
        title={editingNote ? 'Edit Note' : 'Create Note'}
        size="lg"
      >
        <Form onSubmit={handleNoteSubmit}>
          <FormField
            label="Title"
            name="title"
            value={noteFormData.title}
            onChange={(value) => setNoteFormData({ ...noteFormData, title: value as string })}
            error={formErrors.title}
            required
          />

          <FormField
            label="Course"
            name="courseId"
            type="text"
            value={course?.title || ''}
            onChange={() => {}} // Read-only since we're in course context
            error={formErrors.courseId}
            required
            disabled
          />

          <FormField
            label="Description"
            name="description"
            type="textarea"
            value={noteFormData.description}
            onChange={(value) => setNoteFormData({ ...noteFormData, description: value as string })}
            error={formErrors.description}
            required
            rows={6}
          />

          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                  checked={noteFormData.isActive}
                onChange={(e) => setNoteFormData({ ...noteFormData, isActive: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">Active Status</span>
            </label>
            {formErrors.isActive && (
              <p className="mt-1 text-sm text-red-600">{formErrors.isActive}</p>
            )} 
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Attachment {!editingNote && <span className="text-red-500">*</span>}
            </label>
            
            {/* Current File Display */}
            {currentFileUrl && !noteFormData.attachment && editingNote && (
              <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-md">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Current File:</strong>
                </p>
                <div className="flex items-center space-x-2">
                  {editingNote.isImage ? (
                    <img
                      src={`${process.env.REACT_APP_IMG_URL || 'http://localhost:4000'}${currentFileUrl}`}
                      alt="Current note file"
                      className="w-16 h-16 rounded object-cover border border-gray-300"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 bg-blue-100 rounded flex items-center justify-center">
                      <span className="text-xs text-blue-600">📎</span>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium">{currentFileUrl.split('/').pop()}</p>
                            {editingNote.attachmentSize && (
          <p className="text-xs text-gray-500">
            {(editingNote.attachmentSize / (1024 * 1024)).toFixed(2)} MB
          </p>
        )}
        {editingNote.attachmentType && (
          <p className="text-xs text-gray-500">{editingNote.attachmentType}</p>
        )}
                  </div>
                </div>
              </div>
            )}
            
            <input
              type="file"
              onChange={handleFileChange}
              className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                formErrors.attachment ? 'border-red-500' : 'border-gray-300'
              }`}
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.xlsx,.xls,.ppt,.pptx,.csv"
            />
            {noteFormData.attachment && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800">
                  <strong>Selected:</strong> {noteFormData.attachment.name}
                </p>
                <p className="text-xs text-green-600">
                    Size: {(noteFormData.attachment.size / (1024 * 1024)).toFixed(2)} MB
                </p>
                <p className="text-xs text-green-600">
                  Type: {noteFormData.attachment.type}
                </p>
              </div>
            )}
            {formErrors.attachment && (
              <p className="mt-1 text-sm text-red-600">{formErrors.attachment}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Supported formats: PDF, DOC, DOCX, TXT, JPG, PNG, XLSX, XLS, PPT, PPTX, CSV (Max size: 10MB)
              {editingNote && ' - Leave empty to keep existing file'}
            </p>
          </div>

          <FormActions
            onCancel={() => setShowNoteModal(false)}
            submitText={editingNote ? 'Update' : 'Create'}
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

      {/* Course Edit Modal */}
      <Modal
        isOpen={showCourseModal}
        onClose={() => {
          setShowCourseModal(false);
          setCurrentThumbnailUrl(null);
        }}
        title="Edit Course"
        size="lg"
      >
        <Form onSubmit={handleCourseSubmit}>
          {formErrors.general && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {formErrors.general}
            </div>
          )}

          <FormField
            label="Title *"
            name="title"
            value={courseFormData.title}
            onChange={(value) => setCourseFormData({ ...courseFormData, title: value as string })}
            error={formErrors.title}
            required
          />

          <FormField
            label="Course Code *"
            name="code"
            value={courseFormData.code}
            onChange={(value) => setCourseFormData({ ...courseFormData, code: value as string })}
            error={formErrors.code}
            required
          />

          <SearchableDropdown
            label="Teacher"
            value={courseFormData.teacherId}
            onChange={(value) => setCourseFormData({ ...courseFormData, teacherId: value })}
            options={teachers.map(teacher => ({
              value: teacher.id,
              label: `${teacher.firstName} ${teacher.lastName} (${teacher.email})`
            }))}
            placeholder="Select a teacher..."
            error={formErrors.teacherId}
            loading={teachersLoading}
          />

          <FormField
            label="Description *"
            name="description"
            type="textarea"
            value={courseFormData.description}
            onChange={(value) => setCourseFormData({ ...courseFormData, description: value as string })}
            error={formErrors.description}
            required
            rows={4}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Credits *"
              name="credits"
              type="number"
              value={courseFormData.credits}
              onChange={(value) => setCourseFormData({ ...courseFormData, credits: value as number })}
              error={formErrors.credits}
              required
            />

            <FormField
              label="Price"
              name="price"
              type="number"
              value={courseFormData.price}
              onChange={(value) => setCourseFormData({ ...courseFormData, price: value as number })}
              error={formErrors.price}
              disabled={courseFormData.isFree}
            />
          </div>

          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={courseFormData.isFree}
                onChange={(e) => setCourseFormData({ ...courseFormData, isFree: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Free Course</span>
            </label>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course Thumbnail
            </label>
            
            {/* Current Thumbnail Display */}
            {currentThumbnailUrl && !courseFormData.thumbnail && (
              <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-md">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Current Thumbnail:</strong>
                </p>
                <img
                  src={`${process.env.REACT_APP_IMG_URL || 'http://localhost:4000'}${currentThumbnailUrl}`}
                  alt="Current course thumbnail"
                  className="w-full h-auto rounded object-cover border border-gray-300"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
            
            <input
              type="file"
              name="thumbnail"
              onChange={handleCourseThumbnailFileChange}
              className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                formErrors.thumbnail ? 'border-red-500' : 'border-gray-300'
              }`}
              accept="image/*"
            />
            {courseFormData.thumbnail && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800">
                  <strong>Selected:</strong> {courseFormData.thumbnail.name}
                </p>
                <p className="text-xs text-green-600">
                  Size: {(courseFormData.thumbnail.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            )}
            {formErrors.thumbnail && (
              <p className="mt-1 text-sm text-red-600">{formErrors.thumbnail}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Supported formats: JPG, PNG, WebP (Max size: 10MB) - Leave empty to keep existing thumbnail
            </p>
          </div>

          <FormActions
            onCancel={() => setShowCourseModal(false)}
            submitText="Update Course"
          />
        </Form>
      </Modal>
    </div>
  );
};

export default CourseDetailsPage;