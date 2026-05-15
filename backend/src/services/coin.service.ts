import mongoose, { ClientSession } from 'mongoose';
import User from '../models/User';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TransferResult {
  fromBalance: number;
  toBalance: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Throws a typed operational error that the error middleware will handle as a 4xx.
 */
const coinError = (message: string, statusCode = 400): Error => {
  const err = new Error(message) as Error & { statusCode: number };
  err.statusCode = statusCode;
  return err;
};

// ─── Service: Lock Coins (Escrow on task posting) ─────────────────────────────

/**
 * Deducts `amount` from the poster's balance as escrow.
 * Runs inside an optional external session, or starts its own.
 */
export const lockCoinsForTask = async (
  userId: string,
  amount: number,
  session?: ClientSession
): Promise<number> => {
  const user = await User.findById(userId).session(session ?? null);

  if (!user) throw coinError('User not found.', 404);

  if (user.coinBalance < amount) {
    throw coinError(
      `Insufficient balance. You have ${user.coinBalance} coins but this task requires ${amount}.`
    );
  }

  user.coinBalance -= amount;
  await user.save({ session: session ?? undefined, validateBeforeSave: false });

  return user.coinBalance;
};

// ─── Service: Release Coins (Refund on cancellation) ─────────────────────────

/**
 * Returns the locked escrow amount back to the poster.
 */
export const releaseCoinsToUser = async (
  userId: string,
  amount: number,
  session?: ClientSession
): Promise<number> => {
  const user = await User.findById(userId).session(session ?? null);

  if (!user) throw coinError('User not found.', 404);

  user.coinBalance += amount;
  await user.save({ session: session ?? undefined, validateBeforeSave: false });

  return user.coinBalance;
};

// ─── Service: Transfer Coins (Task completion) ───────────────────────────────

/**
 * Atomically transfers `amount` coins from poster's locked escrow to doer.
 * Uses a Mongoose session for atomicity — both updates succeed or both roll back.
 */
export const transferCoins = async (
  fromUserId: string,
  toUserId: string,
  amount: number
): Promise<TransferResult> => {
  const session: ClientSession = await mongoose.startSession();

  try {
    let fromBalance = 0;
    let toBalance = 0;

    await session.withTransaction(async () => {
      // The escrow was already deducted from `fromUser` at task creation,
      // so we only need to credit the doer here.
      const toUser = await User.findById(toUserId).session(session);
      if (!toUser) throw coinError('Doer account not found.', 404);

      toUser.coinBalance += amount;
      await toUser.save({ session, validateBeforeSave: false });
      toBalance = toUser.coinBalance;

      // Optionally snapshot fromUser's current balance for the response
      const fromUser = await User.findById(fromUserId).session(session);
      if (fromUser) fromBalance = fromUser.coinBalance;
    });

    return { fromBalance, toBalance };
  } finally {
    await session.endSession();
  }
};

// ─── Service: Direct Peer Transfer (future "Send Coins" feature) ──────────────

/**
 * Direct user-to-user coin transfer. Validates balance before transferring.
 */
export const directTransfer = async (
  senderId: string,
  receiverId: string,
  amount: number
): Promise<TransferResult> => {
  if (senderId === receiverId) {
    throw coinError('You cannot send coins to yourself.');
  }

  if (!Number.isInteger(amount) || amount < 1) {
    throw coinError('Transfer amount must be a positive whole number.');
  }

  const session: ClientSession = await mongoose.startSession();

  try {
    let fromBalance = 0;
    let toBalance = 0;

    await session.withTransaction(async () => {
      const sender = await User.findById(senderId).session(session);
      const receiver = await User.findById(receiverId).session(session);

      if (!sender) throw coinError('Sender not found.', 404);
      if (!receiver) throw coinError('Receiver not found.', 404);

      if (sender.coinBalance < amount) {
        throw coinError(
          `Insufficient balance. You have ${sender.coinBalance} coins.`
        );
      }

      sender.coinBalance -= amount;
      receiver.coinBalance += amount;

      await sender.save({ session, validateBeforeSave: false });
      await receiver.save({ session, validateBeforeSave: false });

      fromBalance = sender.coinBalance;
      toBalance = receiver.coinBalance;
    });

    return { fromBalance, toBalance };
  } finally {
    await session.endSession();
  }
};
