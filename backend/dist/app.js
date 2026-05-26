"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const v1_1 = __importDefault(require("./routes/v1"));
const error_middleware_1 = require("./middlewares/error.middleware");
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
const allowedOrigins = (process.env.CLIENT_ORIGIN ?? 'http://localhost:5173').split(',');
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error(`CORS: Origin "${origin}" not allowed.`));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use((0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 2000,
    standardHeaders: true,
    legacyHeaders: false,
    message: { status: 'fail', message: 'Too many requests. Please try again later.' },
}));
app.use(express_1.default.json({ limit: '2mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '2mb' }));
app.use((0, cookie_parser_1.default)());
if (process.env.NODE_ENV !== 'test') {
    app.use((0, morgan_1.default)(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}
app.get('/health', (_req, res) => {
    res.status(200).json({
        status: 'success',
        data: {
            service: 'CampusCoin API',
            version: '1.0.0',
            environment: process.env.NODE_ENV ?? 'development',
            timestamp: new Date().toISOString(),
        },
    });
});
app.use('/api/v1', v1_1.default);
app.use('*', (req, res) => {
    res.status(404).json({
        status: 'fail',
        message: `Route ${req.method} ${req.originalUrl} not found.`,
    });
});
app.use((err, req, res, next) => (0, error_middleware_1.errorHandler)(err, req, res, next));
exports.default = app;
//# sourceMappingURL=app.js.map