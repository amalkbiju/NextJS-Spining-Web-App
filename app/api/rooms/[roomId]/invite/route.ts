import { connectDB } from "@/lib/db/mongodb";
import { Room } from "@/lib/models/Room";
import { User } from "@/lib/models/User";
import { verifyToken, getTokenFromHeader } from "@/lib/utils/jwt";
import { sendInvitationEmail } from "@/lib/utils/email";
import { NextRequest, NextResponse } from "next/server";
import { emitToUser } from "@/lib/socketServer";
import { getOrCreateSocketIO } from "@/lib/socketIOFactory";
import { pendingNotifications } from "@/lib/notificationStore";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> },
) {
  try {
    await connectDB();

    const { roomId } = await params;
    const { email } = await request.json();

    // Validate email
    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, message: "Valid email is required" },
        { status: 400 },
      );
    }

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

    // Check if user is the room creator
    if (room.creatorId !== decoded.userId) {
      return NextResponse.json(
        { success: false, message: "Only room creator can invite users" },
        { status: 403 },
      );
    }

    // Check if user with this email exists
    const invitedUser = await User.findOne({ email: email.toLowerCase() });
    if (!invitedUser) {
      return NextResponse.json(
        { success: false, message: "User with this email not found" },
        { status: 404 },
      );
    }

    // Update room with invited email
    const updatedRoom = await Room.findOneAndUpdate(
      { roomId },
      {
        invitedEmail: email.toLowerCase(),
        oppositeUserId: invitedUser.userId,
        oppositeUserEmail: email.toLowerCase(),
        oppositeUserName: invitedUser.name,
        status: "waiting",
      },
      { new: true },
    );

    // Send email invitation
    await sendInvitationEmail(email.toLowerCase(), room.creatorName, roomId);

    // Store invitation notification immediately for fast polling
    if (!pendingNotifications.has(invitedUser.userId)) {
      pendingNotifications.set(invitedUser.userId, []);
    }
    pendingNotifications.get(invitedUser.userId)?.push({
      type: "user-invited",
      data: {
        roomId,
        invitedUser: {
          userId: invitedUser.userId,
          name: invitedUser.name,
          email: invitedUser.email,
        },
        creator: {
          userId: decoded.userId,
          name: room.creatorName,
          email: room.creatorEmail,
        },
      },
      timestamp: Date.now(),
    });

    // Emit Socket.IO events asynchronously (don't wait)
    setImmediate(() => {
      // Ensure Socket.IO is initialized
      try {
        const httpServer = (request as any)?.socket?.server;
        if (httpServer) {
          getOrCreateSocketIO(httpServer);
        }
      } catch (err) {
        // Silently fail
      }

      // Emit socket event to notify the invited user in real-time
      try {
        emitToUser(invitedUser.userId, "user-invited", {
          roomId,
          invitedUser: {
            userId: invitedUser.userId,
            name: invitedUser.name,
            email: invitedUser.email,
          },
          creator: {
            userId: decoded.userId,
            name: room.creatorName,
            email: room.creatorEmail,
          },
        }).catch((err) => {
          console.debug("Socket emit failed:", err.message);
        });
      } catch (socketError: any) {
        // Silently fail
      }
    });

    return NextResponse.json(
      {
        success: true,
        message: "Invitation sent successfully",
        room: updatedRoom,
        invitedUser: {
          userId: invitedUser.userId,
          name: invitedUser.name,
          email: invitedUser.email,
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Invite user error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
