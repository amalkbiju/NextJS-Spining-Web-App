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
  // Log the full request details
  console.log(`[Socket] ${req.method} ${req.url}`);
  console.log("[Socket] Query params:", req.query);
  console.log("[Socket] Headers:", {
    upgrade: req.headers.upgrade,
    connection: req.headers.connection,
  });

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
        console.log("[Socket] Socket.IO initialized successfully");
      } catch (err) {
        console.error("[Socket] Failed to initialize Socket.IO:", err);
        return res.status(500).json({ error: "Init failed" });
      }
    } else {
      console.log("[Socket] Reusing existing Socket.IO instance");
    }

    // Verify Socket.IO instance has an engine
    if (!io || !io.engine) {
      console.error("[Socket] Socket.IO engine not ready");
      if (!res.headersSent) {
        return res.status(503).json({ error: "Socket.IO not ready" });
      }
      return;
    }

    // Log before delegating to engine
    console.log("[Socket] Delegating to Socket.IO engine");

    // Let Socket.IO engine handle the request
    // This handles HTTP long-polling and WebSocket upgrades
    try {
      io.engine.handleRequest(req, res);
    } catch (engineError) {
      console.error("[Socket] Engine error:", engineError);
      if (!res.headersSent) {
        return res.status(500).json({ error: "Engine error" });
      }
    }
  } catch (error) {
    console.error("[Socket] Handler error:", error);
    if (!res.headersSent) {
      return res.status(500).json({ error: "Internal error" });
    }
  }
}
