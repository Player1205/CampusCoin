"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const flexController = __importStar(require("../../controllers/flex.controller"));
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const validate_middleware_1 = require("../../middlewares/validate.middleware");
const validateQuery_middleware_1 = require("../../middlewares/validateQuery.middleware");
const flex_schema_1 = require("../../validations/flex.schema");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.protect);
router.get('/posts', (0, validateQuery_middleware_1.validateQuery)(flex_schema_1.postQuerySchema), flexController.listPosts);
router.get('/posts/:id', flexController.getPost);
router.post('/posts', (0, validate_middleware_1.validate)(flex_schema_1.createPostSchema), flexController.createPost);
router.patch('/posts/:id', (0, validate_middleware_1.validate)(flex_schema_1.updatePostSchema), flexController.updatePost);
router.delete('/posts/:id', flexController.deletePost);
router.post('/posts/:id/like', flexController.toggleLike);
router.post('/posts/:id/comments', (0, validate_middleware_1.validate)(flex_schema_1.createCommentSchema), flexController.addComment);
router.delete('/posts/:id/comments/:commentId', flexController.deleteComment);
router.post('/posts/:id/comments/:commentId/like', flexController.toggleCommentLike);
exports.default = router;
//# sourceMappingURL=flex.routes.js.map