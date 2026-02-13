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
    // Get allowed origins - both localhost and production domain
    const allowedOrigins: string[] = [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://192.168.1.11:3000",
    ];

    // Add production URL if available
    if (process.env.NEXTAUTH_URL) {
      allowedOrigins.push(process.env.NEXTAUTH_URL);
    }

    console.log("🔐 Socket.IO CORS allowed origins:", allowedOrigins);

    const io = new Server(httpServer, {
      path: "/api/socket",
      addTrailingSlash: false, // ← FIX: Don't add trailing slash (prevents Vercel redirect)
      transports: ["polling", "websocket"], // Polling first (more reliable on Vercel)
      pingInterval: 25000,
      pingTimeout: 60000,
      maxHttpBufferSize: 1e6, // 1 MB
      allowEIO3: true, // Support both EIO 3 and 4
      cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

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
    });

    ioInstance = io;
    setGlobalIO(io);
    console.log("✅ Socket.IO instance created and stored");

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
  // CRITICAL: On Vercel, always try to create/attach to the current httpServer
  // even if we have a cached instance, because each request might get a different server
  if (ioInstance) {
    // Check if this is a different httpServer context (Vercel case)
    // If so, we might need to re-attach
    // But for now, return the cached instance
    console.log("[SocketIO] Returning cached instance");
    return ioInstance;
  }
  
  console.log("[SocketIO] Creating new instance");
  return createSocketIOInstance(httpServer);
}

/**
 * Get cached Socket.IO instance (without creating)
 */
export function getSocketIO(): any {
  return ioInstance;
}

export { userSockets };
