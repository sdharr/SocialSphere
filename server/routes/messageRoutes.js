
const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
  sendMessage,
  getConversation,
  getConversations,
  markMessagesAsRead,
} = require("../controllers/messageController");

const router = express.Router();

// Get recent conversations
router.get("/conversations", protect, getConversations);

// Mark messages from a user as read
router.patch("/:userId/read", protect, markMessagesAsRead);

// Send a private message
router.post("/:userId", protect, sendMessage);

// Get conversation history
router.get("/:userId", protect, getConversation);

module.exports = router;
