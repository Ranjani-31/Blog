const cloudinary = require("../config/cloudinary");
const { Readable } = require("node:stream");

const uploadToCloudinary = (file) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "techblog/covers",
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error("Cloudinary returned no image"));
        resolve(result);
      }
    );

    Readable.from(file.buffer).pipe(stream);
  });

const deleteFromCloudinary = (publicId) =>
  cloudinary.uploader.destroy(publicId, { resource_type: "image" });

module.exports = { uploadToCloudinary, deleteFromCloudinary };