const multer = require('multer');

// Switch to memory storage so buffers can be streamed to Cloudinary or used directly
const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  const allowedMimes = [
    'image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif',
    'video/mp4', 'video/webm', 'video/quicktime',
    'audio/webm', 'audio/wav', 'audio/mpeg', 'audio/mp3', 'audio/ogg', 'audio/m4a', 'audio/x-m4a'
  ];

  if (
    allowedMimes.includes(file.mimetype) ||
    file.mimetype.startsWith('image/') ||
    file.mimetype.startsWith('audio/') ||
    file.mimetype.startsWith('video/')
  ) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}. Please upload a photo, video, or audio recording.`));
  }
}

const upload = multer({
  storage,
  limits: {
    fileSize: 30 * 1024 * 1024 // 30 MB
  },
  fileFilter
});

module.exports = upload;
