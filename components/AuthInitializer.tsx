"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/store/authStore";

/**
 * Client component that initializes the auth store from localStorage on app load
 * Also triggers Socket.IO initialization on the server side
 * This should be placed in the root layout
 */
export default function AuthInitializer() {
  const { hydrate } = useAuthStore();

  useEffect(() => {
    // Restore auth state from localStorage on app mount
    hydrate();
    console.log("✓ Auth initializer: Restored auth state from localStorage");

    // Trigger Socket.IO initialization on server
    console.log("🔌 Auth initializer: Triggering Socket.IO initialization...");

    // Try to initialize Socket.IO by calling the /api/socket endpoint
    // This will trigger the Pages API handler to create the Socket.IO instance
    const initSocket = async () => {
      try {
        const response = await fetch("/api/socket", { method: "GET" });
        if (response.ok) {
          const data = await response.json();
          console.log(`✓ Socket.IO init response: ${data.message}`);
        }
      } catch (error) {
        console.log("📡 Socket.IO initialization request sent (background)");
      }

      // Also call /api/init to double-check initialization
      try {
        const response = await fetch("/api/init", { method: "GET" });
        if (response.ok) {
          const data = await response.json();
          console.log(
            `✓ Socket.IO init status: ${data.message} (ready: ${data.socketIOReady})`,
          );
        }
      } catch (error) {
        console.warn("⚠️  Socket.IO initialization check failed:", error);
      }
    };

    // Initialize Socket.IO asynchronously
    initSocket().catch(console.error);
  }, [hydrate]);

  return null;
}
