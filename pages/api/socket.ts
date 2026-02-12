import type { NextApiRequest, NextApiResponse } from "next";
import type { Socket as NetSocket } from "net";
import { getOrCreateSocketIO } from "@/lib/socketIOFactory";
import { setGlobalIO } from "@/lib/getIO";

interface SocketRequest extends NextApiRequest {
  socket: NetSocket & {
    server: any;
  };
}

interface SocketResponse extends NextApiResponse {
  socket: NetSocket & {
    server: any;
  };
}

export default function handler(req: SocketRequest, res: SocketResponse) {
  // Must initialize Socket.IO for EVERY request that hits this endpoint
  // This ensures Socket.IO's engine can properly attach and handle the request
  
  try {
    console.log("📍 Socket API endpoint called");
    console.log("   Method:", req.method);
    console.log("   URL:", req.url);
    console.log("   Query params:", req.query);

    // Get the HTTP server from the response socket
    const httpServer = res.socket?.server;
    
    if (!httpServer) {
      console.error("❌ Cannot access HTTP server");
      return res.status(500).json({ error: "Server not initialized" });
    }

    // Initialize Socket.IO - this MUST happen for every request
    // Socket.IO's engine will intercept requests it cares about
    const io = getOrCreateSocketIO(httpServer);
    setGlobalIO(io);

    // Check if this is a Socket.IO protocol request
    const isSocketIORequest = req.query.transport || req.query.EIO;

    if (isSocketIORequest) {
      // This is a Socket.IO polling/websocket request
      console.log("📡 Socket.IO protocol request - engine will handle");
      // Don't send response - Socket.IO engine handles it
      return;
    }

    // Not a Socket.IO request - return status
    console.log("✅ Socket.IO initialized and ready");
    return res.status(200).json({ 
      status: "ok",
      message: "Socket.IO server is running"
    });

  } catch (error: any) {
    console.error("❌ Error in socket handler:", error);
    return res.status(500).json({ 
      error: "Internal server error",
      message: error.message 
    });
  }
}
