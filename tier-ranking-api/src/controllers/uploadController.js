import { deleteImageFromCloudinary, uploadImageToCloudinary } from '../services/cloudinaryService.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/ApiResponse.js';

export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(422, 'Image file is required');
  const image = await uploadImageToCloudinary(req.file);
  return sendSuccess(res, 201, 'Image uploaded successfully', image);
});

export const deleteImage = asyncHandler(async (req, res) => {
  await deleteImageFromCloudinary(req.body.publicId);
  return sendSuccess(res, 200, 'Image deleted successfully');
});
