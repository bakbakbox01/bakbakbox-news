import multer from 'multer';
import path from 'path';
import { createCloudinaryStorage } from '../config/cloudinary.js';
import { isMockMode } from '../config/dataMode.js';
import { ApiError } from '../utils/apiError.util.js';

export const ALLOWED_IMAGE_MIMETYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
];

export const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

const imageFileFilter = (_req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();

  if (
    !ALLOWED_IMAGE_EXTENSIONS.includes(extension) ||
    !ALLOWED_IMAGE_MIMETYPES.includes(file.mimetype)
  ) {
    return cb(
      new ApiError(400, 'Only JPG, JPEG, PNG, and WEBP images are allowed')
    );
  }

  cb(null, true);
};

let uploadInstance = null;

const createMockStorage = () => ({
  _handleFile(_req, file, cb) {
    const chunks = [];

    file.stream.on('data', (chunk) => chunks.push(chunk));
    file.stream.on('end', () => {
      const seed = Date.now();
      cb(null, {
        fieldname: file.fieldname,
        originalname: file.originalname,
        encoding: file.encoding,
        mimetype: file.mimetype,
        size: Buffer.concat(chunks).length,
        url: `https://picsum.photos/seed/${seed}/800/450`,
        publicId: `mock/${seed}`,
        format: 'jpg',
        width: 800,
        height: 450,
      });
    });
    file.stream.on('error', cb);
  },
  _removeFile(_req, _file, cb) {
    cb(null);
  },
});

const getUpload = () => {
  if (!uploadInstance) {
    uploadInstance = multer({
      storage: isMockMode() ? createMockStorage() : createCloudinaryStorage(),
      limits: {
        fileSize: MAX_IMAGE_SIZE_BYTES,
        files: 10,
      },
      fileFilter: imageFileFilter,
    });
  }

  return uploadInstance;
};

/**
 * Upload a single image field to Cloudinary.
 * @param {string} fieldName - Form field name (default: "image")
 */
export const uploadSingle = (fieldName = 'image') =>
  (req, res, next) => getUpload().single(fieldName)(req, res, next);

/**
 * Upload multiple images to Cloudinary.
 * @param {string} fieldName - Form field name (default: "images")
 * @param {number} maxCount - Maximum number of files (default: 5)
 */
export const uploadMultiple = (fieldName = 'images', maxCount = 5) =>
  (req, res, next) => getUpload().array(fieldName, maxCount)(req, res, next);

/**
 * Express error handler for Multer and Cloudinary upload failures.
 * Place immediately after upload middleware in the route chain.
 */
export const handleUploadError = (err, _req, _res, next) => {
  if (!err) {
    return next();
  }

  if (err instanceof ApiError) {
    return next(err);
  }

  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        return next(new ApiError(400, 'Image size must not exceed 5MB'));
      case 'LIMIT_FILE_COUNT':
        return next(new ApiError(400, 'Too many files uploaded'));
      case 'LIMIT_UNEXPECTED_FILE':
        return next(
          new ApiError(400, `Unexpected upload field: ${err.field}`)
        );
      case 'LIMIT_PART_COUNT':
        return next(new ApiError(400, 'Upload contains too many parts'));
      default:
        return next(new ApiError(400, err.message));
    }
  }

  if (err.http_code || err.name === 'CloudinaryError') {
    return next(
      new ApiError(502, 'Image upload to cloud storage failed. Please try again')
    );
  }

  next(err);
};

export default getUpload;
