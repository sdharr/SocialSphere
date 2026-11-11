
const mongoose = require("mongoose");
const User = require("../models/User");

const toggleFollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user._id;

    // Validate user ID
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    // Prevent following yourself
    if (id === currentUserId.toString()) {
      return res.status(400).json({
        message: "You cannot follow yourself",
      });
    }

    // Find both users
    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(id);

    if (!currentUser || !targetUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Check existing follow
    const isFollowing = currentUser.following.some(
      (userId) => userId.toString() === id
    );

    if (isFollowing) {
      // Unfollow
      currentUser.following.pull(id);
      targetUser.followers.pull(currentUserId);
    } else {
      // Follow
      currentUser.following.addToSet(id);
      targetUser.followers.addToSet(currentUserId);
    }

    await currentUser.save();
    await targetUser.save();

    res.status(200).json({
      message: isFollowing
        ? "User unfollowed successfully"
        : "User followed successfully",
      following: !isFollowing,
      followersCount: targetUser.followers.length,
    });

  } catch (error) {
    console.error("Follow error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};



const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate user ID
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    // Find user without sensitive information
    const user = await User.findById(id).select(
      "username bio profilePicture followers following createdAt"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "Profile fetched successfully",
      user: {
        id: user._id,
        username: user.username,
        bio: user.bio,
        profilePicture: user.profilePicture,
        followersCount: user.followers.length,
        followingCount: user.following.length,
        isFollowing: user.followers.some(
  (followerId) =>
    followerId.toString() === req.user._id.toString()
),
        joinedAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};



const updateUserProfile = async (req, res) => {
  try {
    const { username, bio } = req.body || {};

    if (username === undefined && bio === undefined) {
      return res.status(400).json({
        message: "Provide username or bio to update",
      });
    }

    // Find logged-in user
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Update username
    if (username !== undefined) {
      if (
        typeof username !== "string" ||
        !/^[a-zA-Z0-9_]{3,30}$/.test(username)
      ) {
        return res.status(400).json({
          message: "Username must be 3-30 letters, numbers or underscores",
        });
      }

      user.username = username;
    }

    // Update bio
    if (bio !== undefined) {
      if (typeof bio !== "string" || bio.length > 160) {
        return res.status(400).json({
          message: "Bio cannot exceed 160 characters",
        });
      }

      user.bio = bio.trim();
    }

    // Save changes
    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        username: user.username,
        bio: user.bio,
        profilePicture: user.profilePicture,
      },
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Username already taken",
      });
    }

    console.error("Update profile error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};




const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;

    // Validate search input
    if (
      typeof q !== "string" ||
      q.trim().length < 2 ||
      q.trim().length > 30
    ) {
      return res.status(400).json({
        message: "Search must contain 2 to 30 characters",
      });
    }

    // Escape special regex characters
    const searchTerm = q.trim().replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    // Search usernames
    const users = await User.find({
      username: {
        $regex: searchTerm,
        $options: "i",
      },
    })
      .select("username bio profilePicture")
      .limit(20);

    res.status(200).json({
      message: "Users fetched successfully",
      users,
    });

  } catch (error) {
    console.error("Search users error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};



module.exports = {
  toggleFollowUser,
  getUserProfile,
  updateUserProfile,
  searchUsers,
};
