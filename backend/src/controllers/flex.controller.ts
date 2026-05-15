import { Response, NextFunction } from 'express';
import * as flexService from '../services/flex.service';
import { AuthenticatedRequest } from '../types';
import {
  CreatePostInput,
  UpdatePostInput,
  CreateCommentInput,
  PostQueryInput,
} from '../validations/flex.schema';

// ─── GET /api/v1/flex/posts ───────────────────────────────────────────────────

export const listPosts = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await flexService.listPosts(
      req.query as unknown as PostQueryInput,
      req.user!.university
    );

    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/v1/flex/posts/:id ───────────────────────────────────────────────

export const getPost = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const post = await flexService.getPostById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: { post },
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/v1/flex/posts ──────────────────────────────────────────────────

export const createPost = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const post = await flexService.createPost(
      req.body as CreatePostInput,
      req.user!._id.toString(),
      req.user!.university
    );

    res.status(201).json({
      status: 'success',
      data: { post },
    });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/v1/flex/posts/:id ─────────────────────────────────────────────

export const updatePost = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const post = await flexService.updatePost(
      req.params.id,
      req.body as UpdatePostInput,
      req.user!._id.toString()
    );

    res.status(200).json({
      status: 'success',
      data: { post },
    });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/v1/flex/posts/:id ────────────────────────────────────────────

export const deletePost = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await flexService.deletePost(
      req.params.id,
      req.user!._id.toString(),
      req.user!.role
    );

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/v1/flex/posts/:id/like ────────────────────────────────────────

export const toggleLike = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await flexService.toggleLike(req.params.id, req.user!._id.toString());

    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/v1/flex/posts/:id/comments ────────────────────────────────────

export const addComment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const post = await flexService.addComment(
      req.params.id,
      req.body as CreateCommentInput,
      req.user!._id.toString()
    );

    res.status(201).json({
      status: 'success',
      data: { post },
    });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/v1/flex/posts/:id/comments/:commentId ───────────────────────

export const deleteComment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const post = await flexService.deleteComment(
      req.params.id,
      req.params.commentId,
      req.user!._id.toString(),
      req.user!.role
    );

    res.status(200).json({
      status: 'success',
      data: { post },
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/v1/flex/posts/:id/comments/:commentId/like ────────────────────

export const toggleCommentLike = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await flexService.toggleCommentLike(
      req.params.id,
      req.params.commentId,
      req.user!._id.toString()
    );

    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
