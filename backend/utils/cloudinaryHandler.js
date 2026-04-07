const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const validateCloudinaryConfig = () => {
  const missingKeys = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
  ].filter((key) => !process.env[key]);

  if (missingKeys.length > 0) {
    throw new Error(`Thiếu cấu hình Cloudinary: ${missingKeys.join(', ')}`);
  }
};

const uploadBufferToCloudinary = (file, options = {}) => {
  validateCloudinaryConfig();
  if (!file || !file.buffer) {
    throw new Error('Không tìm thấy file ảnh để upload');
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'wms/products',
        resource_type: 'image',
        ...options
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(file.buffer);
  });
};

const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return null;
  validateCloudinaryConfig();
  return cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
};

module.exports = {
  uploadBufferToCloudinary,
  deleteFromCloudinary
};