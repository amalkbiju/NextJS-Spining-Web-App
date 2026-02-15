import { connectDB } from "@/lib/db/mongodb";
import { Room } from "@/lib/models/Room";
import { verifyToken, getTokenFromHeader } from "@/lib/utils/jwt";
import { NextRequest, NextResponse } from "next/server";
import { emitToUser } from "@/lib/socketServer";
import { getOrCreateSocketIO } from "@/lib/socketIOFactory";

export async function POST(
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

    // Check if room exists
    const room = await Room.findOne({ roomId });
    if (!room) {
      return NextResponse.json(
        { success: false, message: "Room not found" },
        { status: 404 },
      );
    }

    // Get user info from decoded token
    const { email, userId } = decoded;

    // Check if this user is the invited opposite user
    // The room should have oppositeUserId set from the invitation
    if (room.oppositeUserId !== userId) {
      console.log(
        `❌ Accept invite: User ${userId} is not the invited user for room ${roomId}`,
      );
      return NextResponse.json(
        { success: false, message: "This invitation is not for you" },
        { status: 403 },
      );
    }

    // Also verify the email matches (extra safety check)
    if (room.oppositeUserEmail !== email) {
      console.log(
        `❌ Accept invite: Email mismatch. Expected ${room.oppositeUserEmail}, got ${email}`,
      );
      return NextResponse.json(
        { success: false, message: "Email mismatch" },
        { status: 403 },
      );
    }

    // Accept the invitation - update room status to "ready" if not already
    // Both users have agreed, so we mark the status as accepted
    const updatedRoom = await Room.findOneAndUpdate(
      { roomId },
      {
        status: "ready",
        invitedEmail: null, // Clear the invitedEmail field
      },
      { new: true },
    );

    // Ensure Socket.IO is initialized before emitting events
    try {
      const httpServer = (request as any)?.socket?.server;
      if (httpServer) {
        getOrCreateSocketIO(httpServer);
      }
    } catch (err) {
      // Silently fail if Socket.IO cannot be initialized
    }

    // Emit socket event to notify both the room creator AND the accepting user
    const joinEvent = {
      roomId,
      joinedUser: {
        userId: userId,
        email: email,
      },
      room: updatedRoom,
      timestamp: Date.now(),
    };

    try {
      // Notify room creator that user accepted and joined
      await emitToUser(updatedRoom.creatorId, "user-joined-room", joinEvent);
    } catch (socketError: any) {
      // Don't fail the API response if socket emission fails
    }

    try {
      // ALSO notify the accepting user that they successfully joined
      await emitToUser(userId, "user-joined-room", joinEvent);
    } catch (socketError: any) {
      // Don't fail the API response if socket emission fails
    }

    return NextResponse.json(
      {
        success: true,
        message: "Invitation accepted successfully",
        room: updatedRoom,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Accept invitation error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
