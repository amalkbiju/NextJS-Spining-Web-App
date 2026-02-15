import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import { verifyToken, getTokenFromHeader } from "@/lib/utils/jwt";
import { pendingNotifications } from "@/lib/notificationStore";

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

    const userId = decoded.userId;
    const sinceParam = request.nextUrl.searchParams.get("since");
    const since = sinceParam ? parseInt(sinceParam) : 0;

    // Get notifications for this user since the given time
    const userNotifications = pendingNotifications.get(userId) || [];
    const newNotifications = userNotifications.filter(
      (n) => n.timestamp > since,
    );

    // Remove delivered notifications
    if (newNotifications.length > 0) {
      const remainingNotifications = userNotifications.filter(
        (n) => n.timestamp <= since,
      );
      if (remainingNotifications.length > 0) {
        pendingNotifications.set(userId, remainingNotifications);
      } else {
        pendingNotifications.delete(userId);
      }
    }

    return NextResponse.json(
      {
        success: true,
        notifications: newNotifications.map((n) => ({
          type: n.type,
          data: n.data,
        })),
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Notifications endpoint error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
