import type { NextApiRequest, NextApiResponse } from "next";
import { getOrCreateSocketIO } from "@/lib/socketIOFactory";
import { setGlobalIO, getGlobalIO } from "@/lib/getIO";

export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Socket.IO Handler - Vercel Production Fix
 * 
 * Root cause of 400 error on Vercel:
 * - Socket.IO's engine needs to process requests BEFORE we do anything
 * - We cannot call res.json() or res.status() before the engine processes it
 * - The engine.handleRequest() method must be called with the EXACT req/res objects
 * 
 * The 400 happens because Socket.IO's engine rejects the request when:
 * 1. The connection is already consumed by our handler
 * 2. Headers were already sent
 * 3. The request wasn't properly routed to the engine
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(`[Socket.IO] Received ${req.method} ${req.url}`);
  
  try {
    const httpServer = (res.socket as any)?.server;

    // Initialize Socket.IO FIRST - before doing anything else
    let io;
    try {
      if (httpServer) {
        io = getOrCreateSocketIO(httpServer);
        setGlobalIO(io);
      } else {
        io = getGlobalIO();
      }
    } catch (error) {
      console.error("[Socket.IO] Init error:", error);
      if (!res.headersSent) {
        res.writeHead(503, { "Content-Type": "text/plain" });
        res.end("Init failed");
      }
      return;
    }

    if (!io) {
      console.error("[Socket.IO] No instance");
      if (!res.headersSent) {
        res.writeHead(503, { "Content-Type": "text/plain" });
        res.end("Not ready");
      }
      return;
    }

    // Get the engine
    // @ts-ignore
    const engine = io.engine;

    if (!engine) {
      console.error("[Socket.IO] No engine");
      if (!res.headersSent) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("No engine");
      }
      return;
    }

    // The critical call: let Socket.IO's engine handle the request
    // This MUST be done with the original req/res objects, before any modifications
    console.log("[Socket.IO] Delegating to engine");
    engine.handleRequest(req, res);

  } catch (error) {
    console.error("[Socket.IO] Uncaught:", error);
    if (!res.headersSent) {
      try {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Error");
      } catch (e) {
        // Response already sent
      }
    }
  }
}
