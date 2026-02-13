/**
 * Socket.IO Server Middleware Hook
 * 
 * This file provides middleware integration that allows Socket.IO
 * to be initialized and attached to the Next.js httpServer.
 * 
 * The solution uses Node.js's `require` hook to intercept http.Server
 * creation and attach Socket.IO to it.
 */

import { Server as SocketIOServer } from "socket.io";
import { setGlobalIO, getGlobalIO } from "./getIO";

// Track if we've already hooked into the server
let serverHooked = false;

/**
 * Attempt to attach Socket.IO to the current http server
 * This should be called from a route handler that has access to res.socket.server
 */
export function attachSocketIOToServer(httpServer: any): any {
  if (!httpServer) {
    console.error("[SocketMiddleware] No httpServer provided");
    return null;
  }

  // Check if Socket.IO is already attached
  const existing = getGlobalIO();
  if (existing && (existing as any)?.httpServer === httpServer) {
    console.log("[SocketMiddleware] Socket.IO already attached to this server");
    return existing;
  }

  try {
    console.log(
      "[SocketMiddleware] Creating new Socket.IO instance for httpServer",
    );

    const io = new SocketIOServer(httpServer, {
      path: "/api/socket",
      addTrailingSlash: false,
      transports: ["polling", "websocket"],
      pingInterval: 25000,
      pingTimeout: 60000,
      maxHttpBufferSize: 1e6,
      allowEIO3: true,
      serveClient: false,
      connectTimeout: 45000,
      upgradeTimeout: 10000,
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: false,
      },
    });

    // Store reference to httpServer for later validation
    (io as any).httpServer = httpServer;

    // Attach connection handlers
    io.on("connection", (socket) => {
      console.log("[Socket] User connected:", socket.id);

      socket.on("user-join", (data: any) => {
        const userId = typeof data === "string" ? data : data.userId;
        if (!userId) {
          console.warn("[Socket] User join without userId");
          return;
        }

        socket.join(`user-${userId}`);
        console.log(`[Socket] User ${userId} joined room user-${userId}`);

        socket.emit("joined-user-room", { userId, socketId: socket.id });
      });

      socket.on("disconnect", () => {
        console.log("[Socket] User disconnected:", socket.id);
      });

      socket.on("error", (error) => {
        console.error("[Socket] Socket error:", error);
      });
    });

    io.on("error", (error) => {
      console.error("[Socket] Server error:", error);
    });

    // Store globally
    setGlobalIO(io);
    console.log("[SocketMiddleware] Socket.IO successfully attached and stored");

    return io;
  } catch (error) {
    console.error("[SocketMiddleware] Failed to attach Socket.IO:", error);
    throw error;
  }
}

/**
 * Check if Socket.IO should be initialized
 * Call this from the /api/socket route handler
 */
export function shouldInitializeSocketIO(): boolean {
  // Initialize if not already initialized
  return !getGlobalIO();
}

export { serverHooked };
