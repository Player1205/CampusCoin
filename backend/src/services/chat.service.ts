import Chat, { IChat, ChatDocument } from '../models/Chat';
import Task from '../models/Task';
import { makeAppError } from '../utils/service.helpers';
import { Types } from 'mongoose';

// ── Express interest → create chat with default message ──────────────────────

export const expressInterest = async (
  taskId: string,
  doerId: string
): Promise<ChatDocument> => {
  if (!Types.ObjectId.isValid(taskId)) throw makeAppError('Invalid task ID.', 400);

  const task = await Task.findById(taskId);
  if (!task) throw makeAppError('Task not found.', 404);
  if (task.status !== 'open') throw makeAppError('This task is no longer accepting interest.', 400);
  if (task.poster.toString() === doerId) throw makeAppError('You cannot express interest in your own task.', 400);

  // Check if chat already exists
  const existing = await Chat.findOne({ task: taskId, doer: doerId });
  if (existing) return existing;

  const chat = await Chat.create({
    task:    taskId,
    poster:  task.poster,
    doer:    doerId,
    messages: [{
      _id:     new Types.ObjectId(),
      sender:  doerId,
      content: "Hi, I am interested in your task! Can we discuss the details?",
      type:    'text',
      createdAt: new Date(),
    }],
  });

  await chat.populate([
    { path: 'task',   select: 'title coinReward category status' },
    { path: 'poster', select: 'name avatarUrl' },
    { path: 'doer',   select: 'name avatarUrl' },
    { path: 'messages.sender', select: 'name avatarUrl' },
  ]);

  return chat;
};

// ── List my chats ─────────────────────────────────────────────────────────────

export const listMyChats = async (userId: string): Promise<IChat[]> => {
  const chats = await Chat.find({
    $or: [{ poster: userId }, { doer: userId }],
    isActive: true,
  })
    .populate('task',   'title coinReward category status')
    .populate('poster', 'name avatarUrl')
    .populate('doer',   'name avatarUrl')
    .populate('messages.sender', 'name avatarUrl')
    .sort({ updatedAt: -1 })
    .lean();

  return chats as unknown as IChat[];
};

// ── Get single chat ────────────────────────────────────────────────────────────

export const getChatById = async (chatId: string, userId: string): Promise<ChatDocument> => {
  if (!Types.ObjectId.isValid(chatId)) throw makeAppError('Invalid chat ID.', 400);

  const chat = await Chat.findById(chatId)
    .populate('task',   'title coinReward category status description')
    .populate('poster', 'name avatarUrl university')
    .populate('doer',   'name avatarUrl university')
    .populate('messages.sender', 'name avatarUrl');

  if (!chat) throw makeAppError('Chat not found.', 404);

  const isMember = chat.poster._id.toString() === userId || chat.doer._id.toString() === userId;
  if (!isMember) throw makeAppError('Access denied.', 403);

  return chat;
};

// ── Send message ──────────────────────────────────────────────────────────────

export const sendMessage = async (
  chatId: string,
  senderId: string,
  content: string,
  type: 'text' | 'payment_request' | 'payment_sent' = 'text',
  paymentAmount?: number,
  paymentMethod?: string,
): Promise<ChatDocument> => {
  if (!Types.ObjectId.isValid(chatId)) throw makeAppError('Invalid chat ID.', 400);

  const chat = await Chat.findById(chatId);
  if (!chat) throw makeAppError('Chat not found.', 404);
  if (!chat.isActive) throw makeAppError('This chat is closed.', 400);

  const isMember = chat.poster.toString() === senderId || chat.doer.toString() === senderId;
  if (!isMember) throw makeAppError('Access denied.', 403);

  chat.messages.push({
    _id:    new Types.ObjectId(),
    sender: new Types.ObjectId(senderId),
    content: content.trim(),
    type,
    paymentAmount,
    paymentMethod,
    createdAt: new Date(),
  });

  await chat.save();
  await chat.populate('messages.sender', 'name avatarUrl');

  return chat;
};

// ── Update agreed price ────────────────────────────────────────────────────────

export const setAgreedPrice = async (
  chatId: string,
  userId: string,
  price: number
): Promise<ChatDocument> => {
  if (!Types.ObjectId.isValid(chatId)) throw makeAppError('Invalid chat ID.', 400);

  const chat = await Chat.findById(chatId);
  if (!chat) throw makeAppError('Chat not found.', 404);

  const isMember = chat.poster.toString() === userId || chat.doer.toString() === userId;
  if (!isMember) throw makeAppError('Access denied.', 403);

  // Only the task poster can set the agreed price
  if (chat.poster.toString() !== userId) {
    throw makeAppError('Only the task poster can set the price.', 403);
  }

  chat.agreedPrice = price;

  // Add a system message
  chat.messages.push({
    _id:      new Types.ObjectId(),
    sender:   new Types.ObjectId(userId),
    content:  `💰 Price agreed: ₹${price}`,
    type:     'text',
    createdAt: new Date(),
  });

  await chat.save();
  await chat.populate('messages.sender', 'name avatarUrl');
  return chat;
};
