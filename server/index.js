
require("dotenv").config();

const express = require("express");
const http = require("http");

const connectDB = require("./config/db");
const initializeSocket = require("./socket");

const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const userRoutes = require("./routes/userRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const messageRoutes = require("./routes/messageRoutes");
const avatarRoutes = require("./routes/avatarRoutes");

const app = express();

// Allow Express to read JSON
app.use(express.json());

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);
app.use("/api/users", avatarRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/messages", messageRoutes);

// Home route
app.get("/", (req, res) => {
  res.send("SocialSphere API is working!");
});

// Create HTTP server
const httpServer = http.createServer(app);

// Initialize Socket.IO

const io = initializeSocket(httpServer);

// Make Socket.IO available to our controllers
app.set("io", io);


const PORT = process.env.PORT || 5000;

// Start server after MongoDB connects
const startServer = async () => {
  try {
    await connectDB();

    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup error:", error.message);
    process.exit(1);
  }
};

startServer();
