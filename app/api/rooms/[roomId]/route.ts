import { connectDB } from "@/lib/db/mongodb";
import { Room } from "@/lib/models/Room";
import { User } from "@/lib/models/User";
import { verifyToken, getTokenFromHeader } from "@/lib/utils/jwt";
import { NextRequest, NextResponse } from "next/server";
import { emitToUser } from "@/lib/socketServer";

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

    // Emit socket event to the invited user
    try {
      await emitToUser(oppositeUser.userId, "user-invited", {
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
      });
      console.log(`✓ Invitation emitted to user ${oppositeUser.userId}`);
    } catch (socketError: any) {
      console.error("Failed to emit socket event:", socketError.message);
      // Don't fail the API response if socket emission fails
    }

    // Also emit a join event to notify the room creator
    try {
      await emitToUser(room.creatorId, "user-joined-room", {
        roomId,
        joinedUser: {
          userId: decoded.userId,
          email: decoded.email,
        },
        room,
        timestamp: Date.now(),
      });
      console.log(
        `✓ User joined room event emitted to creator ${room.creatorId}`,
      );
    } catch (socketError: any) {
      console.error("Failed to emit user-joined event:", socketError.message);
      // Don't fail the API response if socket emission fails
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
