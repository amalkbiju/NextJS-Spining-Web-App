import type { NextApiRequest, NextApiResponse } from "next";
import { getOrCreateSocketIO } from "@/lib/socketIOFactory";
import { setGlobalIO, getGlobalIO } from "@/lib/getIO";

/**
 * Socket.IO API Handler
 * 
 * On Vercel (serverless), each request has its own httpServer context.
 * This means Socket.IO's normal approach of attaching to httpServer won't work well.
 * 
 * Instead, we create a shared Socket.IO instance via globalThis and handle
 * Socket.IO protocol requests directly in this handler.
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const httpServer = (res.socket as any)?.server;
  
  if (!httpServer) {
    console.log("[Socket] No HTTP server available");
    // Try to use cached instance if available
    const cachedIO = getGlobalIO();
    if (!cachedIO) {
      return res.status(500).json({ error: "No server context" });
    }
  }

  try {
    console.log(`[Socket] ${req.method} ${req.url}`);
    
    // Initialize or get Socket.IO instance
    const io = httpServer ? getOrCreateSocketIO(httpServer) : getGlobalIO();
    
    if (!io) {
      console.log("[Socket] Failed to get Socket.IO instance");
      return res.status(500).json({ error: "Socket.IO not available" });
    }
    
    setGlobalIO(io);

    // Socket.IO Engine handles requests with the engine middleware
    // The Socket.IO instance already has handlers attached via the Server constructor
    // Just return 200 OK - Socket.IO will have handled the real protocol work
    return res.status(200).json({ ready: true });

  } catch (error) {
    console.error("[Socket] Error:", error);
    return res.status(500).json({ error: "Handler failed" });
  }
}
