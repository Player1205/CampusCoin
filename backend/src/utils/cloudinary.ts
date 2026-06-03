import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import logger from './logger';

// ─── Configure ────────────────────────────────────────────────────────────────

const isConfigured = (): boolean => {
  const name = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;
  return !!(name && key && secret);
};

if (isConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  logger.info('Cloudinary configured', { cloud: process.env.CLOUDINARY_CLOUD_NAME });
} else {
  logger.warn('Cloudinary not configured — image uploads will store base64 in DB (not recommended for production).');
}

// ─── Upload ───────────────────────────────────────────────────────────────────

/**
 * Upload a base64 data URI to Cloudinary.
 * Returns the secure URL, or the original string if Cloudinary is not configured.
 */
export const uploadImage = async (
  dataUri: string,
  folder = 'campuscoin/posts'
): Promise<string> => {
  // If Cloudinary isn't configured, pass through the raw value
  if (!isConfigured()) return dataUri;

  // Only process base64 data URIs
  if (!dataUri.startsWith('data:image/')) return dataUri;

  try {
    const result: UploadApiResponse = await cloudinary.uploader.upload(dataUri, {
      folder,
      resource_type: 'image',
      transformation: [
        { width: 1200, crop: 'limit' },      // cap width at 1200px
        { quality: 'auto:good' },              // auto-optimize quality
        { fetch_format: 'auto' },              // webp/avif when supported
      ],
    });
    logger.info('Image uploaded to Cloudinary', { publicId: result.public_id, bytes: result.bytes });
    return result.secure_url;
  } catch (err) {
    logger.error('Cloudinary upload failed', { error: err instanceof Error ? err.message : err });
    // Graceful fallback: return the original data URI so the post still saves
    return dataUri;
  }
};

/**
 * Delete an image from Cloudinary by its public ID.
 */
export const deleteImage = async (publicId: string): Promise<void> => {
  if (!isConfigured()) return;
  try {
    await cloudinary.uploader.destroy(publicId);
    logger.info('Image deleted from Cloudinary', { publicId });
  } catch (err) {
    logger.error('Cloudinary delete failed', { error: err instanceof Error ? err.message : err });
  }
};
