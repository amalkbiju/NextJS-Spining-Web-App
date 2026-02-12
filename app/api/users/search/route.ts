import { connectDB } from "@/lib/db/mongodb";
import { User } from "@/lib/models/User";
import { verifyToken, getTokenFromHeader } from "@/lib/utils/jwt";
import { NextRequest, NextResponse } from "next/server";

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

    const { userId } = Object.fromEntries(request.nextUrl.searchParams);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 },
      );
    }

    const user = await User.findOne({ userId });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          _id: user._id,
          email: user.email,
          name: user.name,
          userId: user.userId,
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Search user error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
