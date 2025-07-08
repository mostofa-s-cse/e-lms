import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { coursesAPI, usersAPI } from '../../../../services/api';
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

interface Course {
  id: string;
  title: string;
  description: string;
  code: string;
  credits: number;
  price: number;
  isFree: boolean;
  thumbnail: string | null;
  isActive: boolean;
  createdAt: string;
  teacher?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface CoursesResponse {
  data: Course[];
}

interface TeachersResponse {
  data: Teacher[];
}

const CoursesPage = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [teachersLoading, setTeachersLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    code: '',
    credits: 3,
    price: 0,
    isFree: false,
    thumbnail: null as File | null,
    teacherId: ''
  });
  const [currentThumbnailUrl, setCurrentThumbnailUrl] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchCourses();
    fetchTeachers();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await coursesAPI.getAll();
      setCourses((response.data as CoursesResponse).data);
    } catch (error) {
      handleApiError(error, 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

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

  const handleCreate = () => {
    setEditingCourse(null);
    setFormData({
      title: '',
      description: '',
      code: '',
      credits: 3,
      price: 0,
      isFree: false,
      thumbnail: null,
      teacherId: ''
    });
    setCurrentThumbnailUrl(null);
    setFormErrors({});
    setShowModal(true);
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
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
    setShowModal(true);
  };

  const handleDelete = async (course: Course) => {
    const result = await showDeleteConfirmDialog(course.title);
    
    if (result.isConfirmed) {
      try {
        await coursesAPI.delete(course.id);
        showSuccessAlert(
          'Course Deleted', 
          `${course.title} has been successfully deleted.`
        );
        fetchCourses();
      } catch (error) {
        handleApiError(error, 'Failed to delete course');
      }
    }
  };

  const handleView = (course: Course) => {
    navigate(`/admin/courses/${course.id}`);
  };

  const handleThumbnailFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, thumbnail: file }));
    if (file) {
      setFormErrors(prev => ({ ...prev, thumbnail: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    // Basic validation
    const errors: Record<string, string> = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.code.trim()) errors.code = 'Course code is required';
    if (formData.credits <= 0) errors.credits = 'Credits must be greater than 0';
    if (!formData.isFree && formData.price < 0) errors.price = 'Price cannot be negative';
    if (!editingCourse && !formData.teacherId) errors.teacherId = 'Teacher is required';
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

    if (Object.keys(errors).length > 0) {
      showFormErrorAlert(errors);
      setFormErrors(errors);
      return;
    }

    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('code', formData.code);
      submitData.append('credits', formData.credits.toString());
      submitData.append('price', formData.price.toString());
      submitData.append('isFree', formData.isFree.toString());
      
      if (formData.teacherId) {
        submitData.append('teacherId', formData.teacherId);
      }
      
      if (formData.thumbnail) {
        submitData.append('thumbnail', formData.thumbnail);
        console.log('Frontend: Adding thumbnail to FormData:', formData.thumbnail);
      }

      // Debug FormData contents
      console.log('Frontend: FormData contents:');
      console.log('Title:', submitData.get('title'));
      console.log('Description:', submitData.get('description'));
      console.log('Code:', submitData.get('code'));
      console.log('Credits:', submitData.get('credits'));
      console.log('Price:', submitData.get('price'));
      console.log('IsFree:', submitData.get('isFree'));
      console.log('TeacherId:', submitData.get('teacherId'));
      console.log('Thumbnail:', submitData.get('thumbnail'));

      if (editingCourse) {
        await coursesAPI.update(editingCourse.id, submitData);
        showSuccessAlert(
          'Course Updated', 
          `${formData.title} has been successfully updated.`
        );
      } else {
        await coursesAPI.create(submitData);
        showSuccessAlert(
          'Course Created', 
          `${formData.title} has been successfully created.`
        );
      }
      setShowModal(false);
      fetchCourses();
    } catch (error: any) {
      if (error.response?.data?.errors) {
        const serverErrors: Record<string, string> = {};
        error.response.data.errors.forEach((err: any) => {
          if (err.field) {
            serverErrors[err.field] = err.message;
          }
        });
        showFormErrorAlert(serverErrors);
        setFormErrors(serverErrors);
      } else {
        handleApiError(error, 'Failed to save course');
      }
    }
  };

  const columns = [
    {
      key: 'thumbnail',
      label: 'Thumbnail',
      render: (thumbnail: string | null, course: Course) => (
        <Link to={`/admin/courses/${course.id}`} className="cursor-pointer">
          <div className="flex items-center">
          {thumbnail ? (
            <img
              src={`${process.env.REACT_APP_IMG_URL || 'http://localhost:4000'}${thumbnail}`}
              alt="Course thumbnail"
              className="w-10 h-10 rounded object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
              <span className="text-xs text-gray-500">No image</span>
            </div>
          )}
        </div>
        </Link>
      )
    },
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      render: (title: string, course: Course) => (
        <Link to={`/admin/courses/${course.id}`} className="cursor-pointer">
          <div className="text-sm font-medium text-gray-900">{title}</div>
        </Link>
      )
    },
    {
      key: 'code',
      label: 'Code',
      sortable: true,
      render: (code: string) => (
        <div className="text-sm text-gray-900 font-mono">{code}</div>
      )
    },
    {
      key: 'teacher',
      label: 'Teacher',
      sortable: true,
      render: (teacher: any) => (
        <div className="text-sm text-gray-900">
          {teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Not assigned'}
        </div>
      )
    },
    {
      key: 'description',
      label: 'Description',
      render: (description: string) => (
        <div className="text-sm text-gray-600 truncate max-w-xs">
          {description}
        </div>
      )
    },
    {
      key: 'credits',
      label: 'Credits',
      sortable: true,
      render: (credits: number) => (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
          {credits} credits
        </span>
      )
    },
    {
      key: 'price',
      label: 'Price',
      sortable: true,
      render: (price: number, course: Course) => (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          {course.isFree ? 'Free' : `BDT ${price.toFixed(2)}`}
        </span>
      )
    },
    {
      key: 'isActive',
      label: 'Status',
      sortable: true,
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
      sortable: true,
      render: (date: string) => new Date(date).toLocaleDateString()
    }
  ];

  const teacherOptions = teachers.map(teacher => ({
    value: teacher.id,
    label: `${teacher.firstName} ${teacher.lastName} (${teacher.email})`
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Courses Management</h1>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Add Course
        </button>
      </div>

      <DataTable
        columns={columns}
        data={courses}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        title="Courses"
        subtitle="Manage academic courses and their details"
        searchable={true}
        filterable={true}
        pagination={true}
        itemsPerPage={10}
      />

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setCurrentThumbnailUrl(null);
        }}
        title={editingCourse ? 'Edit Course' : 'Add Course'}
      >
        <Form onSubmit={handleSubmit}>
          <FormField
            label="Title"
            name="title"
            type="text"
            value={formData.title}
            onChange={(value) => setFormData({ ...formData, title: value as string })}
            error={formErrors.title}
            required
          />
          
          <SearchableDropdown
            label="Teacher"
            value={formData.teacherId}
            onChange={(value) => setFormData({ ...formData, teacherId: value })}
            options={teacherOptions}
            placeholder="Select a teacher..."
            error={formErrors.teacherId}
            required={!editingCourse}
            loading={teachersLoading}
          />
          
          <FormField
            label="Course Code"
            name="code"
            type="text"
            value={formData.code}
            onChange={(value) => setFormData({ ...formData, code: value as string })}
            error={formErrors.code}
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
          />
          <FormField
            label="Credits"
            name="credits"
            type="number"
            value={formData.credits}
            onChange={(value) => setFormData({ ...formData, credits: value as number })}
            error={formErrors.credits}
            required
          />
          <FormField
            label="Price"
            name="price"
            type="number"
            value={formData.price}
            onChange={(value) => setFormData({ ...formData, price: value as number })}
            error={formErrors.price}
            disabled={formData.isFree}
          />
          
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isFree}
                onChange={(e) => setFormData({ ...formData, isFree: e.target.checked })}
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
            {currentThumbnailUrl && !formData.thumbnail && editingCourse && (
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
              onChange={handleThumbnailFileChange}
              className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                formErrors.thumbnail ? 'border-red-500' : 'border-gray-300'
              }`}
              accept="image/*"
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
              {editingCourse && ' - Leave empty to keep existing thumbnail'}
            </p>
          </div>

          <FormActions
            onCancel={() => setShowModal(false)}
            submitText={editingCourse ? 'Update Course' : 'Create Course'}
          />
        </Form>
      </Modal>
    </div>
  );
};

export default CoursesPage; 