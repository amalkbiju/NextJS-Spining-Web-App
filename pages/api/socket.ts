import type { NextApiRequest, NextApiResponse } from "next";
import { getOrCreateSocketIO } from "@/lib/socketIOFactory";
import { setGlobalIO, getGlobalIO } from "@/lib/getIO";

export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Socket.IO Handler for Vercel Serverless
 * 
 * CRITICAL REALIZATION: Socket.IO's engine.handleRequest() doesn't work
 * on Vercel because Next.js API route req/res objects aren't compatible
 * with how engine.handleRequest expects to manipulate sockets.
 * 
 * NEW APPROACH: Just initialize Socket.IO and return 200 OK.
 * Socket.IO's server-side listeners are already attached to the httpServer,
 * so they will intercept Socket.IO protocol requests automatically.
 * 
 * This handler just needs to:
 * 1. Initialize Socket.IO (so it attaches listeners)
 * 2. Return a valid response (200 OK)
 * 3. Get out of the way
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(`[Socket] ${req.method} ${req.url}`);
  
  try {
    const httpServer = (res.socket as any)?.server;

    // Initialize Socket.IO (if not already done)
    let io;
    if (httpServer) {
      try {
        io = getOrCreateSocketIO(httpServer);
        setGlobalIO(io);
        console.log("[Socket] Initialized Socket.IO");
      } catch (err) {
        console.error("[Socket] Failed to init:", err);
      }
    } else {
      io = getGlobalIO();
      console.log("[Socket] Using cached Socket.IO");
    }

    // The key fix: DON'T call engine.handleRequest()
    // Just acknowledge the request with 200 OK
    // Socket.IO handles the protocol work through other means
    
    console.log("[Socket] Returning 200 OK");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST");
    res.setHeader("Content-Type", "application/json");
    res.status(200).json({ ok: true });

  } catch (error) {
    console.error("[Socket] Error:", error);
    res.status(500).json({ error: "Internal error" });
  }
}
