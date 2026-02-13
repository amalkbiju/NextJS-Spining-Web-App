import type { NextApiRequest, NextApiResponse } from "next";
import { getOrCreateSocketIO } from "@/lib/socketIOFactory";
import { setGlobalIO, getGlobalIO } from "@/lib/getIO";

export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Socket.IO API Handler for Vercel Serverless
 * 
 * CRITICAL FIX: Explicitly call Socket.IO engine's handleRequest method
 * This is the proper way to integrate Socket.IO with Next.js on serverless.
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const httpServer = (res.socket as any)?.server;
    
    console.log("[Socket] Handler called", {
      method: req.method,
      path: req.url,
      hasServer: !!httpServer,
    });
    
    // Initialize Socket.IO
    let io;
    try {
      if (httpServer) {
        io = getOrCreateSocketIO(httpServer);
        setGlobalIO(io);
        console.log("[Socket] Created/got Socket.IO from httpServer");
      } else {
        io = getGlobalIO();
        console.log("[Socket] Using cached Socket.IO instance");
      }
    } catch (err) {
      console.error("[Socket] Error getting IO:", err);
      throw err;
    }
    
    if (!io) {
      console.error("[Socket] Socket.IO instance is null");
      return res.status(503).json({ error: "Socket.IO not initialized" });
    }

    // Access the engine that Socket.IO creates
    // @ts-ignore - engine is private but we need to access it
    const engine = io.engine;
    
    console.log("[Socket] Engine status:", {
      hasEngine: !!engine,
      engineType: typeof engine,
      hasHandleRequest: engine ? typeof engine.handleRequest : "N/A",
    });
    
    if (!engine || typeof engine.handleRequest !== "function") {
      console.error("[Socket] Engine or handleRequest not available");
      return res.status(500).json({ error: "Engine not ready" });
    }

    // Call Socket.IO's engine handler to process the request
    console.log("[Socket] Calling engine.handleRequest");
    engine.handleRequest(req, res);

  } catch (error) {
    console.error("[Socket] Caught exception:", error);
    try {
      if (!res.headersSent) {
        res.status(500).json({ error: "Handler exception", msg: String(error) });
      }
    } catch (e) {
      console.error("[Socket] Failed to send error response:", e);
    }
  }
}
