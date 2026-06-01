import mongoose from 'mongoose';
import logger from '../utils/logger';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 3000;

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    logger.error('MONGO_URI is not defined in environment variables.');
    process.exit(1);
  }

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const conn = await mongoose.connect(uri, {
        // Mongoose 8+ has sane defaults; explicit pool sizing for production
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      logger.info('MongoDB connected', {
        host: conn.connection.host,
        attempt: `${attempt}/${MAX_RETRIES}`,
      });
      return;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error(`MongoDB connection failed (attempt ${attempt}/${MAX_RETRIES})`, {
        error: message,
      });

      if (attempt < MAX_RETRIES) {
        logger.warn(`Retrying in ${RETRY_DELAY_MS / 1000}s…`);
        await sleep(RETRY_DELAY_MS);
      } else {
        logger.error('Max retries reached. Exiting.');
        process.exit(1);
      }
    }
  }
};

// Graceful shutdown helper — call from server.ts on SIGTERM / SIGINT
export const disconnectDB = async (): Promise<void> => {
  await mongoose.connection.close();
  logger.warn('MongoDB connection closed.');
};
