import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

/**
 * Initialize Socket.IO connection
 * @param userId - The user's unique identifier
 * @returns Socket instance
 */
export function initSocket(userId?: string): Socket {
  // Return existing socket if already initialized
  if (socket && socket.connected) {
    console.log("✅ Socket.IO already connected, reusing instance");
    return socket;
  }

  console.log("🔌 Initializing Socket.IO client...");

  // Create new socket connection
  // Get the correct URL for the environment
  let socketUrl = "http://localhost:3000";

  if (typeof window !== "undefined") {
    // Client-side: use the current window location
    socketUrl = `${window.location.protocol}//${window.location.host}`;
    console.log(`📡 Connecting to: ${socketUrl}`);
  }

  socket = io(socketUrl, {
    path: "/api/socket",
    transports: ["polling", "websocket"], // Try polling first on production
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 10, // Increased attempts
    reconnectionDelayMax: 5000,
    forceNew: false,
    multiplex: true,
    upgrade: true, // Allow upgrade from polling to websocket
  });

  // Connection events
  socket.on("connect", () => {
    console.log("✅ Socket.IO connected:", socket?.id);
    if (userId) {
      // Emit user ID to server for identification
      socket?.emit("user-join", { userId });
      console.log(`📤 Emitted user-join event for userId: ${userId}`);
    }
  });

  // Listen for confirmation of joining user room
  socket.on("joined-user-room", (data: any) => {
    console.log(
      `✅ Confirmed: User ${data.userId} joined socket room 'user-${data.userId}'`,
    );
  });

  socket.on("disconnect", () => {
    console.log("⚠️  Socket.IO disconnected");
  });

  socket.on("connect_error", (error: any) => {
    console.error("❌ Socket.IO connection error:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      type: error.type,
    });
  });

  socket.on("error", (error: any) => {
    console.error("❌ Socket.IO error:", error);
  });

  return socket;
}

/**
 * Get the Socket.IO instance
 */
export function getSocket(): Socket | null {
  return socket;
}

/**
 * Listen for events on the socket
 * @param event - Event name to listen for
 * @param callback - Callback function when event is received
 */
export function onEvent(event: string, callback: (...args: any[]) => void) {
  if (!socket) {
    console.warn(
      `⚠️  Socket not initialized, cannot listen to event: ${event}`,
    );
    return;
  }

  console.log(`📡 Listening for event: ${event}`);
  socket.on(event, callback);
}

/**
 * Stop listening for events on the socket
 * @param event - Event name to stop listening for
 * @param callback - Callback function to remove
 */
export function offEvent(event: string, callback?: (...args: any[]) => void) {
  if (!socket) {
    console.warn(
      `⚠️  Socket not initialized, cannot remove listener for event: ${event}`,
    );
    return;
  }

  if (callback) {
    socket.off(event, callback);
  } else {
    socket.off(event);
  }
  console.log(`🛑 Stopped listening for event: ${event}`);
}

/**
 * Emit an event to the server
 * @param event - Event name to emit
 * @param data - Data to send with the event
 */
export function emitEvent(event: string, data?: any) {
  if (!socket) {
    console.warn(`⚠️  Socket not initialized, cannot emit event: ${event}`);
    return;
  }

  console.log(`📤 Emitting event: ${event}`, data);
  socket.emit(event, data);
}

/**
 * Disconnect the Socket.IO connection
 */
export function disconnectSocket() {
  if (socket) {
    console.log("🔌 Disconnecting Socket.IO...");
    socket.disconnect();
    socket = null;
  }
}

/**
 * Check if socket is connected
 */
export function isSocketConnected(): boolean {
  return socket?.connected || false;
}
