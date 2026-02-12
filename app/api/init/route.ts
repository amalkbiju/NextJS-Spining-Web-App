import { NextResponse, NextRequest } from "next/server";
import { getGlobalIO } from "@/lib/getIO";

/**
 * This endpoint initializes and checks Socket.IO status
 */
export async function GET(request: NextRequest) {
  try {
    console.log("🚀 /api/init called");

    // First check if Socket.IO is already initialized
    let io = getGlobalIO();

    if (io) {
      console.log("✅ Socket.IO is ready");
      return NextResponse.json(
        {
          success: true,
          message: "Socket.IO initialized",
          socketIOReady: true,
          clientCount: (io as any).engine?.clientsCount || 0,
        },
        { status: 200 },
      );
    }

    // If not available, trigger initialization via /api/socket
    console.log(
      "🔄 Socket.IO not initialized yet, triggering initialization...",
    );

    try {
      const baseUrl = request.nextUrl.origin || "http://localhost:3000";
      const response = await fetch(`${baseUrl}/api/socket`, {
        method: "GET",
      }).catch((err) => {
        console.log("📡 Initialization request sent");
        return null;
      });

      // Wait for initialization
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Check again
      io = getGlobalIO();
      if (io) {
        console.log("✅ Socket.IO initialized after trigger");
        return NextResponse.json(
          {
            success: true,
            message: "Socket.IO initialized",
            socketIOReady: true,
          },
          { status: 200 },
        );
      }
    } catch (err) {
      console.error("⚠️  Error triggering socket init:", err);
    }

    console.warn("⚠️  Socket.IO not yet available");
    return NextResponse.json(
      {
        success: true,
        message: "Socket.IO will initialize on next connection",
        socketIOReady: false,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("❌ Init error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Initialization failed",
      },
      { status: 500 },
    );
  }
}
