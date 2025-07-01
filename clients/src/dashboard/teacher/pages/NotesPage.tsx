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
  description: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  courseId: string;
  course?: {
    title: string;
  };
  createdAt: string;
}

interface NotesResponse {
  data: Note[];
}

const NotesPage = () => {
  const [notes, setNotes] = useState<Note[]>([]);
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
      description: note.description,
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    const errors: Record<string, string> = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.courseId) errors.courseId = 'Course is required';
    if (!editingNote && !formData.file) errors.file = 'File is required';

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

  const columns = [
    {
      key: 'title',
      label: 'Note',
      render: (title: string, note: Note) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{title}</div>
          <div className="text-sm text-gray-500">{note.course?.title}</div>
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
      key: 'fileName',
      label: 'File',
      render: (fileName: string, note: Note) => (
        <div className="text-sm text-gray-900">
          <div className="font-medium">{fileName}</div>
          <div className="text-xs text-gray-500">{formatFileSize(note.fileSize)}</div>
        </div>
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
        <div>
          <h1 className="text-3xl font-bold">My Notes</h1>
          <p className="text-gray-600 mt-2">Manage course notes and materials</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Upload Note
        </button>
      </div>

      <DataTable
        columns={columns}
        data={notes}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
      />

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingNote ? 'Edit Note' : 'Upload Note'}
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
            label="Description"
            name="description"
            type="textarea"
            value={formData.description}
            onChange={(value) => setFormData({ ...formData, description: value as string })}
            error={formErrors.description}
            required
            rows={3}
          />

          <FormField
            label="Course"
            name="courseId"
            type="select"
            value={formData.courseId}
            onChange={(value) => setFormData({ ...formData, courseId: value as string })}
            error={formErrors.courseId}
            required
            options={[
              { value: '', label: 'Select a course' },
              { value: '1', label: 'Course 1' },
              { value: '2', label: 'Course 2' }
            ]}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              File {!editingNote && '*'}
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.txt,.ppt,.pptx"
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {formErrors.file && (
              <p className="mt-1 text-sm text-red-600">{formErrors.file}</p>
            )}
            {editingNote && (
              <p className="mt-1 text-sm text-gray-500">
                Current file: {editingNote.fileName} ({formatFileSize(editingNote.fileSize)})
              </p>
            )}
          </div>

          <FormActions
            onCancel={() => setShowModal(false)}
            submitText={editingNote ? 'Update' : 'Upload'}
          />
        </Form>
      </Modal>
    </div>
  );
};

export default NotesPage; 