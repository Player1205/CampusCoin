"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const chalk_1 = __importDefault(require("chalk"));
const app_1 = __importDefault(require("./app"));
const db_1 = require("./config/db");
const PORT = parseInt(process.env.PORT ?? '5000', 10);
const ENV = process.env.NODE_ENV ?? 'development';
const boot = async () => {
    console.log(chalk_1.default.cyan.bold('\n╔══════════════════════════════════════╗'));
    console.log(chalk_1.default.cyan.bold('║        CampusCoin API Server         ║'));
    console.log(chalk_1.default.cyan.bold('╚══════════════════════════════════════╝\n'));
    await (0, db_1.connectDB)();
    const server = app_1.default.listen(PORT, () => {
        console.log(chalk_1.default.green(`✔  Server running on port `) +
            chalk_1.default.green.bold(`${PORT}`) +
            chalk_1.default.gray(` [${ENV.toUpperCase()}]`));
        console.log(chalk_1.default.gray(`   → http://localhost:${PORT}/health\n`));
    });
    const shutdown = async (signal) => {
        console.log(chalk_1.default.yellow(`\n⚠  Received ${signal}. Shutting down gracefully…`));
        server.close(async () => {
            console.log(chalk_1.default.yellow('   HTTP server closed.'));
            await (0, db_1.disconnectDB)();
            console.log(chalk_1.default.yellow('   Process terminated.\n'));
            process.exit(0);
        });
        setTimeout(() => {
            console.error(chalk_1.default.red('   Forced shutdown after timeout.'));
            process.exit(1);
        }, 10000);
    };
    process.on('SIGTERM', () => void shutdown('SIGTERM'));
    process.on('SIGINT', () => void shutdown('SIGINT'));
    process.on('unhandledRejection', (reason) => {
        console.error(chalk_1.default.red('✖  Unhandled Promise Rejection:'), reason);
        server.close(() => process.exit(1));
    });
    process.on('uncaughtException', (err) => {
        console.error(chalk_1.default.red('✖  Uncaught Exception:'), err.message);
        process.exit(1);
    });
};
boot().catch((err) => {
    console.error(chalk_1.default.red('✖  Boot failed:'), err);
    process.exit(1);
});
//# sourceMappingURL=server.js.map