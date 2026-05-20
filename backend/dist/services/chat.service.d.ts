import { IChat, ChatDocument } from '../models/Chat';
export declare const expressInterest: (taskId: string, doerId: string) => Promise<ChatDocument>;
export declare const listMyChats: (userId: string) => Promise<IChat[]>;
export declare const getChatById: (chatId: string, userId: string) => Promise<ChatDocument>;
export declare const sendMessage: (chatId: string, senderId: string, content: string, type?: "text" | "payment_request" | "payment_sent", paymentAmount?: number, paymentMethod?: string) => Promise<ChatDocument>;
export declare const setAgreedPrice: (chatId: string, userId: string, price: number) => Promise<ChatDocument>;
//# sourceMappingURL=chat.service.d.ts.map