import { NextRequest, NextResponse } from "next/server";
import { attachSocketIOToServer } from "@/lib/socketMiddleware";
import { getGlobalIO } from "@/lib/getIO";

/**
 * Socket.IO initialization endpoint
 *
 * This endpoint checks if Socket.IO is initialized and provides
 * guidance on how to properly set up Socket.IO.
 *
 * For Next.js App Router:
 * - LOCAL: Use custom server.js (node server.js instead of next dev)
 * - VERCEL: Use external Socket.IO server with NEXT_PUBLIC_SOCKET_URL
 */
export async function GET(request: NextRequest) {
  try {
    console.log("📡 /api/socket handler - Socket.IO status check");

    // Try to get existing Socket.IO instance
    let io = getGlobalIO();

    if (io) {
      console.log("✅ Socket.IO already initialized globally");
      return NextResponse.json(
        {
          success: true,
          message: "Socket.IO ready",
          initialized: true,
        },
        { status: 200 },
      );
    }

    // Socket.IO not initialized
    const devMode = process.env.NODE_ENV !== "production";
    const vercelEnv = process.env.VERCEL === "1";

    let guidance = "";
    if (vercelEnv) {
      guidance =
        "Using Vercel: Set NEXT_PUBLIC_SOCKET_URL to your external Socket.IO server (Railway.app, Render, etc)";
    } else if (devMode) {
      guidance = `Local Development: Run 'node server.js' instead of 'next dev' to use custom Socket.IO server`;
    } else {
      guidance =
        "Socket.IO requires an external server. Set NEXT_PUBLIC_SOCKET_URL";
    }

    console.log(`ℹ️  Socket.IO Setup: ${guidance}`);

    return NextResponse.json(
      {
        success: true,
        message: "Socket.IO endpoint active",
        initialized: false,
        setupGuide: {
          environment: process.env.NODE_ENV,
          isVercel: vercelEnv,
          guidance,
          options: [
            "Option 1: Use custom server.js locally (node server.js)",
            "Option 2: Use external Socket.IO server on Vercel",
            "Option 3: Disable Socket.IO features and use polling instead",
          ],
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("❌ Socket.IO endpoint error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    console.log(`📡 Socket.IO POST handler - userId: ${userId}`);

    const io = getGlobalIO();
    if (!io) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Socket.IO not initialized - Check /api/socket for setup instructions",
          initialized: false,
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { success: true, message: "Socket.IO ready", initialized: true },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("❌ Socket.IO POST error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
