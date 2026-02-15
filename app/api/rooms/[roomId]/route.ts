import { connectDB } from "@/lib/db/mongodb";
import { Room } from "@/lib/models/Room";
import { User } from "@/lib/models/User";
import { verifyToken, getTokenFromHeader } from "@/lib/utils/jwt";
import { NextRequest, NextResponse } from "next/server";
import { emitToUser } from "@/lib/socketServer";
import { getOrCreateSocketIO } from "@/lib/socketIOFactory";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> },
) {
  try {
    await connectDB();

    const { roomId } = await params;

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

    const room = await Room.findOne({ roomId });
    if (!room) {
      return NextResponse.json(
        { success: false, message: "Room not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        room,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Get room error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> },
) {
  try {
    await connectDB();

    const { roomId } = await params;

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

    const { oppositeUserId } = await request.json();
    if (!oppositeUserId) {
      return NextResponse.json(
        { success: false, message: "Opposite user ID is required" },
        { status: 400 },
      );
    }

    // Find the opposite user
    const oppositeUser = await User.findOne({ userId: oppositeUserId });
    if (!oppositeUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    // Get current user info (the one inviting)
    const currentUser = await User.findOne({ userId: decoded.userId });

    // Update room
    const room = await Room.findOneAndUpdate(
      { roomId },
      {
        oppositeUserId: oppositeUser.userId,
        oppositeUserName: oppositeUser.name,
        oppositeUserEmail: oppositeUser.email,
        status: "ready",
      },
      { new: true },
    );

    if (!room) {
      return NextResponse.json(
        { success: false, message: "Room not found" },
        { status: 404 },
      );
    }

    // Ensure Socket.IO is initialized before emitting events
    try {
      const httpServer = (request as any)?.socket?.server;
      if (httpServer) {
        getOrCreateSocketIO(httpServer);
      }
    } catch (err) {
      // Silently fail if Socket.IO cannot be initialized
    }

    // Emit socket event to the invited user
    try {
      const invitationData = {
        roomId,
        invitedUser: {
          userId: oppositeUser.userId,
          name: oppositeUser.name,
          email: oppositeUser.email,
        },
        creator: {
          userId: currentUser?.userId,
          name: currentUser?.name,
          email: currentUser?.email,
        },
      };
      const emitResult = await emitToUser(
        oppositeUser.userId,
        "user-invited",
        invitationData,
      );
    } catch (socketError: any) {
      console.error("Failed to emit socket event:", socketError.message);
      // Don't fail the API response if socket emission fails
    }

    // Emit a join event to notify both the room creator AND the joining user
    const joinEvent = {
      roomId,
      joinedUser: {
        userId: decoded.userId,
        name: currentUser?.name,
        email: decoded.email,
      },
      room,
      timestamp: Date.now(),
    };

    try {
      // Notify room creator that someone joined
      await emitToUser(room.creatorId, "user-joined-room", joinEvent);
    } catch (socketError: any) {
      // Emit failed - this is expected if Socket.IO is not configured
    }

    try {
      // ALSO notify the joining user that they successfully joined
      await emitToUser(decoded.userId, "user-joined-room", joinEvent);
    } catch (socketError: any) {
      // Emit failed - this is expected if Socket.IO is not configured
    }

    return NextResponse.json(
      {
        success: true,
        message: "Room updated successfully",
        room,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Update room error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
