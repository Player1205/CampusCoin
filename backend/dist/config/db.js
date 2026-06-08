"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectDB = exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = __importDefault(require("../utils/logger"));
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 3000;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const connectDB = async () => {
    const uri = process.env.MONGO_URI;
    if (!uri) {
        logger_1.default.error('MONGO_URI is not defined in environment variables.');
        process.exit(1);
    }
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const conn = await mongoose_1.default.connect(uri, {
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            });
            logger_1.default.info('MongoDB connected', {
                host: conn.connection.host,
                attempt: `${attempt}/${MAX_RETRIES}`,
            });
            return;
        }
        catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            logger_1.default.error(`MongoDB connection failed (attempt ${attempt}/${MAX_RETRIES})`, {
                error: message,
            });
            if (attempt < MAX_RETRIES) {
                logger_1.default.warn(`Retrying in ${RETRY_DELAY_MS / 1000}s…`);
                await sleep(RETRY_DELAY_MS);
            }
            else {
                logger_1.default.error('Max retries reached. Exiting.');
                process.exit(1);
            }
        }
    }
};
exports.connectDB = connectDB;
const disconnectDB = async () => {
    await mongoose_1.default.connection.close();
    logger_1.default.warn('MongoDB connection closed.');
};
exports.disconnectDB = disconnectDB;
//# sourceMappingURL=db.js.map