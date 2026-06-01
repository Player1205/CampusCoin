import { useState, useEffect, useCallback } from 'react';
import * as chatApi from '../services/chat.api';
import type { Chat, ChatMessage } from '../types';
import { getSocket } from '@/lib/socket';
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

  // Load initial chat data
  useEffect(() => {
    if (!chatId) return;
    setIsLoading(true);
    chatApi.getChatById(chatId)
      .then(setChat)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [chatId]);

  // Socket.io real-time connection (replaces 5-second polling)
  useEffect(() => {
    if (!chatId) return;

    const socket = getSocket();

    // Join the chat room
    socket.emit('join_chat', chatId);

    // Listen for new messages
    const handleNewMessage = (data: { chatId: string; message: ChatMessage }) => {
      if (data.chatId === chatId) {
        setChat((prev) => {
          if (!prev) return prev;
          // Avoid duplicates (if the sender is this client, the message is already in state)
          const exists = prev.messages.some((m) => m._id === data.message._id);
          if (exists) return prev;
          return { ...prev, messages: [...prev.messages, data.message] };
        });
      }
    };

    // Listen for price updates
    const handlePriceUpdated = (data: { chatId: string; agreedPrice: number }) => {
      if (data.chatId === chatId) {
        setChat((prev) => prev ? { ...prev, agreedPrice: data.agreedPrice } : prev);
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('price_updated', handlePriceUpdated);

    return () => {
      socket.emit('leave_chat', chatId);
      socket.off('new_message', handleNewMessage);
      socket.off('price_updated', handlePriceUpdated);
    };
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
