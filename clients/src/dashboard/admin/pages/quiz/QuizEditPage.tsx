import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizzesAPI, coursesAPI, usersAPI } from '../../../../services/api';
import { handleApiError } from '../../../../utils/sweetAlert';
import { ArrowLeft } from 'lucide-react';
import { Form, FormField } from '../../../../components';
import SearchableDropdown from '../../../../components/SearchableDropdown';

interface Quiz {
  id: string;
  title: string;
  description?: string;
  duration: number;
  totalMarks: number;
  passingMarks: number;
  isActive: boolean;
  startTime?: string;
  endTime?: string;
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

interface Course {
  id: string;
  title: string;
  code: string;
}

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface CoursesResponse {
  data: Course[];
}

interface TeachersResponse {
  data: Teacher[];
}

const QuizEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 30,
    totalMarks: 100,
    passingMarks: 70,
    isActive: true,
    courseId: '',
    teacherId: '',
    startTime: '',
    endTime: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (id) {
      fetchQuizDetails();
      fetchCourses();
      fetchTeachers();
    }
  }, [id]);

  const fetchQuizDetails = async () => {
    try {
      setLoading(true);
      const response = await quizzesAPI.getById(id!);
      
      if (response.data && (response.data as any).success) {
        const quizData = (response.data as any).data as Quiz;
        setQuiz(quizData);
        setFormData({
          title: quizData.title,
          description: quizData.description || '',
          duration: quizData.duration,
          totalMarks: quizData.totalMarks,
          passingMarks: quizData.passingMarks,
          isActive: quizData.isActive,
          courseId: quizData.courseId,
          teacherId: quizData.author?.id || '',
          startTime: quizData.startTime ? quizData.startTime.slice(0, 16) : '',
          endTime: quizData.endTime ? quizData.endTime.slice(0, 16) : ''
        });
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (error) {
      console.error('Error fetching quiz details:', error);
      handleApiError(error, 'Failed to fetch quiz details');
      navigate('/admin/quizzes');
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

  const fetchTeachers = async () => {
    try {
      const response = await usersAPI.getTeachers();
      setTeachers((response.data as TeachersResponse).data);
    } catch (error) {
      handleApiError(error, 'Failed to fetch teachers');
    }
  };

  const handleCourseChange = (courseId: string) => {
    setFormData({ ...formData, courseId, teacherId: '' });
    // Reset teacher selection when course changes
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    // Basic validation
    const errors: Record<string, string> = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.courseId) errors.courseId = 'Course is required';
    if (!formData.teacherId) errors.teacherId = 'Teacher is required';
    if (formData.duration < 1) errors.duration = 'Duration must be at least 1 minute';
    if (formData.totalMarks < 1) errors.totalMarks = 'Total marks must be at least 1';
    if (formData.passingMarks < 0 || formData.passingMarks > formData.totalMarks) {
      errors.passingMarks = 'Passing marks cannot exceed total marks';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setSaving(true);
      await quizzesAPI.update(id!, formData);
      navigate(`/admin/quizzes/${id}`);
    } catch (error: any) {
      handleApiError(error, 'Failed to update quiz');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Quiz not found</p>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(`/admin/quizzes/${id}`)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Quiz</span>
          </button>
        </div>
        <div className="text-right">
          <h1 className="text-3xl font-bold text-gray-900">Edit Quiz</h1>
          <p className="text-gray-600">{quiz.title}</p>
        </div>
      </div>

      {/* Edit Form */}
      <div className="bg-white p-6 rounded-lg shadow">
        <Form onSubmit={handleSubmit}>
          <FormField
            label="Title"
            name="title"
            value={formData.title}
            onChange={(value) => setFormData({ ...formData, title: value as string })}
            error={formErrors.title}
            required
          />

          <SearchableDropdown
            label="Course"
            value={formData.courseId}
            onChange={(value) => handleCourseChange(value as string)}
            options={courses.map(course => ({
              value: course.id,
              label: `${course.code} - ${course.title}`
            }))}
            placeholder="Select a course..."
            error={formErrors.courseId}
            required
          />

          <SearchableDropdown
            label="Teacher"
            value={formData.teacherId}
            onChange={(value) => setFormData({ ...formData, teacherId: value })}
            options={teachers.map(teacher => ({
              value: teacher.id,
              label: `${teacher.firstName} ${teacher.lastName} (${teacher.email})`
            }))}
            placeholder="Select a teacher..."
            error={formErrors.teacherId}
            required
            disabled={!formData.courseId}
          />

          <FormField
            label="Description"
            name="description"
            type="textarea"
            value={formData.description}
            onChange={(value) => setFormData({ ...formData, description: value as string })}
            error={formErrors.description}
            rows={4}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Duration (minutes)"
              name="duration"
              type="number"
              value={formData.duration}
              onChange={(value) => setFormData({ ...formData, duration: value as number })}
              error={formErrors.duration}
              required
            />

            <FormField
              label="Total Marks"
              name="totalMarks"
              type="number"
              value={formData.totalMarks}
              onChange={(value) => setFormData({ ...formData, totalMarks: value as number })}
              error={formErrors.totalMarks}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Passing Marks"
              name="passingMarks"
              type="number"
              value={formData.passingMarks}
              onChange={(value) => setFormData({ ...formData, passingMarks: value as number })}
              error={formErrors.passingMarks}
              required
            />

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <div className="flex items-center mt-1">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                  Active
                </label>
              </div>
              {formErrors.isActive && (
                <p className="mt-1 text-sm text-red-600">{formErrors.isActive}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <input
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  formErrors.startTime ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {formErrors.startTime && (
                <p className="mt-1 text-sm text-red-600">{formErrors.startTime}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time
              </label>
              <input
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  formErrors.endTime ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {formErrors.endTime && (
                <p className="mt-1 text-sm text-red-600">{formErrors.endTime}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={() => navigate(`/admin/quizzes/${id}`)}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default QuizEditPage; 