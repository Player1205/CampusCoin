"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const validate_middleware_1 = require("../../middlewares/validate.middleware");
const user_schema_1 = require("../../validations/user.schema");
const user_controller_1 = require("../../controllers/user.controller");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.protect);
router.get('/', user_controller_1.getMe);
router.route('/me')
    .get(user_controller_1.getMe)
    .patch((0, validate_middleware_1.validate)(user_schema_1.updateProfileSchema), user_controller_1.updateMe);
router.post('/me/send-verification-otp', user_controller_1.sendVerificationOtp);
router.post('/me/verify-email', (0, validate_middleware_1.validate)(user_schema_1.verifyEmailSchema), user_controller_1.verifyEmail);
exports.default = router;
//# sourceMappingURL=user.routes.js.map