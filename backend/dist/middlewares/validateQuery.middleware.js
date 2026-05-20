"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateQuery = void 0;
const validateQuery = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
        const errors = result.error.errors.reduce((acc, issue) => {
            const key = issue.path.join('.');
            acc[key] = issue.message;
            return acc;
        }, {});
        res.status(422).json({
            status: 'fail',
            message: 'Invalid query parameters.',
            errors,
        });
        return;
    }
    req.query = result.data;
    next();
};
exports.validateQuery = validateQuery;
//# sourceMappingURL=validateQuery.middleware.js.map