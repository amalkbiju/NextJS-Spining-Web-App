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
 * This route ensures Socket.IO is initialized on the HTTP server.
 * Socket.IO handles all requests through its engine middleware,
 * not directly through this handler.
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(`[Socket] ${req.method} ${req.url}`);

  try {
    // Get the HTTP server that Next.js created
    const socket = (res as any).socket;
    const httpServer = socket?.server;

    if (!httpServer) {
      console.error("[Socket] No httpServer available");
      return res.status(500).json({ error: "No server" });
    }

    // Check if this is a valid Socket.IO request early
    const hasEIO = req.query.EIO;
    const isUpgradeRequest = req.headers.upgrade === "websocket";

    // If no EIO and no upgrade request, this isn't a Socket.IO request
    if (!hasEIO && !isUpgradeRequest && req.method === "GET") {
      console.log(
        "[Socket] Non-Socket.IO request, returning 426 Upgrade Required",
      );
      res.setHeader("Connection", "close");
      return res.status(426).json({ error: "Upgrade Required" });
    }

    // Initialize Socket.IO (if not already done)
    let io = getGlobalIO();
    if (!io) {
      // Double-check: also look for it on the httpServer itself
      io = httpServer.io;
      if (!io) {
        try {
          io = getOrCreateSocketIO(httpServer);
          setGlobalIO(io);
          // Also store on httpServer for direct access
          httpServer.io = io;
          console.log("[Socket] Socket.IO initialized successfully");
        } catch (err) {
          console.error("[Socket] Failed to initialize Socket.IO:", err);
          return res.status(500).json({ error: "Init failed" });
        }
      } else {
        console.log(
          "[Socket] Found Socket.IO on httpServer, restoring to globalThis",
        );
        setGlobalIO(io);
      }
    } else {
      // Ensure it's also on httpServer for redundancy
      if (!httpServer.io) {
        httpServer.io = io;
      }
    }

    // Verify Socket.IO instance is ready
    if (!io || !io.engine) {
      console.error("[Socket] Socket.IO engine not ready");
      return res.status(503).json({ error: "Socket.IO not ready" });
    }

    console.log("[Socket] Delegating to Socket.IO engine");

    // Let Socket.IO engine handle the request
    io.engine.handleRequest(req as any, res as any);
  } catch (error) {
    console.error("[Socket] Handler error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal error" });
    }
  }
}
