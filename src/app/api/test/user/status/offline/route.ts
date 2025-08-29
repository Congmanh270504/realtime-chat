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
      return new Response("Friend ID is required", { status: 400 });
    }

    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    await redis.set(`user:${friendId}:status`, "offline");

    pusherServer.trigger(
      toPusherKey(`user:${userId}:friend_online_list`),
      "friend_online_list",
      {
        [friendId]: {
          status: "offline",
          lastSeen: Date.now(),
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
