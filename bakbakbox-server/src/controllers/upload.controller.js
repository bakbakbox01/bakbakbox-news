import { sendSuccess } from '../utils/apiResponse.util.js';
import { asyncHandler } from '../utils/asyncHandler.util.js';

export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No image file provided',
      data: null,
    });
  }

  sendSuccess(res, 201, 'Image uploaded successfully', {
    image: {
      url: req.file.url,
      publicId: req.file.publicId,
      format: req.file.format,
      width: req.file.width,
      height: req.file.height,
      size: req.file.size,
    },
  });
});
