import React, { useState, useEffect } from 'react';
import { notesAPI, coursesAPI } from '../../../services/api';
import DataTable from '../../../pages/DataTable';
import Modal from '../../../components/Modal';
import { Form, FormField, FormActions } from '../../../components/Form';
import { 
  showSuccessAlert, 
  showErrorAlert, 
  showDeleteConfirmDialog, 
  showFormErrorAlert,
  handleApiError 
} from '../../../utils/sweetAlert';

interface Note {
  id: string;
  title: string;
  description?: string;
  file?: string;
  isImage?: boolean;
  fileSize?: number;
  fileType?: string;
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

interface Course {
  id: string;
  title: string;
  code: string;
}

interface NotesResponse {
  data: Note[];
}

interface CoursesResponse {
  data: Course[];
}

const NotesPage = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    file: null as File | null
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchNotes();
    fetchCourses();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await notesAPI.getAll();
      setNotes((response.data as NotesResponse).data);
    } catch (error) {
      handleApiError(error, 'Failed to fetch notes');
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

  const handleCreate = () => {
    setEditingNote(null);
    setFormData({
      title: '',
      description: '',
      courseId: '',
      file: null
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      description: note.description || '',
      courseId: note.courseId,
      file: null
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleDelete = async (note: Note) => {
    const result = await showDeleteConfirmDialog(`"${note.title}"`);
    
    if (result.isConfirmed) {
      try {
        await notesAPI.delete(note.id);
        showSuccessAlert(
          'Note Deleted', 
          `"${note.title}" has been successfully deleted.`
        );
        fetchNotes();
      } catch (error) {
        handleApiError(error, 'Failed to delete note');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData({ ...formData, file });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    // Basic validation
    const errors: Record<string, string> = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.description?.trim()) errors.description = 'Description is required';
    if (!formData.courseId) errors.courseId = 'Course is required';

    if (Object.keys(errors).length > 0) {
      showFormErrorAlert(errors);
      setFormErrors(errors);
      return;
    }

    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('courseId', formData.courseId);
      if (formData.file) {
        submitData.append('file', formData.file);
      }

      if (editingNote) {
        await notesAPI.update(editingNote.id, submitData);
        showSuccessAlert(
          'Note Updated', 
          `"${formData.title}" has been successfully updated.`
        );
      } else {
        await notesAPI.create(submitData);
        showSuccessAlert(
          'Note Created', 
          `"${formData.title}" has been successfully created.`
        );
      }
      setShowModal(false);
      fetchNotes();
    } catch (error: any) {
      if (error.response?.data?.errors) {
        // Handle field-specific errors from server
        const serverErrors: Record<string, string> = {};
        error.response.data.errors.forEach((err: any) => {
          if (err.field) {
            serverErrors[err.field] = err.message;
          }
        });
        showFormErrorAlert(serverErrors);
        setFormErrors(serverErrors);
      } else {
        handleApiError(error, 'Failed to save note');
      }
    }
  };

  const courseOptions = courses.map(course => ({
    value: course.id,
    label: `${course.code} - ${course.title}`
  }));

  const columns = [
    {
      key: 'title',
      label: 'Title',
      render: (title: string, note: Note) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{title}</div>
          {note.file && (
            <div className="text-sm text-blue-600">
              {note.isImage ? '🖼️' : '📎'} {note.file.split('/').pop()}
              {note.fileSize && (
                <span className="text-gray-500 ml-1">
                  ({(note.fileSize / 1024 / 1024).toFixed(2)} MB)
                </span>
              )}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'description',
      label: 'Description',
      render: (description: string) => (
        <div className="text-sm text-gray-900 max-w-xs truncate">
          {description || 'No description'}
        </div>
      )
    },
    {
      key: 'course',
      label: 'Course',
      render: (_: any, note: Note) => (
        <div className="text-sm text-gray-900">
          {note.course ? `${note.course.code} - ${note.course.title}` : 'N/A'}
        </div>
      )
    },
    {
      key: 'author',
      label: 'Author',
      render: (_: any, note: Note) => (
        <div className="text-sm text-gray-900">
          {note.author ? `${note.author.firstName} ${note.author.lastName}` : 'N/A'}
        </div>
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
        <h1 className="text-3xl font-bold">Notes Management</h1>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Note
        </button>
      </div>

      <DataTable
        columns={columns}
        title="Notes"
        subtitle="Manage academic notes and their details"
        data={notes}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
      />

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingNote ? 'Edit Note' : 'Create Note'}
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

          <FormField
            label="Course"
            name="courseId"
            type="select"
            value={formData.courseId}
            onChange={(value) => setFormData({ ...formData, courseId: value as string })}
            options={courseOptions}
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
            rows={6}
          />

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Attachment
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.xlsx,.xls,.ppt,.pptx,.csv"
            />
            <p className="mt-1 text-sm text-gray-500">
              Supported formats: PDF, DOC, DOCX, TXT, JPG, PNG, XLSX, XLS, PPT, PPTX, CSV (Max size: 10MB)
            </p>
          </div>

          <FormActions
            onCancel={() => setShowModal(false)}
            submitText={editingNote ? 'Update' : 'Create'}
          />
        </Form>
      </Modal>
    </div>
  );
};

export default NotesPage; 