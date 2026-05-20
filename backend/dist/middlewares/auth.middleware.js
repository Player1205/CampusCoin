"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.restrictTo = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const getJwtSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret)
        throw new Error('JWT_SECRET environment variable is not set.');
    return secret;
};
const extractToken = (req) => {
    if (req.cookies?.token)
        return req.cookies.token;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer '))
        return authHeader.split(' ')[1];
    return null;
};
const protect = async (req, res, next) => {
    try {
        const token = extractToken(req);
        if (!token) {
            res.status(401).json({
                status: 'fail',
                message: 'You must be logged in to access this resource.',
            });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, getJwtSecret());
        const user = await User_1.default.findById(decoded.userId);
        if (!user || !user.isActive) {
            res.status(401).json({
                status: 'fail',
                message: 'The user associated with this session no longer exists.',
            });
            return;
        }
        req.user = user;
        next();
    }
    catch (err) {
        const isExpired = err instanceof Error && err.name === 'TokenExpiredError';
        res.status(401).json({
            status: 'fail',
            message: isExpired
                ? 'Your session has expired. Please log in again.'
                : 'Invalid authentication token.',
        });
    }
};
exports.protect = protect;
const restrictTo = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
        res.status(403).json({
            status: 'fail',
            message: 'You do not have permission to perform this action.',
        });
        return;
    }
    next();
};
exports.restrictTo = restrictTo;
//# sourceMappingURL=auth.middleware.js.map