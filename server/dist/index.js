"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const errorHandler_1 = require("./middleware/errorHandler");
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const courses_1 = __importDefault(require("./routes/courses"));
const intakes_1 = __importDefault(require("./routes/intakes"));
const notes_1 = __importDefault(require("./routes/notes"));
const videos_1 = __importDefault(require("./routes/videos"));
const quizzes_1 = __importDefault(require("./routes/quizzes"));
const questions_1 = __importDefault(require("./routes/questions"));
const evaluations_1 = __importDefault(require("./routes/evaluations"));
const quizAttempts_1 = __importDefault(require("./routes/quizAttempts"));
const enrollments_1 = __importDefault(require("./routes/enrollments"));
const payments_1 = __importDefault(require("./routes/payments"));
const sslcommerz_1 = __importDefault(require("./routes/sslcommerz"));
const carts_1 = __importDefault(require("./routes/carts"));
const contact_1 = __importDefault(require("./routes/contact"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, helmet_1.default)({
    frameguard: false,
    contentSecurityPolicy: {
        useDefaults: true,
        directives: {
            "frame-ancestors": ["'self'", "http://localhost:3000"],
        },
    },
}));
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin)
            return callback(null, true);
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
        }
        else {
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
app.use((0, cors_1.default)(corsOptions));
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
const fileTypes = ['.mp4', '.webm', '.ogg', '.jpg', '.jpeg', '.JPG', '.pdf', '.docx', '.png', '.webp'];
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads'), {
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
app.use('/uploads/notes', express_1.default.static(path_1.default.join(__dirname, '../uploads/notes'), {
    setHeaders: (res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', 'Range');
        res.setHeader('Access-Control-Expose-Headers', 'Content-Range, Accept-Ranges, Content-Length');
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    }
}));
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'LMS Server is running',
        timestamp: new Date().toISOString(),
        apiVersion: 'v1',
    });
});
app.use('/api/v1/auth', auth_1.default);
app.use('/api/v1/users', users_1.default);
app.use('/api/v1/courses', courses_1.default);
app.use('/api/v1/intakes', intakes_1.default);
app.use('/api/v1/notes', notes_1.default);
app.use('/api/v1/videos', videos_1.default);
app.use('/api/v1/quizzes', quizzes_1.default);
app.use('/api/v1/questions', questions_1.default);
app.use('/api/v1/evaluations', evaluations_1.default);
app.use('/api/v1/quizAttempts', quizAttempts_1.default);
app.use('/api/v1/enrollments', enrollments_1.default);
app.use('/api/v1/payments', payments_1.default);
app.use('/api/v1/payments/sslcommerz', sslcommerz_1.default);
app.use('/api/v1/carts', carts_1.default);
app.use('/api/v1/contact', contact_1.default);
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl,
    });
});
app.use(errorHandler_1.errorHandler);
app.listen(PORT, () => {
    console.log(`🚀 LMS Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔗 API Base URL: http://localhost:${PORT}/api/v1`);
});
exports.default = app;
//# sourceMappingURL=index.js.map