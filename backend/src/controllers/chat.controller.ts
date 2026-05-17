import { Response, NextFunction } from 'express';
import * as chatService from '../services/chat.service';
import { AuthenticatedRequest } from '../types';

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
    const { content, type, paymentAmount, paymentMethod } = req.body as {
      content: string; type?: 'text' | 'payment_request' | 'payment_sent';
      paymentAmount?: number; paymentMethod?: string;
    };
    if (!content?.trim()) { res.status(422).json({ status: 'fail', message: 'Message content is required.' }); return; }
    const chat = await chatService.sendMessage(req.params.chatId, req.user!._id.toString(), content, type, paymentAmount, paymentMethod);
    res.status(200).json({ status: 'success', data: { chat } });
  } catch (err) { next(err); }
};

export const setAgreedPrice = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { price } = req.body as { price: number };
    if (!price || price < 1) { res.status(422).json({ status: 'fail', message: 'Valid price required.' }); return; }
    const chat = await chatService.setAgreedPrice(req.params.chatId, req.user!._id.toString(), price);
    res.status(200).json({ status: 'success', data: { chat } });
  } catch (err) { next(err); }
};
