/**
 * Server-side initialization that triggers on app startup
 * This file is imported by the layout to ensure Socket.IO is initialized
 */

import { getGlobalIO, setGlobalIO } from "./getIO";

// Flag to track initialization attempts
let initAttempted = false;
let initPromise: Promise<boolean> | null = null;

export async function ensureSocketIOInitialized(): Promise<boolean> {
  // If already initialized, return true
  const existing = getGlobalIO();
  if (existing) {
    console.log("✅ Socket.IO already initialized");
    return true;
  }

  // If initialization is in progress, wait for it
  if (initPromise) {
    return initPromise;
  }

  // Prevent multiple simultaneous initialization attempts
  if (initAttempted) {
    // Wait a bit and check again
    await new Promise((resolve) => setTimeout(resolve, 200));
    return getGlobalIO() !== null;
  }

  initAttempted = true;

  initPromise = (async () => {
    try {
      console.log("🔄 Requesting Socket.IO initialization from /api/socket...");

      // Call the Pages API socket handler to initialize Socket.IO
      // This needs to be called with the node fetch API on server side
      try {
        // Try to fetch from the local server
        const response = await fetch("http://localhost:3000/api/socket", {
          method: "GET",
          headers: {
            "User-Agent": "Socket.IO Initializer",
          },
        }).catch((err) => {
          console.log("📡 Socket init fetch completed (response not critical)");
          return null;
        });

        if (response && !response.ok) {
          console.warn(`⚠️  Socket init returned status: ${response.status}`);
        }
      } catch (fetchError) {
        // Fetch errors are expected in some cases, Socket.IO might still initialize
        console.log("📡 Socket init fetch attempt (errors ok)");
      }

      // Give Socket.IO time to initialize
      await new Promise((resolve) => setTimeout(resolve, 250));

      // Check if Socket.IO is now available
      const io = getGlobalIO();
      if (io) {
        console.log("✅ Socket.IO successfully initialized!");
        return true;
      }

      console.warn("⚠️  Socket.IO still not initialized");
      return false;
    } catch (error) {
      console.error("❌ Error in Socket.IO initialization:", error);
      return false;
    } finally {
      initPromise = null;
    }
  })();

  return initPromise;
}
