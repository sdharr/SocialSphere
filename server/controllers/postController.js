
const Post = require("../models/Post");
const mongoose = require("mongoose");
const User = require("../models/User");

// CREATE POST
const createPost = async (req, res) => {
  try {
    const content =
      typeof req.body.content === "string"
        ? req.body.content.trim()
        : "";

    const image =
      typeof req.body.image === "string"
        ? req.body.image.trim()
        : "";

    // Reject posts with no text and no image
    if (!content && !image) {
      return res.status(400).json({
        message: "Please add text or an image to your post",
      });
    }

    // Limit text length
    if (content.length > 1000) {
      return res.status(400).json({
        message: "Post cannot exceed 1000 characters",
      });
    }

    // Create the post
    const post = await Post.create({
      author: req.user._id,
      content,
      image,
    });

    await post.populate("author", "username profilePicture");

    res.status(201).json({
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    console.error("Create post error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// GET ALL POSTS
const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "username profilePicture")
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      message: "Posts fetched successfully",
      posts,
    });
  } catch (error) {
    console.error("Fetch posts error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// GET POST BY ID
const getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid post ID",
      });
    }

    const post = await Post.findById(id)
      .populate("author", "username profilePicture");

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    res.status(200).json({
      message: "Post fetched successfully",
      post,
    });
  } catch (error) {
    console.error("Get post error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// UPDATE POST
const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid post ID",
      });
    }

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    // Only the author can edit
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You cannot edit this post",
      });
    }

    if (typeof content !== "string") {
      return res.status(400).json({
        message: "Invalid post content",
      });
    }

    const trimmedContent = content.trim();

    // Image-only posts may have empty text
    if (!trimmedContent && !post.image) {
      return res.status(400).json({
        message: "A post must contain text or an image",
      });
    }

    if (trimmedContent.length > 1000) {
      return res.status(400).json({
        message: "Post cannot exceed 1000 characters",
      });
    }

    post.content = trimmedContent;
    await post.save();

    await post.populate("author", "username profilePicture");

    res.status(200).json({
      message: "Post updated successfully",
      post,
    });
  } catch (error) {
    console.error("Update post error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// DELETE POST
const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid post ID",
      });
    }

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    // Only the author can delete
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You cannot delete this post",
      });
    }

    await post.deleteOne();

    res.status(200).json({
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Delete post error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// LIKE OR UNLIKE POST
const toggleLikePost = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid post ID",
      });
    }

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const userId = req.user._id.toString();

    const alreadyLiked = post.likes.some(
      (like) => like.toString() === userId
    );

    if (alreadyLiked) {
      post.likes.pull(req.user._id);
    } else {
      post.likes.addToSet(req.user._id);
    }

    await post.save();

    res.status(200).json({
      message: alreadyLiked
        ? "Post unliked successfully"
        : "Post liked successfully",
      likesCount: post.likes.length,
      liked: !alreadyLiked,
    });
  } catch (error) {
    console.error("Like post error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// GET POSTS BY USER
const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const posts = await Post.find({ author: userId })
      .populate("author", "username profilePicture")
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      message: "User posts fetched successfully",
      posts,
    });
  } catch (error) {
    console.error("Get user posts error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  toggleLikePost,
  getUserPosts,
};
