import { useState, useEffect, useCallback } from 'react';
import * as chatApi from '../services/chat.api';
import type { Chat } from '../types';
import toast from 'react-hot-toast';

export function useChatList() {
  const [chats,     setChats]     = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await chatApi.listMyChats();
      setChats(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chats.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const addChat = (chat: Chat) => setChats((prev) => [chat, ...prev.filter((c) => c._id !== chat._id)]);

  return { chats, isLoading, error, reload: load, addChat };
}

export function useChatRoom(chatId: string) {
  const [chat,      setChat]      = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!chatId) return;
    setIsLoading(true);
    chatApi.getChatById(chatId)
      .then(setChat)
      .catch(() => {})
      .finally(() => setIsLoading(false));

    // Poll every 5s for new messages (simple polling — no WS needed for MVP)
    const interval = setInterval(() => {
      chatApi.getChatById(chatId).then(setChat).catch(() => {});
    }, 5000);

    return () => clearInterval(interval);
  }, [chatId]);

  const sendMessage = useCallback(async (
    content: string,
    type?: 'text' | 'payment_request' | 'payment_sent',
    paymentAmount?: number,
    paymentMethod?: string,
  ) => {
    if (!chat) return;
    setIsSending(true);
    try {
      const updated = await chatApi.sendMessage(chat._id, content, type, paymentAmount, paymentMethod);
      setChat(updated);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send message.');
    } finally {
      setIsSending(false);
    }
  }, [chat]);

  const setAgreedPrice = useCallback(async (price: number) => {
    if (!chat) return;
    try {
      const updated = await chatApi.setAgreedPrice(chat._id, price);
      setChat(updated);
      toast.success(`Agreed price set: ${price} coins`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed.');
    }
  }, [chat]);

  return { chat, isLoading, isSending, sendMessage, setAgreedPrice, setChat };
}
