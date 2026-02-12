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
    const io = new Server(httpServer, {
      path: "/api/socket",
      addTrailingSlash: false,
      transports: ["websocket", "polling"],
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: false,
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
  if (ioInstance) {
    return ioInstance;
  }
  return createSocketIOInstance(httpServer);
}

/**
 * Get cached Socket.IO instance (without creating)
 */
export function getSocketIO(): any {
  return ioInstance;
}

export { userSockets };
