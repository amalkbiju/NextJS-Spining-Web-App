import { NextRequest, NextResponse } from "next/server";
import { getGlobalIO } from "@/lib/getIO";

export async function GET(request: NextRequest) {
  const io = getGlobalIO();

  if (io) {
    return NextResponse.json(
      {
        success: true,
        message: "Socket.IO is initialized",
        status: "ready",
      },
      { status: 200 },
    );
  }

  return NextResponse.json(
    {
      success: false,
      message: "Socket.IO is not initialized yet",
      status: "not-ready",
    },
    { status: 503 },
  );
}
