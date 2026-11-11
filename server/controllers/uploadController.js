
const cloudinary = require("../config/cloudinary");

const uploadImage = async (req, res) => {
  try {
    // Check whether an image was provided
    if (!req.file) {
      return res.status(400).json({
        message: "Please select an image",
      });
    }

    const buffer = req.file.buffer;

    // Check actual file signatures
    const isJPEG =
      buffer.length >= 3 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff;

    const pngSignature = Buffer.from([
      137, 80, 78, 71, 13, 10, 26, 10,
    ]);

    const isPNG =
      buffer.length >= 8 &&
      buffer.subarray(0, 8).equals(pngSignature);

    const isWebP =
      buffer.length >= 12 &&
      buffer.toString("ascii", 0, 4) === "RIFF" &&
      buffer.toString("ascii", 8, 12) === "WEBP";

    const validImage =
      (isJPEG && req.file.mimetype === "image/jpeg") ||
      (isPNG && req.file.mimetype === "image/png") ||
      (isWebP && req.file.mimetype === "image/webp");

    if (!validImage) {
      return res.status(400).json({
        message: "Invalid image file",
      });
    }

    // Upload image to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "socialsphere/posts",
          resource_type: "image",
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      stream.end(buffer);
    });

    res.status(201).json({
      message: "Image uploaded successfully",
      imageUrl: result.secure_url,
      publicId: result.public_id,
    });

  } catch (error) {
    console.error("Upload error:", error.message);

    res.status(500).json({
      message: "Image upload failed",
    });
  }
};

module.exports = { uploadImage };
