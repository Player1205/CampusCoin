import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
export declare const listPosts: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getPost: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const createPost: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updatePost: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const deletePost: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const toggleLike: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const addComment: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteComment: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const toggleCommentLike: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=flex.controller.d.ts.map