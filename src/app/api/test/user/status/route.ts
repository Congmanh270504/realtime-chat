import { pusherServer } from "@/lib/pusher";
import { redis } from "@/lib/redis";
import { toPusherKey } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { friendId } = body;
    const { userId } = await auth();

    if (!friendId) {
      return new Response("friendId is required", { status: 400 });
    }

    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const now = Date.now();

    // Set user status to online
    await redis.set(`user:${friendId}:status`, "online");

    // Set heartbeat with 1 hour expiry
    await redis.setex(`user:${friendId}:heartbeat`, 3600, now.toString());

    pusherServer.trigger(
      toPusherKey(`user:${userId}:friend_online_list`),
      "friend_online_list",
      {
        [friendId]: {
          status: "online",
          lastSeen: now,
        },
      }
    );
    // Handle the request
    return new Response(`User status updated for ${friendId}`, { status: 200 });
  } catch (error) {
    console.error("Error parsing request body:", error);
    return new Response("Invalid JSON body", { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return new Response("User ID is required", { status: 400 });
    }

    await redis.del(`user:${userId}:status`, `user:${userId}:heartbeat`);

    // Handle the request
    return new Response(`User status updated for ${userId}`, { status: 200 });
  } catch (error) {
    console.error("Error parsing request body:", error);
    return new Response("Invalid JSON body", { status: 400 });
  }
}
