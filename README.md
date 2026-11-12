# 🌐 SocialSphere

### Full-Stack Social Media Application | MERN Stack

SocialSphere is a full-stack social media application built using the MERN stack (MongoDB, Express.js, React.js, and Node.js). It allows users to connect, share posts and images, interact through likes and comments, follow other users, and communicate through real-time private messaging.

The project was developed to demonstrate full-stack web development skills, REST API integration, database management, authentication, and real-time communication.

## ✨ Features

### 🔐 Authentication
- User registration and login
- JWT-based authentication
- Password hashing with bcryptjs
- Protected routes and persistent login sessions

### 📝 Posts and Feed
- Create text and image posts
- Edit and delete your own posts
- Like and unlike posts
- Add and delete comments
- View posts in a responsive Home Feed

### 👤 User Profiles
- Personal and public profile pages
- Edit username and bio
- Upload profile pictures using Cloudinary
- View posts and follower statistics
- Follow and unfollow users

### 🔎 Discover
- Search for users by username
- View profiles and user bios
- Start conversations directly from search results

### 💬 Real-Time Messaging
- One-to-one private messaging using Socket.IO
- Instant message delivery
- Recent conversations with message previews
- Unread message counts
- Real-time typing indicators
- Message read receipts
- Persistent conversation history

### 🎨 User Interface
- Responsive React interface
- Custom navigation bar
- Modern post composer and profile pages
- Two-column messaging interface
- Mobile-friendly layouts

## 🛠 Tech Stack

| Category | Technologies |
|---|---|
| Frontend | React.js, Vite, JavaScript, HTML, CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Authentication | JWT, bcryptjs |
| Real-Time Communication | Socket.IO |
| Image Storage | Cloudinary |
| Development Tools | VS Code, Git, GitHub, npm |

## 📁 Project Structure

```text
SocialSphere/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   └── pages/
│   └── package.json
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── index.js
│   ├── socket.js
│   └── package.json
│
├── .gitignore
└── README.md
```

## 🚀 Running Locally

### Prerequisites

- Node.js and npm
- MongoDB Atlas database
- Cloudinary account
- Git

### 1. Clone the repository

```bash
git clone https://github.com/sdharr/SocialSphere.git
cd SocialSphere
```

### 2. Install backend dependencies

```bash
cd server
npm install
```

### 3. Configure environment variables

Create a `server/.env` file and configure the MongoDB connection, JWT secret, and Cloudinary credentials required by the server.

Use the environment variable names referenced in the backend configuration files. Never commit credentials or secrets to GitHub.

### 4. Start the backend

From the `server` directory:

```bash
npm run dev
```

The backend runs locally on port `5000` by default.

### 5. Install and start the frontend

Open another terminal:

```bash
cd client
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

## 🧩 Technical Highlights

- Built REST APIs for user authentication, posts, comments, profiles, and messaging.
- Used MongoDB and Mongoose to manage users, posts, comments, and conversations.
- Integrated Cloudinary for post images and profile pictures.
- Used Socket.IO events for instant message delivery, typing notifications, and read receipts.
- Managed frontend authentication and real-time connection state using React Context.

## 📌 Project Status

**Portfolio project — core functionality implemented and tested locally.**

The application is not currently deployed. Additional production security hardening and deployment may be completed in a future iteration.

## 👨‍💻 Source Code

**GitHub:** https://github.com/sdharr/SocialSphere

---

Built as a full-stack development portfolio project.