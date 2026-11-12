
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("./models/User");

const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  // Authenticate every Socket.IO connection
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );

      const userId =
        decoded.id || decoded.userId || decoded._id || decoded.sub;

      if (!mongoose.isValidObjectId(userId)) {
        return next(new Error("Invalid authentication"));
      }

      const user = await User.findById(userId);

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.data.userId = user._id.toString();

      next();
    } catch (error) {
      next(new Error("Invalid or expired token"));
    }
  });

  // Handle authenticated connections
  io.on("connection", (socket) => {
    const userId = socket.data.userId;

    // Each user gets their own private room
    socket.join(`user:${userId}`);

    console.log("Socket connected for user:", userId);

    // Notify another user when typing starts
    socket.on("typing:start", (receiverId) => {
      if (
        typeof receiverId !== "string" ||
        !mongoose.isValidObjectId(receiverId) ||
        receiverId === userId
      ) {
        return;
      }

      io.to(`user:${receiverId}`).emit("typing:start", {
        senderId: userId,
      });
    });

    // Notify another user when typing stops
    socket.on("typing:stop", (receiverId) => {
      if (
        typeof receiverId !== "string" ||
        !mongoose.isValidObjectId(receiverId) ||
        receiverId === userId
      ) {
        return;
      }

      io.to(`user:${receiverId}`).emit("typing:stop", {
        senderId: userId,
      });
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected for user:", userId);
    });
  });

  return io;
};

module.exports = initializeSocket;
