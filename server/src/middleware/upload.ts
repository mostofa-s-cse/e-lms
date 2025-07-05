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
    
    console.log('Destination check:', {
      fieldname: file.fieldname,
      path: req.path,
      includesNotes: req.path?.includes('/notes')
    });
    
    if (file.fieldname === 'videoUrl') {
      const dir = path.join(base, 'videos');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      console.log('Saving video to:', dir);
      cb(null, dir);
    } else if (file.fieldname === 'thumbnail' && req.path?.includes('/courses')) {
      // Handle course thumbnail uploads
      const dir = path.join(base, 'thumbnails');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      console.log('Saving course thumbnail to:', dir);
      cb(null, dir);
    } else if (file.fieldname === 'thumbnail') {
      const dir = path.join(base, 'thumbnails');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      console.log('Saving thumbnail to:', dir);
      cb(null, dir);
    } else if (file.fieldname === 'attachment') {
      const dir = path.join(base, 'notes');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      console.log('Saving note file to:', dir);
      cb(null, dir);
    } else if (file.fieldname === 'profilePicture') {
      const dir = path.join(base, 'profile');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      console.log('Saving profile picture to:', dir);
      cb(null, dir);
    } else {
      console.log('Using fallback directory:', base);
      cb(null, base); // fallback
    }
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
    // console.log('Generated filename:', filename);
    cb(null, filename);
  }
});


// Allowed MIME types for video, image, and document uploads
const allowedMimes = [
  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/jpg',
  'image/svg',
  'image/icon',

  // Videos
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime', // for .mov files
  'video/x-msvideo',  // for .avi files

  // Documents (for notes)
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
  'text/plain',
  'text/csv'
];

// File filter function
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  console.log('File upload attempt:', {
    fieldname: file.fieldname,
    originalname: file.originalname,
    mimetype: file.mimetype,
    path: req.path
  });
  
  if (allowedMimes.includes(file.mimetype)) {
    console.log('File accepted - mimetype:', file.mimetype);
    cb(null, true);
  } else {
    console.log('File rejected - invalid mimetype:', file.mimetype);
    cb(new Error(`Invalid file type: ${file.mimetype}. Allowed types: images, videos, and documents (PDF, Word, Excel, PowerPoint, text files).`));
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
export const uploadNoteFile = upload.single('attachment');
export const uploadMultiple = upload.array('files', 5);

// Upload handler for course thumbnails
export const uploadCourseThumbnail = upload.single('thumbnail');

// Upload handler for video + thumbnail
export const uploadVideoFiles = upload.fields([
  { name: 'videoUrl', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]);
// Upload handler for profile pictures
export const uploadProfilePicture = upload.single('profilePicture');

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
