import type { NextApiRequest, NextApiResponse } from "next";
import { getOrCreateSocketIO } from "@/lib/socketIOFactory";
import { setGlobalIO, getGlobalIO } from "@/lib/getIO";

export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Socket.IO Handler - Vercel Serverless Compatible
 * 
 * Key insight: On Vercel, Socket.IO's engine.handleRequest might not work
 * as expected if the engine wasn't properly attached.
 * 
 * This handler initializes Socket.IO and then delegates to its engine,
 * with comprehensive error handling for the serverless environment.
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(`[Socket] ${req.method} ${req.url}`);
  
  try {
    const httpServer = (res.socket as any)?.server;

    // Initialize Socket.IO
    let io;
    if (httpServer) {
      io = getOrCreateSocketIO(httpServer);
      setGlobalIO(io);
      console.log("[Socket] Got Socket.IO from httpServer");
    } else {
      io = getGlobalIO();
      console.log("[Socket] Using cached Socket.IO");
    }

    if (!io) {
      console.error("[Socket] Socket.IO not initialized");
      if (!res.headersSent) {
        res.writeHead(503, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Not initialized" }));
      }
      return;
    }

    // Get engine
    // @ts-ignore
    const engine = io.engine;
    
    console.log("[Socket] Engine available:", !!engine);
    console.log("[Socket] handleRequest method:", typeof engine?.handleRequest);

    // Try to use engine.handleRequest if available
    if (engine && typeof engine.handleRequest === "function") {
      try {
        console.log("[Socket] Calling engine.handleRequest");
        engine.handleRequest(req, res);
        return;
      } catch (err) {
        console.error("[Socket] engine.handleRequest error:", err);
        // Fall through to fallback
      }
    }

    // Fallback: if engine.handleRequest doesn't exist or fails,
    // return 200 OK so the client knows we're ready
    // Socket.IO might handle it via other means
    console.log("[Socket] Using fallback response");
    if (!res.headersSent) {
      res.writeHead(200, { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST",
      });
      res.end(JSON.stringify({ ready: true }));
    }

  } catch (error) {
    console.error("[Socket] Uncaught error:", error);
    if (!res.headersSent) {
      try {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Server error" }));
      } catch (e) {
        console.error("[Socket] Failed to send error response:", e);
      }
    }
  }
}
