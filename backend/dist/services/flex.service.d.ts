import { IPost, PostDocument } from '../models/Post';
import { CreatePostInput, UpdatePostInput, CreateCommentInput, PostQueryInput } from '../validations/flex.schema';
import { CursorPaginatedResult } from '../utils/service.helpers';
export declare const listPosts: (query: PostQueryInput, university: string) => Promise<CursorPaginatedResult<IPost>>;
export declare const getPostById: (postId: string) => Promise<PostDocument>;
export declare const createPost: (input: CreatePostInput, authorId: string, university: string) => Promise<PostDocument>;
export declare const updatePost: (postId: string, input: UpdatePostInput, requesterId: string) => Promise<PostDocument>;
export declare const deletePost: (postId: string, requesterId: string, requesterRole: string) => Promise<void>;
export declare const toggleLike: (postId: string, userId: string) => Promise<{
    liked: boolean;
    likesCount: number;
    coinAwarded: boolean;
}>;
export declare const addComment: (postId: string, input: CreateCommentInput, authorId: string) => Promise<PostDocument>;
export declare const deleteComment: (postId: string, commentId: string, requesterId: string, requesterRole: string) => Promise<PostDocument>;
export declare const toggleCommentLike: (postId: string, commentId: string, userId: string) => Promise<{
    liked: boolean;
    likesCount: number;
}>;
//# sourceMappingURL=flex.service.d.ts.map