/**
 * Standalone Socket.IO Server for Vercel Frontend
 *
 * Deploy this to Railway.app, Render, or any Node.js hosting
 * This server handles all Socket.IO connections independently of Vercel
 *
 * Installation:
 * npm install express socket.io cors dotenv
 *
 * Environment Variables:
 * PORT=3001
 * NODE_ENV=production
 * ALLOWED_ORIGINS=https://your-vercel-app.vercel.app,http://localhost:3000
 *
 * Start: node socket-server.js
 */
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();

const app = express();
const httpServer = createServer(app);

const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || "development";
const ALLOWED_ORIGINS = (
  process.env.ALLOWED_ORIGINS || "http://localhost:3000"
).split(",");

// Socket.IO CORS Configuration
const io = new Server(httpServer, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
  pingInterval: 25000,
  pingTimeout: 60000,
  connectTimeout: 45000,
  maxHttpBufferSize: 1e6,
  serveClient: false,
});

// User socket mapping
const userSockets = new Map(); // userId -> socketId

// ============================================
// Socket.IO Connection Handlers
// ============================================

io.on("connection", (socket) => {
  console.log(`👤 User connected: ${socket.id}`);

  // Handle user joining
  socket.on("user-join", (data) => {
    const userId = typeof data === "string" ? data : data.userId;
    if (!userId) {
      console.warn("⚠️  User join event without userId");
      return;
    }

    // Store the mapping
    userSockets.set(userId, socket.id);
    socket.join(`user-${userId}`);

    console.log(`✅ User ${userId} joined (socket: ${socket.id})`);
    socket.emit("joined-user-room", { userId, socketId: socket.id });
  });

  // Handle room invitations
  socket.on("send-room-invite", (data) => {
    const { toUserId, fromUserId, roomId, roomName } = data;
    const targetSocketId = userSockets.get(toUserId);

    if (targetSocketId) {
      io.to(`user-${toUserId}`).emit("room-invite", {
        fromUserId,
        roomId,
        roomName,
        timestamp: new Date(),
      });
      console.log(`📨 Invite sent from ${fromUserId} to ${toUserId}`);
      socket.emit("invite-sent", { toUserId, roomId });
    } else {
      console.warn(`❌ User ${toUserId} not connected`);
      socket.emit("invite-failed", { toUserId, reason: "User not online" });
    }
  });

  // Handle game events
  socket.on("game-event", (data) => {
    const { roomId, eventType, eventData } = data;
    io.to(roomId).emit("game-update", {
      eventType,
      eventData,
      timestamp: new Date(),
    });
    console.log(`🎮 Game event in room ${roomId}: ${eventType}`);
  });

  // Keep-alive ping
  socket.on("ping", () => {
    socket.emit("pong");
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.id}`);

    // Clean up user mapping
    for (const [userId, socketId] of userSockets.entries()) {
      if (socketId === socket.id) {
        userSockets.delete(userId);
        console.log(`🗑️  Cleaned up user ${userId}`);
        break;
      }
    }
  });

  // Error handling
  socket.on("error", (error) => {
    console.error(`❌ Socket error (${socket.id}):`, error);
  });
});

// ============================================
// Express Routes
// ============================================

app.use(express.json());
app.use(cors({ origin: ALLOWED_ORIGINS }));

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date(),
    environment: NODE_ENV,
    connectedUsers: userSockets.size,
    connectedSockets: io.engine.clientsCount,
  });
});

// Get socket info
app.get("/api/socket-info", (req, res) => {
  res.json({
    connectedUsers: userSockets.size,
    connectedSockets: io.engine.clientsCount,
    users: Array.from(userSockets.keys()),
  });
});

// ============================================
// Server Start
// ============================================

httpServer.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║  Socket.IO Server Started              ║
╠════════════════════════════════════════╣
║  Port: ${PORT}
║  Environment: ${NODE_ENV}
║  Allowed Origins: ${ALLOWED_ORIGINS.join(", ")}
║  Health Check: /health
╚════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully...");
  httpServer.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

module.exports = { app, httpServer, io };
