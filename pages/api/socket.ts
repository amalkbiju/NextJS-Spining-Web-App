import type { NextApiRequest, NextApiResponse } from "next";
import { getOrCreateSocketIO } from "@/lib/socketIOFactory";
import { setGlobalIO } from "@/lib/getIO";

export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Socket.IO Handler for Next.js Pages API
 *
 * This handler initializes Socket.IO and then immediately returns.
 * Socket.IO's HTTP listener on the server is responsible for handling
 * the actual protocol requests.
 *
 * When using custom server (server.js):
 * - Socket.IO is initialized before requests arrive
 * - This handler just ensures Socket.IO is ready
 *
 * When using next start:
 * - This handler initializes Socket.IO on first request
 * - Subsequent requests are handled by Socket.IO's server listener
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(`[Socket] ${req.method} ${req.url}`);

  try {
    const httpServer = (res.socket as any)?.server;

    if (httpServer) {
      try {
        const io = getOrCreateSocketIO(httpServer);
        setGlobalIO(io);
        console.log("[Socket] Socket.IO initialized");
      } catch (err) {
        console.error("[Socket] Failed to initialize Socket.IO:", err);
      }
    }

    // CRITICAL: Just return without sending a response
    // Socket.IO's server listener handles the actual protocol communication
    // Sending a response here would conflict with Socket.IO's protocol handling
    console.log("[Socket] Handler returning - Socket.IO server listener will handle this");
    return;
  } catch (error) {
    console.error("[Socket] Error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal error" });
    }
  }
}

