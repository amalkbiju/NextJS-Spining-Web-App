import { connectDB } from "@/lib/db/mongodb";
import { Room } from "@/lib/models/Room";
import { verifyToken, getTokenFromHeader } from "@/lib/utils/jwt";
import { NextRequest, NextResponse } from "next/server";
import { broadcastToAll } from "@/lib/socketServer";
import { getOrCreateSocketIO } from "@/lib/socketIOFactory";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const token = getTokenFromHeader(request.headers.get("authorization"));
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 },
      );
    }

    // Get all available rooms (waiting for opposite user)
    const rooms = await Room.find({ oppositeUserId: null, status: "waiting" });

    return NextResponse.json(
      {
        success: true,
        rooms,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Get rooms error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const token = getTokenFromHeader(request.headers.get("authorization"));
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 },
      );
    }

    const { creatorName, entryPrice } = await request.json();
    if (!creatorName) {
      return NextResponse.json(
        { success: false, message: "Creator name is required" },
        { status: 400 },
      );
    }

    const roomId = `ROOM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newRoom = new Room({
      roomId,
      creatorId: decoded.userId,
      creatorName,
      creatorEmail: decoded.email,
      status: "waiting",
      entryPrice: entryPrice || 100,
    });

    await newRoom.save();

    // Broadcast to all users that a new room is available asynchronously
    setImmediate(() => {
      try {
        broadcastToAll("room-created", {
          roomId: newRoom.roomId,
          creatorId: newRoom.creatorId,
          creatorName: newRoom.creatorName,
          creatorEmail: newRoom.creatorEmail,
          status: newRoom.status,
          timestamp: Date.now(),
        });
      } catch (socketError: any) {
        // Broadcast failed - this is expected if Socket.IO is not configured
        // The API response still succeeds
      }
    });

    return NextResponse.json(
      {
        success: true,
        message: "Room created successfully",
        room: newRoom,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Create room error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
