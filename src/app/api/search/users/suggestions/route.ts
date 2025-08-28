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
    const emailPattern = searchParams.get("pattern");
    const limit = parseInt(searchParams.get("limit") || "5");

    if (!emailPattern || emailPattern.length < 2) {
      return NextResponse.json({ users: [] }, { status: 200 });
    }

    // Get current user's friends list
    const friendsSet = await redis.smembers(`user:${currentUserId}:friends`);

    // Get all user email keys from Redis
    const emailKeys = await redis.keys("user:email:*");

    // Filter emails that match the pattern (case-insensitive)
    const matchingEmailKeys = emailKeys.filter((key) => {
      const email = key.replace("user:email:", "");
      return email.toLowerCase().includes(emailPattern.toLowerCase());
    });

    // Limit results
    const limitedKeys = matchingEmailKeys.slice(0, limit * 2); // Get more to filter out friends

    // Get user IDs and then user data
    const users: UserData[] = [];

    for (const emailKey of limitedKeys) {
      try {
        const userId = await redis.get(emailKey);
        if (userId && typeof userId === "string") {
          // Skip current user and friends
          if (userId === currentUserId || friendsSet.includes(userId)) {
            continue;
          }

          const userData = (await redis.get(
            `user:${userId}`
          )) as UserData | null;
          if (userData && users.length < limit) {
            users.push(userData);
          }
        }
      } catch (error) {
        console.error(`Error fetching user for key ${emailKey}:`, error);
      }
    }

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error("Error searching user suggestions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
