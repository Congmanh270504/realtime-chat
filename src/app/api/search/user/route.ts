import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email parameter is required" },
        { status: 400 }
      );
    }

    // Search for user by email in Redis
    const userId = await redis.get(`user:email:${email}`);

    if (!userId) {
      return NextResponse.json({ user: null, found: false }, { status: 200 });
    }

    // Get user details if found
    const userDetails = await redis.hgetall(`user:${userId}`);

    if (!userDetails || Object.keys(userDetails).length === 0) {
      return NextResponse.json({ user: null, found: false }, { status: 200 });
    }

    return NextResponse.json({
      user: {
        id: userId,
        email: userDetails.email || "",
        name: userDetails.name || "",
        image: userDetails.image || "",
      },
      found: true,
    });
  } catch (error) {
    console.error("Error searching user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
