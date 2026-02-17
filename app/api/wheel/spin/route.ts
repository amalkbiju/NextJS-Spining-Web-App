import { connectDB } from "@/lib/db/mongodb";
import { Room } from "@/lib/models/Room";
import { verifyToken, getTokenFromHeader } from "@/lib/utils/jwt";
import { NextRequest, NextResponse } from "next/server";
import { broadcastToRoom, emitToUser } from "@/lib/socketServer";
import { pendingNotifications } from "@/lib/notificationStore";

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

    const { roomId, userId } = await request.json();

    if (!roomId || !userId) {
      return NextResponse.json(
        { success: false, message: "Room ID and User ID are required" },
        { status: 400 },
      );
    }

    const room = await Room.findOne({ roomId });

    if (!room) {
      return NextResponse.json(
        { success: false, message: "Room not found" },
        { status: 404 },
      );
    }

    // Determine which user is clicking
    const isCreator = userId === room.creatorId;
    const isOpposite = userId === room.oppositeUserId;

    if (!isCreator && !isOpposite) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }

    // Update start status - allow both users to mark themselves as ready
    if (isCreator) {
      room.creatorStarted = true;
    } else if (isOpposite) {
      room.oppositeUserStarted = true;
    }

    let bothStarted = false;
    let selectedWinner = null;
    let selectedWinnerName = null;
    let finalRotation = 0;
    const spinStartTime = Date.now() + 500; // Both clients will start spinning 500ms from now

    // If both users have started, determine winner RANDOMLY and immediately
    if (room.creatorStarted && room.oppositeUserStarted) {
      // Randomly select a winner (50/50 chance)
      const isCreatorWinner = Math.random() > 0.5;
      selectedWinner = isCreatorWinner ? room.creatorId : room.oppositeUserId;
      selectedWinnerName = isCreatorWinner
        ? room.creatorName
        : room.oppositeUserName;

      room.winner = selectedWinner;
      room.status = "completed";
      bothStarted = true;

      // Calculate a specific final rotation that both clients will use
      // This ensures both players see the wheel stop at the SAME angle
      const spins = 5;
      if (isCreatorWinner) {
        // Rotate to Player 1 area (0-180 degrees)
        finalRotation = spins * 360 + Math.random() * 180;
      } else {
        // Rotate to Player 2 area (180-360 degrees)
        finalRotation = spins * 360 + 180 + Math.random() * 180;
      }

      // Emit to both players with synchronized start time
      const eventData = {
        roomId,
        winner: selectedWinner,
        winnerName: selectedWinnerName,
        finalRotation: finalRotation % 360, // Send normalized rotation (0-360)
        spinStartTime: spinStartTime, // Synchronized start time for both clients
        timestamp: Date.now(),
      };

      // Store in memory IMMEDIATELY for polling fallback
      if (!pendingNotifications.has(room.creatorId)) {
        pendingNotifications.set(room.creatorId, []);
      }
      pendingNotifications.get(room.creatorId)?.push({
        type: "spin-both-ready",
        data: eventData,
        timestamp: Date.now(),
      });

      if (!pendingNotifications.has(room.oppositeUserId)) {
        pendingNotifications.set(room.oppositeUserId, []);
      }
      pendingNotifications.get(room.oppositeUserId)?.push({
        type: "spin-both-ready",
        data: eventData,
        timestamp: Date.now(),
      });

      // Emit with setImmediate so it doesn't block API response
      setImmediate(() => {
        emitToUser(room.creatorId, "spin-both-ready", eventData);
        emitToUser(room.oppositeUserId, "spin-both-ready", eventData);
      });

      console.log(
        `📤 Sent spin-both-ready to both players: ${room.creatorId} & ${room.oppositeUserId}, Final rotation: ${(finalRotation % 360).toFixed(1)}°, Winner: ${selectedWinnerName}`,
      );
    } else {
      room.status = "spinning";

      // Notify the other player that one player is ready with sync time
      const otherUserId = isCreator ? room.oppositeUserId : room.creatorId;
      const readyUserName = isCreator
        ? room.creatorName
        : room.oppositeUserName;

      const readyEventData = {
        roomId,
        readyUserId: userId,
        readyUserName: readyUserName,
        room,
        spinStartTime: spinStartTime, // Send sync time to opposite user
      };

      // Store in memory IMMEDIATELY for polling fallback
      if (!pendingNotifications.has(otherUserId)) {
        pendingNotifications.set(otherUserId, []);
      }
      pendingNotifications.get(otherUserId)?.push({
        type: "user-spin-ready",
        data: readyEventData,
        timestamp: Date.now(),
      });

      // Emit with setImmediate so it doesn't block API response
      setImmediate(() => {
        emitToUser(otherUserId, "user-spin-ready", readyEventData);
      });

      console.log(
        `📤 Sent user-spin-ready to ${otherUserId} - ${readyUserName} is ready to spin`,
      );
    }

    await room.save();

    return NextResponse.json(
      {
        success: true,
        message: "Spin registered",
        room,
        bothStarted,
        winner: selectedWinner,
        winnerName: selectedWinnerName,
        finalRotation: bothStarted ? finalRotation : undefined,
        spinStartTime: bothStarted ? spinStartTime : undefined,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Spin error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
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

    const { roomId } = await request.json();

    if (!roomId) {
      return NextResponse.json(
        { success: false, message: "Room ID is required" },
        { status: 400 },
      );
    }

    const room = await Room.findOne({ roomId });

    if (!room) {
      return NextResponse.json(
        { success: false, message: "Room not found" },
        { status: 404 },
      );
    }

    // Reset game state
    room.creatorStarted = false;
    room.oppositeUserStarted = false;
    room.winner = null;
    room.status = "waiting";

    await room.save();

    // Send reset event to both players
    const resetData = {
      roomId,
      room,
    };

    // Store in memory IMMEDIATELY for polling fallback
    if (!pendingNotifications.has(room.creatorId)) {
      pendingNotifications.set(room.creatorId, []);
    }
    pendingNotifications.get(room.creatorId)?.push({
      type: "game-reset",
      data: resetData,
      timestamp: Date.now(),
    });

    if (!pendingNotifications.has(room.oppositeUserId)) {
      pendingNotifications.set(room.oppositeUserId, []);
    }
    pendingNotifications.get(room.oppositeUserId)?.push({
      type: "game-reset",
      data: resetData,
      timestamp: Date.now(),
    });

    // Emit with setImmediate so it doesn't block API response
    setImmediate(() => {
      emitToUser(room.creatorId, "game-reset", resetData).catch(() => {});
      emitToUser(room.oppositeUserId, "game-reset", resetData).catch(() => {});
    });

    console.log(
      `📤 Sent game-reset to both players: ${room.creatorId} & ${room.oppositeUserId}`,
    );

    return NextResponse.json(
      {
        success: true,
        message: "Game reset",
        room,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Reset error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
