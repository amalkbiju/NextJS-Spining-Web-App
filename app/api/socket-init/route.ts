import { NextRequest, NextResponse } from "next/server";
import { Server } from "socket.io";
import { getGlobalIO, setGlobalIO } from "@/lib/getIO";

const userSockets: Map<string, string> = new Map();

// This will store the IO instance in memory
let ioInstance: any = null;

/**
 * Initialize Socket.IO server on demand
 * This endpoint can be called to ensure Socket.IO is initialized
 */
export async function GET(request: NextRequest) {
  try {
    console.log("📍 /api/socket-init handler called");

    // Check if already initialized globally
    let io = getGlobalIO();
    if (io) {
      console.log("✅ Socket.IO already initialized in globalThis");
      return NextResponse.json(
        {
          success: true,
          message: "Socket.IO already initialized",
          status: "ready",
        },
        { status: 200 },
      );
    }

    // Check if we have a cached instance
    if (ioInstance) {
      console.log(
        "✅ Socket.IO cached instance found, restoring to globalThis",
      );
      setGlobalIO(ioInstance);
      return NextResponse.json(
        {
          success: true,
          message: "Socket.IO restored from cache",
          status: "ready",
        },
        { status: 200 },
      );
    }

    console.log(
      "⚠️  Socket.IO not initialized - Note: In App Router, Socket.IO will be initialized when accessed via Pages API",
    );

    return NextResponse.json(
      {
        success: true,
        message:
          "Socket.IO endpoint ready - will initialize on websocket connection",
        status: "pending",
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("❌ Socket init error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
