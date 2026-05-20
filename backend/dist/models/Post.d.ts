import { Document, Model, Types } from 'mongoose';
export type PostType = 'achievement' | 'skill_offer' | 'shoutout' | 'question' | 'general';
export interface IComment {
    _id: Types.ObjectId;
    author: Types.ObjectId;
    content: string;
    likes: Types.ObjectId[];
    createdAt: Date;
}
export interface IPost {
    author: Types.ObjectId;
    type: PostType;
    content: string;
    imageUrl?: string;
    likes: Types.ObjectId[];
    comments: IComment[];
    taggedUsers: Types.ObjectId[];
    university: string;
    isPinned: boolean;
    isVisible: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export type PostDocument = Document & IPost;
type PostModel = Model<IPost>;
declare const Post: PostModel;
export default Post;
//# sourceMappingURL=Post.d.ts.map