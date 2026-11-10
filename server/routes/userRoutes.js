
const express = require("express");

const {
  toggleFollowUser,
  getUserProfile,
  updateUserProfile,
  searchUsers,
} = require("../controllers/userController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Search users by username
router.get("/search", protect, searchUsers);

// Update logged-in user's profile
router.put("/me", protect, updateUserProfile);

// Get a user's public profile
router.get("/:id", protect, getUserProfile);

// Follow or unfollow a user
router.patch("/:id/follow", protect, toggleFollowUser);

module.exports = router;
