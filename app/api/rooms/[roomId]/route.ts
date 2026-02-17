import { connectDB } from "@/lib/db/mongodb";
import { Room } from "@/lib/models/Room";
import { User } from "@/lib/models/User";
import { verifyToken, getTokenFromHeader } from "@/lib/utils/jwt";
import { NextRequest, NextResponse } from "next/server";
import { emitToUser } from "@/lib/socketServer";
import { getOrCreateSocketIO } from "@/lib/socketIOFactory";
import { pendingNotifications } from "@/lib/notificationStore";

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

    // IMPORTANT: Store notifications in memory IMMEDIATELY before any async operations
    // This ensures they're available for polling even if Socket.IO fails
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

    // Store notification for room creator
    if (!pendingNotifications.has(room.creatorId)) {
      pendingNotifications.set(room.creatorId, []);
    }
    pendingNotifications.get(room.creatorId)?.push({
      type: "user-joined-room",
      data: joinEvent,
      timestamp: Date.now(),
    });

    // Store notification for joining user
    if (!pendingNotifications.has(decoded.userId)) {
      pendingNotifications.set(decoded.userId, []);
    }
    pendingNotifications.get(decoded.userId)?.push({
      type: "user-joined-room",
      data: joinEvent,
      timestamp: Date.now(),
    });

    // Now emit Socket.IO events asynchronously (don't wait for them)
    // This prevents slow Socket.IO operations from delaying the API response
    setImmediate(() => {
      try {
        const httpServer = (request as any)?.socket?.server;
        if (httpServer) {
          getOrCreateSocketIO(httpServer);
        }
      } catch (err) {
        // Silently fail
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
        emitToUser(oppositeUser.userId, "user-invited", invitationData).catch(
          (err) => {
            // Log but don't throw
            console.debug("Socket emit failed:", err.message);
          },
        );
      } catch (socketError: any) {
        // Silently fail
      }

      // Emit join events
      try {
        emitToUser(room.creatorId, "user-joined-room", joinEvent).catch(
          (err) => {
            console.debug("Socket emit failed:", err.message);
          },
        );
      } catch (socketError: any) {
        // Silently fail
      }

      try {
        emitToUser(decoded.userId, "user-joined-room", joinEvent).catch(
          (err) => {
            console.debug("Socket emit failed:", err.message);
          },
        );
      } catch (socketError: any) {
        // Silently fail
      }
    });

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
