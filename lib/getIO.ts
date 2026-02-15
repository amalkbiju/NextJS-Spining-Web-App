import type { NextApiRequest } from "next";

// Global variable to store Socket.IO instance
// Using globalThis to ensure persistence across module reloads in dev
const SOCKETIO_KEY = "__SOCKETIO_INSTANCE_V2__";

export function getGlobalIO() {
  // First try globalThis
  let instance = (globalThis as any)[SOCKETIO_KEY];
  if (instance) {
    return instance;
  }

  // Fallback: try to get from global object (sometimes works better in Node.js)
  instance = (global as any)[SOCKETIO_KEY];
  if (instance) {
    // Also store in globalThis for consistency
    (globalThis as any)[SOCKETIO_KEY] = instance;
    return instance;
  }

  // Not initialized - this is expected in Next.js App Router without external server
  return null;
}

export function setGlobalIO(io: any) {
  if (io) {
    // Store in both globalThis and global for maximum compatibility
    (globalThis as any)[SOCKETIO_KEY] = io;
    (global as any)[SOCKETIO_KEY] = io;

    // Verify storage
    const stored = (globalThis as any)[SOCKETIO_KEY];
    if (stored === io) {
      console.log("✅ Socket.IO instance stored successfully");
    } else {
      console.error("❌ Failed to store Socket.IO instance");
    }
  }
}

// Helper to get IO instance (tries multiple methods)
export function getIOInstance(req?: any): any {
  // First try globalThis (most reliable in Next.js)
  const globalInstance = (globalThis as any)[SOCKETIO_KEY];
  if (globalInstance) {
    return globalInstance;
  }

  // Try to get from NextAPI request server
  if (req?.socket?.server?.io) {
    const io = req.socket.server.io;
    // Cache it for future use
    setGlobalIO(io);
    return io;
  }

  // Not found
  return null;
}
