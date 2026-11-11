
const express = require("express");
const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const { uploadImage } = require("../controllers/uploadController");

const router = express.Router();

// Upload one image
router.post("/image", protect, upload.single("image"), uploadImage);

module.exports = router;
