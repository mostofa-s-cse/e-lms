"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUploadError = exports.uploadProfilePicture = exports.uploadNoteFile = exports.uploadVideoFiles = exports.uploadCourseThumbnail = exports.uploadMultiple = exports.uploadSingle = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const uploadsDir = path_1.default.join(__dirname, '../../uploads');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const base = path_1.default.join(__dirname, '../../uploads');
        if (file.fieldname === 'videoUrl') {
            const dir = path_1.default.join(base, 'videos');
            if (!fs_1.default.existsSync(dir))
                fs_1.default.mkdirSync(dir, { recursive: true });
            cb(null, dir);
        }
        else if (file.fieldname === 'thumbnail' && req.path?.includes('/courses')) {
            const dir = path_1.default.join(base, 'thumbnails');
            if (!fs_1.default.existsSync(dir))
                fs_1.default.mkdirSync(dir, { recursive: true });
            cb(null, dir);
        }
        else if (file.fieldname === 'thumbnail') {
            const dir = path_1.default.join(base, 'thumbnails');
            if (!fs_1.default.existsSync(dir))
                fs_1.default.mkdirSync(dir, { recursive: true });
            cb(null, dir);
        }
        else if (file.fieldname === 'file' && req.path?.includes('/notes')) {
            const dir = path_1.default.join(base, 'notes');
            if (!fs_1.default.existsSync(dir))
                fs_1.default.mkdirSync(dir, { recursive: true });
            cb(null, dir);
        }
        else {
            cb(null, base);
        }
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path_1.default.extname(file.originalname);
        const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
        cb(null, filename);
    }
});
const allowedMimes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/quicktime',
    'video/x-msvideo',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv'
];
const fileFilter = (_req, file, cb) => {
    if (allowedMimes.includes(file.mimetype)) {
        console.log('File accepted');
        cb(null, true);
    }
    else {
        console.log('File rejected - invalid type');
        cb(new Error('Invalid file type. Only images and videos are allowed.'));
    }
};
const maxSize = parseInt(process.env.MAX_FILE_SIZE || '10485760');
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: maxSize
    }
});
exports.uploadSingle = upload.single('file');
exports.uploadMultiple = upload.array('files', 5);
exports.uploadCourseThumbnail = upload.single('thumbnail');
exports.uploadVideoFiles = upload.fields([
    { name: 'videoUrl', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
]);
exports.uploadNoteFile = upload.single('file');
exports.uploadProfilePicture = upload.single('profilePicture');
const handleUploadError = (err, _req, res, next) => {
    if (err instanceof multer_1.default.MulterError) {
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
    next(err);
};
exports.handleUploadError = handleUploadError;
//# sourceMappingURL=upload.js.map