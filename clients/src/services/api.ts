import axios from 'axios';

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// User types
export interface UserProfile {
  id: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  profilePicture?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
  profile?: UserProfile;
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('API Interceptor: 401 error detected');
      console.log('API Interceptor: Current path:', window.location.pathname);
      
      // Only redirect to login if we're not on a public page
      const publicPages = ['/', '/courses', '/courses/', '/about', '/contact', '/login', '/register'];
      const currentPath = window.location.pathname;
      
      if (!publicPages.includes(currentPath) && !currentPath.startsWith('/courses/')) {
        console.log('API Interceptor: Redirecting to login from protected page');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      } else {
        console.log('API Interceptor: On public page, not redirecting');
        // Don't clear auth data on public pages - just let the error pass through
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (data: { email: string; password: string }) => 
    api.post('/auth/login', data),
  register: (data: { email: string; password: string; firstName: string; lastName: string; role: string }) => 
    api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
};

// Users API
export const usersAPI = {
  getAll: (query?: string) => api.get<ApiResponse<User[]>>(`/users${query || ''}`),
  getById: (id: string) => api.get<ApiResponse<User>>(`/users/${id}?includeProfile=true`),
  getTeachers: () => api.get<ApiResponse<User[]>>('/users/teachers'),
  getStudents: () => api.get<ApiResponse<User[]>>('/users/students'),
  create: (data: any) => {
    const isFormData = data instanceof FormData;
    const headers = isFormData ? { 'Content-Type': 'multipart/form-data' } : { 'Content-Type': 'application/json' };
    return api.post<ApiResponse<User>>('/users', data, { headers });
  },
  update: (id: string, data: any) => {
    const isFormData = data instanceof FormData;
    const headers = isFormData ? { 'Content-Type': 'multipart/form-data' } : { 'Content-Type': 'application/json' };
    return api.put<ApiResponse<User>>(`/users/${id}`, data, { headers });
  },
  updateProfile: (data: any) => {
    const isFormData = data instanceof FormData;
    const headers = isFormData ? { 'Content-Type': 'multipart/form-data' } : { 'Content-Type': 'application/json' };
    return api.put<ApiResponse<User>>('/users/profile/me', data, { headers });
  },
  delete: (id: string) => api.delete<ApiResponse>(`/users/${id}`),
};

// Courses API
export const coursesAPI = {
  getAll: () => api.get('/courses'),
  getById: (id: string) => api.get(`/courses/${id}`),
  getEnrollments: (id: string) => api.get(`/courses/${id}/enrollments`),
  getByTeacher: () => api.get('/courses/teacher'),
  create: (data: any) => {
    const isFormData = data instanceof FormData;
    const headers = isFormData ? { 'Content-Type': 'multipart/form-data' } : { 'Content-Type': 'application/json' };
    console.log('API: Creating course, isFormData:', isFormData);
    console.log('API: Data type:', typeof data);
    if (isFormData) {
      console.log('API: FormData has thumbnail:', data.has('thumbnail'));
    }
    
    return api.post('/courses', data, { headers });
  },
  update: (id: string, data: any) => {  
    const isFormData = data instanceof FormData;
    const headers = isFormData ? { 'Content-Type': 'multipart/form-data' } : { 'Content-Type': 'application/json' };
    console.log('API: Updating course, isFormData:', isFormData);
    
    return api.put(`/courses/${id}`, data, { headers });
  },
  delete: (id: string) => api.delete(`/courses/${id}`),
};

// Intakes API
export const intakesAPI = {
  getAll: () => api.get('/intakes'),
  getById: (id: string) => api.get(`/intakes/${id}`),
  getEnrollments: (id: string) => api.get(`/intakes/${id}/enrollments`),
  getByTeacher: () => api.get('/intakes/teacher'),
  create: (data: any) => api.post('/intakes', data),
  update: (id: string, data: any) => api.put(`/intakes/${id}`, data),
  delete: (id: string) => api.delete(`/intakes/${id}`),
};

// Notes API
export const notesAPI = {
  getAll: () => api.get('/notes'),
  getById: (id: string) => api.get(`/notes/${id}`),
  getByCourse: (courseId: string) => api.get(`/notes/course/${courseId}`),
  getByTeacher: () => api.get('/notes/teacher'),
  create: (data: any) =>{ 
    const isFormData = data instanceof FormData;
    const headers = isFormData ? { 'Content-Type': 'multipart/form-data' } : { 'Content-Type': 'application/json' };
    return api.post('/notes', data, { headers });
  },
  update: (id: string, data: any) => {
    const isFormData = data instanceof FormData;
    const headers = isFormData ? { 'Content-Type': 'multipart/form-data' } : { 'Content-Type': 'application/json' };
    return api.put(`/notes/${id}`, data, { headers });
  },
  delete: (id: string) => api.delete(`/notes/${id}`),
};

// Videos API
export const videosAPI = {
  getAll: () => api.get('/videos'),
  getById: (id: string) => api.get(`/videos/${id}`),
  getByCourse: (courseId: string) => api.get(`/videos/course/${courseId}`),
  getByTeacher: () => api.get('/videos/teacher'),
  create: (data: any) => {
    console.log('Form data being submitted apis:', {
      data
    });
    const isFormData = data instanceof FormData;
    return api.post('/videos', data, {
      headers: isFormData ? {} : { 'Content-Type': 'multipart/form-data'}

    });
  },
  update: (id: string, data: any) => {
    const isFormData = data instanceof FormData;
    return api.put(`/videos/${id}`, data, {
      headers: isFormData ? {} : { 'Content-Type': 'multipart/form-data' }
    });
  },
  delete: (id: string) => api.delete(`/videos/${id}`),
};


// Quizzes API
export const quizzesAPI = {
  getAll: () => api.get('/quizzes'),
  getById: (id: string) => api.get(`/quizzes/${id}`),
  getByCourse: (courseId: string) => api.get(`/quizzes/course/${courseId}`),
  getByTeacher: () => api.get('/quizzes/teacher'),
  create: (quizData: any) => api.post('/quizzes', quizData),
  update: (id: string, quizData: any) => api.put(`/quizzes/${id}`, quizData),
  delete: (id: string) => api.delete(`/quizzes/${id}`),
};

// Questions API
export const questionsAPI = {
  getAll: () => api.get('/questions'),
  getById: (id: string) => api.get(`/questions/${id}`),
  getByQuiz: (quizId: string) => api.get(`/questions/quiz/${quizId}`),
  create: (questionData: any) => api.post('/questions', questionData),
  update: (id: string, questionData: any) => api.put(`/questions/${id}`, questionData),
  delete: (id: string) => api.delete(`/questions/${id}`),
};

// Evaluations API
export const evaluationsAPI = {
  getAll: () => api.get('/evaluations'),
  getById: (id: string) => api.get(`/evaluations/${id}`),
  getByCourse: (courseId: string) => api.get(`/evaluations/course/${courseId}`),
  getByTeacher: () => api.get('/evaluations/teacher'),
  create: (evaluationData: any) => api.post('/evaluations', evaluationData),
  update: (id: string, evaluationData: any) => api.put(`/evaluations/${id}`, evaluationData),
  delete: (id: string) => api.delete(`/evaluations/${id}`),
};

// Quiz Attempts API
export const quizAttemptsAPI = {
  getAll: () => api.get('/quizAttempts'),
  getById: (id: string) => api.get(`/quizAttempts/${id}`),
  getByQuiz: (quizId: string) => api.get(`/quizAttempts/quiz/${quizId}`),
  create: (attemptData: any) => api.post('/quizAttempts', attemptData),
  delete: (id: string) => api.delete(`/quizAttempts/${id}`),
};

// Enrollments API
export const enrollmentsAPI = {
  getAll: () => api.get('/enrollments'),
  getById: (id: string) => api.get(`/enrollments/${id}`),
  getByStudent: (studentId: string) => api.get(`/enrollments/student/${studentId}`),
  getByCourse: (courseId: string) => api.get(`/enrollments/course/${courseId}`),
  getByStudentAndCourse: (studentId: string, courseId: string) => api.get(`/enrollments/student/${studentId}/course/${courseId}`),
  create: (enrollmentData: { courseId: string; intakeId?: string }) => api.post('/enrollments', enrollmentData),
  updateStatus: (id: string, status: string) => api.patch(`/enrollments/${id}/status`, { status }),
  delete: (id: string) => api.delete(`/enrollments/${id}`),
};

// Student-specific API endpoints
export const studentAPI = {
  // Get student's enrolled courses
  getEnrolledCourses: (studentId: string) => api.get(`/students/${studentId}/courses`),
  
  // Get student's enrolled intakes
  getEnrolledIntakes: (studentId: string) => api.get(`/students/${studentId}/intakes`),
  
  // Get student's course notes
  getCourseNotes: (studentId: string) => api.get(`/students/${studentId}/notes`),
  
  // Get student's course videos
  getCourseVideos: (studentId: string) => api.get(`/students/${studentId}/videos`),
  
  // Get student's course quizzes
  getCourseQuizzes: (studentId: string) => api.get(`/students/${studentId}/quizzes`),
  
  // Get student's evaluations
  getEvaluations: (studentId: string) => api.get(`/students/${studentId}/evaluations`),
  
  // Get student's quiz attempts
  getQuizAttempts: (studentId: string) => api.get(`/students/${studentId}/quiz-attempts`),
  
  // Get student's profile
  getProfile: (studentId: string) => api.get(`/students/${studentId}/profile`),
};

// Custom Payment API (replacing SSLCommerz)
export const paymentsAPI = {
  // New custom payment methods
  createPayment: (data: any) => api.post('/payments/create', data),
  createCartPayment: (data: any) => api.post('/payments/create-cart', data),
  createFreeEnrollment: (data: any) => api.post('/payments/free-enrollment', data),
  validatePayment: (data: any) => api.post('/payments/validate', data),
  
  // Existing payment management methods
  getAll: () => api.get('/payments'),
  getById: (id: string) => api.get(`/payments/${id}`),
  getByUser: (userId: string) => api.get(`/payments/user/${userId}`),
  getByEnrollment: (enrollmentId: string) => api.get(`/payments/enrollment/${enrollmentId}`),
  create: (paymentData: {
    userId: string;
    enrollmentId: string;
    amount: number;
    currency?: string;
    method: string;
    referenceId?: string;
  }) => api.post('/payments', paymentData),
  update: (id: string, paymentData: any) => api.put(`/payments/${id}`, paymentData),
  delete: (id: string) => api.delete(`/payments/${id}`),
  markCompleted: (id: string, referenceId?: string) => api.patch(`/payments/${id}/complete`, { referenceId }),
};

// SSLCommerz API (keeping for backward compatibility)
export const sslCommerzAPI = {
  createPaymentSession: (data: any) => api.post('/payments/sslcommerz/create-session', data),
  validatePayment: (data: any) => api.post('/payments/sslcommerz/validate', data),
  createCartPaymentSession: (data: any) => api.post('/payments/sslcommerz/create-cart-session', data),
};

// Cart API
export const cartAPI = {
  getCart: (params: { userId?: string; sessionId?: string }) => 
    api.get('/carts', { params }),
  createOrUpdateCart: (data: { userId?: string; sessionId?: string; items: any[] }) => 
    api.post('/carts', data),
  addToCart: (data: { userId?: string; sessionId?: string; item: any }) => 
    api.post('/carts/add', data),
  removeFromCart: (itemId: string, params: { userId?: string; sessionId?: string }) => 
    api.delete(`/carts/items/${itemId}`, { params }),
  clearCart: (params: { userId?: string; sessionId?: string }) => 
    api.delete('/carts/clear', { params }),
  mergeGuestCart: (data: { userId: string; sessionId: string }) => 
    api.post('/carts/merge', data),
};

export default api; 