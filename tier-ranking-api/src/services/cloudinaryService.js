import { Readable } from 'stream';
import { cloudinary } from '../config/cloudinary.js';
import { env } from '../config/environment.js';
import { ApiError } from '../utils/ApiError.js';

const uploadStream = (file) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: env.cloudinary.folder,
        resource_type: 'image',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }]
      },
      (error, result) => {
        if (error) return reject(error);
        return resolve(result);
      }
    );

    Readable.from(file.buffer).pipe(stream);
  });

export const uploadImageToCloudinary = async (file) => {
  if (!env.cloudinary.cloudName || !env.cloudinary.apiKey || !env.cloudinary.apiSecret) {
    throw new ApiError(500, 'Cloudinary environment variables are not configured');
  }

  const result = await uploadStream(file);

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height
  };
};

export const deleteImageFromCloudinary = async (publicId) => {
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
};
