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
    console.log("📍 Pages API socket handler called - Method:", req.method);

    // Ensure Socket.IO instance exists
    const httpServer = res.socket?.server;
    
    if (!httpServer) {
      console.error("❌ HTTP server not available on res.socket.server");
      if (req.method === "GET") {
        return res.status(500).json({ 
          success: false, 
          error: "Server not initialized" 
        });
      }
      return res.status(500).end();
    }

    // Get or create Socket.IO instance
    const io = getOrCreateSocketIO(httpServer);

    // Always store in global for access from other routes
    setGlobalIO(io);

    console.log("✅ Socket.IO instance ready, ID:", io?.engine?.id);

    // For regular HTTP requests (like from /api/init), return JSON
    if (req.method === "GET") {
      return res
        .status(200)
        .json({ success: true, message: "Socket.IO ready" });
    }

    // For WebSocket upgrade requests, don't end the response
    // Socket.IO will handle the upgrade
    console.log("📡 Allowing Socket.IO to handle upgrade request");
    // Don't call res.end() - let Socket.IO handle it
  } catch (error: any) {
    console.error("❌ Socket handler error:", error.message);
    if (req.method === "GET") {
      return res.status(500).json({ success: false, error: error.message });
    }
    res.status(500).end();
  }
}
