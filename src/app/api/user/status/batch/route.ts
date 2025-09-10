import { pusherServer } from "@/lib/pusher";
import { redis } from "@/lib/redis";
import { toPusherKey } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

interface UserStatus {
  status: string;
  lastSeen: number | null;
}

interface FriendsOnlineStatus {
  [userId: string]: UserStatus;
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { userIds } = await req.json();

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return new Response("User IDs array required", { status: 400 });
    }
    
    // kiểu dữ liệu <K,V>
    // {
    //   "user_123": {
    //     status: "online",
    //     lastSeen: 1693123456789
    //   },
    //   "user_456": {
    //     status: "offline",
    //     lastSeen: null
    //   },
    //   "user_789": {
    //     status: "online",
    //     lastSeen: 1693123456000
    //   }
    // }
    const statuses: FriendsOnlineStatus = {};

    const hourInMs = 60 * 60 * 1000;
    const now = Date.now();

    // Get status and heartbeat for all users in parallel
    const pipeline = redis.pipeline();

    userIds.forEach((id) => {
      pipeline.get(`user:${id}:status`);
      pipeline.get(`user:${id}:heartbeat`);
    });

    const results = (await pipeline.exec()) as (string | number | null)[];

    // Process results
    for (let i = 0; i < userIds.length; i++) {
      const userId = userIds[i];
      const statusIndex = i * 2;
      const heartbeatIndex = i * 2 + 1;

      const statusValue = results?.[statusIndex] as string;
      const status = statusValue === "online" ? "online" : "offline";

      const heartbeat = results?.[heartbeatIndex] as string | number;

      let finalStatus = status;
      let lastSeen: number | null = null;

      if (heartbeat) {
        lastSeen =
          typeof heartbeat === "number"
            ? heartbeat
            : parseInt(heartbeat.toString());

        // Check if heartbeat has expired
        if (now - lastSeen > hourInMs) {
          finalStatus = "offline";
          // Update status in Redis (fire and forget)
          redis.set(`user:${userId}:status`, "offline").catch(console.error);
        }
      }

      statuses[userId] = {
        status: finalStatus,
        lastSeen,
      };
    }

    await pusherServer.trigger(
      toPusherKey(`user:${userId}:friend_online_list`),
      "friend_online_list",
      statuses
    );

    return Response.json({ statuses });
  } catch (error) {
    console.error("Error getting batch user status:", error);
    return new Response("Error getting status", { status: 500 });
  }
}
