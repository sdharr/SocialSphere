
const Post = require("../models/Post");
const mongoose = require("mongoose");
const User = require("../models/User");

const createPost = async (req, res) => {
  try {
    const { content } = req.body;

    // Validate post content
    if (typeof content !== "string" || !content.trim()) {
      return res.status(400).json({
        message: "Post content is required",
      });
    }

    if (content.trim().length > 1000) {
      return res.status(400).json({
        message: "Post cannot exceed 1000 characters",
      });
    }

    // Create a new post
    const post = await Post.create({
      author: req.user._id,
      content: content.trim(),
    });

    // Send success response
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




const getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ID
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid post ID",
      });
    }

    // Find post by ID
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




const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    // Validate post ID
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid post ID",
      });
    }

    // Find the post
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    // Check ownership
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You cannot edit this post",
      });
    }

    // Validate content
    if (typeof content !== "string" || !content.trim()) {
      return res.status(400).json({
        message: "Post content is required",
      });
    }

    if (content.trim().length > 1000) {
      return res.status(400).json({
        message: "Post cannot exceed 1000 characters",
      });
    }

    // Update post
    post.content = content.trim();
    await post.save();

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





const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate post ID
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid post ID",
      });
    }

    // Find the post
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    // Check ownership
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You cannot delete this post",
      });
    }

    // Delete post from MongoDB
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





const toggleLikePost = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate post ID
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid post ID",
      });
    }

    // Find the post
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    // Check if user already liked the post
    const userId = req.user._id.toString();

    const alreadyLiked = post.likes.some(
      (like) => like.toString() === userId
    );

    if (alreadyLiked) {
      // Unlike the post
      post.likes.pull(req.user._id);
    } else {
      // Like the post
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



const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate user ID
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    // Check whether the user exists
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Fetch user's posts
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