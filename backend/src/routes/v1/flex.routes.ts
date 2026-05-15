import { Router } from 'express';
import * as flexController from '../../controllers/flex.controller';
import { protect } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { validateQuery } from '../../middlewares/validateQuery.middleware';
import {
  createPostSchema,
  updatePostSchema,
  createCommentSchema,
  postQuerySchema,
} from '../../validations/flex.schema';

const router = Router();

// All Flex routes require authentication
router.use(protect);

// ─── Feed ─────────────────────────────────────────────────────────────────────

/**
 * @route   GET /api/v1/flex/posts
 * @desc    Get the Flex community feed (university-scoped, paginated)
 * @access  Protected
 */
router.get('/posts', validateQuery(postQuerySchema), flexController.listPosts);

// ─── Post CRUD ────────────────────────────────────────────────────────────────

/**
 * @route   GET /api/v1/flex/posts/:id
 * @desc    Get a single post with comments
 * @access  Protected
 */
router.get('/posts/:id', flexController.getPost);

/**
 * @route   POST /api/v1/flex/posts
 * @desc    Create a new post
 * @access  Protected
 */
router.post('/posts', validate(createPostSchema), flexController.createPost);

/**
 * @route   PATCH /api/v1/flex/posts/:id
 * @desc    Update a post (author only)
 * @access  Protected
 */
router.patch('/posts/:id', validate(updatePostSchema), flexController.updatePost);

/**
 * @route   DELETE /api/v1/flex/posts/:id
 * @desc    Soft-delete a post (author or admin)
 * @access  Protected
 */
router.delete('/posts/:id', flexController.deletePost);

// ─── Reactions ────────────────────────────────────────────────────────────────

/**
 * @route   POST /api/v1/flex/posts/:id/like
 * @desc    Toggle like on a post
 * @access  Protected
 */
router.post('/posts/:id/like', flexController.toggleLike);

// ─── Comments ─────────────────────────────────────────────────────────────────

/**
 * @route   POST /api/v1/flex/posts/:id/comments
 * @desc    Add a comment to a post
 * @access  Protected
 */
router.post('/posts/:id/comments', validate(createCommentSchema), flexController.addComment);

/**
 * @route   DELETE /api/v1/flex/posts/:id/comments/:commentId
 * @desc    Delete a comment (comment author, post author, or admin)
 * @access  Protected
 */
router.delete('/posts/:id/comments/:commentId', flexController.deleteComment);

/**
 * @route   POST /api/v1/flex/posts/:id/comments/:commentId/like
 * @desc    Toggle like on a comment
 * @access  Protected
 */
router.post('/posts/:id/comments/:commentId/like', flexController.toggleCommentLike);

export default router;
