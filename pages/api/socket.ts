import type { NextApiRequest, NextApiResponse } from "next";
import { getOrCreateSocketIO } from "@/lib/socketIOFactory";
import { setGlobalIO, getGlobalIO } from "@/lib/getIO";

export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Socket.IO Handler for Next.js Pages API
 *
 * Handles all Socket.IO protocol requests and connects clients
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(`[Socket] ${req.method} ${req.url}`);

  try {
    // Get the HTTP server that Next.js created
    const httpServer = (res.socket as any)?.server;

    if (!httpServer) {
      console.error("[Socket] No httpServer available");
      return res.status(500).json({ error: "No server" });
    }

    // Initialize Socket.IO (if not already done)
    let io = getGlobalIO();
    if (!io) {
      try {
        io = getOrCreateSocketIO(httpServer);
        setGlobalIO(io);
        console.log("[Socket] Socket.IO initialized");
      } catch (err) {
        console.error("[Socket] Failed to initialize:", err);
        return res.status(500).json({ error: "Init failed" });
      }
    }

    // Critical: Use Socket.IO's engine to handle the actual protocol
    // This method is defined on the Socket.IO server and handles:
    // - HTTP long-polling
    // - WebSocket upgrades
    // - Protocol negotiation
    if (io && io.engine && typeof io.engine.handleRequest === "function") {
      console.log("[Socket] Delegating to Socket.IO engine");
      io.engine.handleRequest(req, res);
    } else {
      // Fallback if engine is not available
      console.log("[Socket] Socket.IO engine not ready");
      res.status(503).json({ error: "Socket.IO not ready" });
    }
  } catch (error) {
    console.error("[Socket] Error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal error" });
    }
  }
}
