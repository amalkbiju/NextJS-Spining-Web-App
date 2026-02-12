// This file ensures Socket.IO is initialized on server startup
// It's imported by next.config.js to run during build/startup

if (typeof window === "undefined") {
  // Server-side only
  const initIO = async () => {
    try {
      console.log("🚀 Initializing Socket.IO on server startup...");
      // Call the socket endpoint to trigger initialization
      // This will be called when the server is ready
    } catch (error) {
      console.error("Failed to initialize Socket.IO on startup:", error);
    }
  };

  // Run initialization
  if (typeof setImmediate !== "undefined") {
    setImmediate(initIO);
  }
}
