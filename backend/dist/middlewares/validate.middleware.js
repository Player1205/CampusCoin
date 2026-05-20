"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
        const errors = result.error.errors.reduce((acc, issue) => {
            const key = issue.path.join('.');
            acc[key] = issue.message;
            return acc;
        }, {});
        res.status(422).json({
            status: 'fail',
            message: 'Validation failed. Please check your input.',
            errors,
        });
        return;
    }
    req.body = result.data;
    next();
};
exports.validate = validate;
//# sourceMappingURL=validate.middleware.js.map