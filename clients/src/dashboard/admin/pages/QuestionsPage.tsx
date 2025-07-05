import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { questionsAPI, quizzesAPI } from '../../../services/api';
import Modal from '../../../components/Modal';
import { Form, FormField, FormActions } from '../../../components/Form';
import SearchableDropdown from '../../../components/SearchableDropdown';
import { 
  showSuccessAlert, 
  showDeleteConfirmDialog, 
  showFormErrorAlert,
  handleApiError 
} from '../../../utils/sweetAlert';
import { DataTable } from '../../../components';

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

interface Quiz {
  id: string;
  title: string;
}

interface QuestionsResponse {
  data: Question[];
}

interface QuizzesResponse {
  data: Quiz[];
}

const QuestionsPage = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [formData, setFormData] = useState({
    question: '',
    type: 'MULTIPLE_CHOICE' as 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY',
    options: ['', '', '', ''],
    correctAnswer: '',
    marks: 1,
    isActive: true,
    quizId: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchQuestions();
    fetchQuizzes();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await questionsAPI.getAll();
      setQuestions((response.data as QuestionsResponse).data);
    } catch (error) {
      handleApiError(error, 'Failed to fetch questions');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizzes = async () => {
    try {
      const response = await quizzesAPI.getAll();
      setQuizzes((response.data as QuizzesResponse).data);
    } catch (error) {
      handleApiError(error, 'Failed to fetch quizzes');
    }
  };

  const handleCreate = () => {
    setEditingQuestion(null);
    setFormData({
      question: '',
      type: 'MULTIPLE_CHOICE',
      options: ['', '', '', ''],
      correctAnswer: '',
      marks: 1,
      isActive: true,
      quizId: ''
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingQuestion(null);
    setFormData({
      question: '',
      type: 'MULTIPLE_CHOICE',
      options: ['', '', '', ''],
      correctAnswer: '',
      marks: 1,
      isActive: true,
      quizId: ''
    });
    setFormErrors({});
  };

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    
    // Ensure options array has 4 elements for multiple choice questions
    let options = ['', '', '', ''];
    if (question.type === 'MULTIPLE_CHOICE' && question.options) {
      options = [...question.options];
      // Pad with empty strings if less than 4 options
      while (options.length < 4) {
        options.push('');
      }
    }
    
    setFormData({
      question: question.question,
      type: question.type,
      options: options,
      correctAnswer: question.correctAnswer,
      marks: question.marks,
      isActive: question.isActive,
      quizId: question.quizId
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleDelete = async (question: Question) => {
    const result = await showDeleteConfirmDialog(`"${question.question}"`);
    if (result.isConfirmed) {
      try {
        await questionsAPI.delete(question.id);
        await showSuccessAlert('Success', 'Question deleted successfully');
        fetchQuestions();
      } catch (error) {
        handleApiError(error, 'Failed to delete question');
      }
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    // Basic validation
    const errors: Record<string, string> = {};
    if (!formData.question.trim()) errors.question = 'Question is required';
    if (!formData.quizId) errors.quizId = 'Quiz is required';
    if (formData.marks < 1) errors.marks = 'Marks must be at least 1';

    if (formData.type === 'MULTIPLE_CHOICE') {
      const validOptions = formData.options.filter(opt => opt.trim());
      if (validOptions.length < 2) errors.options = 'At least 2 options are required';
      if (!formData.correctAnswer.trim()) errors.correctAnswer = 'Correct answer is required';
    }

    if (Object.keys(errors).length > 0) {
      await showFormErrorAlert(errors);
      setFormErrors(errors);
      return;
    }

    try {
      const submitData = {
        ...formData,
        options: formData.type === 'MULTIPLE_CHOICE' ? formData.options.filter(opt => opt.trim()) : undefined
      };

      if (editingQuestion) {
        await questionsAPI.update(editingQuestion.id, submitData);
        await showSuccessAlert('Success', 'Question updated successfully');
      } else {
        await questionsAPI.create(submitData);
        await showSuccessAlert('Success', 'Question created successfully');
      }
      
      // Reset form and close modal
      setFormData({
        question: '',
        type: 'MULTIPLE_CHOICE',
        options: ['', '', '', ''],
        correctAnswer: '',
        marks: 1,
        isActive: true,
        quizId: ''
      });
      setEditingQuestion(null);
      setShowModal(false);
      fetchQuestions();
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
      key: 'question',
      label: 'Question',
      render: (question: string, questionObj: Question) => (
        <div>
          <div className="text-sm font-medium text-gray-900 max-w-xs truncate">{question}</div>
          <div className="text-sm text-gray-500">
            {questionObj.type === 'MULTIPLE_CHOICE' && questionObj.options && (
              <span>Options: {questionObj.options.length}</span>
            )}
            {questionObj.type === 'TRUE_FALSE' && (
              <span>Answer: {questionObj.correctAnswer}</span>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'type',
      label: 'Type',
      render: (type: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          type === 'MULTIPLE_CHOICE' ? 'bg-blue-100 text-blue-800' :
          type === 'TRUE_FALSE' ? 'bg-green-100 text-green-800' :
          type === 'SHORT_ANSWER' ? 'bg-yellow-100 text-yellow-800' :
          'bg-purple-100 text-purple-800'
        }`}>
          {type.replace('_', ' ')}
        </span>
      )
    },
    {
      key: 'quiz',
      label: 'Quiz',
      render: (_: any, question: Question) => (
        <div className="text-sm text-gray-900">
          {question.quiz ? question.quiz.title : 'N/A'}
        </div>
      )
    },
    {
      key: 'marks',
      label: 'Marks',
      render: (marks: number) => (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
          {marks} marks
        </span>
      )
    },
    {
      key: 'author',
      label: 'Author',
      render: (_: any, question: Question) => (
        <div className="text-sm text-gray-900">
          {question.author ? `${question.author.firstName} ${question.author.lastName}` : 'N/A'}
        </div>
      )
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (date: string) => new Date(date).toLocaleDateString()
    }
  ];

  const handleView = (question: Question) => {
    navigate(`/admin/questions/${question.id}`);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Questions Management</h1>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Question
        </button>
      </div>

      <DataTable
        columns={columns}
        title="Questions"
        subtitle="Manage questions and their details"
        data={questions}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        loading={loading}
      />

      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingQuestion ? 'Edit Question' : 'Create Question'}
        size="xl"
      >
        <Form onSubmit={handleSubmit}>
          <FormField
            label="Question"
            name="question"
            value={formData.question}
            onChange={(value) => setFormData({ ...formData, question: value as string })}
            error={formErrors.question}
            required
          />

          <SearchableDropdown
            label="Quiz"
            value={formData.quizId}
            onChange={(value) => setFormData({ ...formData, quizId: value })}
            options={quizzes.map(quiz => ({
              value: quiz.id,
              label: quiz.title
            }))}
            placeholder="Select a quiz..."
            error={formErrors.quizId}
            required
          />

          <FormField
            label="Question Type"
            name="type"
            type="select"
            value={formData.type}
            onChange={(value) => setFormData({ ...formData, type: value as any })}
            options={questionTypeOptions}
            required
          />

          <FormField
            label="Question Content"
            name="questionContent"
            type="textarea"
            value={formData.question}
            onChange={(value) => setFormData({ ...formData, question: value as string })}
            error={formErrors.question}
            required
            rows={4}
          />

          {formData.type === 'MULTIPLE_CHOICE' && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Options
              </label>
              {formData.options && formData.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="correctAnswer"
                    value={option}
                    checked={formData.correctAnswer === option}
                    onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <input
                    type="text"
                    value={option || ''}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              ))}
              {formErrors.options && (
                <p className="text-sm text-red-600">{formErrors.options}</p>
              )}
              {formErrors.correctAnswer && (
                <p className="text-sm text-red-600">{formErrors.correctAnswer}</p>
              )}
            </div>
          )}

          {formData.type === 'TRUE_FALSE' && (
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
                    checked={formData.correctAnswer === 'true'}
                    onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-900">True</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="correctAnswer"
                    value="false"
                    checked={formData.correctAnswer === 'false'}
                    onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
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
            value={formData.marks}
            onChange={(value) => setFormData({ ...formData, marks: value as number })}
            error={formErrors.marks}
            required
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
            onCancel={handleCloseModal}
            submitText={editingQuestion ? 'Update' : 'Create'}
          />
        </Form>
      </Modal>
    </div>
  );
};

export default QuestionsPage; 