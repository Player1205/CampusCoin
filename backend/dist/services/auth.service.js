"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUser = exports.loginUser = exports.registerUser = exports.cookieOptions = exports.verifyToken = exports.signToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const JWT_SECRET = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret)
        throw new Error('JWT_SECRET environment variable is not set.');
    return secret;
};
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '7d';
const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const signToken = (userId, role) => {
    const payload = { userId, role };
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET(), { expiresIn: JWT_EXPIRES_IN });
};
exports.signToken = signToken;
const verifyToken = (token) => {
    return jsonwebtoken_1.default.verify(token, JWT_SECRET());
};
exports.verifyToken = verifyToken;
exports.cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: COOKIE_MAX_AGE_MS,
    path: '/',
};
const registerUser = async (input) => {
    const { name, email, password, university, department } = input;
    const existing = await User_1.default.findOne({ email });
    if (existing) {
        const err = new Error('An account with this email already exists.');
        err.statusCode = 409;
        throw err;
    }
    const user = await User_1.default.create({
        name,
        email,
        password,
        university,
        department: department ?? '',
        role: 'student',
    });
    const token = (0, exports.signToken)(user._id.toString(), user.role);
    return {
        user: user.toSafeObject(),
        token,
    };
};
exports.registerUser = registerUser;
const loginUser = async (input) => {
    const { email, password } = input;
    const user = await User_1.default.findOne({ email }).select('+password');
    if (!user) {
        const err = new Error('Invalid email or password.');
        err.statusCode = 401;
        throw err;
    }
    if (!user.isActive) {
        const err = new Error('Your account has been suspended. Please contact support.');
        err.statusCode = 403;
        throw err;
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        const err = new Error('Invalid email or password.');
        err.statusCode = 401;
        throw err;
    }
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
    const token = (0, exports.signToken)(user._id.toString(), user.role);
    return {
        user: user.toSafeObject(),
        token,
    };
};
exports.loginUser = loginUser;
const getCurrentUser = async (userId) => {
    const user = await User_1.default.findById(userId);
    if (!user || !user.isActive) {
        const err = new Error('User not found.');
        err.statusCode = 404;
        throw err;
    }
    return user.toSafeObject();
};
exports.getCurrentUser = getCurrentUser;
//# sourceMappingURL=auth.service.js.map