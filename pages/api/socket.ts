import type { NextApiRequest, NextApiResponse } from "next";
import { getOrCreateSocketIO } from "@/lib/socketIOFactory";
import { setGlobalIO, getGlobalIO } from "@/lib/getIO";

/**
 * Socket.IO API Handler for Vercel Serverless
 * 
 * IMPORTANT: On Vercel, Socket.IO won't auto-attach to the httpServer via listeners.
 * The handler must explicitly call Socket.IO's request handler.
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const httpServer = (res.socket as any)?.server;
    
    // Initialize Socket.IO
    const io = httpServer 
      ? getOrCreateSocketIO(httpServer)
      : getGlobalIO();
    
    if (!io) {
      console.log("[Socket] Socket.IO not initialized");
      return res.status(503).json({ error: "Socket.IO not ready" });
    }

    setGlobalIO(io);

    // The critical fix: Socket.IO's engine has a request handler
    // We need to explicitly call it instead of letting it auto-attach
    // @ts-ignore - accessing private engine property
    const engine = io.engine;
    
    if (engine && engine.handleRequest) {
      // Let Socket.IO's engine handler process this request
      console.log(`[Socket] Delegating to Socket.IO engine: ${req.method} ${req.url}`);
      engine.handleRequest(req, res);
      return;
    }

    // Fallback if engine handler not available
    console.log("[Socket] Socket.IO engine handler not available");
    return res.status(200).json({ ready: true });

  } catch (error) {
    console.error("[Socket] Error:", error);
    return res.status(500).json({ error: String(error) });
  }
}
