/**
 * Socket.IO Server Instance Management
 * Handles creation and caching of the Socket.IO server instance
 */

import { Server } from "socket.io";
import { setGlobalIO } from "./getIO";

let ioInstance: any = null;
const userSockets: Map<string, string> = new Map();

/**
 * Create Socket.IO instance
 * This is called once when the server first needs Socket.IO
 */
export function createSocketIOInstance(httpServer: any): any {
  if (ioInstance) {
    console.log(
      "✅ Socket.IO instance already created, returning cached instance",
    );
    return ioInstance;
  }

  console.log("🔌 Creating new Socket.IO instance");

  try {
    // Socket.IO CORS configuration
    // On Vercel, allow all origins for now to avoid CORS rejections
    // (the auth middleware will validate actual connections)
    const corsConfig = {
      origin: "*", // Allow all origins - Socket.IO will validate connections
      methods: ["GET", "POST"],
      credentials: false, // Set to false when allowing *
      allowEIO3: true,
    };

    console.log("🔐 Socket.IO CORS config:", JSON.stringify(corsConfig));

    const io = new Server(httpServer, {
      path: "/api/socket",
      addTrailingSlash: false,
      transports: ["polling", "websocket"],
      pingInterval: 25000,
      pingTimeout: 60000,
      maxHttpBufferSize: 1e6,
      allowEIO3: true,
      cors: corsConfig,
      // Production optimizations for Vercel
      serveClient: false, // Don't serve Socket.IO client library
      connectTimeout: 45000,
      upgradeTimeout: 10000,
    });

    console.log("📡 Socket.IO server initialized with options");

    // Connection handler
    io.on("connection", (socket) => {
      console.log("👤 User connected with socket ID:", socket.id);

      socket.on("user-join", (data: any) => {
        const userId = typeof data === "string" ? data : data.userId;
        if (!userId) {
          console.warn("⚠️ User join event received without userId");
          return;
        }

        userSockets.set(userId, socket.id);
        socket.join(`user-${userId}`);
        console.log(
          `✓ User ${userId} joined room 'user-${userId}' with socket ${socket.id}`,
        );

        socket.emit("joined-user-room", { userId, socketId: socket.id });
      });

      socket.on("disconnect", () => {
        console.log("❌ User disconnected:", socket.id);
        for (const [userId, socketId] of userSockets.entries()) {
          if (socketId === socket.id) {
            console.log(`Removed user ${userId} from userSockets map`);
            userSockets.delete(userId);
            break;
          }
        }
      });

      // Error handling
      socket.on("error", (error) => {
        console.error("❌ Socket error:", error);
      });
    });

    // Error handling for the server
    io.on("error", (error) => {
      console.error("❌ Socket.IO server error:", error);
    });

    ioInstance = io;
    setGlobalIO(io);
    console.log("✅ Socket.IO instance created and stored globally");

    return io;
  } catch (error) {
    console.error("❌ Failed to create Socket.IO instance:", error);
    throw error;
  }
}

/**
 * Get or create Socket.IO instance
 */
export function getOrCreateSocketIO(httpServer: any): any {
  if (!httpServer) {
    console.error("❌ httpServer is required");
    throw new Error("httpServer is required to initialize Socket.IO");
  }

  if (ioInstance) {
    console.log("[SocketIO] Returning cached instance");
    return ioInstance;
  }

  console.log("[SocketIO] Creating new instance from httpServer");
  return createSocketIOInstance(httpServer);
}

/**
 * Get cached Socket.IO instance (without creating)
 */
export function getSocketIO(): any {
  return ioInstance;
}

export { userSockets };
