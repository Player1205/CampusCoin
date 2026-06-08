"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteImage = exports.uploadImage = void 0;
const cloudinary_1 = require("cloudinary");
const logger_1 = __importDefault(require("./logger"));
const isConfigured = () => {
    const name = process.env.CLOUDINARY_CLOUD_NAME;
    const key = process.env.CLOUDINARY_API_KEY;
    const secret = process.env.CLOUDINARY_API_SECRET;
    return !!(name && key && secret);
};
if (isConfigured()) {
    cloudinary_1.v2.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
    });
    logger_1.default.info('Cloudinary configured', { cloud: process.env.CLOUDINARY_CLOUD_NAME });
}
else {
    logger_1.default.warn('Cloudinary not configured — image uploads will store base64 in DB (not recommended for production).');
}
const uploadImage = async (dataUri, folder = 'campuscoin/posts') => {
    if (!isConfigured())
        return dataUri;
    if (!dataUri.startsWith('data:image/'))
        return dataUri;
    try {
        const result = await cloudinary_1.v2.uploader.upload(dataUri, {
            folder,
            resource_type: 'image',
            transformation: [
                { width: 1200, crop: 'limit' },
                { quality: 'auto:good' },
                { fetch_format: 'auto' },
            ],
        });
        logger_1.default.info('Image uploaded to Cloudinary', { publicId: result.public_id, bytes: result.bytes });
        return result.secure_url;
    }
    catch (err) {
        logger_1.default.error('Cloudinary upload failed', { error: err instanceof Error ? err.message : err });
        return dataUri;
    }
};
exports.uploadImage = uploadImage;
const deleteImage = async (publicId) => {
    if (!isConfigured())
        return;
    try {
        await cloudinary_1.v2.uploader.destroy(publicId);
        logger_1.default.info('Image deleted from Cloudinary', { publicId });
    }
    catch (err) {
        logger_1.default.error('Cloudinary delete failed', { error: err instanceof Error ? err.message : err });
    }
};
exports.deleteImage = deleteImage;
//# sourceMappingURL=cloudinary.js.map