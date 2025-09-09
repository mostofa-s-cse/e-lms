import React, { useState, useEffect } from 'react';
import Modal from '../Modal';
import { Form, FormField, FormActions } from '../Form';
import { showSuccessAlert, showFormErrorAlert, handleApiError } from '../../utils/sweetAlert';
import { questionsAPI } from '../../services/api';

interface Question {
  id: string;
  question: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY';
  options?: string[];
  correctAnswer: string;
  marks: number;
  isActive: boolean;
  quizId: string;
  createdAt: string;
  updatedAt: string;
}

interface QuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  quizId: string;
  quizTitle: string;
  editingQuestion?: Question | null;
  onQuestionSaved: () => void;
  authorId: string;
}

const QuestionModal: React.FC<QuestionModalProps> = ({
  isOpen,
  onClose,
  quizId,
  quizTitle,
  editingQuestion,
  onQuestionSaved,
  authorId
}) => {
  const [formData, setFormData] = useState({
    question: '',
    type: 'MULTIPLE_CHOICE' as 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY',
    options: ['', '', '', ''],
    correctAnswer: '',
    marks: 1,
    isActive: true
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const questionTypeOptions = [
    { value: 'MULTIPLE_CHOICE', label: 'Multiple Choice' },
    { value: 'TRUE_FALSE', label: 'True/False' },
    { value: 'SHORT_ANSWER', label: 'Short Answer' },
    { value: 'ESSAY', label: 'Essay' }
  ];

  useEffect(() => {
    if (editingQuestion) {
      // Ensure options array has 4 elements for multiple choice questions
      let options = ['', '', '', ''];
      if (editingQuestion.type === 'MULTIPLE_CHOICE' && editingQuestion.options) {
        options = [...editingQuestion.options];
        // Pad with empty strings if less than 4 options
        while (options.length < 4) {
          options.push('');
        }
      }
      
      setFormData({
        question: editingQuestion.question,
        type: editingQuestion.type,
        options: options,
        correctAnswer: editingQuestion.correctAnswer,
        marks: editingQuestion.marks,
        isActive: editingQuestion.isActive
      });
    } else {
      setFormData({
        question: '',
        type: 'MULTIPLE_CHOICE',
        options: ['', '', '', ''],
        correctAnswer: '',
        marks: 1,
        isActive: true
      });
    }
    setFormErrors({});
  }, [editingQuestion, isOpen]);

  const handleCloseModal = () => {
    setFormData({
      question: '',
      type: 'MULTIPLE_CHOICE',
      options: ['', '', '', ''],
      correctAnswer: '',
      marks: 1,
      isActive: true
    });
    setFormErrors({});
    onClose();
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const handleTypeChange = (value: string | number) => {
    const type = value as string;
    setFormData({ 
      ...formData, 
      type: type as 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY',
      correctAnswer: '',
      options: type === 'MULTIPLE_CHOICE' ? ['', '', '', ''] : []
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setSubmitting(true);

    try {
      // Basic validation
      const errors: Record<string, string> = {};
      if (!formData.question.trim()) errors.question = 'Question is required';
      if (formData.marks < 1) errors.marks = 'Marks must be at least 1';

      if (formData.type === 'MULTIPLE_CHOICE') {
        const validOptions = formData.options.filter(opt => opt.trim());
        if (validOptions.length < 2) errors.options = 'At least 2 options are required';
        if (!formData.correctAnswer.trim()) errors.correctAnswer = 'Correct answer is required';
      }

      if (formData.type === 'TRUE_FALSE') {
        if (!formData.correctAnswer) errors.correctAnswer = 'Please select correct answer';
      }

      if (Object.keys(errors).length > 0) {
        await showFormErrorAlert(errors);
        setFormErrors(errors);
        setSubmitting(false);
        return;
      }

      const submitData = {
        question: formData.question,
        type: formData.type,
        options: formData.type === 'MULTIPLE_CHOICE' ? formData.options.filter(opt => opt.trim()) : undefined,
        correctAnswer: formData.correctAnswer,
        points: formData.marks, // Changed from marks to points to match backend
        isActive: formData.isActive,
        quizId,
        authorId
      };

      if (editingQuestion) {
        await questionsAPI.update(editingQuestion.id, submitData);
        await showSuccessAlert('Success', 'Question updated successfully');
      } else {
        await questionsAPI.create(submitData);
        await showSuccessAlert('Success', 'Question created successfully');
      }
      
      onQuestionSaved();
      handleCloseModal();
    } catch (error) {
      handleApiError(error, editingQuestion ? 'Failed to update question' : 'Failed to create question');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCloseModal}
      title={editingQuestion ? 'Edit Question' : 'Add Question'}
      size="xl"
    >
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-800">
          <strong>Quiz:</strong> {quizTitle}
        </p>
      </div>

      <Form onSubmit={handleSubmit}>
        <FormField
          label="Question Type"
          name="type"
          type="select"
          value={formData.type}
          onChange={handleTypeChange}
          options={questionTypeOptions}
          required
        />

        <FormField
          label="Question Content"
          name="question"
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
              Options <span className="text-red-500">*</span>
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
              Correct Answer <span className="text-red-500">*</span>
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
            {formErrors.correctAnswer && (
              <p className="text-sm text-red-600">{formErrors.correctAnswer}</p>
            )}
          </div>
        )}

        {(formData.type === 'SHORT_ANSWER' || formData.type === 'ESSAY') && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Correct Answer (Sample Answer)
            </label>
            <textarea
              value={formData.correctAnswer}
              onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Provide a sample correct answer..."
            />
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
          submitText={editingQuestion ? 'Update Question' : 'Add Question'}
          disabled={submitting}
        />
      </Form>
    </Modal>
  );
};

export default QuestionModal;
