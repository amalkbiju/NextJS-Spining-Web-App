import { connectDB } from "@/lib/db/mongodb";
import { User } from "@/lib/models/User";
import { generateToken } from "@/lib/utils/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { email, password, name } = await request.json();

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "User already exists" },
        { status: 409 },
      );
    }

    // Create user
    const newUser = new User({ email, password, name });
    await newUser.save();

    const token = generateToken(newUser.userId, newUser.email);

    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully",
        token,
        user: {
          _id: newUser._id,
          email: newUser.email,
          name: newUser.name,
          userId: newUser.userId,
        },
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Register error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
