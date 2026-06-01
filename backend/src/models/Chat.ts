import mongoose, { Document, Model, Schema, Types } from 'mongoose';

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
  poster: Types.ObjectId;         // task owner
  doer: Types.ObjectId;           // interested student
  messages: IMessage[];
  isActive: boolean;              // false = blocked/closed
  agreedPrice?: number;           // negotiated final price in coins
  createdAt: Date;
  updatedAt: Date;
}

export type ChatDocument = Document & IChat;

const messageSchema = new Schema<IMessage>(
  {
    sender:        { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content:       { type: String, required: true, trim: true, maxlength: 2000 },
    type:          { type: String, enum: ['text', 'payment_request', 'payment_sent'], default: 'text' },
    paymentAmount: { type: Number, min: 0 },
    paymentMethod: { type: String },
    readAt:        { type: Date },
    createdAt:     { type: Date, default: () => new Date() },
  },
  { _id: true }
);

const chatSchema = new Schema<IChat>(
  {
    task:         { type: Schema.Types.ObjectId, ref: 'Task', required: true },
    poster:       { type: Schema.Types.ObjectId, ref: 'User', required: true },
    doer:         { type: Schema.Types.ObjectId, ref: 'User', required: true },
    messages:     { type: [messageSchema], default: [] },
    isActive:     { type: Boolean, default: true },
    agreedPrice:  { type: Number, min: 0 },
  },
  { timestamps: true, versionKey: false }
);

chatSchema.index({ poster: 1, doer: 1, task: 1 }, { unique: true });
chatSchema.index({ poster: 1 });
chatSchema.index({ doer: 1 });
chatSchema.index({ updatedAt: -1 });
chatSchema.index({ isActive: 1, updatedAt: -1 });

const Chat = mongoose.model<IChat, Model<IChat>>('Chat', chatSchema);
export default Chat;
