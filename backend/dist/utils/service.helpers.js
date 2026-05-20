"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePagination = exports.buildSortStage = exports.makeAppError = void 0;
const makeAppError = (message, statusCode = 500) => {
    const err = new Error(message);
    err.statusCode = statusCode;
    err.isOperational = true;
    return err;
};
exports.makeAppError = makeAppError;
const buildSortStage = (sortBy, sortMap) => {
    return sortMap[sortBy] ?? Object.values(sortMap)[0];
};
exports.buildSortStage = buildSortStage;
const parsePagination = (rawPage, rawLimit, maxLimit = 50) => {
    const page = Math.max(1, parseInt(String(rawPage ?? 1), 10) || 1);
    const limit = Math.min(maxLimit, Math.max(1, parseInt(String(rawLimit ?? 20), 10) || 20));
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};
exports.parsePagination = parsePagination;
//# sourceMappingURL=service.helpers.js.map