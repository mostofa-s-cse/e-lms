import { Request } from 'express';
import { UserRole, EnrollmentStatus, QuestionType, EvaluationType } from '@prisma/client';

// Extended Request interface with user
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

// User types
export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
}

export interface LoginDto {
  email: string;
  password: string;
}

// Course types
export interface CreateCourseDto {
  title: string;
  description: string;
  code: string;
  credits?: number;
}

export interface UpdateCourseDto {
  title?: string;
  description?: string;
  code?: string;
  credits?: number;
  isActive?: boolean;
}

// Intake types
export interface CreateIntakeDto {
  name: string;
  startDate: Date;
  endDate: Date;
  courseId: string;
}

export interface UpdateIntakeDto {
  name?: string;
  startDate?: Date;
  endDate?: Date;
  isActive?: boolean;
}

// Enrollment types
export interface CreateEnrollmentDto {
  studentId: string;
  courseId: string;
  intakeId: string;
}

export interface UpdateEnrollmentDto {
  status?: EnrollmentStatus;
}

// Note types
export interface CreateNoteDto {
  title: string;
  description?: string;
  courseId: string;
}

export interface UpdateNoteDto {
  title?: string;
  description?: string;
  isActive?: boolean;
}

// Video types
export interface CreateVideoDto {
  title: string;
  description?: string;
  videoUrl: string;
  duration: number;
  thumbnail?: string;
  courseId: string;
}

export interface UpdateVideoDto {
  title?: string;
  description?: string;
  videoUrl?: string;
  duration?: number;
  thumbnail?: string;
  isActive?: boolean;
}

// Quiz types
export interface CreateQuizDto {
  title: string;
  description?: string;
  duration: number;
  totalMarks: number;
  passingMarks: number;
  startTime?: Date;
  endTime?: Date;
  courseId: string;
}

export interface UpdateQuizDto {
  title?: string;
  description?: string;
  duration?: number;
  totalMarks?: number;
  passingMarks?: number;
  startTime?: Date;
  endTime?: Date;
  isActive?: boolean;
}

// Question types
export interface CreateQuestionDto {
  question: string;
  type: QuestionType;
  options?: string[];
  correctAnswer: string;
  marks?: number;
  quizId: string;
}

export interface UpdateQuestionDto {
  question?: string;
  type?: QuestionType;
  options?: string[];
  correctAnswer?: string;
  marks?: number;
  isActive?: boolean;
}

// Quiz Attempt types
export interface CreateQuizAttemptDto {
  quizId: string;
  answers: {
    questionId: string;
    answer: string;
  }[];
}

// Evaluation types
export interface CreateEvaluationDto {
  title: string;
  description?: string;
  type: EvaluationType;
  score?: number;
  maxScore: number;
  feedback?: string;
  studentId: string;
}

export interface UpdateEvaluationDto {
  title?: string;
  description?: string;
  type?: EvaluationType;
  score?: number;
  maxScore?: number;
  feedback?: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// File upload types
export interface FileUploadResponse {
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
  url: string;
} 