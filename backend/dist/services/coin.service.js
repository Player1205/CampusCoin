"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.directTransfer = exports.transferCoins = exports.releaseCoinsToUser = exports.lockCoinsForTask = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = __importDefault(require("../models/User"));
const coinError = (message, statusCode = 400) => {
    const err = new Error(message);
    err.statusCode = statusCode;
    return err;
};
const lockCoinsForTask = async (userId, amount, session) => {
    const user = await User_1.default.findOneAndUpdate({ _id: userId, coinBalance: { $gte: amount } }, { $inc: { coinBalance: -amount } }, { new: true, session: session ?? undefined });
    if (!user) {
        const exists = await User_1.default.exists({ _id: userId }).session(session ?? null);
        if (!exists)
            throw coinError('User not found.', 404);
        throw coinError('Insufficient balance for this operation.');
    }
    return user.coinBalance;
};
exports.lockCoinsForTask = lockCoinsForTask;
const releaseCoinsToUser = async (userId, amount, session) => {
    const user = await User_1.default.findOneAndUpdate({ _id: userId }, { $inc: { coinBalance: amount } }, { new: true, session: session ?? undefined });
    if (!user)
        throw coinError('User not found.', 404);
    return user.coinBalance;
};
exports.releaseCoinsToUser = releaseCoinsToUser;
const transferCoins = async (fromUserId, toUserId, amount) => {
    const session = await mongoose_1.default.startSession();
    try {
        let fromBalance = 0;
        let toBalance = 0;
        await session.withTransaction(async () => {
            const toUser = await User_1.default.findById(toUserId).session(session);
            if (!toUser)
                throw coinError('Doer account not found.', 404);
            toUser.coinBalance += amount;
            await toUser.save({ session, validateBeforeSave: false });
            toBalance = toUser.coinBalance;
            const fromUser = await User_1.default.findById(fromUserId).session(session);
            if (fromUser)
                fromBalance = fromUser.coinBalance;
        });
        return { fromBalance, toBalance };
    }
    finally {
        await session.endSession();
    }
};
exports.transferCoins = transferCoins;
const directTransfer = async (senderId, receiverId, amount) => {
    if (senderId === receiverId) {
        throw coinError('You cannot send coins to yourself.');
    }
    if (!Number.isInteger(amount) || amount < 1) {
        throw coinError('Transfer amount must be a positive whole number.');
    }
    const session = await mongoose_1.default.startSession();
    try {
        let fromBalance = 0;
        let toBalance = 0;
        await session.withTransaction(async () => {
            const sender = await User_1.default.findById(senderId).session(session);
            const receiver = await User_1.default.findById(receiverId).session(session);
            if (!sender)
                throw coinError('Sender not found.', 404);
            if (!receiver)
                throw coinError('Receiver not found.', 404);
            if (sender.coinBalance < amount) {
                throw coinError(`Insufficient balance. You have ${sender.coinBalance} coins.`);
            }
            sender.coinBalance -= amount;
            receiver.coinBalance += amount;
            await sender.save({ session, validateBeforeSave: false });
            await receiver.save({ session, validateBeforeSave: false });
            fromBalance = sender.coinBalance;
            toBalance = receiver.coinBalance;
        });
        return { fromBalance, toBalance };
    }
    finally {
        await session.endSession();
    }
};
exports.directTransfer = directTransfer;
//# sourceMappingURL=coin.service.js.map