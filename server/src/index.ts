import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { errorHandler } from './middleware/errorHandler';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import courseRoutes from './routes/courses';
import intakeRoutes from './routes/intakes';
import noteRoutes from './routes/notes';
import videoRoutes from './routes/videos';
import quizRoutes from './routes/quizzes';
import questionRoutes from './routes/questions';
import evaluationRoutes from './routes/evaluations';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'http://localhost:3000', // React dev server
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
    ];

    if (process.env.CLIENT_URL) {
      allowedOrigins.push(process.env.CLIENT_URL);
    }

    if (process.env.NODE_ENV === 'development') {
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
    }

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Range'],
  exposedHeaders: ['Content-Range', 'Accept-Ranges', 'Content-Length'],
  optionsSuccessStatus: 200,
};

app.use(helmet());
app.use(cors(corsOptions));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// === FIX HERE === Serve static uploads with CORS & Range headers for videos
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.mp4') || filePath.endsWith('.webm') || filePath.endsWith('.ogg') || filePath.endsWith('.jpg') || filePath.endsWith('.jpeg') ||filePath.endsWith('.JPG')|| filePath.endsWith('.png')) {
      res.setHeader('Access-Control-Allow-Origin', '*'); // Or your frontend URL
      res.setHeader('Access-Control-Allow-Headers', 'Range');
      res.setHeader('Access-Control-Expose-Headers', 'Content-Range, Accept-Ranges, Content-Length');
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin'); // Optional but helps with CORS
    }
  }
}));

// Serve course thumbnails specifically
app.use('/uploads/course', express.static(path.join(__dirname, '../uploads/course'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg') || filePath.endsWith('.JPG') || filePath.endsWith('.png') || filePath.endsWith('.pdf') || filePath.endsWith('.docx') || filePath.endsWith('.webp')) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    }
  }
}));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'LMS Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/intakes', intakeRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/evaluations', evaluationRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
  });
});

// Error handler middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 LMS Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
});

export default app;
