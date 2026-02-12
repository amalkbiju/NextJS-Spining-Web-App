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

    // Get or create Socket.IO instance
    const io = getOrCreateSocketIO(res.socket.server);

    // Always store in global for access from other routes
    setGlobalIO(io);

    // For regular HTTP requests (like from /api/init), return JSON
    if (req.method === "GET") {
      return res
        .status(200)
        .json({ success: true, message: "Socket.IO ready" });
    }

    // For other methods, end response
    res.end();
  } catch (error: any) {
    console.error("❌ Socket handler error:", error.message);
    if (req.method === "GET") {
      return res.status(500).json({ success: false, error: error.message });
    }
    res.status(500).end();
  }
}
