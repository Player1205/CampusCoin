"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const chalk_1 = __importDefault(require("chalk"));
const mongoose_1 = require("mongoose");
const handleMongooseCastError = (err) => ({
    statusCode: 400,
    message: `Invalid value "${String(err.value)}" for field "${err.path}".`,
});
const handleMongooseValidationError = (err) => ({
    statusCode: 422,
    message: 'Validation failed.',
    errors: Object.values(err.errors).reduce((acc, e) => {
        acc[e.path] = e.message;
        return acc;
    }, {}),
});
const handleDuplicateKeyError = (err) => {
    const field = Object.keys(err.keyValue ?? {})[0] ?? 'field';
    return {
        statusCode: 409,
        message: `A record with this ${field} already exists.`,
    };
};
const errorHandler = (err, _req, res, _next) => {
    console.error(chalk_1.default.red('✖  Error:'), chalk_1.default.yellow(err.message));
    if (process.env.NODE_ENV === 'development') {
        console.error(chalk_1.default.gray(err.stack ?? ''));
    }
    let statusCode = err.statusCode ?? 500;
    let message = err.message ?? 'An unexpected error occurred.';
    let errors;
    if (err instanceof mongoose_1.Error.CastError) {
        const transformed = handleMongooseCastError(err);
        statusCode = transformed.statusCode;
        message = transformed.message;
    }
    else if (err instanceof mongoose_1.Error.ValidationError) {
        const transformed = handleMongooseValidationError(err);
        statusCode = transformed.statusCode;
        message = transformed.message;
        errors = transformed.errors;
    }
    else if (err.code === 11000) {
        const transformed = handleDuplicateKeyError(err);
        statusCode = transformed.statusCode;
        message = transformed.message;
    }
    else if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token. Please log in again.';
    }
    else if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Your session has expired. Please log in again.';
    }
    if (statusCode < 500) {
        res.status(statusCode).json({
            status: 'fail',
            message,
            ...(errors && { errors }),
        });
        return;
    }
    res.status(statusCode).json({
        status: 'error',
        message: process.env.NODE_ENV === 'production'
            ? 'An unexpected error occurred. Please try again later.'
            : message,
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=error.middleware.js.map