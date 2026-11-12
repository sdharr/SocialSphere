
const cloudinary = require("../config/cloudinary");

// Check the uploaded file's basic image signature
const isValidImage = (file) => {
  const buffer = file.buffer;

  const isJPEG =
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff;

  const isPNG =
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
    );

  const isWebP =
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP";

  return (
    (file.mimetype === "image/jpeg" && isJPEG) ||
    (file.mimetype === "image/png" && isPNG) ||
    (file.mimetype === "image/webp" && isWebP)
  );
};

// Upload or change profile picture
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Please select a profile picture",
      });
    }

    if (!isValidImage(req.file)) {
      return res.status(400).json({
        message: "Invalid image file",
      });
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "socialsphere/avatars",
          resource_type: "image",
          transformation: [
            {
              width: 400,
              height: 400,
              crop: "fill",
              gravity: "auto",
            },
          ],
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      stream.end(req.file.buffer);
    });

    // Save image URL to the logged-in user's profile
    req.user.profilePicture = result.secure_url;
    await req.user.save();

    res.status(200).json({
      message: "Profile picture updated successfully",
      profilePicture: req.user.profilePicture,
    });
  } catch (error) {
    console.error("Avatar upload error:", error.message);

    res.status(500).json({
      message: "Failed to upload profile picture",
    });
  }
};

module.exports = { uploadAvatar };
