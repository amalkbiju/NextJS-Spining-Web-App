import type { NextApiRequest } from "next";

// Global variable to store Socket.IO instance
// Using globalThis to ensure persistence across module reloads in dev
const SOCKETIO_KEY = "__SOCKETIO_INSTANCE_V2__";

export function getGlobalIO() {
  const instance = (globalThis as any)[SOCKETIO_KEY];
  if (instance) {
    console.log("✅ getGlobalIO() - Found Socket.IO instance in globalThis");
    return instance;
  }
  console.log("❌ getGlobalIO() - Socket.IO instance NOT in globalThis");
  return null;
}

export function setGlobalIO(io: any) {
  if (io) {
    console.log("🔧 setGlobalIO() - Storing Socket.IO instance");
    (globalThis as any)[SOCKETIO_KEY] = io;
    const stored = (globalThis as any)[SOCKETIO_KEY];
    if (stored === io) {
      console.log(
        "✅ setGlobalIO() - Confirmed: Socket.IO stored successfully",
      );
    } else {
      console.error("❌ setGlobalIO() - FAILED: Instance not stored properly");
    }
  }
}

// Helper to get IO instance (tries multiple methods)
export function getIOInstance(req?: any): any {
  console.log("🔍 getIOInstance() - Attempting to retrieve Socket.IO");

  // First try globalThis (most reliable in Next.js)
  const globalInstance = (globalThis as any)[SOCKETIO_KEY];
  if (globalInstance) {
    console.log("✅ getIOInstance() - Found in globalThis");
    return globalInstance;
  }
  console.log("❌ getIOInstance() - Not in globalThis, checking request");

  // Try to get from NextAPI request server
  if (req?.socket?.server?.io) {
    console.log("✅ getIOInstance() - Found in request.socket.server");
    const io = req.socket.server.io;
    // Cache it for future use
    setGlobalIO(io);
    return io;
  }

  console.warn("❌ getIOInstance() - Socket.IO not found anywhere");
  return null;
}
