import { pusherServer } from "@/lib/pusher";
import { redis } from "@/lib/redis";
import { toPusherKey } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    let currentUserId = userId; // Default to auth userId

    // Try to parse JSON body, but don't fail if it's empty
    try {
      const body = await req.json();
      if (body.currentUserId) {
        currentUserId = body.currentUserId;
      }
    } catch (jsonError) {
      // JSON parsing failed, use auth userId as fallback
      console.log("No JSON body or invalid JSON, using auth userId:", userId);
    }

    // Kiểm tra authorization: user chỉ có thể set offline cho chính mình
    if (currentUserId !== userId) {
      return new Response("Can only set offline status for yourself", {
        status: 403,
      });
    }

    const now = Date.now();

    // Set status to offline
    await redis.set(`user:${currentUserId}:status`, "offline");

    // Update heartbeat với timestamp cuối cùng (để lưu "last seen")
    await redis.set(`user:${currentUserId}:heartbeat`, now.toString());

    const friendsList = await redis.smembers(`user:${currentUserId}:friends`);

    // Trigger pusher cho tất cả friends
    const pushPromises = friendsList.map((friendId) => {
      return pusherServer.trigger(
        toPusherKey(`user:${friendId}:friend_online_list`),
        "friend_online_list",
        {
          [currentUserId]: {
            status: "offline",
            lastSeen: now,
          },
        }
      );
    });
    await Promise.all(pushPromises);

    return new Response(`User status updated to offline`, { status: 200 });
  } catch (error) {
    console.error("Error setting user offline:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
