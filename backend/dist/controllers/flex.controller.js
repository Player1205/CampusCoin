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
exports.toggleCommentLike = exports.deleteComment = exports.addComment = exports.toggleLike = exports.deletePost = exports.updatePost = exports.createPost = exports.getPost = exports.listPosts = void 0;
const flexService = __importStar(require("../services/flex.service"));
const listPosts = async (req, res, next) => {
    try {
        const result = await flexService.listPosts(req.query, req.user.university);
        res.status(200).json({
            status: 'success',
            data: result,
        });
    }
    catch (err) {
        next(err);
    }
};
exports.listPosts = listPosts;
const getPost = async (req, res, next) => {
    try {
        const post = await flexService.getPostById(req.params.id);
        res.status(200).json({
            status: 'success',
            data: { post },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getPost = getPost;
const createPost = async (req, res, next) => {
    try {
        const post = await flexService.createPost(req.body, req.user._id.toString(), req.user.university);
        res.status(201).json({
            status: 'success',
            data: { post },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.createPost = createPost;
const updatePost = async (req, res, next) => {
    try {
        const post = await flexService.updatePost(req.params.id, req.body, req.user._id.toString());
        res.status(200).json({
            status: 'success',
            data: { post },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.updatePost = updatePost;
const deletePost = async (req, res, next) => {
    try {
        await flexService.deletePost(req.params.id, req.user._id.toString(), req.user.role);
        res.status(200).json({
            status: 'success',
            data: null,
        });
    }
    catch (err) {
        next(err);
    }
};
exports.deletePost = deletePost;
const toggleLike = async (req, res, next) => {
    try {
        const result = await flexService.toggleLike(req.params.id, req.user._id.toString());
        res.status(200).json({
            status: 'success',
            data: result,
        });
    }
    catch (err) {
        next(err);
    }
};
exports.toggleLike = toggleLike;
const addComment = async (req, res, next) => {
    try {
        const post = await flexService.addComment(req.params.id, req.body, req.user._id.toString());
        res.status(201).json({
            status: 'success',
            data: { post },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.addComment = addComment;
const deleteComment = async (req, res, next) => {
    try {
        const post = await flexService.deleteComment(req.params.id, req.params.commentId, req.user._id.toString(), req.user.role);
        res.status(200).json({
            status: 'success',
            data: { post },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.deleteComment = deleteComment;
const toggleCommentLike = async (req, res, next) => {
    try {
        const result = await flexService.toggleCommentLike(req.params.id, req.params.commentId, req.user._id.toString());
        res.status(200).json({
            status: 'success',
            data: result,
        });
    }
    catch (err) {
        next(err);
    }
};
exports.toggleCommentLike = toggleCommentLike;
//# sourceMappingURL=flex.controller.js.map