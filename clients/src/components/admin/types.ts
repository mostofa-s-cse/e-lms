export interface Course {
  id: string;
  title: string;
  description: string;
  code: string;
  credits: number;
  isActive: boolean;
  teacher?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  intakes?: Array<{
    id: string;
    name: string;
    startDate: string;
    endDate: string;
  }>;
  _count?: {
    enrollments: number;
    notes: number;
    videos: number;
    quizzes: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnail: string;
  duration: number;
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
}

export interface Enrollment {
  id: string;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  intake?: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
  };
  enrolledAt: string;
  status: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  courseId: string;
  author?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  courseId: string;
  duration: number;
  passingScore: number;
  isActive: boolean;
  author?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
} 