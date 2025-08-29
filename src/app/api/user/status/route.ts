import { redis } from "@/lib/redis";
import { NextRequest } from "next/server";

// Get user status
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get("userId");

    if (!targetUserId) {
      return new Response("User ID required", { status: 400 });
    }

    const status = await redis.get(`user:${targetUserId}:status`);
    const heartbeat = await redis.get(`user:${targetUserId}:heartbeat`);

    // Check if heartbeat has expired (older than 30 minutes)
    if (heartbeat) {
      const lastSeen = parseInt(heartbeat as string);
      const now = Date.now();
      const thirtyMinutesInMs = 30 * 60 * 1000;

      if (now - lastSeen > thirtyMinutesInMs) {
        // Update status to offline if heartbeat expired
        await redis.set(`user:${targetUserId}:status`, "offline");
        return Response.json({ status: "offline", lastSeen });
      }
    }

    return Response.json({
      status: status || "offline",
      lastSeen: heartbeat ? parseInt(heartbeat as string) : null,
    });
  } catch (error) {
    console.error("Error getting user status:", error);
    return new Response("Error getting status", { status: 500 });
  }
}
