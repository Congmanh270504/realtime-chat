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

    const now = Date.now();

    // Set status to offline
    await redis.set(`user:${userId}:status`, "offline");

    // Update heartbeat với timestamp cuối cùng (để lưu "last seen")
    await redis.set(`user:${userId}:heartbeat`, now.toString());

    const friendsList = await redis.smembers(`user:${userId}:friends`);

    // Trigger pusher cho tất cả friends
    const pushPromises = friendsList.map((friendId) => {
      return pusherServer.trigger(
        toPusherKey(`user:${friendId}:friend_online_list`),
        "friend_online_list",
        {
          [userId]: {
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
