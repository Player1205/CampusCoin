import 'dotenv/config';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import app from './app';
import { connectDB, disconnectDB } from './config/db';
import logger from './utils/logger';

// ─── Config ───────────────────────────────────────────────────────────────────

const PORT = parseInt(process.env.PORT ?? '5000', 10);
const ENV = process.env.NODE_ENV ?? 'development';
const allowedOrigins = (process.env.CLIENT_ORIGIN ?? 'http://localhost:5173').split(',');

// ─── HTTP + Socket.io ─────────────────────────────────────────────────────────

const httpServer = http.createServer(app);

export const io = new SocketServer(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// ─── Socket.io Auth Middleware ────────────────────────────────────────────────

io.use((socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ??
      socket.handshake.headers?.cookie
        ?.split('; ')
        .find((c: string) => c.startsWith('token='))
        ?.split('=')[1];

    if (!token) return next(new Error('Authentication required'));

    const secret = process.env.JWT_SECRET;
    if (!secret) return next(new Error('Server misconfigured'));

    const decoded = jwt.verify(token, secret) as { userId: string };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (socket as any).userId = decoded.userId;
    next();
  } catch {
    next(new Error('Invalid token'));
  }
});

// ─── Socket.io Connection Handler ─────────────────────────────────────────────

io.on('connection', (socket) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (socket as any).userId as string;
  logger.info('Socket connected', { userId, socketId: socket.id });

  // Join personal room for user-targeted events
  socket.join(`user:${userId}`);

  // Join a chat room
  socket.on('join_chat', (chatId: string) => {
    socket.join(`chat:${chatId}`);
    logger.debug('User joined chat room', { userId, chatId });
  });

  // Leave a chat room
  socket.on('leave_chat', (chatId: string) => {
    socket.leave(`chat:${chatId}`);
  });

  socket.on('disconnect', (reason) => {
    logger.info('Socket disconnected', { userId, socketId: socket.id, reason });
  });
});

// ─── Boot Sequence ────────────────────────────────────────────────────────────

const boot = async (): Promise<void> => {
  logger.info('═══════════════════════════════════════');
  logger.info('       CampusCoin API Server');
  logger.info('═══════════════════════════════════════');

  // 1. Connect to MongoDB
  await connectDB();

  // 2. Start HTTP + WebSocket listener
  httpServer.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`, { env: ENV.toUpperCase() });
    logger.info(`Health check: http://localhost:${PORT}/health`);
  });

  // ─── Graceful Shutdown ─────────────────────────────────────────────────────

  const shutdown = async (signal: string): Promise<void> => {
    logger.warn(`Received ${signal}. Shutting down gracefully…`);

    // Close Socket.io connections
    io.close();

    httpServer.close(async () => {
      logger.warn('HTTP server closed.');
      await disconnectDB();
      logger.warn('Process terminated.');
      process.exit(0);
    });

    // Force exit if graceful shutdown takes too long
    setTimeout(() => {
      logger.error('Forced shutdown after timeout.');
      process.exit(1);
    }, 10_000);
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));

  // ─── Unhandled Rejections ──────────────────────────────────────────────────

  process.on('unhandledRejection', (reason: unknown) => {
    logger.error('Unhandled Promise Rejection', { reason });
    httpServer.close(() => process.exit(1));
  });

  process.on('uncaughtException', (err: Error) => {
    logger.error('Uncaught Exception', { message: err.message, stack: err.stack });
    process.exit(1);
  });
};

boot().catch((err: unknown) => {
  logger.error('Boot failed', { error: err });
  process.exit(1);
});
