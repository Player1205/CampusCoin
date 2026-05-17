import api, { unwrap } from '@/lib/api';
import type { Chat } from '../types';

export const expressInterest = async (taskId: string): Promise<Chat> => {
  const res = await api.post(`/chats/interest/${taskId}`);
  return unwrap<{ chat: Chat }>(res).chat;
};

export const listMyChats = async (): Promise<Chat[]> => {
  const res = await api.get('/chats');
  return unwrap<{ chats: Chat[] }>(res).chats;
};

export const getChatById = async (chatId: string): Promise<Chat> => {
  const res = await api.get(`/chats/${chatId}`);
  return unwrap<{ chat: Chat }>(res).chat;
};

export const sendMessage = async (
  chatId: string,
  content: string,
  type?: 'text' | 'payment_request' | 'payment_sent',
  paymentAmount?: number,
  paymentMethod?: string,
): Promise<Chat> => {
  const res = await api.post(`/chats/${chatId}/messages`, { content, type, paymentAmount, paymentMethod });
  return unwrap<{ chat: Chat }>(res).chat;
};

export const setAgreedPrice = async (chatId: string, price: number): Promise<Chat> => {
  const res = await api.patch(`/chats/${chatId}/price`, { price });
  return unwrap<{ chat: Chat }>(res).chat;
};
