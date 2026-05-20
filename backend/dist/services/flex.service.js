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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleCommentLike = exports.deleteComment = exports.addComment = exports.toggleLike = exports.deletePost = exports.updatePost = exports.createPost = exports.getPostById = exports.listPosts = void 0;
const mongoose_1 = require("mongoose");
const Post_1 = __importDefault(require("../models/Post"));
const service_helpers_1 = require("../utils/service.helpers");
const postNotFound = () => (0, service_helpers_1.makeAppError)('Post not found.', 404);
const forbidden = (msg = 'You do not have permission to perform this action.') => (0, service_helpers_1.makeAppError)(msg, 403);
const ensurePostExists = async (postId) => {
    if (!mongoose_1.Types.ObjectId.isValid(postId))
        throw (0, service_helpers_1.makeAppError)('Invalid post ID.', 400);
    const post = await Post_1.default.findOne({ _id: postId, isVisible: true });
    if (!post)
        throw postNotFound();
    return post;
};
const listPosts = async (query, university) => {
    const { page, limit, type, authorId, sortBy } = query;
    const filter = { university, isVisible: true };
    if (type)
        filter.type = type;
    if (authorId)
        filter.author = authorId;
    const sortMap = {
        newest: { isPinned: -1, createdAt: -1 },
        oldest: { createdAt: 1 },
        most_liked: { isPinned: -1 },
    };
    const skip = (page - 1) * limit;
    if (sortBy === 'most_liked') {
        const [results] = await Promise.all([
            Post_1.default.aggregate([
                { $match: filter },
                { $addFields: { likesCount: { $size: '$likes' } } },
                { $sort: { isPinned: -1, likesCount: -1 } },
                { $skip: skip },
                { $limit: limit },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'author',
                        foreignField: '_id',
                        pipeline: [{ $project: { name: 1, avatarUrl: 1, university: 1 } }],
                        as: 'author',
                    },
                },
                { $unwind: '$author' },
            ]),
        ]);
        const total = await Post_1.default.countDocuments(filter);
        return {
            data: results,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page * limit < total,
                hasPrevPage: page > 1,
            },
        };
    }
    const sort = sortMap[sortBy] ?? { isPinned: -1, createdAt: -1 };
    const [posts, total] = await Promise.all([
        Post_1.default.find(filter)
            .populate('author', 'name avatarUrl university')
            .populate('taggedUsers', 'name avatarUrl')
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean(),
        Post_1.default.countDocuments(filter),
    ]);
    return {
        data: posts,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page * limit < total,
            hasPrevPage: page > 1,
        },
    };
};
exports.listPosts = listPosts;
const getPostById = async (postId) => {
    const post = await ensurePostExists(postId);
    await post.populate([
        { path: 'author', select: 'name avatarUrl university department' },
        { path: 'taggedUsers', select: 'name avatarUrl' },
        { path: 'comments.author', select: 'name avatarUrl' },
    ]);
    return post;
};
exports.getPostById = getPostById;
const createPost = async (input, authorId, university) => {
    const post = await Post_1.default.create({
        ...input,
        author: authorId,
        university,
        taggedUsers: input.taggedUsers.map((id) => new mongoose_1.Types.ObjectId(id)),
    });
    await post.populate('author', 'name avatarUrl university');
    return post;
};
exports.createPost = createPost;
const updatePost = async (postId, input, requesterId) => {
    const post = await ensurePostExists(postId);
    if (post.author.toString() !== requesterId)
        throw forbidden();
    Object.assign(post, input);
    await post.save();
    await post.populate('author', 'name avatarUrl university');
    return post;
};
exports.updatePost = updatePost;
const deletePost = async (postId, requesterId, requesterRole) => {
    const post = await ensurePostExists(postId);
    const isAuthor = post.author.toString() === requesterId;
    const isAdmin = requesterRole === 'admin';
    if (!isAuthor && !isAdmin)
        throw forbidden();
    post.isVisible = false;
    await post.save();
};
exports.deletePost = deletePost;
const toggleLike = async (postId, userId) => {
    const post = await ensurePostExists(postId);
    const userObjectId = new mongoose_1.Types.ObjectId(userId);
    const hasLiked = post.likes.some((id) => id.equals(userObjectId));
    let coinAwarded = false;
    if (hasLiked) {
        post.likes = post.likes.filter((id) => !id.equals(userObjectId));
    }
    else {
        post.likes.push(userObjectId);
        const authorId = post.author.toString();
        if (authorId !== userId) {
            const User = (await Promise.resolve().then(() => __importStar(require('../models/User')))).default;
            const author = await User.findById(authorId);
            if (author) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const lastDate = author.dailyLikeCoinsDate
                    ? new Date(author.dailyLikeCoinsDate)
                    : null;
                const isNewDay = !lastDate || lastDate.getTime() < today.getTime();
                const currentEarned = isNewDay ? 0 : author.dailyLikeCoinsEarned;
                if (currentEarned < 10) {
                    await User.findByIdAndUpdate(authorId, {
                        $inc: { coinBalance: 1, dailyLikeCoinsEarned: isNewDay ? -author.dailyLikeCoinsEarned + 1 : 1 },
                        $set: { dailyLikeCoinsDate: new Date() },
                    });
                    coinAwarded = true;
                }
            }
        }
    }
    await post.save();
    return { liked: !hasLiked, likesCount: post.likes.length, coinAwarded };
};
exports.toggleLike = toggleLike;
const addComment = async (postId, input, authorId) => {
    const post = await ensurePostExists(postId);
    post.comments.push({
        _id: new mongoose_1.Types.ObjectId(),
        author: new mongoose_1.Types.ObjectId(authorId),
        content: input.content,
        likes: [],
        createdAt: new Date(),
    });
    await post.save();
    await post.populate('comments.author', 'name avatarUrl');
    return post;
};
exports.addComment = addComment;
const deleteComment = async (postId, commentId, requesterId, requesterRole) => {
    const post = await ensurePostExists(postId);
    if (!mongoose_1.Types.ObjectId.isValid(commentId))
        throw (0, service_helpers_1.makeAppError)('Invalid comment ID.', 400);
    const comment = post.comments.find((c) => c._id.toString() === commentId);
    if (!comment)
        throw (0, service_helpers_1.makeAppError)('Comment not found.', 404);
    const isAuthor = comment.author.toString() === requesterId;
    const isPostOwner = post.author.toString() === requesterId;
    const isAdmin = requesterRole === 'admin';
    if (!isAuthor && !isPostOwner && !isAdmin)
        throw forbidden();
    post.comments = post.comments.filter((c) => c._id.toString() !== commentId);
    await post.save();
    return post;
};
exports.deleteComment = deleteComment;
const toggleCommentLike = async (postId, commentId, userId) => {
    const post = await ensurePostExists(postId);
    if (!mongoose_1.Types.ObjectId.isValid(commentId))
        throw (0, service_helpers_1.makeAppError)('Invalid comment ID.', 400);
    const comment = post.comments.find((c) => c._id.toString() === commentId);
    if (!comment)
        throw (0, service_helpers_1.makeAppError)('Comment not found.', 404);
    const userObjectId = new mongoose_1.Types.ObjectId(userId);
    const hasLiked = comment.likes.some((id) => id.equals(userObjectId));
    if (hasLiked) {
        comment.likes = comment.likes.filter((id) => !id.equals(userObjectId));
    }
    else {
        comment.likes.push(userObjectId);
    }
    await post.save();
    return { liked: !hasLiked, likesCount: comment.likes.length };
};
exports.toggleCommentLike = toggleCommentLike;
//# sourceMappingURL=flex.service.js.map