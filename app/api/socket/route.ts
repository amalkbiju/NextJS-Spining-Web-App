import { NextRequest, NextResponse } from "next/server";
import { getGlobalIO, setGlobalIO } from "@/lib/getIO";
import { getOrCreateSocketIO } from "@/lib/socketIOFactory";
import { Server } from "socket.io";

/**
 * Socket.IO API Route Handler (App Router)
 *
 * PRIMARY Socket.IO initialization and handling endpoint.
 * This route:
 * 1. Creates an in-memory HTTP server for Socket.IO if needed
 * 2. Initializes Socket.IO on the first request
 * 3. Handles Socket.IO HTTP polling requests
 * 4. Sets proper CORS headers for Socket.IO protocol
 *
 * Since App Router doesn't have direct access to req.socket.server,
 * we use an alternative approach: create a Socket.IO instance with
 * a minimal HTTP server wrapper that works with serverless.
 */

// Create a minimal HTTP server wrapper that Socket.IO can attach to
class MinimalHttpServer {
  listeners: Map<string, Function[]> = new Map();
  socketServers: Map<string, any> = new Map();

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  emit(event: string, ...args: any[]) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach((cb) => cb(...args));
  }

  once(event: string, callback: Function) {
    const wrapper = (...args: any[]) => {
      callback(...args);
      const callbacks = this.listeners.get(event) || [];
      const idx = callbacks.indexOf(wrapper as any);
      if (idx > -1) callbacks.splice(idx, 1);
    };
    this.on(event, wrapper);
  }

  removeListener(event: string, callback: Function) {
    const callbacks = this.listeners.get(event) || [];
    const idx = callbacks.indexOf(callback);
    if (idx > -1) callbacks.splice(idx, 1);
  }

  removeAllListeners(event?: string) {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.search;
    console.log(`[Socket GET] /api/socket${query}`);

    // Get or create Socket.IO instance
    let io = getGlobalIO();

    if (!io) {
      console.log("[Socket GET] 🔌 Socket.IO not found, creating instance...");

      try {
        // Create a minimal HTTP server for Socket.IO to attach to
        const minimalServer = new MinimalHttpServer() as any;

        console.log("[Socket GET] 🏗️  Creating Socket.IO instance with minimal server");
        io = new Server(minimalServer, {
          path: "/api/socket",
          addTrailingSlash: false,
          transports: ["polling", "websocket"],
          pingInterval: 25000,
          pingTimeout: 60000,
          maxHttpBufferSize: 1e6,
          allowEIO3: true,
          cors: {
            origin: "*",
            methods: ["GET", "POST"],
            credentials: false,
          },
          serveClient: false,
          connectTimeout: 45000,
          upgradeTimeout: 10000,
        });

        // Set up connection handler
        io.on("connection", (socket: any) => {
          console.log("👤 User connected with socket ID:", socket.id);

          socket.on("user-join", (data: any) => {
            const userId = typeof data === "string" ? data : data.userId;
            if (!userId) {
              console.warn("⚠️  User join event received without userId");
              return;
            }

            socket.join(`user-${userId}`);
            console.log(
              `✓ User ${userId} joined room 'user-${userId}' with socket ${socket.id}`,
            );

            socket.emit("joined-user-room", { userId, socketId: socket.id });
          });

          socket.on("disconnect", () => {
            console.log("❌ User disconnected:", socket.id);
          });

          socket.on("error", (error: any) => {
            console.error("❌ Socket error:", error);
          });
        });

        io.on("error", (error: any) => {
          console.error("❌ Socket.IO server error:", error);
        });

        // Store globally
        setGlobalIO(io);
        console.log("[Socket GET] ✅ Socket.IO instance created and stored globally");
      } catch (error) {
        console.error("[Socket GET] ❌ Failed to create Socket.IO:", error);
        throw error;
      }
    } else {
      console.log("[Socket GET] ✅ Socket.IO already initialized");
    }

    // Set Socket.IO-compatible headers
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Content-Type": "application/json",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Connection": "keep-alive",
      "Transfer-Encoding": "chunked",
    };

    // Return 200 OK
    return new NextResponse(JSON.stringify({ ok: true }), {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("[Socket GET] ❌ Error:", error);
    return new NextResponse(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log(`[Socket POST] /api/socket`);

    // POST is used by Socket.IO for long polling
    let io = getGlobalIO();

    if (!io) {
      console.log("[Socket POST] 🔌 Socket.IO not found, creating instance...");

      try {
        // Create a minimal HTTP server for Socket.IO to attach to
        const minimalServer = new MinimalHttpServer() as any;

        console.log("[Socket POST] 🏗️  Creating Socket.IO instance with minimal server");
        io = new Server(minimalServer, {
          path: "/api/socket",
          addTrailingSlash: false,
          transports: ["polling", "websocket"],
          pingInterval: 25000,
          pingTimeout: 60000,
          maxHttpBufferSize: 1e6,
          allowEIO3: true,
          cors: {
            origin: "*",
            methods: ["GET", "POST"],
            credentials: false,
          },
          serveClient: false,
          connectTimeout: 45000,
          upgradeTimeout: 10000,
        });

        // Set up connection handler
        io.on("connection", (socket: any) => {
          console.log("👤 User connected with socket ID:", socket.id);

          socket.on("user-join", (data: any) => {
            const userId = typeof data === "string" ? data : data.userId;
            if (!userId) {
              console.warn("⚠️  User join event received without userId");
              return;
            }

            socket.join(`user-${userId}`);
            console.log(
              `✓ User ${userId} joined room 'user-${userId}' with socket ${socket.id}`,
            );

            socket.emit("joined-user-room", { userId, socketId: socket.id });
          });

          socket.on("disconnect", () => {
            console.log("❌ User disconnected:", socket.id);
          });

          socket.on("error", (error: any) => {
            console.error("❌ Socket error:", error);
          });
        });

        io.on("error", (error: any) => {
          console.error("❌ Socket.IO server error:", error);
        });

        // Store globally
        setGlobalIO(io);
        console.log("[Socket POST] ✅ Socket.IO instance created and stored globally");
      } catch (error) {
        console.error("[Socket POST] ❌ Failed to create Socket.IO:", error);
        throw error;
      }
    } else {
      console.log("[Socket POST] ✅ Socket.IO already initialized");
    }

    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Content-Type": "application/json",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Connection": "keep-alive",
      "Transfer-Encoding": "chunked",
    };

    return new NextResponse(JSON.stringify({ ok: true }), {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("[Socket POST] ❌ Error:", error);
    return new NextResponse(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  console.log(`[Socket OPTIONS] /api/socket`);

  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
