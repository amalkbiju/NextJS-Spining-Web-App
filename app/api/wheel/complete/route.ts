import { connectDB } from "@/lib/db/mongodb";
import { Room } from "@/lib/models/Room";
import { User } from "@/lib/models/User";
import { verifyToken, getTokenFromHeader } from "@/lib/utils/jwt";
import { NextRequest, NextResponse } from "next/server";

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

    if (!room.winner) {
      return NextResponse.json(
        { success: false, message: "No winner determined yet" },
        { status: 400 },
      );
    }

    const creatorEntryFee = room.entryPrice || 0;
    const oppositeEntryFee = room.oppositeUserEntryPrice || 0;
    const totalPrizePool = creatorEntryFee + oppositeEntryFee;

    // Update winner's credits
    const winner = await User.findOne({ userId: room.winner });
    if (winner) {
      winner.credits = (winner.credits || 0) + totalPrizePool;
      await winner.save();
    }

    // Deduct loser's entry fee from their credits (already done when creating room)
    // But we need to handle the case where they joined with different entry fee
    const loser = await User.findOne({
      userId:
        room.winner === room.creatorId ? room.oppositeUserId : room.creatorId,
    });

    if (loser) {
      // Loser's credits should already be deducted when they accepted the invitation
      // This is just to ensure consistency
      loser.credits = Math.max(0, loser.credits || 0);
      await loser.save();
    }

    // Mark room as completed
    room.status = "completed";
    await room.save();

    return NextResponse.json(
      {
        success: true,
        message: "Credits updated successfully",
        room,
        totalPrizePool,
        winnerCredits: winner?.credits || 0,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Complete game error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
