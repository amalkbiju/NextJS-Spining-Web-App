import { NextRequest, NextResponse } from "next/server";
import { getGlobalIO } from "@/lib/getIO";

/**
 * Socket.IO API Route Handler (App Router)
 *
 * PRIMARY Socket.IO initialization and handling endpoint.
 * This is the main route that:
 * 1. Checks Socket.IO status
 * 2. Handles Socket.IO HTTP polling requests  
 * 3. Sets proper CORS headers
 * 4. Returns acknowledgments for protocol handshakes
 *
 * Socket.IO protocol flow:
 * - Client sends: GET /api/socket?transport=polling
 * - Server responds: 200 OK (Socket.IO middleware handles the actual protocol)
 * - Client upgrades to WebSocket if available
 * - Persistent connection established
 *
 * Note: Socket.IO actually initializes in /pages/api/_app.ts or via request interception.
 * This route just handles the protocol acknowledgments.
 */

export async function GET(request: NextRequest) {
  try {
    console.log(
      `[Socket GET] ${request.nextUrl.pathname}?${request.nextUrl.search}`,
    );

    // Get Socket.IO instance status
    const io = getGlobalIO();

    if (io) {
      console.log("[Socket GET] ✅ Socket.IO is initialized");
    } else {
      console.log("[Socket GET] ⚠️  Socket.IO not yet initialized");
    }

    // Set CORS and cache-control headers for Socket.IO polling
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Content-Type": "application/json",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Connection": "keep-alive",
      "Transfer-Encoding": "chunked",
    };

    // Return 200 OK - Socket.IO middleware will handle protocol work
    return new NextResponse(JSON.stringify({ ok: true }), {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("[Socket GET] Error:", error);
    return new NextResponse(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      }),
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log(`[Socket POST] ${request.nextUrl.pathname}`);

    // POST is used by Socket.IO for polling when no WebSocket
    const io = getGlobalIO();

    if (io) {
      console.log("[Socket POST] ✅ Socket.IO is initialized");
    } else {
      console.log("[Socket POST] ⚠️  Socket.IO not yet initialized");
    }

    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Content-Type": "application/json",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Connection": "keep-alive",
      "Transfer-Encoding": "chunked",
    };

    return new NextResponse(JSON.stringify({ ok: true }), {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("[Socket POST] Error:", error);
    return new NextResponse(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      }),
      { status: 500 },
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  console.log(`[Socket OPTIONS] ${request.nextUrl.pathname}`);

  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
