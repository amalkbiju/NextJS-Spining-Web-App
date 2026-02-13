import type { NextApiRequest, NextApiResponse } from "next";
import { getOrCreateSocketIO } from "@/lib/socketIOFactory";
import { setGlobalIO, getGlobalIO } from "@/lib/getIO";

export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Socket.IO Handler for Next.js on Vercel
 * 
 * The key insight: Socket.IO's engine.handleRequest expects to receive
 * the socket stream directly so it can write binary frames.
 * 
 * We must NOT call res.json() or res.status() before calling engine.handleRequest
 * because that will close the connection.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Don't process if response already sent
    if (res.writableEnded) {
      return;
    }

    const httpServer = (res.socket as any)?.server;

    // Initialize Socket.IO if server context exists
    let io;
    if (httpServer) {
      try {
        io = getOrCreateSocketIO(httpServer);
        setGlobalIO(io);
      } catch (e) {
        console.error("[Socket] Failed to create Socket.IO:", e);
        if (!res.headersSent) {
          res.status(500).end("Socket.IO init failed");
        }
        return;
      }
    } else {
      io = getGlobalIO();
    }

    if (!io) {
      console.error("[Socket] No Socket.IO instance available");
      if (!res.headersSent) {
        res.status(503).end("Socket.IO not available");
      }
      return;
    }

    // Get the engine
    // @ts-ignore - accessing private engine property
    const engine = io.engine;

    if (!engine || typeof engine.handleRequest !== "function") {
      console.error("[Socket] Engine not available or missing handleRequest");
      if (!res.headersSent) {
        res.status(500).end("Engine handler not available");
      }
      return;
    }

    // CRITICAL: Call engine.handleRequest WITHOUT sending any response first
    // This delegates ALL request handling to Socket.IO's engine
    // The engine will write directly to the socket
    try {
      console.log(`[Socket] Engine handling ${req.method} ${req.url}`);
      engine.handleRequest(req, res);
    } catch (err) {
      console.error("[Socket] Engine handler error:", err);
      if (!res.headersSent && !res.writableEnded) {
        res.status(500).end("Handler error");
      }
    }

  } catch (err) {
    console.error("[Socket] Uncaught handler error:", err);
    if (!res.headersSent && !res.writableEnded) {
      try {
        res.status(500).end("Critical error");
      } catch (e) {
        // Response already sent, nothing we can do
      }
    }
  }
}
