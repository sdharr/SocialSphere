
const mongoose = require("mongoose");
const Message = require("../models/Message");
const User = require("../models/User");

// SEND A PRIVATE MESSAGE
const sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { userId } = req.params;
    const { content } = req.body;

    // Validate receiver ID
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    // Prevent messaging yourself
    if (senderId.toString() === userId) {
      return res.status(400).json({
        message: "You cannot message yourself",
      });
    }

    // Check receiver exists
    const receiver = await User.findById(userId);

    if (!receiver) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Validate message content
    if (typeof content !== "string" || !content.trim()) {
      return res.status(400).json({
        message: "Message cannot be empty",
      });
    }

    if (content.trim().length > 2000) {
      return res.status(400).json({
        message: "Message cannot exceed 2000 characters",
      });
    }

    // Save message to MongoDB
    const message = await Message.create({
      sender: senderId,
      receiver: userId,
      content: content.trim(),
    });

    await message.populate(
      "sender receiver",
      "username profilePicture"
    );

// Get our Socket.IO instance
const io = req.app.get("io");

// Notify the intended recipient in real time
io.to(`user:${userId}`).emit("message:new", message);


    res.status(201).json({
      message: "Message sent successfully",
      data: message,
    });
  } catch (error) {
    console.error("Send message error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// GET PRIVATE CONVERSATION
const getConversation = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { userId } = req.params;

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    // Get messages exchanged between these two users only
    const messages = await Message.find({
      $or: [
        {
          sender: currentUserId,
          receiver: userId,
        },
        {
          sender: userId,
          receiver: currentUserId,
        },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("sender receiver", "username profilePicture");

    // Display oldest first in the chat
    messages.reverse();

    res.status(200).json({
      messages,
    });
  } catch (error) {
    console.error("Get conversation error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};



const getConversations = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const conversations = await Message.aggregate([
      // Find messages involving the logged-in user
      {
        $match: {
          $or: [
            { sender: currentUserId },
            { receiver: currentUserId },
          ],
        },
      },

      // Put newest messages first
      { $sort: { createdAt: -1, _id: -1 } },

      // Identify the other person in each conversation
      {
        $addFields: {
          otherUserId: {
            $cond: [
              { $eq: ["$sender", currentUserId] },
              "$receiver",
              "$sender",
            ],
          },
        },
      },

      // Keep the latest message for each person
     
{
  $group: {
    _id: "$otherUserId",

    lastMessage: {
      $first: {
        content: "$content",
        sender: "$sender",
        createdAt: "$createdAt",
      },
    },

    // Count unread messages received by this user
    unreadCount: {
      $sum: {
        $cond: [
          {
            $and: [
              { $eq: ["$receiver", currentUserId] },
              { $eq: ["$isRead", false] },
            ],
          },
          1,
          0,
        ],
      },
    },
  },
},


      { $sort: { "lastMessage.createdAt": -1 } },
      { $limit: 50 },

      // Get the other user's profile information
      {
        $lookup: {
          from: User.collection.name,
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },

      { $unwind: "$user" },

      {
        $project: {
          _id: 0,
          user: {
            _id: "$user._id",
            username: "$user.username",
            profilePicture: "$user.profilePicture",
          },
          lastMessage: 1,
        },
      },
    ]);

    res.status(200).json({ conversations });
  } catch (error) {
    console.error("Get conversations error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};


const markMessagesAsRead = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { userId } = req.params;

    // Validate the other user's ID
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    // Mark only messages received by the logged-in user
    const result = await Message.updateMany(
      {
        sender: userId,
        receiver: currentUserId,
        isRead: false,
      },
      {
        $set: { isRead: true },
      }
    );


// Notify the sender that their messages were read
if (result.modifiedCount > 0) {
  const io = req.app.get("io");

  io.to(`user:${userId}`).emit("messages:read", {
    readBy: currentUserId.toString(),
  });
}


    res.status(200).json({
      message: "Messages marked as read",
      updatedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Mark messages read error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};





module.exports = {
  sendMessage,
  getConversation,
  getConversations,
  markMessagesAsRead,
};


