import { cloudinaryUpload } from '../config/cloudinary'; 

export const uploadBufferToCloudinary = (fileBuffer: Buffer, folderName: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinaryUpload.uploader.upload_stream(
      { folder: folderName },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};