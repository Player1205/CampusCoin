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
    const chat = await chatService.sendMessage(req.params.chatId, req.user!._id.toString(), content, type, paymentAmount, paymentMethod);
    res.status(200).json({ status: 'success', data: { chat } });
  } catch (err) { next(err); }
};

export const setAgreedPrice = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { price } = req.body as SetAgreedPriceInput;
    const chat = await chatService.setAgreedPrice(req.params.chatId, req.user!._id.toString(), price);
    res.status(200).json({ status: 'success', data: { chat } });
  } catch (err) { next(err); }
};
