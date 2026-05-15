import mongoose, { Document, Model, Schema, Types } from 'mongoose';

// ─── Enums ────────────────────────────────────────────────────────────────────

export type PostType =
  | 'achievement'   // "Just got an internship!"
  | 'skill_offer'   // "I'm offering free Python help this week"
  | 'shoutout'      // Public thanks to another user
  | 'question'      // Community Q&A
  | 'general';      // Open-ended flex

// ─── Comment Sub-document ─────────────────────────────────────────────────────

export interface IComment {
  _id: Types.ObjectId;
  author: Types.ObjectId;
  content: string;
  likes: Types.ObjectId[];
  createdAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true,
      minlength: [1, 'Comment cannot be empty'],
      maxlength: [500, 'Comment cannot exceed 500 characters'],
    },
    likes: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
    createdAt: {
      type: Date,
      default: () => new Date(),
    },
  },
  { _id: true, timestamps: false }
);

// ─── Post Interface ───────────────────────────────────────────────────────────

export interface IPost {
  author: Types.ObjectId;
  type: PostType;
  content: string;
  imageUrl?: string;           // Optional media attachment
  likes: Types.ObjectId[];     // User IDs who liked the post
  comments: IComment[];
  taggedUsers: Types.ObjectId[]; // @mentions
  university: string;          // Scoped to poster's university
  isPinned: boolean;           // Admin-pinned posts
  isVisible: boolean;          // Soft-delete / moderation flag
  createdAt: Date;
  updatedAt: Date;
}

export type PostDocument = Document & IPost;
type PostModel = Model<IPost>;

// ─── Schema ───────────────────────────────────────────────────────────────────

const postSchema = new Schema<IPost, PostModel>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['achievement', 'skill_offer', 'shoutout', 'question', 'general'],
      default: 'general',
    },
    content: {
      type: String,
      required: [true, 'Post content is required'],
      trim: true,
      minlength: [3, 'Post must be at least 3 characters'],
      maxlength: [1000, 'Post cannot exceed 1000 characters'],
    },
    imageUrl: {
      type: String,
      default: '',
    },
    likes: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
    comments: {
      type: [commentSchema],
      default: [],
    },
    taggedUsers: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      default: [],
      validate: {
        validator: (v: Types.ObjectId[]) => v.length <= 10,
        message: 'You can tag a maximum of 10 users per post',
      },
    },
    university: {
      type: String,
      required: true,
      index: true,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

postSchema.index({ university: 1, createdAt: -1 });
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ type: 1, university: 1 });
postSchema.index({ isPinned: -1, createdAt: -1 });

// ─── Virtual: likesCount ──────────────────────────────────────────────────────

postSchema.virtual('likesCount').get(function (this: PostDocument) {
  return this.likes.length;
});

postSchema.virtual('commentsCount').get(function (this: PostDocument) {
  return this.comments.length;
});

// ─── Export ───────────────────────────────────────────────────────────────────

const Post = mongoose.model<IPost, PostModel>('Post', postSchema);
export default Post;
