"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.setAgreedPrice = exports.sendMessage = exports.getChatById = exports.listMyChats = exports.expressInterest = void 0;
const chatService = __importStar(require("../services/chat.service"));
const expressInterest = async (req, res, next) => {
    try {
        const chat = await chatService.expressInterest(req.params.taskId, req.user._id.toString());
        res.status(201).json({ status: 'success', data: { chat } });
    }
    catch (err) {
        next(err);
    }
};
exports.expressInterest = expressInterest;
const listMyChats = async (req, res, next) => {
    try {
        const chats = await chatService.listMyChats(req.user._id.toString());
        res.status(200).json({ status: 'success', data: { chats } });
    }
    catch (err) {
        next(err);
    }
};
exports.listMyChats = listMyChats;
const getChatById = async (req, res, next) => {
    try {
        const chat = await chatService.getChatById(req.params.chatId, req.user._id.toString());
        res.status(200).json({ status: 'success', data: { chat } });
    }
    catch (err) {
        next(err);
    }
};
exports.getChatById = getChatById;
const sendMessage = async (req, res, next) => {
    try {
        const { content, type, paymentAmount, paymentMethod } = req.body;
        const chatId = req.params.chatId;
        const chat = await chatService.sendMessage(chatId, req.user._id.toString(), content, type, paymentAmount, paymentMethod);
        res.status(200).json({ status: 'success', data: { chat } });
        const { io } = await Promise.resolve().then(() => __importStar(require('../server')));
        const lastMsg = chat.messages[chat.messages.length - 1];
        io.to(`chat:${chatId}`).emit('new_message', {
            chatId,
            message: lastMsg,
        });
    }
    catch (err) {
        next(err);
    }
};
exports.sendMessage = sendMessage;
const setAgreedPrice = async (req, res, next) => {
    try {
        const { price } = req.body;
        const chatId = req.params.chatId;
        const chat = await chatService.setAgreedPrice(chatId, req.user._id.toString(), price);
        res.status(200).json({ status: 'success', data: { chat } });
        const { io } = await Promise.resolve().then(() => __importStar(require('../server')));
        io.to(`chat:${chatId}`).emit('price_updated', {
            chatId,
            agreedPrice: price,
        });
    }
    catch (err) {
        next(err);
    }
};
exports.setAgreedPrice = setAgreedPrice;
//# sourceMappingURL=chat.controller.js.map