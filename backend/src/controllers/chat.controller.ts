import { Response, NextFunction } from 'express';
import * as chatService from '../services/chat.service';
import { AuthenticatedRequest } from '../types';
import { SendMessageInput, SetAgreedPriceInput } from '../validations/chat.schema';

export const expressInterest = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const chat = await chatService.expressInterest(req.params.taskId, req.user!._id.toString());
    res.status(201).json({ status: 'success', data: { chat } });
  } catch (err) { next(err); }
};

export const listMyChats = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const chats = await chatService.listMyChats(req.user!._id.toString());
    res.status(200).json({ status: 'success', data: { chats } });
  } catch (err) { next(err); }
};

export const getChatById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const chat = await chatService.getChatById(req.params.chatId, req.user!._id.toString());
    res.status(200).json({ status: 'success', data: { chat } });
  } catch (err) { next(err); }
};

export const sendMessage = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { content, type, paymentAmount, paymentMethod } = req.body as SendMessageInput;
    const chatId = req.params.chatId;
    const chat = await chatService.sendMessage(chatId, req.user!._id.toString(), content, type, paymentAmount, paymentMethod);
    res.status(200).json({ status: 'success', data: { chat } });

    // Emit to chat room for real-time delivery
    const { io } = await import('../server');
    const lastMsg = chat.messages[chat.messages.length - 1];
    io.to(`chat:${chatId}`).emit('new_message', {
      chatId,
      message: lastMsg,
    });
  } catch (err) { next(err); }
};

export const setAgreedPrice = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { price } = req.body as SetAgreedPriceInput;
    const chatId = req.params.chatId;
    const chat = await chatService.setAgreedPrice(chatId, req.user!._id.toString(), price);
    res.status(200).json({ status: 'success', data: { chat } });

    // Emit to chat room for real-time price update
    const { io } = await import('../server');
    io.to(`chat:${chatId}`).emit('price_updated', {
      chatId,
      agreedPrice: price,
    });
  } catch (err) { next(err); }
};
