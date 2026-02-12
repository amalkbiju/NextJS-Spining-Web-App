/**
 * Socket.IO Initialization Helper
 * This module ensures Socket.IO is initialized when the app starts
 *
 * The initialization is triggered by accessing the /pages/api/socket endpoint
 * which is the Pages API that creates the Socket.IO server instance
 */

import { getGlobalIO, setGlobalIO } from "./getIO";

let initializationAttempted = false;
let initializationPromise: Promise<boolean> | null = null;

/**
 * Initialize Socket.IO
 * The Socket.IO instance is created in /pages/api/socket.ts
 * This function waits for that endpoint to be accessed
 */
async function initializeSocketIO(): Promise<boolean> {
  // If already initializing, wait for that promise
  if (initializationPromise) {
    return initializationPromise;
  }

  // If already attempted, try to get the instance
  if (initializationAttempted) {
    const io = getGlobalIO();
    return io !== null;
  }

  initializationAttempted = true;

  // Create and store the promise
  initializationPromise = (async () => {
    try {
      console.log("🚀 Attempting Socket.IO initialization");

      // First, check if it's already initialized from a previous request
      let io = getGlobalIO();
      if (io) {
        console.log("✅ Socket.IO already initialized");
        return true;
      }

      // The socket endpoint will be accessed when a client tries to connect
      // For now, we just log that we're ready to initialize
      console.log(
        "📡 Socket.IO will initialize when first client connects to /api/socket",
      );

      // Give the server a moment to handle any pending requests
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Check again
      io = getGlobalIO();
      if (io) {
        console.log("✅ Socket.IO initialized successfully");
        return true;
      }

      console.warn(
        "⚠️  Socket.IO not yet initialized, will initialize on first use",
      );
      return false;
    } catch (error) {
      console.error("❌ Error during Socket.IO initialization attempt:", error);
      return false;
    }
  })();

  return initializationPromise;
}

// Initialize Socket.IO when this module is imported
if (typeof window === "undefined") {
  // Server-side only - initialize immediately
  initializeSocketIO().catch(console.error);
}

export { initializeSocketIO, getGlobalIO, setGlobalIO };
