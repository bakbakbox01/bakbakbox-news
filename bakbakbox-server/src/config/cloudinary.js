import { v2 as cloudinary } from 'cloudinary';

let isConfigured = false;

const getRequiredEnv = (key) => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`${key} is not defined in environment variables`);
  }

  return value;
};

/**
 * Configures and returns the Cloudinary SDK instance.
 * Safe to call multiple times — only configures once.
 */
export const configureCloudinary = () => {
  if (isConfigured) {
    return cloudinary;
  }

  cloudinary.config({
    cloud_name: getRequiredEnv('CLOUDINARY_CLOUD_NAME'),
    api_key: getRequiredEnv('CLOUDINARY_API_KEY'),
    api_secret: getRequiredEnv('CLOUDINARY_API_SECRET'),
    secure: true,
  });

  isConfigured = true;
  console.log('Cloudinary configured');

  return cloudinary;
};

/**
 * Custom Multer storage engine that streams uploads directly to Cloudinary.
 * Compatible with Cloudinary SDK v2 and ESM.
 */
export const createCloudinaryStorage = () => {
  const instance = configureCloudinary();

  return {
    _handleFile(req, file, cb) {
      const folder = process.env.CLOUDINARY_FOLDER || 'bakbakbox-news';
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

      const uploadStream = instance.uploader.upload_stream(
        {
          folder,
          public_id: uniqueSuffix,
          resource_type: 'image',
          overwrite: false,
        },
        (error, result) => {
          if (error) {
            return cb(error);
          }

          cb(null, {
            fieldname: file.fieldname,
            originalname: file.originalname,
            encoding: file.encoding,
            mimetype: file.mimetype,
            size: result.bytes,
            filename: result.public_id,
            path: result.secure_url,
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            width: result.width,
            height: result.height,
            cloudinary: result,
          });
        }
      );

      file.stream.pipe(uploadStream);
    },

    _removeFile(_req, file, cb) {
      const publicId = file.publicId || file.filename;

      if (!publicId) {
        return cb(null);
      }

      instance.uploader
        .destroy(publicId, { resource_type: 'image' })
        .then(() => cb(null))
        .catch(() => cb(null));
    },
  };
};

/**
 * Deletes an image from Cloudinary by public ID.
 * @param {string} publicId
 */
export const deleteCloudinaryImage = async (publicId) => {
  const instance = configureCloudinary();
  return instance.uploader.destroy(publicId, { resource_type: 'image' });
};

export default cloudinary;
