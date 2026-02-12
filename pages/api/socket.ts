import type { NextApiRequest, NextApiResponse } from "next";
import type { Socket as NetSocket } from "net";
import { getOrCreateSocketIO } from "@/lib/socketIOFactory";
import { setGlobalIO } from "@/lib/getIO";

interface SocketRequest extends NextApiRequest {
  socket: NetSocket & {
    server: any;
  };
}

interface SocketResponse extends NextApiResponse {
  socket: NetSocket & {
    server: any;
  };
}

export default function handler(req: SocketRequest, res: SocketResponse) {
  try {
    // Log incoming request details
    console.log("� [SOCKET HANDLER] Request received");
    console.log("   Method:", req.method);
    console.log("   URL:", req.url);
    console.log("   Query:", JSON.stringify(req.query));

    // CRITICAL: Get HTTP server
    const httpServer = res.socket?.server;
    if (!httpServer) {
      console.error("❌ [SOCKET HANDLER] No HTTP server available");
      return res.status(500).json({ 
        error: "Server initialization failed",
        code: "NO_HTTP_SERVER"
      });
    }

    console.log("✅ [SOCKET HANDLER] HTTP server found");

    // CRITICAL: Initialize Socket.IO
    try {
      const io = getOrCreateSocketIO(httpServer);
      console.log("✅ [SOCKET HANDLER] Socket.IO initialized");
      
      setGlobalIO(io);
      console.log("✅ [SOCKET HANDLER] Socket.IO set globally");
    } catch (ioError: any) {
      console.error("❌ [SOCKET HANDLER] Socket.IO initialization failed:", ioError.message);
      return res.status(500).json({ 
        error: "Socket.IO initialization failed",
        message: ioError.message,
        code: "IO_INIT_FAILED"
      });
    }

    // Check if this is a Socket.IO protocol request
    const isSocketIORequest = !!(req.query.transport || req.query.EIO);
    console.log("📊 [SOCKET HANDLER] Is Socket.IO request:", isSocketIORequest);

    if (isSocketIORequest) {
      // This is a Socket.IO polling/websocket request
      console.log("📡 [SOCKET HANDLER] Socket.IO protocol request detected - letting engine handle");
      // Return without sending response body
      return;
    }

    // Plain GET request - return 200 OK
    console.log("✅ [SOCKET HANDLER] Returning success response");
    return res.status(200).json({ 
      status: "ok",
      message: "Socket.IO server is running",
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error("❌ [SOCKET HANDLER] Unexpected error:", error);
    console.error("   Stack:", error.stack);
    
    // Return 500 for unexpected errors
    return res.status(500).json({ 
      error: "Internal server error",
      message: error.message,
      code: "HANDLER_ERROR"
    });
  }
}
