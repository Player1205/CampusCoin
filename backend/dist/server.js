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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
require("dotenv/config");
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const app_1 = __importDefault(require("./app"));
const db_1 = require("./config/db");
const logger_1 = __importDefault(require("./utils/logger"));
const PORT = parseInt(process.env.PORT ?? '5000', 10);
const ENV = process.env.NODE_ENV ?? 'development';
const allowedOrigins = (process.env.CLIENT_ORIGIN ?? 'http://localhost:5173').split(',');
const httpServer = http_1.default.createServer(app_1.default);
exports.io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
});
exports.io.use((socket, next) => {
    try {
        const token = socket.handshake.auth?.token ??
            socket.handshake.headers?.cookie
                ?.split('; ')
                .find((c) => c.startsWith('token='))
                ?.split('=')[1];
        if (!token)
            return next(new Error('Authentication required'));
        const secret = process.env.JWT_SECRET;
        if (!secret)
            return next(new Error('Server misconfigured'));
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        socket.userId = decoded.userId;
        next();
    }
    catch {
        next(new Error('Invalid token'));
    }
});
exports.io.on('connection', (socket) => {
    const userId = socket.userId;
    logger_1.default.info('Socket connected', { userId, socketId: socket.id });
    socket.join(`user:${userId}`);
    socket.on('join_chat', (chatId) => {
        socket.join(`chat:${chatId}`);
        logger_1.default.debug('User joined chat room', { userId, chatId });
    });
    socket.on('leave_chat', (chatId) => {
        socket.leave(`chat:${chatId}`);
    });
    socket.on('disconnect', (reason) => {
        logger_1.default.info('Socket disconnected', { userId, socketId: socket.id, reason });
    });
});
const boot = async () => {
    logger_1.default.info('═══════════════════════════════════════');
    logger_1.default.info('       CampusCoin API Server');
    logger_1.default.info('═══════════════════════════════════════');
    await (0, db_1.connectDB)();
    const redisUrl = process.env.REDIS_URL;
    if (redisUrl) {
        try {
            const { createClient } = await Promise.resolve().then(() => __importStar(require('redis')));
            const { createAdapter } = await Promise.resolve().then(() => __importStar(require('@socket.io/redis-adapter')));
            const pubClient = createClient({ url: redisUrl });
            const subClient = pubClient.duplicate();
            await Promise.all([pubClient.connect(), subClient.connect()]);
            exports.io.adapter(createAdapter(pubClient, subClient));
            logger_1.default.info('Redis adapter attached to Socket.io', { url: redisUrl.replace(/\/\/.*@/, '//***@') });
        }
        catch (err) {
            logger_1.default.warn('Redis connection failed — falling back to in-memory adapter', {
                error: err instanceof Error ? err.message : err,
            });
        }
    }
    else {
        logger_1.default.info('REDIS_URL not set — using in-memory Socket.io adapter (single instance only)');
    }
    httpServer.listen(PORT, () => {
        logger_1.default.info(`Server running on port ${PORT}`, { env: ENV.toUpperCase() });
        logger_1.default.info(`Health check: http://localhost:${PORT}/health`);
    });
    const shutdown = async (signal) => {
        logger_1.default.warn(`Received ${signal}. Shutting down gracefully…`);
        exports.io.close();
        httpServer.close(async () => {
            logger_1.default.warn('HTTP server closed.');
            await (0, db_1.disconnectDB)();
            logger_1.default.warn('Process terminated.');
            process.exit(0);
        });
        setTimeout(() => {
            logger_1.default.error('Forced shutdown after timeout.');
            process.exit(1);
        }, 10000);
    };
    process.on('SIGTERM', () => void shutdown('SIGTERM'));
    process.on('SIGINT', () => void shutdown('SIGINT'));
    process.on('unhandledRejection', (reason) => {
        logger_1.default.error('Unhandled Promise Rejection', { reason });
        httpServer.close(() => process.exit(1));
    });
    process.on('uncaughtException', (err) => {
        logger_1.default.error('Uncaught Exception', { message: err.message, stack: err.stack });
        process.exit(1);
    });
};
boot().catch((err) => {
    logger_1.default.error('Boot failed', { error: err });
    process.exit(1);
});
//# sourceMappingURL=server.js.map