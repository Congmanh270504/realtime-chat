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

    // Get all user email keys from Redis
    const emailKeys = await redis.keys("user:email:*");

    // Filter emails that match the pattern (case-insensitive)
    const matchingEmailKeys = emailKeys.filter((key) => {
      const email = key.replace("user:email:", "");
      return email.toLowerCase().includes(emailPattern.toLowerCase());
    });
    console.log("matchingEmailKeys", matchingEmailKeys);

    // Limit results
    const limitedKeys = matchingEmailKeys.slice(0, limit * 2); // Get more to filter out friends

    // Get user IDs and then user data
    const users: UserData[] = [];

    for (const emailKey of limitedKeys) {
      try {
        const user = (await redis.get(emailKey)) as UserData;
        console.log("userId", user);
        if (user.id && typeof user.id === "string") {
          // Skip current user and friends
          if (user.id === currentUserId) {
            continue;
          }
          if (user && users.length < limit) {
            users.push(user);
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
