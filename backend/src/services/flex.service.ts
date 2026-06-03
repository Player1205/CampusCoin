import { Types } from 'mongoose';
import Post, { IPost, PostDocument } from '../models/Post';
import {
  CreatePostInput,
  UpdatePostInput,
  CreateCommentInput,
  PostQueryInput,
} from '../validations/flex.schema';
import { CursorPaginatedResult, makeAppError } from '../utils/service.helpers';
import { uploadImage } from '../utils/cloudinary';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const postNotFound = () => makeAppError('Post not found.', 404);
const forbidden = (msg = 'You do not have permission to perform this action.') =>
  makeAppError(msg, 403);

const ensurePostExists = async (postId: string): Promise<PostDocument> => {
  if (!Types.ObjectId.isValid(postId)) throw makeAppError('Invalid post ID.', 400);

  const post = await Post.findOne({ _id: postId, isVisible: true });
  if (!post) throw postNotFound();
  return post;
};

// ─── Service: List Posts (Feed) ───────────────────────────────────────────────

export const listPosts = async (
  query: PostQueryInput,
  university: string
): Promise<CursorPaginatedResult<IPost>> => {
  const { page, limit, type, authorId, sortBy, cursor } = query;

  const filter: Record<string, unknown> = { university, isVisible: true };

  if (type) filter.type = type;
  if (authorId) filter.author = authorId;

  // Cursor-based pagination: use createdAt instead of skip/offset
  const useCursor = !!cursor;
  if (useCursor) {
    filter.createdAt = { $lt: new Date(cursor) };
  }

  const skip = useCursor ? 0 : (page - 1) * limit;

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    newest: { isPinned: -1, createdAt: -1 },
    oldest: { createdAt: 1 },
    most_liked: { isPinned: -1 }, // will use $size of likes — handled via aggregation
  };

  // For most_liked, use aggregation pipeline for accurate sorting by array size
  if (sortBy === 'most_liked') {
    const [results] = await Promise.all([
      Post.aggregate([
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

    const total = await Post.countDocuments(filter);

    // Calculate nextCursor from the last result's createdAt
    const nextCursor = results.length === limit && results.length > 0
      ? new Date(results[results.length - 1].createdAt).toISOString()
      : null;

    return {
      data: results as unknown as IPost[],
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: useCursor ? nextCursor !== null : page * limit < total,
        hasPrevPage: page > 1,
        nextCursor,
      },
    };
  }

  // Standard sort
  const sort = sortMap[sortBy] ?? { isPinned: -1, createdAt: -1 };

  const [posts, total] = await Promise.all([
    Post.find(filter)
      .populate('author', 'name avatarUrl university')
      .populate('taggedUsers', 'name avatarUrl')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Post.countDocuments(filter),
  ]);

  // Calculate nextCursor from the last post's createdAt
  const nextCursor = posts.length === limit && posts.length > 0
    ? new Date(posts[posts.length - 1].createdAt).toISOString()
    : null;

  return {
    data: posts as unknown as IPost[],
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: useCursor ? nextCursor !== null : page * limit < total,
      hasPrevPage: page > 1,
      nextCursor,
    },
  };
};

// ─── Service: Get Single Post ─────────────────────────────────────────────────

export const getPostById = async (postId: string): Promise<PostDocument> => {
  const post = await ensurePostExists(postId);

  await post.populate([
    { path: 'author', select: 'name avatarUrl university department' },
    { path: 'taggedUsers', select: 'name avatarUrl' },
    { path: 'comments.author', select: 'name avatarUrl' },
  ]);

  return post;
};

// ─── Service: Create Post ─────────────────────────────────────────────────────

export const createPost = async (
  input: CreatePostInput,
  authorId: string,
  university: string
): Promise<PostDocument> => {
  // Upload base64 image to Cloudinary (if configured)
  let imageUrl = input.imageUrl;
  if (imageUrl && imageUrl.startsWith('data:image/')) {
    imageUrl = await uploadImage(imageUrl, 'campuscoin/posts');
  }

  const post = await Post.create({
    ...input,
    imageUrl,
    author: authorId,
    university,
    taggedUsers: input.taggedUsers.map((id) => new Types.ObjectId(id)),
  });

  await post.populate('author', 'name avatarUrl university');
  return post;
};

// ─── Service: Update Post ─────────────────────────────────────────────────────

export const updatePost = async (
  postId: string,
  input: UpdatePostInput,
  requesterId: string
): Promise<PostDocument> => {
  const post = await ensurePostExists(postId);

  if (post.author.toString() !== requesterId) throw forbidden();

  Object.assign(post, input);
  await post.save();

  await post.populate('author', 'name avatarUrl university');
  return post;
};

// ─── Service: Delete Post ─────────────────────────────────────────────────────

export const deletePost = async (
  postId: string,
  requesterId: string,
  requesterRole: string
): Promise<void> => {
  const post = await ensurePostExists(postId);

  const isAuthor = post.author.toString() === requesterId;
  const isAdmin = requesterRole === 'admin';

  if (!isAuthor && !isAdmin) throw forbidden();

  // Soft-delete: preserve data for moderation history
  post.isVisible = false;
  await post.save();
};

// ─── Service: Toggle Like ─────────────────────────────────────────────────────

export const toggleLike = async (
  postId: string,
  userId: string
): Promise<{ liked: boolean; likesCount: number; coinAwarded: boolean }> => {
  const post = await ensurePostExists(postId);

  const userObjectId = new Types.ObjectId(userId);
  const hasLiked = post.likes.some((id) => id.equals(userObjectId));

  let coinAwarded = false;

  if (hasLiked) {
    post.likes = post.likes.filter((id) => !id.equals(userObjectId));
  } else {
    post.likes.push(userObjectId);

    // Award +1 coin to post author (not the liker) — max 10/day
    const authorId = post.author.toString();
    if (authorId !== userId) {
      const User = (await import('../models/User')).default;
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

// ─── Service: Add Comment ─────────────────────────────────────────────────────

export const addComment = async (
  postId: string,
  input: CreateCommentInput,
  authorId: string
): Promise<PostDocument> => {
  const post = await ensurePostExists(postId);

  post.comments.push({
    _id: new Types.ObjectId(),
    author: new Types.ObjectId(authorId),
    content: input.content,
    likes: [],
    createdAt: new Date(),
  });

  await post.save();
  await post.populate('comments.author', 'name avatarUrl');
  return post;
};

// ─── Service: Delete Comment ──────────────────────────────────────────────────

export const deleteComment = async (
  postId: string,
  commentId: string,
  requesterId: string,
  requesterRole: string
): Promise<PostDocument> => {
  const post = await ensurePostExists(postId);

  if (!Types.ObjectId.isValid(commentId)) throw makeAppError('Invalid comment ID.', 400);

  const comment = post.comments.find((c) => c._id.toString() === commentId);
  if (!comment) throw makeAppError('Comment not found.', 404);

  const isAuthor = comment.author.toString() === requesterId;
  const isPostOwner = post.author.toString() === requesterId;
  const isAdmin = requesterRole === 'admin';

  if (!isAuthor && !isPostOwner && !isAdmin) throw forbidden();

  post.comments = post.comments.filter((c) => c._id.toString() !== commentId);
  await post.save();
  return post;
};

// ─── Service: Toggle Comment Like ────────────────────────────────────────────

export const toggleCommentLike = async (
  postId: string,
  commentId: string,
  userId: string
): Promise<{ liked: boolean; likesCount: number }> => {
  const post = await ensurePostExists(postId);

  if (!Types.ObjectId.isValid(commentId)) throw makeAppError('Invalid comment ID.', 400);

  const comment = post.comments.find((c) => c._id.toString() === commentId);
  if (!comment) throw makeAppError('Comment not found.', 404);

  const userObjectId = new Types.ObjectId(userId);
  const hasLiked = comment.likes.some((id) => id.equals(userObjectId));

  if (hasLiked) {
    comment.likes = comment.likes.filter((id) => !id.equals(userObjectId));
  } else {
    comment.likes.push(userObjectId);
  }

  await post.save();
  return { liked: !hasLiked, likesCount: comment.likes.length };
};
