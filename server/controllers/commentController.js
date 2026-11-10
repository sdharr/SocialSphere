
const mongoose = require("mongoose");
const Comment = require("../models/Comment");
const Post = require("../models/Post");

const createComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;

    // Validate post ID
    if (!mongoose.isValidObjectId(postId)) {
      return res.status(400).json({
        message: "Invalid post ID",
      });
    }

    // Validate comment
    if (
      typeof content !== "string" ||
      !content.trim() ||
      content.trim().length > 500
    ) {
      return res.status(400).json({
        message: "Comment must contain 1 to 500 characters",
      });
    }

    // Check if post exists
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    // Save comment
    const comment = await Comment.create({
      post: postId,
      author: req.user._id,
      content: content.trim(),
    });

    res.status(201).json({
      message: "Comment created successfully",
      comment,
    });

  } catch (error) {
    console.error("Create comment error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};



const getPostComments = async (req, res) => {
  try {
    const { postId } = req.params;

    // Validate post ID
    if (!mongoose.isValidObjectId(postId)) {
      return res.status(400).json({
        message: "Invalid post ID",
      });
    }

    // Check if post exists
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    // Fetch comments
    const comments = await Comment.find({ post: postId })
      .populate("author", "username profilePicture")
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      message: "Comments fetched successfully",
      comments,
    });

  } catch (error) {
    console.error("Fetch comments error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};


const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    // Validate comment ID
    if (!mongoose.isValidObjectId(commentId)) {
      return res.status(400).json({
        message: "Invalid comment ID",
      });
    }

    // Find comment
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    // Check ownership
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You cannot delete this comment",
      });
    }

    // Delete comment
    await comment.deleteOne();

    res.status(200).json({
      message: "Comment deleted successfully",
    });

  } catch (error) {
    console.error("Delete comment error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};



module.exports = {
  createComment,
  getPostComments,
  deleteComment,
};
