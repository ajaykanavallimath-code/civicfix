const cloudinary = require('cloudinary').v2;

const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
  console.log(`[Cloudinary] Cloudinary configured successfully for cloud: ${process.env.CLOUDINARY_CLOUD_NAME}`);
} else {
  console.log('[Cloudinary] Cloudinary environment variables not set. Using inline media storage fallback.');
}

/**
 * Upload a file buffer to Cloudinary using upload_stream
 * @param {Buffer} buffer - File buffer from multer memoryStorage
 * @param {Object} options - Upload options (resource_type, folder, mimetype)
 * @returns {Promise<{ secure_url: string, public_id: string }>}
 */
function uploadToCloudinary(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    if (!isCloudinaryConfigured) {
      // Safe fallback when Cloudinary credentials are not configured yet
      const mime = options.mimetype || 'image/jpeg';
      const base64Data = buffer.toString('base64');
      const dataUri = `data:${mime};base64,${base64Data}`;
      return resolve({
        secure_url: dataUri,
        public_id: `local-${Date.now()}`
      });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || 'civicfix/reports',
        resource_type: options.resource_type || 'auto',
        ...options
      },
      (error, result) => {
        if (error) {
          console.error('[Cloudinary] upload_stream error:', error.message || error);
          return reject(error);
        }
        resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
}

module.exports = {
  cloudinary,
  uploadToCloudinary,
  isCloudinaryConfigured
};
