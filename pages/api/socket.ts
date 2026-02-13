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

// Socket.IO Handler - MUST return 200 OK for all requests
export default function handler(req: SocketRequest, res: SocketResponse) {
  try {
    const httpServer = res.socket?.server;
    if (!httpServer) {
      return res.status(500).json({ error: "Server not available" });
    }

    // Initialize Socket.IO on every request
    try {
      const io = getOrCreateSocketIO(httpServer);
      setGlobalIO(io);
    } catch (err) {
      console.log("Socket.IO init issue:", err);
    }

    // Check for Socket.IO protocol parameters
    if (req.query.transport || req.query.EIO) {
      // Let Socket.IO engine handle it
      return;
    }

    // Plain request - return 200 OK
    return res.status(200).json({ status: "ok" });

  } catch (error) {
    console.log("Socket error:", error);
    return res.status(500).json({ error: "Internal error" });
  }
}
