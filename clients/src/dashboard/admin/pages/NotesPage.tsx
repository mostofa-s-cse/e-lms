import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notesAPI, coursesAPI } from '../../../services/api';
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

interface Note {
  id: string;
  title: string;
  description?: string;
  attachment?: string;
  isImage?: boolean;
  attachmentSize?: number;
  attachmentType?: string;
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
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Note[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    attachmentSize: 0,
    attachmentType: '',
    isActive: true,
    attachment: null as File | null
  });
  const [currentFileUrl, setCurrentFileUrl] = useState<string | null>(null);
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
      attachment: null,
      attachmentSize: 0,
      attachmentType: '',
      isActive: true,
    });
    setCurrentFileUrl(null);
    setFormErrors({});
    setShowModal(true);
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      description: note.description || '',
      courseId: note.courseId,
      attachment: null,
      attachmentSize: note.attachmentSize || 0,
      attachmentType: note.attachmentType || '',
      isActive: note.isActive,
    });
    setCurrentFileUrl(note.attachment || null);
    setFormErrors({});
    setShowModal(true);
  };

  const handleView = (note: Note) => {
    navigate(`/admin/notes/${note.id}`);
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
    const selectedFile = e.target.files?.[0] || null;
    setFormData({ 
      ...formData, 
      attachment: selectedFile,
      attachmentSize: selectedFile?.size || 0,
      attachmentType: selectedFile?.type || ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    // Basic validation
    const errors: Record<string, string> = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.description?.trim()) errors.description = 'Description is required';
    if (!formData.courseId) errors.courseId = 'Course is required';
    
    // File validation
    if (!editingNote && !formData.attachment) {
      errors.attachment = 'File is required for new notes';
    } else if (formData.attachment) {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (formData.attachment.size > maxSize) {
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
      
      if (!allowedTypes.includes(formData.attachment.type)) {
        errors.attachment = 'Please select a valid file type';
      }
    }

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
      submitData.append('isActive', formData.isActive ? 'true' : 'false');
      
      if (formData.attachment) {
        submitData.append('attachment', formData.attachment);
        submitData.append('attachmentSize', formData.attachment.size.toString());
        submitData.append('attachmentType', formData.attachment.type);
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
      label: 'Title',
      render: (title: string, note: Note) => (
        <div>
          <div 
            className="text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600 hover:underline"
            onClick={() => handleView(note)}
          >
            {title}
          </div>
          {note.attachment && (
            <div className="text-sm text-blue-600">
              {note.isImage ? '🖼️' : '📎'} {note.attachment.split('/').pop()}
              {note.attachmentSize && (
                <span className="text-gray-500 ml-1">
                  ({(note.attachmentSize / 1024 / 1024).toFixed(2)} MB)
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
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
      />

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setCurrentFileUrl(null);
        }}
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
            rows={6}
          />

          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
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
            {currentFileUrl && !formData.attachment && editingNote && (
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
                formErrors.file ? 'border-red-500' : 'border-gray-300'
              }`}
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.xlsx,.xls,.ppt,.pptx,.csv"
            />
            {formData.attachment && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800">
                  <strong>Selected:</strong> {formData.attachment.name}
                </p>
                <p className="text-xs text-green-600">
                  Size: {(formData.attachment.size / (1024 * 1024)).toFixed(2)} MB
                </p>
                <p className="text-xs text-green-600">
                  Type: {formData.attachment.type}
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
            onCancel={() => setShowModal(false)}
            submitText={editingNote ? 'Update' : 'Create'}
          />
        </Form>
      </Modal>
    </div>
  );
};

export default NotesPage; 