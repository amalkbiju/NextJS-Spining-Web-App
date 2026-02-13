import type { NextApiRequest, NextApiResponse } from "next";
import type { Socket as EngineSocket } from "engine.io";
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

  try {
    // Get the HTTP server that Next.js created
    // The res.socket is an internal Node.js socket
    // The res.socket.server is the internal Node.js HTTP server
    const httpServer = (res as any).socket?.server;

    if (!httpServer) {
      console.error("[Socket] No httpServer available");
      if (!res.headersSent) {
        res.status(500);
        res.end("No server");
      }
      return;
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
        if (!res.headersSent) {
          res.status(500);
          res.end("Init failed");
        }
        return;
      }
    } else {
      console.log("[Socket] Reusing existing Socket.IO instance");
    }

    // Verify Socket.IO instance has an engine
    if (!io || !io.engine) {
      console.error("[Socket] Socket.IO engine not ready");
      if (!res.headersSent) {
        res.status(503);
        res.end("Socket.IO not ready");
      }
      return;
    }

    console.log("[Socket] Delegating to Socket.IO engine");
    console.log("[Socket] Request:", {
      method: req.method,
      url: req.url,
      query: req.query,
    });

    // Let Socket.IO engine handle the request
    // The engine will handle the Socket.IO protocol (long-polling, websocket upgrade, etc.)
    io.engine.handleRequest(req, res);
  } catch (error) {
    console.error("[Socket] Handler error:", error);
    if (!res.headersSent) {
      res.status(500);
      res.end("Internal error");
    }
  }
}

