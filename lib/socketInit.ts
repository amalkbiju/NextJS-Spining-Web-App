/**
 * Server-side initialization hook for Socket.IO
 * This module runs on server startup and initializes Socket.IO
 *
 * Strategy:
 * 1. Socket.IO is NOT initialized at server startup (no httpServer access)
 * 2. Socket.IO initializes on first API request to /api/socket
 * 3. AuthInitializer component ensures /api/socket is called early
 * 4. After that, Socket.IO is available globally for all requests
 */

import { getGlobalIO } from "./getIO";

// Initialization state
let initAttempted = false;

/**
 * Check Socket.IO status (non-blocking)
 * This is called occasionally to verify Socket.IO is working
 */
export function checkSocketIOStatus(): {
  initialized: boolean;
  clientCount: number;
  ready: boolean;
} {
  const io = getGlobalIO();

  if (!io) {
    return {
      initialized: false,
      clientCount: 0,
      ready: false,
    };
  }

  return {
    initialized: true,
    clientCount: (io as any).engine?.clientsCount || 0,
    ready: true,
  };
}

/**
 * Initialize Socket.IO (this happens on first request)
 * This is called by /api/socket route handler
 *
 * Note: We cannot initialize Socket.IO here because we don't have access
 * to the httpServer. Instead, we mark that initialization was attempted
 * and the /api/socket route handler will do the actual work.
 */
export function markSocketIOInitializationAttempted(): void {
  if (!initAttempted) {
    console.log("[ServerInit] Marking Socket.IO initialization as attempted");
    initAttempted = true;
  }
}

export function hasSocketIOBeenInitialized(): boolean {
  return initAttempted;
}

// If this is being imported, we're on the server
if (typeof window === "undefined") {
  console.log("[ServerInit] Server initialization module loaded");
}
