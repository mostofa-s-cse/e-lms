import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

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
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
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
  getAll: () => api.get('/users'),
  getById: (id: string) => api.get(`/users/${id}`),
  create: (data: { email: string; password: string; firstName: string; lastName: string; role: string }) => 
    api.post('/users', data),
  update: (id: string, data: { firstName?: string; lastName?: string; email?: string; role?: string }) => 
    api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
};

// Courses API
export const coursesAPI = {
  getAll: () => api.get('/courses'),
  getById: (id: string) => api.get(`/courses/${id}`),
  getEnrollments: (id: string) => api.get(`/courses/${id}/enrollments`),
  create: (data: any) => api.post('/courses', data),
  update: (id: string, data: any) => api.put(`/courses/${id}`, data),
  delete: (id: string) => api.delete(`/courses/${id}`),
};

// Intakes API
export const intakesAPI = {
  getAll: () => api.get('/intakes'),
  getById: (id: string) => api.get(`/intakes/${id}`),
  getEnrollments: (id: string) => api.get(`/intakes/${id}/enrollments`),
  create: (data: any) => api.post('/intakes', data),
  update: (id: string, data: any) => api.put(`/intakes/${id}`, data),
  delete: (id: string) => api.delete(`/intakes/${id}`),
};

// Notes API
export const notesAPI = {
  getAll: () => api.get('/notes'),
  getById: (id: string) => api.get(`/notes/${id}`),
  getByCourse: (courseId: string) => api.get(`/notes/course/${courseId}`),
  create: (data: any) => api.post('/notes', data),
  update: (id: string, data: any) => api.put(`/notes/${id}`, data),
  delete: (id: string) => api.delete(`/notes/${id}`),
};

// Videos API
export const videosAPI = {
  getAll: () => api.get('/videos'),
  getById: (id: string) => api.get(`/videos/${id}`),
  getByCourse: (courseId: string) => api.get(`/videos/course/${courseId}`),
  create: (data: any) => api.post('/videos', data),
  update: (id: string, data: any) => api.put(`/videos/${id}`, data),
  delete: (id: string) => api.delete(`/videos/${id}`),
};

// Quizzes API
export const quizzesAPI = {
  getAll: () => api.get('/quizzes'),
  getById: (id: string) => api.get(`/quizzes/${id}`),
  getByCourse: (courseId: string) => api.get(`/quizzes/course/${courseId}`),
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
  create: (evaluationData: any) => api.post('/evaluations', evaluationData),
  update: (id: string, evaluationData: any) => api.put(`/evaluations/${id}`, evaluationData),
  delete: (id: string) => api.delete(`/evaluations/${id}`),
};

export default api; 