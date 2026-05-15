import mongoose from 'mongoose';
import chalk from 'chalk';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 3000;

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error(chalk.red('✖  MONGO_URI is not defined in environment variables.'));
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

      console.log(
        chalk.green(`✔  MongoDB connected: ${chalk.bold(conn.connection.host)} `) +
          chalk.gray(`[attempt ${attempt}/${MAX_RETRIES}]`)
      );
      return;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(
        chalk.red(`✖  MongoDB connection failed (attempt ${attempt}/${MAX_RETRIES}): `) +
          chalk.yellow(message)
      );

      if (attempt < MAX_RETRIES) {
        console.log(chalk.yellow(`   Retrying in ${RETRY_DELAY_MS / 1000}s…`));
        await sleep(RETRY_DELAY_MS);
      } else {
        console.error(chalk.red.bold('   Max retries reached. Exiting.'));
        process.exit(1);
      }
    }
  }
};

// Graceful shutdown helper — call from server.ts on SIGTERM / SIGINT
export const disconnectDB = async (): Promise<void> => {
  await mongoose.connection.close();
  console.log(chalk.yellow('⚠  MongoDB connection closed.'));
};
