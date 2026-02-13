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

// Socket.IO Handler - handles both GET and POST requests
export default function handler(req: SocketRequest, res: SocketResponse) {
  const httpServer = res.socket?.server;
  
  if (!httpServer) {
    console.log("[Socket] No HTTP server");
    return res.status(500).json({ error: "Server not available" });
  }

  try {
    // CRITICAL: Initialize Socket.IO
    const io = getOrCreateSocketIO(httpServer);
    setGlobalIO(io);

    // Check if this is a Socket.IO protocol request
    const isSocketIOProtocol = req.query.transport || req.query.EIO;

    if (isSocketIOProtocol) {
      // For Socket.IO protocol requests (GET or POST), let the engine handle it
      // Don't send any response body - Socket.IO engine will respond
      console.log(`[Socket] ${req.method} protocol request`);
      return;
    }

    // Non-protocol request - return 200 OK
    console.log(`[Socket] ${req.method} plain request`);
    return res.status(200).json({ status: "ok", ready: true });

  } catch (error) {
    console.log("[Socket] Handler error:", error);
    return res.status(500).json({ error: "Internal error" });
  }
}
