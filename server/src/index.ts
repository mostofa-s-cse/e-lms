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
import quizAttemptRoutes from './routes/quizAttempts';
import enrollmentRoutes from './routes/enrollments';
import paymentRoutes from './routes/payments';
import sslCommerzRoutes from './routes/sslcommerz';
import cartRoutes from './routes/carts';
import contactRoutes from './routes/contact';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ===== ✅ FIX: Helmet Configuration (Allow iframe embedding from frontend) =====
app.use(
  helmet({
    frameguard: false, // Disable X-Frame-Options header
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "frame-ancestors": ["'self'", "http://localhost:3000"], // Allow embedding from React app
        // Add production domain when deployed, e.g.:
        // "frame-ancestors": ["'self'", "https://your-frontend-domain.com"]
      },
    },
  })
);

// ===== ✅ CORS Configuration =====
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
    ];

    if (process.env.CLIENT_URL) {
      allowedOrigins.push(process.env.CLIENT_URL);
    }

    if (allowedOrigins.includes(origin)) {
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

app.use(cors(corsOptions));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ===== ✅ Serve static files with headers for preview/download =====
const fileTypes = ['.mp4', '.webm', '.ogg', '.jpg', '.jpeg', '.JPG', '.pdf', '.docx', '.png', '.webp'];

app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  setHeaders: (res, filePath) => {
    if (fileTypes.some(ext => filePath.endsWith(ext))) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Headers', 'Range');
      res.setHeader('Access-Control-Expose-Headers', 'Content-Range, Accept-Ranges, Content-Length');
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    }
  }
}));

app.use('/uploads/notes', express.static(path.join(__dirname, '../uploads/notes'), {
  setHeaders: (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Range');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range, Accept-Ranges, Content-Length');
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// ===== Health check =====
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'LMS Server is running',
    timestamp: new Date().toISOString(),
    apiVersion: 'v1',
  });
});

// ===== API Routes =====
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/intakes', intakeRoutes);
app.use('/api/v1/notes', noteRoutes);
app.use('/api/v1/videos', videoRoutes);
app.use('/api/v1/quizzes', quizRoutes);
app.use('/api/v1/questions', questionRoutes);
app.use('/api/v1/evaluations', evaluationRoutes);
app.use('/api/v1/quizAttempts', quizAttemptRoutes);
app.use('/api/v1/enrollments', enrollmentRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/payments/sslcommerz', sslCommerzRoutes);
app.use('/api/v1/carts', cartRoutes);
app.use('/api/v1/contact', contactRoutes);

// ===== 404 Fallback =====
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
  });
});

// ===== Error Handler Middleware =====
app.use(errorHandler);

// ===== Start Server =====
app.listen(PORT, () => {
  console.log(`🚀 LMS Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api/v1`);
});

export default app;
