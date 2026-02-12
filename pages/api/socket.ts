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
  try {
    // Check if this is a Socket.IO polling/websocket request
    // Socket.IO requests will have 'transport' or 'EIO' query parameters
    const isSocketIORequest = req.query.transport || req.query.EIO;
    
    console.log("📍 Pages API socket handler called");
    console.log("   Method:", req.method);
    console.log("   Query:", req.query);
    console.log("   Is Socket.IO request:", !!isSocketIORequest);

    // Ensure Socket.IO instance exists
    const httpServer = res.socket?.server;
    
    if (!httpServer) {
      console.error("❌ HTTP server not available on res.socket.server");
      return res.status(500).json({ 
        success: false, 
        error: "Server not initialized" 
      });
    }

    // Get or create Socket.IO instance
    const io = getOrCreateSocketIO(httpServer);

    // Always store in global for access from other routes
    setGlobalIO(io);

    console.log("✅ Socket.IO instance ready");

    // If this is a Socket.IO request, let Socket.IO handle it
    // Don't send any response - Socket.IO engine will handle it
    if (isSocketIORequest) {
      console.log("📡 Socket.IO polling/upgrade request - letting Socket.IO engine handle");
      // IMPORTANT: Don't call res.end() or send any response
      // Socket.IO needs to handle the response through its engine
      return;
    }

    // For other requests, return JSON status
    return res.status(200).json({ success: true, message: "Socket.IO endpoint ready" });
    
  } catch (error: any) {
    console.error("❌ Socket handler error:", error.message);
    console.error("Stack:", error.stack);
    return res.status(500).json({ success: false, error: error.message });
  }
}
