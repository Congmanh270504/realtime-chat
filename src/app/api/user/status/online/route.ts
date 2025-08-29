import { pusherServer } from "@/lib/pusher";
import { redis } from "@/lib/redis";
import { toPusherKey } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

// Set user online and update heartbeat
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { currentUserId } = body;

    if (!currentUserId) {
      return new Response("currentUserId is required", { status: 400 });
    }
    const { userId } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const now = Date.now();

    // Set user status to online
    await redis.set(`user:${currentUserId}:status`, "online");

    // Set heartbeat with 1 hour expiry
    await redis.setex(`user:${currentUserId}:heartbeat`, 3600, now.toString());

    const friendsList = await redis.smembers(`user:${currentUserId}:friends`);

    // Trigger pusher cho tất cả friends
    const pushPromises = friendsList.map((friendId) => {
      return pusherServer.trigger(
        toPusherKey(`user:${friendId}:friend_online_list`),
        "friend_online_list",
        {
          [currentUserId]: {
            status: "online",
            lastSeen: now,
          },
        }
      );
    });

    await Promise.all(pushPromises);

    return new Response("Status updated", { status: 200 });
  } catch (error) {
    console.error("Error updating user status:", error);
    return new Response("Error updating status", { status: 500 });
  }
}
