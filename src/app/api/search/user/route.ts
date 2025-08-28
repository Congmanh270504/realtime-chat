import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { UserData } from "@/types/user";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: NextRequest) {
  try {
    // Get current user
    const { userId: currentUserId } = await auth();

    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    console.log("email", email);

    if (!email) {
      return NextResponse.json(
        { error: "Email parameter is required" },
        { status: 400 }
      );
    }

    // Search for user by email in Redis
    const userId = await redis.get(`user:email:${email}`);
    console.log("userId", userId);

    if (!userId || typeof userId !== "string") {
      return NextResponse.json({ user: null, found: false }, { status: 200 });
    }

    // Check if this is the current user
    if (userId === currentUserId) {
      return NextResponse.json(
        {
          user: null,
          found: false,
          reason: "Cannot add yourself",
        },
        { status: 200 }
      );
    }

    // Check if already friends
    const isFriend = await redis.sismember(
      `user:${currentUserId}:friends`,
      userId
    );
    if (isFriend) {
      return NextResponse.json(
        {
          user: null,
          found: false,
          reason: "Already friends",
        },
        { status: 200 }
      );
    }

    // Get user details if found
    const userData = (await redis.get(`user:${userId}`)) as UserData | null;
    console.log("userData", userData);

    if (!userData) {
      return NextResponse.json({ user: null, found: false }, { status: 200 });
    }

    // Data is already an object, no need to parse
    return NextResponse.json(
      {
        user: {
          id: userData.id,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          imageUrl: userData.imageUrl,
          username: userData.username,
          createdAt: userData.createdAt,
        } as UserData,
        found: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error searching user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
