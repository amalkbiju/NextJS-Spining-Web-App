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
 * This handler:
 * 1. Initializes Socket.IO on the httpServer
 * 2. Delegates Socket.IO protocol requests to the Socket.IO engine
 * 3. Socket.IO listens on the httpServer and intercepts requests matching its path
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(`[Socket] ${req.method} ${req.url}`);
  
  try {
    const httpServer = (res.socket as any)?.server;

    if (!httpServer) {
      console.error("[Socket] No httpServer available");
      res.status(500).json({ error: "No httpServer" });
      return;
    }

    // Initialize Socket.IO (if not already done)
    let io;
    try {
      io = getOrCreateSocketIO(httpServer);
      setGlobalIO(io);
      console.log("[Socket] Socket.IO initialized");
    } catch (err) {
      console.error("[Socket] Failed to initialize Socket.IO:", err);
      res.status(500).json({ error: "Socket.IO init failed" });
      return;
    }

    // Check if this is a Socket.IO protocol request
    const isSocketIORequest =
      req.url?.includes("socket.io") || req.method === "GET" || req.method === "POST";

    if (isSocketIORequest && io?.engine?.handleRequest) {
      console.log("[Socket] Delegating to Socket.IO engine handler");
      try {
        // Let Socket.IO engine handle the protocol
        io.engine.handleRequest(req, res);
      } catch (err) {
        console.error("[Socket] Engine handler error:", err);
        // Don't send response here - Socket.IO should have handled it
      }
    } else {
      console.log("[Socket] Returning 200 OK for health check");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST");
      res.setHeader("Content-Type", "application/json");
      res.status(200).json({ ok: true });
    }
  } catch (error) {
    console.error("[Socket] Error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal error" });
    }
  }
}
