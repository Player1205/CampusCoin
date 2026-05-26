"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setAgreedPrice = exports.sendMessage = exports.getChatById = exports.listMyChats = exports.expressInterest = void 0;
const Chat_1 = __importDefault(require("../models/Chat"));
const Task_1 = __importDefault(require("../models/Task"));
const service_helpers_1 = require("../utils/service.helpers");
const mongoose_1 = require("mongoose");
const expressInterest = async (taskId, doerId) => {
    if (!mongoose_1.Types.ObjectId.isValid(taskId))
        throw (0, service_helpers_1.makeAppError)('Invalid task ID.', 400);
    const task = await Task_1.default.findById(taskId);
    if (!task)
        throw (0, service_helpers_1.makeAppError)('Task not found.', 404);
    if (task.status !== 'open')
        throw (0, service_helpers_1.makeAppError)('This task is no longer accepting interest.', 400);
    if (task.poster.toString() === doerId)
        throw (0, service_helpers_1.makeAppError)('You cannot express interest in your own task.', 400);
    const existing = await Chat_1.default.findOne({ task: taskId, doer: doerId });
    if (existing)
        return existing;
    const chat = await Chat_1.default.create({
        task: taskId,
        poster: task.poster,
        doer: doerId,
        messages: [{
                _id: new mongoose_1.Types.ObjectId(),
                sender: doerId,
                content: "Hi, I am interested in your task! Can we discuss the details?",
                type: 'text',
                createdAt: new Date(),
            }],
    });
    await chat.populate([
        { path: 'task', select: 'title coinReward category status' },
        { path: 'poster', select: 'name avatarUrl' },
        { path: 'doer', select: 'name avatarUrl' },
        { path: 'messages.sender', select: 'name avatarUrl' },
    ]);
    return chat;
};
exports.expressInterest = expressInterest;
const listMyChats = async (userId) => {
    const chats = await Chat_1.default.find({
        $or: [{ poster: userId }, { doer: userId }],
        isActive: true,
    })
        .populate('task', 'title coinReward category status')
        .populate('poster', 'name avatarUrl')
        .populate('doer', 'name avatarUrl')
        .populate('messages.sender', 'name avatarUrl')
        .sort({ updatedAt: -1 })
        .lean();
    return chats;
};
exports.listMyChats = listMyChats;
const getChatById = async (chatId, userId) => {
    if (!mongoose_1.Types.ObjectId.isValid(chatId))
        throw (0, service_helpers_1.makeAppError)('Invalid chat ID.', 400);
    const chat = await Chat_1.default.findById(chatId)
        .populate('task', 'title coinReward category status description')
        .populate('poster', 'name avatarUrl university')
        .populate('doer', 'name avatarUrl university')
        .populate('messages.sender', 'name avatarUrl');
    if (!chat)
        throw (0, service_helpers_1.makeAppError)('Chat not found.', 404);
    const isMember = chat.poster._id.toString() === userId || chat.doer._id.toString() === userId;
    if (!isMember)
        throw (0, service_helpers_1.makeAppError)('Access denied.', 403);
    return chat;
};
exports.getChatById = getChatById;
const sendMessage = async (chatId, senderId, content, type = 'text', paymentAmount, paymentMethod) => {
    if (!mongoose_1.Types.ObjectId.isValid(chatId))
        throw (0, service_helpers_1.makeAppError)('Invalid chat ID.', 400);
    const chat = await Chat_1.default.findById(chatId);
    if (!chat)
        throw (0, service_helpers_1.makeAppError)('Chat not found.', 404);
    if (!chat.isActive)
        throw (0, service_helpers_1.makeAppError)('This chat is closed.', 400);
    const isMember = chat.poster.toString() === senderId || chat.doer.toString() === senderId;
    if (!isMember)
        throw (0, service_helpers_1.makeAppError)('Access denied.', 403);
    chat.messages.push({
        _id: new mongoose_1.Types.ObjectId(),
        sender: new mongoose_1.Types.ObjectId(senderId),
        content: content.trim(),
        type,
        paymentAmount,
        paymentMethod,
        createdAt: new Date(),
    });
    await chat.save();
    await chat.populate('messages.sender', 'name avatarUrl');
    return chat;
};
exports.sendMessage = sendMessage;
const setAgreedPrice = async (chatId, userId, price) => {
    if (!mongoose_1.Types.ObjectId.isValid(chatId))
        throw (0, service_helpers_1.makeAppError)('Invalid chat ID.', 400);
    const chat = await Chat_1.default.findById(chatId);
    if (!chat)
        throw (0, service_helpers_1.makeAppError)('Chat not found.', 404);
    const isMember = chat.poster.toString() === userId || chat.doer.toString() === userId;
    if (!isMember)
        throw (0, service_helpers_1.makeAppError)('Access denied.', 403);
    if (chat.poster.toString() !== userId) {
        throw (0, service_helpers_1.makeAppError)('Only the task poster can set the price.', 403);
    }
    chat.agreedPrice = price;
    chat.messages.push({
        _id: new mongoose_1.Types.ObjectId(),
        sender: new mongoose_1.Types.ObjectId(userId),
        content: `💰 Price agreed: ₹${price}`,
        type: 'text',
        createdAt: new Date(),
    });
    await chat.save();
    await chat.populate('messages.sender', 'name avatarUrl');
    return chat;
};
exports.setAgreedPrice = setAgreedPrice;
//# sourceMappingURL=chat.service.js.map