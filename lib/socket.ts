import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

/**
 * Initialize Socket.IO connection
 * @param userId - The user's unique identifier
 * @returns Socket instance
 */
export function initSocket(userId?: string): Socket {
  // Return existing socket if already exists
  if (socket) {
    console.log("✅ Socket.IO instance already exists, reusing:", {
      connected: socket.connected,
      id: socket.id,
    });

    // If socket exists but not connected, ensure user-join is emitted once connected
    if (!socket.connected) {
      socket.once("connect", () => {
        if (userId) {
          socket?.emit("user-join", { userId });
          console.log(`📤 Emitted user-join event for userId: ${userId}`);
        }
      });
    }

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
    addTrailingSlash: false, // ← FIX: Prevent trailing slash that causes Vercel redirect
    transports: ["websocket", "polling"], // Try WebSocket first, fallback to polling
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 15, // Increased attempts for Vercel
    reconnectionDelayMax: 5000,
    forceNew: false,
    multiplex: true,
    upgrade: true, // Allow upgrade from polling to websocket
    rememberUpgrade: true, // Remember transport choice
    randomizationFactor: 0.5,
    // Increase timeouts for Vercel cold starts
    timeout: 60000,
    // CORS settings
    withCredentials: false,
    // Enable debug logging in development
    extraHeaders: {
      "X-Client-Version": "socket.io-client/4.8.3",
    },
  });

  // ⚠️  CRITICAL: Attach listeners IMMEDIATELY after socket creation
  // These listeners MUST be attached before socket events fire
  // Otherwise, Socket.IO might disconnect idle connections

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
    // Reset socket to null so it can be reinitialized
    socket = null;
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

  // Add keep-alive listener to prevent garbage collection
  socket.onAny((eventName, ...args) => {
    // Only log non-ping/pong events to avoid spam
    if (eventName !== "ping" && eventName !== "pong") {
      console.log(`📨 Socket event received: ${eventName}`);
    }
  });

  // Handle server ping requests
  socket.on("pong", () => {
    console.log("🔔 Received pong from server");
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
/**
 * Register a listener for a socket event
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

  console.log(`📡 Listening for event: ${event}`, {
    socketConnected: socket?.connected,
    socketId: socket?.id,
  });
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
