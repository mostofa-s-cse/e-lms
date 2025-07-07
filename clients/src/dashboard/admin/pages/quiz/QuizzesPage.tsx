import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizzesAPI, coursesAPI, questionsAPI } from '../../../../services/api';
import Modal from '../../../../components/Modal';
import { Form, FormField, FormActions } from '../../../../components/Form';
import SearchableDropdown from '../../../../components/SearchableDropdown';
import { 
  showSuccessAlert, 
  showDeleteConfirmDialog, 
  showFormErrorAlert,
  handleApiError 
} from '../../../../utils/sweetAlert';
import { DataTable } from '../../../../components';

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

interface QuizzesResponse {
  data: Quiz[];
}

interface CoursesResponse {
  data: Course[];
}

// Question interface for type safety
interface Question {
  id: string;
  question: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY';
  options?: string[];
  correctAnswer: string;
  marks: number;
  isActive: boolean;
  quizId: string;
  quiz?: {
    id: string;
    title: string;
  };
  author?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

const QuizzesPage = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 30,
    totalMarks: 100,
    passingMarks: 70,
    isActive: true,
    courseId: '',
    startTime: '',
    endTime: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Question creation state
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionFormData, setQuestionFormData] = useState({
    question: '',
    type: 'MULTIPLE_CHOICE' as 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY',
    options: ['', '', '', ''],
    correctAnswer: '',
    marks: 1,
    isActive: true,
    quizId: ''
  });
  const [questionFormErrors, setQuestionFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchQuizzes();
    fetchCourses();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await quizzesAPI.getAll();
      setQuizzes((response.data as QuizzesResponse).data);
    } catch (error) {
      handleApiError(error, 'Failed to fetch quizzes');
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

  const fetchQuestionsForQuiz = async (quizId: string) => {
    try {
      const response = await questionsAPI.getByQuiz(quizId);
      setQuestions((response.data as any).data || []);
    } catch (error) {
      handleApiError(error, 'Failed to fetch questions');
    }
  };

  const handleCreate = () => {
    setEditingQuiz(null);
    setFormData({
      title: '',
      description: '',
      duration: 30,
      totalMarks: 100,
      passingMarks: 70,
      isActive: true,
      courseId: '',
      startTime: '',
      endTime: ''
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleEdit = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setFormData({
      title: quiz.title,
      description: quiz.description || '',
      duration: quiz.duration,
      totalMarks: quiz.totalMarks,
      passingMarks: quiz.passingMarks,
      isActive: quiz.isActive,
      courseId: quiz.courseId,
      startTime: quiz.startTime ? quiz.startTime.split('T')[0] : '',
      endTime: quiz.endTime ? quiz.endTime.split('T')[0] : ''
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleDelete = async (quiz: Quiz) => {
    const result = await showDeleteConfirmDialog(`"${quiz.title}"`);
    if (result.isConfirmed) {
      try {
        await quizzesAPI.delete(quiz.id);
        await showSuccessAlert('Success', 'Quiz deleted successfully');
        fetchQuizzes();
      } catch (error) {
        handleApiError(error, 'Failed to delete quiz');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    // Basic validation
    const errors: Record<string, string> = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.courseId) errors.courseId = 'Course is required';
    if (formData.duration < 1) errors.duration = 'Duration must be at least 1 minute';
    if (formData.totalMarks < 1) errors.totalMarks = 'Total marks must be at least 1';
    if (formData.passingMarks < 0 || formData.passingMarks > formData.totalMarks) {
      errors.passingMarks = 'Passing marks cannot exceed total marks';
    }

    if (Object.keys(errors).length > 0) {
      await showFormErrorAlert(errors);
      setFormErrors(errors);
      return;
    }

    try {
      if (editingQuiz) {
        await quizzesAPI.update(editingQuiz.id, formData);
        await showSuccessAlert('Success', 'Quiz updated successfully');
      } else {
        await quizzesAPI.create(formData);
        await showSuccessAlert('Success', 'Quiz created successfully');
      }
      setShowModal(false);
      fetchQuizzes();
    } catch (error: any) {
      handleApiError(error, 'Failed to save quiz');
    }
  };

  const handleView = (quiz: Quiz) => {
    navigate(`/admin/quizzes/${quiz.id}`);
  };

  // Question creation handlers
  const handleCreateQuestion = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setEditingQuestion(null);
    setQuestionFormData({
      question: '',
      type: 'MULTIPLE_CHOICE',
      options: ['', '', '', ''],
      correctAnswer: '',
      marks: 1,
      isActive: true,
      quizId: quiz.id
    });
    setQuestionFormErrors({});
    setShowQuestionModal(true);
    fetchQuestionsForQuiz(quiz.id);
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setSelectedQuiz(quizzes.find(q => q.id === question.quizId) || null);
    setQuestionFormData({
      question: question.question,
      type: question.type,
      options: question.options || ['', '', '', ''],
      correctAnswer: question.correctAnswer,
      marks: question.marks,
      isActive: question.isActive,
      quizId: question.quizId
    });
    setQuestionFormErrors({});
    setShowQuestionModal(true);
  };

  const handleDeleteQuestion = async (question: Question) => {
    const result = await showDeleteConfirmDialog(`"${question.question}"`);
    if (result.isConfirmed) {
      try {
        await questionsAPI.delete(question.id);
        await showSuccessAlert('Success', 'Question deleted successfully');
        if (selectedQuiz) {
          fetchQuestionsForQuiz(selectedQuiz.id);
        }
      } catch (error) {
        handleApiError(error, 'Failed to delete question');
      }
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...questionFormData.options];
    newOptions[index] = value;
    setQuestionFormData({ ...questionFormData, options: newOptions });
  };

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuestionFormErrors({});

    // Basic validation
    const errors: Record<string, string> = {};
    if (!questionFormData.question.trim()) errors.question = 'Question is required';
    if (!questionFormData.quizId) errors.quizId = 'Quiz is required';
    if (questionFormData.marks < 1) errors.marks = 'Marks must be at least 1';

    if (questionFormData.type === 'MULTIPLE_CHOICE') {
      const validOptions = questionFormData.options.filter(opt => opt.trim());
      if (validOptions.length < 2) errors.options = 'At least 2 options are required';
      if (!questionFormData.correctAnswer.trim()) errors.correctAnswer = 'Correct answer is required';
    }

    if (Object.keys(errors).length > 0) {
      await showFormErrorAlert(errors);
      setQuestionFormErrors(errors);
      return;
    }

    try {
      const submitData = {
        ...questionFormData,
        options: questionFormData.type === 'MULTIPLE_CHOICE' ? questionFormData.options.filter(opt => opt.trim()) : undefined
      };

      if (editingQuestion) {
        await questionsAPI.update(editingQuestion.id, submitData);
        await showSuccessAlert('Success', 'Question updated successfully');
      } else {
        await questionsAPI.create(submitData);
        await showSuccessAlert('Success', 'Question created successfully');
      }
      
      // Reset form and close modal
      setQuestionFormData({
        question: '',
        type: 'MULTIPLE_CHOICE',
        options: ['', '', '', ''],
        correctAnswer: '',
        marks: 1,
        isActive: true,
        quizId: ''
      });
      setSelectedQuiz(null);
      setEditingQuestion(null);
      setShowQuestionModal(false);
    } catch (error: any) {
      handleApiError(error, editingQuestion ? 'Failed to update question' : 'Failed to create question');
    }
  };

  const questionTypeOptions = [
    { value: 'MULTIPLE_CHOICE', label: 'Multiple Choice' },
    { value: 'TRUE_FALSE', label: 'True/False' },
    { value: 'SHORT_ANSWER', label: 'Short Answer' },
    { value: 'ESSAY', label: 'Essay' }
  ];



  const columns = [
    {
      key: 'title',
      label: 'Title',
      render: (title: string, quiz: Quiz) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{title}</div>
          <div className="text-sm text-gray-500">{quiz.duration} minutes</div>
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
      render: (_: any, quiz: Quiz) => (
        <div className="text-sm text-gray-900">
          {quiz.course ? `${quiz.course.code} - ${quiz.course.title}` : 'N/A'}
        </div>
      )
    },
    {
      key: 'totalMarks',
      label: 'Total Marks',
      render: (totalMarks: number) => (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
          {totalMarks} marks
        </span>
      )
    },
    {
      key: 'passingMarks',
      label: 'Passing Marks',
      render: (passingMarks: number) => (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          {passingMarks} marks
        </span>
      )
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (isActive: boolean) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {isActive ? 'Active' : 'Inactive'}
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
        <h1 className="text-3xl font-bold">Quizzes Management</h1>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Quiz
        </button>
      </div>

      <DataTable
        columns={columns}
        title="Quizzes"
        subtitle="Manage quizzes and their details"
        data={quizzes}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        loading={loading}
        customActions={(row: Quiz) => (
          <button
            onClick={() => handleCreateQuestion(row)}
            className="text-green-600 hover:text-green-900 px-2 py-1 rounded hover:bg-green-50"
          >
            Add Question
          </button>
        )}
      />

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingQuiz ? 'Edit Quiz' : 'Create Quiz'}
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

          <SearchableDropdown
            label="Course"
            value={formData.courseId}
            onChange={(value) => setFormData({ ...formData, courseId: value })}
            options={courses.map(course => ({
              value: course.id,
              label: `${course.code} - ${course.title}`
            }))}
            placeholder="Select a course..."
            error={formErrors.courseId}
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

            <FormField
              label="Start Date"
              name="startTime"
              type="date"
              value={formData.startTime}
              onChange={(value) => setFormData({ ...formData, startTime: value as string })}
              error={formErrors.startTime}
            />
          </div>

          <FormField
            label="End Date"
            name="endTime"
            type="date"
            value={formData.endTime}
            onChange={(value) => setFormData({ ...formData, endTime: value as string })}
            error={formErrors.endTime}
          />

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              Active
            </label>
          </div>

          <FormActions
            onCancel={() => setShowModal(false)}
            submitText={editingQuiz ? 'Update' : 'Create'}
          />
        </Form>
      </Modal>

      {/* Question Creation Modal */}
      <Modal
        isOpen={showQuestionModal}
        onClose={() => setShowQuestionModal(false)}
        title={`${editingQuestion ? 'Edit' : 'Create'} Question for ${selectedQuiz?.title}`}
        size="xl"
      >
        {/* Questions List */}
        {questions.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Existing Questions</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {questions.map((question) => (
                <div key={question.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{question.question}</p>
                    <p className="text-xs text-gray-500">
                      {question.type} • {question.marks} marks • {question.isActive ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditQuestion(question)}
                      className="text-indigo-600 hover:text-indigo-900 px-2 py-1 rounded hover:bg-indigo-50 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(question)}
                      className="text-red-600 hover:text-red-900 px-2 py-1 rounded hover:bg-red-50 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Form onSubmit={handleQuestionSubmit}>
          <FormField
            label="Question"
            name="question"
            value={questionFormData.question}
            onChange={(value) => setQuestionFormData({ ...questionFormData, question: value as string })}
            error={questionFormErrors.question}
            required
          />

          <FormField
            label="Question Type"
            name="type"
            type="select"
            value={questionFormData.type}
            onChange={(value) => setQuestionFormData({ ...questionFormData, type: value as any })}
            options={questionTypeOptions}
            required
          />

          {questionFormData.type === 'MULTIPLE_CHOICE' && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Options
              </label>
              {questionFormData.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="correctAnswer"
                    value={option}
                    checked={questionFormData.correctAnswer === option}
                    onChange={(e) => setQuestionFormData({ ...questionFormData, correctAnswer: e.target.value })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              ))}
              {questionFormErrors.options && (
                <p className="text-sm text-red-600">{questionFormErrors.options}</p>
              )}
              {questionFormErrors.correctAnswer && (
                <p className="text-sm text-red-600">{questionFormErrors.correctAnswer}</p>
              )}
            </div>
          )}

          {questionFormData.type === 'TRUE_FALSE' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Correct Answer
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="correctAnswer"
                    value="true"
                    checked={questionFormData.correctAnswer === 'true'}
                    onChange={(e) => setQuestionFormData({ ...questionFormData, correctAnswer: e.target.value })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-900">True</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="correctAnswer"
                    value="false"
                    checked={questionFormData.correctAnswer === 'false'}
                    onChange={(e) => setQuestionFormData({ ...questionFormData, correctAnswer: e.target.value })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-900">False</span>
                </label>
              </div>
            </div>
          )}

          <FormField
            label="Marks"
            name="marks"
            type="number"
            value={questionFormData.marks}
            onChange={(value) => setQuestionFormData({ ...questionFormData, marks: value as number })}
            error={questionFormErrors.marks}
            required
          />

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={questionFormData.isActive}
              onChange={(e) => setQuestionFormData({ ...questionFormData, isActive: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              Active
            </label>
          </div>

          <FormActions
            onCancel={() => setShowQuestionModal(false)}
            submitText={editingQuestion ? 'Update Question' : 'Create Question'}
          />
        </Form>
      </Modal>
    </div>
  );
};

export default QuizzesPage; 