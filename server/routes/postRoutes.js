
const express = require("express");

const {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  toggleLikePost,
   getUserPosts,
} = require("../controllers/postController");


const protect = require("../middleware/authMiddleware");


const {
  createComment,
  getPostComments,
  deleteComment,
} = require("../controllers/commentController");

const router = express.Router();

// Get all posts
router.get("/", protect, getAllPosts);

// Get posts created by a specific user
router.get("/user/:userId", protect, getUserPosts);

// Get a single post
router.get("/:id", protect, getPostById);

// Create a post
router.post("/", protect, createPost);

// Get comments for a post
router.get("/:postId/comments", protect, getPostComments);

// Update your own post
router.put("/:id", protect, updatePost);

// Delete your own post
router.delete("/:id", protect, deletePost);

// Delete your own comment
router.delete("/comments/:commentId", protect, deleteComment);

// Like or unlike a post
router.patch("/:id/like", protect, toggleLikePost);

// Add a comment to a post
router.post("/:postId/comments", protect, createComment);

module.exports = router;
