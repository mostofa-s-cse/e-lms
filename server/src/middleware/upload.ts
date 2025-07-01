import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const base = path.join(__dirname, '../../uploads');
    
    if (file.fieldname === 'videoUrl') {
      const dir = path.join(base, 'videos');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    } else if (file.fieldname === 'thumbnail') {
      const dir = path.join(base, 'thumbnails');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    } else {
      cb(null, base); // fallback
    }
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});


// Allowed MIME types for video and image uploads
const allowedMimes = [
  // Images
  'image/jpeg',
  'image/png',
  'image/gif',

  // Videos
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime', // for .mov files
  'video/x-msvideo'  // for .avi files
];

// File filter function
const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images and videos are allowed.'));
  }
};

// Set max file size (10MB by default)
const maxSize = parseInt(process.env.MAX_FILE_SIZE || '10485760'); // 10MB

// Configure base multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxSize
  }
});

// Export configured uploaders
export const uploadSingle = upload.single('file');
export const uploadMultiple = upload.array('files', 5);

// Upload handler for video + thumbnail
export const uploadVideoFiles = upload.fields([
  { name: 'videoUrl', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]);

// Error-handling middleware for uploads
export const handleUploadError = (err: any, _req: any, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({ success: false, message: 'File too large. Maximum allowed size is 10MB.' });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({ success: false, message: 'Too many files. Max 5 allowed.' });
      default:
        return res.status(400).json({ success: false, message: err.message });
    }
  }

  if (err && err.message && err.message.includes('Invalid file type')) {
    return res.status(400).json({ success: false, message: err.message });
  }

  next(err); // For other errors
};
