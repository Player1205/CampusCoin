export interface ChatUser {
  _id: string;
  name: string;
  avatarUrl?: string;
  university?: string;
}

export interface ChatTask {
  _id: string;
  title: string;
  coinReward: number;
  category: string;
  status: string;
  description?: string;
}

export interface ChatMessage {
  _id: string;
  sender: ChatUser;
  content: string;
  type: 'text' | 'payment_request' | 'payment_sent';
  paymentAmount?: number;
  paymentMethod?: string;
  createdAt: string;
  readAt?: string;
}

export interface Chat {
  _id: string;
  task: ChatTask;
  poster: ChatUser;
  doer: ChatUser;
  messages: ChatMessage[];
  isActive: boolean;
  agreedPrice?: number;
  createdAt: string;
  updatedAt: string;
}

// UPI payment methods
export const UPI_METHODS = [
  { id: 'phonepe',   label: 'PhonePe',   emoji: '📱', color: '#5F259F' },
  { id: 'gpay',      label: 'Google Pay', emoji: '💳', color: '#4285F4' },
  { id: 'bhim',      label: 'BHIM UPI',   emoji: '🏛️',  color: '#00A86B' },
  { id: 'paytm',     label: 'Paytm',      emoji: '💰', color: '#002970' },
  { id: 'mobikwik',  label: 'MobiKwik',   emoji: '⚡', color: '#0066CC' },
  { id: 'amazonpay', label: 'Amazon Pay', emoji: '🛍️',  color: '#FF9900' },
] as const;

export type UPIMethodId = typeof UPI_METHODS[number]['id'];
