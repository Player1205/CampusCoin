"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectDB = exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const chalk_1 = __importDefault(require("chalk"));
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 3000;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const connectDB = async () => {
    const uri = process.env.MONGO_URI;
    if (!uri) {
        console.error(chalk_1.default.red('✖  MONGO_URI is not defined in environment variables.'));
        process.exit(1);
    }
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const conn = await mongoose_1.default.connect(uri, {
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            });
            console.log(chalk_1.default.green(`✔  MongoDB connected: ${chalk_1.default.bold(conn.connection.host)} `) +
                chalk_1.default.gray(`[attempt ${attempt}/${MAX_RETRIES}]`));
            return;
        }
        catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            console.error(chalk_1.default.red(`✖  MongoDB connection failed (attempt ${attempt}/${MAX_RETRIES}): `) +
                chalk_1.default.yellow(message));
            if (attempt < MAX_RETRIES) {
                console.log(chalk_1.default.yellow(`   Retrying in ${RETRY_DELAY_MS / 1000}s…`));
                await sleep(RETRY_DELAY_MS);
            }
            else {
                console.error(chalk_1.default.red.bold('   Max retries reached. Exiting.'));
                process.exit(1);
            }
        }
    }
};
exports.connectDB = connectDB;
const disconnectDB = async () => {
    await mongoose_1.default.connection.close();
    console.log(chalk_1.default.yellow('⚠  MongoDB connection closed.'));
};
exports.disconnectDB = disconnectDB;
//# sourceMappingURL=db.js.map