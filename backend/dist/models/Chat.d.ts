import mongoose, { Document, Types } from 'mongoose';
export interface IMessage {
    _id: Types.ObjectId;
    sender: Types.ObjectId;
    content: string;
    type: 'text' | 'payment_request' | 'payment_sent';
    paymentAmount?: number;
    paymentMethod?: string;
    createdAt: Date;
    readAt?: Date;
}
export interface IChat {
    task: Types.ObjectId;
    poster: Types.ObjectId;
    doer: Types.ObjectId;
    messages: IMessage[];
    isActive: boolean;
    agreedPrice?: number;
    createdAt: Date;
    updatedAt: Date;
}
export type ChatDocument = Document & IChat;
declare const Chat: mongoose.Model<IChat, {}, {}, {}, mongoose.Document<unknown, {}, IChat, {}, {}> & IChat & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>;
export default Chat;
//# sourceMappingURL=Chat.d.ts.map