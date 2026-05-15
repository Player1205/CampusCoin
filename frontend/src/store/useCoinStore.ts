import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import api, { unwrap } from '@/lib/api';
import { useAuthStore } from './useAuthStore';

// ─── Types ────────────────────────────────────────────────────────────────────

export type TransactionDirection = 'earned' | 'spent' | 'locked' | 'refunded';

export interface CoinTransaction {
  id: string;
  amount: number;
  direction: TransactionDirection;
  label: string;
  timestamp: string;
}

interface CoinState {
  balance: number;
  lockedBalance: number;       // Coins in escrow (posted tasks not yet complete)
  recentTransactions: CoinTransaction[];
  isAnimating: boolean;        // Triggers the balance pulse animation
  isSyncing: boolean;
}

interface CoinActions {
  syncBalance: () => void;
  setBalance: (balance: number) => void;
  optimisticDeduct: (amount: number, label: string) => void;
  optimisticCredit: (amount: number, label: string) => void;
  recordLock: (amount: number, label: string) => void;
  recordUnlock: (amount: number, label: string) => void;
  triggerAnimation: () => void;
  sendCoins: (receiverId: string, amount: number) => Promise<void>;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useCoinStore = create<CoinState & CoinActions>()(
  subscribeWithSelector((set, get) => ({
    // ── State ──────────────────────────────────────────────────────────────
    balance: 0,
    lockedBalance: 0,
    recentTransactions: [],
    isAnimating: false,
    isSyncing: false,

    // ── Actions ────────────────────────────────────────────────────────────

    /** Sync balance from the auth store user object (source of truth) */
    syncBalance: () => {
      const user = useAuthStore.getState().user;
      if (user) set({ balance: user.coinBalance });
    },

    setBalance: (balance) => {
      set({ balance });
      // Mirror to auth store so both are in sync
      useAuthStore.getState().updateUser({ coinBalance: balance });
    },

    /** Optimistically deduct (e.g. task posted) */
    optimisticDeduct: (amount, label) => {
      const prev = get().balance;
      const tx: CoinTransaction = {
        id: crypto.randomUUID(),
        amount,
        direction: 'spent',
        label,
        timestamp: new Date().toISOString(),
      };
      set((s) => ({
        balance: Math.max(0, prev - amount),
        recentTransactions: [tx, ...s.recentTransactions].slice(0, 20),
      }));
      get().triggerAnimation();
      useAuthStore.getState().updateUser({ coinBalance: Math.max(0, prev - amount) });
    },

    /** Optimistically credit (e.g. task completed) */
    optimisticCredit: (amount, label) => {
      const prev = get().balance;
      const tx: CoinTransaction = {
        id: crypto.randomUUID(),
        amount,
        direction: 'earned',
        label,
        timestamp: new Date().toISOString(),
      };
      set((s) => ({
        balance: prev + amount,
        recentTransactions: [tx, ...s.recentTransactions].slice(0, 20),
      }));
      get().triggerAnimation();
      useAuthStore.getState().updateUser({ coinBalance: prev + amount });
    },

    /** Record coins entering escrow */
    recordLock: (amount, label) => {
      const tx: CoinTransaction = {
        id: crypto.randomUUID(),
        amount,
        direction: 'locked',
        label,
        timestamp: new Date().toISOString(),
      };
      set((s) => ({
        lockedBalance: s.lockedBalance + amount,
        recentTransactions: [tx, ...s.recentTransactions].slice(0, 20),
      }));
    },

    /** Record coins released from escrow */
    recordUnlock: (amount, label) => {
      const tx: CoinTransaction = {
        id: crypto.randomUUID(),
        amount,
        direction: 'refunded',
        label,
        timestamp: new Date().toISOString(),
      };
      set((s) => ({
        lockedBalance: Math.max(0, s.lockedBalance - amount),
        recentTransactions: [tx, ...s.recentTransactions].slice(0, 20),
      }));
    },

    /** Pulse animation — called after any balance change */
    triggerAnimation: () => {
      set({ isAnimating: true });
      setTimeout(() => set({ isAnimating: false }), 1500);
    },

    /** Direct peer-to-peer coin transfer */
    sendCoins: async (receiverId, amount) => {
      set({ isSyncing: true });
      try {
        const res = await api.post('/users/send-coins', { receiverId, amount });
        const { fromBalance } = unwrap<{ fromBalance: number; toBalance: number }>(res);
        get().setBalance(fromBalance);
        get().optimisticDeduct(0, `Sent ${amount} coins`); // balance already set, just log
        get().triggerAnimation();
      } finally {
        set({ isSyncing: false });
      }
    },
  }))
);

// ─── Subscribe: keep coin balance in sync with auth user ─────────────────────

useAuthStore.subscribe(
  (state) => state.user?.coinBalance,
  (coinBalance) => {
    if (coinBalance !== undefined) {
      useCoinStore.setState({ balance: coinBalance });
    }
  }
);

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectBalance = (s: CoinState) => s.balance;
export const selectLockedBalance = (s: CoinState) => s.lockedBalance;
export const selectIsAnimating = (s: CoinState) => s.isAnimating;
export const selectRecentTransactions = (s: CoinState) => s.recentTransactions;
