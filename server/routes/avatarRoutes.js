
const express = require("express");

const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const { uploadAvatar } = require("../controllers/avatarController");

const router = express.Router();

// Upload or change the logged-in user's profile picture
router.post(
  "/me/avatar",
  protect,
  upload.single("avatar"),
  uploadAvatar
);

module.exports = router;
