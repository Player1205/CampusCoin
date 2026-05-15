import 'dotenv/config';
import chalk from 'chalk';
import app from './app';
import { connectDB, disconnectDB } from './config/db';

// ─── Config ───────────────────────────────────────────────────────────────────

const PORT = parseInt(process.env.PORT ?? '5000', 10);
const ENV = process.env.NODE_ENV ?? 'development';

// ─── Boot Sequence ────────────────────────────────────────────────────────────

const boot = async (): Promise<void> => {
  console.log(chalk.cyan.bold('\n╔══════════════════════════════════════╗'));
  console.log(chalk.cyan.bold('║        CampusCoin API Server         ║'));
  console.log(chalk.cyan.bold('╚══════════════════════════════════════╝\n'));

  // 1. Connect to MongoDB
  await connectDB();

  // 2. Start HTTP listener
  const server = app.listen(PORT, () => {
    console.log(
      chalk.green(`✔  Server running on port `) +
        chalk.green.bold(`${PORT}`) +
        chalk.gray(` [${ENV.toUpperCase()}]`)
    );
    console.log(chalk.gray(`   → http://localhost:${PORT}/health\n`));
  });

  // ─── Graceful Shutdown ─────────────────────────────────────────────────────

  const shutdown = async (signal: string): Promise<void> => {
    console.log(chalk.yellow(`\n⚠  Received ${signal}. Shutting down gracefully…`));

    server.close(async () => {
      console.log(chalk.yellow('   HTTP server closed.'));
      await disconnectDB();
      console.log(chalk.yellow('   Process terminated.\n'));
      process.exit(0);
    });

    // Force exit if graceful shutdown takes too long
    setTimeout(() => {
      console.error(chalk.red('   Forced shutdown after timeout.'));
      process.exit(1);
    }, 10_000);
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));

  // ─── Unhandled Rejections ──────────────────────────────────────────────────

  process.on('unhandledRejection', (reason: unknown) => {
    console.error(chalk.red('✖  Unhandled Promise Rejection:'), reason);
    server.close(() => process.exit(1));
  });

  process.on('uncaughtException', (err: Error) => {
    console.error(chalk.red('✖  Uncaught Exception:'), err.message);
    process.exit(1);
  });
};

boot().catch((err: unknown) => {
  console.error(chalk.red('✖  Boot failed:'), err);
  process.exit(1);
});
